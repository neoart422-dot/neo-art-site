# 네오아트플래닝 홈페이지 (www.neo-art.kr)

㈜네오아트플래닝(대표 이석범)의 회사 홈페이지입니다. 세계명화 레플리카 제작·판매, 세계명화 기획전, 아트상품 제작·납품을 하는 회사입니다.
대화와 설명은 한국어로, 쉬운 말로 해 주세요. 사용자는 개발자가 아닙니다.

## 주요 고객층 (홈페이지는 이 세 그룹에 맞춰 설계됨)
1. 지방 문화재단·문화예술회관 전시기획 담당자 → 세계명화 기획전 유치
2. 세계명화 액자를 사려는 일반 소비자 → 레플리카 액자 구매 (온라인은 네이버 스마트스토어)
3. 전시장·카페·기프트샵 운영자 → 명화 액자·아트상품 납품·입점

## 구조
- `build.js` : 외부 패키지 없는 Node 빌드 스크립트. `node build.js` → `_site/` 생성. 페이지 HTML 템플릿이 모두 여기 있음.
  - `PREVIEW=1 OUT=_preview node build.js` → 링크가 index.html로 끝나는 미리보기용 빌드
- `src/content/*.json` : 홈페이지 내용 (관리자 화면에서 수정하는 데이터)
  - `site.json` 회사정보·첫 화면 문구·인사말·고객별 안내 카드(audiences)
  - `exhibitions.json` 전시 패키지·진행 이력·작품 공급 사례
  - `stores.json` 직영 매장 5곳 / `business.json` 사업분야 7개 / `news.json` 소식
- `src/assets/css/site.css` : 디자인 (색·글꼴 토큰은 파일 맨 위 `:root`)
- `src/assets/img/` : 사진 (긴 변 1400~2000px, JPG 품질 80 정도로 줄여서 넣기)
- `src/static/CNAME` : www.neo-art.kr
- `.pages.yml` : 관리자 화면(Pages CMS, https://app.pagescms.org) 설정. content JSON에 새 항목을 추가하면 여기도 같이 추가할 것.
- `.github/workflows/deploy.yml` : main에 push하면 GitHub Pages로 자동 배포(1~2분).
- `관리자_사용법.md` : 대표님용 관리 안내

## 작업 규칙
- 수정 후 `node build.js`로 빌드가 되는지 확인하고, main에 커밋·push하면 배포됩니다.
- 배포 후 https://www.neo-art.kr 에서 반영을 확인하세요. 브라우저 캐시 때문에 사용자가 옛 화면을 보면 Ctrl+F5를 안내합니다.
- 이 저장소는 공개(public)입니다. 매출·계약금액·임대 조건·보유 원작 매입가 등 내부 정보는 절대 넣지 마세요.
- 전시 이력에는 연도·전시명·기관만 적고 계약 금액은 적지 않습니다.
- 사용자가 정한 표현: 메인 제목 "세계명화의 모든 것, 네오아트", '순회전'이 아니라 '기획전', 메뉴 "직영매장 안내"는 회사소개 다음.

## 도메인·호스팅
- 도메인 neo-art.kr : 가비아 등록, 네임서버도 가비아(ns.gabia.co.kr 등). DNS: @ A 185.199.108~111.153, www CNAME neoart422-dot.github.io
- 호스팅: GitHub Pages (저장소 neoart422-dot/neo-art-site), https 강제 적용 켜짐.
- 문의 양식: formsubmit.co → 2mickey@naver.com (첫 문의 때 온 확인 메일에서 Activate 필요)
- 예전 아임웹 사이트(neoart.imweb.me)는 더 이상 연결되어 있지 않음.

## 회사 기본 정보 (공개 정보)
- 본사: 서울 금천구 가산디지털2로 98, IT캐슬 2동 209호 / 대표전화 1588-8540 / 010-2615-2296 / 2mickey@naver.com
- 직영 매장: 갤러리네오·카페네오(킨텍스 제2전시장 1층), 갤러리오라(시흥하늘휴게소 3층), 아트샵 오라 킨텍스점(제1전시장 1층), 김해공항점(국내선 1층), 해운대점(엑스더스카이 98층)
- 독자 기법 『Painting Ovelab』: 원본 데이터 캔버스 출력 + 6~8회 유화 리터칭
- 온라인 아트샵: https://smartstore.naver.com/artgage
