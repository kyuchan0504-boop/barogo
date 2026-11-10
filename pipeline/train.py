"""브라우저에서 돌릴 모델 학습·검증 + 웹페이지용 데이터 묶기 → build/data.json"""
import json, math
import numpy as np
import pandas as pd
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.metrics import confusion_matrix, accuracy_score
from gen_data import COMPOUNDS, CID, THR, MDL, LIM_IND, LIM_OTH, SITES, STATIONS, CLASSES, NOW

d = pd.read_pickle("build/raw.pkl")
wx, recs, mon = d["wx"], d["recs"], d["mon"]
site = {s["code"]: s for s in SITES}
CLS = list(CLASSES.keys())

# ------------------------------------------------------------------ 1. 냄새 지문 판별 모델
C = np.array([r["conc"] for r in recs])
y = np.array([CLS.index(site[r["site"]]["cls"]) for r in recs])
ts = pd.to_datetime([r["ts"] for r in recs])


def feats(Cm):
    x = np.log10(np.maximum(Cm, MDL / 2) / THR)  # log OAV (ND는 MDL/2)
    return x - x.mean(1, keepdims=True)           # 시료 전체 세기를 빼서 '구성비(지문)'만 남김


X = feats(C)
cut = pd.Timestamp("2026-08-01")
tr = ts < cut; te = ~tr
mu = X[tr].mean(0); sd = X[tr].std(0) + 1e-9
Z = (X - mu) / sd
clf = LogisticRegression(C=0.5, max_iter=5000)
cv = StratifiedKFold(5, shuffle=True, random_state=0)
pred_cv = cross_val_predict(clf, Z[tr], y[tr], cv=cv)
cv_acc = accuracy_score(y[tr], pred_cv)
clf.fit(Z[tr], y[tr])
pred_te = clf.predict(Z[te])
te_acc = accuracy_score(y[te], pred_te)
cm = confusion_matrix(y[tr], pred_cv, labels=range(len(CLS)))
pts = np.array([r["point"] for r in recs])
acc_pt = {p: float(accuracy_score(y[tr & (pts == p)], pred_cv[(pts[tr] == p)])) for p in ["배출구", "부지경계선"]}
print(f"[지문] 5겹 교차검증 {cv_acc:.3f}  최근3개월 홀드아웃 {te_acc:.3f} (n={te.sum()})  지점별 {acc_pt}")
print(cm)

# ------------------------------------------------------------------ 2. 악취 예보 (유사 기상 kNN)
obs = wx.loc[:NOW]
last = obs.iloc[-8760:]
ou = np.stack([mon[s["code"]]["ou"][: len(obs)][-8760:] for s in STATIONS], 1)
hr = last.index.hour.values; wk = last.index.weekday.values
F = np.stack([np.sin(np.deg2rad(last.wd.values)), np.cos(np.deg2rad(last.wd.values)), np.log(last.ws.values),
              last.t.values, np.sin(2 * np.pi * hr / 24), np.cos(2 * np.pi * hr / 24),
              ((wk < 5) & (hr >= 8) & (hr <= 18)).astype(float)], 1)
fmu = F.mean(0); fsd = F.std(0)
W = np.array([2.2, 2.2, 1.3, 0.8, 0.7, 0.7, 0.6])


def knn_pred(Ftr, Ytr, Fq, k=24):
    A = (Ftr - fmu) / fsd * W; B = (Fq - fmu) / fsd * W
    out = np.zeros((len(Fq), Ytr.shape[1]))
    for i in range(0, len(B), 500):
        dd = ((B[i:i + 500, None, :] - A[None, :, :]) ** 2).sum(-1)
        nn = np.argpartition(dd, k, axis=1)[:, :k]
        out[i:i + 500] = np.median(Ytr[nn], axis=1)
    return out


split = len(last) - 24 * 61  # 마지막 61일 시험
Fa, Fb = F[:split], F[split:]
Ya, Yb = ou[:split], ou[split:]
P = knn_pred(Fa, Ya, Fb)
clim = np.stack([Ya[hr[:split] == h].mean(0) for h in range(24)])
Pb = clim[hr[split:]]
mae = np.abs(P - Yb).mean(0); mae_b = np.abs(Pb - Yb).mean(0)
rcor = [np.corrcoef(P[:, j], Yb[:, j])[0, 1] for j in range(len(STATIONS))]
lvl = lambda v: np.digitize(v, [10, 15, 30])
hit = ((P >= 12) & (Yb >= 15)).sum() / max(1, (Yb >= 15).sum())
far = ((P >= 12) & (Yb < 10)).sum() / max(1, (P >= 12).sum())
print("[예보] MAE kNN", mae.round(2), "기준(시간대 평균)", mae_b.round(2))
print("       r", np.round(rcor, 2), "주의(≥15) 포착률 %.2f 오경보율 %.2f" % (hit, far))

