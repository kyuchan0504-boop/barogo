"""가상 악취 데이터 생성기 (태성환경연구소 인턴 과제용)

근거
- 지정악취물질 22종, 배출허용기준(공업/기타): 악취방지법 시행규칙 별표3
- 복합악취 배출허용기준: 배출구 1000/500, 부지경계선 20/15 (희석배수)
- 최소감지농도: Nagata(2003) 삼점비교식 냄새주머니법
- 업종별 주요 물질: 국내 문헌(하수처리장 황화합물, 사료·음식물 알데하이드·지방산 등)
모든 사업장·측정값은 가상이다.
"""
import json, math
import numpy as np
import pandas as pd

import os
rng = np.random.default_rng(int(os.environ.get("SEED", "20261110")))

# id, 한글명, 영문명, 계열, 최소감지농도(ppm), 기준 공업, 기준 기타, MDL(ppm), 냄새 특성, 처리 특성
COMPOUNDS = [
    ("NH3", "암모니아", "Ammonia", "질소화합물", 1.5, 2, 1, 0.02, "분뇨·소변 냄새", "acid"),
    ("MM", "메틸메르캅탄", "Methyl mercaptan", "황화합물", 0.00007, 0.004, 0.002, 0.0002, "썩은 양파 냄새", "alkox"),
    ("H2S", "황화수소", "Hydrogen sulfide", "황화합물", 0.00041, 0.06, 0.02, 0.0002, "썩은 달걀 냄새", "alkox"),
    ("DMS", "다이메틸설파이드", "Dimethyl sulfide", "황화합물", 0.003, 0.05, 0.01, 0.0002, "썩은 양배추 냄새", "insol_s"),
    ("DMDS", "다이메틸다이설파이드", "Dimethyl disulfide", "황화합물", 0.0022, 0.03, 0.009, 0.0002, "썩은 양배추·마늘 냄새", "insol_s"),
    ("TMA", "트라이메틸아민", "Trimethylamine", "질소화합물", 0.000032, 0.02, 0.005, 0.0002, "썩은 생선 냄새", "acid"),
    ("ACA", "아세트알데하이드", "Acetaldehyde", "알데하이드", 0.0015, 0.1, 0.05, 0.0005, "자극적인 풋사과·탄 냄새", "ald"),
    ("STY", "스타이렌", "Styrene", "VOC", 0.035, 0.8, 0.4, 0.001, "도시가스·플라스틱 냄새", "voc"),
    ("PA", "프로피온알데하이드", "Propionaldehyde", "알데하이드", 0.001, 0.1, 0.05, 0.0005, "자극적인 시큼한 냄새", "ald"),
    ("BA", "뷰틸알데하이드", "Butyraldehyde", "알데하이드", 0.00067, 0.1, 0.029, 0.0005, "자극적인 시큼한 냄새", "ald"),
    ("NVA", "n-발레르알데하이드", "n-Valeraldehyde", "알데하이드", 0.00041, 0.02, 0.009, 0.0003, "숨막히는 시큼한 냄새", "ald"),
    ("IVA", "i-발레르알데하이드", "i-Valeraldehyde", "알데하이드", 0.0001, 0.006, 0.003, 0.0001, "숨막히는 시큼한 냄새", "ald"),
    ("TOL", "톨루엔", "Toluene", "VOC", 0.33, 30, 10, 0.005, "휘발유·시너 냄새", "voc"),
    ("XYL", "자일렌", "Xylene", "VOC", 0.041, 2, 1, 0.005, "휘발유·페인트 냄새", "voc"),
    ("MEK", "메틸에틸케톤", "Methyl ethyl ketone", "VOC", 0.44, 35, 13, 0.01, "아세톤 같은 용제 냄새", "voc_sol"),
    ("MIBK", "메틸아이소뷰틸케톤", "Methyl isobutyl ketone", "VOC", 0.17, 3, 1, 0.005, "달큰한 시너 냄새", "voc"),
    ("BAC", "뷰틸아세테이트", "Butyl acetate", "VOC", 0.016, 4, 1, 0.005, "바나나·접착제 냄새", "voc"),
    ("PRA", "프로피온산", "Propionic acid", "지방산", 0.0057, 0.07, 0.03, 0.0005, "자극적인 신 냄새", "fa"),
    ("NBA", "n-뷰틸산", "n-Butyric acid", "지방산", 0.00019, 0.002, 0.001, 0.0001, "땀·토사물 냄새", "fa"),
    ("NVAL", "n-발레르산", "n-Valeric acid", "지방산", 0.000037, 0.002, 0.0009, 0.0001, "땀·발 냄새", "fa"),
    ("IVAL", "i-발레르산", "i-Valeric acid", "지방산", 0.000078, 0.004, 0.001, 0.0001, "발 냄새·묵은 치즈 냄새", "fa"),
    ("IBA", "i-뷰틸알코올", "i-Butyl alcohol", "VOC", 0.011, 4.0, 0.9, 0.005, "발효·알코올 냄새", "voc_sol"),
]
CID = [c[0] for c in COMPOUNDS]
THR = np.array([c[4] for c in COMPOUNDS])
LIM_IND = np.array([c[5] for c in COMPOUNDS], dtype=float)
LIM_OTH = np.array([c[6] for c in COMPOUNDS], dtype=float)
MDL = np.array([c[7] for c in COMPOUNDS])

