/* ================= 회사 자원: 유튜브 영상 · 홈페이지 메뉴 ================= */
const VID = D.videos, VIDI = Object.fromEntries(VID.map(v => [v.id, v]));
const VCAT = { I: '회사·종합소개', D: '진단·분석', S: '해결·설계시공', P: '예측·관리계획', M: '모니터링·관제', N: '센서·신기술', C: '탄소중립' };
const VTAG = { auto: '자동차', live: '축산', bld: '건축자재', sew: '하수·슬러지', ind: '산업체 사례', en: 'English', short: '쇼츠' };
const HP = 'http://www.ts-ei.com';
const Q_EST = 'http://test.ts-ei.com:90/ts_ap_est/estimate_init.html', Q_REQ = 'http://test.ts-ei.com:90/ts_ap_cu/';
const url = u => u.startsWith('http') ? u : HP + u;
const ext = (t, u, cls = 'chip') => h('a', { class: cls, href: url(u), target: '_blank', rel: 'noopener' }, t, ' ↗');
const vids = ids => ids.map(i => VIDI[i]).filter(Boolean);
const vfn = f => !f ? null : (typeof f === 'function' ? f : v => f.test(v.t));

/* 바로고가 더한 AI 기능 */
const TOOLS = {
  intake: { no: '01', t: '접수 · 문진', st: '원인 규명', d: '냄새를 말로 설명하면 유형 · 의심 물질 · 필요한 검사를 안내' },
  diagnosis: { no: '02', t: '진단센터', st: '진단', d: '분석값 22종의 악취지문으로 배출원 업종을 판독' },
  treatment: { no: '03', t: '해결센터', st: '설계 · 시공', d: '원인 물질에 맞는 방지시설을 설계하고 시공 일정 · 사례로 연결' },
  forecast: { no: '04', t: '예측센터', st: '모니터링 시스템', d: '측정값과 기상 조건으로 24시간 악취를 예보' },
  monitoring: { no: '05', t: '관제센터', st: '관제', d: '측정소 현황 · 경보 · 원인 사업장 역추적' },
  records: { no: 'EMR', t: '전자차트', d: '분석 기록과 엑셀을 문장으로 검색' },
  videos: { no: 'VOD', t: '영상관', d: `회사 유튜브 영상 ${VID.length}개를 분류별로 검색 · 재생` },
};
const TOOL_ORDER = ['intake', 'diagnosis', 'treatment', 'forecast', 'monitoring', 'records'];
const TOOL_KW = { intake: '냄새 민원 상담 접수 원인', diagnosis: '분석 성적서 기여율 지정악취물질 복합악취 기준 원인', treatment: '방지시설 스크러버 세정탑 바이오필터 RTO 활성탄 탈취 처방 견적', forecast: '예보 기상 바람 내일', monitoring: '측정소 경보 민원 역추적 센서 모니터링 감시', records: '엑셀 CSV 데이터 기록 검색 차트', videos: '유튜브 동영상' };

