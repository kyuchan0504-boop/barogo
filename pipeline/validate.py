"""가상 데이터 타당성 검증 → build/validation.json"""
import json, math
import numpy as np
import pandas as pd
from gen_data import (COMPOUNDS, CID, THR, LIM_IND, LIM_OTH, MDL, SITES, STATIONS, CLASSES)

d = pd.read_pickle("build/raw.pkl")
wx, recs, mon = d["wx"], d["recs"], d["mon"]
site = {s["code"]: s for s in SITES}
checks = []


def add(name, ok, detail, basis):
    checks.append(dict(name=name, ok=bool(ok), detail=detail, basis=basis))


df = pd.DataFrame([{k: v for k, v in r.items() if k not in ("conc", "true")} for r in recs])
C = np.array([r["conc"] for r in recs])
T = np.array([r["true"] for r in recs])
df["zone"] = df.site.map(lambda c: site[c]["zone"])
df["cls"] = df.site.map(lambda c: site[c]["cls"])
df["month"] = df.ts.dt.month

# 1) 배출구 > 부지경계선 (같은 측정 회차)
pairs = 0; ok = 0
for (s, ts), g in df.groupby(["site", "ts"]):
    if len(g) == 2:
        i_s = g.index[g.point == "배출구"][0]; i_b = g.index[g.point == "부지경계선"][0]
        det = (C[i_s] > 0) & (C[i_b] > 0)
        sig = det & (T[i_s] / THR > 1)  # 배출구에서 냄새로 의미 있는 물질
        pairs += sig.sum(); ok += (C[i_b][sig] < C[i_s][sig]).sum()
rate = ok / pairs
add("배출구 농도 > 부지경계선 농도", rate >= 0.95,
    f"같은 회차 {pairs}개 물질쌍 중 {rate*100:.1f}%에서 부지경계선이 더 낮음",
    "배출구에서 나온 가스는 확산되며 희석되므로 경계선 농도가 낮아야 함")

# 2) 복합악취 기준 초과율
lim_b = df.zone.map({"공업": 20, "기타": 15}); lim_s = df.zone.map({"공업": 1000, "기타": 500})
b = df.point == "부지경계선"; s_ = df.point == "배출구"
ex_s = (df.dil[s_] > lim_s[s_]).mean()
reg = b & (df.kind == "정기"); cmp_ = b & (df.kind == "민원")
ex_r = (df.dil[reg] > lim_b[reg]).mean(); ex_c = (df.dil[cmp_] > lim_b[cmp_]).mean()
add("복합악취 부지경계선 기준 초과율", 0.03 <= ex_r <= 0.20 and ex_c > ex_r,
    f"정기측정 {reg.sum()}건 중 {ex_r*100:.1f}%, 민원 대응 측정 {cmp_.sum()}건 중 {ex_c*100:.1f}% 초과 (공업 20배·기타 15배)",
    "정기측정에서는 일부만 초과하고, 악취가 심할 때 이루어지는 민원 대응 측정에서 초과가 더 잦음")
add("복합악취 배출구 기준 초과율", ex_s <= 0.15,
    f"배출구 {s_.sum()}건 중 {ex_s*100:.1f}% 초과 (공업 1000배·기타 500배 기준)",
    "방지시설이 있는 사업장은 대부분 기준 이내로 운영")

# 3) 지정악취물질 부지경계선 초과 물질
lim = np.where(np.asarray(df.zone, dtype=object)[:, None] == "공업", LIM_IND[None, :], LIM_OTH[None, :])
exc = (C > lim) & b.values[:, None]
smp_ex = exc.any(1)[b.values].mean()
by = {COMPOUNDS[j][1]: int(exc[:, j].sum()) for j in range(len(CID)) if exc[:, j].sum() > 0}
voc_ex = sum(exc[:, CID.index(k)].sum() for k in ["TOL", "XYL", "MEK", "MIBK"])
add("지정악취물질 초과 물질 구성", voc_ex == 0 and len(by) >= 2 and 0.02 <= smp_ex <= 0.25,
    f"부지경계선 시료의 {smp_ex*100:.1f}%에서 1종 이상 초과 — " + ", ".join(f"{k} {v}건" for k, v in sorted(by.items(), key=lambda x: -x[1])),
    "최소감지농도가 매우 낮은 황화합물·아민·지방산이 주로 초과, 기준이 높은 톨루엔 등 용제류는 초과가 드묾")

# 4) 계절성
bio = df.cls.isin(["sewage", "foodwaste", "livestock", "feed", "wastewater"]) & s_
summer = df.month.isin([6, 7, 8]); winter = df.month.isin([12, 1, 2])
ratio = df.dil[bio & summer].mean() / df.dil[bio & winter].mean()
add("생물학적 배출원의 계절성", 1.3 <= ratio <= 3.5,
    f"하수·음식물·축산·사료·폐수 배출구 희석배수 여름/겨울 = {ratio:.2f}배",
    "미생물 분해가 활발한 여름철 악취가 높고 민원도 여름에 집중")

