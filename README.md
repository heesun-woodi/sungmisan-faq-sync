# 성미산어린이집 FAQ 자동 동기화 (노션 → 홈페이지)

노션에서 FAQ를 수정하면 성미산어린이집 홈페이지(https://www.sungmisankids.com/faq/)에 자동으로 반영됩니다.
Ghost **Starter 플랜(Admin API 불가)**에서도 동작하도록 **Pull 방식**으로 만들어졌습니다.

## 어떻게 동작하나요?

```
[노션에서 FAQ 편집]
        │
        ▼  (GitHub Actions: 매시간 자동 + "Run workflow" 수동 버튼)
[노션 읽기] → [faq.html 생성] → [GitHub Pages에 게시]
        │
        ▼  (방문자가 FAQ 페이지를 열면)
[Ghost FAQ 카드의 로더가 faq.html을 불러와 화면에 표시]
```

- Ghost 페이지에는 **작은 로더 코드만 한 번** 넣으면 끝. 이후엔 노션만 수정하면 됩니다.
- 지금의 아코디언 디자인이 **그대로** 유지됩니다.
- 서버를 항상 켜둘 필요 없음 · GitHub 무료 · Ghost 플랜 유지.

---

## 현재 상태 (자동 구축 완료 ✅)

| 항목 | 상태 |
|------|------|
| GitHub 저장소 `heesun-woodi/sungmisan-faq-sync` (공개) | ✅ 생성·push |
| Secrets (`NOTION_TOKEN`, `NOTION_ROOT_PAGE_ID`) | ✅ 등록 |
| `gh-pages` 브랜치 배포 + GitHub Pages 활성화 | ✅ 라이브 |
| **게시 주소** | **https://heesun-woodi.github.io/sungmisan-faq-sync/faq.html** |
| CORS (홈페이지에서 fetch 가능) | ✅ 확인 (`Access-Control-Allow-Origin: *`) |

**남은 것 (2가지)**
1. **Ghost FAQ 페이지에 `ghost-embed.html` 붙여넣기** (아래 6단계) — 붙이면 홈페이지에 노션 내용이 뜹니다.
2. **매시간 자동화 켜기** — 워크플로 파일 push에는 `workflow` 스코프가 필요합니다.
   터미널에서 `gh auth refresh -h github.com -s workflow` 실행 후 담당자에게 알려주면 워크플로가 올라갑니다.
   (그전까지도 사이트는 라이브이며, 내용 갱신은 수동 재배포로 가능합니다.)

---

## 준비물

- 노션 계정 (FAQ 페이지가 있는 워크스페이스)
- GitHub 계정 (무료) — 없으면 https://github.com/join 에서 생성
- Ghost FAQ 페이지 편집 권한

---

## 최초 설정 (한 번만)

### 1단계 — 노션 통합(Integration) 만들고 페이지 공유

1. https://www.notion.so/my-integrations → **New integration** 생성 (이름 예: `sungmisan-faq`).
   - 워크스페이스는 **FAQ가 있는 곳**을 선택. 권한은 **Read content** 면 충분합니다.
2. 만들어진 **Internal Integration Secret** 을 복사해 둡니다. (`secret_...` 또는 `ntn_...`)
3. **노션 FAQ 페이지로 가서** 우측 상단 `•••` → **연결(Connections)** → 방금 만든 `sungmisan-faq` 를 추가.
   - ⚠️ 이 단계를 빼먹으면 통합이 페이지를 못 읽습니다(가장 흔한 실수).
4. **페이지 ID** 확보: 페이지 URL에서 32자리 hex.
   예) `.../33624e50d05480a984aaf6ddc5ae34ff?v=...` → **`33624e50d05480a984aaf6ddc5ae34ff`**

### 2단계 — 이 코드를 GitHub에 올리기

1. GitHub에서 새 저장소 생성: 이름 **`sungmisan-faq-sync`** (Public 권장 — GitHub Pages 무료).
2. 이 폴더(`sungmisan-faq-sync`)를 그 저장소로 push. (터미널)
   ```bash
   cd sungmisan-faq-sync
   git init && git add . && git commit -m "init faq sync"
   git branch -M main
   git remote add origin https://github.com/<본인아이디>/sungmisan-faq-sync.git
   git push -u origin main
   ```

### 3단계 — GitHub Secrets 등록

저장소 → **Settings → Secrets and variables → Actions → New repository secret** 로 2개 등록:

| 이름 | 값 |
|------|-----|
| `NOTION_TOKEN` | 1단계에서 복사한 Integration Secret |
| `NOTION_ROOT_PAGE_ID` | 1단계의 페이지 ID (32자리 hex) |