/* 회사 홈페이지(ts-ei.com)의 상단 메뉴를 같은 순서로 옮김. 항목: [이름, 주소, 한 줄 설명, 관련 영상 조건, 하위 링크] */
const SECTIONS = [
  { id: 'about', t: '회사소개', vc: 'I', h: '악취를 과학으로 푸는 회사, 태성환경연구소', ai: [],
    lead: '1997년 설립 이후 평가분석, 연구개발 · 엔지니어링, 악취관리시스템을 해 온 회사입니다. 울산 본사와 인천분석센터를 두고 있습니다.',
    vf: v => v.c === 'I', items: [
      ['개요', '/outline', '회사명, 설립 연도, 사업 분야, 본사와 분석센터 주소'],
      ['연혁', '/history', '1997년부터 올해까지의 특허 등록 · 인증 · 박람회 참가 기록'],
      ['특허/인증', '/certification', '냄새제거제 · 소취성 조성물 등 특허와 KOLAS 인정 내역', /소취성|탈취제 품질|deodorant/i],
      ['조직도', '/organization', '부서 구성'],
      ['회사 둘러보기', '/CompanyTour', '회사 전경, 실험실, FAB 센터, 환경분석실, 통합관제실, 인천 · 여수센터', /회사 소개|홈페이지 메인|박람회|Chinese/],
      ['기업부설연구소', '/research', '2002년 인정된 부설연구소의 국책과제 · 기업 협업 프로젝트 · 소재평가'],
      ['통합관제실(VIP룸)', '/ICRoom', '화학사고 · 악취 관제, 추적 차량, 민원 정보 등 관제실 운영 프로그램', /관제/],
      ['탄소중립설비실험실', '/CNLaboratory', '탄소중립 설비를 시험하는 실험실', v => v.c === 'C'],
      ['전략적 투자 유치', '/insulation', '투자 유치 안내'],
      ['개인정보보호방침', '/privacy', '개인정보 처리 방침'],
    ] },
  { id: 'semi', t: '반도체', vc: 'N', h: '악취를 읽는 ‘디지털 후각’의 뿌리, 반도체 · 센서', ai: [],
    lead: '반도체 설계와 나노 공정 기술로 가스 센서, NC센서, 전자코, 악취추적로봇을 개발합니다. 악취 모니터링 장비의 센서가 여기서 나옵니다.',
    vf: v => v.c === 'N', items: [
      ['나노 FAB센터', '/FABCenter', '웨이퍼 · 박막 기반 유해가스 센서 소자를 만드는 공정실과 장비', /클린룸|증착|화학실험실|제조 공정/],
      ['반도체 칩 설계 기술센터', '/drone', 'D램 · SCM(Storage Class Memory) 소자 설계 기술'],
      ['센서 개발 센터', '/sensor', '수소 · 암모니아 필름센서, 칩 기반 가스센서, 바이오센서 개발', /센서 개발|필름 ?센서|수소|HF/],
      ['악취추적로봇', '/odor_kit', '스스로 이동하며 구역의 악취 흐름을 보여 주는 로봇', /로봇/],
      ['NC센서', '/airconditioner_bench', '여러 가스를 동시에 감지하는 센서 어레이와 AI 패턴 분석', /NC ?센서|NC Sensors|나노복합체|센서박스|고분자/i],
      ['마약탐지 전자코', '/ggg', '공기 중 미세한 휘발성 신호를 감지하는 초소형 전자코', /전자코|마약|Drug|E-Nose/i],
    ] },
  { id: 'carbon', t: '탄소중립', vc: 'C', h: '수소 · 열분해 · 마이크로버블로 탄소중립에 대응합니다', ai: ['treatment'],
    lead: '마이크로버블 약액세정탑은 물에 잘 녹지 않는 복합악취를 처리하는 기술로 혁신제품에 선정됐습니다. 해결센터의 처방에도 이 기술이 들어갑니다.',
    vf: v => v.c === 'C' || /마이크로 ?버블|Microbubble|NET Scrubber/i.test(v.t), items: [
      ['탄소중립', '/ts_spray', '석유화학단지 · 화력발전소 등 탄소중립 시스템 구상', /탄소|소다/],
      ['열분해', '/Pyrolysis', '폐플라스틱을 열분해해 오일과 수소로 바꾸는 기술', /열분해/],
      ['혁신제품 선정', '/ts_net', '마이크로버블 약액세정탑의 구조와 특징(난용성 복합악취 처리)', /NET|마이크로 ?버블|Microbubble/i],
      ['MBSS', '/MBSS', '악취 · 미세먼지 · 유해 화학물질을 함께 줄이는 마이크로버블 스크러버 시스템', /마이크로 ?버블|Microbubble|버스정류장/i],
    ] },
  { id: 'engineering', t: '엔지니어링', vc: 'S', h: '원인 규명에서 설계 · 시공 · 운영 관리까지', ai: ['diagnosis', 'treatment'],
    lead: '악취 원인 규명 결과를 바탕으로 방지시설을 진단하고 설계 · 시공하며, 운영 관리까지 맡는 종합 엔지니어링입니다.',
    vf: v => v.c === 'S', items: [
      ['설계시공', '/construction', '기존 방지시설 진단, 풍량 산정, 덕트 · 방지시설 설계와 시공 사례', /시공|개조|엔지니어링|Engineering|스크러버|탈취기/i],
      ['악취원인규명', '/cause', '시료 채취 → 관능평가 → 기기분석으로 원인 물질을 찾는 절차', /원인|규명|최소감지/],
      ['관리용역', '/service', '순환수 교체, 약품량 조절 등 방지시설 운영 관리', /관리방안|운영관리|관리 ?계획|민원관리/],
      ['엔지니어링 실적', '/consulting', '연도별 컨설팅 · 설계 · 시공 용역 목록', v => v.g === 'ind' || v.g === 'sew'],
      ['악취기술진단', '/OTD', '공공 하수 · 분뇨 · 음식물 처리시설 등 법정 기술진단 대상과 절차', /진단|컨설팅|자원화|매립/],
      ['탈취제', '/deodorant', '분석 결과에 맞춰 개발하는 맞춤형 탈취제와 적용 시설', /탈취제|소취|deodor/i],
    ] },
  { id: 'analysis', t: '환경분석', vc: 'D', h: '보이지 않는 냄새를 숫자로 바꿉니다', ai: ['diagnosis', 'records'],
    lead: '악취, 건축자재, 자동차 내장재에서 나오는 물질을 측정 · 분석합니다. KOLAS 국제공인시험기관으로서 시험 성적을 냅니다.',
    vf: v => v.c === 'D', items: [
      ['악취', '/foul_smell', '사업장 악취 측정, 방지시설 효율 평가, 복합악취 · 지정악취물질 분석', /복합악취|지정 악취|관능|냄새평가|재현|OAE|odna|LC분석/i],
      ['건축자재', '/building', '실내 건축자재의 유해물질 방출량 평가', v => v.g === 'bld'],
      ['자동차 내장재', '/automobile', '신차 실내 내장재의 유해물질 · 냄새 평가', v => v.g === 'auto'],
      ['소형 챔버', '/small_chamber', '건축자재 방출 시험용 소형 챔버 시스템', /소형 ?챔버|chamber/i],
      ['대형 챔버', '/enlarge_chamber', '자동차 부품 · 모듈처럼 큰 시료의 VOC 방출 시험', /챔버오븐|벤치|모듈부품|형틀/],
    ] },
  { id: 'management', t: '악취통합관리', vc: 'M', h: '측정하고, 추적하고, 예보합니다', ai: ['monitoring', 'forecast', 'intake'],
    lead: '센서와 기상 자료, 다년간의 분석 데이터를 결합해 악취를 모니터링하고 발생원을 추적하는 통합 관리 시스템입니다.',
    vf: v => v.c === 'M' || v.c === 'P', items: [
      ['소개', '/management', '악취통합관리시스템의 구성: 악취 추적, 센서, 드론 포집', /통합 ?관제|통합관리|통합 모니터링|Integrated|스마트클라우드|초연결/i],
      ['지능형 악취측정 장비', '/OAE', 'AI 악취 분석 장비(OAE)', /OAE|측정기|TOMS/],
      ['악취추적', '/trace', '풍향 · 풍속과 센서 값으로 악취 모델링을 만들어 발생원을 추적', /추적/],
      ['실시간악취감시차량', '/rt_car', '이동하며 실시간으로 분석해 악취 지도를 그리는 감시 차량', /차량|시프트매/],
      ['악취 모니터링 시스템', '/m_odor_monitoring', '공단 · 처리장 주변에 설치해 냄새 종류와 세기를 실시간 측정', /모니터링/],
      ['모니터링 및 포집 시스템', '/odor_sampling', '기준을 넘으면 알람을 울리고 자동으로 시료를 포집하는 장비', /포집|드론|Drone/i],
      ['모니터링장비라인업', '/omslineup', '고정식 · 이동식 · 휴대용 장비 사양', v => /장비|휴대용|포터블|oms/i.test(v.t) && !/전자코/.test(v.t)],
      ['빅데이터 인공지능', '/bigdata', '민원 추적, 감시차량, 추적 시스템 등 실제 운영 프로그램', /예측|예보|민원/,
        [['민원 추적', 'http://219.249.140.29:23580/tsei_sv3_spjr/sub_main.do?group=G2110001'], ['악취 감시차량', 'http://219.249.140.29:21780/'], ['악취 추적 시스템', 'http://219.249.140.29:23180/smart_grid.html'], ['전국 오염도 현황', 'http://1.253.30.55:29192/']]],
    ] },
  { id: 'library', t: '기술자료', vc: '', h: '공지 · 카탈로그 · 시험방법 · 영상을 한곳에', ai: ['videos', 'records'],
    lead: '회사 홈페이지의 자료실입니다. 영상은 바로고 영상관에서 분류별로 찾고, 분석 기록은 전자차트에서 문장으로 검색할 수 있습니다.',
    vf: () => true, items: [
      ['영상 자료', '/video', '홈페이지의 영상 목록. 바로고 영상관에서 전체를 분류 · 검색할 수 있습니다'],
      ['공지사항', '/notice', '회사 소식과 행사 안내'],
      ['카달로그', '/catalog', '회사 · 제품 카탈로그 내려받기'],
      ['메일링', '/mailing', '기술 소개 메일링 모음'],
      ['기술동향', '/foreign', '반도체 등 기술 동향 기사'],
      ['분석 보유장비', '/equipment', 'GC/MS 등 분석 장비 목록'],
      ['스마트 개발 보유장비', '/SMTequipment', '센서 · 반도체 개발 장비 목록'],
      ['자료실_CI', '/ci', '회사 CI 자료'],
      ['분야별 시험분석방법', '/exam', '황화합물 · 알데하이드 · 스타이렌 등 악취 시험방법 문서'],
      ['태성환경 보도', '/news', '언론 보도 모음'],
    ] },
  { id: 'support', t: '제품소개', vc: '', h: '제품을 살펴보고, 분석 의뢰와 견적 문의를 접수합니다', ai: ['intake'],
    lead: '무엇을 문의해야 할지 모르겠다면 접수 · 문진에서 먼저 냄새를 설명해 보세요. 의심 물질과 필요한 검사를 알고 문의하면 상담이 빨라집니다.',
    vf: null, items: [
      ['제품설명', 'http://test.ts-ei.com:12131/', '제품 소개 페이지'],
      ['분석 의뢰', Q_REQ, '시험 의뢰 내용을 온라인으로 작성해 접수'],
      ['온라인 문의(견적)', Q_EST, '견적과 상담 문의'],
      ['온라인 문의 게시판', '/inquiry', '홈페이지 문의 게시판'],
    ] },
];
const SECI = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
const N_ITEMS = SECTIONS.reduce((a, s) => a + s.items.length + s.items.reduce((b, it) => b + (it[4] ? it[4].length : 0), 0), 0);

