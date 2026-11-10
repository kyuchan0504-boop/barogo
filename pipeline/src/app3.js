/* ================= 04 예측센터 ================= */
APP.pages.forecast = sec => {
  const T = TOM, b = T.best;
  const heat = h('div', { class: 'heat', role: 'table', 'aria-label': '앞으로 24시간 측정소별 악취 예보' },
    h('div', { class: 'hr', role: 'row' }, h('span', { class: 'lbl faint' }, '측정소 \\ 시각'), T.rows.map(r => h('span', { class: 'mono faint', style: 'text-align:center;font-size:12px' }, new Date(r.ms).getUTCHours()))),
    STN.map((st, j) => h('div', { class: 'hr', role: 'row' }, h('span', { class: 'lbl' }, h('b', null, st.code), ' ', st.name),
      T.rows.map(r => { const v = r.p[j], L = lvl(v); return h('span', { class: 'c ' + L.k, onmousemove: e => showTip(e, `${st.code} ${esc(st.name)} · ${tf(r.ms)}<br>예보 <b>${f1(v)}</b>배 (${L.t})<br>${dirName(r.wd)}풍 ${f1(r.ws)} m/s · ${f1(r.t)}℃`), onmouseleave: hideTip }, Math.round(v)); }))),
    h('div', { class: 'hr', role: 'row' }, h('span', { class: 'lbl faint' }, '바람(가는 방향)'), T.rows.map(r => h('span', { style: 'text-align:center', title: `${dirName(r.wd)}풍 ${f1(r.ws)} m/s` }, h('span', { style: `display:inline-block;transform:rotate(${(r.wd + 180) % 360}deg);font-size:16px;color:var(--ink-2)` }, '↑')))));
  // 가정 기상
  const W0 = { wd: MON.wd[nowIdx], ws: MON.ws[nowIdx], t: MON.t[nowIdx], hr: new Date(NOW).getUTCHours(), wk: pyWkOf(NOW) < 5 };
  const S = { ...W0 };
  const presets = [['지금 기상', W0], ['여름 낮 해풍', { wd: 125, ws: 2.4, t: 29, hr: 14, wk: true }], ['겨울 새벽 북서풍', { wd: 315, ws: 1.2, t: 1, hr: 5, wk: true }], ['열대야 약풍', { wd: 160, ws: 0.6, t: 26, hr: 2, wk: false }]];
  const ctrl = h('div', { class: 'stack' }), mapBox = h('div'), tbl = h('div');
  const inputs = {};
  const mk = (key, label, min, max, step, fmt) => {
    const inp = h('input', { type: 'range', id: 'wf-' + key, min, max, step, value: S[key] });
    const out = h('span', { class: 'mono' }, fmt(S[key]));
    inp.addEventListener('input', () => { S[key] = +inp.value; out.textContent = fmt(S[key]); });
    inp.addEventListener('change', runWhatIf);
    inputs[key] = [inp, out, fmt];
    return h('label', { class: 'fl', for: 'wf-' + key }, h('span', { class: 'row', style: 'justify-content:space-between' }, label, out), inp);
  };
  const wk = h('input', { type: 'checkbox', id: 'wf-wk', checked: S.wk });
  wk.addEventListener('change', () => { S.wk = wk.checked; runWhatIf(); });
  function runWhatIf() {
    const f = fcFeat(S.wd, S.ws, S.t, S.hr, S.wk ? 2 : 6), p = knn(f);
    const vals = Object.fromEntries(STN.map((s, j) => [s.code, p[j]]));
    mapBox.innerHTML = ''; mapBox.append(drawMap({ vals, wind: { wd: S.wd, ws: S.ws } }));
    tbl.innerHTML = '';
    const ord = STN.map((s, j) => ({ s, v: p[j] })).sort((a, b) => b.v - a.v);
    tbl.append(barList(ord.map((o, i) => ({ label: `${o.s.code} ${o.s.name}`, value: o.v, display: f1(o.v) + '배', top: i === 0, tip: `${lvl(o.v).t}` })), { max: Math.max(20, ord[0].v) }));
  }
  ctrl.append(
    h('div', { class: 'row' }, presets.map(([n, p]) => h('button', { class: 'chip', type: 'button', onclick: () => { Object.assign(S, p); for (const [k, [inp, out, fmt]] of Object.entries(inputs)) { inp.value = S[k]; out.textContent = fmt(S[k]); } wk.checked = S.wk; runWhatIf(); } }, n))),
    mk('wd', '풍향(불어오는 쪽)', 0, 355, 5, v => `${dirName(v)}풍 ${v}°`), mk('ws', '풍속', 0.3, 8, 0.1, v => `${f1(v)} m/s`),
    mk('t', '기온', -5, 35, 1, v => `${v}℃`), mk('hr', '시각', 0, 23, 1, v => `${v}시`),
    h('label', { class: 'row small', for: 'wf-wk' }, wk, '평일 주간 (도장공장 가동)'));
  // 검증: 여름 사례일 (그날 데이터는 빼고 예측)
  const sday = tparse(FC.scenario.day + ' 00'), skip = Math.floor(sday / (24 * HOUR));
  const i0 = Math.round((sday - fcStart) / HOUR);
  const xs = Array.from({ length: 24 }, (_, k) => sday + k * HOUR);
  const pred = xs.map((ms, k) => predictAt(ms, FC.wd[i0 + k], FC.ws[i0 + k] / 10, FC.t[i0 + k] / 10, skip));
  let vst = 'M2';
  const vchart = h('div');
  const drawV = () => {
    const j = STI[vst];
    vchart.innerHTML = '';
    vchart.append(h('div', { class: 'legend' }, h('span', null, h('i', { style: 'background:var(--data)' }), '실측'), h('span', null, h('i', { style: 'background:var(--data-2)' }), '예측(그날 데이터 제외)')),
      lineChart({ xs, xFmt: 'h', unit: '배', series: [{ name: '실측', color: 'var(--data)', vals: xs.map((_, k) => FC.ou[j][i0 + k] / 10) }, { name: '예측', color: 'var(--data-2)', dash: '6 4', vals: pred.map(p => p[j]) }],
        refs: [{ v: 15, label: '주의 15', color: 'var(--serious)' }], height: 220, tipExtra: k => `${dirName(FC.wd[i0 + k])}풍 ${f1(FC.ws[i0 + k] / 10)} m/s` }));
  };
  sec.append(
    pageHead('04 예측센터', '어디서, 언제 냄새가 날지 미리 알려 드립니다', '과거 1년(8,760시간) 기상과 측정값을 기억해 두고, 예보 기상과 가장 비슷했던 과거 24개 시간의 측정값으로 측정소별 악취를 예측합니다(유사 기상 k-최근접 이웃). 풍향·풍속·기온·시각·평일 여부를 비교합니다.'),
    h('div', { class: 'card stack' },
      h('div', { class: 'card-h' }, h('h3', null, `앞으로 24시간 예보 · ${tf(T.rows[0].ms)} ~ ${tf(T.rows[23].ms)}`), h('span', { class: 'small faint' }, '가상 기상예보 입력')),
      h('div', { class: 'answer' }, '가장 높은 예보는 ', h('b', null, `${STN[b.j].code} ${STN[b.j].name}, ${tf(T.rows[b.i].ms)} ${f1(b.v)}배(${lvl(b.v).t})`), '입니다. ', b.v >= 15 ? '해당 시간대 방지시설 가동률을 높이고 현장 순찰을 권고합니다.' : '주의 단계 이상 예보는 없습니다. 북서풍 계절이라 공단 냄새가 바다 쪽으로 빠지는 날이 많습니다.'),
      h('div', { style: 'overflow-x:auto' }, h('div', { style: 'min-width:720px' }, heat)),
      h('div', { class: 'row small muted' }, '칸 색:', lvTag(5), lvTag(12), lvTag(20), lvTag(35), '· 숫자는 복합악취 희석배수 환산값')),
    h('div', { class: 'split' },
      h('div', { class: 'card stack' }, h('h3', null, '기상 조건을 바꿔 보기'), ctrl, h('h4', null, '측정소별 예측'), tbl),
      h('div', { class: 'card' }, h('h3', null, '예측 지도'), mapBox)),
    h('div', { class: 'card stack' },
      h('div', { class: 'card-h' }, h('h3', null, `예보 검증 · ${FC.scenario.day} 여름 고농도일`), seg(STN.map(s => [s.code, s.code]), vst, v => { vst = v; drawV(); }, '측정소 선택')),
      h('p', { class: 'small muted' }, '이 날의 데이터를 모델에서 빼고 예측해 실제와 겹쳐 본 결과입니다. 아래 표는 학습에 쓰지 않은 최근 61일 전체에 대한 성능입니다.'),
      vchart,
      h('div', { class: 'tbl-wrap' }, h('table', null,
        h('thead', null, h('tr', null, h('th', null, '측정소'), h('th', { class: 'r' }, '평균오차 · AI'), h('th', { class: 'r' }, '평균오차 · 시간대 평균'), h('th', { class: 'r' }, '오차 감소'), h('th', { class: 'r' }, '상관계수 r'))),
        h('tbody', null, STN.map((s, j) => h('tr', null, h('td', null, `${s.code} ${s.name}`), h('td', { class: 'r mono' }, FC.mae[j].toFixed(2) + '배'), h('td', { class: 'r mono' }, FC.mae_base[j].toFixed(2) + '배'), h('td', { class: 'r mono' }, pct(1 - FC.mae[j] / FC.mae_base[j])), h('td', { class: 'r mono' }, FC.r[j].toFixed(2))))))),
      h('p', { class: 'small muted' }, `주의(15배 이상) 시간 포착률 ${pct(FC.hit)} · 예보가 12배 이상일 때 실제로는 10배 미만이었던 비율 ${pct(FC.far)}. 돌발 공정 사고처럼 기상과 무관한 고농도는 예보할 수 없어서, 관리센터의 실시간 감시와 함께 씁니다.`)));
  runWhatIf(); drawV();
};

