# ikusupuroa 的 Ubuntu 技術筆記

我是 ikusupuroa，一個 Ubuntu 使用者。這個網站追蹤 Canonical 與 Ubuntu 官方的最新消息，用繁體中文整理重點，也分享我推薦 Ubuntu 的理由。

網站：**https://ikusupuroa.github.io/ClaudeCodeOnTheWeb/**

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

在 Claude Code 雲端工作階段中，`.claude/hooks/session-start.sh` 會在每次啟動時自動檢查 Node.js 版本，不足 22.23.4 就安裝 Node 24 LTS，再執行 `npm install`，不需要手動設定。

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

## 新文章自動監控（GitHub Issue 通知）

`.github/workflows/monitor-feeds.yml` 每小時（UTC 第 17 分）在 GitHub Actions 上執行 `fetch-sources.mjs`：

- 有尚未處理、也還沒通知過的新文章時，自動開一個帶 `new-articles` 標籤的 Issue，並 @ repo 擁有者，觸發 GitHub 的手機推播與 Email 通知。
- 同一篇文章只會通知一次（比對所有 `new-articles` Issue 內的網址），沒有新文章時不會開 Issue。
- 想立刻檢查，可以到 Actions 頁面手動執行「Monitor Canonical & Ubuntu feeds」（Run workflow）。
- 選題後回到 Claude Code 對話，例如：「Issue #5 的第 1、3 篇要寫，其他略過」。
- 注意：公開 repo 連續 60 天沒有任何 commit，GitHub 會自動停用排程，需要到 Actions 頁面重新啟用。

---

## 專案結構

```text
├── .github/workflows/
│   ├── deploy.yml                 # PR 建置檢查；合併到 main 後部署到 GitHub Pages
│   └── monitor-feeds.yml          # 每小時檢查官方 Blog，有新文章就開 Issue
├── scripts/
│   ├── fetch-sources.mjs          # RSS 監控與去重腳本
│   └── notify-new-articles.cjs    # 把新文章開成 GitHub Issue
├── src/
│   ├── content/articles/          # 文章 Markdown（檔名即網址 slug）
│   ├── content/notes/             # 技術筆記（單篇或系列，example-* 為範本草稿）
│   ├── content/packages/          # Ubuntu 套件功能（同上）
│   ├── content.config.ts          # 文章 Frontmatter Schema
│   ├── data/sources-state.json    # 抓取與處理狀態追蹤檔
│   ├── components/                # 文章卡片、觀點卡片、原文出處區塊等
│   ├── layouts/BaseLayout.astro
│   ├── lib/
│   │   ├── articles.ts            # 取得／排序文章、統計標籤
│   │   ├── labs.ts                # 技術筆記／套件功能：載入、驗證區塊、組出系列
│   │   └── digest-sections.mjs    # Markdown 外掛：把兩大區塊包成 <section>
│   ├── pages/
│   │   ├── index.astro            # 首頁（Hero、最新 6 篇、標籤連結）
│   │   ├── about.astro            # 關於我
│   │   ├── articles/index.astro   # 全部文章（標籤篩選）
│   │   ├── articles/[slug].astro  # 文章詳情頁
│   │   ├── notes/                 # 技術筆記列表、單篇、系列總覽與章節
│   │   └── packages/              # Ubuntu 套件功能（同上）
│   └── styles/global.css          # Tailwind 與品牌色設定
├── inbox/                         # 實作截圖與操作紀錄的收件匣（不會上網站）
├── astro.config.mjs
└── CLAUDE.md                      # Claude Code 的工作守則（發布流程、寫作規則）
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
takeaway: 觀點的核心引言。                  # 必填，會顯示在文章頂部的觀點卡片
tags: [Ubuntu, Security]                   # 必填，至少一個
canonicalAuthor: Jane Doe                  # 選填，原文作者
canonicalPubDate: 2026-10-15T12:16:02Z     # 選填，原文發布時間（排序依據；沒填就用 pubDate）
draft: false                               # 選填，true 時不會建置
---
```