# 업종(클래스)별 배출구 기하평균 농도(ppm)
CLASSES = {
    "sewage": ("하수처리", {"H2S": 0.12, "MM": 0.010, "DMS": 0.012, "DMDS": 0.006, "NH3": 0.6, "ACA": 0.015,
                         "PA": 0.003, "BA": 0.002, "TMA": 0.0008, "TOL": 0.02}),
    "wastewater": ("폐수처리", {"H2S": 0.06, "MM": 0.006, "DMS": 0.02, "DMDS": 0.01, "ACA": 0.05, "TMA": 0.003,
                             "NH3": 0.8, "TOL": 0.3, "XYL": 0.05, "MEK": 0.2, "PA": 0.006, "BA": 0.003}),
    "foodwaste": ("음식물자원화", {"ACA": 0.12, "TMA": 0.006, "NH3": 2.5, "MM": 0.008, "DMDS": 0.01, "DMS": 0.01,
                               "H2S": 0.03, "PRA": 0.02, "NBA": 0.0015, "IVAL": 0.0003, "NVAL": 0.0002,
                               "PA": 0.01, "BA": 0.006, "IBA": 0.08}),
    "livestock": ("축산", {"NH3": 4.0, "H2S": 0.04, "MM": 0.004, "PRA": 0.03, "NBA": 0.004, "NVAL": 0.0008,
                          "IVAL": 0.0009, "TMA": 0.002, "ACA": 0.01, "DMS": 0.005}),
    "feed": ("사료·식품제조", {"ACA": 0.15, "PA": 0.02, "BA": 0.02, "NVA": 0.004, "IVA": 0.008, "NBA": 0.002,
                            "IVAL": 0.0006, "PRA": 0.015, "TMA": 0.004, "NH3": 1.0, "DMS": 0.004, "MM": 0.002}),
    "petrochem": ("석유화학", {"STY": 0.6, "TOL": 3.0, "XYL": 1.2, "ACA": 0.04, "MEK": 0.5, "BAC": 0.05,
                            "IBA": 0.05, "DMS": 0.003, "H2S": 0.01, "MIBK": 0.05}),
    "coating": ("도장·인쇄", {"TOL": 6.0, "XYL": 3.0, "MEK": 4.0, "MIBK": 1.2, "BAC": 1.5, "IBA": 1.0,
                           "STY": 0.05, "ACA": 0.02}),
}
CLASS_ORDER = list(CLASSES.keys())

