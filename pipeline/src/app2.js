/* ================= 01 접수 · 문진 ================= */
const TESTS = {
  S: '황화합물 4종: 저온농축-GC(황 선택성 검출기)',
  A: '트라이메틸아민: 헤드스페이스-GC',
  N: '암모니아: 붕산 흡수-흡광광도법',
  F: '지방산 4종: 알칼리 흡수-GC',
  AL: '알데하이드 5종: DNPH 유도체화-HPLC',
  V: 'VOC(톨루엔·자일렌·스타이렌 등): 흡착관 열탈착-GC/MS',
  X: '지정악취물질 외 성분: 흡착관 열탈착-GC/MS 전성분 스크리닝',
};
const ODOR_TYPES = [
  { id: 'sulfur', chip: '썩은 달걀·하수구', sample: '밤마다 썩은 달걀 같은 냄새가 창문으로 들어와요', nm: '황화합물형', ex: '썩은 달걀·하수구 냄새', kw: ['썩은 달걀', '썩은 계란', '달걀', '계란', '하수구', '하수', '시궁창', '배수구', '정화조', '양파', '양배추', '유황', '방귀', '썩는', '썩은', '가스'], cmp: ['H2S', 'MM', 'DMS', 'DMDS'], cls: { sewage: 1, wastewater: 0.9, livestock: 0.5, foodwaste: 0.5 }, tests: ['S'] },
  { id: 'amine', chip: '비린내·생선', sample: '비릿한 생선 썩는 냄새가 나요', nm: '아민형', ex: '비린내·생선 썩는 냄새', kw: ['비린', '비릿', '생선', '젓갈', '어분', '멸치', '오징어', '해산물'], cmp: ['TMA', 'NH3'], cls: { feed: 1, foodwaste: 0.8, livestock: 0.4, wastewater: 0.4 }, tests: ['A', 'N'] },
  { id: 'manure', chip: '축사·분뇨', sample: '돼지 축사 같은 분뇨 냄새가 심해요', nm: '분뇨·암모니아형', ex: '축사·분뇨·지린내', kw: ['분뇨', '똥', '오줌', '소변', '축사', '돼지', '돈사', '양돈', '거름', '퇴비', '두엄', '지린', '찌린', '암모니아', '가축'], cmp: ['NH3', 'H2S', 'MM', 'NBA'], cls: { livestock: 1, foodwaste: 0.5, sewage: 0.5 }, tests: ['N', 'S', 'F'] },
  { id: 'fatty', chip: '쉰내·땀', sample: '시큼한 땀 냄새, 쉰내가 나요', nm: '지방산형', ex: '쉰내·땀·발 냄새', kw: ['쉰내', '^쉰', '땀', '발냄새', '발 냄새', '토사물', '구토', '치즈', '꼬릿', '쿰쿰', '^상한', '시큼', '시큼한'], cmp: ['NBA', 'NVAL', 'IVAL', 'PRA'], cls: { livestock: 0.9, feed: 0.8, foodwaste: 0.9 }, tests: ['F'] },
  { id: 'aldehyde', chip: '탄내·곡물', sample: '곡물 볶는 듯한 탄내가 나요', nm: '알데하이드형', ex: '탄내·곡물 볶는 냄새', kw: ['탄내', '타는', '^탄 ', '굽는', '볶는', '누룽지', '고소', '사료', '곡물', '매캐', '자극', '따가', '눈이 맵', '콧속'], cmp: ['ACA', 'PA', 'BA', 'IVA', 'NVA'], cls: { feed: 1, foodwaste: 0.6, wastewater: 0.4, petrochem: 0.3 }, tests: ['AL'] },
  { id: 'solvent', chip: '페인트·시너', sample: '낮에 페인트 시너 냄새가 심해요', nm: '유기용제형', ex: '페인트·시너 냄새', kw: ['페인트', '시너', '신나', '본드', '접착', '매니큐어', '휘발유', '기름', '석유', '락카', '도장', '인쇄', '잉크', '아세톤', '용제', '바나나', '향수', '달달', '달콤'], cmp: ['TOL', 'XYL', 'MEK', 'MIBK', 'BAC'], cls: { coating: 1, petrochem: 0.7, wastewater: 0.3 }, tests: ['V'] },
  { id: 'chem', chip: '플라스틱·고무', sample: '플라스틱 타는 듯한 화학 냄새가 나요', nm: '화학·플라스틱형', ex: '플라스틱·고무 타는 냄새', kw: ['플라스틱', '고무', '화학', '약품', '도시가스', '스티로폼', '타이어', '비닐', '공장', '달큰'], cmp: ['STY', 'ACA', 'TOL', 'XYL'], cls: { petrochem: 1, coating: 0.5 }, tests: ['V', 'AL'] },
  { id: 'chlorine', chip: '소독약·락스', sample: '소독약이나 락스 같은 냄새가 나요', nm: '염소·소독약형', ex: '소독약·락스 냄새', kw: ['소독약', '소독', '락스', '염소', '수영장', '표백'], cmp: [], cls: { sewage: 0.7, wastewater: 0.7, foodwaste: 0.3 }, tests: ['X'], note: '지정악취물질 22종 밖의 물질일 가능성이 커요. 산화 세정탑에 차아염소산을 너무 많이 넣었을 때도 이런 냄새가 날 수 있어요.' },
  { id: 'musty', chip: '곰팡이·퀴퀴', sample: '곰팡이 핀 것처럼 퀴퀴한 냄새가 나요', nm: '곰팡이·흙냄새형', ex: '곰팡이·퀴퀴한 냄새', kw: ['곰팡이', '곰팡', '퀴퀴', '흙냄새', '흙 냄새', '눅눅', '지하실', '꿉꿉'], cmp: ['DMDS', 'DMS'], cls: { sewage: 0.7, wastewater: 0.6, foodwaste: 0.4, livestock: 0.3 }, tests: ['S', 'X'], note: '곰팡이 냄새의 주성분(지오스민 등)은 지정악취물질 밖이라, 전성분 분석을 함께 해야 해요.' },
  { id: 'ferment', chip: '음식물 쓰레기', sample: '음식물 쓰레기 썩는 냄새가 나요', nm: '발효·음식물형', ex: '음식물 쓰레기·술 냄새', kw: ['음식물', '음식 쓰레기', '쓰레기', '발효', '술 냄새', '막걸리', '식초', '김치', '시큼', '쉰내'], cmp: ['ACA', 'IBA', 'PRA', 'TMA', 'MM'], cls: { foodwaste: 1, feed: 0.5, sewage: 0.3 }, tests: ['AL', 'A', 'F'] },
];
const STOP_EX = /냄새/g;
function bigrams(t) { const s = t.replace(/\s+/g, ''); const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); } return m; }
function bgCos(a, b) { let s = 0, na = 0, nb = 0; a.forEach((v, k) => { na += v * v; if (b.has(k)) s += v * b.get(k); }); b.forEach(v => nb += v * v); return s / Math.sqrt(na * nb + 1e-9); }
ODOR_TYPES.forEach(t => t.bg = bigrams((t.kw.join(' ') + ' ' + t.ex).replace(/\^/g, '').replace(STOP_EX, ' ')));
const STOP = /냄새가?|냄새를|나요|나는|납니다|났어요|같은|같아요|비슷한?|심해요|심하게|자꾸|계속|너무|그냥|이상한|좀|많이|느껴져요|들어와요|어디선가/g;
const kwHit = (s, k) => k.startsWith('^') ? new RegExp('(^|\\s)' + k.slice(1).trim()).test(s) : s.includes(k.trim());
function analyzeText(txt) {
  const s = ' ' + txt.toLowerCase() + ' ', tbg = bigrams(s.replace(STOP, ' '));
  const res = ODOR_TYPES.map(t => {
    const hits = t.kw.filter(k => kwHit(s, k)).map(k => k.replace('^', '').trim());
    const kwScore = sum(hits.map(k => 1 + 0.25 * (k.trim().length - 1)));
    return { t, hits, score: kwScore + 1.2 * bgCos(tbg, t.bg) };
  });
  const S = sum(res.map(r => r.score));
  res.forEach(r => r.p = S > 0 ? r.score / S : 0);
  return res.sort((a, b) => b.score - a.score);
}
APP.pages.intake = sec => {
  const ta = h('textarea', { id: 'in-text', 'aria-label': '냄새 설명' }, ODOR_TYPES[0].sample);
  const area = h('select', { id: 'in-area' }, STN.filter(s => s.kind === '주거지').map(s => h('option', { value: s.code }, `${s.name} (${s.code})`)));
  area.value = 'M5';
  const when = h('select', { id: 'in-when' }, ['새벽', '아침', '낮', '저녁', '밤'].map(w => h('option', null, w)));
  when.value = '밤';
  const out = h('div', { class: 'stack' }), outB = h('div');
  const run = () => renderIntake(out, outB, ta.value, area.value, when.value);
  sec.append(
    pageHead('01 접수 · 문진', '어떤 냄새인지 말로 설명해 주세요', '주민 민원이나 고객 상담 내용을 그대로 입력하면, 냄새 표현을 10가지 냄새 유형과 비교해 의심 물질과 필요한 검사를 안내합니다. 사는 곳과 현재 바람을 함께 보고 냄새가 올 수 있는 사업장도 추려 줍니다.'),
    h('div', { class: 'split' },
      h('div', { class: 'card stack' },
        h('h3', null, '문진표'),
        h('label', { class: 'fl', for: 'in-text' }, '냄새 설명', ta),
        h('div', { class: 'stack', style: 'gap:8px' }, h('span', { class: 'small muted' }, `냄새 유형 ${ODOR_TYPES.length}가지 — 누르면 예시 문장이 들어가요`),
          h('div', { class: 'row' }, ODOR_TYPES.map(t => h('button', { class: 'chip', type: 'button', title: t.sample, onclick: () => { ta.value = t.sample; run(); } }, t.chip)))),
        h('div', { class: 'grid2', style: 'gap:10px' }, h('label', { class: 'fl', for: 'in-area' }, '냄새를 맡은 곳', area), h('label', { class: 'fl', for: 'in-when' }, '주로 나는 때', when)),
        h('div', null, h('button', { class: 'btn pri', id: 'in-run', type: 'button', onclick: run }, '문진 분석')),
        h('p', { class: 'small faint' }, '분석 방식: 입력 문장에서 냄새 표현(10가지 유형, 약 120개 단어)을 찾고 글자 단위 유사도로 점수를 매깁니다. 등록된 표현이 하나도 없으면 유형을 억지로 고르지 않고 전체 검사를 안내합니다. 의심 사업장은 냄새 유형과 업종의 연관성, 지금 바람이 불어오는 방향, 거리를 곱해 순위를 냅니다.')),
      out), outB);
  run();
};
function renderIntake(out, outB, txt, areaCode, when) {
  out.innerHTML = ''; outB.innerHTML = '';
  const res = analyzeText(txt);
  const known = res.some(r => r.hits.length > 0);
  const top = known ? res.filter(r => r.hits.length > 0 && r.p > 0.08).slice(0, 3) : [];
  const st = STN[STI[areaCode]], wd = MON.wd[nowIdx], ws = MON.ws[nowIdx], curOu = MON.st[areaCode].ou[nowIdx];
  const cmpW = {}; top.forEach(r => r.t.cmp.forEach((c, k) => cmpW[c] = (cmpW[c] || 0) + r.p * (1 - k * 0.12)));
  const cmps = Object.entries(cmpW).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([c]) => CMP[CI[c]]);
  const outside = !known || top.some(r => r.t.tests.includes('X'));
  const tests = known ? [...new Set(top.flatMap(r => r.t.tests))].map(k => TESTS[k]) : ['S', 'A', 'N', 'F', 'AL', 'V', 'X'].map(k => TESTS[k]);
  const cand = SITES.map(s => {
    const compat = known ? sum(top.map(r => r.p * (r.t.cls[s.cls] || 0))) : 1;
    const dx = s.x - st.x, dy = s.y - st.y, rr = Math.hypot(dx, dy), brg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360;
    const dl = angdiff(brg, wd), align = Math.exp(-dl * dl / (2 * 40 * 40));
    return { s, compat, align, rr, dl, score: compat * (0.25 + 0.75 * align) / Math.pow(rr, 0.6) };
  }).sort((a, b) => b.score - a.score);
  const cs = sum(cand.map(c => c.score)) || 1;
  const weather = when === '새벽' || when === '밤' ? '밤·새벽에는 바람이 약하고 대기가 안정돼 냄새가 잘 흩어지지 않습니다.' : '낮에는 바다에서 부는 바람(해풍)이 공단 냄새를 내륙으로 옮기는 경우가 많습니다.';
  const typeCard = known
    ? h('div', { class: 'card stack' },
      h('div', { class: 'card-h' }, h('h3', null, '냄새 유형 분석'), h('span', { class: 'small faint' }, '찾은 표현: ' + [...new Set(top.flatMap(r => r.hits))].join(', '))),
      barList(res.filter(r => r.hits.length).slice(0, 5).map((r, i) => ({ label: r.t.nm, value: r.p, display: pct(r.p), top: i === 0, tip: `${r.t.nm}: ${esc(r.t.ex)}` })), { max: 1 }),
      h('div', { class: 'answer' }, h('b', null, `${top[0].t.nm}(${top[0].t.ex}) 가능성이 가장 높습니다.`), ' ', top[0].t.note || weather))
    : h('div', { class: 'card stack' },
      h('h3', null, '등록되지 않은 냄새 표현이에요'),
      h('div', { class: 'answer' }, h('b', null, '이 설명만으로는 냄새 유형을 정하지 않았습니다.'), ' 억지로 비슷한 유형에 끼워 맞추면 엉뚱한 검사를 하게 되므로, 특정 물질을 짐작하지 않고 전체 검사로 원인을 찾도록 안내합니다.'),
      h('p', { class: 'small muted' }, '무엇과 비슷한 냄새인지 덧붙이면 더 정확해집니다. 예:'),
      h('div', { class: 'row' }, ['썩은 달걀', '비린내', '페인트·시너', '땀·쉰내', '소독약', '곰팡이', '탄내', '축사·분뇨'].map(x => h('button', { class: 'chip', type: 'button', onclick: () => { const ta = $('#in-text'); ta.value = (ta.value.trim() + ' ' + x + ' 냄새').trim(); ta.dispatchEvent(new Event('change')); $('#in-run').click(); } }, x))));
  out.append(
    typeCard,
    h('div', { class: 'grid2' },
      h('div', { class: 'card stack' }, h('h3', null, '의심 물질'),
        h('div', { class: 'tbl-wrap' }, h('table', { class: 'wrap' }, h('thead', null, h('tr', null, h('th', null, '물질'), h('th', null, '냄새 특성'), h('th', { class: 'r' }, '최소감지(ppm)'))),
          h('tbody', null, cmps.map(c => h('tr', null, h('td', null, c.kr), h('td', null, c.desc), h('td', { class: 'r mono' }, String(c.thr)))),
            outside ? h('tr', null, h('td', { colspan: 3 }, known ? '+ 지정악취물질 22종 밖의 물질 가능성' : '특정하지 않음 — 22종 전체와 그 밖의 성분까지 분석')) : null)))),
      h('div', { class: 'card stack' }, h('h3', null, '추천 검사'),
        h('ul', { style: 'margin:0;padding-left:18px;display:grid;gap:4px' }, h('li', null, '복합악취: 공기희석관능법(부지경계선·민원 지점)'), tests.map(t => h('li', null, t))),
        h('p', { class: 'small muted' }, '현장 포집 후 진단센터에서 지정악취물질 22종 분석값으로 냄새 지문을 판독합니다.'))));
  outB.append(
    h('div', { class: 'card stack' },
      h('div', { class: 'card-h' }, h('h3', null, known ? '지금 바람 기준 의심 사업장' : '바람 방향·거리만으로 본 후보 사업장'), h('span', { class: 'small faint mono' }, `${tf(NOW, 'full')} · ${dirName(wd)}풍 ${f1(ws)} m/s · ${st.code} 현재 ${f1(curOu)}배`)),
      h('div', { class: 'grid2', style: 'grid-template-columns:minmax(0,7fr) minmax(0,5fr)' },
        drawMap({ vals: { [areaCode]: curOu }, wind: { wd, ws }, hl: cand.slice(0, 2).map(c => c.s.code), ray: { st: areaCode, wd }, sel: areaCode }),
        h('div', { class: 'stack' },
          barList(cand.slice(0, 5).map((c, i) => ({ label: c.s.name, value: c.score / cs, display: pct(c.score / cs), top: i === 0,
            tip: `${esc(c.s.name)}<br>냄새 유형 연관 ${pct(c.compat)} · 바람 방향과 ${Math.abs(Math.round(c.dl))}° 차이 · ${c.rr.toFixed(1)} km` }))),
          h('p', { class: 'small muted' }, `노란 부채꼴은 ${st.name}에서 바람이 불어오는 쪽입니다. ${known ? '냄새 유형과 업종이 맞고 ' : ''}바람 위쪽에 가까이 있을수록 순위가 올라갑니다.`),
          h('div', { class: 'row' },
            h('button', { class: 'btn pri', type: 'button', onclick: () => { const r = [...REC].reverse().find(x => x.s === cand[0].s.code && x.p === '부지경계선'); APP.diagLoad = r ? r.id : null; nav('diagnosis'); } }, `${cand[0].s.name[0]} 사업장 최근 시료 진단하기`),
            h('button', { class: 'btn', type: 'button', onclick: () => { APP.monSel = areaCode; nav('monitoring'); } }, `${st.code} 실시간 보기`)))))
  );
}