### 內文必備的兩個區塊

每篇文章內文**必須**包含以下兩個二級標題（文字需完全一致），缺一個建置就會失敗：

```markdown
## ikusupuroa 觀點

（以 Ubuntu 使用者的角度：值得注意的地方、該怎麼因應、Ubuntu 在這方面的優點）

## 原文精華導讀

（繁體中文核心大綱、重點表格、技術演進，結尾附「### 出處」連結）
```

`src/lib/digest-sections.mjs` 會自動把「ikusupuroa 觀點」套上 Callout 樣式，把「原文精華導讀」套上導讀樣式，作者不需要手寫 HTML。

### 撰寫原則

- 技術名詞保留英文，並附繁體中文說明，例如 Livepatch（核心熱修補）。
- 原文沒寫、也無法查證的內容，要用 `> **待確認**：…` 明確標註，不要臆測。
- 價格、版本號、支援年限以原文為準，本站不自行提供價格數字。

---

## 技術筆記與 Ubuntu 套件功能

兩個實作單元，由 ikusupuroa 動手實作、Claude 整理成文章：

| 單元 | 網址 | 必要區塊 |
| --- | --- | --- |
| 技術筆記 | `/notes/` | `## 探討議題`、`## 實作筆記與畫面` |
| Ubuntu 套件功能 | `/packages/` | `## 產品介紹`、`## 技術文件導讀與實作` |

系列第 2 章起，第一個區塊改為 `## 前情提要`（上一章完成了什麼、這一章要接著處理什麼）。缺少必要區塊時建置會失敗。

配色：導覽列與頁尾維持 Ubuntu 茄紫，單元內容區各有一組主色（定義在 `src/styles/global.css` 的 `.lab-theme-*`）：

| 單元 | 主色 | 輔助色 |
| --- | --- | --- |
| Ubuntu 套件功能 | Ubuntu Orange `#E95420`（官方） | Warm Grey `#AEA79F`、淺橘底 `#FDEEE8` |
| 技術筆記 | Kubernetes Blue `#326CE5`（官方） | 深海軍藍 `#0B1F44`、石板灰 `#64748B`、淺藍底 `#EAF1FD`（本站搭配） |

### 檔案放法

```text
src/content/notes/                  # 套件功能把 notes 換成 packages
├── my-note.md                      # 單篇（沒有截圖）
├── my-note-with-images/
│   ├── index.md                    # 單篇（有截圖）
│   └── images/01-install.png
└── my-series/                      # 系列
    ├── series.yaml                 # 系列標題、簡介、連載中／已完結
    ├── 01-setup.md                 # 檔名開頭的數字就是章節順序
    ├── 02-cluster.md
    └── images/
```

截圖用相對路徑引用：`![圖說](./images/01-install.png)`，替代文字會顯示成圖說，圖片會在建置時自動壓縮成 WebP。

### Frontmatter

```yaml
---
title: 標題                                # 必填
pubDate: 2026-10-27                        # 必填
updatedDate: 2026-11-01                    # 選填
summary: 2-3 句摘要。                       # 必填
tags: [Security]                           # 必填，至少一個
environment: [Ubuntu 24.04 LTS, LXD 6.10]  # 選填，顯示為「實作環境」
references:                                # 技術筆記選填；套件功能至少一份
  - title: LXD documentation
    url: https://documentation.ubuntu.com/lxd/
product: LXD                               # 套件功能必填
draft: false                               # 選填
---
```

`series.yaml`：

```yaml
title: 系列標題
summary: 系列簡介
status: ongoing   # ongoing（連載中）或 completed（已完結）
```

可直接複製 `example-single.md`、`example-series/` 這些範本草稿（`draft: true`，不會發布，但建置時會檢查格式）。