# 가상 사업장 (좌표: 가상 산업단지 개략도, km, x=동쪽, y=북쪽)
SITES = [
    # code, 이름, 클래스, 지역구분, x, y, 방지시설, 계절계수(beta), 미측정물질계수, 경계 희석(1/a), 배출강도, 운영패턴, 사업장 변형
    dict(code="S01", name="A 공공하수처리시설", cls="sewage", zone="기타", x=5.0, y=2.0,
         facility="바이오필터 + 약액세정탑", beta=0.050, unmeasured=1.2, atten=280, strength=1.0, sched="24h", var={}),
    dict(code="S02", name="B 음식물류폐기물 자원화시설", cls="foodwaste", zone="기타", x=4.6, y=6.8,
         facility="약액세정탑 2단", beta=0.060, unmeasured=1.4, atten=220, strength=1.2, sched="day", var={"__all__": 0.75}),
    dict(code="S03", name="C 석유화학", cls="petrochem", zone="공업", x=8.5, y=4.5,
         facility="RTO(축열식 연소)", beta=0.010, unmeasured=1.1, atten=140, strength=0.6, sched="24h",
         var={"TOL": 1.4, "XYL": 1.3, "STY": 0.6}),
    dict(code="S04", name="D 도장공장", cls="coating", zone="공업", x=7.2, y=5.6,
         facility="활성탄 흡착탑", beta=0.015, unmeasured=0.9, atten=120, strength=1.0, sched="weekday", var={}),
    dict(code="S05", name="E 사료제조", cls="feed", zone="공업", x=6.6, y=3.6,
         facility="약액세정탑", beta=0.030, unmeasured=1.5, atten=220, strength=1.0, sched="feed", var={}),
    dict(code="S06", name="F 양돈농가", cls="livestock", zone="기타", x=2.0, y=7.6,
         facility="없음(개방형 돈사)", beta=0.060, unmeasured=1.6, atten=150, strength=1.3, sched="24h", var={}),
    dict(code="S07", name="G 폐수처리업체", cls="wastewater", zone="공업", x=8.0, y=2.4,
         facility="약액세정탑", beta=0.035, unmeasured=1.2, atten=260, strength=0.8, sched="24h", var={}),
    dict(code="S08", name="H 합성수지 제조", cls="petrochem", zone="공업", x=9.0, y=3.2,
         facility="RTO(축열식 연소)", beta=0.010, unmeasured=1.1, atten=140, strength=0.6, sched="24h",
         var={"STY": 2.4, "TOL": 0.6, "XYL": 0.5, "BAC": 1.6}),
]
STATIONS = [
    dict(code="M1", name="서부 주거지", x=3.2, y=4.4, kind="주거지"),
    dict(code="M2", name="북부 주거지", x=6.0, y=7.8, kind="주거지"),
    dict(code="M3", name="공단 중앙", x=7.6, y=4.2, kind="공단"),
    dict(code="M4", name="남부 부지경계", x=7.0, y=1.0, kind="경계"),
    dict(code="M5", name="하수처리장 인근 마을", x=4.0, y=1.6, kind="주거지"),
    dict(code="M6", name="축산단지 인근 마을", x=1.4, y=6.4, kind="주거지"),
]

# 부지경계선 비산배출 기하평균(ppm): 개방 수조·슬러지 처리·원료 하역 등 굴뚝 외 배출
FUGITIVE = {
    "sewage": {"H2S": 0.0005, "MM": 0.00005, "DMS": 0.0003},
    "wastewater": {"H2S": 0.0008, "MM": 0.00007, "ACA": 0.002},
    "foodwaste": {"TMA": 0.00008, "MM": 0.00005, "ACA": 0.0015, "NBA": 0.0003},
    "livestock": {"NBA": 0.0004, "NVAL": 0.00005, "IVAL": 0.00008, "NH3": 0.25, "H2S": 0.0008, "TMA": 0.00006},
    "feed": {"IVA": 0.0003, "NBA": 0.0004, "ACA": 0.0015, "TMA": 0.0001},
    "petrochem": {"STY": 0.01, "TOL": 0.03},
    "coating": {"BAC": 0.02, "XYL": 0.02, "TOL": 0.05},
}

CO_COEF = 1.1      # 희석배수 = CO_COEF × (ΣOAV×미측정계수)^CO_EXP
CO_EXP = 0.9
FUG_SCALE = 1.0
FUG_SD = 0.9

BACKGROUND = {"TOL": 0.004, "XYL": 0.0015, "ACA": 0.0006, "NH3": 0.03, "H2S": 0.00012, "STY": 0.0008,
              "MEK": 0.003, "BAC": 0.001}