/* ---------- 영상 카드와 재생 창 ---------- */
function playVideo(v) {
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape') close(); };
  const m = h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': v.t, onclick: e => { if (e.target === m) close(); } },
    h('div', { class: 'modal-in' },
      h('div', { class: 'modal-h' }, h('b', null, v.t), h('button', { class: 'btn sm', type: 'button', onclick: close }, '닫기')),
      h('div', { class: 'frame' }, h('iframe', { src: `https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`, title: v.t, allow: 'accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen', allowfullscreen: true, referrerpolicy: 'strict-origin-when-cross-origin' })),
      h('div', { class: 'row small', style: 'justify-content:space-between' }, h('span', { class: 'muted' }, `${VCAT[v.c]}${v.g ? ' · ' + VTAG[v.g] : ''} · 태성환경연구소 유튜브`), h('a', { href: `https://www.youtube.com/watch?v=${v.id}`, target: '_blank', rel: 'noopener' }, '유튜브에서 보기 ↗'))));
  document.body.append(m); document.addEventListener('keydown', onKey);
  m.querySelector('button').focus();
}
function vCard(v, big) {
  return h('button', { class: 'vcard' + (big ? ' big' : ''), type: 'button', onclick: () => playVideo(v), 'aria-label': v.t + ' 영상 재생' },
    h('span', { class: 'thumb' }, h('img', { src: `https://i.ytimg.com/vi/${v.id}/${big ? 'hqdefault' : 'mqdefault'}.jpg`, alt: '', loading: big ? 'eager' : 'lazy' }), v.d ? h('span', { class: 'dur mono' }, v.d) : null, h('span', { class: 'play', 'aria-hidden': 'true' }, '▶')),
    h('span', { class: 'vt' }, v.t), h('span', { class: 'vm' }, VCAT[v.c] + (v.g ? ' · ' + VTAG[v.g] : '')));
}
const VFILTER = { cat: '', tag: '', q: '' };
const toolLink = id => h('a', { class: 'tlink', href: '#' + id }, h('b', null, h('span', { class: 'ai-b' }, id === 'videos' ? 'NEW' : 'AI'), TOOLS[id].t), h('span', null, TOOLS[id].d));

/* ---------- AI 진료 화면 아래: 관련 영상과 홈페이지 메뉴 ---------- */
const REL = {
  intake: { v: ['Ra6sWXzplSY', '4XyuvEA8C1k', 'CvKVecloF1k', '1tu2rkYij2o'], s: 'support' },
  diagnosis: { v: ['OCy9s_6FR1Y', 'qDyHnUMmHnA', 'ON8HULK9kgc', 'o35_OJQRy3o'], s: 'analysis' },
  treatment: { v: ['m0qDXr-THUA', 'XaD_EFCeUhU', 'lrEafJ8kpcY', 'B2UaXKCRgnU'], s: 'engineering' },
  forecast: { v: ['3a22gD0nQwo', 'pUGMy1kA2vw', 'Tiu44QpiUcI', 'zNsd1LEuq70'], s: 'management' },
  monitoring: { v: ['Nv_6FU_roMQ', 'yQom_f6-4aM', 'JT1t6yaAhFI', '8rQL2wxcsYM'], s: 'management' },
  records: { v: ['-HS_ziOyHbY', 'jE9m_Zm8o60', 'sp22rKyIqUI', 'q4k8XWMl6tg'], s: 'library' },
};
function relCard(id) {
  const r = REL[id], S = SECI[r.s];
  return h('div', { class: 'card stack' },
    h('div', { class: 'card-h' }, h('h3', null, id === 'treatment' ? '설계 · 시공 사례 영상 · 회사 홈페이지' : '관련 영상 · 회사 홈페이지'), h('a', { href: '#' + S.id, class: 'small' }, `‘${S.t}’ 메뉴 전체 보기 →`)),
    h('div', { class: 'vgrid four' }, vids(r.v).map(v => vCard(v))),
    h('div', { class: 'row' }, h('span', { class: 'small muted' }, `홈페이지 ‘${S.t}’:`), S.items.slice(0, 6).map(it => ext(it[0], it[1], 'chip co sm'))));
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
  if (list.length) outB.append(h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h3', null, `${top.t.nm} 악취, 이렇게 해결했습니다`), h('span', { class: 'small faint' }, '냄새 유형에 맞춰 자동 추천')), h('div', { class: 'vgrid four' }, list.map(v => vCard(v)))));
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
  sec.append(pageHead('기술자료 · 영상관', `회사 유튜브 영상 ${VID.length}개를 진료 흐름대로 정리했습니다`, '태성환경연구소 유튜브 채널의 모든 영상을 AI가 제목을 읽고 7개 진료 단계와 6개 분야로 분류했습니다. 영상을 누르면 이 화면에서 바로 재생됩니다.', 'co'),
    h('div', { class: 'card stack' }, h('h3', null, '처음이라면 이 영상부터'), h('div', { class: 'vgrid four' }, vids(['T_mptCb0Qq8', 'CvKVecloF1k', 'm0qDXr-THUA', 'Nv_6FU_roMQ']).map(v => vCard(v)))),
    h('div', { class: 'card stack' }, q, catRow, tagRow, cnt, grid));
  APP.upd.videos = () => { q.value = VFILTER.q; draw(); };
  draw();
};

/* ================= 홈페이지 메뉴별 통합 화면 ================= */
function sectionPage(S) {
  return sec => {
    const base = S.vf ? VID.filter(vfn(S.vf)) : [];
    const st = { item: null, all: false };
    const grid = h('div', { class: 'vgrid' }), vt = h('h3'), vtools = h('div', { class: 'row' }), more = h('div');
    const vbox = h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, vt, vtools), grid, more);
    const drawV = () => {
      const list = st.item ? VID.filter(vfn(st.item[3])) : base;
      vt.textContent = st.item ? `‘${st.item[0]}’ 관련 영상 ${list.length}개` : (S.id === 'library' ? `전체 영상 ${list.length}개` : `${S.t} 관련 영상 ${list.length}개`);
      vtools.innerHTML = '';
      if (st.item) vtools.append(h('button', { class: 'chip sm', type: 'button', onclick: () => { st.item = null; st.all = false; drawV(); } }, '분야 전체 보기'));
      vtools.append(h('a', { class: 'small', href: '#videos', onclick: () => { VFILTER.cat = st.item ? '' : S.vc; VFILTER.tag = ''; VFILTER.q = ''; } }, '영상관에서 검색 →'));
      const cols = grid.clientWidth ? getComputedStyle(grid).gridTemplateColumns.split(' ').length : 4;
      const show = st.all ? list : list.slice(0, cols >= 4 ? cols * 2 : 6);
      grid.innerHTML = ''; show.forEach(v => grid.append(vCard(v)));
      more.innerHTML = '';
      if (list.length > show.length) more.append(h('button', { class: 'btn', type: 'button', onclick: () => { st.all = true; drawV(); } }, `나머지 ${list.length - show.length}개 더 보기`));
    };
    const icard = it => {
      const f = vfn(it[3]), n = f ? VID.filter(f).length : 0;
      return h('div', { class: 'icard' }, h('b', null, it[0]), h('p', null, it[2]),
        it[4] ? h('div', { class: 'row' }, it[4].map(([t, u]) => ext(t, u, 'chip sm'))) : null,
        h('div', { class: 'row' }, ext('홈페이지에서 보기', it[1], 'chip co sm'),
          n ? h('button', { class: 'chip sm', type: 'button', onclick: () => { st.item = it; st.all = false; drawV(); vbox.scrollIntoView({ behavior: 'smooth', block: 'start' }); } }, `관련 영상 ${n}`) : null));
    };
    sec.append(pageHead(`회사 홈페이지 메뉴 · ${S.t}`, S.h, S.lead, 'co'),
      S.ai.length ? h('div', { class: 'card stack ai-card' }, h('div', { class: 'card-h' }, h('h3', null, '바로고에서 바로 해 보기'), h('span', { class: 'small muted' }, '홈페이지 메뉴에 바로고가 더한 기능')), h('div', { class: 'tgrid' }, S.ai.map(toolLink))) : null,
      h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h3', null, `홈페이지 ‘${S.t}’ 메뉴 ${S.items.length}개`), ext(`홈페이지 ${S.t}`, S.items[0][1], 'small')), h('div', { class: 'igrid' }, S.items.map(icard))),
      base.length ? vbox : null);
    if (base.length) { drawV(); requestAnimationFrame(drawV); }
  };
}
SECTIONS.forEach(S => { APP.pages[S.id] = sectionPage(S); });