/* ================= 05 관리센터 ================= */
function episodes() {
  const out = [];
  STN.forEach(st => {
    const ou = MON.st[st.code].ou; let s = -1;
    for (let i = 0; i <= MN; i++) {
      const on = i < MN && ou[i] >= 15;
      if (on && s < 0) s = i;
      if (!on && s >= 0) { let pk = s; for (let k = s; k < i; k++) if (ou[k] > ou[pk]) pk = k; out.push({ st: st.code, a: s, b: i - 1, pk, v: ou[pk] }); s = -1; }
    }
  });
  return out.sort((x, y) => y.pk - x.pk);
}
APP.pages.monitoring = sec => {
  const EP = episodes();
  const M = { st: APP.monSel || (EP[0] ? EP[0].st : 'M3'), ch: 'ou', ep: APP.monSel ? EP.find(e => e.st === APP.monSel) || null : EP[0] || null };
  APP.monSel = null;
  const tiles = h('div', { class: 'tiles' }), chartBox = h('div', { class: 'card stack' }), mapBox = h('div', { class: 'card stack' }), alertBox = h('div', { class: 'card stack' }), btBox = h('div', { class: 'card stack' });
  sec.append(pageHead('05 관리센터', '측정소 6곳을 24시간 지켜보고, 냄새가 나면 출처를 거꾸로 찾습니다', '복합악취·황화수소·TVOC·암모니아 센서와 풍향풍속계 값을 받아 단계별로 경보합니다. 경보가 뜨면 바람이 불어온 방향과 센서 성분 비율(센서 지문)을 업종별 배출 특성과 비교해 원인 사업장 후보를 순위로 보여 줍니다.'),
    tiles, h('div', { class: 'grid2', style: 'grid-template-columns:minmax(0,7fr) minmax(0,5fr);align-items:start' }, mapBox, btBox), h('div', { class: 'grid2', style: 'grid-template-columns:minmax(0,5fr) minmax(0,7fr);align-items:start' }, alertBox, chartBox));
  const CH = { ou: ['복합악취', '배'], h2s: ['황화수소', 'ppb'], tvoc: ['TVOC', 'ppb'], nh3: ['암모니아', 'ppb'] };
  const draw = () => {
    tiles.innerHTML = '';
    STN.forEach(st => { const v = MON.st[st.code].ou[nowIdx]; tiles.append(h('button', { class: 'tile' + (st.code === M.st ? ' on' : ''), type: 'button', onclick: () => { M.st = st.code; M.ep = EP.find(e => e.st === st.code) || null; draw(); } },
      h('span', { class: 'row', style: 'justify-content:space-between' }, h('span', { class: 'small' }, h('b', null, st.code), ' ', st.name), lvTag(v)), h('span', { class: 'tv' }, f1(v), h('small', null, ' 배')), sparkline(MON.st[st.code].ou.slice(-48)))); });
    const ti = M.ep ? M.ep.pk : nowIdx;
    const vals = Object.fromEntries(STN.map(s => [s.code, MON.st[s.code].ou[ti]]));
    const bt = M.ep ? backtrack(STN[STI[M.ep.st]], MON.wd[ti], ['h2s', 'tvoc', 'nh3'].map(c => MON.st[M.ep.st][c][ti])) : null;
    mapBox.innerHTML = '';
    mapBox.append(h('div', { class: 'card-h' }, h('h3', null, M.ep ? '경보 시점 지도' : '현재 지도'), h('span', { class: 'small mono faint' }, tf(monT(ti), 'full'))),
      drawMap({ vals, wind: { wd: MON.wd[ti], ws: MON.ws[ti] }, sel: M.st, onSt: c => { M.st = c; M.ep = EP.find(e => e.st === c) || null; draw(); }, ray: M.ep ? { st: M.ep.st, wd: MON.wd[ti] } : null, hl: bt ? bt.slice(0, 2).map(x => x.s.code) : null }));
    const st = STN[STI[M.st]], arr = MON.st[M.st][M.ch], xs = Array.from({ length: MN }, (_, i) => monT(i));
    chartBox.innerHTML = '';
    chartBox.append(h('div', { class: 'card-h' }, h('h3', null, `${st.code} ${st.name} · 최근 14일`), seg(Object.entries(CH).map(([k, v]) => [k, v[0]]), M.ch, v => { M.ch = v; draw(); }, '측정 항목')),
      lineChart({ xs, unit: CH[M.ch][1], series: [{ name: CH[M.ch][0], color: 'var(--data)', vals: arr, area: true }],
        refs: M.ch === 'ou' ? [{ v: 10, label: '관심 10', color: 'var(--warn)' }, { v: 15, label: '주의 15', color: 'var(--serious)' }, { v: 30, label: '경보 30', color: 'var(--critical)' }] : [],
        marks: EP.filter(e => e.st === M.st).map(e => ({ a: e.a, b: e.b + 1 })), height: 240, tipExtra: i => `${dirName(MON.wd[i])}풍 ${f1(MON.ws[i])} m/s · ${f1(MON.t[i])}℃` }),
      h('p', { class: 'small muted' }, `노란 띠는 주의(15배) 이상이 이어진 구간입니다. 단위: ${CH[M.ch][1]}.`));
    alertBox.innerHTML = '';
    alertBox.append(h('div', { class: 'card-h' }, h('h3', null, '최근 14일 경보 이력'), h('span', { class: 'small faint' }, `${EP.length}건 · 주의 15배 이상 지속 구간`)),
      EP.length ? h('div', { class: 'alerts' }, EP.map(e => h('button', { class: 'al' + (M.ep === e ? ' on' : ''), type: 'button', onclick: () => { M.ep = e; M.st = e.st; draw(); } },
        lvTag(e.v), h('span', { class: 'small' }, h('b', null, e.st), ` ${STN[STI[e.st]].name} · ${tf(monT(e.a))}${e.b > e.a ? ` ~ ${new Date(monT(e.b)).getUTCHours()}시` : ''}`), h('span', { class: 'mono small' }, f1(e.v) + '배'))))
        : h('p', { class: 'muted' }, '최근 14일 동안 주의 단계 이상이 없었습니다.'));
    btBox.innerHTML = '';
    if (!bt) { btBox.append(h('h3', null, '원인 역추적'), h('p', { class: 'muted' }, '경보 이력을 고르면 원인 사업장 후보를 보여 줍니다.')); return; }
    const truth = SITES[D.bt.truth14[M.ep.st][ti]];
    const chv = ['h2s', 'tvoc', 'nh3'].map(c => MON.st[M.ep.st][c][ti]);
    btBox.append(h('div', { class: 'card-h' }, h('h3', null, '원인 역추적'), h('span', { class: 'small mono faint' }, `${M.ep.st} · ${tf(monT(ti))}`)),
      h('div', { class: 'answer' }, `${dirName(MON.wd[ti])}풍 ${f1(MON.ws[ti])} m/s, 센서 H₂S ${f1(chv[0])} · TVOC ${Math.round(chv[1])} · NH₃ ${Math.round(chv[2])} ppb → 1순위 후보 `, h('b', null, bt[0].s.name), ` (${CLSN[bt[0].s.cls]})`),
      barList(bt.slice(0, 5).map((x, i) => ({ label: x.s.name, value: x.share, display: pct(x.share), top: i === 0,
        tip: `${esc(x.s.name)}<br>바람 방향과 ${Math.abs(Math.round(x.dl))}° 차이 · ${x.rr.toFixed(1)} km<br>센서 지문 일치 ${pct(Math.max(0, x.cs))}` })), { max: 1 }),
      h('div', { class: 'note' }, '가상 데이터라 정답을 알 수 있습니다: 이 시각 실제 최대 기여 사업장은 ', h('b', null, truth.name), bt[0].s.code === truth.code ? ' — 1순위 일치' : bt[1].s.code === truth.code ? ' — 2순위 일치' : ' — 후보 순위와 다름', `. 최근 61일 시험에서 1순위 적중 ${pct(D.bt.top1)}, 2순위 이내 ${pct(D.bt.top2)}.`),
      h('div', { class: 'row' }, h('button', { class: 'btn pri', type: 'button', onclick: () => { const r = [...REC].reverse().find(x => x.s === bt[0].s.code && x.p === '부지경계선'); APP.diagLoad = r.id; nav('diagnosis'); } }, `${bt[0].s.name[0]} 사업장 최근 시료 진단`)));
  };
  APP.upd.monitoring = () => { if (APP.monSel) { M.st = APP.monSel; M.ep = EP.find(e => e.st === APP.monSel) || null; APP.monSel = null; draw(); } };
  draw();
};

