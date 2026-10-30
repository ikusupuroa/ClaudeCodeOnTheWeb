---
name: publishing-content
description: 撰寫、修改、下架本站文章的流程與驗收清單，涵蓋導讀文章（/articles/，依 Canonical 或 Ubuntu Blog 原文撰寫）與實作單元（技術筆記 /notes/、Ubuntu 套件功能 /packages/，依 inbox/ 素材撰寫單篇或系列章節）。編輯貼原文網址、指定 new-articles Issue 的篇目、說「inbox/xxx 已上傳」、要寫系列新章節，或要修改、下架文章時使用。
---

# 發布本站內容

規則以 `CLAUDE.md` 為準（發布流程、寫作規則、敏感資訊處理、上鎖），frontmatter 與檔案放法見 `README.md`。這個 skill 只放流程、寫作原則與驗收方法；和 `CLAUDE.md` 有出入時以 `CLAUDE.md` 為準，並告訴編輯哪裡不一致。

## 用詞

- **導讀文章**：`/articles/`，依原文撰寫，先發布、後審查。
- **實作單元**：技術筆記 `/notes/` 與 Ubuntu 套件功能 `/packages/` 的統稱，依 inbox 素材撰寫，**合併前必須等編輯確認**（編輯明確說「直接合併」時例外）。
- **編輯**：ikusupuroa。**回報**：在對話中告訴編輯結果。

## 開始前

1. 判斷是導讀文章還是實作單元，選下方對應的流程。
2. 第一次回應：一句話確認理解。有需要編輯決定的事（系列命名、章節放法、要不要改舊章節）給 2–3 個選項附優缺點，等編輯選完再動手；照流程走的部分不用問。
3. 複製下面的進度清單，每完成一項就打勾：

```text
- [ ] 1. 讀完素材（原文，或 inbox 的全部檔案與截圖）
- [ ] 2. 敏感資訊：文字換成假資訊、截圖逐張檢查
- [ ] 3. 撰稿（套用「寫作原則」）
- [ ] 4. 驗收：建置、敏感資訊掃描、程式碼區塊、手機版跑版（不通過就修正後重跑）
- [ ] 5. 開 PR，等建置檢查通過
- [ ] 6. 實作單元：傳預覽截圖、問要不要上鎖、等編輯確認
- [ ] 7. 合併、確認部署成功
- [ ] 8. 回報：網址、待確認與本站補充段落、敏感資訊替換清單
```

## 寫作原則

這幾條是編輯修正過的地方，每篇都要套用。

**1. 查證過就用肯定語氣。** 從官方來源（CVE API、USN、官方文件）查到的事直接寫，不加「應該」「推測」「可能」。查不到的才用 `> **待確認**：…`。

```text
✗ PHP 的修補在 esm-infra，推測 PHP 應該屬於 main。
✓ PHP 屬於 main，所以 20.04 的修補放在 esm-infra。
```

**2. 編輯在對話中說明的事實，直接寫進文章**，並移除對應的待確認。

```text
✗ > **待確認**：20.04 預載的 ubuntu-pro-client 是哪一版？
✓ 20.04 預載的 `ubuntu-pro-client` 是 35.1 版，我先手動升級到 38 版，再模擬檢查：
```

**3. 模擬結果和實際狀態分開寫。** `--dry-run`、`--simulate` 的輸出是「如果執行會怎樣」，要寫清楚實際上有沒有變更、系統目前的狀態。

```text
✗ dry-run 顯示漏洞已經解決了。
✓ `--dry-run` 只檢查、不更新。最後的 ✔ resolved 是模擬整個流程的結果；
  沒有綁定授權，實際上什麼都沒有更新，PHP 仍是 7.4.3-4ubuntu2.29，漏洞還在。
```

**4. 把編輯的口語說法改得更精確時，回報裡要說明**改了什麼、為什麼。

**5. 編輯沒實測、但屬於最佳實踐的步驟**，標 `> **本站補充，未實測**：…`，寫出依據（官方文件或套件行為）和讀者驗證的方法，不寫成編輯做過。

**6. 版號、pocket、套件元件（main／universe）以官方資料為準。** 安全相關先查 `https://ubuntu.com/security/cves/<CVE>.json`。查不到的來源（例如網路擋住的 Launchpad）不靠記憶補，改查其他官方來源或標待確認。