START = pd.Timestamp("2024-11-01 00:00")
END = pd.Timestamp("2026-11-11 03:00")  # 마지막 24시간은 '내일 예보 기상'으로만 사용
NOW = pd.Timestamp("2026-11-10 03:00")


# ---------------------------------------------------------------- 기상
def gen_weather():
    idx = pd.date_range(START, END, freq="h")
    n = len(idx)
    doy = idx.dayofyear.values.astype(float)
    hr = idx.hour.values.astype(float)
    season = (1 - np.cos(2 * np.pi * (doy - 25) / 365)) / 2  # 0=1월 하순, 1=7월 하순
    # 기온
    syn = np.zeros(n)
    e = rng.normal(0, 0.45, n)
    for i in range(1, n):
        syn[i] = 0.985 * syn[i - 1] + e[i]
    t = 3.2 + 23.0 * season + 3.8 * np.cos(2 * np.pi * (hr - 15) / 24) + syn
    # 습도
    rh = 52 + 26 * season - 2.2 * 3.8 * np.cos(2 * np.pi * (hr - 15) / 24) + rng.normal(0, 7, n)
    rh = np.clip(rh, 22, 98)

    # 풍향: 계절풍(겨울 북서, 여름 남동) + 해륙풍 + 종관 변동
    def vec(deg):
        r = np.deg2rad(deg)
        return np.sin(r), np.cos(r)

    su, sv = vec(315)
    wu, wv = vec(140)
    base_u = (1 - season) * su + season * wu
    base_v = (1 - season) * sv + season * wv
    day = ((hr >= 10) & (hr <= 18)).astype(float)
    night = ((hr >= 21) | (hr <= 6)).astype(float)
    bu1, bv1 = vec(110)  # 해풍(동남동에서)
    bu2, bv2 = vec(285)  # 육풍(서북서에서)
    breeze_w = 0.35 + 0.45 * season
    bu = breeze_w * (day * bu1 + night * bu2 * 0.6)
    bv = breeze_w * (day * bv1 + night * bv2 * 0.6)
    ang = np.zeros(n)
    ea = rng.normal(0, 9, n)
    for i in range(1, n):
        ang[i] = 0.985 * ang[i - 1] + ea[i]
    # 종관 성분: 무작위 방향 벡터(천천히 변함)
    synu = np.sin(np.deg2rad(ang * 4)) * 0.55
    synv = np.cos(np.deg2rad(ang * 4)) * 0.55
    u = base_u + bu + synu + rng.normal(0, 0.18, n)
    v = base_v + bv + synv + rng.normal(0, 0.18, n)
    wd = (np.rad2deg(np.arctan2(u, v)) + 360) % 360
    # 풍속
    sp = np.zeros(n)
    es = rng.normal(0, 0.18, n)
    for i in range(1, n):
        sp[i] = 0.95 * sp[i - 1] + es[i]
    ws = (2.3 + 0.9 * (1 - season) + 1.1 * day - 0.6 * night) * np.exp(sp) * rng.lognormal(0, 0.15, n)
    ws = np.clip(ws * 0.85, 0.2, 12)
    stab = np.where((night > 0) & (ws < 2.5), 2, np.where((day > 0) & (ws < 3.2) & (rh < 80), 0, 1))  # 2 안정 1 중립 0 불안정
    return pd.DataFrame(dict(t=t, rh=rh, wd=wd, ws=ws, stab=stab), index=idx)


# ---------------------------------------------------------------- 분석 기록
def profile_vec(site):
    prof = CLASSES[site["cls"]][1]
    p = np.array([prof.get(c, MDL[i] * 0.15) for i, c in enumerate(CID)], dtype=float)
    for k, f in site["var"].items():
        if k == "__all__":
            p *= f
        else:
            p[CID.index(k)] *= f
    return p


def complex_odor(conc, unmeasured, noise_sd=0.5):
    oav = conc / THR
    s = oav.sum() * unmeasured * rng.lognormal(0, noise_sd)
    d = CO_COEF * s ** CO_EXP
    return max(3, int(round(d))), float(oav.sum())


