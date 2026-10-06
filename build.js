// 네오아트플래닝 홈페이지 빌드 스크립트 (외부 패키지 없이 Node만으로 동작)
// 사용법: node build.js            → _site/ 에 실제 사이트 생성
//         PREVIEW=1 node build.js  → 미리보기용(모든 링크를 index.html 로 끝나게) 생성
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC = path.join(ROOT, 'src');
const OUT = path.join(ROOT, process.env.OUT || '_site');
const PREVIEW = !!process.env.PREVIEW;

const read = (f) => JSON.parse(fs.readFileSync(path.join(SRC, 'content', f), 'utf8'));
const site = read('site.json');
const stores = read('stores.json').items || [];
const ex = read('exhibitions.json');
const business = read('business.json').items || [];
const news = (read('news.json').items || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date)));

// ---------- helpers ----------
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const paras = (s) => String(s ?? '').split(/\n\s*\n|\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('');
const fmtDate = (d) => { const m = String(d || '').match(/(\d{4})-(\d{2})-(\d{2})/); return m ? `${m[1]}.${m[2]}.${m[3]}` : esc(d); };
const tel = (n) => String(n || '').replace(/[^0-9+]/g, '');
const ext = (u) => /^https?:\/\//.test(u || '');

function makeRel(depth) {
  const up = '../'.repeat(depth);
  return function rel(p) {
    if (!p) return '';
    if (ext(p) || p.startsWith('mailto:') || p.startsWith('tel:') || p.startsWith('#')) return p;
    let clean = p.replace(/^\/+/, '');
    if (clean === '' || clean.endsWith('/')) clean += PREVIEW ? 'index.html' : '';
    return (up + clean) || './';
  };
}

const NAV = [
  ['/', '홈'],
  ['/about/', '회사소개'],
  ['/stores/', '직영매장 안내'],
  ['/business/', '사업분야'],
  ['/exhibitions/', '전시기획'],
  ['/news/', '소식'],
  ['/contact/', '문의'],
];

function layout({ url, title, description, body, depth }) {
  const rel = makeRel(depth);
  const nav = NAV.map(([href, label]) => `<a href="${rel(href)}"${href === url ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  const fullTitle = url === '/' ? `${site.company} | 세계명화 레플리카 · 아트굿즈 · 명화 전시기획` : `${title} | ${site.company}`;
  const head = `<title>${esc(fullTitle)}</title>
<meta name="description" content="${esc(description || site.lead)}">
<meta property="og:title" content="${esc(fullTitle)}">
<meta property="og:description" content="${esc(description || site.lead)}">
<meta property="og:type" content="website">
<meta name="naver-site-verification" content="5f386104910a3afb9ee32b36ac5e4bb6237f8d69">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Myeongjo:wght@400;700;800&family=IBM+Plex+Sans+KR:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${rel('/assets/css/site.css')}">`;
  const page = `
<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="masthead">
  <div class="wrap masthead__row">
    <a class="brand" href="${rel('/')}"><span class="brand__mark">NEO·ART</span><span class="brand__name">${esc(site.company)}</span></a>
    <details class="menu">
      <summary aria-label="메뉴 열기"><span></span><span></span><span></span></summary>
      <nav class="menu__panel" aria-label="주 메뉴">${nav}<a class="menu__shop" href="${esc(site.smartstore)}" target="_blank" rel="noopener">온라인 아트샵 ↗</a></nav>
    </details>
    <nav class="topnav" aria-label="주 메뉴">${nav}</nav>
    <a class="shopbtn" href="${esc(site.smartstore)}" target="_blank" rel="noopener">온라인 아트샵 ↗</a>
  </div>
</header>
<main id="main">${body(rel)}</main>
<footer class="footer">
  <div class="wrap footer__grid">
    <div>
      <p class="footer__brand">${esc(site.company)}</p>
      <p>${esc(site.company_en)}</p>
      <p class="footer__links">
        <a href="${esc(site.smartstore)}" target="_blank" rel="noopener">스마트스토어</a>
        <a href="${esc(site.blog)}" target="_blank" rel="noopener">블로그</a>
        <a href="${esc(site.instagram)}" target="_blank" rel="noopener">인스타그램</a>
      </p>
    </div>
    <dl class="footer__info">
      <div><dt>대표</dt><dd>${esc(site.ceo)}</dd></div>
      <div><dt>사업자등록번호</dt><dd>${esc(site.biz_no)}</dd></div>
      <div><dt>본사</dt><dd>${esc(site.hq_address)}</dd></div>
      <div><dt>사업장</dt><dd>${esc(site.biz_address)}</dd></div>
      <div><dt>전화</dt><dd>${esc(site.phone)} · ${esc(site.mobile)}</dd></div>
      <div><dt>이메일</dt><dd>${esc(site.email)}</dd></div>
    </dl>
  </div>
  <div class="wrap footer__legal">© ${new Date().getFullYear()} ${esc(site.company_en)}</div>
</footer>
${PREVIEW ? `<script>document.addEventListener('submit',function(e){e.preventDefault();var n=document.getElementById('form-note');if(n){n.hidden=false;}});</script>` : ''}`;
  const isRootPreview = PREVIEW && depth === 0;
  if (isRootPreview) return head + '\n' + page; // 미리보기 첫 화면은 조각 형태로 게시
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${head}
</head>
<body>${page}
</body>
</html>`;
}

const figure = (rel, src, cap, cls = '') => src ? `<figure class="plate ${cls}"><img src="${rel(src)}" alt="${esc(cap || '')}" loading="lazy">${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}</figure>` : '';

const sectionHead = (eyebrow, title, lead) => `<header class="sechead"><p class="eyebrow">${esc(eyebrow)}</p><h2>${esc(title)}</h2>${lead ? `<p class="sechead__lead">${esc(lead)}</p>` : ''}</header>`;

const contactBlock = (rel, compact) => `
<section class="contact ${compact ? 'contact--compact' : ''}" id="contact">
  <div class="wrap contact__grid">
    <div class="contact__info">
      <p class="eyebrow">문의</p>
      <h2>전시 유치, 명화 구입, 공간 설치</h2>
      <p>레플리카 명화 전시와 구입, 기업 공간 명화 설치, 아트상품 공급에 관해 무엇이든 물어보세요.</p>
      <dl class="contact__dl">
        <div><dt>대표전화</dt><dd><a href="tel:${tel(site.phone)}">${esc(site.phone)}</a></dd></div>
        <div><dt>휴대전화</dt><dd><a href="tel:${tel(site.mobile)}">${esc(site.mobile)}</a></dd></div>
        <div><dt>이메일</dt><dd><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></dd></div>
      </dl>
    </div>
    <form class="form" action="https://formsubmit.co/${esc(site.form_email)}" method="POST">
      <input type="hidden" name="_subject" value="[홈페이지 문의] 네오아트플래닝">
      <input type="hidden" name="_template" value="table">
      <input type="text" name="_honey" class="hp" tabindex="-1" autocomplete="off">
      <div class="form__row">
        <label for="f-name">이름 또는 기관명</label>
        <input id="f-name" name="이름" required>
      </div>
      <div class="form__row">
        <label for="f-phone">연락처</label>
        <input id="f-phone" name="연락처" type="tel" required>
      </div>
      <div class="form__row">
        <label for="f-topic">문의 종류</label>
        <select id="f-topic" name="문의종류">
          <option>전시 유치</option><option>명화 구입</option><option>기업·공간 명화 설치</option><option>아트상품 공급·입점</option><option>기타</option>
        </select>
      </div>
      <div class="form__row">
        <label for="f-msg">내용</label>
        <textarea id="f-msg" name="내용" rows="5" required></textarea>
      </div>
      <button type="submit" class="btn btn--solid">문의 보내기</button>
      <p class="form__note" id="form-note" hidden>미리보기에서는 문의가 전송되지 않습니다. 실제 홈페이지에서는 이메일로 전달됩니다.</p>
    </form>
  </div>
</section>`;

// ---------- pages ----------
const pages = [];

pages.push({ url: '/', title: '홈', body: (rel) => `
<section class="hero">
  <div class="wrap hero__grid">
    <div class="hero__text">
      <p class="eyebrow">세계명화 레플리카 · 아트굿즈 · 명화 전시기획</p>
      <h1>${esc(site.headline).split(/,\s*/).map((t, i, a) => `<span class="nb">${t}${i < a.length - 1 ? ',' : ''}</span>`).join(' ')}</h1>
      <p class="hero__en">${esc(site.headline_en)}</p>
      <p class="hero__lead">${esc(site.lead)}</p>
      <div class="hero__cta">
        <a class="btn btn--solid" href="${rel('/exhibitions/')}">전시기획 보기</a>
        <a class="btn" href="${rel('/stores/')}">직영매장 안내</a>
      </div>
    </div>
    <figure class="hero__art">
      <img src="${rel(site.hero_image)}" alt="${esc(site.hero_caption_artist)} 〈${esc(site.hero_caption_title)}〉 레플리카">
      <figcaption>${esc(site.hero_caption_artist)} 〈${esc(site.hero_caption_title)}〉 · ${esc(site.hero_caption_note)}</figcaption>
    </figure>
  </div>
</section>

<section class="band">
  <div class="wrap">
    ${sectionHead('Painting Ovelab', '출력한 그림이 아니라, 다시 칠한 그림', '디지털 출력 위에 6~8회 유화 리터칭을 더해 붓자국과 물감의 높이, 세월이 만든 갈라짐까지 되살립니다.')}
    <ol class="steps">
      <li><img src="${rel('/assets/img/process-1.jpg')}" alt="캔버스 고해상도 프린팅" loading="lazy"><h3>원본 데이터 · 캔버스 프린팅</h3><p>해외 유명 미술관의 원본 파일을 구입해 색보정한 뒤 캔버스천에 고해상도로 출력합니다.</p></li>
      <li><img src="${rel('/assets/img/process-2.jpg')}" alt="유화 리터칭 작업" loading="lazy"><h3>Painting Ovelab 리터칭</h3><p>출력한 작품 위에 6~8회 유화 리터칭을 더해 유화의 질감과 색감을 재현합니다.</p></li>
      <li><img src="${rel('/assets/img/process-3.jpg')}" alt="원목액자 마감" loading="lazy"><h3>작품별 원목액자</h3><p>15년 경력의 액자 전문가가 작품에 가장 어울리는 원목액자를 골라 완성합니다.</p></li>
    </ol>
    <p class="more"><a href="${rel('/about/')}#replica">레플리카 명화 자세히 보기 →</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead('직영 매장', `전국 ${stores.length}곳에서 만나는 명화`, '')}
    <div class="storestrip">
      ${stores.map((s) => `<a class="storecard" href="${rel('/stores/')}#store-${stores.indexOf(s) + 1}">
        <img src="${rel((s.images || [])[0])}" alt="${esc(s.name)}" loading="lazy">
        <span class="storecard__region">${esc(s.region)}</span>
        <strong>${esc(s.name)}</strong>
        <span class="storecard__loc">${esc(s.location)}</span>
      </a>`).join('')}
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    ${sectionHead('전시기획', '문화예술회관과 함께 만든 세계명화 전시', ex.intro)}
    <div class="exgrid">
      ${(ex.packages || []).slice(0, 4).map((p) => `<article class="excard">
        <img src="${rel(p.image)}" alt="${esc(p.title)} 전시 전경" loading="lazy">
        <div><h3>${esc(p.title)}</h3><p class="excard__meta">${esc(p.works)} · ${esc(p.sections)}</p></div>
      </article>`).join('')}
    </div>
    <p class="more"><a href="${rel('/exhibitions/')}">전시 패키지와 진행 이력 보기 →</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap shopband">
    <div class="shopband__img">${figure(rel, '/assets/img/goods-5.jpg', '명화 3단 우산')}</div>
    <div class="shopband__text">
      <p class="eyebrow">온라인 아트샵</p>
      <h2>명화 액자와 아트굿즈를 집에서 주문하세요</h2>
      <p>국내 최대 규모로 보유한 세계명화 레플리카와 원목액자, 명화 우산·파우치·에코백 등 아트굿즈를 네이버 스마트스토어에서 판매합니다.</p>
      <a class="btn btn--solid" href="${esc(site.smartstore)}" target="_blank" rel="noopener">스마트스토어 바로가기 ↗</a>
    </div>
  </div>
</section>

${news.length ? `<section class="section section--tint"><div class="wrap">
  ${sectionHead('소식', '네오아트 소식', '')}
  <ul class="newslist">${news.slice(0, 3).map((n, i) => `<li><a href="${rel('/news/')}#news-${i + 1}"><time>${fmtDate(n.date)}</time><span>${esc(n.title)}</span></a></li>`).join('')}</ul>
</div></section>` : ''}

${contactBlock(rel, true)}
` });

pages.push({ url: '/about/', title: '회사소개', description: '㈜네오아트플래닝 대표 인사말, 회사 개요, 레플리카 명화와 Painting Ovelab 기법 소개', body: (rel) => `
<section class="pagehead"><div class="wrap"><p class="eyebrow">회사소개</p><h1>${esc(site.company)}</h1><p>${esc(site.company_en)}</p></div></section>

<section class="section">
  <div class="wrap greeting">
    <div class="greeting__head"><p class="eyebrow">인사말</p><h2>${esc(site.greeting_title)}</h2><p class="hero__en">${esc(site.headline_en)}</p></div>
    <div class="greeting__body prose">${paras(site.greeting)}<p class="sign">${esc(site.company)} 대표 <strong>${esc(site.ceo)}</strong></p></div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    ${sectionHead('회사 개요', '한눈에 보는 네오아트플래닝', '')}
    <div class="tablewrap"><table class="facts">
      <tr><th>회사명</th><td>${esc(site.company)} ${esc(site.company_en)}</td></tr>
      <tr><th>대표자</th><td>${esc(site.ceo)}</td></tr>
      <tr><th>본사</th><td>${esc(site.hq_address)}</td></tr>
      <tr><th>직영 매장</th><td>${stores.map((s) => `${esc(s.name)} <span class="muted">${esc(s.location)}</span>`).join('<br>')}</td></tr>
      <tr><th>사업 분야</th><td>${business.map((b) => esc(b.title)).join(' · ')}</td></tr>
      <tr><th>핵심 기술</th><td>『Painting Ovelab』 고해상도 캔버스 프린팅 + 6~8회 유화 리터칭</td></tr>
      <tr><th>문의</th><td>${esc(site.phone)} · ${esc(site.mobile)} · ${esc(site.email)}</td></tr>
    </table></div>
  </div>
</section>

<section class="section" id="replica">
  <div class="wrap">
    ${sectionHead('레플리카 명화란?', '명화를 복제하는 방법은 여러 가지입니다', '')}
    <div class="compare">
      <div><h3>아트포스터</h3><p>종이 위에 단순히 출력한 그림입니다.</p></div>
      <div><h3>모사화</h3><p>화가가 명화를 보고 비슷하게 따라 그린 그림입니다. 원작과 느낌이나 색상 차이가 커서 선호도가 낮습니다.</p></div>
      <div class="compare__ours"><h3>네오아트 레플리카</h3><p>실제 그림 재료인 캔버스천에 원본 디지털 파일을 출력하고, 유화물감으로 리터칭해 명화의 감동을 그대로 전합니다.</p></div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap ovelab">
    <div class="ovelab__text">
      <p class="eyebrow">독자개발 기법</p>
      <h2>Painting Ovelab</h2>
      <div class="prose">
        <p>원작의 색상과 세부 묘사는 디지털 프린팅으로 구현하고, 작품에 생명력을 불어넣는 유화 특유의 돌출 질감과 생생한 화면은 수작업으로 마무리합니다.</p>
        <p>디지털 출력 후 약 6~8회 유화 리터칭으로 표면을 처리해, 물감의 질감이 눈으로 느껴지고 손에 묻어날 것 같은 생생함을 살립니다. 오랜 세월이 만든 표면의 크랙(갈라짐)까지 섬세하게 표현합니다.</p>
      </div>
    </div>
    <div class="ovelab__imgs">
      ${figure(rel, '/assets/img/ovelab-1.jpg', '클로드 모네 〈푸르빌 절벽 위의 산책〉 레플리카')}
      ${figure(rel, '/assets/img/ovelab-3.jpg', '리터칭으로 살린 붓자국 질감')}
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    ${sectionHead('액자 복제', '액자까지 원작 그대로', '밀레 〈이삭줍기〉는 오르세 미술관에 걸린 원작의 액자까지 복제했습니다.')}
    <div class="pair">
      ${figure(rel, '/assets/img/frame-original.jpg', '오르세 미술관에 전시된 원작과 액자')}
      ${figure(rel, '/assets/img/frame-replica.jpg', '네오아트가 복제한 작품과 액자')}
    </div>
  </div>
</section>
` });

pages.push({ url: '/business/', title: '사업분야', description: '세계명화 제작·유통, 아트굿즈, 직영 매장, 아트상품 공급, 전시용 복제화 공급, 전시기획, 원목액자 수입', body: (rel) => `
<section class="pagehead"><div class="wrap"><p class="eyebrow">사업분야</p><h1>명화로 할 수 있는 모든 일</h1><p>제작부터 유통, 매장, 전시까지 직접 합니다.</p></div></section>
<section class="section"><div class="wrap bizlist">
  ${business.map((b, i) => `<article class="biz" id="biz-${i + 1}">
    <div class="biz__text"><p class="biz__no">${String(i + 1).padStart(2, '0')}</p><h2>${esc(b.title)}</h2><p>${esc(b.summary)}</p></div>
    <div class="biz__imgs">${(b.images || []).filter(Boolean).map((src) => `<img src="${rel(src)}" alt="${esc(b.title)}" loading="lazy">`).join('')}</div>
  </article>`).join('')}
</div></section>
` });

pages.push({ url: '/exhibitions/', title: '전시기획', description: '클림트전, 모네 & 르누아르전, 색깔여행전, 이중섭전 등 세계명화 레플리카 순회전 패키지와 진행 이력', body: (rel) => `
<section class="pagehead"><div class="wrap"><p class="eyebrow">전시기획</p><h1>세계명화 순회전</h1><p>${esc(ex.intro)}</p></div></section>

<section class="section"><div class="wrap">
  ${sectionHead('전시 패키지', '바로 유치할 수 있는 전시', '')}
  <div class="pkglist">
    ${(ex.packages || []).map((p) => `<article class="pkg">
      <img src="${rel(p.image)}" alt="${esc(p.title)} 전시 전경" loading="lazy">
      <div class="pkg__body"><h3>${esc(p.title)}</h3><p class="pkg__works">${esc(p.works)}</p><p>${esc(p.sections)}</p></div>
    </article>`).join('')}
  </div>
  <div class="includes"><h3>모든 전시에 함께 준비합니다</h3><ul>${(ex.includes || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
</div></section>

<section class="section section--tint"><div class="wrap">
  ${sectionHead('진행 이력', '2020년부터 함께한 기관', '')}
  <div class="tablewrap"><table class="history">
    <thead><tr><th>연도</th><th>전시</th><th>장소 · 기관</th></tr></thead>
    <tbody>${(ex.history || []).map((h) => `<tr><td class="num">${esc(h.year)}</td><td>${esc(h.title)}</td><td>${esc(h.venue)}</td></tr>`).join('')}</tbody>
  </table></div>
  <div class="gallery">
    ${(ex.history || []).filter((h) => h.image).map((h) => figure(rel, h.image, `${h.venue} · ${h.title} · ${h.year}`)).join('')}
  </div>
</div></section>

<section class="section"><div class="wrap">
  ${sectionHead('작품 공급', ex.supply_title || '전시기획사 작품 공급', '전시기획사에 전시용 명화 복제화를 납품합니다.')}
  <div class="supply">${(ex.supply || []).map((s) => `<article>${figure(rel, s.image, '')}<h3>${esc(s.title)}</h3><p>${esc(s.detail)}</p></article>`).join('')}</div>
</div></section>
${contactBlock(rel, true)}
` });

pages.push({ url: '/stores/', title: '직영매장 안내', description: '갤러리네오, 갤러리오라, 아트샵 오라 킨텍스·김해공항·해운대 매장 안내', body: (rel) => `
<section class="pagehead"><div class="wrap"><p class="eyebrow">직영매장 안내</p><h1>직영 매장 ${stores.length}곳</h1><p>명화 레플리카와 아트굿즈를 직접 보고 고르실 수 있습니다.</p></div></section>
<section class="section"><div class="wrap storelist">
  ${stores.map((s, i) => `<article class="store" id="store-${i + 1}">
    <div class="store__imgs">${(s.images || []).filter(Boolean).map((src, j) => `<img src="${rel(src)}" alt="${esc(s.name)} 매장 사진 ${j + 1}" loading="lazy">`).join('')}</div>
    <div class="store__text">
      <p class="eyebrow">${esc(s.region)} · ${esc(s.type)}</p>
      <h2>${esc(s.name)}</h2>
      <p>${esc(s.description)}</p>
      <dl class="store__dl">
        <div><dt>위치</dt><dd>${esc(s.address || s.location)}</dd></div>
        ${s.hours ? `<div><dt>운영시간</dt><dd>${esc(s.hours)}</dd></div>` : ''}
      </dl>
      ${s.map ? `<a class="btn" href="${esc(s.map)}" target="_blank" rel="noopener">지도 보기 ↗</a>` : ''}
    </div>
  </article>`).join('')}
</div></section>
` });

pages.push({ url: '/news/', title: '소식', description: '네오아트플래닝 매장 오픈, 전시, 신상품 소식', body: (rel) => `
<section class="pagehead"><div class="wrap"><p class="eyebrow">소식</p><h1>네오아트 소식</h1><p>매장 오픈, 전시, 신상품 소식을 전합니다.</p></div></section>
<section class="section"><div class="wrap posts">
  ${news.length ? news.map((n, i) => `<article class="post" id="news-${i + 1}">
    ${n.image ? `<img src="${rel(n.image)}" alt="" loading="lazy">` : ''}
    <div class="post__body"><time>${fmtDate(n.date)}</time><h2>${esc(n.title)}</h2><div class="prose">${paras(n.body)}</div></div>
  </article>`).join('') : '<p>아직 등록된 소식이 없습니다.</p>'}
</div></section>
` });

pages.push({ url: '/contact/', title: '문의', description: '전시 유치, 명화 구입, 기업 공간 명화 설치, 아트상품 공급 문의', body: (rel) => `
<section class="pagehead"><div class="wrap"><p class="eyebrow">문의</p><h1>무엇이든 물어보세요</h1><p>남겨 주신 연락처로 담당자가 연락드립니다.</p></div></section>
${contactBlock(rel, false)}
` });

// ---------- write ----------
fs.rmSync(OUT, { recursive: true, force: true });
for (const p of pages) {
  const depth = p.url === '/' ? 0 : p.url.split('/').filter(Boolean).length;
  const file = path.join(OUT, p.url, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, layout({ ...p, depth }));
}
fs.cpSync(path.join(SRC, 'assets'), path.join(OUT, 'assets'), { recursive: true });
if (fs.existsSync(path.join(SRC, 'static'))) fs.cpSync(path.join(SRC, 'static'), OUT, { recursive: true });
console.log(`built ${pages.length} pages → ${OUT}${PREVIEW ? ' (preview)' : ''}`);