# 대표 시나리오: 지난 여름 해풍일(남동풍) 중 고농도 날
summer = last[(last.index.month == 7) | (last.index.month == 8)]
resid = pd.Series(ou[:, [0, 1, 5]].mean(1), index=last.index).loc[summer.index].resample("D").mean()
sday = resid.idxmax().normalize()
print("summer scenario day (주거지 3곳 일평균 최고)", sday.date(), round(resid.max(), 1))

# ------------------------------------------------------------------ 2-1. 복합악취 예상식 (기기분석 ΣOAV → 희석배수)
from gen_data import SRC_CH
reg = {}
for pt in ["배출구", "부지경계선"]:
    m = np.array([(r["point"] == pt) and r["dil"] > 3 for r in recs])
    xo = np.log10(np.array([(r["conc"] / THR).sum() for r in recs])[m] + 1)
    yo = np.log10(np.array([r["dil"] for r in recs])[m])
    b1, b0 = np.polyfit(xo, yo, 1)
    res = yo - (b0 + b1 * xo)
    reg[pt] = dict(a=round(float(b0), 4), b=round(float(b1), 4), sd=round(float(res.std()), 4),
                   r=round(float(np.corrcoef(xo, yo)[0, 1]), 3), n=int(m.sum()))
print("[복합악취 회귀]", reg)

# ------------------------------------------------------------------ 2-2. 민원 역추적 (풍향 + 센서 지문)
CH_SCALE = np.array([9.0, 260.0, 160.0]); CH_BG = np.array([0.35, 20.0, 13.0])
PROFS = [np.array(SRC_CH[s["cls"]][1:]) for s in SITES]
def backtrack(st, wd_, ch, sig=30, pe=0.8, fw=0.75):
    v = np.maximum(np.asarray(ch) - CH_BG, 0) / CH_SCALE
    sc = []
    for k, s in enumerate(SITES):
        dx, dy = s["x"] - st["x"], s["y"] - st["y"]
        rr = max(0.4, math.hypot(dx, dy))
        brg = (math.degrees(math.atan2(dx, dy)) + 360) % 360
        dl = (brg - wd_ + 180) % 360 - 180
        cs = float(v @ PROFS[k] / (np.linalg.norm(v) * np.linalg.norm(PROFS[k]) + 1e-9)) if v.sum() > 0 else 0.5
        sc.append(math.exp(-dl ** 2 / (2 * sig ** 2)) / rr ** pe * ((1 - fw) + fw * cs))
    return np.array(sc)
contrib = d["contrib"]
nobs = len(obs)
cases = []
for st in STATIONS:
    o = mon[st["code"]]
    for i in range(nobs - 8760, nobs):
        if o["ou"][i] >= 15:
            cases.append((i, st, wx.wd.values[i], (o["h2s"][i], o["tvoc"][i], o["nh3"][i]), int(np.argmax(contrib[st["code"]][i]))))
tsplit = nobs - 24 * 61
def score(cs, prm):
    h1 = h2 = 0
    for i, st, w_, ch, truth in cs:
        o_ = np.argsort(-backtrack(st, w_, ch, *prm))
        h1 += o_[0] == truth; h2 += truth in o_[:2]
    return h1 / len(cs), h2 / len(cs)
trc = [c for c in cases if c[0] < tsplit]; tec = [c for c in cases if c[0] >= tsplit]
grid = [(s_, p_, f_) for s_ in (20, 30, 40) for p_ in (0.8, 1.2, 1.6) for f_ in (0.5, 0.75, 0.9)]
bestp = max(grid, key=lambda g_: score(trc, g_)[0])
t1, t2 = score(tec, bestp)
bt = dict(n=len(tec), n_tr=len(trc), top1=round(t1, 3), top2=round(t2, 3), sig=bestp[0], pe=bestp[1], fw=bestp[2])
print("[역추적] 학습기간 최적", bestp, "시험(최근 61일)", bt)
# 최근 14일 경보 시간의 실제 최대 기여 배출원(가상 데이터의 정답)
truth14 = {st["code"]: [int(np.argmax(contrib[st["code"]][i])) for i in range(nobs - 24 * 14, nobs)] for st in STATIONS}