/* ================= 02 진단센터 ================= */
const DG = { rec: null, c: null, zone: '기타', reveal: false };
function pickDefaultTest() {
  const t = REC.filter(r => TEST.has(r.id) && r.p === '부지경계선' && r.dil > STD_DIL['부지경계선'][SITE[r.s].zone]);
  return (t.find(r => SITE[r.s].cls === 'livestock') || t[0] || REC[REC.length - 1]).id;
}
function diagLoad(id) {
  const r = RECI[id]; DG.rec = r; DG.c = r.c.slice(); DG.zone = SITE[r.s].zone; DG.reveal = !TEST.has(id);
}
APP.pages.diagnosis = sec => {
  diagLoad(APP.diagLoad || pickDefaultTest()); APP.diagLoad = null;
  const sel = h('select', { id: 'dg-sel', 'aria-label': '시료 선택' },
    h('optgroup', { label: `미지 시료 — AI 학습에서 제외한 최근 3개월 (${D.clf.n_te}건, 출처 비공개)` },
      REC.filter(r => TEST.has(r.id)).map(r => h('option', { value: r.id }, `${r.id} · ${r.ts.slice(0, 10)} · ${r.p}`))),
    h('optgroup', { label: '전자차트 기록 (학습에 사용)' },
      REC.filter(r => !TEST.has(r.id)).slice().reverse().map(r => h('option', { value: r.id }, `${r.id} · ${SITE[r.s].name} · ${r.p} · ${r.ts.slice(0, 10)}`))));
  const left = h('div', { class: 'card stack' }), right = h('div', { class: 'stack' });
  sec.append(pageHead('02 진단센터', '분석값으로 냄새의 지문을 읽습니다', '지정악취물질 22종의 농도를 최소감지농도로 나눠 냄새 세기(OAV)로 바꾸고, 물질 간 구성비를 ‘냄새 지문’으로 삼아 배출원 업종을 판독합니다. 미지 시료는 출처를 가린 채 먼저 AI가 맞히고, 정답을 확인할 수 있습니다.'),
    h('div', { class: 'split' }, left, right));
  const draw = () => { sel.value = DG.rec.id; renderDiagLeft(left, sel, draw); renderDiagRight(right, draw); };
  sel.addEventListener('change', () => { diagLoad(sel.value); draw(); });
  APP.upd.diagnosis = () => { if (APP.diagLoad) { diagLoad(APP.diagLoad); APP.diagLoad = null; draw(); } };
  draw();
};
function renderDiagLeft(box, sel, redraw) {
  const r = DG.rec, hidden = TEST.has(r.id) && !DG.reveal;
  box.innerHTML = '';
  box.append(h('h3', null, '시료'), h('label', { class: 'fl', for: 'dg-sel' }, '분석 시료 선택', sel),
    h('dl', { style: 'display:grid;grid-template-columns:96px 1fr;gap:4px 10px;margin:0;font-size:14px' },
      h('dt', { class: 'muted' }, '채취'), h('dd', { style: 'margin:0' }, `${r.ts} · ${r.p} · ${r.k} 측정`),
      h('dt', { class: 'muted' }, '사업장'), h('dd', { style: 'margin:0' }, hidden ? h('span', { class: 'faint' }, '비공개 (AI 판독 후 확인)') : `${SITE[r.s].name} (${SITE[r.s].zone}지역)`),
      h('dt', { class: 'muted' }, '채취 시 기상'), h('dd', { style: 'margin:0' }, `${dirName(r.wd)}풍 ${r.ws} m/s · ${r.t}℃ · 습도 ${r.rh}%`),
      h('dt', { class: 'muted' }, '복합악취 실측'), h('dd', { style: 'margin:0' }, h('span', { class: 'mono' }, `${r.dil}배`), ' (공기희석관능법)')),
    h('div', { class: 'row', style: 'justify-content:space-between' }, h('h4', null, '지정악취물질 22종 (ppm) — 값을 고치면 즉시 다시 판독'), h('button', { class: 'btn sm', type: 'button', onclick: () => { DG.c = r.c.slice(); redraw(); } }, '원래 값')),
    h('div', { class: 'tbl-wrap scroll' }, h('table', { class: 'dense' },
      h('thead', null, h('tr', null, h('th', null, '물질'), h('th', { class: 'r' }, '농도'), h('th', { class: 'r' }, 'OAV'), h('th', { class: 'r' }, `기준(${DG.zone})`))),
      h('tbody', null, CMP.map((c, i) => {
        const v = DG.c[i], ex = r.p === '부지경계선' && v > limitOf(i, DG.zone);
        const inp = h('input', { class: 'cv', type: 'number', step: 'any', min: 0, value: v ? Number(v.toPrecision(4)) : 0, 'aria-label': c.kr + ' 농도(ppm)', id: 'cv-' + c.id });
        inp.addEventListener('change', () => { DG.c[i] = Math.max(0, +inp.value || 0); redraw(); });
        return h('tr', null, h('td', null, c.kr), h('td', { class: 'r' }, inp), h('td', { class: 'r mono' + (ex ? ' ex' : '') }, v ? f1(v / c.thr) : 'ND'), h('td', { class: 'r mono faint' }, String(limitOf(i, DG.zone))));
      })))),
    h('p', { class: 'tiny faint' }, 'ND = 검출한계 미만. OAV = 농도 ÷ 최소감지농도(1이면 사람이 겨우 맡는 수준).'));
}
function renderDiagRight(box, redraw) {
  const r = DG.rec, c = DG.c, isTest = TEST.has(r.id);
  const cl = classify(c), oav = c.map((v, i) => v / CMP[i].thr), so = sum(oav);
  const order = oav.map((v, i) => ({ i, v })).sort((a, b) => b.v - a.v);
  const est = estDil(so, r.p), stdv = STD_DIL[r.p][DG.zone];
  const edited = c.some((v, i) => v !== r.c[i]);
  const truthCls = SITE[r.s].cls, correct = CLS[cl.top].id === truthCls;
  const exc = r.p === '부지경계선' ? CMP.map((cc, i) => ({ cc, i, v: c[i], lim: limitOf(i, DG.zone) })).filter(x => x.v > x.lim) : [];
  box.innerHTML = '';
  box.append(
    h('div', { class: 'card stack' },
      h('div', { class: 'card-h' }, h('h3', null, 'AI 냄새 지문 판독'), h('span', { class: 'small faint' }, '다항 로지스틱 회귀 · 22개 물질 구성비')),
      h('div', { class: 'answer' }, '가장 가능성 높은 배출원 업종은 ', h('b', null, `${CLS[cl.top].kr} (${pP(cl.p[cl.top])})`), '입니다.'),
      barList(CLS.map((k, j) => ({ label: k.kr, value: cl.p[j], display: pP(cl.p[j]), top: j === cl.top })).sort((a, b) => b.value - a.value), { max: 1 }),
      h('div', { class: 'row small' }, h('span', { class: 'muted' }, '판단 근거:'), cl.why.slice(0, 3).map(w => h('span', { class: 'tag' }, `${CMP[w.i].kr} 비중 ${cl.z[w.i] > 0 ? '높음' : '낮음'}`))),
      isTest ? h('div', { class: 'row' },
        DG.reveal ? h('div', { class: 'note', style: 'flex:1' }, h('b', null, correct ? '정답과 일치 ' : '정답과 다름 '), `— 실제 출처: ${SITE[r.s].name} (${CLSN[truthCls]})`, edited ? ' · 값을 고친 상태의 판독입니다' : '')
          : h('button', { class: 'btn', type: 'button', onclick: () => { DG.reveal = true; redraw(); } }, '정답 확인 (출처 공개)')) : null),
    h('div', { class: 'grid2' },
      h('div', { class: 'card stack' },
        h('div', { class: 'card-h' }, h('h3', null, '악취 기여율'), h('span', { class: 'small mono faint' }, `ΣOAV ${f1(so)}`)),
        barList(order.slice(0, 6).map((o, k) => ({ label: CMP[o.i].kr, value: o.v / so, display: pct(o.v / so), top: k === 0, tip: `${esc(CMP[o.i].kr)} — ${esc(CMP[o.i].desc)}<br>농도 <b>${fc(c[o.i])}</b> ppm · OAV <b>${f1(o.v)}</b>` })), { max: 1 }),
        h('p', { class: 'small muted' }, `${CMP[order[0].i].kr}(${CMP[order[0].i].desc})이 냄새의 ${pct(oav[order[0].i] / so)}를 차지합니다.`)),
      h('div', { class: 'card stack' },
        h('div', { class: 'card-h' }, h('h3', null, '기준 판정'), seg([['공업', '공업지역'], ['기타', '기타지역']], DG.zone, v => { DG.zone = v; redraw(); }, '지역 구분')),
        h('div', { class: 'kv' },
          h('div', null, h('div', { class: 'k' }, '복합악취 ' + (edited ? '예상' : '실측')), h('div', { class: 'v' }, edited ? Math.round(est.est) : r.dil, h('small', null, ` 배 / 기준 ${stdv}`))),
          h('div', null, h('div', { class: 'k' }, 'AI 예상 범위(90%)'), h('div', { class: 'v' }, `${Math.round(est.lo)}~${Math.round(est.hi)}`, h('small', null, ' 배')))),
        (edited ? est.est : r.dil) > stdv ? h('p', { class: 'ex small' }, `복합악취 ${r.p} 기준(${stdv}배) 초과`) : h('p', { class: 'small', style: 'color:var(--good);font-weight:600' }, `복합악취 ${r.p} 기준(${stdv}배) 이내`),
        r.p === '부지경계선'
          ? (exc.length ? h('div', null, h('p', { class: 'ex small' }, `지정악취물질 ${exc.length}종 기준 초과`), h('ul', { class: 'small', style: 'margin:4px 0 0;padding-left:18px' }, exc.map(x => h('li', null, `${x.cc.kr} ${fc(x.v)} ppm (기준 ${x.lim})`)))) : h('p', { class: 'small muted' }, '지정악취물질 22종 모두 기준 이내'))
          : h('p', { class: 'small muted' }, '배출구 시료는 복합악취 배출구 기준으로 판정합니다. 지정악취물질 기준은 부지경계선에 적용됩니다.'),
        h('p', { class: 'tiny faint' }, `예상식: log₁₀(희석배수) = ${D.reg[r.p].a} + ${D.reg[r.p].b}·log₁₀(ΣOAV+1), 과거 ${D.reg[r.p].n}건 회귀(r=${D.reg[r.p].r})`))),
    h('div', { class: 'card stack' },
      h('h3', null, '유사한 과거 사례 (냄새 지문 유사도)'),
      h('div', { class: 'tbl-wrap' }, h('table', null, h('thead', null, h('tr', null, h('th', null, '시료번호'), h('th', null, '일시'), h('th', null, '사업장'), h('th', null, '지점'), h('th', { class: 'r' }, '유사도'))),
        h('tbody', null, similar(cl.z, r.id).map(({ r: q, s }) => h('tr', { class: 'click', onclick: () => { diagLoad(q.id); redraw(); } },
          h('td', { class: 'mono' }, q.id), h('td', { class: 'mono' }, q.ts.slice(0, 10)), h('td', null, (TEST.has(q.id) ? '(비공개) ' : '') + (TEST.has(q.id) ? CLSN[SITE[q.s].cls] + ' 추정' : SITE[q.s].name)), h('td', null, q.p), h('td', { class: 'r mono' }, pct(s))))))),
      h('div', { class: 'row' }, h('button', { class: 'btn pri', type: 'button', onclick: () => { APP.treatFrom = { id: r.id, c: c.slice(), cls: CLS[cl.top].id }; nav('treatment'); } }, '이 진단으로 처방 받기 →'))));
}