**7. 系列新增一章時**：「系列小結」移到最新一章；上一章的小結改名「這一章的小結」並指向下一章；`series.yaml` 的標題與簡介要涵蓋所有章節。舊章節除了這些銜接處，不主動改寫。

**8. 技術名詞保留英文並附繁體中文說明**；用學習者的角度、語氣中立，不寫成專家建議。

## 流程 A：導讀文章

1. 讀原文。只根據原文與可查證來源撰寫。
2. 新增 `src/content/articles/<slug>.md`：`pubDate` 用今天；必要區塊 `## ikusupuroa 觀點`、`## 原文精華導讀`（結尾附 `### 出處`）；標籤沿用既有分類。
3. `src/data/sources-state.json` 記錄為 `published`（`article` 填 slug、`processedDate` 填今天）。
4. 驗收（見下方），開 PR → 建置檢查通過 → 直接合併 → 確認部署。
5. 回報網址 `https://ikusupuroa.github.io/ClaudeCodeOnTheWeb/articles/<slug>/`、觀點重點、所有待確認與本站補充。
6. 來自 `new-articles` Issue 時：略過的篇目標 `skipped` 加 `note`；整個 Issue 處理完後留言說明結果並關閉 Issue。

修改：改完同樣直接合併並回報。下架：照 `CLAUDE.md`（`draft: true`、狀態改 `unpublished` 加 `note`）。

## 流程 B：實作單元

1. 讀完 inbox 的全部素材，包括每一張截圖。不自行編造操作結果或畫面。
2. 敏感資訊依 `CLAUDE.md`「敏感資訊處理」：文字換成假資訊；截圖有敏感資訊時告訴編輯是哪一張、哪個位置，處理好之前不放上網站。
3. 決定放法與必要區塊（見 `CLAUDE.md`）；系列第 2 章起第一個區塊是 `## 前情提要`。
4. 撰稿：要讀者執行的指令用 ` ```bash `，不含提示字元；輸出用 ` ```text `；一個區塊不混放。`environment` 寫實作環境與版本。素材沒交代清楚的步驟標待確認，並在回報中詢問編輯。
5. 截圖從 `inbox/` 搬到文章的 `images/`，處理完的 inbox 素材在同一個 PR 刪除。
6. 驗收（見下方），開 **draft PR**。
7. 用 Playwright 截桌面與手機的整頁截圖，用 `SendUserFile` 傳給編輯，並**問編輯這篇（或這一章）要不要上鎖**。
8. **編輯確認後才合併** → 確認部署 → 回報網址、待確認與本站補充、敏感資訊替換清單。

## 驗收

指令與預期結果見 [checks.md](checks.md)。依序執行，**任何一項不通過就修正後從那一項重跑，全部通過才開 PR**：

1. `npm run build` 零錯誤、零警告
2. `bash .claude/skills/publishing-content/scripts/scan-sensitive.sh <檔案>`：逐筆確認列出的行
3. 程式碼區塊：`bash` 只放指令、輸出都是 `text`
4. `node .claude/skills/publishing-content/scripts/check-overflow.cjs <路徑>`：全部 ✓
5. 讀一遍全文：查證過的事實沒有推論字眼、模擬結果沒有寫成已完成、待確認和本站補充都列進回報

## 合併與部署

1. 在指定的開發分支 commit，`git push -u origin <分支>`。用 `github:create_pull_request` 開 PR，再用 `claude-code-remote:subscribe_pr_activity` 訂閱。PR 說明與 commit 訊息只寫敏感資訊替換的**類型與數量**，不寫真實值。
2. 等建置檢查通過（`check_suite.completed` 事件）。實作單元還要等編輯確認。
3. `github:update_pull_request`（`draft: false`）→ `github:merge_pull_request`（帶完整 head SHA）。
4. 把開發分支重設到最新 `main`：`git fetch origin main && git checkout -B <分支> origin/main`，再 `git push --force-with-lease`。
5. 用 `github:actions_list`（`list_workflow_runs`、`deploy.yml`）找 `head_sha` 等於合併 commit 的那一筆，`conclusion: success` 才回報。不要用 curl 檢查 github.io，工作環境通常連不到。

## 維護這個 skill

修改流程或原則時，用 [evals.md](evals.md) 的情境確認行為沒有退步。