/* ================= 상단 메뉴 · 모바일 메뉴 · 진료 순서 줄 ================= */
const MENU = [{ id: 'barogo', t: '바로고 AI 진료', href: '#intake', ai: true }, ...SECTIONS.map(S => ({ id: S.id, t: S.t, href: '#' + S.id, S }))];
const pageGroup = id => (TOOLS[id] && id !== 'videos') || id === 'data' ? 'barogo' : id === 'videos' ? 'library' : SECI[id] ? id : '';
function menuLinks(m) {
  if (m.ai) return [h('div', { class: 'cap' }, '원인 규명부터 관제까지'),
    ...TOOL_ORDER.map(id => h('a', { class: 'own', href: '#' + id }, h('span', { class: 'mono x' }, TOOLS[id].no), TOOLS[id].t, TOOLS[id].st ? h('span', { class: 'x', style: 'margin-left:auto;font-weight:500' }, TOOLS[id].st) : null)),
    h('div', { class: 'cap' }, '함께 보기'), h('a', { href: '#videos' }, '영상관'), h('a', { href: '#data' }, '데이터 검증')];
  const S = m.S;
  return [h('a', { class: 'all', href: '#' + S.id }, `${S.t} 한눈에 보기`, h('span', { class: 'x' }, '→')),
    ...S.ai.map(id => h('a', { class: 'own', href: '#' + id }, h('span', { class: 'ai-b' }, id === 'videos' ? 'NEW' : 'AI'), TOOLS[id].t)),
    h('div', { class: 'cap' }, '홈페이지 메뉴'),
    ...S.items.map(it => h('a', { href: url(it[1]), target: '_blank', rel: 'noopener' }, it[0], h('span', { class: 'x' }, '↗')))];
}
const gnb = $('#gnb'), drawer = $('#drawer'), menuBtn = $('#menuBtn');
{
  let hideItem = null;
  MENU.forEach(m => {
    const item = h('div', { class: 'gnb-i' + (m.ai ? ' ai' : ''), 'data-g': m.id }, h('a', { href: m.href }, m.t), h('div', { class: 'gnb-d' }, menuLinks(m)));
    item.addEventListener('mouseenter', () => { if (item !== hideItem) gnb.classList.remove('hide'); });
    item.addEventListener('click', e => { if (e.target.closest('a')) { hideItem = item; gnb.classList.add('hide'); if (document.activeElement) document.activeElement.blur(); } });
    gnb.append(item);
  });
  gnb.addEventListener('mouseleave', () => { hideItem = null; gnb.classList.remove('hide'); });
}
const setDrawer = open => { drawer.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); $('#menuBtnT').textContent = open ? '닫기' : '메뉴';
  if (open) { const wide = innerWidth > 860; $$('#drawer details').forEach((d, i) => { d.open = wide || i === 0; }); drawer.scrollTop = 0; } };
menuBtn.addEventListener('click', () => setDrawer(drawer.hidden));
const drawerIn = h('div', { class: 'drawer-in' }); drawer.append(drawerIn);
drawerIn.append(h('div', { class: 'dtop' }, h('a', { class: 'btn sm', href: '#home' }, '첫 화면'), h('button', { class: 'btn sm pri', type: 'button', onclick: () => { setDrawer(false); openBot(); } }, '안내봇 열기'), ext('온라인 문의', Q_EST, 'btn sm'), h('button', { class: 'btn sm', type: 'button', onclick: () => { setDrawer(false); openSearch(); } }, '검색'), ext('English', '/main_en', 'btn sm')),
  ...MENU.map((m, i) => h('details', { open: i === 0 }, h('summary', null, h('span', null, m.t, m.ai ? h('span', { class: 'ai-b', style: 'margin-left:8px' }, 'AI') : null)), h('div', { class: 'dl' }, menuLinks(m)))));
