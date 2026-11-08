# guide.md — 실시간 날씨·미세먼지 대시보드 (`26-w10-weather`)

> 이 문서는 실습 중 계속 펴놓고 따라가는 매뉴얼입니다.
> 수업 시간(총 130분) 내에 배포와 제출까지 깔끔하게 완료할 수 있도록 단계별로 구성되어 있습니다.

---

## 🌟 오늘 우리는 무엇을 경험하나요

8~9주차에는 GitHub Codespaces 환경에서 Copilot의 Plan 모드와 Agent 모드를 활용해 데이터베이스 연동 일기장을 만들었습니다.
오늘은 한 걸음 더 나아가, **내 컴퓨터(로컬)에 최신 AI 코딩 도구인 Antigravity IDE를 설치**하고, **전 세계 기상 관측소가 제공하는 실시간 외부 API(Open-Meteo)**를 연결하여 실시간 날씨·미세먼지 대시보드를 만듭니다.

- **차세대 AI IDE (Antigravity)**: 코드를 무작정 짜는 것이 아니라, 먼저 완벽한 **구현 계획(Implementation Plan)**을 세우고, 코드를 작성한 뒤, 스스로 작동을 검증하는 **Walkthrough(검증 리포트)**까지 보여주는 에이전트의 자율성을 체감합니다.
- **외부 공개 API 연동**: API Key가 필요 없는 무료 공개 기상 API(Open-Meteo)를 안전하게 소비(Consume)하는 프론트엔드 통신 아키텍처를 익힙니다.
- **사이버보안과의 눈**: 완전 공개된 API와 비밀 키가 필요한 보안 API의 아키텍처 차이, CORS, HTTPS 혼합 콘텐츠(Mixed Content) 방어, API 호출 남용을 막는 디바운싱(Debounce) 원리를 배웁니다.

---

## ⏱️ 오늘의 수업 타임라인 (총 130분)

시간 지연 없이 모두가 성공적으로 완성할 수 있도록 아래 타임라인을 엄수해 주세요.

- **[준비 10분]** Fork, Node.js 확인/설치, Antigravity IDE 실행 및 작업 폴더 열기
- **[1교시 45분]** 외부 API(Open-Meteo) 통신 구조 확인, 통신 계층(`src/api/weather.js`) 분리 및 로컬 실행(`npm run dev`)
- *(휴식 15분)*
- **[2교시 45분]** Antigravity IDE 프롬프트 요청 → **Implementation Plan 검토·승인** → 에이전트 구현 및 **Walkthrough 검증** 확인
- *(휴식 15분)*
- **[3교시 30분]** 듀얼 배포 (Netlify & GitHub Pages), 모바일 확인, 보안 성찰 README 작성, PR 제출

---

## 오늘의 브랜치 구조

```
main              (원본 보관 — 절대 merge하지 않습니다)
 └─ dev           (작업 통합 브랜치, PR 제출 기준)
     ├─ weather   (대시보드 기능 구현 브랜치 — 완성 후 dev로 merge)
     └─ gh-pages  (GitHub Pages 배포 시 빌드 결과물 자동 푸시)
```

- `main`은 처음 Fork했을 때 상태 그대로 보관하는 원본 베이스라인입니다.
- 모든 작업과 PR(Pull Request) 제출은 `dev` 브랜치를 기준으로 진행합니다.

---

## 0단계 — 로컬 개발 환경 준비 (Node.js & Antigravity)

> 💡 8~9주차는 Codespaces 클라우드에서 작업했기 때문에 내 컴퓨터에 Node.js가 깔려 있지 않을 수 있습니다. 1분 만에 설치하고 확인합니다!