### 發布流程（SOP）

1. ikusupuroa 實作，把截圖與 `說明.md` 上傳到 `inbox/<主題資料夾>/`（步驟見 `inbox/README.md`）。
2. 在對話中告訴 Claude，例如：「inbox/2026-10-livepatch 已上傳，寫成技術筆記單篇」。
3. Claude 撰稿、搬移截圖、刪除已處理的素材，開 PR 並傳預覽截圖。
4. ikusupuroa 確認後才合併上線（與導讀文章的「先發布、後審查」不同）。

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
| `unpublished` | 曾發布但已下架（文章設為 `draft: true`）；用 `note` 說明原因 |

比對時以網址中 `/blog/` 之後的路徑（slug）判斷是不是同一篇，並先正規化網址（統一 https、去掉 `www.`、重複斜線、結尾斜線與 `utm_*` 參數）。

Canonical Blog 與 Ubuntu Blog 常刊登同一篇文章，slug 相同就視為同一篇：兩邊同時出現時以**先發表的那一邊**為來源；一邊已記錄在追蹤檔後，另一邊之後才刊登的同一篇會自動略過，不會再通知。

---

## 與 Claude Code 協作發布新文章（SOP）

本站採用 **「先發布、後審查」**：Claude 寫完文章、建置檢查通過後就直接合併上線，並通知編輯；編輯看過網站後，發現問題再請 Claude 修改或下架。

### Step 1：檢查新文章（選用）

每小時的自動監控會用 GitHub Issue 通知你新文章（見上方「新文章自動監控」）。也可以隨時請 Claude 手動檢查：

> 請執行 `node scripts/fetch-sources.mjs`，列出未處理的新文章，並依「對 Ubuntu 使用者的參考價值」排序，給我每篇一句話的推薦理由。

也可以直接貼原文網址，跳到 Step 2。

### Step 2：請 Claude 撰寫並發布

> 幫我新增一篇文章：https://ubuntu.com/blog/xxx

想指定觀點的方向可以一起說，例如「著重金融業合規」。Claude 會依序：

1. 閱讀原文，在 `src/content/articles/` 新增文章，並把 `sources-state.json` 中該篇標為 `published`。
2. 執行 `npm run build` 與 `astro check`，確認零錯誤、零警告。
3. 開 Pull Request，等 GitHub Actions 建置檢查通過後**直接合併**，網站約 1～2 分鐘後自動更新。
4. 確認部署成功，回報文章網址、觀點重點，以及文中標為「待確認」或「本站補充」的段落。

建置檢查失敗時，Claude 會先修正，不會合併壞掉的版本。

### Step 3：上線後審查

打開網站逐段核對，有問題直接在對話中告訴 Claude：

- [ ] 版本號、日期、指令與原文一致
- [ ] `canonicalUrl` 可以正常開啟
- [ ] 觀點有具體場景，不是空泛的「值得關注」
- [ ] 沒有原文沒寫、卻被寫成事實的內容
- [ ] 標籤沿用既有分類（Cloud、Ubuntu、AI、Security、Kubernetes 等），避免同義重複

### 修改或下架

- **修改**：「XXX 那篇的第 3 段改成……」，Claude 修改後同樣直接合併上線。
- **下架**：「把 XXX 那篇下架」，Claude 會：
  1. 在該篇 frontmatter 加上 `draft: true`（檔案保留、網站不再顯示，之後要重新上架只要改回 `false`）。
  2. 把 `sources-state.json` 中該篇的 `status` 改為 `unpublished`，並用 `note` 記錄原因。
  3. 合併上線並回報。

---

## 版權聲明

本站為獨立的非官方策展站，與 Canonical Ltd. 無隸屬關係。原文著作權屬 Canonical Ltd. 及原作者所有，本站僅提供繁體中文導讀、評論與出處連結。Ubuntu 與 Canonical 為 Canonical Ltd. 之註冊商標。