### 4단계 — GitHub Pages 켜기

저장소 → **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 설정.

### 5단계 — 첫 실행 & 주소 확인

1. 저장소 → **Actions → "Build & Publish FAQ" → Run workflow** 클릭.
2. 초록 체크가 뜨면 성공. 게시 주소는 보통:
   **`https://<본인아이디>.github.io/sungmisan-faq-sync/faq.html`**
   브라우저로 열어 FAQ가 나오는지 확인하세요.

### 6단계 — Ghost FAQ 페이지에 로더 붙이기 (한 번만)

1. `ghost-embed.html` 파일을 열어 **`__GITHUB_USER__`** 를 본인 GitHub 아이디로 바꿉니다.
2. Ghost 에디터에서 FAQ 페이지의 **기존 내용을 지우고**, `/HTML` 카드를 추가한 뒤 그 파일 전체를 붙여넣습니다.
3. 저장/발행 후 https://www.sungmisankids.com/faq/ 에서 확인.

✅ 끝! 이제 **노션에서 FAQ를 고치면** 매시간(또는 Run workflow 즉시) 홈페이지에 반영됩니다.

---

## 평소 운영

- **내용 수정**: 노션 FAQ 페이지에서 토글/텍스트만 고치면 됩니다.
- **즉시 반영**: 기다리기 싫으면 GitHub → Actions → **Run workflow** 한 번.
- 자동 주기를 바꾸려면 `.github/workflows/build.yml` 의 `cron` 값을 수정하세요.

## 노션 작성 규칙 (중요)

현재 매핑 규칙은 이렇습니다 (`src/notion.js` 의 `MAP`에서 조정 가능):

| 노션에서 | 홈페이지에서 |
|----------|--------------|
| **제목1 (Heading 1)** | 큰 초록 섹션 바 (예: `★ 공동육아 FAQ BEST 5 ★`) |
| **제목2·제목3** | 카테고리 칩 (예: `3️⃣ 아이들의 하루`) |
| **토글(Toggle)** | 아코디언 1개 — 토글 제목=질문, 토글 안=답변 |
| 토글 안 **문단** | 답변 문단 (`🌱 : ...` 그대로) |
| 토글 안 **표** | 표 (첫 줄을 머리행으로 쓰려면 "열 머리글" 켜기) |
| `※` 또는 `주1)` 로 시작하는 문단 | 작은 회색 각주 |

> 실제 노션 구조가 위와 다르면, 아래 `npm run inspect` 로 구조를 출력해 `MAP`을 맞추면 됩니다.

---

## 로컬에서 테스트 (선택)

```bash
npm install

# 노션 없이 샘플로 미리보기 → dist/faq.html 생성
npm run build

# 실제 노션으로 빌드 / 구조 확인
cp .env.example .env   # 값 채우기 (NOTION_TOKEN, NOTION_ROOT_PAGE_ID)
node --env-file=.env src/build.js     # 실제 노션 → dist/faq.html
node --env-file=.env src/inspect.js   # 노션 블록 구조를 트리로 출력
```

## 문제 해결

| 증상 | 확인할 것 |
|------|-----------|
| 블록이 0개 / 404 | 노션 페이지를 통합에 **연결(Connections)** 했는지, 페이지 ID가 맞는지 |
| 표가 안 나옴 | 노션 표 블록의 "열 머리글" 설정, 셀 내용 확인 |
| 배너/카테고리가 뒤섞임 | 노션의 제목 레벨(H1/H2/H3)이 규칙과 맞는지 → `MAP` 조정 |
| 홈페이지에 안 뜸 | `ghost-embed.html` 의 `USER` 값, Pages 주소가 열리는지, 브라우저 콘솔 오류 |

## 파일 구조

```
sungmisan-faq-sync/
├─ src/
│  ├─ build.js      진입점: 노션(또는 샘플) → dist/faq.html
│  ├─ notion.js     노션 페이지 → 구조화 모델 (매핑 규칙 MAP)
│  ├─ render.js     모델 → .smwiki HTML (현재 디자인 그대로)
│  ├─ template.js   CSS + 이스케이프 헬퍼
│  └─ inspect.js    노션 구조 진단 도구
├─ sample/faq.sample.json   오프라인 미리보기용 샘플
├─ ghost-embed.html         Ghost에 붙일 로더 (한 번만)
├─ .github/workflows/build.yml  매시간 + 수동 실행 → Pages 배포
└─ .env.example
```
