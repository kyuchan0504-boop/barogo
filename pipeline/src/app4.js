/* ================= 회사 자원 연계: 유튜브 영상 · 홈페이지 ================= */
const VID = D.videos, VIDI = Object.fromEntries(VID.map(v => [v.id, v]));
const VCAT = { I: '회사·종합소개', D: '진단·분석', S: '해결·설계시공', P: '예측·관리계획', M: '모니터링·관제', N: '센서·신기술', C: '탄소중립' };
const VTAG = { auto: '자동차', live: '축산', bld: '건축자재', sew: '하수·슬러지', ind: '산업체 사례', en: 'English', short: '쇼츠' };
const HP = 'http://www.ts-ei.com';
const LINKS = [
  { g: '접수 · 문의', k: 'intake', items: [['온라인 문의(견적)', 'http://test.ts-ei.com:90/ts_ap_est/estimate_init.html'], ['분석 의뢰', 'http://test.ts-ei.com:90/ts_ap_cu/'], ['온라인 문의', HP + '/inquiry'], ['카탈로그', HP + '/catalog']] },
  { g: '진단 · 분석', k: 'diagnosis', items: [['악취원인규명', HP + '/cause'], ['악취기술진단', HP + '/OTD'], ['환경분석(악취)', HP + '/foul_smell'], ['건축자재', HP + '/building'], ['자동차 내장재', HP + '/automobile'], ['소형 챔버', HP + '/small_chamber'], ['대형 챔버', HP + '/enlarge_chamber'], ['분야별 시험분석방법', HP + '/exam'], ['분석 보유장비', HP + '/equipment']] },
  { g: '해결 · 설계시공', k: 'treatment', items: [['엔지니어링(설계·시공)', HP + '/construction'], ['관리용역', HP + '/service'], ['엔지니어링 실적', HP + '/consulting'], ['MBSS 마이크로버블', HP + '/MBSS'], ['NET 신기술·혁신제품', HP + '/ts_net'], ['탈취제', HP + '/deodorant']] },
  { g: '예측 · 관리 · 관제', k: 'monitoring', items: [['악취통합관리 소개', HP + '/management'], ['빅데이터·인공지능', HP + '/bigdata'], ['악취 모니터링 시스템', HP + '/m_odor_monitoring'], ['지능형 악취측정 장비', HP + '/OAE'], ['악취추적', HP + '/trace'], ['실시간 악취감시차량', HP + '/rt_car'], ['모니터링·포집 시스템', HP + '/odor_sampling'], ['장비 라인업', HP + '/omslineup'], ['통합관제실', HP + '/ICRoom']] },
  { g: '연구 · 신사업', k: 'rnd', items: [['센서 개발 센터', HP + '/sensor'], ['NC센서', HP + '/airconditioner_bench'], ['마약탐지 전자코', HP + '/ggg'], ['악취추적로봇', HP + '/odor_kit'], ['반도체', HP + '/FABCenter'], ['탄소중립', HP + '/ts_spray'], ['열분해', HP + '/Pyrolysis']] },
  { g: '회사 안내', k: 'company', items: [['회사소개', HP + '/outline'], ['연혁', HP + '/history'], ['특허·인증', HP + '/certification'], ['조직도', HP + '/organization'], ['회사 둘러보기', HP + '/CompanyTour'], ['공지사항', HP + '/notice'], ['보도자료', HP + '/news'], ['메일링', HP + '/mailing'], ['English', HP + '/main_en']] },
];
const ext = (t, u, cls = 'chip') => h('a', { class: cls, href: u, target: '_blank', rel: 'noopener' }, t, ' ↗');

