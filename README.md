# Canonical Taiwan Tech Hub（Canonical 台灣技術觀點站）

專注追蹤 Canonical & Ubuntu 官方最新技術，為台灣開發者與企業提供繁體精華導讀與在地觀點。

- **框架**：Astro 7（純靜態 SSG）＋ Tailwind CSS 4
- **內容**：Astro Content Collections（`src/content/articles/`，具 TypeScript 型別的 Frontmatter Schema）
- **監控**：`scripts/fetch-sources.mjs` 抓取官方 RSS，並與 `src/data/sources-state.json` 比對去重

---

## 環境需求

- Node.js **22.23.4 以上**（Astro 7 的最低需求；建議 Node 24 LTS，見 `.nvmrc`）
- npm 10 以上

```bash
nvm use        # 若使用 nvm，會讀取 .nvmrc
npm install
```

## 常用指令

| 指令 | 說明 |
| --- | --- |
| `npm run dev` | 啟動本地開發伺服器（預設 http://localhost:4321） |
| `npm run build` | 建置靜態網站到 `dist/` |
| `npm run preview` | 預覽建置後的網站 |
| `node scripts/fetch-sources.mjs` | 檢查官方 Feed 是否有未處理的新文章 |

`fetch-sources.mjs` 的參數：

```bash
node scripts/fetch-sources.mjs              # 列出所有未處理文章
node scripts/fetch-sources.mjs --limit 5    # 每個 Feed 最多列 5 篇
node scripts/fetch-sources.mjs --json       # JSON 輸出，方便 Claude 或其他程式解析
```

輸出內容包含：文章標題、來源、作者、發布時間（台北時間）、原文 URL 與前 200 字摘要。腳本**只讀不寫**，不會自動修改追蹤檔。若某個 Feed 抓取失敗，會顯示警告並繼續處理其他 Feed；全部失敗時以 exit code 1 結束。

---

## 部署（GitHub Pages）

網站網址：**https://ikusupuroa.github.io/ClaudeCodeOnTheWeb/**

- `.github/workflows/deploy.yml`：PR 只跑建置檢查；合併到 `main` 後自動建置並部署到 GitHub Pages。也可以在 Actions 頁面手動執行（workflow_dispatch）。
- repo 的 Settings → Pages → Build and deployment → Source 必須選 **GitHub Actions**。
- 網站部署在子路徑 `/ClaudeCodeOnTheWeb/`（見 `astro.config.mjs` 的 `base`）。站內連結請用 `src/lib/site.ts` 的 `withBase()` 產生，不要直接寫 `/about/` 這類絕對路徑。

---

## 專案結構

```text
├── scripts/
│   └── fetch-sources.mjs          # RSS 監控與去重腳本
├── src/
│   ├── content/articles/          # 文章 Markdown（檔名即網址 slug）
│   ├── content.config.ts          # 文章 Frontmatter Schema
│   ├── data/sources-state.json    # 抓取與處理狀態追蹤檔
│   ├── components/                # 卡片、台灣觀點卡片、原文出處區塊等
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── articles.ts            # 取得／排序文章、統計標籤
│   │   └── digest-sections.mjs    # Markdown 外掛：把兩大區塊包成 <section>
│   ├── pages/
│   │   ├── index.astro            # 首頁（Hero、標籤篩選、文章卡片）
│   │   ├── about.astro            # 關於本站
│   │   └── articles/[slug].astro  # 文章詳情頁
│   └── styles/global.css          # Tailwind 與品牌色設定
└── astro.config.mjs
```

---

## 文章格式

### Frontmatter

```yaml
---
title: 繁體中文策展標題                     # 必填
pubDate: 2026-10-24                        # 必填，本站發表日期
canonicalTitle: Original English Title     # 必填，原文英文標題
canonicalUrl: https://ubuntu.com/blog/...  # 必填，原文連結
sourceFeed: Ubuntu Blog                    # 必填，"Canonical Blog" 或 "Ubuntu Blog"
summary: 2-3 句原文核心摘要。               # 必填
taiwanTakeaway: 台灣在地觀點核心引言。       # 必填，會顯示在文章頂部的亮眼卡片
tags: [Ubuntu, Security]                   # 必填，至少一個
canonicalAuthor: Jane Doe                  # 選填，原文作者
canonicalPubDate: 2026-10-15               # 選填，原文發布日期
draft: false                               # 選填，true 時不會建置
---
```