drawer.addEventListener('click', e => { if (e.target.closest('a')) setDrawer(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { setDrawer(false); $('#lang').open = false; } });
document.addEventListener('click', e => { if (!drawer.hidden && !e.target.closest('#drawer, #menuBtn')) setDrawer(false); if (!e.target.closest('#lang')) $('#lang').open = false; });
$('#langEn').addEventListener('click', () => { VFILTER.cat = ''; VFILTER.tag = 'en'; VFILTER.q = ''; $('#lang').open = false; });

/* ---------- 통합 검색 ---------- */
function openSearch() {
  const out = h('div', { class: 'srch-out' });
  const inp = h('input', { type: 'text', id: 'srch-q', placeholder: '메뉴 · 기능 · 영상 검색 (예: 스크러버, 악취추적, 견적)', 'aria-label': '통합 검색어' });
  const close = () => { m.remove(); document.removeEventListener('keydown', onKey); };
  const onKey = e => { if (e.key === 'Escape' && !document.querySelector('.modal:not(.top)')) close(); };
  const grp = (t, rows) => rows.length ? h('div', { class: 'srch-g' }, h('h4', null, t), rows) : null;
  const run = () => {
    const words = inp.value.toLowerCase().split(/\s+/).filter(Boolean);
    out.innerHTML = '';
    if (!words.length) { out.append(h('p', { class: 'muted small' }, '찾는 낱말을 입력하면 바로고 기능, 회사 홈페이지 메뉴, 유튜브 영상에서 한꺼번에 찾습니다.'), h('div', { class: 'row' }, ['스크러버', '악취추적', '센서', '견적', '축사', '탄소중립'].map(t => h('button', { class: 'chip', type: 'button', onclick: () => { inp.value = t; run(); } }, t)))); return; }
    const hit = t => words.every(w => t.toLowerCase().includes(w));
    const tools = [...TOOL_ORDER, 'videos'].filter(id => hit(TOOLS[id].t + ' ' + TOOLS[id].d + ' ' + (TOOLS[id].st || '') + ' ' + (TOOL_KW[id] || ''))).map(id => h('a', { class: 'srch-r', href: '#' + id, onclick: close }, h('b', null, h('span', { class: 'ai-b', style: 'margin-right:6px' }, id === 'videos' ? 'NEW' : 'AI'), TOOLS[id].t), h('span', null, TOOLS[id].d)));
    const secs = SECTIONS.filter(S => hit(S.t + ' ' + S.h)).map(S => h('a', { class: 'srch-r', href: '#' + S.id, onclick: close }, h('b', null, S.t), h('span', null, S.h)));
    const items = SECTIONS.flatMap(S => S.items.filter(it => hit(it[0] + ' ' + it[2])).map(it => h('a', { class: 'srch-r', href: url(it[1]), target: '_blank', rel: 'noopener' }, h('b', null, it[0], ' ↗'), h('span', null, S.t + ' · ' + it[2]))));
    const vs = VID.filter(v => hit(v.t));
    const any = tools.length + secs.length + items.length + vs.length;
    if (!any) { out.append(h('p', { class: 'muted' }, '찾은 결과가 없습니다. 낱말을 줄이거나 안내봇에게 물어보세요.')); return; }
    out.append(...[grp('바로고 기능 · 메뉴 화면', [...tools, ...secs]), grp(`회사 홈페이지 메뉴 ${items.length}개`, items.slice(0, 8)),
      grp(`영상 ${vs.length}개`, vs.slice(0, 8).map(v => h('button', { class: 'srch-r', type: 'button', onclick: () => playVideo(v) }, h('b', null, '▶'), h('span', { style: 'color:var(--ink)' }, v.t)))),
      vs.length > 8 ? h('a', { class: 'small', href: '#videos', onclick: () => { VFILTER.cat = ''; VFILTER.tag = ''; VFILTER.q = inp.value.trim(); close(); } }, `영상관에서 ${vs.length}개 모두 보기 →`) : null].filter(Boolean));
  };
  inp.addEventListener('input', run);
  const m = h('div', { class: 'modal top', role: 'dialog', 'aria-modal': 'true', 'aria-label': '통합 검색', onclick: e => { if (e.target === m) close(); } },
    h('div', { class: 'modal-in' }, h('div', { class: 'srch-in' }, inp, h('button', { class: 'btn', type: 'button', onclick: close }, '닫기')), out));
  document.body.append(m); document.addEventListener('keydown', onKey); run(); inp.focus();
}
$('#searchBtn').addEventListener('click', openSearch);
const PAGE_T = { home: '', data: '데이터 검증', ...Object.fromEntries(Object.entries(TOOLS).map(([k, v]) => [k, v.t])), ...Object.fromEntries(SECTIONS.map(s => [s.id, s.t])) };
function updateNav(id) {
  const g = pageGroup(id);
  $$('#gnb .gnb-i').forEach(e => e.classList.toggle('on', e.dataset.g === g));
  const flow = $('#flow'); flow.innerHTML = '';
  if (g === 'barogo') {
    const a = (pid, no, t) => h('a', { href: '#' + pid, class: pid === id ? 'on' : null, 'aria-current': pid === id ? 'page' : null }, h('span', { class: 'no' }, no), t, TOOLS[pid] && TOOLS[pid].st ? h('span', { class: 'st' }, TOOLS[pid].st) : null);
    const bar = h('nav', { class: 'flow', 'aria-label': '진료 순서: 원인 규명부터 관제까지' });
    TOOL_ORDER.slice(0, 5).forEach((pid, i) => { if (i) bar.append(h('span', { class: 'sep', 'aria-hidden': 'true' }, '›')); bar.append(a(pid, TOOLS[pid].no, TOOLS[pid].t)); });
    bar.append(h('span', { class: 'gap' }), a('records', 'EMR', '전자차트'), a('data', 'QA', '데이터 검증'));
    flow.append(bar);
    const on = bar.querySelector('.on'); if (on) bar.scrollLeft = Math.max(0, on.offsetLeft - 40);
  }
  setDrawer(false);
  document.title = (PAGE_T[id] ? PAGE_T[id] + ' | ' : '') + '바로고시스템 (악취종합병원)';
}
$('#skip').addEventListener('click', () => $('#main').focus());

/* ================= 안내봇 ================= */
const GUIDE = {
  start: { t: '안녕하세요, 바로고 안내봇이에요. 어떤 일로 오셨는지 고르면 이용 순서를 알려 드릴게요. 궁금한 것을 바로 입력하셔도 돼요.',
    o: [['냄새 때문에 불편해요', 'resident'], ['사업장 악취를 줄이고 싶어요', 'site'], ['지역 악취 · 민원을 관리해요', 'gov'], ['태성환경연구소 직원이에요', 'staff'], ['처음이라 둘러볼게요', 'tour']] },
  resident: { t: '생활 속 냄새로 불편하시군요. 이 순서로 이용해 보세요.',
    steps: [['intake', '접수 · 문진', '어떤 냄새인지 말로 적으면 냄새 유형과 의심 물질, 냄새가 올 만한 방향을 알려 드려요'], ['monitoring', '관제센터', '가까운 측정소의 지금 상태와 최근 경보를 확인해요'], ['forecast', '예측센터', '앞으로 24시간 언제 냄새가 날지 미리 봐요']],
    a: () => [ext('온라인 문의 게시판', '/inquiry')] },
  site: { t: '사업장 담당자시군요. 원인을 알아야 처방이 정확해요.',
    steps: [['diagnosis', '진단센터', '분석 성적서의 22종 농도를 넣으면 원인 물질과 기준 초과를 판정해요'], ['treatment', '해결센터', '원인 물질에 맞는 방지시설 조합과 개략 규모를 처방해요'], ['engineering', '엔지니어링 메뉴', '설계 · 시공 사례와 실적, 관련 영상을 확인해요'], ['support', '견적 문의 · 분석 의뢰', '회사 접수 화면으로 바로 연결돼요']],
    v: ['m0qDXr-THUA', 'XaD_EFCeUhU'] },
  gov: { t: '지역 악취를 관리하시는군요. 감시부터 원인 추적까지 이렇게 보세요.',
    steps: [['monitoring', '관제센터', '측정소 현황과 경보 이력, 원인 사업장 역추적을 봐요'], ['forecast', '예측센터', '기상 조건별 악취 예보로 순찰 시간을 정해요'], ['management', '악취통합관리 메뉴', '감시차량 · 드론 · 관제시스템 소개와 영상을 확인해요']],
    v: ['pUGMy1kA2vw', 'sKYc-0TMLW8'] },
  staff: { t: '직원용으로는 이 화면들이 빠릅니다.',
    steps: [['records', '전자차트', '분석 기록과 엑셀을 문장으로 검색해요'], ['monitoring', '관제센터', '경보가 난 시점의 원인 후보를 확인해요'], ['videos', '영상관', '고객 설명에 쓸 영상을 분야별로 찾아요'], ['data', '데이터 검증', '시연 데이터의 근거와 AI 정확도를 확인해요']] },
  tour: { t: '처음이시라면 대표 영상을 먼저 보고, 회사소개와 영상관을 둘러보세요.',
    steps: [['about', '회사소개', '연혁, 특허 · 인증, 회사 둘러보기'], ['videos', '영상관', `영상 ${VID.length}개를 분야별로 보기`], ['intake', '접수 · 문진', 'AI 진료를 직접 체험하기']],
    v: ['T_mptCb0Qq8', 'CvKVecloF1k'] },
};
const BOT_NAV = [
  [/이용 ?방법|사용법|어떻게 (써|이용|사용)|도움말|뭘 할 수|무엇을 할 수|처음/, () => ({ guide: 'start' })],
  [/견적|문의|의뢰|상담|비용|가격|얼마/, () => ({ t: '견적과 분석 의뢰는 회사 접수 화면으로 바로 연결돼요. 전화는 울산 본사 052-247-8691입니다.', a: [ext('온라인 문의(견적)', Q_EST), ext('분석 의뢰', Q_REQ)] })],
  [/위치|주소|전화|연락처|오시는|어디에 있/, () => ({ t: '울산 본사는 울주군 온산읍 회학3길 56-20(학남국가산업단지), 대표전화 052-247-8691이에요. 인천분석센터는 송도미래로 30 스마트밸리 E동, 032-213-8691입니다.', a: [h('a', { class: 'chip', href: '#about' }, '회사소개 보기')] })],
  [/예보|예측|내일|언제 냄새/, () => ({ t: `앞으로 24시간 가장 높은 예보는 ${STN[TOM.best.j].name} ${tf(TOM.rows[TOM.best.i].ms)} ${f1(TOM.best.v)}배(${lvl(TOM.best.v).t})예요.`, a: [h('a', { class: 'chip', href: '#forecast' }, '예측센터 열기')], v: vids(['3a22gD0nQwo']) })],
  [/모니터링|관제|현재|지금 상황|측정소|민원|역추적|경보/, () => { const hot = STN.map(s => ({ s, v: MON.st[s.code].ou[nowIdx] })).sort((a, b) => b.v - a.v)[0]; return { t: `지금 가장 높은 곳은 ${hot.s.name} ${f1(hot.v)}배(${lvl(hot.v).t})예요. 관제센터에서 경보 이력과 원인 사업장 역추적을 볼 수 있어요.`, a: [h('a', { class: 'chip', href: '#monitoring' }, '관제센터 열기'), h('a', { class: 'chip', href: '#management' }, '악취통합관리 메뉴')], v: vids(['Nv_6FU_roMQ']) }; }],
  [/처방|방지시설|스크러버|세정탑|설계|시공|바이오필터|rto|저감/i, () => ({ t: '해결센터에서 원인 물질에 맞는 방지시설 조합과 개략 규모를 처방해 드려요.', a: [h('a', { class: 'chip', href: '#treatment' }, '해결센터 열기'), h('a', { class: 'chip', href: '#engineering' }, '엔지니어링 메뉴')], v: vids(['m0qDXr-THUA', 'XaD_EFCeUhU']) })],
  [/분석값|지문|기여율|성적서|22종|지정악취|복합악취/, () => ({ t: '진단센터에서 22종 분석값으로 배출원 업종을 판독하고 기준 초과 여부를 판정해요.', a: [h('a', { class: 'chip', href: '#diagnosis' }, '진단센터 열기'), h('a', { class: 'chip', href: '#analysis' }, '환경분석 메뉴')], v: vids(['OCy9s_6FR1Y']) })],
  [/엑셀|데이터|기록|차트|검색/, () => ({ t: '전자차트에서 “작년 여름 하수처리장 황화수소 최고”처럼 문장으로 찾을 수 있고, 엑셀 파일을 올려 함께 검색할 수 있어요.', a: [h('a', { class: 'chip', href: '#records' }, '전자차트 열기')] })],
  [/회사|연혁|인증|특허|소개|채용/, () => ({ t: '회사소개 메뉴에 개요, 연혁, 특허 · 인증, 회사 둘러보기를 모아 두었어요.', a: [h('a', { class: 'chip', href: '#about' }, '회사소개 보기'), ext('연혁', '/history'), ext('특허·인증', '/certification')], v: vids(['6Qw3GnLOj8g']) })],
  [/센서|반도체|전자코|로봇/, () => ({ t: '센서와 반도체 기술은 반도체 메뉴에 모여 있어요.', a: [h('a', { class: 'chip', href: '#semi' }, '반도체 메뉴 보기')], v: vids(['ETGnnTehGkQ', 'wXGQRT6jqgA']) })],
  [/탄소|열분해|수소|mbss|마이크로 ?버블/i, () => ({ t: '탄소중립 메뉴에서 열분해, 마이크로버블 스크러버(MBSS)를 볼 수 있어요.', a: [h('a', { class: 'chip', href: '#carbon' }, '탄소중립 메뉴 보기')], v: vids(['XaD_EFCeUhU']) })],
];
const BOT_STOP = /^(영상|동영상|보여줘|보여|알려줘|알려|관련|있어|있나요|찾아줘|찾아|좀|대해|어떻게|뭐야|냄새|악취|태성|해줘|주세요)$/;
function searchVideos(text, n = 3) {
  const words = text.toLowerCase().replace(/[?!.,]/g, ' ').split(/\s+/).map(w => w.replace(/(을|를|이|가|은|는|에서|에|의|도|로|으로)$/, '')).filter(w => w.length >= 2 && !BOT_STOP.test(w));
  if (!words.length) return [];
  return VID.map(v => ({ v, s: words.filter(w => v.t.toLowerCase().includes(w)).length + (v.g === 'en' ? -0.5 : 0) })).filter(x => x.s >= 1).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.v);
}
function botReply(text) {
  if (/영상|동영상|유튜브/.test(text)) {
    const vs = searchVideos(text);
    if (vs.length) return { t: `관련 영상 ${vs.length}개를 찾았어요. 누르면 바로 재생돼요.`, v: vs, a: [h('a', { class: 'chip', href: '#videos' }, '영상관 열기')] };
    return { t: '제목이 맞는 영상을 찾지 못했어요. 영상관에서 분류별로 둘러보세요.', a: [h('a', { class: 'chip', href: '#videos' }, '영상관 열기')] };
  }
  const odor = analyzeText(text).find(r => r.hits.length);
  if (odor && /냄새|악취|내가|내 |나요|나는|같은/.test(text)) {
    return { t: `${odor.t.nm}(${odor.t.ex})으로 보여요.${odor.t.cmp.length ? ' 의심 물질은 ' + odor.t.cmp.slice(0, 3).map(c => CMP[CI[c]].kr).join(', ') + '예요.' : ''} 접수 · 문진에서 사는 곳과 바람까지 넣어 자세히 볼 수 있어요.`,
      a: [h('button', { class: 'chip', type: 'button', onclick: () => { nav('intake'); setTimeout(() => { const ta = $('#in-text'); if (ta) { ta.value = text; $('#in-run').click(); } }, 60); } }, '이 내용으로 문진하기')], v: vidsForType(odor.t.id, 2) };
  }
  for (const [re, fn] of BOT_NAV) if (re.test(text)) return fn();
  const vs = searchVideos(text);
  const flat = text.replace(/\s/g, '');
  const pages = SECTIONS.flatMap(S => S.items).filter(it => flat.includes(it[0].replace(/[\s·()\/_]/g, '').slice(0, 4)));
  if (vs.length || pages.length) return { t: '사이트 안 자료에서 이런 것을 찾았어요.', v: vs, a: pages.slice(0, 3).map(it => ext(it[0], it[1])) };
  return { t: '아직 그 질문은 답을 찾지 못했어요. 냄새를 설명해 주시거나(예: “하수구 냄새가 나요”), 아래에서 골라 보세요.', q: ['이용 방법 알려줘', '견적 문의', '축사 악취 영상', '지금 측정소 상황'] };
}
function makeBot(log) {
  const bot = {};
  bot.say = (who, r) => {
    if (typeof r === 'string') r = { t: r };
    const m = h('div', { class: 'msg ' + who }, h('div', { class: 'bubble' }, r.t,
      r.steps ? h('ol', { class: 'steps' }, r.steps.map(([id, t, d]) => h('li', null, h('a', { href: '#' + id }, h('div', null, h('b', null, t), h('span', null, d)))))) : null,
      r.v && r.v.length ? h('div', { class: 'vgrid two', style: 'margin-top:8px' }, r.v.map(v => vCard(v))) : null,
      r.a && r.a.length ? h('div', { class: 'row', style: 'margin-top:8px' }, r.a) : null,
      r.o ? h('div', { class: 'row', style: 'margin-top:8px' }, r.o.map(([t, k]) => h('button', { class: 'chip', type: 'button', onclick: () => { bot.say('me', t); bot.guide(k); } }, t))) : null,
      r.q ? h('div', { class: 'row', style: 'margin-top:8px' }, r.q.map(t => h('button', { class: 'chip', type: 'button', onclick: () => bot.ask(t) }, t))) : null));
    log.append(m);
    log.scrollTop = who === 'bot' ? Math.max(0, m.offsetTop - 10) : log.scrollHeight;
  };
  bot.guide = k => { const g = GUIDE[k]; bot.say('bot', { t: g.t, steps: g.steps, v: g.v ? vids(g.v) : null, a: g.a ? g.a() : null, o: g.o || [['다른 안내 보기', 'start']] }); };
  bot.ask = text => { text = text.trim(); if (!text) return; bot.say('me', text); const r = botReply(text); if (r.guide) bot.guide(r.guide); else bot.say('bot', r); };
  return bot;
}
function botUI(idPrefix) {
  const log = h('div', { class: 'chat-log', 'aria-live': 'polite' });
  const inp = h('input', { type: 'text', id: idPrefix + '-in', placeholder: '예: 하수구 냄새가 나요 / 스크러버 영상', 'aria-label': '안내봇에게 질문' });
  const bot = makeBot(log);
  const send = () => { bot.ask(inp.value); inp.value = ''; };
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  const foot = h('div', { class: 'chat-f' }, inp, h('button', { class: 'btn pri', type: 'button', onclick: send }, '보내기'));
  return { log, inp, foot, bot };
}
const FB = botUI('chat');
const chatPanel = h('div', { class: 'chat', id: 'chat', hidden: true, role: 'dialog', 'aria-label': '바로고 안내봇' },
  h('div', { class: 'chat-h' }, h('span', null, h('b', null, '바로고 안내봇'), h('br'), h('span', { class: 'tiny' }, '이용 순서 안내 · 사이트 안 자료 검색')), h('button', { class: 'btn sm', type: 'button', onclick: () => { chatPanel.hidden = true; } }, '닫기')),
  FB.log, FB.foot);