/* ================= 전자차트 ================= */
const SITE_AL = { S01: ['공공하수', '하수처리', '하수'], S02: ['음식물류', '음식물', '자원화'], S03: ['석유화학'], S04: ['도장공장', '도장', '인쇄', '페인트'], S05: ['사료제조', '사료', '식품'], S06: ['양돈농가', '양돈', '축산', '돼지', '농가'], S07: ['폐수처리업체', '폐수'], S08: ['합성수지', '수지'] };
const CMP_AL = {
  IVA: ['i-발레르알데하이드', 'i발레르알데하이드', '이소발레르알데하이드', '아이소발레르알데하이드'], NVA: ['n-발레르알데하이드', '발레르알데하이드', '발레르알데히드'],
  IVAL: ['i-발레르산', 'i발레르산', '이소발레르산', '아이소발레르산'], NVAL: ['n-발레르산', '발레르산'],
  DMDS: ['다이메틸다이설파이드', '디메틸디설파이드', '이황화메틸', 'dmds'], DMS: ['다이메틸설파이드', '디메틸설파이드', '황화메틸', 'dms'],
  MM: ['메틸메르캅탄', '메틸머캅탄', '메르캅탄', '머캅탄'], H2S: ['황화수소', 'h2s', '달걀', '계란'], NH3: ['암모니아', 'nh3'],
  TMA: ['트라이메틸아민', '트리메틸아민', 'tma', '비린내'], ACA: ['아세트알데하이드', '아세트알데히드'], STY: ['스타이렌', '스티렌'],
  PA: ['프로피온알데하이드', '프로피온알데히드'], BA: ['뷰틸알데하이드', '부틸알데하이드', '뷰티르알데하이드', '부틸알데히드'],
  TOL: ['톨루엔'], XYL: ['자일렌', '크실렌'], MIBK: ['메틸아이소뷰틸케톤', '메틸이소부틸케톤', 'mibk'], MEK: ['메틸에틸케톤', 'mek'],
  BAC: ['뷰틸아세테이트', '부틸아세테이트', '초산부틸'], PRA: ['프로피온산'], NBA: ['n-뷰틸산', '뷰틸산', '부티르산', '뷰티르산', '부틸산', '낙산'],
  IBA: ['i-뷰틸알코올', '이소부탄올', '이소부틸알코올', '뷰틸알코올', '부틸알코올'], DIL: ['복합악취', '희석배수', '냄새 세기', '악취 세기'],
};
function parseQ(q0) {
  let q = ' ' + q0.toLowerCase() + ' ';
  const P = { sites: [], cmps: [], point: null, kind: null, years: null, months: null, since: null, op: null, cond: null, exceed: false, chips: [] };
  const take = (re, fn) => { q = q.replace(re, (...m) => { fn(...m); return ' '; }); };
  // 수치 조건 (먼저 처리해 '초과'를 소비)
  take(/(\d+(?:\.\d+)?)\s*(ppm|ppb|배)?\s*(이상|초과|넘는|넘은|넘|보다\s*높은|이하|미만|보다\s*낮은)/, (m, v, u, w) => {
    let x = +v; if (u === 'ppb') x /= 1000;
    P.cond = { v: x, op: /이하|미만|낮/.test(w) ? (w === '미만' ? 'lt' : 'le') : (w === '이상' ? 'ge' : 'gt'), unit: u || '' };
  });
  Object.entries(CMP_AL).forEach(([id, al]) => al.slice().sort((a, b) => b.length - a.length).forEach(a => { if (q.includes(a)) { if (!P.cmps.includes(id)) P.cmps.push(id); q = q.split(a).join(' '); } }));
  Object.entries(SITE_AL).forEach(([code, al]) => al.forEach(a => { if (q.includes(a)) { if (!P.sites.includes(code)) P.sites.push(code); q = q.split(a).join(' '); } }));
  take(/(?:^|[^a-z0-9])([a-h])(?=\s*[가-힣]|\s)/g, (m, L) => { const s = SITES.find(x => x.name[0].toLowerCase() === L); if (s && !P.sites.includes(s.code)) P.sites.push(s.code); });
  if (/재작년/.test(q)) { P.years = [2024]; q = q.replace(/재작년/g, ' '); }
  if (/작년|지난\s*해/.test(q)) { P.years = [2025]; q = q.replace(/작년|지난\s*해/g, ' '); }
  if (/올해|금년|올\s/.test(q)) P.years = [2026];
  take(/(20\d{2})\s*년?/g, (m, y) => { P.years = [...(P.years || []).filter(v => v !== +y), +y]; });
  take(/(\d{1,2})\s*월/g, (m, mo) => { if (+mo >= 1 && +mo <= 12) P.months = [...(P.months || []), +mo]; });
  const SEA = { 봄: [3, 4, 5], 여름: [6, 7, 8], 가을: [9, 10, 11], 겨울: [12, 1, 2], 상반기: [1, 2, 3, 4, 5, 6], 하반기: [7, 8, 9, 10, 11, 12] };
  Object.entries(SEA).forEach(([k, v]) => { if (q.includes(k)) { P.months = [...(P.months || []), ...v]; P.season = k; } });
  take(/최근\s*(\d+)\s*(개월|달)/, (m, n) => { P.since = NOW - (+n) * 30 * 24 * HOUR; P.sinceN = +n; });
  if (/배출구|굴뚝|스택/.test(q)) P.point = '배출구'; else if (/부지\s*경계|경계선|경계/.test(q)) P.point = '부지경계선';
  if (/민원/.test(q)) P.kind = '민원'; else if (/정기/.test(q)) P.kind = '정기';
  if (/초과|넘은|넘었|넘는|위반/.test(q)) P.exceed = true;
  if (/가장\s*높|제일\s*높|최고|최대|가장\s*심|제일\s*심|가장\s*많|제일\s*많/.test(q)) P.op = 'max';
  else if (/가장\s*낮|제일\s*낮|최저|최소/.test(q)) P.op = 'min';
  else if (/평균/.test(q)) P.op = 'mean';
  else if (/몇\s*(건|번|회|개)|건수|횟수|얼마나\s*자주/.test(q)) P.op = 'count';
  else if (/추이|변화|그래프|추세|트렌드|흐름/.test(q)) P.op = 'trend';
  P.measure = P.cmps.find(c => c !== 'DIL') || 'DIL';
  return P;
}
const mval = (r, m) => m === 'DIL' ? r.dil : r.c[CI[m]];
const mname = m => m === 'DIL' ? '복합악취' : CMP[CI[m]].kr;
const munit = m => m === 'DIL' ? '배' : 'ppm';
const fmtM = (v, m) => m === 'DIL' ? `${v}배` : `${fc(v)} ppm`;
function isEx(r, m) { const z = SITE[r.s].zone; return m === 'DIL' ? r.dil > STD_DIL[r.p][z] : (r.p === '부지경계선' && r.c[CI[m]] > limitOf(CI[m], z)); }
function runQuery(P) {
  let rows = REC.slice(); const m = P.measure, notes = [];
  if (P.sites.length) rows = rows.filter(r => P.sites.includes(r.s));
  if (P.point) rows = rows.filter(r => r.p === P.point);
  if (P.kind) rows = rows.filter(r => r.k === P.kind);
  if (P.years) rows = rows.filter(r => P.years.includes(new Date(r.ms).getUTCFullYear()));
  if (P.months) rows = rows.filter(r => P.months.includes(new Date(r.ms).getUTCMonth() + 1));
  if (P.since) rows = rows.filter(r => r.ms >= P.since);
  if (P.exceed) { if (m !== 'DIL' && !P.point) { rows = rows.filter(r => r.p === '부지경계선'); notes.push('지정악취물질 기준은 부지경계선 시료에만 적용'); } rows = rows.filter(r => isEx(r, m)); }
  if (P.cond) { const c = P.cond; rows = rows.filter(r => { const v = mval(r, m); return c.op === 'ge' ? v >= c.v : c.op === 'gt' ? v > c.v : c.op === 'le' ? v <= c.v : v < c.v; }); }
  return { rows, notes };
}
APP.pages.records = sec => {
  const examples = ['작년 여름 A 하수처리장 황화수소 가장 높았던 날', '2026년 부지경계선 복합악취 기준 초과', '양돈농가 뷰틸산 평균', '톨루엔 1ppm 이상 배출구 시료', '최근 6개월 민원 측정 몇 건', '음식물 시설 트라이메틸아민 추이'];
  const inp = h('input', { type: 'text', id: 'q', value: examples[0], 'aria-label': '전자차트 질문', placeholder: '예: 작년 7월 사료공장 i-발레르알데하이드 최고값' });
  const out = h('div', { class: 'stack' }), upOut = h('div', { class: 'stack' });
  const FILES = [];
  const fileList = h('div', { class: 'stack small' });
  const run = () => { renderAnswer(out, inp.value); renderUploadAnswer(upOut, inp.value, FILES); };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  const fileIn = h('input', { type: 'file', id: 'up-file', multiple: true, accept: '.xlsx,.xls,.csv', style: 'display:none' });
  const drop = h('div', { class: 'drop', role: 'button', tabindex: 0, onclick: () => fileIn.click(), onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileIn.click(); } } },
    h('b', null, '엑셀·CSV 파일을 여기에 끌어다 놓거나 눌러서 선택'), h('br'), h('span', { class: 'small' }, '여러 파일, 여러 시트를 한꺼번에 올릴 수 있습니다. 파일은 이 브라우저 안에서만 읽고 어디에도 전송하지 않습니다.'));
  const handle = async files => {
    for (const f of files) {
      try { const sheets = await readSheet(f); sheets.forEach(s => FILES.push(s)); }
      catch (err) { fileList.append(h('p', { class: 'ex' }, `${f.name}: 읽지 못했습니다 — ${err.message}`)); }
    }
    fileList.innerHTML = '';
    FILES.forEach(s => fileList.append(h('div', { class: 'row' }, h('span', { class: 'tag' }, s.file), h('span', { class: 'muted' }, `${s.sheet} · ${s.rows.length}행 · 열 ${s.headers.length}개 (${s.headers.slice(0, 5).join(', ')}${s.headers.length > 5 ? '…' : ''})`))));
    run();
  };
  fileIn.addEventListener('change', () => handle([...fileIn.files]));
  ['dragover', 'dragenter'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', e => handle([...e.dataTransfer.files]));
  sec.append(pageHead('전자차트', '분석 기록을 말로 찾습니다', `사업장 8곳의 분석 기록 ${REC.length}건(정기·민원 측정, 배출구·부지경계선)에서 사업장, 물질, 기간, 조건을 문장으로 물으면 바로 찾아 답합니다. 실험 엑셀 파일을 올리면 같은 질문으로 파일 속 데이터도 함께 찾아 줍니다.`),
    h('div', { class: 'card stack' },
      h('div', { class: 'row', style: 'flex-wrap:nowrap' }, inp, h('button', { class: 'btn pri', type: 'button', onclick: run }, '찾기')),
      h('div', { class: 'row' }, examples.map(x => h('button', { class: 'chip', type: 'button', onclick: () => { inp.value = x; run(); } }, x)))),
    out,
    h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h3', null, '내 실험 파일 함께 검색'), h('span', { class: 'small faint' }, 'xlsx · xls · csv')), drop, fileIn, fileList, upOut,
      h('p', { class: 'small faint' }, '열 이름에 물질명(예: 황화수소, H2S, 톨루엔)이 있으면 그 열에서 최고·최저·평균을 계산하고, 사업장명·날짜 같은 나머지 단어는 행 안의 글자로 찾습니다.')));
  run();
};
function renderAnswer(out, q) {
  const P = parseQ(q), { rows, notes } = runQuery(P), m = P.measure;
  out.innerHTML = '';
  const chips = [];
  if (P.sites.length) chips.push(['사업장', P.sites.map(c => SITE[c].name).join(', ')]);
  chips.push(['측정 항목', mname(m) + (P.cmps.length > 1 ? ` (외 ${P.cmps.length - 1}개는 표에 표시)` : '')]);
  if (P.years) chips.push(['연도', P.years.join(', ')]);
  if (P.months) chips.push(P.season ? ['시기', P.season] : ['월', P.months.join(', ') + '월']);
  if (P.since) chips.push(['기간', `최근 ${P.sinceN}개월`]);
  if (P.point) chips.push(['지점', P.point]);
  if (P.kind) chips.push(['측정 구분', P.kind]);
  if (P.exceed) chips.push(['조건', '기준 초과']);
  if (P.cond) chips.push(['조건', `${mname(m)} ${P.cond.v}${P.cond.unit || munit(m)} ${{ ge: '이상', gt: '초과', le: '이하', lt: '미만' }[P.cond.op]}`]);
  chips.push(['찾는 것', { max: '최고값', min: '최저값', mean: '평균', count: '건수', trend: '추이' }[P.op] || '목록']);
  let ans, hl = null, sorted = rows.slice().sort((a, b) => b.ms - a.ms);
  const det = rows.filter(r => mval(r, m) > 0);
  const where = r => `${SITE[r.s].name} ${r.p}`;
  if (!rows.length) ans = '조건에 맞는 기록이 없습니다. 기간이나 사업장 조건을 줄여 보세요.';
  else if (P.op === 'max' || P.op === 'min') {
    if (!det.length) ans = `${rows.length}건 모두 ${mname(m)}이(가) 검출한계 미만(ND)입니다.`;
    else {
      const r = det.reduce((a, b) => (P.op === 'max' ? mval(b, m) > mval(a, m) : mval(b, m) < mval(a, m)) ? b : a); hl = r.id;
      sorted = det.slice().sort((a, b) => P.op === 'max' ? mval(b, m) - mval(a, m) : mval(a, m) - mval(b, m));
      ans = h('span', null, h('b', null, `${r.ts.slice(0, 10)} ${r.ts.slice(11, 13)}시, ${where(r)}`), `에서 ${mname(m)} `, h('b', { class: 'mono' }, fmtM(mval(r, m), m)), `${m === 'DIL' ? '로' : '으로'} ${P.op === 'max' ? '가장 높았습니다' : '가장 낮았습니다'}. (시료 ${r.id}, 당시 ${dirName(r.wd)}풍 ${r.ws} m/s · ${r.t}℃, 비교 대상 ${det.length}건)`);
    }
  } else if (P.op === 'mean') {
    const vs = det.map(r => mval(r, m));
    ans = det.length ? h('span', null, `${mname(m)} 평균 `, h('b', { class: 'mono' }, fmtM(+(sum(vs) / vs.length).toPrecision(3), m)), ` — 검출 ${det.length}건 기준${rows.length > det.length ? `, ND ${rows.length - det.length}건 제외` : ''}. 최고 ${fmtM(Math.max(...vs), m)}, 최저 ${fmtM(Math.min(...vs), m)}.`) : '검출된 기록이 없습니다.';
  } else if (P.op === 'count') {
    ans = h('span', null, '조건에 맞는 기록은 ', h('b', { class: 'mono' }, `${rows.length}건`), `입니다. (사업장 ${new Set(rows.map(r => r.s)).size}곳)`);
  } else {
    const ex = rows.filter(r => isEx(r, m)).length;
    ans = h('span', null, h('b', { class: 'mono' }, `${rows.length}건`), '을 찾았습니다.', P.exceed ? '' : ` 이 중 ${mname(m)} 기준 초과는 ${ex}건입니다.`);
  }
  const showCols = [...new Set([m, ...P.cmps.filter(c => c !== 'DIL')])].slice(0, 3);
  const detail = h('div');
  const table = h('div', { class: 'tbl-wrap scroll' }, h('table', null,
    h('thead', null, h('tr', null, h('th', null, '시료번호'), h('th', null, '일시'), h('th', null, '사업장'), h('th', null, '구분'), h('th', null, '지점'), showCols.map(c => h('th', { class: 'r' }, `${mname(c)}${c === 'DIL' ? '' : ' (ppm)'}`)), m !== 'DIL' ? h('th', { class: 'r' }, '복합악취') : null, h('th', null, '주요 물질'))),
    h('tbody', null, sorted.slice(0, 200).map(r => {
      const topI = r.oav.indexOf(Math.max(...r.oav));
      const tr = h('tr', { class: 'click' + (r.id === hl ? ' hit' : '') },
        h('td', { class: 'mono' }, r.id), h('td', { class: 'mono' }, r.ts), h('td', null, SITE[r.s].name), h('td', null, r.k), h('td', null, r.p),
        showCols.map(c => h('td', { class: 'r mono' + (isEx(r, c) ? ' ex' : '') }, c === 'DIL' ? r.dil : fc(mval(r, c)))),
        m !== 'DIL' ? h('td', { class: 'r mono' + (isEx(r, 'DIL') ? ' ex' : '') }, r.dil) : null, h('td', null, CMP[topI].kr));
      tr.addEventListener('click', () => { $$('tr.sel', table).forEach(x => x.classList.remove('sel')); tr.classList.add('sel'); showRec(detail, r); });
      return tr;
    }))));
  let chart = null;
  if ((P.op === 'trend' || P.op === 'mean') && det.length > 2) chart = timeScatter(det, m);
  out.append(h('div', { class: 'card stack' },
    h('div', { class: 'parsed', 'aria-label': '질문 해석' }, chips.map(([k, v]) => h('span', null, h('b', null, k), v))),
    h('div', { class: 'answer' }, ans), notes.length ? h('p', { class: 'small muted' }, '※ ' + notes.join(' · ')) : null,
    chart, rows.length ? table : null, rows.length > 200 ? h('p', { class: 'small faint' }, `앞의 200건만 표시했습니다 (전체 ${rows.length}건).`) : null,
    rows.length ? h('p', { class: 'small faint' }, '빨간 값은 기준 초과입니다. 행을 누르면 22종 전체 분석값을 볼 수 있습니다.') : null, detail));
  if (hl) showRec(detail, RECI[hl]);
}
function showRec(box, r) {
  box.innerHTML = '';
  box.append(h('div', { class: 'card stack', style: 'background:var(--surface-2)' },
    h('div', { class: 'card-h' }, h('h3', null, `${r.id} · ${SITE[r.s].name} · ${r.p}`), h('div', { class: 'row' },
      h('button', { class: 'btn sm', type: 'button', onclick: () => { APP.diagLoad = r.id; nav('diagnosis'); } }, '진단센터에서 열기'),
      h('button', { class: 'btn sm', type: 'button', onclick: async e => { const txt = ['물질\t농도(ppm)'].concat(CMP.map((c, i) => `${c.kr}\t${r.c[i] || 'ND'}`)).join('\n'); try { await navigator.clipboard.writeText(txt); e.target.textContent = '복사됨'; } catch { e.target.textContent = '복사 안 됨'; } } }, '표 복사'))),
    h('p', { class: 'small muted' }, `${r.ts} · ${r.k} 측정 · ${dirName(r.wd)}풍 ${r.ws} m/s · ${r.t}℃ · 습도 ${r.rh}% · 복합악취 ${r.dil}배 · ${r.an}`),
    h('div', { style: 'display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:4px 14px', class: 'small' },
      CMP.map((c, i) => h('div', { class: 'row', style: 'justify-content:space-between;flex-wrap:nowrap;border-bottom:1px solid var(--line);padding:2px 0' }, h('span', null, c.kr), h('span', { class: 'mono' + (isEx(r, c.id) ? ' ex' : '') }, fc(r.c[i])))))));
}
function timeScatter(rows, m) {
  const W = 760, H = 220, L = 46, R = 12, T = 12, B = 26;
  const t0 = tparse('2024-11-01 00'), t1 = tparse('2026-11-01 00');
  const vmax = Math.max(...rows.map(r => mval(r, m))) * 1.1;
  const x = t => L + (W - L - R) * (t - t0) / (t1 - t0), y = v => T + (H - T - B) * (1 - v / vmax);
  const svg = sv('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}` });
  [0, 0.25, 0.5, 0.75, 1].forEach(f => { const v = vmax / 1.1 * f; svg.append(sv('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }), sv('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, m === 'DIL' ? Math.round(v) : fc(v))); });
  for (let yy = 2025; yy <= 2026; yy++) [1, 7].forEach(mo => { const t = Date.UTC(yy, mo - 1, 1); svg.append(sv('line', { class: 'ax', x1: x(t), x2: x(t), y1: H - B, y2: H - B + 4 }), sv('text', { x: x(t), y: H - 8, 'text-anchor': 'middle' }, `${yy}.${mo}`)); });
  svg.append(sv('line', { class: 'ax', x1: L, x2: W - R, y1: H - B, y2: H - B }));
  rows.forEach(r => svg.append(sv('circle', { cx: x(r.ms), cy: y(mval(r, m)), r: 4.5, fill: r.p === '배출구' ? 'var(--data)' : 'var(--data-2)', stroke: 'var(--surface)', 'stroke-width': 1.5,
    onmousemove: e => showTip(e, `${r.ts}<br>${esc(SITE[r.s].name)} · ${r.p}<br>${mname(m)} <b>${fmtM(mval(r, m), m)}</b>`), onmouseleave: hideTip })));
  return h('div', null, h('div', { class: 'legend' }, h('span', null, h('i', { style: 'background:var(--data);height:8px;width:8px;border-radius:50%' }), '배출구'), h('span', null, h('i', { style: 'background:var(--data-2);height:8px;width:8px;border-radius:50%' }), '부지경계선')), svg);
}
/* 업로드 파일 */
function parseCSV(text) {
  const rows = []; let row = [], cur = '', q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) { if (ch === '"') { if (text[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += ch; }
    else if (ch === '"') q = true; else if (ch === ',') { row.push(cur); cur = ''; } else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (ch !== '\r') cur += ch;
  }
  if (cur || row.length) { row.push(cur); rows.push(row); }
  return rows;
}
async function readSheet(f) {
  const toSheet = (name, aoa) => {
    const hi = aoa.findIndex(r => r.filter(c => String(c ?? '').trim()).length >= 2);
    if (hi < 0) return null;
    const headers = aoa[hi].map((c, k) => String(c ?? '').trim() || `열${k + 1}`);
    return { file: f.name, sheet: name, headers, rows: aoa.slice(hi + 1).map((cells, k) => ({ n: hi + k + 2, cells: cells.map(c => c ?? '') })).filter(r => r.cells.some(c => String(c).trim())) };
  };
  if (/\.csv$/i.test(f.name)) return [toSheet('CSV', parseCSV(await f.text()))].filter(Boolean);
  if (!window.XLSX) throw new Error('엑셀 해석 라이브러리를 불러오지 못했습니다. CSV로 저장해 올려 주세요.');
  const wb = XLSX.read(await f.arrayBuffer(), { type: 'array', cellDates: true });
  return wb.SheetNames.map(n => toSheet(n, XLSX.utils.sheet_to_json(wb.Sheets[n], { header: 1, raw: true, defval: '' }))).filter(Boolean);
}
function renderUploadAnswer(box, q, FILES) {
  box.innerHTML = '';
  if (!FILES.length) return;
  const P = parseQ(q);
  const words = q.toLowerCase().replace(/[?.!,]/g, ' ').split(/\s+/).filter(w => w.length >= 2);
  const alias = id => (CMP_AL[id] || []).concat(id === 'DIL' ? [] : [CMP[CI[id]].kr.toLowerCase(), CMP[CI[id]].en.toLowerCase(), id.toLowerCase()]);
  const stop = /^(가장|제일|높|낮|최고|최대|최저|최소|평균|몇|건|추이|변화|언제|날|있|었|찾아|보여|알려|기록|데이터|시료|값|중|에서|의|은|는|이|가)/;
  const out = [];
  FILES.forEach(S => {
    const hdr = S.headers.map(x => x.toLowerCase());
    const colOf = id => hdr.findIndex(hh => alias(id).some(a => a && hh.includes(a)));
    const col = P.cmps.map(colOf).find(k => k >= 0) ?? -1;
    const mentioned = new Set();
    P.cmps.forEach(id => alias(id).forEach(a => words.forEach(w => { if (w.includes(a)) mentioned.add(w); })));
    const tokens = words.filter(w => !stop.test(w) && !mentioned.has(w) && !/^\d+(\.\d+)?(ppm|ppb|배)?$/.test(w) && !/(년|월|작년|올해|여름|겨울|봄|가을|최근|이상|이하|초과|미만)$/.test(w) && !hdr.some(hh => hh && hh.includes(w)));
    let rows = S.rows.filter(r => { const txt = r.cells.map(c => c instanceof Date ? c.toISOString().slice(0, 10) : String(c)).join(' ').toLowerCase(); return tokens.every(t => txt.includes(t.replace(/(에서|의|은|는|이|가|을|를)$/, ''))); });
    if (P.years || P.months) rows = rows.filter(r => r.cells.some(c => { const s = c instanceof Date ? c.toISOString().slice(0, 10) : String(c); const mt = s.match(/(20\d{2})[-./년\s]*(\d{1,2})/); if (!mt) return false; return (!P.years || P.years.includes(+mt[1])) && (!P.months || P.months.includes(+mt[2])); }));
    if (col >= 0 && P.cond) rows = rows.filter(r => { const v = parseFloat(r.cells[col]); const c = P.cond; return !isNaN(v) && (c.op === 'ge' ? v >= c.v : c.op === 'gt' ? v > c.v : c.op === 'le' ? v <= c.v : v < c.v); });
    out.push({ S, col, rows });
  });
  const total = sum(out.map(o => o.rows.length));
  let ans = `올린 파일 ${FILES.length}개 시트에서 ${total}행을 찾았습니다.`, best = null;
  const withCol = out.filter(o => o.col >= 0);
  if ((P.op === 'max' || P.op === 'min' || P.op === 'mean') && withCol.length) {
    const vals = withCol.flatMap(o => o.rows.map(r => ({ o, r, v: parseFloat(r.cells[o.col]) }))).filter(x => !isNaN(x.v));
    if (vals.length) {
      if (P.op === 'mean') ans = `${withCol.map(o => o.S.headers[o.col]).join(', ')} 열 평균 ${(sum(vals.map(x => x.v)) / vals.length).toPrecision(4)} (숫자 ${vals.length}개)`;
      else { best = vals.reduce((a, b) => (P.op === 'max' ? b.v > a.v : b.v < a.v) ? b : a); ans = `${best.o.S.file} › ${best.o.S.sheet} › ${best.r.n}행: ${best.o.S.headers[best.o.col]} = ${best.v} 으로 ${P.op === 'max' ? '가장 높습니다' : '가장 낮습니다'}.`; }
    }
  } else if (P.cmps.length && !withCol.length) ans += ' (질문한 물질 이름이 열 제목에서 보이지 않아 글자로만 찾았습니다.)';
  box.append(h('div', { class: 'answer' }, ans),
    out.filter(o => o.rows.length).map(o => h('div', { class: 'stack' }, h('h4', null, `${o.S.file} › ${o.S.sheet} — ${o.rows.length}행`),
      h('div', { class: 'tbl-wrap scroll', style: 'max-height:260px' }, h('table', null,
        h('thead', null, h('tr', null, h('th', null, '행'), o.S.headers.map((x, k) => h('th', { style: k === o.col ? 'color:var(--accent)' : null }, x)))),
        h('tbody', null, o.rows.slice(0, 100).map(r => h('tr', { class: best && best.r === r ? 'hit' : null }, h('td', { class: 'mono' }, r.n), o.S.headers.map((_, k) => { const c = r.cells[k]; return h('td', { class: typeof c === 'number' ? 'r mono' : null }, c instanceof Date ? c.toISOString().slice(0, 10) : String(c ?? '')); })))))))));
}

/* ================= 데이터 검증 ================= */
APP.pages.data = sec => {
  const V = D.validation, ok = V.filter(v => v.ok).length;
  sec.append(pageHead('데이터 검증', '가상 데이터를 어떻게 만들고 무엇으로 확인했는지', '실제 고객 데이터를 쓸 수 없어, 법정 기준과 문헌 값을 바탕으로 가상 데이터를 만들었습니다. 만든 데이터가 현실의 악취 현상과 같은 모양을 보이는지 12개 항목으로 검사했고, AI 모델은 학습에 쓰지 않은 기간으로 성능을 확인했습니다.'),
    h('div', { class: 'kv' },
      h('div', null, h('div', { class: 'k' }, '데이터 타당성 검사'), h('div', { class: 'v' }, `${ok}/${V.length}`, h('small', null, ' 통과'))),
      h('div', null, h('div', { class: 'k' }, '냄새 지문 판독 (미지 시료)'), h('div', { class: 'v' }, pct(D.clf.te_acc, 0), h('small', null, ` · ${D.clf.n_te}건`))),
      h('div', null, h('div', { class: 'k' }, '악취 예보 오차 감소'), h('div', { class: 'v' }, pct(1 - sum(FC.mae) / sum(FC.mae_base), 0), h('small', null, ' vs 시간대 평균'))),
      h('div', null, h('div', { class: 'k' }, '역추적 1순위 적중'), h('div', { class: 'v' }, pct(D.bt.top1, 0), h('small', null, ' (무작위 13%)')))),
    h('div', { class: 'card stack' }, h('h3', null, '데이터 타당성 검사'),
      h('div', { class: 'tbl-wrap' }, h('table', null, h('thead', null, h('tr', null, h('th', null, '결과'), h('th', null, '검사 항목'), h('th', null, '측정값'), h('th', null, '현실 근거'))),
        h('tbody', null, V.map(v => h('tr', null, h('td', null, h('span', { class: v.ok ? 'pass' : 'fail' }, v.ok ? '통과' : '미달')), h('td', { style: 'white-space:normal;min-width:160px' }, v.name), h('td', { style: 'white-space:normal;min-width:240px', class: 'small' }, v.detail), h('td', { style: 'white-space:normal;min-width:240px', class: 'small muted' }, v.basis)))))),
      h('p', { class: 'small muted' }, '난수 시드를 바꿔 5번 다시 생성해도 60개 검사 중 56개가 통과했습니다. 미달 4건은 모두 허용 범위 경계(예: 주의 시간 비율 상한 6.0%에 6.2~6.7%)였습니다.')),
    h('div', { class: 'grid2' },
      h('div', { class: 'card stack' }, h('h3', null, '냄새 지문 판독 모델'),
        h('p', { class: 'small' }, `입력: 22종 농도 → log(OAV) → 시료별 평균을 빼 구성비만 남김 → 표준화. 모델: 다항 로지스틱 회귀. 학습 ${D.clf.n_tr}건(2026-08 이전), 5겹 교차검증 정확도 ${pct(D.clf.cv_acc, 1)}, 2026-08~10 미지 시료 ${D.clf.n_te}건 정확도 ${pct(D.clf.te_acc, 1)}. 지점별 교차검증: 배출구 ${pct(D.clf.acc_pt['배출구'], 1)}, 부지경계선 ${pct(D.clf.acc_pt['부지경계선'], 1)}(희석·배경 영향으로 더 어려움).`),
        h('h4', null, '교차검증 혼동행렬 (행: 실제, 열: 예측)'),
        h('div', { class: 'tbl-wrap' }, h('table', { class: 'cm' }, h('thead', null, h('tr', null, h('th', null, ''), CLS.map(k => h('th', null, { sewage: '하수', wastewater: '폐수', foodwaste: '음식물', livestock: '축산', feed: '사료', petrochem: '석유화학', coating: '도장' }[k.id])))),
          h('tbody', null, D.clf.cm.map((row, i) => { const t = sum(row); return h('tr', null, h('td', null, CLS[i].kr), row.map((v, j) => h('td', { style: v ? `background:color-mix(in srgb, ${i === j ? 'var(--data)' : 'var(--serious)'} ${Math.round(10 + 60 * v / t)}%, var(--surface))` : null }, v || ''))); })))),
        h('p', { class: 'small muted' }, '헷갈린 경우는 하수처리↔폐수처리, 음식물↔사료처럼 실제로도 원인 물질이 겹치는 업종입니다.')),
      h('div', { class: 'card stack' }, h('h3', null, '예보 · 역추적 · 예상식'),
        h('p', { class: 'small' }, `악취 예보: 최근 1년 시간 자료 ${FC.n}개로 유사 기상 ${FC.k}개 시간을 찾아 중앙값을 냅니다. 마지막 ${FC.test_days}일을 시험 기간으로 떼어 평가했고, 측정소 평균오차는 ${(sum(FC.mae) / 6).toFixed(2)}배로 시간대 평균(${(sum(FC.mae_base) / 6).toFixed(2)}배)보다 작았습니다. 상관계수 ${Math.min(...FC.r).toFixed(2)}~${Math.max(...FC.r).toFixed(2)}.`),
        h('p', { class: 'small' }, `민원 역추적: 풍향 일치도 × 거리 × 센서 지문(H₂S·TVOC·NH₃ 비율) 일치도로 점수를 매깁니다. 가중치는 앞 10개월로 정하고, 최근 61일 주의 이상 ${D.bt.n}개 시간으로 평가했습니다. 1순위 적중 ${pct(D.bt.top1, 1)}, 2순위 이내 ${pct(D.bt.top2, 1)}.`),
        h('p', { class: 'small' }, `복합악취 예상식: 기기분석 ΣOAV와 공기희석관능법 희석배수의 로그 회귀. 배출구 r = ${D.reg['배출구'].r}, 부지경계선 r = ${D.reg['부지경계선'].r}.`),
        h('h4', null, '데이터 생성 근거'),
        h('ul', { class: 'small', style: 'margin:0;padding-left:18px;display:grid;gap:4px' },
          h('li', null, '지정악취물질 22종 배출허용기준(공업·기타지역), 복합악취 기준(배출구 1000·500배, 부지경계선 20·15배): 악취방지법 시행규칙 별표 3'),
          h('li', null, '물질별 최소감지농도: Nagata(2003), 삼점비교식 냄새주머니법'),
          h('li', null, '업종별 대표 물질: 하수처리장 황화합물, 사료·식품 알데하이드·지방산, 도장 용제류 등 국내 실태조사 경향'),
          h('li', null, '기상: 울산 연안 평년값 수준의 기온, 겨울 북서풍·여름 남동풍과 해륙풍'),
          h('li', null, '측정소 값: 배출원 8곳 × 바람 방향·풍속·대기안정도에 따른 가우스형 확산 근사 + 공정 변동·돌발 이벤트')))));
};

/* ================= 시작 ================= */
$('#nowTag').textContent = `기준 시각 ${tf(NOW, 'full')}`;
window.addEventListener('hashchange', go);
go();
