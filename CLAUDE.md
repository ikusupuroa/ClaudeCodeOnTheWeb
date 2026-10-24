# ikusupuroa 的 Ubuntu 技術筆記 — Claude 工作守則

完整說明見 `README.md`；以下是 ikusupuroa（repo 擁有者，以下稱編輯）指定的規則，每次都要遵守。

網站定位：ikusupuroa 是一個 Ubuntu 使用者，透過這個網站把 Ubuntu 的優點推廣給其他人。

## 發布流程：先發布、後審查

- 新文章寫完後**不用等編輯審查**：開 PR → 等 GitHub Actions 的 `build` 檢查通過 → 直接合併到 `main`（會自動部署到 GitHub Pages）。
- 合併前必須在本機跑過 `npm run build`（零錯誤、零警告）；建置檢查失敗就先修，不合併壞掉的版本。
- 合併並確認部署成功後，**一定要告知編輯**：文章網址（`https://ikusupuroa.github.io/ClaudeCodeOnTheWeb/articles/<slug>/`）、觀點重點，以及文中標為「待確認」與「本站補充」的段落。
- 編輯要求修改時，同樣修改後直接合併並回報。
- 編輯要求**下架**時：在該篇 frontmatter 加 `draft: true`（不要刪檔），`src/data/sources-state.json` 該篇 `status` 改為 `unpublished` 並加 `note` 說明原因，合併後回報。
- 自動合併只適用於文章的新增、修改、下架；網站程式、版型或部署設定的變更，仍要先讓編輯確認。

## 新文章監控 Issue

- `monitor-feeds.yml` 每小時開帶 `new-articles` 標籤的 Issue 列出新文章；編輯會用「Issue #N 的第 X 篇」指定要寫哪幾篇。
- 處理時：要寫的照上方流程發布；編輯說略過的，在 `sources-state.json` 標為 `skipped` 並加 `note`。
- 該 Issue 的每一篇都處理完（發布或略過）後，在 Issue 留言說明處理結果並關閉 Issue。

## 寫作規則

- 每篇都必須有 `## ikusupuroa 觀點` 與 `## 原文精華導讀` 兩個區塊（缺一建置會失敗）；frontmatter 的 `takeaway` 是觀點的核心引言。
- 觀點以 ikusupuroa（Ubuntu 使用者）的角度撰寫：說明值得注意的地方、如何因應，並在有根據時點出 Ubuntu 的優點。讀者以台灣為主，可以使用台灣的在地情境。推薦 Ubuntu 不等於誇大，不能寫原文沒有支持的說法。
- 只根據原文與可查證的來源撰寫；原文沒寫、也查不到的內容用 `> **待確認**：…` 標註，自己補充的內容要註明「本站補充」。
- 技術名詞保留英文並附繁體中文說明；不提供價格數字。
- 新增文章時同步在 `sources-state.json` 記錄該篇為 `published`。

## 技術注意事項

- Node.js ≥ 22.23.4（建議 24，見 `.nvmrc`）。
- 網站部署在子路徑 `/ClaudeCodeOnTheWeb/`：元件中的站內連結用 `withBase()`；文章 Markdown 內連到其他文章用相對路徑，例如 `../ubuntu-pro-aws-upgrade/`。
