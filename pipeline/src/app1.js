'use strict';
/* ================= 공통 ================= */
const D = JSON.parse(document.getElementById('data').textContent);
const $ = (q, r = document) => r.querySelector(q);
const $$ = (q, r = document) => [...r.querySelectorAll(q)];
function h(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return e;
}
const SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, ...kids) {
  const e = document.createElementNS(SVGNS, tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2), v);
    else e.setAttribute(k, v);
  }
  for (const c of kids.flat(Infinity)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return e;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/* 데이터 */
const CMP = D.compounds, NC = CMP.length;
const CI = Object.fromEntries(CMP.map((c, i) => [c.id, i]));
const SITES = D.sites, SITE = Object.fromEntries(SITES.map(s => [s.code, s]));
const CLS = D.classes, CLSN = Object.fromEntries(CLS.map(c => [c.id, c.kr]));
const STN = D.stations, STI = Object.fromEntries(STN.map((s, i) => [s.code, i]));
const REC = D.records, RECI = Object.fromEntries(REC.map(r => [r.id, r]));
const TEST = new Set(D.clf.test_ids);
const letter = code => SITE[code].name[0];
const SHORT = { S01: '하수처리', S02: '음식물', S03: '석유화학', S04: '도장', S05: '사료', S06: '양돈', S07: '폐수처리', S08: '합성수지' };
const LBL_LEFT = new Set(['M3', 'M5']);

/* 시간 (모두 한국시각을 UTC 필드로 다룸) */
const HOUR = 3600e3;
function tparse(str) { const [d, t] = str.split(' '); const [Y, M, Dd] = d.split('-').map(Number); return Date.UTC(Y, M - 1, Dd, +(t || '0').slice(0, 2)); }
const WK = '일월화수목금토';
function tf(ms, mode = 'dh') {
  const d = new Date(ms), Y = d.getUTCFullYear(), M = d.getUTCMonth() + 1, Dd = d.getUTCDate(), H = d.getUTCHours(), w = WK[d.getUTCDay()];
  const p = n => String(n).padStart(2, '0');
  if (mode === 'full') return `${Y}-${p(M)}-${p(Dd)} ${p(H)}:00`;
  if (mode === 'date') return `${Y}-${p(M)}-${p(Dd)}`;
  if (mode === 'md') return `${M}/${Dd}(${w})`;
  if (mode === 'h') return `${H}시`;
  return `${M}/${Dd}(${w}) ${H}시`;
}
const NOW = tparse(D.meta.now);

/* 숫자 */
function fc(v) { // 농도 ppm
  if (!v) return 'ND';
  if (v >= 100) return v.toFixed(0);
  if (v >= 10) return v.toFixed(1);
  if (v >= 1) return v.toFixed(2);
  return String(Number(v.toPrecision(3)));
}
const f1 = v => (Math.round(v * 10) / 10).toFixed(1);
const pct = (v, d = 0) => (v * 100).toFixed(d) + '%';
const pP = v => v > 0.995 ? '99% 이상' : v < 0.005 ? '1% 미만' : pct(v);
const sum = a => a.reduce((x, y) => x + y, 0);
const angdiff = (a, b) => ((a - b + 180) % 360 + 360) % 360 - 180;
const DIR16 = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
const dirName = wd => DIR16[Math.round((((wd % 360) + 360) % 360) / 22.5) % 16];

/* 악취 단계 (희석배수 환산) */
function lvl(v) {
  if (v >= 30) return { k: 'critical', t: '경보' };
  if (v >= 15) return { k: 'serious', t: '주의' };
  if (v >= 10) return { k: 'warn', t: '관심' };
  return { k: 'good', t: '정상' };
}
const LVC = { good: 'var(--good)', warn: 'var(--warn)', serious: 'var(--serious)', critical: 'var(--critical)' };
const lvTag = (v, extra) => { const L = lvl(v); return h('span', { class: 'lv ' + L.k }, h('i'), L.t, extra ? ' ' + extra : ''); };

/* 기준 */
const STD_DIL = { '배출구': { '공업': 1000, '기타': 500 }, '부지경계선': { '공업': 20, '기타': 15 } };
const limitOf = (i, zone) => zone === '공업' ? CMP[i].li : CMP[i].lo;

/* 툴팁 */
const tip = $('#tip');
function showTip(e, html) {
  tip.innerHTML = html; tip.classList.add('on');
  const w = tip.offsetWidth, hh = tip.offsetHeight;
  tip.style.left = Math.max(8, Math.min(e.clientX + 14, innerWidth - w - 8)) + 'px';
  tip.style.top = Math.max(8, Math.min(e.clientY + 14, innerHeight - hh - 8)) + 'px';
}
const hideTip = () => tip.classList.remove('on');

/* ================= AI 모델 ================= */
// 1) 냄새 지문 판별 (다항 로지스틱 회귀)
function featVec(c) {
  const x = c.map((v, i) => Math.log10(Math.max(v, CMP[i].mdl / 2) / CMP[i].thr));
  const m = sum(x) / NC;
  return x.map((v, i) => ((v - m) - D.clf.mu[i]) / D.clf.sd[i]);
}
function classify(c) {
  const z = featVec(c);
  const L = D.clf.coef.map((w, k) => w.reduce((a, wi, i) => a + wi * z[i], D.clf.b[k]));
  const mx = Math.max(...L), e = L.map(v => Math.exp(v - mx)), S = sum(e);
  const p = e.map(v => v / S), top = p.indexOf(Math.max(...p));
  const why = D.clf.coef[top].map((w, i) => ({ i, v: w * z[i] })).sort((a, b) => b.v - a.v);
  return { p, top, z, why };
}
REC.forEach(r => { r.z = featVec(r.c); r.ms = tparse(r.ts); r.oav = r.c.map((v, i) => v / CMP[i].thr); r.soav = sum(r.oav); });
function cosine(a, b) { let s = 0, na = 0, nb = 0; for (let i = 0; i < a.length; i++) { s += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; } return s / Math.sqrt(na * nb + 1e-12); }
function similar(z, excludeId, n = 3) {
  return REC.filter(r => r.id !== excludeId).map(r => ({ r, s: cosine(z, r.z) })).sort((a, b) => b.s - a.s).slice(0, n);
}
// 2) 복합악취 예상식 (회귀)
function estDil(soav, point) {
  const g = D.reg[point];
  const m = g.a + g.b * Math.log10(soav + 1);
  return { est: Math.pow(10, m), lo: Math.pow(10, m - 1.645 * g.sd), hi: Math.pow(10, m + 1.645 * g.sd) };
}
// 3) 악취 예보 (유사 기상 k-최근접)
const FC = D.fc, FCN = FC.n, fcStart = tparse(FC.start);
function fcFeat(wd, ws, t, hour, pyWk) {
  const f = [Math.sin(wd * Math.PI / 180), Math.cos(wd * Math.PI / 180), Math.log(Math.max(ws, 0.2)), t,
    Math.sin(2 * Math.PI * hour / 24), Math.cos(2 * Math.PI * hour / 24), (pyWk < 5 && hour >= 8 && hour <= 18) ? 1 : 0];
  return f.map((v, i) => (v - FC.mu[i]) / FC.sd[i] * FC.w[i]);
}
const pyWkOf = ms => (new Date(ms).getUTCDay() + 6) % 7;
const FCX = new Float32Array(FCN * 7), FCDAY = new Int32Array(FCN);
for (let i = 0; i < FCN; i++) {
  const ms = fcStart + i * HOUR, d = new Date(ms);
  const f = fcFeat(FC.wd[i], FC.ws[i] / 10, FC.t[i] / 10, d.getUTCHours(), pyWkOf(ms));
  for (let j = 0; j < 7; j++) FCX[i * 7 + j] = f[j];
  FCDAY[i] = Math.floor(ms / (24 * HOUR));
}
function knn(f, skipDay = null, k = FC.k) {
  const dist = new Float64Array(FCN);
  for (let i = 0; i < FCN; i++) {
    if (skipDay !== null && FCDAY[i] === skipDay) { dist[i] = Infinity; continue; }
    let s = 0; for (let j = 0; j < 7; j++) { const d = FCX[i * 7 + j] - f[j]; s += d * d; } dist[i] = s;
  }
  const idx = Array.from({ length: FCN }, (_, i) => i).sort((a, b) => dist[a] - dist[b]).slice(0, k);
  return STN.map((_, j) => { const v = idx.map(i => FC.ou[j][i] / 10).sort((a, b) => a - b); return (v[(k - 1) >> 1] + v[k >> 1]) / 2; });
}
function predictAt(ms, wd, ws, t, skipDay = null) { const d = new Date(ms); return knn(fcFeat(wd, ws, t, d.getUTCHours(), pyWkOf(ms)), skipDay); }
// 4) 민원 역추적 (풍향 + 센서 지문)
function backtrack(st, wd, ch) {
  const B = D.bt;
  const v = ch.map((x, j) => Math.max(x - B.bg[j], 0) / B.scale[j]), vn = Math.hypot(...v);
  const raw = SITES.map(s => {
    const dx = s.x - st.x, dy = s.y - st.y, rr = Math.max(0.4, Math.hypot(dx, dy));
    const brg = (Math.atan2(dx, dy) * 180 / Math.PI + 360) % 360, dl = angdiff(brg, wd);
    const pr = B.prof[s.cls], pn = Math.hypot(...pr);
    const cs = vn > 0 ? (v[0] * pr[0] + v[1] * pr[1] + v[2] * pr[2]) / (vn * pn + 1e-9) : 0.5;
    return { s, dl, rr, cs, score: Math.exp(-dl * dl / (2 * B.sig * B.sig)) / Math.pow(rr, B.pe) * ((1 - B.fw) + B.fw * cs) };
  });
  const S = sum(raw.map(r => r.score)) || 1;
  raw.forEach(r => r.share = r.score / S);
  return raw.sort((a, b) => b.score - a.score);
}

/* 모니터링 데이터 */
const MON = D.mon, MN = MON.n, monStart = tparse(MON.start);
const monT = i => monStart + i * HOUR;
const nowIdx = MN - 1;

/* ================= 지도 ================= */
const MAPW = 11.4, MAPH = 9, SC = 56, PAD = 8;
const MX = x => PAD + x * SC, MY = y => PAD + (MAPH - y) * SC;
function windCompass(g, wd, ws, x, y) {
  const to = (wd + 180) % 360, r = 24;
  g.append(sv('circle', { cx: x, cy: y, r: r + 6, fill: 'var(--surface)', stroke: 'var(--line)' }));
  g.append(sv('text', { x, y: y - r - 10, 'text-anchor': 'middle', 'font-size': 11 }, '북'));
  const rad = to * Math.PI / 180, dx = Math.sin(rad), dy = -Math.cos(rad);
  g.append(sv('line', { x1: x - dx * r * 0.8, y1: y - dy * r * 0.8, x2: x + dx * r * 0.8, y2: y + dy * r * 0.8, stroke: 'var(--ink)', 'stroke-width': 2.5 }));
  const ax = x + dx * r * 0.85, ay = y + dy * r * 0.85, px = -dy, py = dx;
  g.append(sv('path', { d: `M${ax + dx * 6},${ay + dy * 6} L${ax + px * 6},${ay + py * 6} L${ax - px * 6},${ay - py * 6} Z`, fill: 'var(--ink)' }));
  g.append(sv('text', { x, y: y + r + 22, class: 'halo', 'text-anchor': 'middle', 'font-weight': 600, fill: 'var(--ink)' }, `${dirName(wd)}풍`));
  g.append(sv('text', { x, y: y + r + 38, class: 'halo mono', 'text-anchor': 'middle' }, `${f1(ws)} m/s`));
}
function drawMap(opt = {}) {
  const W = PAD * 2 + MAPW * SC, H = PAD * 2 + MAPH * SC;
  const svg = sv('svg', { class: 'map', viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': '가상 산업단지 개략도: 사업장과 측정소 위치' });
  const coast = [[10.5, 9], [10.05, 7.6], [10.35, 6.1], [9.95, 4.6], [10.3, 3], [9.9, 1.4], [10.25, 0], [MAPW, 0], [MAPW, 9]];
  svg.append(sv('polygon', { class: 'sea', points: coast.map(p => `${MX(p[0])},${MY(p[1])}`).join(' ') }));
  svg.append(sv('text', { x: MX(10.8), y: MY(4.4), 'text-anchor': 'middle', fill: 'var(--data)', 'font-weight': 600 }, '바다'));
  svg.append(sv('rect', { class: 'ind', x: MX(5.9), y: MY(6.3), width: 3.75 * SC, height: 4.9 * SC, rx: 14 }));
  svg.append(sv('text', { x: MX(6.05), y: MY(6.05), 'font-weight': 600 }, '가상 산업단지'));
  [['M1', 1.0], ['M2', 0.85], ['M5', 0.8], ['M6', 0.85]].forEach(([c, r]) => { const s = STN[STI[c]]; svg.append(sv('circle', { class: 'res', cx: MX(s.x), cy: MY(s.y), r: r * SC })); });
  if (opt.ray) { // 역추적: 측정소에서 바람이 불어오는 쪽으로 선
    const st = STN[STI[opt.ray.st]], rad = opt.ray.wd * Math.PI / 180, L = 6;
    svg.append(sv('path', { d: `M${MX(st.x)},${MY(st.y)} L${MX(st.x + Math.sin(rad - 0.45) * L)},${MY(st.y + Math.cos(rad - 0.45) * L)} L${MX(st.x + Math.sin(rad + 0.45) * L)},${MY(st.y + Math.cos(rad + 0.45) * L)} Z`, fill: 'color-mix(in srgb, var(--warn) 22%, transparent)', stroke: 'none' }));
    svg.append(sv('line', { x1: MX(st.x), y1: MY(st.y), x2: MX(st.x + Math.sin(rad) * L), y2: MY(st.y + Math.cos(rad) * L), stroke: 'var(--ink-2)', 'stroke-dasharray': '5 4', 'stroke-width': 1.5 }));
  }
  for (const s of SITES) {
    const hl = opt.hl && opt.hl.includes(s.code);
    const g = sv('g', { class: 'site' + (hl ? ' hl' : ''), transform: `translate(${MX(s.x)},${MY(s.y)})`,
      onmousemove: e => showTip(e, `<b>${esc(s.name)}</b><br>${CLSN[s.cls]} · ${s.zone}지역<br>방지시설: ${esc(s.facility)}`), onmouseleave: hideTip });
    g.append(sv('rect', { x: -13, y: -13, width: 26, height: 26, rx: 5 }));
    g.append(sv('text', { class: 'c', x: 0, y: 5.5, 'text-anchor': 'middle' }, s.name[0]));
    g.append(sv('text', { class: 'halo', x: 0, y: 30, 'text-anchor': 'middle' }, SHORT[s.code]));
    svg.append(g);
  }
  for (const st of STN) {
    const v = opt.vals ? opt.vals[st.code] : null;
    const L = v != null ? lvl(v) : null;
    const g = sv('g', { class: 'st', transform: `translate(${MX(st.x)},${MY(st.y)})`, style: opt.onSt ? 'cursor:pointer' : null,
      onclick: opt.onSt ? () => opt.onSt(st.code) : null,
      onmousemove: e => showTip(e, `<b>${st.code} ${esc(st.name)}</b>${v != null ? `<br>복합악취 <b>${f1(v)}</b>배 · ${L.t}` : ''}`), onmouseleave: hideTip });
    if (opt.sel === st.code) g.append(sv('circle', { r: 20, fill: 'none', stroke: 'var(--ink)', 'stroke-width': 2 }));
    g.append(sv('circle', { class: 'o', r: 14, fill: L ? LVC[L.k] : 'var(--ink-3)' }));
    g.append(sv('text', { x: 0, y: 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: L && L.k === 'critical' ? '#fff' : 'var(--ink)' }, st.code));
    const left = LBL_LEFT.has(st.code), lx = left ? -20 : 20, an = left ? 'end' : 'start';
    g.append(sv('text', { class: 'halo', x: lx, y: -3, 'text-anchor': an }, st.name));
    if (v != null) g.append(sv('text', { class: 'v halo', x: lx, y: 15, 'text-anchor': an }, `${f1(v)}배 ${L.t}`));
    svg.append(g);
  }
  if (opt.wind) { const g = sv('g'); windCompass(g, opt.wind.wd, opt.wind.ws, W - PAD - 44, PAD + 46); svg.append(g); }
  const sb = sv('g', { transform: `translate(${MX(0.4)},${MY(0.35)})` });
  sb.append(sv('line', { x1: 0, y1: 0, x2: SC, y2: 0, stroke: 'var(--ink-2)', 'stroke-width': 2 }));
  sb.append(sv('text', { x: SC / 2, y: -5, 'text-anchor': 'middle' }, '1 km'));
  svg.append(sb);
  return svg;
}

/* ================= 차트 ================= */
// 꺾은선: series [{name, color, vals, dash}], xs(ms)
function lineChart({ xs, series, refs = [], height = 230, yMax, unit = '', tipExtra, xFmt = 'md', marks = [] }) {
  const W = 760, H = height, L = 40, R = 14, T = 12, B = 26;
  const all = series.flatMap(s => s.vals).filter(v => v != null);
  const ymax = yMax || Math.max(...all, ...refs.map(r => r.v)) * 1.08;
  const x = i => L + (W - L - R) * i / Math.max(1, xs.length - 1), y = v => T + (H - T - B) * (1 - v / ymax);
  const svg = sv('svg', { class: 'chart', viewBox: `0 0 ${W} ${H}` });
  const step = ymax > 200 ? 100 : ymax > 80 ? 20 : ymax > 40 ? 10 : ymax > 16 ? 5 : ymax > 6 ? 2 : ymax > 2 ? 0.5 : 0.1;
  for (let v = 0; v <= ymax + 1e-9; v += step) {
    svg.append(sv('line', { class: 'grid', x1: L, x2: W - R, y1: y(v), y2: y(v) }));
    svg.append(sv('text', { x: L - 6, y: y(v) + 4, 'text-anchor': 'end' }, +v.toFixed(2)));
  }
  refs.forEach(r => {
    if (r.v > ymax) return;
    svg.append(sv('line', { x1: L, x2: W - R, y1: y(r.v), y2: y(r.v), stroke: r.color || 'var(--ink-3)', 'stroke-width': 1.2, 'stroke-dasharray': '6 3' }));
    svg.append(sv('text', { x: W - R - 2, y: y(r.v) - 4, 'text-anchor': 'end', class: 'halo', style: 'font-weight:600' }, r.label));
  });
  // x 눈금: 'md'는 자정마다(기간이 길면 이틀마다), 'h'는 3시간마다
  const days = xs.length / 24;
  xs.forEach((ms, i) => {
    const d = new Date(ms), hr = d.getUTCHours();
    const show = xFmt === 'md' ? (hr === 0 && (days <= 8 || d.getUTCDate() % 2 === 0)) : (hr % 3 === 0);
    if (!show) return;
    svg.append(sv('line', { class: 'ax', x1: x(i), x2: x(i), y1: H - B, y2: H - B + 4 }));
    svg.append(sv('text', { x: x(i), y: H - 8, 'text-anchor': 'middle' }, xFmt === 'md' ? tf(ms, 'md') : tf(ms, 'h')));
  });
  svg.append(sv('line', { class: 'ax', x1: L, x2: W - R, y1: H - B, y2: H - B }));
  marks.forEach(m => svg.append(sv('rect', { x: x(m.a), y: T, width: Math.max(2, x(m.b) - x(m.a)), height: H - T - B, fill: 'color-mix(in srgb, var(--warn) 18%, transparent)' })));
  series.forEach((s, si) => {
    let d = '', on = false;
    s.vals.forEach((v, i) => { if (v == null) { on = false; return; } d += (on ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1); on = true; });
    if (s.area) svg.append(sv('path', { d: d + `L${x(s.vals.length - 1)},${y(0)}L${x(0)},${y(0)}Z`, fill: s.color, opacity: 0.12 }));
    svg.append(sv('path', { d, fill: 'none', stroke: s.color, 'stroke-width': 2, 'stroke-dasharray': s.dash || null, 'vector-effect': 'non-scaling-stroke', 'stroke-linejoin': 'round' }));
    const li = s.vals.length - 1;
    if (s.vals[li] != null) svg.append(sv('circle', { cx: x(li), cy: y(s.vals[li]), r: 3.5, fill: s.color, stroke: 'var(--surface)', 'stroke-width': 2 }));
  });
  const cross = sv('line', { x1: 0, x2: 0, y1: T, y2: H - B, stroke: 'var(--ink-3)', 'stroke-width': 1, opacity: 0 });
  svg.append(cross);
  const hit = sv('rect', { x: L, y: T, width: W - L - R, height: H - T - B, fill: 'transparent' });
  hit.addEventListener('mousemove', e => {
    const bb = svg.getBoundingClientRect(), px = (e.clientX - bb.left) / bb.width * W;
    const i = Math.max(0, Math.min(xs.length - 1, Math.round((px - L) / (W - L - R) * (xs.length - 1))));
    cross.setAttribute('x1', x(i)); cross.setAttribute('x2', x(i)); cross.setAttribute('opacity', 1);
    showTip(e, `${tf(xs[i], 'dh')}<br>` + series.map(s => `<span style="color:${s.color}">●</span> ${esc(s.name)} <b>${s.vals[i] == null ? '-' : f1(s.vals[i])}</b>${unit}`).join('<br>') + (tipExtra ? '<br>' + tipExtra(i) : ''));
  });
  hit.addEventListener('mouseleave', () => { cross.setAttribute('opacity', 0); hideTip(); });
  svg.append(hit);
  return svg;
}
function sparkline(vals, w = 120, hgt = 28) {
  const mx = Math.max(15, ...vals), x = i => i * w / (vals.length - 1), y = v => hgt - 2 - (hgt - 4) * v / mx;
  const svg = sv('svg', { viewBox: `0 0 ${w} ${hgt}`, width: '100%', height: hgt, preserveAspectRatio: 'none', 'aria-hidden': 'true' });
  svg.append(sv('line', { x1: 0, x2: w, y1: y(15), y2: y(15), stroke: 'var(--serious)', 'stroke-dasharray': '3 3', 'stroke-width': 1, 'vector-effect': 'non-scaling-stroke' }));
  const d = vals.map((v, i) => (i ? 'L' : 'M') + x(i).toFixed(1) + ',' + y(v).toFixed(1)).join('');
  svg.append(sv('path', { d: d + `L${w},${hgt}L0,${hgt}Z`, fill: 'var(--data)', opacity: 0.12 }));
  svg.append(sv('path', { d, fill: 'none', stroke: 'var(--data)', 'stroke-width': 1.5, 'vector-effect': 'non-scaling-stroke' }));
  return svg;
}
// 가로 막대 목록
function barList(items, { max, fmt = v => v } = {}) {
  const m = max || Math.max(...items.map(i => i.value), 1e-9);
  return h('div', { class: 'bars' }, items.map(it => h('div', {
    class: 'bar' + (it.top ? ' top' : ''),
    onmousemove: it.tip ? e => showTip(e, it.tip) : null, onmouseleave: it.tip ? hideTip : null
  }, h('span', { class: 'lb', title: it.label }, it.label), h('span', { class: 'tr' }, h('span', { class: 'fi', style: `width:${Math.max(0.5, it.value / m * 100)}%` })), h('span', { class: 'v' }, it.display ?? fmt(it.value)))));
}
function seg(options, value, onChange, label) {
  const box = h('div', { class: 'seg', role: 'group', 'aria-label': label || null });
  options.forEach(([v, t]) => box.append(h('button', { type: 'button', 'aria-pressed': String(v === value), onclick: () => { $$('button', box).forEach(b => b.setAttribute('aria-pressed', 'false')); box.querySelector(`[data-v="${CSS.escape(String(v))}"]`).setAttribute('aria-pressed', 'true'); onChange(v); }, 'data-v': v }, t)));
  return box;
}

/* ================= 앱 상태 & 라우팅 ================= */
const APP = { pages: {}, built: {}, upd: {} };
function go() {
  let id = (location.hash || '#home').slice(1);
  if (!APP.pages[id]) id = 'home';
  if (!APP.built[id]) {
    const sec = h('section', { class: 'page', id: 'p-' + id });
    $('#main').append(sec); APP.built[id] = sec; APP.pages[id](sec);
  } else if (APP.upd[id]) APP.upd[id]();
  $$('section.page').forEach(s => s.classList.toggle('on', s === APP.built[id]));
  $$('nav.dir a').forEach(a => { const on = a.dataset.p === id; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  hideTip();
}
function nav(id) { if (location.hash === '#' + id) go(); else location.hash = id; window.scrollTo({ top: 0 }); }
const pageHead = (eyebrow, title, lead) => h('div', { class: 'page-head' }, h('div', { class: 'eyebrow' }, eyebrow), h('h1', null, title), lead ? h('p', { class: 'lead' }, lead) : null);

/* 내일 예보 (홈·예측센터 공용) */
const TOM = (() => {
  const T = FC.tomorrow, s0 = tparse(T.start);
  const rows = T.wd.map((wd, i) => ({ ms: s0 + i * HOUR, wd, ws: T.ws[i], t: T.t[i] }));
  rows.forEach(r => r.p = predictAt(r.ms, r.wd, r.ws, r.t));
  let best = { v: -1 };
  rows.forEach((r, i) => r.p.forEach((v, j) => { if (v > best.v) best = { v, i, j }; }));
  return { rows, best };
})();

/* ================= 00 종합안내 ================= */
APP.pages.home = sec => {
  const cur = Object.fromEntries(STN.map(s => [s.code, MON.st[s.code].ou[nowIdx]]));
  const lvCount = { good: 0, warn: 0, serious: 0, critical: 0 };
  Object.values(cur).forEach(v => lvCount[lvl(v).k]++);
  const b = TOM.best, bst = STN[b.j];
  const steps = [
    ['01', '접수 · 문진', 'intake', '주민·고객이 말로 설명한 냄새를 분석해 의심 물질, 필요한 검사, 바람 기준 의심 사업장을 안내합니다.', h('span', null, '냄새 유형 ', h('b', null, '10'), '종 · 사업장 ', h('b', null, SITES.length), '곳 연계')],
    ['02', '진단', 'diagnosis', '22종 지정악취물질 분석값의 구성비(냄새 지문)로 배출원 업종을 판독하고 기여율·기준 초과를 판정합니다.', h('span', null, '미지 시료 판독 정확도 ', h('b', null, pct(D.clf.te_acc, 0)))],
    ['03', '해결', 'treatment', '원인 물질의 성질에 맞춰 세정·마이크로버블·바이오필터·RTO 등 방지시설 조합과 개략 규모를 처방합니다.', h('span', null, '처방 규칙 ', h('b', null, '7'), '개 물질군')],
    ['04', '예측', 'forecast', '과거 1년의 유사 기상 사례로 측정소별 악취를 시간 단위로 예보합니다.', h('span', null, '24시간 내 최고 ', h('b', null, f1(b.v)), `배 · ${bst.code} ${new Date(TOM.rows[b.i].ms).getUTCHours()}시`)],
    ['05', '관리', 'monitoring', '측정소 6곳의 연속 측정값으로 경보를 띄우고, 풍향과 센서 지문으로 원인 사업장을 역추적합니다.', h('span', null, '현재 ', h('b', null, lvCount.serious + lvCount.critical), '곳 주의 이상 · ', h('b', null, lvCount.warn), '곳 관심')],
  ];
  sec.append(
    h('div', { class: 'hero hero-card' },
      h('div', { class: 'page-head' },
        h('div', { class: 'eyebrow' }, '바로고시스템 · 종합안내'),
        h('h1', null, '악취를 환자처럼 접수하고, 진단하고, 처방하고, 예보하고, 관리합니다'),
        h('p', { class: 'lead' }, '‘바로고시스템’은 악취종합병원의 전 과정을 한곳에서 쓰는 웹 플랫폼입니다. 고객은 냄새를 설명해 원인과 해결책을 안내받고, 직원은 측정 현황과 분석 기록을 바로 찾습니다. 회사 유튜브 영상 232개와 홈페이지 자료도 진료 흐름에 맞춰 연결했습니다.')),
      h('div', { class: 'axes', 'aria-label': '통합솔루션 4축' }, ['진단', '해결', '예측', '관리'].map(t => h('span', null, t)))),
    h('div', { class: 'journey' }, steps.map(([no, nm, id, what, live]) => h('a', { class: 'jstep', href: '#' + id }, h('span', { class: 'no' }, no), h('span', { class: 'nm' }, nm), h('span', { class: 'what' }, what), h('span', { class: 'live' }, live)))),
    h('a', { class: 'emr-bar', href: '#records' }, h('b', null, '전자차트'), h('span', { style: 'flex:1 1 300px' }, `분석 기록 ${REC.length}건(사업장 8곳, ${REC[0].ts.slice(0, 7)} ~ ${REC[REC.length - 1].ts.slice(0, 7)})을 “작년 여름 하수처리장 황화수소 가장 높았던 날”처럼 말로 검색하고, 엑셀 파일을 올려 함께 찾을 수 있습니다.`), h('span', { class: 'faint' }, '→')),
    h('div', { class: 'grid2', style: 'grid-template-columns:minmax(0,7fr) minmax(0,5fr)' },
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, h('h3', null, '지금 병동 현황'), h('span', { class: 'small faint mono' }, tf(NOW, 'full') + ' 기준')),
        drawMap({ vals: cur, wind: { wd: MON.wd[nowIdx], ws: MON.ws[nowIdx] }, onSt: c => { APP.monSel = c; nav('monitoring'); } }),
        h('p', { class: 'small muted', style: 'margin-top:8px' }, '원은 측정소(색 = 악취 단계), 사각형은 사업장입니다. 측정소를 누르면 관리센터로 이동합니다.')),
      h('div', { class: 'card stack' },
        h('h3', null, '측정소별 현재 값'),
        h('div', { class: 'tbl-wrap' }, h('table', null,
          h('thead', null, h('tr', null, h('th', null, '측정소'), h('th', { class: 'r' }, '복합악취(배)'), h('th', null, '단계'))),
          h('tbody', null, STN.map(st => h('tr', { class: 'click', onclick: () => { APP.monSel = st.code; nav('monitoring'); } },
            h('td', null, h('b', null, st.code), ' ', st.name), h('td', { class: 'r mono' }, f1(cur[st.code])), h('td', null, lvTag(cur[st.code]))))))),
        h('p', { class: 'small muted' }, '단계 구분: 정상 10배 미만 · 관심 10~15배 · 주의 15~30배 · 경보 30배 이상 (부지경계선 기타지역 기준 15배를 참고한 시연용 구분)'),
        h('div', { class: 'note' }, `AI 기능 요약 — 냄새 지문 판독: 최근 3개월 미지 시료 ${D.clf.n_te}건 중 ${pct(D.clf.te_acc, 0)} 정답 · 악취 예보: 시간대 평균 대비 평균오차 ${pct(1 - sum(FC.mae) / sum(FC.mae_base), 0)} 감소 · 민원 역추적: 1순위 후보 적중 ${pct(D.bt.top1, 0)}(무작위 13%) · `, h('a', { href: '#data' }, '검증 자세히 보기'))))
  );
};