def gen_records(wx):
    daily_t = wx["t"].resample("D").mean()
    rows = []
    months = pd.period_range("2024-11", "2026-10", freq="M")
    analysts = ["분석1팀", "분석2팀", "현장측정팀"]
    for s in SITES:
        base = profile_vec(s)
        lam_bio = {"sewage": 0.30, "foodwaste": 0.40, "livestock": 0.45, "feed": 0.30, "wastewater": 0.20,
                   "petrochem": 0.08, "coating": 0.12}[s["cls"]]
        for m in months:
            events = []
            # 정기 측정 1회 (평일 10~15시)
            days = pd.date_range(m.start_time, m.end_time, freq="D")
            days = [d for d in days if d.weekday() < 5]
            d0 = days[rng.integers(0, len(days))]
            events.append(("정기", d0 + pd.Timedelta(hours=int(rng.integers(10, 16)))))
            # 민원 대응 측정 (여름에 많음)
            summer_w = 1 + 1.6 * math.exp(-((m.month - 7.5) ** 2) / 3.0)
            k = rng.poisson(lam_bio * summer_w * 0.5)
            for _ in range(k):
                dd = pd.Timestamp(m.start_time) + pd.Timedelta(days=int(rng.integers(0, m.days_in_month)))
                events.append(("민원", dd + pd.Timedelta(hours=int(rng.choice([6, 7, 8, 20, 21, 22, 23, 14, 16])))))
            for kind, ts in sorted(events, key=lambda e: e[1]):
                if ts > END:
                    continue
                w = wx.loc[ts.floor("h")]
                tday = daily_t.loc[ts.normalize()]
                seasonal = math.exp(s["beta"] * (tday - 15))
                z = rng.normal(0, 0.40) + (rng.normal(0.45, 0.25) if kind == "민원" else 0)
                stack = base * seasonal * np.exp(z + rng.normal(0, 0.35, len(CID)))
                points = ["배출구", "부지경계선"] if kind == "정기" else ["부지경계선"]
                for pt in points:
                    if pt == "배출구":
                        conc = stack.copy()
                    else:
                        att = math.exp(rng.normal(math.log(1 / s["atten"]), 0.55)) * (2.2 / (w.ws + 1.0)) ** 0.6
                        conc = stack * att
                        fz = rng.normal(0, FUG_SD)
                        for kk, fv in FUGITIVE[s["cls"]].items():
                            conc[CID.index(kk)] += FUG_SCALE * fv * seasonal * math.exp(fz + rng.normal(0, 0.3))
                        for kk, bv in BACKGROUND.items():
                            conc[CID.index(kk)] += bv * rng.lognormal(0, 0.5)
                    dil, oavsum = complex_odor(conc, s["unmeasured"])
                    rep = np.where(conc < MDL, 0.0, conc)
                    rows.append(dict(site=s["code"], kind=kind, point=pt, ts=ts, wd=float(w.wd), ws=float(w.ws),
                                     t=float(w.t), rh=float(w.rh), dil=dil, oavsum=oavsum,
                                     analyst=analysts[int(rng.integers(0, 3))], conc=rep, true=conc))
    rows.sort(key=lambda r: (r["ts"], r["site"], r["point"]))
    for i, r in enumerate(rows):
        r["id"] = f"TS-{r['ts']:%y%m%d}-{r['site'][1:]}{'S' if r['point']=='배출구' else 'B'}{i % 100:02d}"
    return rows


# ---------------------------------------------------------------- 연속 모니터링
SRC_CH = {  # 채널별 상대 비중: OU, H2S, TVOC, NH3
    "sewage": (1.0, 1.00, 0.05, 0.30),
    "wastewater": (0.8, 0.60, 0.30, 0.20),
    "foodwaste": (1.2, 0.30, 0.08, 0.60),
    "livestock": (1.3, 0.45, 0.03, 1.00),
    "feed": (1.0, 0.08, 0.12, 0.25),
    "petrochem": (0.6, 0.06, 1.00, 0.02),
    "coating": (1.0, 0.02, 1.40, 0.02),
}