const chatFab = h('button', { class: 'chat-fab', type: 'button', 'aria-label': '바로고 안내봇 열기', onclick: () => { chatPanel.hidden ? openBot() : (chatPanel.hidden = true); } }, '안내봇');
function openBot() { chatPanel.hidden = false; FB.inp.focus(); }
document.body.append(chatPanel, chatFab);
FB.bot.guide('start');
window.addEventListener('hashchange', () => { if (innerWidth < 700) chatPanel.hidden = true; });

/* 회사 홈페이지 메인 화면의 소식 목록(확인한 날의 목록을 옮긴 것, 제목을 누르면 홈페이지 글로 이동) */
const NEWS = { date: '2026-11-11',
  notice: [["태성환경연구소, 'WAVE 2026' 참가 성료… 최태원 회장 방문 및 첨단 후각 기술 큰 호응", '/notice/1575'], ['태성환경연구소에서 WAVE 2026에 여러분을 초대합니다.', '/notice/1570'], ['테슬라 휴머노이드 제안 "AI에는 후각이 필요합니다."', '/notice/1560'], ['태성환경연구소①, 센서 아닌 데이터…후각 산업의 본질 바꾼다', '/notice/1557']],
  news: [['[이천] 이천하수처리장 악취 저감 컨설팅 최종보고회 개최', '/news/1539'], ['국내 중소기업이 고성능을 구현할 수 있는 차세대 D램의 새로운 설계 기술 개발', '/news/1451'], ['기존 D램 뛰어넘는 ‘3.5F2 DRAM’ 기술 개발', '/news/1450'], ['탄소중립 스크러버 자일렌 제거 효율 평가 쇼츠', '/news/1169'], ['수소 필름 센서 제작공정 영상', '/news/1166']],
  tech: [['마지막 LCD 공장, 중국에 넘기는 LG디스플레이...“우린 ‘이것’ 더 집중”', '/foreign/1426'], ["구조조정 인텔, 승승장구 AMD…'CPU 투톱' 엇갈린 운명", '/foreign/1424'], ['인텔, 사상 최대 규모 1만 5천명 감원 예고...주가도 급락', '/foreign/1423'], ['삼성-네이버, 마하1까지만 개발...AI 동맹 숨고르기', '/foreign/1421'], ["엔비디아·메타 vs 구글·애플 동맹에…AI칩 시장 '요동'", '/foreign/1420']] };