/* ================= 03 해결센터 ================= */
const GRP = {
  acid: '아민·암모니아', alkox: '황화수소·메르캅탄', insol_s: '황화메틸류', ald: '알데하이드', fa: '지방산', voc: '난용성 유기용제', voc_sol: '수용성 용제',
};
const FLOW0 = { sewage: 600, wastewater: 300, foodwaste: 400, livestock: 800, feed: 500, petrochem: 300, coating: 600 };
const TR = { rec: null, c: null, cls: null, flow: 500, voc: '저', target: 0.5, zone: '기타' };
function treatLoad(from) {
  const r = RECI[from.id]; TR.rec = r; TR.c = from.c || r.c.slice(); TR.cls = from.cls || SITE[r.s].cls; TR.zone = SITE[r.s].zone;
  TR.flow = FLOW0[TR.cls]; TR.voc = TR.cls === 'petrochem' ? '고' : TR.cls === 'coating' ? '중' : '저';
}
function prescribe() {
  const r = TR.rec, c = TR.c, oav = c.map((v, i) => v / CMP[i].thr), so = sum(oav) || 1;
  const sh = Object.fromEntries(Object.keys(GRP).map(g => [g, 0]));
  CMP.forEach((cc, i) => sh[cc.tr] += oav[i] / so);
  const units = [], why = [];
  const bio = ['sewage', 'foodwaste', 'livestock'].includes(TR.cls), vocSh = sh.voc + sh.voc_sol, Qs = TR.flow / 60;
  const scrubD = Math.sqrt(4 * (Qs / 1.5) / Math.PI);
  if (r.p === '부지경계선') { units.push({ k: '0단', n: '비산 배출원 밀폐 · 음압 포집', d: '개방 수조 덮개, 투입구 에어커튼, 국소 배기로 굴뚝 밖 냄새를 방지시설로 모읍니다.' }); why.push('부지경계선 시료라 굴뚝 외 비산 배출이 함께 작용합니다. 포집하지 못한 냄새는 방지시설로도 줄일 수 없습니다.'); }
  if (vocSh >= 0.4) {
    if (sh.acid + sh.alkox + sh.fa + sh.ald >= 0.25) units.push({ k: '전처리', n: '약액 세정탑', d: `수용성 악취 제거·먼지 제거. 공탑속도 1.5 m/s 기준 직경 약 ${scrubD.toFixed(1)} m` });
    if (TR.voc === '고') { units.push({ k: '주처리', n: 'RTO (축열식 연소)', d: `800~1000℃에서 VOC를 분해하고 열을 회수. 연소실 체류 1초 기준 유효용적 약 ${(Qs * 1123 / 293).toFixed(1)} m³` }); why.push(`난용성 유기용제가 냄새의 ${pct(vocSh)}를 차지하고 유입 농도가 높아 연소 처리가 경제적입니다.`); }
    else if (TR.voc === '중') { units.push({ k: '주처리', n: 'NET 마이크로버블 약액세정(MBSS)', d: '미세기포로 기-액 접촉면적을 키워 물에 잘 녹지 않는 복합악취까지 흡수', tsei: true }, { k: '후단', n: '활성탄 흡착탑', d: `잔류 용제 연마. 공탑속도 0.4 m/s 기준 단면적 약 ${(Qs / 0.4).toFixed(1)} m²` }); why.push(`유기용제 비중 ${pct(vocSh)}, 중간 농도라 마이크로버블 세정과 흡착을 조합합니다.`); }
    else { units.push({ k: '주처리', n: '활성탄 흡착탑', d: `저농도 용제 흡착. 공탑속도 0.4 m/s 기준 단면적 약 ${(Qs / 0.4).toFixed(1)} m², 교체 주기 관리 필요` }); why.push(`유기용제 비중 ${pct(vocSh)}이지만 저농도라 흡착으로 충분합니다.`); }
  } else {
    if (bio && TR.flow >= 500) {
      units.push({ k: '주처리', n: '복합탈취기', d: `습식 세정 → 바이오필터(산성 악취 분해 미생물) → 바이오필터(알칼리성 악취 분해 미생물) → 약액 세정. 공탑 체류 45초 기준 여재 용적 약 ${Math.round(Qs * 45)} m³`, tsei: true });
      why.push(`생물학적 배출원(${CLSN[TR.cls]})이며 풍량이 커서, 약품 사용을 줄이는 미생물 처리 중심 조합이 유리합니다.`);
    } else {
      if (sh.acid >= 0.12) { units.push({ k: '1단', n: '산 세정탑', d: `황산 약액으로 암모니아·트라이메틸아민 흡수. 직경 약 ${scrubD.toFixed(1)} m, 순환수 약 ${Math.round(TR.flow * 2)} L/min (L/G 2)` }); why.push(`${GRP.acid} 비중 ${pct(sh.acid)} — 염기성 물질은 산성 약액에 잘 흡수됩니다.`); }
      if (sh.alkox + sh.fa >= 0.12) { units.push({ k: units.length ? '2단' : '1단', n: '알칼리 · 산화 세정탑', d: `가성소다와 차아염소산나트륨으로 황화수소·메르캅탄·지방산 제거. 직경 약 ${scrubD.toFixed(1)} m` }); why.push(`${GRP.alkox}·${GRP.fa} 비중 ${pct(sh.alkox + sh.fa)} — 산성 물질은 알칼리, 황화합물은 산화제가 효과적입니다.`); }
    }
    if (sh.ald >= 0.2 || sh.insol_s >= 0.08 || units.length === (r.p === '부지경계선' ? 1 : 0)) { units.push({ k: '보강', n: 'NET 마이크로버블 약액세정(MBSS)', d: '알데하이드·황화메틸류처럼 일반 세정으로 덜 잡히는 성분의 흡수율을 높입니다', tsei: true }); why.push(`${GRP.ald} ${pct(sh.ald)}, ${GRP.insol_s} ${pct(sh.insol_s)} — 난용성 성분 보강 처리가 필요합니다.`); }
    if (vocSh >= 0.15) units.push({ k: '후단', n: '활성탄 흡착탑', d: '잔류 용제 연마' });
  }
  units.push({ k: '사후관리', n: '악취 모니터링 · 예보 연계', d: `부지경계 센서(${[sh.alkox + sh.insol_s > 0.1 ? 'H₂S' : null, sh.acid > 0.1 ? 'NH₃' : null, vocSh > 0.1 ? 'TVOC' : null, '복합악취'].filter(Boolean).join('·')}) + 풍향풍속계로 효과 확인`, tsei: true });
  const cur = r.c.every((v, i) => v === c[i]) ? r.dil : estDil(so, r.p).est;
  const stdv = STD_DIL[r.p][TR.zone], tgt = stdv * TR.target, need = Math.max(0, 1 - tgt / cur);
  const topI = oav.map((v, i) => ({ v, i })).sort((a, b) => b.v - a.v).slice(0, 2);
  const mainG = Object.entries(sh).sort((a, b) => b[1] - a[1])[0];
  return { sh, units, why, cur, stdv, tgt, need, topI, so, mainG };
}
APP.pages.treatment = sec => {
  if (!TR.rec || APP.treatFrom) { const def = [...REC].reverse().find(x => x.s === 'S01' && x.p === '배출구' && !TEST.has(x.id)); treatLoad(APP.treatFrom || { id: def.id }); APP.treatFrom = null; }
  const box = h('div', { class: 'split' });
  sec.append(pageHead('03 해결센터', '원인 물질에 맞춰 방지시설을 처방합니다', '진단 결과의 물질별 기여율을 성질(물에 녹는지, 산성인지 염기성인지, 타는지)에 따라 묶고, 그 비중과 풍량·농도 수준으로 공정 조합을 고릅니다. 규모는 일반적인 설계 범위로 계산한 개략값이며, 실제 설계는 현장 조사 후 확정합니다.'), box);
  const draw = () => renderTreat(box, draw);
  APP.upd.treatment = () => { if (APP.treatFrom) { treatLoad(APP.treatFrom); APP.treatFrom = null; draw(); } };
  draw();
};
function renderTreat(box, redraw) {
  const r = TR.rec, P = prescribe();
  box.innerHTML = '';
  const quick = h('select', { id: 'tr-quick' }, h('option', { value: '' }, '사업장 최근 배출구 시료 불러오기…'), SITES.map(s => h('option', { value: s.code }, s.name)));
  quick.addEventListener('change', () => { if (!quick.value) return; const x = [...REC].reverse().find(q => q.s === quick.value && q.p === '배출구'); treatLoad({ id: x.id }); redraw(); });
  const clsSel = h('select', { id: 'tr-cls' }, CLS.map(k => h('option', { value: k.id }, k.kr))); clsSel.value = TR.cls;
  clsSel.addEventListener('change', () => { TR.cls = clsSel.value; redraw(); });
  const flow = h('input', { type: 'range', id: 'tr-flow', min: 100, max: 3000, step: 50, value: TR.flow });
  const flowV = h('span', { class: 'mono' }, `${TR.flow} m³/min`);
  flow.addEventListener('input', () => { flowV.textContent = `${flow.value} m³/min`; });
  flow.addEventListener('change', () => { TR.flow = +flow.value; redraw(); });
  box.append(
    h('div', { class: 'card stack' },
      h('h3', null, '처방 조건'),
      h('div', { class: 'note' }, h('b', null, r.id), ` · ${TEST.has(r.id) ? '미지 시료' : SITE[r.s].name} · ${r.p} · ${r.ts.slice(0, 10)}`),
      h('label', { class: 'fl', for: 'tr-quick' }, '다른 시료', quick),
      h('label', { class: 'fl', for: 'tr-cls' }, '업종 (진단센터 AI 판독값이 기본)', clsSel),
      h('label', { class: 'fl', for: 'tr-flow' }, h('span', { class: 'row', style: 'justify-content:space-between' }, '처리 풍량', flowV), flow),
      h('div', { class: 'fl' }, '유입 유기용제 농도', seg([['저', '저농도 <50ppm'], ['중', '50~500'], ['고', '>500ppm']], TR.voc, v => { TR.voc = v; redraw(); }, '유입 유기용제 농도')),
      h('div', { class: 'fl' }, '목표 (기준 대비)', seg([[0.5, '기준의 50%'], [0.7, '기준의 70%']], TR.target, v => { TR.target = v; redraw(); }, '목표')),
      h('div', { class: 'fl' }, '지역 구분', seg([['공업', '공업지역'], ['기타', '기타지역']], TR.zone, v => { TR.zone = v; redraw(); }, '지역 구분')),
      h('h4', null, '물질군별 냄새 비중'),
      barList(Object.entries(P.sh).sort((a, b) => b[1] - a[1]).filter(e => e[1] > 0.005).map(([g, v], i) => ({ label: GRP[g], value: v, display: pct(v), top: i === 0 })), { max: 1 })),
    h('div', { class: 'rx' },
      h('div', { class: 'rx-h' }, h('span', { class: 't' }, '처 방 전'), h('span', { class: 'small mono muted' }, `바르고-Rx-${r.id.slice(3)} · 발행 ${tf(NOW, 'date')}`)),
      h('div', { class: 'rx-b' },
        h('dl', null,
          h('dt', null, '환자(사업장)'), h('dd', null, TEST.has(r.id) ? `미지 시료 (${CLSN[TR.cls]} 추정)` : `${SITE[r.s].name} · 현 시설 ${SITE[r.s].facility}`),
          h('dt', null, '진단명'), h('dd', null, h('b', null, `${GRP[P.mainG[0]]} 우세 악취`), ` — ${P.topI.map(t => CMP[t.i].kr).join('·')} 기여 ${pct(P.topI.reduce((a, t) => a + t.v, 0) / P.so)}`),
          h('dt', null, '현재 상태'), h('dd', null, h('span', { class: 'mono' }, `${Math.round(P.cur)}배`), ` (${r.p} 기준 ${P.stdv}배) `, P.cur > P.stdv ? h('span', { class: 'ex' }, '기준 초과') : h('span', null, '기준 이내')),
          h('dt', null, '치료 목표'), h('dd', null, h('span', { class: 'mono' }, `${Math.round(P.tgt)}배 이하`), ` → 요구 제거율 `, h('b', { class: 'mono' }, P.need > 0 ? pct(P.need, 0) : '0%'), P.need === 0 ? ' (현재 목표 이내 — 예방 관리 중심)' : '')),
        h('div', { class: 'stack' }, h('h4', null, '처방 공정'),
          h('div', { class: 'train' }, P.units.flatMap((u, i) => [i ? h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→') : null,
            h('div', { class: 'unit' + (u.tsei ? ' tsei' : '') }, h('span', { class: 'k' }, u.k + (u.tsei ? ' · 태성 솔루션' : '')), h('span', { class: 'n' }, u.n), h('span', { class: 'd' }, u.d))]))),
        h('div', { class: 'stack' }, h('h4', null, '처방 근거'), h('ul', { style: 'margin:0;padding-left:18px;display:grid;gap:4px;font-size:14px' }, P.why.map(w => h('li', null, w)))),
        h('div', { class: 'stack' }, h('h4', null, '치료 일정'),
          h('div', { class: 'train' }, ['정밀 진단(현장 포집·분석)', '기본·실시 설계', '시공', '시운전·성능 검증', '사후관리(모니터링·예보)'].flatMap((t, i) => [i ? h('span', { class: 'arrow', 'aria-hidden': 'true' }, '→') : null, h('div', { class: 'unit', style: 'min-width:110px;flex:1 1 110px' }, h('span', { class: 'k' }, String(i + 1).padStart(2, '0')), h('span', { class: 'd', style: 'color:var(--ink)' }, t))]))),
        h('p', { class: 'tiny faint' }, '설계 범위 참고값: 세정탑 공탑속도 1.5 m/s, L/G 2 L/m³ · 바이오필터 공탑 체류 45초 · RTO 연소실 800~1000℃, 체류 1초 · 활성탄 공탑속도 0.4 m/s. 처리 효율은 현장 시험으로 확인합니다.'))));
}