### 內文必備的兩個區塊

每篇文章內文**必須**包含以下兩個二級標題（文字需完全一致），缺一個建置就會失敗：

```markdown
## 🇹🇼 台灣觀點點評

（深入剖析此技術對台灣企業、開發者生態或雲端架構的實際落地價值）

## 原文精華導讀

（繁體中文核心大綱、重點表格、技術演進，結尾附「### 出處」連結）
```

`src/lib/digest-sections.mjs` 會自動把「台灣觀點點評」套上 Callout 樣式，把「原文精華導讀」套上導讀樣式，作者不需要手寫 HTML。

### 撰寫原則

- 技術名詞保留英文，並附繁體中文說明，例如 Livepatch（核心熱修補）。
- 原文沒寫、也無法查證的內容，要用 `> **待確認**：…` 明確標註，不要臆測。
- 價格、版本號、支援年限以原文為準，本站不自行提供價格數字。

---

## `sources-state.json` 狀態追蹤

```json
{
  "monitored_feeds": ["https://canonical.com/blog/feed", "https://ubuntu.com/blog/feed"],
  "items": [
    {
      "url": "https://ubuntu.com/blog/canonical-releases-ubuntu-26-10-stonking-stingray",
      "status": "published",
      "title": "Canonical releases Ubuntu 26.10 Stonking Stingray",
      "processedDate": "2026-10-24",
      "article": "ubuntu-26-10-stonking-stingray"
    }
  ]
}
```

| `status` | 意義 |
| --- | --- |
| `published` | 已發布導讀；`article` 欄位填文章檔名（不含 `.md`） |
| `drafting` | 已選題、撰寫中 |
| `skipped` | 審查後決定不處理；可用 `note` 說明原因 |

比對時網址會先正規化（統一 https、去掉 `www.`、重複斜線、結尾斜線與 `utm_*` 參數），所以 `https://ubuntu.com//blog/xxx/` 與 `https://ubuntu.com/blog/xxx` 會被當成同一篇。

---

## 與 Claude Code 協作審查並發布新文章（SOP）

### Step 1：檢查新文章

在 Claude Code 對話中輸入：

> 請執行 `node scripts/fetch-sources.mjs`，列出未處理的新文章，並依「對台灣企業與開發者的參考價值」排序，給我每篇一句話的推薦理由。

### Step 2：選題

依清單回覆你的決定，例如：

> 第 1、3 篇要寫；第 2 篇是活動公告，標記為 skipped。

Claude 會更新 `sources-state.json`：要寫的標為 `drafting`，不寫的標為 `skipped` 並記錄原因。

### Step 3：撰寫初稿

> 請閱讀第 1 篇原文，依 README 的文章格式寫一篇導讀，台灣觀點請著重在＿＿＿（例如：金融業合規、製造業上雲、開發者工具鏈）。

Claude 會在 `src/content/articles/` 新增 Markdown 檔，並在回覆中列出：

- 引用了原文哪些重點
- 哪些內容標註為「待確認」
- 建議的標籤

### Step 4：人工審查

逐段核對以下項目，有問題直接在對話中請 Claude 修改：

- [ ] 版本號、日期、指令與原文一致
- [ ] `canonicalUrl` 可以正常開啟
- [ ] 台灣觀點有具體場景，不是空泛的「值得關注」
- [ ] 沒有原文沒寫、卻被寫成事實的內容
- [ ] 標籤沿用既有分類（Cloud、Ubuntu、AI、Security、Kubernetes 等），避免同義重複

可以用 `npm run dev` 在本地預覽實際畫面。

### Step 5：建置驗證並發布

> 審查完成，請把狀態改為 published，執行 `npm run build` 確認零錯誤後 commit 並 push。

Claude 會：

1. 將 `sources-state.json` 中該篇的 `status` 改為 `published`，填入 `processedDate` 與 `article`。
2. 執行 `npm run build`，確認沒有錯誤與警告。
3. Commit 並 push，必要時開 Pull Request 供最後確認。

---

## 版權聲明

本站為獨立的非官方策展站，與 Canonical Ltd. 無隸屬關係。原文著作權屬 Canonical Ltd. 及原作者所有，本站僅提供繁體中文導讀、評論與出處連結。Ubuntu 與 Canonical 為 Canonical Ltd. 之註冊商標。