# 5) 복합악취 vs 지정악취 OAV 합
rs = {}
for pt in ["배출구", "부지경계선"]:
    m = (df.dil > 3) & (df.point == pt)
    rs[pt] = np.corrcoef(np.log10(df.oavsum[m]), np.log10(df.dil[m]))[0, 1]
add("복합악취(관능)와 기기분석 OAV 합의 상관", all(0.55 <= x <= 0.93 for x in rs.values()),
    ", ".join(f"{k} r = {x:.2f}" for k, x in rs.items()) + " (log ΣOAV vs log 희석배수)",
    "국내 연구에서 두 지표는 뚜렷한 양의 상관이지만 미측정 물질 때문에 완전히 일치하지 않음")

# 6) 업종별 주요 기여물질
expect = {"sewage": {"H2S", "MM"}, "wastewater": {"H2S", "MM", "TMA", "ACA"}, "foodwaste": {"TMA", "MM", "ACA", "H2S"},
          "livestock": {"H2S", "MM", "TMA", "NVAL", "NBA"}, "feed": {"TMA", "ACA", "IVA", "BA"},
          "petrochem": {"STY", "XYL", "ACA", "H2S"}, "coating": {"BAC", "IBA", "XYL"}}
tops = {}; allok = True
for cls in CLASSES:
    mk = (df.cls == cls).values & s_.values
    share = (T[mk] / THR).mean(0)
    top2 = [CID[j] for j in np.argsort(-share)[:2]]
    tops[CLASSES[cls][0]] = [COMPOUNDS[CID.index(x)][1] for x in top2]
    allok &= set(top2) <= expect[cls]
add("업종별 주요 기여물질", allok,
    " / ".join(f"{k}: {', '.join(v)}" for k, v in tops.items()),
    "하수처리 황화수소·메틸메르캅탄, 사료 알데하이드·아민, 도장 용제류 등 문헌상 대표 물질과 일치")

# ----- 연속 모니터링
idx = wx.index
sm = idx.month.isin([6, 7, 8]); wm = idx.month.isin([12, 1, 2])
rr = {c: mon[c]["ou"][sm].mean() / mon[c]["ou"][wm].mean() for c in ["M1", "M2"]}
add("주거지 측정소 계절 패턴", all(v >= 1.2 for v in rr.values()),
    ", ".join(f"{c} 여름/겨울 {v:.2f}배" for c, v in rr.items()),
    "여름 남동풍(해풍)이 공단 악취를 내륙 주거지로 운반 — 울산 악취 민원이 여름에 집중되는 양상")
hr = idx.hour
nt = (hr <= 5); af = (hr >= 13) & (hr <= 16)
nr = {c: mon[c]["ou"][nt].mean() / mon[c]["ou"][af].mean() for c in mon}
add("야간 대기안정에 따른 고농도", sum(v > 1 for v in nr.values()) >= 4,
    ", ".join(f"{c} {v:.2f}" for c, v in nr.items()) + " (새벽/오후 평균 비)",
    "야간·새벽 역전층에서 희석이 약해 악취가 높게 관측됨")
fr = {c: (mon[c]["ou"] >= 15).mean() * 100 for c in mon}
add("주의 단계(≥15배) 시간 비율", all(0.3 <= v <= 6 for v in fr.values()),
    ", ".join(f"{c} {v:.1f}%" for c, v in fr.items()),
    "대부분 시간은 기준 이내, 특정 기상·공정 조건에서만 단기 고농도")
# 풍향 의존성: M5 ← A 하수처리장
s1 = site["S01"]; st5 = [s for s in STATIONS if s["code"] == "M5"][0]
brg = (math.degrees(math.atan2(st5["x"] - s1["x"], st5["y"] - s1["y"])) + 360) % 360
src_dir = (brg + 180) % 360  # 이 방향에서 바람이 불면 하수처리장 → M5
dd = np.abs((wx.wd.values - src_dir + 180) % 360 - 180)
inc = mon["M5"]["ou"][dd < 30].mean(); oth = mon["M5"]["ou"][dd >= 60].mean()
h2 = mon["M5"]["h2s"][dd < 30].mean() / mon["M5"]["h2s"][dd >= 60].mean()
add("풍향–배출원 연계성", inc / oth >= 1.8 and h2 >= 2,
    f"M5(하수처리장 인근): 하수처리장 쪽 바람일 때 복합악취 {inc/oth:.1f}배, H₂S {h2:.1f}배",
    "측정값이 바람이 불어오는 쪽 배출원 특성을 반영해야 역추적이 가능")
mt = wx.groupby(idx.month)["t"].mean()
add("기상 현실성", 1 <= mt[1] <= 6 and 24 <= mt[8] <= 28,
    f"1월 평균 {mt[1]:.1f}℃, 8월 평균 {mt[8]:.1f}℃, 평균풍속 {wx.ws.mean():.1f} m/s, 겨울 북서풍·여름 남동풍",
    "울산 평년값(1월 약 3℃, 8월 약 26℃)과 계절풍 패턴에 맞춤")

json.dump(dict(checks=checks), open("build/validation.json", "w"), ensure_ascii=False, indent=1)
for c in checks:
    print("PASS" if c["ok"] else "FAIL", "|", c["name"], "|", c["detail"])