/* 영상 재생 창 */
function playVideo(v) {
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const m = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': v.t, onclick: e => { if (e.target === m) close(); } },
    h('div', { class: 'modal-in' },
      h('div', { class: 'modal-h' }, h('b', null, v.t), h('button', { class: 'btn sm', type: 'button', onclick: close }, '닫기')),
      h('div', { class: 'frame' }, h('iframe', { src: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`, title: v.t, allow: 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' })),
      h('div', { class: 'row small', style: 'justify-content:space-between' }, h('span', { class: 'muted' }, `${VCAT[v.c]}${v.g ? ' · ' + VTAG[v.g] : ''} · 태성환경연구소 유튜브`), h('a', { href: `https://www.youtube.com/watch?v=${v.id}`, target: '_blank', rel: 'noopener' }, '유튜브에서 보기 ↗'))));
  document.body.append(m); document.addEventListener('keydown', onKey);
}
function vCard(v) {
  return h('button', { class: 'vcard', type: 'button', onclick: () => playVideo(v) },
    h('span', { class: 'thumb' }, h('img', { src: `https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`, alt: '', loading: 'lazy' }), v.d ? h('span', { class: 'dur mono' }, v.d) : null, h('span', { class: 'play', 'aria-hidden': 'true' }, '▶')),
    h('span', { class: 'vt' }, v.t), h('span', { class: 'vm' }, VCAT[v.c] + (v.g ? ' · ' + VTAG[v.g] : '')));
}
const vids = ids => ids.map(i => VIDI[i]).filter(Boolean);

/* 센터별 관련 자료 */
const REL = {
  intake: { v: ['Ra6sWXzplSY', '4XyuvEA8C1k', 'CvKVecloF1k', '1tu2rkYij2o'], l: 'intake' },
  diagnosis: { v: ['OCy9s_6FR1Y', 'qDyHnUMmHnA', 'ON8HULK9kgc', 'o35_OJQRy3o'], l: 'diagnosis' },
  treatment: { v: ['m0qDXr-THUA', 'XaD_EFCeUhU', 'lrEafJ8kpcY', 'B2UaXKCRgnU'], l: 'treatment' },
  forecast: { v: ['3a22gD0nQwo', 'pUGMy1kA2vw', 'Tiu44QpiUcI', 'zNsd1LEuq70'], l: 'monitoring' },
  monitoring: { v: ['Nv_6FU_roMQ', 'yQom_f6-4aM', 'JT1t6yaAhFI', '8rQL2wxcsYM'], l: 'monitoring' },
  records: { v: ['-HS_ziOyHbY', 'jE9m_Zm8o60', 'sp22rKyIqUI'], l: 'monitoring' },
};
const VFILTER = { cat: '', tag: '', q: '' };
function relCard(id) {
  const r = REL[id], L = LINKS.find(x => x.k === r.l);
  return h('div', { class: 'card stack' },
    h('div', { class: 'card-h' }, h('h3', null, '관련 영상 · 회사 자료'), h('a', { href: '#videos', class: 'small' }, '영상관 전체 보기 →')),
    h('div', { class: 'vgrid' }, vids(r.v).map(vCard)),
    h('div', { class: 'row' }, h('span', { class: 'small muted' }, '회사 홈페이지:'), L.items.slice(0, 6).map(([t, u]) => ext(t, u))));
}
Object.keys(REL).forEach(id => { const f = APP.pages[id]; APP.pages[id] = sec => { f(sec); sec.append(relCard(id)); }; });

/* 문진 결과에 맞춘 영상 추천 */
const TYPE_V = { sulfur: { g: 'sew' }, amine: { re: /자원화|슬러지|매립|폐수/ }, manure: { g: 'live' }, fatty: { g: 'live' }, aldehyde: { re: /아스콘|저탄장|염직|스크러버/ }, solvent: { re: /voc|염직|칼텍스|한화|스크러버/i }, chem: { g: 'ind' }, chlorine: { re: /세정탑|스크러버/ }, musty: { g: 'sew' }, ferment: { re: /자원화|매립|집하|액비/ } };
function vidsForType(id, n = 4) {
  const f = TYPE_V[id]; if (!f) return [];
  const m = VID.filter(v => v.g !== 'en' && (f.g ? v.g === f.g : f.re.test(v.t)));
  return m.sort((a, b) => (a.c === 'S' ? 0 : 1) - (b.c === 'S' ? 0 : 1)).slice(0, n);
}
const _renderIntake = renderIntake;
renderIntake = function (out, outB, txt, areaCode, when) {
  _renderIntake(out, outB, txt, areaCode, when);
  const top = analyzeText(txt).find(r => r.hits.length);
  if (!top) return;
  const list = vidsForType(top.t.id);
  if (list.length) outB.append(h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h3', null, `${top.t.nm} 악취, 이렇게 해결했습니다`), h('span', { class: 'small faint' }, '냄새 유형에 맞춰 자동 추천')), h('div', { class: 'vgrid' }, list.map(vCard))));
};

/* ================= 영상관 ================= */
APP.pages.videos = sec => {
  const grid = h('div', { class: 'vgrid' }), cnt = h('span', { class: 'small muted' });
  const q = h('input', { type: 'text', id: 'vq', placeholder: '영상 제목 검색 (예: 스크러버, 축사, 드론)', 'aria-label': '영상 검색', value: VFILTER.q });
  const catRow = h('div', { class: 'row' }), tagRow = h('div', { class: 'row' });
  const draw = () => {
    const words = VFILTER.q.toLowerCase().split(/\s+/).filter(Boolean);
    const list = VID.filter(v => (!VFILTER.cat || v.c === VFILTER.cat) && (!VFILTER.tag || v.g === VFILTER.tag) && words.every(w => v.t.toLowerCase().includes(w)));
    grid.innerHTML = ''; list.forEach(v => grid.append(vCard(v)));
    cnt.textContent = `${list.length}개 / 전체 ${VID.length}개`;
    if (!list.length) grid.append(h('p', { class: 'muted' }, '조건에 맞는 영상이 없습니다. 검색어를 줄여 보세요.'));
    catRow.innerHTML = ''; tagRow.innerHTML = '';
    [['', '전체'], ...Object.entries(VCAT)].forEach(([k, t]) => catRow.append(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(VFILTER.cat === k), onclick: () => { VFILTER.cat = k; draw(); } }, `${t} ${k ? VID.filter(v => v.c === k).length : VID.length}`)));
    [['', '분야 전체'], ...Object.entries(VTAG)].forEach(([k, t]) => tagRow.append(h('button', { class: 'chip', type: 'button', 'aria-pressed': String(VFILTER.tag === k), onclick: () => { VFILTER.tag = k; draw(); } }, t)));
  };
  q.addEventListener('input', () => { VFILTER.q = q.value; draw(); });
  sec.append(pageHead('영상관', `회사 유튜브 영상 ${VID.length}개를 진료 흐름대로 정리했습니다`, '태성환경연구소 유튜브 채널의 모든 영상을 AI가 제목을 읽고 7개 진료 단계와 6개 분야로 분류했습니다. 영상을 누르면 이 화면에서 바로 재생됩니다.'),
    h('div', { class: 'card stack' }, h('h3', null, '처음이라면 이 영상부터'), h('div', { class: 'vgrid' }, vids(['T_mptCb0Qq8', 'CvKVecloF1k', 'm0qDXr-THUA', 'Nv_6FU_roMQ']).map(vCard))),
    h('div', { class: 'card stack' }, q, catRow, tagRow, cnt, grid));
  APP.upd.videos = () => { q.value = VFILTER.q; draw(); };
  draw();
};

/* ================= 회사 자료 ================= */
APP.pages.company = sec => {
  sec.append(pageHead('회사 자료', '회사 홈페이지의 메뉴를 진료 흐름에 맞춰 다시 묶었습니다', '태성환경연구소 홈페이지(ts-ei.com)의 주요 기능과 자료를 접수 → 진단 → 해결 → 관리 순서로 정리했습니다. 누르면 회사 홈페이지의 해당 화면이 새 창으로 열립니다.'),
    h('div', { class: 'grid2' }, LINKS.map(L => h('div', { class: 'card stack' },
      h('div', { class: 'card-h' }, h('h3', null, L.g), REL[L.k] ? h('a', { class: 'small', href: '#' + L.k }, '바로고 ' + L.g.split(' ')[0] + ' 화면 →') : null),
      h('div', { class: 'row' }, L.items.map(([t, u]) => ext(t, u)))))),
    h('div', { class: 'card stack' }, h('h3', null, '연락처'),
      h('p', null, '울산 본사: 울산광역시 울주군 온산읍 회학3길 56-20 (학남국가산업단지) · 대표전화 052-247-8691'),
      h('p', null, '인천분석센터: 인천광역시 연수구 송도미래로 30 스마트밸리 E동 1108~1110 · 대표전화 032-213-8691'),
      h('div', { class: 'row' }, ext('회사 홈페이지', HP, 'btn'), ext('유튜브 채널', 'https://www.youtube.com/@태성환경연구소', 'btn'))));
};

/* 종합안내에 대표 영상과 빠른 길 추가 */
{
  const f = APP.pages.home;
  APP.pages.home = sec => {
    f(sec);
    const quick = h('div', { class: 'grid2' },
      h('div', { class: 'card stack' }, h('h3', null, '어떤 일로 오셨나요?'),
        h('div', { class: 'who' },
          h('a', { href: '#intake' }, h('b', null, '냄새 때문에 불편해요'), h('span', null, '주민 · 고객: 냄새를 말로 설명하고 원인과 검사를 안내받기')),
          h('a', { href: '#treatment' }, h('b', null, '사업장 악취를 줄이고 싶어요'), h('span', null, '사업장: 원인 물질에 맞는 방지시설 처방 보기')),
          h('a', { href: '#monitoring' }, h('b', null, '지금 상황을 확인할게요'), h('span', null, '담당자 · 직원: 측정소 현황, 경보, 원인 역추적')),
          h('a', { href: '#records' }, h('b', null, '분석 기록을 찾을게요'), h('span', null, '직원: 분석 데이터 · 엑셀을 문장으로 검색')))),
      h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h3', null, '대표 영상'), h('a', { class: 'small', href: '#videos' }, `영상 ${VID.length}개 모두 보기 →`)),
        h('div', { class: 'vgrid two' }, vids(['T_mptCb0Qq8', 'CvKVecloF1k']).map(vCard)),
        h('div', { class: 'row' }, ext('온라인 견적 문의', LINKS[0].items[0][1]), ext('분석 의뢰', LINKS[0].items[1][1]), h('a', { class: 'chip', href: '#company' }, '회사 자료 모음'))));
    sec.insertBefore(quick, sec.children[1]);
  };
}

/* ================= 바로고 도우미 (검색형 챗봇) ================= */
const BOT_NAV = [
  [/견적|문의|의뢰|상담|비용|가격|얼마/, () => ({ t: '견적과 분석 의뢰는 회사 홈페이지에서 바로 접수할 수 있어요. 전화는 울산 본사 052-247-8691입니다.', a: [ext('온라인 문의(견적)', LINKS[0].items[0][1]), ext('분석 의뢰', LINKS[0].items[1][1])] })],
  [/위치|주소|전화|연락처|오시는|어디에 있/, () => ({ t: '울산 본사는 울주군 온산읍 회학3길 56-20(학남국가산업단지), 대표전화 052-247-8691이에요. 인천분석센터는 송도미래로 30 스마트밸리 E동, 032-213-8691입니다.', a: [h('a', { class: 'chip', href: '#company' }, '회사 자료 보기')] })],
  [/예보|예측|내일|언제 냄새/, () => ({ t: `앞으로 24시간 가장 높은 예보는 ${STN[TOM.best.j].name} ${tf(TOM.rows[TOM.best.i].ms)} ${f1(TOM.best.v)}배(${lvl(TOM.best.v).t})예요.`, a: [h('a', { class: 'chip', href: '#forecast' }, '예측센터 열기')], v: vids(['3a22gD0nQwo']) })],
  [/모니터링|관제|현재|지금 상황|측정소|민원|역추적|경보/, () => { const hot = STN.map(s => ({ s, v: MON.st[s.code].ou[nowIdx] })).sort((a, b) => b.v - a.v)[0]; return { t: `지금 가장 높은 곳은 ${hot.s.name} ${f1(hot.v)}배(${lvl(hot.v).t})예요. 관리센터에서 경보 이력과 원인 사업장 역추적을 볼 수 있어요.`, a: [h('a', { class: 'chip', href: '#monitoring' }, '관리센터 열기')], v: vids(['Nv_6FU_roMQ']) }; }],
  [/처방|방지시설|스크러버|세정탑|설계|시공|바이오필터|rto|저감/i, () => ({ t: '해결센터에서 원인 물질에 맞는 방지시설 조합과 개략 규모를 처방해 드려요.', a: [h('a', { class: 'chip', href: '#treatment' }, '해결센터 열기'), ext('엔지니어링 실적', HP + '/consulting')], v: vids(['m0qDXr-THUA', 'XaD_EFCeUhU']) })],
  [/분석값|지문|기여율|성적서|22종|지정악취|복합악취/, () => ({ t: '진단센터에서 22종 분석값으로 배출원 업종을 판독하고 기준 초과 여부를 판정해요.', a: [h('a', { class: 'chip', href: '#diagnosis' }, '진단센터 열기')], v: vids(['OCy9s_6FR1Y']) })],
  [/엑셀|데이터|기록|차트|검색/, () => ({ t: '전자차트에서 “작년 여름 하수처리장 황화수소 최고”처럼 문장으로 찾을 수 있고, 엑셀 파일을 올려 함께 검색할 수 있어요.', a: [h('a', { class: 'chip', href: '#records' }, '전자차트 열기')] })],
  [/회사|연혁|인증|특허|소개|채용/, () => ({ t: '회사 홈페이지의 메뉴를 진료 흐름대로 모아 두었어요.', a: [h('a', { class: 'chip', href: '#company' }, '회사 자료 보기'), ext('회사소개', HP + '/outline'), ext('특허·인증', HP + '/certification')], v: vids(['6Qw3GnLOj8g']) })],
];
const BOT_STOP = /^(영상|동영상|보여줘|보여|알려줘|알려|관련|있어|있나요|찾아줘|찾아|좀|대해|어떻게|뭐야|냄새|악취|태성|해줘|주세요)$/;
function searchVideos(text, n = 3) {
  const words = text.toLowerCase().replace(/[?!.,]/g, ' ').split(/\s+/).map(w => w.replace(/(을|를|이|가|은|는|에서|에|의|도|로|으로)$/, '')).filter(w => w.length >= 2 && !BOT_STOP.test(w));
  if (!words.length) return [];
  return VID.map(v => ({ v, s: words.filter(w => v.t.toLowerCase().includes(w)).length + (v.g === 'en' ? -0.5 : 0) })).filter(x => x.s >= 1).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.v);
}
function botReply(text) {
  const wantsVideo = /영상|동영상|유튜브/.test(text);
  if (wantsVideo) {
    const vs = searchVideos(text);
    if (vs.length) return { t: `관련 영상 ${vs.length}개를 찾았어요. 누르면 바로 재생돼요.`, v: vs, a: [h('a', { class: 'chip', href: '#videos' }, '영상관 열기')] };
    return { t: '제목이 맞는 영상을 찾지 못했어요. 영상관에서 분류별로 둘러보세요.', a: [h('a', { class: 'chip', href: '#videos' }, '영상관 열기')] };
  }
  const odor = analyzeText(text).find(r => r.hits.length);
  if (odor && /냄새|악취|내가|내 |나요|나는|같은/.test(text)) {
    return { t: `${odor.t.nm}(${odor.t.ex})으로 보여요.${odor.t.cmp.length ? ' 의심 물질은 ' + odor.t.cmp.slice(0, 3).map(c => CMP[CI[c]].kr).join(', ') + '예요.' : ''} 접수·문진에서 사는 곳과 바람까지 넣어 자세히 볼 수 있어요.`,
      a: [h('button', { class: 'chip', type: 'button', onclick: () => { nav('intake'); setTimeout(() => { const ta = $('#in-text'); if (ta) { ta.value = text; $('#in-run').click(); } }, 60); } }, '이 내용으로 문진하기')], v: vidsForType(odor.t.id, 2) };
  }
  for (const [re, fn] of BOT_NAV) if (re.test(text)) return fn();
  const vs = searchVideos(text);
  const pages = LINKS.flatMap(L => L.items).filter(([t]) => text.replace(/\s/g, '').includes(t.replace(/[\s·()]/g, '').slice(0, 4)));
  if (vs.length || pages.length) return { t: '사이트 안 자료에서 이런 것을 찾았어요.', v: vs, a: pages.slice(0, 3).map(([t, u]) => ext(t, u)) };
  return { t: '아직 그 질문은 답을 찾지 못했어요. 냄새를 설명해 주시거나(예: “하수구 냄새가 나요”), 아래에서 골라 보세요.', a: ['견적 문의', '축사 악취 영상', '지금 측정소 상황', '악취 예보'].map(x => h('button', { class: 'chip', type: 'button', onclick: () => botAsk(x) }, x)) };
}
let botLog;
function botSay(who, r) {
  const b = h('div', { class: 'msg ' + who }, h('div', { class: 'bubble' }, typeof r === 'string' ? r : r.t,
    r.v && r.v.length ? h('div', { class: 'vgrid two', style: 'margin-top:8px' }, r.v.map(vCard)) : null,
    r.a && r.a.length ? h('div', { class: 'row', style: 'margin-top:8px' }, r.a) : null));
  botLog.append(b); botLog.scrollTop = botLog.scrollHeight;
}
function botAsk(text) { text = text.trim(); if (!text) return; botSay('me', text); botSay('bot', botReply(text)); }
{
  botLog = h('div', { class: 'chat-log', 'aria-live': 'polite' });
  const inp = h('input', { type: 'text', id: 'chat-in', placeholder: '예: 하수구 냄새가 나요 / 스크러버 영상', 'aria-label': '도우미에게 질문' });
  const send = () => { botAsk(inp.value); inp.value = ''; };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  const panel = h('div', { class: 'chat', id: 'chat', hidden: true },
    h('div', { class: 'chat-h' }, h('span', null, h('b', null, '바로고 도우미'), h('br'), h('span', { class: 'tiny' }, '사이트 안 자료에서 찾아 답하는 검색형 챗봇')), h('button', { class: 'btn sm', type: 'button', onclick: () => { panel.hidden = true; } }, '닫기')),
    botLog, h('div', { class: 'chat-f' }, inp, h('button', { class: 'btn pri', type: 'button', onclick: send }, '보내기')));
  const fab = h('button', { class: 'chat-fab', type: 'button', 'aria-label': '바로고 도우미 열기', onclick: () => { panel.hidden = !panel.hidden; if (!panel.hidden) inp.focus(); } }, '도우미에게 묻기');
  document.body.append(panel, fab);
  botSay('bot', { t: '안녕하세요, 바로고 도우미예요. 냄새를 설명하시거나 찾는 것을 말씀해 주세요.', a: ['하수구 냄새가 나요', '견적 문의', '축사 악취 영상', '악취 예보'].map(x => h('button', { class: 'chip', type: 'button', onclick: () => botAsk(x) }, x)) });
  window.addEventListener('hashchange', () => { if (innerWidth < 700) panel.hidden = true; });
}

/* ================= 시작 ================= */
$('#nowTag').textContent = `시연 데이터 기준 ${tf(NOW, 'full')}`;
window.addEventListener('hashchange', go);
go();