def schedule(kind, hr, wk):
    if kind == "24h":
        return np.ones_like(hr, dtype=float)
    if kind == "day":
        return np.where((hr >= 7) & (hr <= 20), 1.0, 0.5)
    if kind == "feed":
        return np.where((hr >= 6) & (hr <= 22), 1.0, 0.3) * np.where(wk == 6, 0.4, 1.0)
    if kind == "weekday":
        return np.where((wk < 5) & (hr >= 8) & (hr <= 18), 1.0, 0.1)
    raise ValueError(kind)


def angdiff(a, b):
    return (a - b + 180) % 360 - 180


def gen_monitoring(wx):
    n = len(wx)
    hr = wx.index.hour.values
    wk = wx.index.weekday.values
    tday = wx["t"].rolling(24, min_periods=1).mean().values
    ws = wx["ws"].values
    wd = wx["wd"].values
    stab = wx["stab"].values
    sigma = np.choose(stab, [28.0, 18.0, 10.0])
    fstab = np.choose(stab, [0.55, 1.0, 2.2])
    out = {st["code"]: {"ou": np.zeros(n), "h2s": np.zeros(n), "tvoc": np.zeros(n), "nh3": np.zeros(n)}
           for st in STATIONS}
    contrib = {st["code"]: np.zeros((n, len(SITES))) for st in STATIONS}
    events_log = []
    for k, s in enumerate(SITES):
        E = s["strength"] * np.exp(s["beta"] * (tday - 15)) * schedule(s["sched"], hr, wk)
        # 공정 변동 (AR)
        a = np.zeros(n)
        ea = rng.normal(0, 0.08, n)
        for i in range(1, n):
            a[i] = 0.96 * a[i - 1] + ea[i]
        E = E * np.exp(a)
        # 돌발 이벤트 (월 1.3회)
        nev = rng.poisson(1.3 * n / 730)
        for _ in range(nev):
            st0 = int(rng.integers(0, n - 8))
            dur = int(rng.integers(2, 7))
            mult = float(rng.uniform(3, 7))
            E[st0:st0 + dur] *= mult
            events_log.append((s["code"], st0, dur, mult))
        ch = SRC_CH[s["cls"]]
        for st in STATIONS:
            dx, dy = st["x"] - s["x"], st["y"] - s["y"]
            r = max(0.4, math.hypot(dx, dy))
            bearing = (math.degrees(math.atan2(dx, dy)) + 360) % 360
            heading = (wd + 180) % 360
            dlt = angdiff(heading, bearing)
            D = fstab * np.exp(-dlt ** 2 / (2 * sigma ** 2)) / (np.maximum(ws, 0.5) * r ** 1.4)
            calm = ws < 0.8
            D = np.where(calm, np.maximum(D, 0.35 * fstab / r ** 2), D)
            c = E * D
            contrib[st["code"]][:, k] = c
            out[st["code"]]["ou"] += 19.0 * c * ch[0]
            out[st["code"]]["h2s"] += 9.0 * c * ch[1]
            out[st["code"]]["tvoc"] += 260.0 * c * ch[2]
            out[st["code"]]["nh3"] += 160.0 * c * ch[3]
    for st in STATIONS:
        o = out[st["code"]]
        o["ou"] = (o["ou"] + 2.0 * rng.lognormal(0, 0.25, n)) * rng.lognormal(0, 0.12, n)
        o["h2s"] = (o["h2s"] + 0.3 * rng.lognormal(0, 0.3, n)) * rng.lognormal(0, 0.12, n)
        o["tvoc"] = (o["tvoc"] + 18 * rng.lognormal(0, 0.3, n)) * rng.lognormal(0, 0.12, n)
        o["nh3"] = (o["nh3"] + 12 * rng.lognormal(0, 0.3, n)) * rng.lognormal(0, 0.12, n)
    return out, contrib, events_log


if __name__ == "__main__":
    os.makedirs("build", exist_ok=True)
    wx = gen_weather()
    recs = gen_records(wx)
    mon, contrib, evlog = gen_monitoring(wx)
    pd.to_pickle(dict(wx=wx, recs=recs, mon=mon, contrib=contrib, evlog=evlog), "build/raw.pkl")
    print("hours", len(wx), "records", len(recs), "events", len(evlog))