### 1. Node.js 설치 확인
터미널(또는 명령 프롬프트 / PowerShell)을 열고 아래 명령어를 입력합니다:
```bash
node -v
npm -v
```
- `v20.x.x` 또는 `v22.x.x` 같은 버전 번호가 나오면 이미 설치된 것입니다. 바로 다음으로 넘어가세요.
- **명령어를 찾을 수 없다고 나온다면? 즉시 설치합니다:**
  - **Windows**: [Node.js 공식 홈페이지(nodejs.org)](https://nodejs.org)에 접속하여 **LTS (안정화 버전)** 인스톨러를 다운로드받아 설치합니다. (또는 터미널에서 `winget install OpenJS.NodeJS.LTS`)
  - **macOS**: 공식 홈페이지에서 macOS 인스톨러(.pkg)를 받아 설치합니다. (또는 `brew install node`)
  - 설치 후 터미널 창을 닫았다가 다시 열어 `node -v`를 확인합니다.

### 2. Antigravity IDE 실행
- 내 컴퓨터에 설치된 **Antigravity IDE**를 실행하고, 본인의 Google 계정으로 로그인되어 있는지 확인합니다.

---

## 1단계 — Fork & 로컬 Clone

1. GitHub에서 [`26-w10-weather`](https://github.com/kopo-kangseo-cybersec/26-w10-weather) 저장소를 본인 계정으로 **Fork**합니다.
   - *Copy the `main` branch only* 체크는 그대로 둡니다.
2. 내 컴퓨터의 작업 폴더(예: `C:\Users\내계정\repos` 또는 `~/repos`)에서 내 Fork 저장소를 Clone합니다:
   ```bash
   git clone https://github.com/<내-GitHub-아이디>/26-w10-weather.git
   cd 26-w10-weather
   ```
3. **Antigravity IDE**에서 이 `26-w10-weather` 폴더를 엽니다. (File → Open Folder)

---

## 2단계 — `dev` 브랜치 생성 및 초기 구동 확인

1. Antigravity IDE 하단 터미널에서 `dev` 브랜치를 생성하고 원격에 푸시합니다:
   ```bash
   git checkout -b dev
   git push -u origin dev
   ```
2. 프로젝트 패키지 설치:
   ```bash
   npm install
   ```
   > 💡 `package.json`에 React 19, Vite, 그리고 날씨 아이콘 라이브러리인 `lucide-react`가 이미 사전 등록되어 있으므로 명령어 한 번으로 모든 준비가 끝납니다.
3. 로컬 개발 서버 구동:
   ```bash
   npm run dev
   ```
4. 브라우저에서 `http://localhost:5173`을 열어 **"10주차 실습 스타터"** 화면이 뜨고, 서울(강서) 기상 정보가 정상적으로 나타나는지 확인합니다!
5. 확인 후 터미널에서 `Ctrl + C`를 눌러 서버를 잠시 멈추거나 그대로 켜둡니다.

---

## 3단계 — 외부 API 구조 및 보안 아키텍처 이해

코드 작성을 시작하기 전에, 우리가 사용할 Open-Meteo API의 특징과 보안 규칙을 살펴봅니다.

```
[클라이언트: React 앱]
        │
        ├── 1. 날씨 조회 요청 (HTTPS) ──────> https://api.open-meteo.com/v1/forecast
        ├── 2. 미세먼지 요청 (HTTPS) ─────> https://air-quality-api.open-meteo.com/v1/air-quality
        └── 3. 도시 검색 요청 (HTTPS) ──────> https://geocoding-api.open-meteo.com/v1/search
```

### 🛡️ 사이버보안과 핵심 체크포인트
1. **Public API vs Private/Secret API (키 분리와 백엔드의 필요성)**:
   - 9주차 Supabase에서는 `publishable key`를 프론트엔드에 넣었습니다.
   - 10주차 Open-Meteo는 키가 아예 필요 없는 완전 공개 API입니다.
   - **생각해 볼 점**: 만약 결제 모듈이나 사내 회원정보처럼 비밀 키(`secret key`)가 필요한 유료 API라면, React 프론트엔드 코드에서 직접 호출해도 될까요? **절대 안 됩니다!** 브라우저 Network 탭이나 배포된 자바스크립트 파일에서 키가 100% 노출되어 거액의 과금이나 데이터 유출 사고가 발생합니다. 이런 경우 반드시 **백엔드 프록시 서버(BFF, Backend For Frontend)**를 두어 서버에서 비밀 키를 숨겨 호출해야 합니다.
2. **CORS와 Mixed Content (HTTPS 암호화)**:
   - 배포 사이트가 `https://` 보안 프로토콜을 쓸 때, API 호출을 `http://`로 하면 브라우저 보안 정책에 의해 통신이 강제 차단됩니다(Mixed Content). Open-Meteo의 모든 엔드포인트는 안전한 HTTPS를 사용합니다.
3. **디바운스(Debounce)와 DoS/429 차단 방지**:
   - 도시 검색창에 "Seoul"을 입력할 때 `S`, `e`, `o`, `u`, `l` 한 글자 칠 때마다 즉시 API를 호출하면 순식간에 수십 번의 요청이 발생합니다. 이는 서버에 불필요한 DoS 공격 형태의 부하를 주며, API 서버로부터 `429 Too Many Requests`로 IP가 차단될 수 있습니다. 사용자의 타이핑이 멈춘 뒤 300~500ms 이후에 한 번만 호출되도록 **디바운스** 처리가 필요합니다.

---

## 4단계 — 기능 브랜치(`weather`) 생성 및 Antigravity IDE 활용

이제 `weather` 브랜치를 만들어 대시보드를 완성해 봅니다.

```bash
git checkout -b weather
```

### 💡 Antigravity IDE와 대화하는 3단계 협업 방식

Antigravity는 단순히 코드를 툭 던져주는 것이 아닙니다:
1. **프롬프트 입력**: 요구사항 전달
2. **Implementation Plan 검토**: 에이전트가 코드를 쓰기 전에 제시하는 **구현 계획서**를 눈으로 꼼꼼히 검토하고 승인(Approve/Proceed)합니다.
3. **Walkthrough 관찰**: 에이전트가 코드를 작성하고 자체 터미널 검증을 거치는 과정을 관찰합니다.

---

### [복사할 프롬프트 상자]

Antigravity IDE 우측의 Chat(에이전트) 패널을 열고 아래 프롬프트를 복사하여 전달하세요:

```text
현재 제공된 스타터 코드(src/api/weather.js, src/App.jsx)를 고도화하여
실시간 날씨 및 미세먼지 통합 대시보드를 완성해줘.

[핵심 요구사항]
1. UI 컴포넌트 구조화:
   - CurrentWeather: 현재 기온, 체감 온도, 습도, 풍속, 날씨 상태(lucide-react 아이콘 활용)
   - AirQualityCard: PM10(미세먼지), PM2.5(초미세먼지), 환경부 기준 상태 뱃지(좋음/보통/나쁨/매우나쁨)
   - WeeklyForecast: 향후 5~7일간의 날씨 예보(최고/최저 기온, 날씨 아이콘, 요일)
   - CitySearch: 도시명 검색 입력창 (디바운스 400ms 적용 및 검색 결과 드롭다운 선택 기능)
2. 기존 사전 정의된 한국 주요 도시 프리셋 버튼(서울, 인천, 부산, 대구 등)은 유지하여 원클릭 전환 지원
3. 모바일 화면에서도 깨지지 않는 깔끔하고 모던한 카드형 반응형 디자인 (CSS)
4. 네트워크 지연 시 스켈레톤/로딩 인디케이터 및 API 오류 시 친절한 에러 안내(Fallback) 처리
5. 외부 API 통신 로직은 src/api/weather.js를 최대한 활용하거나 확장할 것

먼저 구현 계획(Implementation Plan)을 제시해주고 승인을 받아 진행해줘.
```

---

### [사람이 할 일: 검토 및 승인]

1. Antigravity IDE가 화면에 띄운 **Implementation Plan**을 읽어봅니다:
   - 컴포넌트가 어떻게 분리되는지 확인합니다.
   - 디바운스와 에러 처리가 계획에 포함되어 있는지 확인합니다.
2. 계획이 적절하다면 **"Proceed" (또는 "계획대로 진행해줘")** 버튼을 눌러 승인합니다.
3. 에이전트가 파일들을 생성·수정하고 터미널에서 린트/빌드를 자체 검증하는 **Walkthrough** 과정을 관찰합니다.

---

## 5단계 — 로컬 동작 검증 및 `dev` 병합

1. 로컬 브라우저(`http://localhost:5173`)에서 아래 사항들을 직접 클릭하며 테스트합니다:
   - [ ] 도시 버튼(부산, 제주 등)을 누르면 기온과 미세먼지가 즉시 변경되는가?
   - [ ] 도시 검색창에 영문 도시명(예: `Tokyo`, `London`, `New York`)을 입력하면 검색 결과가 뜨고 선택되는가?
   - [ ] 주간 예보 카드에 최고/최저 기온과 요일이 잘 표시되는가?
   - [ ] 브라우저 창 크기를 줄여도(모바일 뷰) 디자인이 정돈되어 있는가?
2. 정상 동작을 확인했다면 `weather` 브랜치를 커밋하고 `dev`로 병합합니다:
   ```bash
   git add .
   git commit -m "feat: Antigravity IDE를 통한 날씨 및 미세먼지 대시보드 고도화"
   git checkout dev
   git merge weather
   git push origin dev
   ```

---

## 6단계 — 듀얼 배포 (Netlify & GitHub Pages)

9주차와 마찬가지로 **Netlify**와 **GitHub Pages** 두 곳 모두에 배포합니다!

### 1. Netlify 배포 (자동 빌드 호스팅)
1. [Netlify 대시보드](https://app.netlify.com) 접속 → **Add new site → Import an existing project**
2. **GitHub** 선택 → 본인의 `26-w10-weather` Fork 저장소 선택
3. 배포 설정 확인:
   - **Branch to deploy**: `dev`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
4. **Deploy 26-w10-weather** 버튼 클릭! (1분 내 배포 완료)
5. 생성된 `https://<사이트이름>.netlify.app` 주소를 복사해 둡니다.

### 2. GitHub Pages 배포 (로컬 빌드 후 배포)
1. 로컬 터미널에서 프로덕션 빌드를 수행하고 `gh-pages` 브랜치로 배포합니다:
   ```bash
   npm run build
   npx gh-pages -d dist
   ```
2. 내 GitHub Fork 저장소의 **Settings → Pages**로 이동하여:
   - **Source**: Deploy from a branch
   - **Branch**: `gh-pages` / `/ (root)` 로 설정되어 있는지 확인합니다.
3. 2~3분 뒤 상단에 표시되는 `https://<내아이디>.github.io/26-w10-weather/` 주소를 확인합니다.

---

## 7단계 — `README.md` 작성 및 Git 태그 푸시

1. `dev` 브랜치의 `README.md` 파일을 열고 질문 항목들을 성의 있게 작성합니다:
   - 소개
   - 어떻게 만들었나요 (Antigravity IDE 경험 및 Implementation Plan/Walkthrough 소감)
   - 데이터 통신 구조 (Open-Meteo의 특징 및 `src/api/weather.js` 분리 이유)
   - 보안에서 확인한 것 (공개 API vs 비밀 API 차이, 클라이언트 호출의 한계와 BFF 필요성)
   - 배포 URL (Netlify URL, GitHub Pages URL)
2. `README.md`를 커밋하고 푸시합니다:
   ```bash
   git add README.md
   git commit -m "docs: 10주차 실습 리포트 및 보안 회고 작성"
   git push origin dev
   ```
3. 마일스톤 태그(`v1.0`) 생성 및 푸시:
   ```bash
   git tag v1.0
   git push origin v1.0
   ```

---

## 8단계 — PR 제출 및 자동 채점 확인

1. 내 GitHub 저장소에서 **Pull requests → New pull request** 클릭
2. 브랜치 방향 확인:
   - **base repository**: `kopo-kangseo-cybersec/26-w10-weather` / **base**: `main`
   - **head repository**: `<내아이디>/26-w10-weather` / **compare**: `dev`
3. PR 템플릿의 체크리스트를 점검하고, 이름, 배포 링크, 태그(`v1.0`), 한 줄 소감을 작성한 뒤 **Create pull request**를 클릭합니다.
4. **AI 자동 채점 확인**:
   - 1~2분 뒤 Gemini 3.5 Flash Lite 채점 봇이 PR 코멘트에 채점 리포트를 등록합니다.
   - 모든 기준을 충족하면 `'통과'` 라벨과 함께 PR이 자동으로 마감(Close)되고 교수님 Slack으로 알림이 전송됩니다!
   - 만약 `'보완 필요'` 라벨이 붙었다면 코멘트의 피드백을 읽고 보완한 뒤 `dev` 브랜치에 다시 `git push`하면 재채점이 진행됩니다.

---

## 💡 막혔을 때 (FAQ / Troubleshooting)

- **`node -v`를 쳤는데 명령어를 찾을 수 없다고 나와요**:
  - Node.js 설치 후 터미널 창을 완전히 닫았다가 다시 열어야 환경변수(PATH)가 반영됩니다.
- **`npm install` 중 에러가 발생해요**:
  - Node.js 버전이 너무 낮을 수 있습니다. LTS(v20 이상)인지 확인하세요.
- **도시 검색 시 한국어로 치면 검색 결과가 안 나와요**:
  - Open-Meteo 지오코딩 API는 영문 알파벳(예: `Seoul`, `Busan`, `Jeju`, `Tokyo` 등) 검색에 최적화되어 있습니다. 한국 도시는 상단의 프리셋 버튼을 클릭하거나 영문으로 입력해 보세요.
- **GitHub Pages에서 화면이 하얗게 나와요**:
  - `vite.config.js`에 `base: './'` 설정이 들어있는지 확인하세요.

---

## 🎁 [보너스] 나만의 기상 대시보드 커스터마이징 챌린지

실습을 일찍 마친 학생은 아래 기능 중 하나를 Antigravity에 요청해 추가해 보세요:
- 날씨 상태(맑음, 비, 눈, 밤)에 따라 대시보드 배경 그라데이션이 실시간으로 바뀌는 동적 테마
- 최근 검색한 도시를 `localStorage`에 저장하여 나만의 즐겨찾기 도시 탭 만들기
- 강수 확률 차트 또는 체감 온도 게이지 바 시각화