/* ================= 첫 화면: 소개 · 이용 안내 · 안내봇 ================= */
APP.pages.home = sec => {
  const cur = Object.fromEntries(STN.map(s => [s.code, MON.st[s.code].ou[nowIdx]]));
  const lvCount = { good: 0, warn: 0, serious: 0, critical: 0 };
  Object.values(cur).forEach(v => lvCount[lvl(v).k]++);
  const b = TOM.best, bst = STN[b.j];
  const stat = (n, t) => h('div', null, h('b', null, n), h('span', null, t));
  const IB = botUI('home');
  const botBox = h('div', { class: 'bot-inline' }, IB.log, IB.foot);
  const how = (t, d) => h('li', null, h('div', null, h('b', null, t), h('span', null, d)));
  const stages = [
    ['원인 규명', '01', '접수 · 문진', 'intake', '말로 설명한 냄새에서 의심 물질과 필요한 검사, 바람 기준 의심 사업장을 찾습니다.', h('span', null, '냄새 유형 ', h('b', null, ODOR_TYPES.length), '종')],
    ['진단', '02', '진단센터', 'diagnosis', '22종 분석값의 구성비(악취지문)로 배출원 업종을 판독하고 기준 초과를 판정합니다.', h('span', null, '미지 시료 정확도 ', h('b', null, pct(D.clf.te_acc, 0)))],
    ['설계', '03', '해결센터', 'treatment', '원인 물질의 성질에 맞춰 세정 · 마이크로버블 · 바이오필터 · RTO 조합과 규모를 설계합니다.', h('span', null, '설계 조건 ', h('b', null, 5), '가지 조절')],
    ['시공', '03', '해결센터 · 엔지니어링', 'engineering', '설계 · 시공 일정을 안내하고, 회사의 시공 사례 영상과 엔지니어링 실적으로 연결합니다.', h('span', null, '설계 · 시공 영상 ', h('b', null, VID.filter(v => v.c === 'S').length), '개')],
    ['모니터링 시스템', '04', '예측센터', 'forecast', '측정소 6곳의 측정값과 기상 조건으로 24시간 악취를 시간 단위로 예보합니다.', h('span', null, '24시간 내 최고 ', h('b', null, f1(b.v)), `배 · ${bst.code}`)],
    ['관제', '05', '관제센터', 'monitoring', '측정소를 감시해 경보를 내고, 풍향과 센서 성분비로 원인 사업장을 역추적합니다.', h('span', null, '주의 이상 ', h('b', null, lvCount.serious + lvCount.critical), '곳 · 관심 ', h('b', null, lvCount.warn), '곳')],
  ];
  const ico = d => h('span', { class: 'ico' }, sv('svg', { width: 20, height: 20, viewBox: '0 0 20 20', 'aria-hidden': 'true' }, sv('path', { d, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })));
  const nlist = rows => h('ul', { class: 'nlist' }, rows.map(([t, u]) => h('li', null, h('a', { href: url(u), target: '_blank', rel: 'noopener', title: t }, t))));
  const nhead = (icon, t, u, g) => { const i = ico(icon); if (g) i.classList.add('g'); return h('div', { class: 'nh' }, i, h('b', null, t), h('a', { class: 'more', href: url(u), target: '_blank', rel: 'noopener', 'aria-label': t + ' 더 보기(회사 홈페이지)' }, '+')); };
  sec.append(
    h('div', { class: 'hero2' },
      h('div', { class: 'stack' },
        h('div', { class: 'eyebrow' }, '태성환경연구소 · 악취종합병원'),
        h('h1', null, '악취의 원인 규명부터 ', h('em', null, ['진단 ·', '설계 ·', '시공 ·', '모니터링 ·'].flatMap(t => [h('span', { class: 'nb' }, t), ' '])), h('span', { class: 'nb' }, h('em', null, '관제'), '까지,'), ' 한곳에서'),
        h('p', { class: 'lead' }, `바로고시스템은 태성환경연구소 홈페이지의 메뉴와 유튜브 영상 ${VID.length}개를 그대로 담고, 그 위에 AI 진료 기능을 더한 통합 웹 플랫폼입니다. 고객은 냄새를 설명해 원인과 해결책을 안내받고, 직원은 현황과 기록을 바로 찾습니다.`),
        h('blockquote', { class: 'say' }, h('q', { class: 'big' }, '냄새를 보여드립니다'), h('cite', null, '태성환경연구소 본사 입구의 문구'), h('q', null, '악취원인규명과 설계, 시공, 관리용역까지 토탈솔루션으로 진단해드립니다.'), h('cite', null, '태성환경연구소 홈페이지의 엔지니어링 소개 문구')),
        h('div', { class: 'row' },
          h('button', { class: 'btn pri lg', type: 'button', onclick: () => { botBox.scrollIntoView({ behavior: 'smooth', block: 'center' }); IB.inp.focus({ preventScroll: true }); } }, '안내봇과 시작하기'),
          h('a', { class: 'btn lg', href: '#intake' }, '냄새 상담 바로 하기'),
          ext('온라인 견적 문의', Q_EST, 'btn lg')),
        h('div', { class: 'stats' }, stat('1997', '년 설립'), stat('KOLAS', '국제공인시험기관'), stat(VID.length, '개 영상 연결'), stat(N_ITEMS, '개 홈페이지 메뉴 연결'), stat(TOOL_ORDER.length, '가지 AI 기능'))),
      h('div', { class: 'stack' }, vCard(VIDI['T_mptCb0Qq8'], true), h('p', { class: 'small muted' }, '대표 영상을 누르면 이 화면에서 바로 재생됩니다.'))),
    h('div', { class: 'grid2' },
      h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h2', null, '안내봇에게 물어보세요'), h('span', { class: 'small muted' }, '방문 목적을 고르면 이용 순서를 알려 드려요')), botBox),
      h('div', { class: 'card stack' }, h('h2', null, '이용 방법'),
        h('ol', { class: 'how' },
          how('필요한 것을 고르거나 말하기', '안내봇에서 방문 목적을 고르거나, 상단 메뉴에서 찾는 항목을 누릅니다. 상단 메뉴는 회사 홈페이지와 같은 순서입니다.'),
          how('AI 진료 받기', '초록색 AI 표시가 붙은 기능이 바로고가 새로 더한 것입니다. 원인 규명 → 진단 → 설계 · 시공 → 모니터링 → 관제 순서로 이어집니다.'),
          how('영상과 회사 자료로 확인하기', '각 화면 아래에 관련 영상과 홈페이지 메뉴가 함께 나옵니다. 영상은 이 사이트 안에서 바로 재생됩니다.'),
          how('문의 · 의뢰하기', '견적 문의와 분석 의뢰는 회사 접수 화면으로 바로 연결됩니다.')),
        h('p', { class: 'small muted' }, '안내봇은 모든 화면 오른쪽 아래의 ‘안내봇’ 버튼으로 다시 열 수 있습니다. PC · 태블릿 · 휴대폰에서 같은 주소로 이용합니다.'))),
    h('div', { class: 'sec-h' }, h('h2', null, h('span', { class: 'ai-b', style: 'margin-right:8px;font-size:13px' }, 'AI'), '악취종합병원 전 과정'), h('p', null, '원인 규명부터 관제까지 여섯 단계를 바로고 화면이 하나씩 맡습니다')),
    h('div', { class: 'journey six' }, stages.map(([st, no, nm, id, what, live]) => h('a', { class: 'jstep', href: '#' + id }, h('span', { class: 'nm' }, st), h('span', { class: 'by' }, h('span', { class: 'mono' }, no), nm), h('span', { class: 'what' }, what), h('span', { class: 'live' }, live)))),
    h('a', { class: 'emr-bar', href: '#records' }, h('b', null, '전자차트'), h('span', { style: 'flex:1 1 300px' }, `분석 기록 ${REC.length}건을 “작년 여름 하수처리장 황화수소 가장 높았던 날”처럼 말로 검색하고, 엑셀 파일을 올려 함께 찾을 수 있습니다.`), h('span', { class: 'faint' }, '→')),
    h('div', { class: 'sec-h' }, h('h2', null, '사업 분야와 회사 자료'), h('p', null, `회사 홈페이지의 8개 메뉴에 관련 영상과 AI 기능을 함께 묶었습니다`)),
    h('div', { class: 'sgrid' }, SECTIONS.map(S => { const n = S.vf && S.id !== 'library' ? VID.filter(vfn(S.vf)).length : S.id === 'library' ? VID.length : 0;
      return h('a', { class: 'scard', href: '#' + S.id }, h('b', null, S.t), h('span', { class: 'd' }, S.h), h('span', { class: 'm' }, `메뉴 ${S.items.length}`, n ? ` · 영상 ${n}` : '', S.ai.length ? h('span', { class: 'ai-b' }, 'AI ' + S.ai.length) : null)); })),
    h('div', { class: 'card stack' }, h('div', { class: 'card-h' }, h('h3', null, '새로 올라온 영상'), h('a', { class: 'small', href: '#videos', onclick: () => { VFILTER.cat = ''; VFILTER.tag = ''; VFILTER.q = ''; } }, `영상 ${VID.length}개 모두 보기 →`)),
      h('div', { class: 'vgrid four' }, vids(['4XyuvEA8C1k', 'PO7REfpXxOM', 'vq2-MdIsaiE', 'Gjj9nQOJdvY']).map(v => vCard(v)))),
    h('div', { class: 'grid2', style: 'grid-template-columns:minmax(0,7fr) minmax(0,5fr)' },
      h('div', { class: 'card' },
        h('div', { class: 'card-h' }, h('h3', null, '지금 측정 현황'), h('span', { class: 'small faint mono' }, '시연 데이터 · ' + tf(NOW, 'full'))),
        drawMap({ vals: cur, wind: { wd: MON.wd[nowIdx], ws: MON.ws[nowIdx] }, onSt: c => { APP.monSel = c; nav('monitoring'); } }),
        h('p', { class: 'small muted', style: 'margin-top:8px' }, '원은 측정소(색 = 악취 단계), 사각형은 사업장입니다. 측정소를 누르면 관제센터로 이동합니다.')),
      h('div', { class: 'card stack' },
        h('h3', null, '측정소별 현재 값'),
        h('div', { class: 'tbl-wrap' }, h('table', null,
          h('thead', null, h('tr', null, h('th', null, '측정소'), h('th', { class: 'r' }, '복합악취(배)'), h('th', null, '단계'))),
          h('tbody', null, STN.map(st => h('tr', { class: 'click', onclick: () => { APP.monSel = st.code; nav('monitoring'); } },
            h('td', null, h('b', null, st.code), ' ', st.name), h('td', { class: 'r mono' }, f1(cur[st.code])), h('td', null, lvTag(cur[st.code]))))))),
        h('div', { class: 'note' }, `AI 기능 검증 — 악취지문 판독: 미지 시료 ${D.clf.n_te}건 중 ${pct(D.clf.te_acc, 0)} 정답 · 악취 예보: 시간대 평균 대비 평균오차 ${pct(1 - sum(FC.mae) / sum(FC.mae_base), 0)} 감소 · 원인 역추적: 1순위 적중 ${pct(D.bt.top1, 0)}(무작위 13%) · `, h('a', { href: '#data' }, '검증 자세히 보기')))),
    h('div', { class: 'sec-h' }, h('h2', null, '회사 소식 · 온라인 문의'), h('p', null, `회사 홈페이지 게시판의 최근 글(${NEWS.date} 확인) · 누르면 회사 홈페이지에서 열립니다`)),
    h('div', { class: 'newsgrid' },
      h('div', { class: 'nbox' }, nhead('M3 8v4h3l5 4V4L6 8zM14 7.5a3.5 3.5 0 0 1 0 5M16.3 5.5a6.5 6.5 0 0 1 0 9', '공지사항', '/notice'),
        h('a', { class: 'nfeat', href: url(NEWS.notice[0][1]), target: '_blank', rel: 'noopener' }, NEWS.notice[0][0]), nlist(NEWS.notice.slice(1))),
      h('div', { class: 'ncol' },
        h('div', { class: 'nbox' }, nhead('M5 3h8l3 3v11H5zM8 8h5M8 11h5M8 14h3', '태성환경 보도', '/news', true), nlist(NEWS.news)),
        h('div', { class: 'nbox sub' }, nhead('M3 17h14M5 17V9M9 17V5M13 17v-6M17 17V8', '반도체 기술동향', '/foreign', true), nlist(NEWS.tech))),
      h('div', { class: 'nq' }, h('h3', null, '온라인 문의'), h('p', null, '분석 의뢰와 견적 문의를 온라인으로 접수합니다.'),
        h('div', { class: 'tel' }, h('a', { href: 'tel:0522478691' }, 'Tel. 052-247-8691'), h('span', null, 'FAX. 052-247-8698')),
        h('div', { class: 'row', style: 'justify-content:center' }, ext('온라인 문의(견적)', Q_EST, 'btn brand'), ext('분석 의뢰', Q_REQ, 'btn')),
        h('p', { class: 'small' }, '분석 의뢰 전화 070-4861-5209 · 인천분석센터 032-213-8691'),
        h('div', { class: 'row', style: 'justify-content:center' }, ext('문의 게시판', '/inquiry', 'chip co sm'), ext('카탈로그', '/catalog', 'chip co sm')))));
  IB.bot.guide('start');
};

/* ================= 시작 ================= */
$('#nowTag').append(h('span', { class: 'n-long' }, `측정 · 분석값은 가상 시연 데이터입니다(기준 ${tf(NOW, 'full')}). 메뉴 구성 · 영상 · 홈페이지 링크는 회사의 실제 자료입니다.`), h('span', { class: 'n-short' }, '측정값은 가상 시연 데이터 · 메뉴와 영상은 실제 자료'));
window.addEventListener('hashchange', go);
go();