# ------------------------------------------------------------------ 3. 내보내기
def sig(v, n=4):
    if v == 0:
        return 0
    return float(f"{v:.{n}g}")


records_out = []
for r in recs:
    records_out.append(dict(id=r["id"], s=r["site"], k=r["kind"], p=r["point"], ts=f"{r['ts']:%Y-%m-%d %H:00}",
                            wd=int(round(r["wd"])), ws=round(r["ws"], 1), t=round(r["t"], 1), rh=int(round(r["rh"])),
                            dil=int(r["dil"]), an=r["analyst"], c=[sig(v) for v in r["conc"]]))

base = last.index[0]
fc = wx.loc[NOW + pd.Timedelta(hours=1):]
mon14 = slice(len(obs) - 24 * 14, len(obs))
out = dict(
    meta=dict(now=f"{NOW:%Y-%m-%d %H:00}", generated="2026-11-10", seed=20261110),
    compounds=[dict(id=c[0], kr=c[1], en=c[2], grp=c[3], thr=c[4], li=c[5], lo=c[6], mdl=c[7], desc=c[8], tr=c[9])
               for c in COMPOUNDS],
    classes=[dict(id=k, kr=CLASSES[k][0]) for k in CLS],
    sites=[dict(code=s["code"], name=s["name"], cls=s["cls"], zone=s["zone"], x=s["x"], y=s["y"],
                facility=s["facility"], sched=s["sched"]) for s in SITES],
    stations=STATIONS,
    records=records_out,
    clf=dict(mu=mu.round(5).tolist(), sd=sd.round(5).tolist(), coef=clf.coef_.round(5).tolist(),
             b=clf.intercept_.round(5).tolist(), cv_acc=round(cv_acc, 3), te_acc=round(te_acc, 3),
             n_tr=int(tr.sum()), n_te=int(te.sum()), acc_pt={k: round(v, 3) for k, v in acc_pt.items()},
             cm=cm.tolist(), cut="2026-08-01", test_ids=[recs[i]["id"] for i in np.where(te)[0]]),
    fc=dict(start=f"{base:%Y-%m-%d %H:00}", n=len(last), wd=last.wd.round().astype(int).tolist(),
            ws=(last.ws * 10).round().astype(int).tolist(), t=(last.t * 10).round().astype(int).tolist(),
            ou=[(ou[:, j] * 10).round().astype(int).tolist() for j in range(len(STATIONS))],
            mu=fmu.round(5).tolist(), sd=fsd.round(5).tolist(), w=W.tolist(), k=24,
            mae=mae.round(2).tolist(), mae_base=mae_b.round(2).tolist(), r=np.round(rcor, 2).tolist(),
            hit=round(float(hit), 2), far=round(float(far), 2), test_days=61,
            tomorrow=dict(start=f"{fc.index[0]:%Y-%m-%d %H:00}", wd=fc.wd.round().astype(int).tolist(),
                          ws=fc.ws.round(1).tolist(), t=fc.t.round(1).tolist()),
            scenario=dict(day=f"{sday:%Y-%m-%d}")),
    mon=dict(start=f"{obs.index[mon14.start]:%Y-%m-%d %H:00}", n=24 * 14,
             wd=obs.wd.values[mon14].round().astype(int).tolist(), ws=obs.ws.values[mon14].round(1).tolist(),
             t=obs.t.values[mon14].round(1).tolist(),
             st={s["code"]: {ch: np.round(mon[s["code"]][ch][mon14], 1).tolist() for ch in ["ou", "h2s", "tvoc", "nh3"]}
                 for s in STATIONS}),
    validation=json.load(open("build/validation.json"))["checks"],
    reg=reg, bt=dict(**bt, scale=CH_SCALE.tolist(), bg=CH_BG.tolist(),
                     prof={k: list(v[1:]) for k, v in SRC_CH.items()}, truth14=truth14),
)
json.dump(out, open("build/data.json", "w"), ensure_ascii=False, separators=(",", ":"))
import os
print("data.json", os.path.getsize("build/data.json") // 1024, "KB")
