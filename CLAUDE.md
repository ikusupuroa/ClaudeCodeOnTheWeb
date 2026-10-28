# ikusupuroa 的 Ubuntu 技術筆記 — Claude 工作守則

完整說明見 `README.md`；以下是 ikusupuroa（repo 擁有者，以下稱編輯）指定的規則，每次都要遵守。

網站定位：ikusupuroa 是一個 Linux 學習者，選擇 Ubuntu 作為學習路線，這個網站是 ikusupuroa 的學習筆記。網站上的敘述保持中立：以學習者的角度描述，不要把 ikusupuroa 寫成專家或顧問，也不要誇大 ikusupuroa 的能力或 Ubuntu 的優點。

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
- 觀點以 ikusupuroa（Linux 學習者）的角度撰寫：讀完後覺得值得注意的地方、可以怎麼因應、還有哪些疑問；有根據時可以提到 Ubuntu 的做法，但語氣中立，不用專家或顧問的口吻給建議，也不能寫原文沒有支持的說法。讀者以台灣為主，可以使用台灣的在地情境。
- 只根據原文與可查證的來源撰寫；原文沒寫、也查不到的內容用 `> **待確認**：…` 標註，自己補充的內容要註明「本站補充」。
- 技術名詞保留英文並附繁體中文說明；不提供價格數字。
- 新增文章時同步在 `sources-state.json` 記錄該篇為 `published`。

## 技術筆記與 Ubuntu 套件功能（實作單元）

- 兩個單元：「技術筆記」`/notes/`（議題 → Ubuntu 的解法 → 實作）與「Ubuntu 套件功能」`/packages/`（產品介紹 → 技術文件導讀與實作）。
- **由編輯實作、Claude 撰稿**：編輯把截圖與操作紀錄上傳到 `inbox/<主題資料夾>/`（說明見 `inbox/README.md`）。Claude 只根據這些素材與官方文件撰寫，不自行編造操作結果或畫面；素材沒交代清楚的步驟用「待確認」標註並詢問編輯。
- **先預覽、再發布**（與導讀文章不同）：開 PR 後，用 Playwright 截圖傳給編輯預覽，**編輯確認後才合併**，合併後回報網址。
- 內容放法：單篇 `src/content/<notes|packages>/<slug>.md`，有截圖時改成 `<slug>/index.md` ＋ `<slug>/images/`；系列放在 `<series>/`，內含 `series.yaml` 與以章節數字開頭的 `01-xxx.md`，截圖放 `<series>/images/`。範本見各單元的 `example-*` 草稿。
- 截圖從 `inbox/` 搬到文章資料夾，用相對路徑引用：`![圖說](./images/01-install.png)`，替代文字會成為圖說；處理完的 `inbox/` 素材在同一個 PR 中刪除。
- 必要區塊（缺一建置會失敗）：
  - 技術筆記：`## 探討議題`、`## 實作筆記與畫面`
  - Ubuntu 套件功能：`## 產品介紹`、`## 技術文件導讀與實作`，且 frontmatter 的 `references` 至少一份官方文件、要填 `product`
  - 系列第 2 章起：第一個區塊改為 `## 前情提要`（上一章完成了什麼、這一章要接著處理什麼）
- 截圖與指令輸出要遮蔽密碼、Token、IP 等敏感資訊；發現素材有未遮蔽的敏感資訊，先告知編輯，不要放上網站。
- **指令區塊與複製按鈕**：要讓讀者貼到終端機執行的指令，程式碼區塊一律標 ` ```bash `（網頁會自動加「複製」按鈕，`# 註解` 會一起複製）；指令的輸出結果、設定檔內容、JSON 等標 ` ```text `、` ```json ` 等，不會有複製按鈕。素材通常不會區分指令與輸出，由 Claude 判斷；一個區塊不要混放指令與輸出。
- **文章上鎖**：frontmatter 加 `locked: true` 後，列表與章節目錄只顯示標題和小鎖，文章網址只顯示「這篇還在編輯中」，內文不會輸出到網站。**每次發表或新增章節時，合併前都要主動問編輯：這篇（或這一章）要不要上鎖？** 解鎖時把 `locked` 拿掉或設為 `false`，並回報網址。
  - 注意：repo 是公開的，上鎖只擋網站讀者，原稿在 GitHub 上仍然看得到；不能公開的內容不要放進 repo。

## 技術注意事項

- Node.js ≥ 22.23.4（建議 24，見 `.nvmrc`）。雲端工作階段啟動時，`.claude/hooks/session-start.sh` 會自動安裝 Node 24 與套件。
- 同一篇文章在 Canonical Blog 與 Ubuntu Blog 都有時視為一篇（以網址 `/blog/` 後的 slug 判斷），來源用先發表的那一邊；監控腳本已自動處理。
- 網站部署在子路徑 `/ClaudeCodeOnTheWeb/`：元件中的站內連結用 `withBase()`；文章 Markdown 內連到其他文章用相對路徑，例如 `../ubuntu-pro-aws-upgrade/`。
