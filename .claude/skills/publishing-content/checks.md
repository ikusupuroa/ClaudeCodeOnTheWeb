# 驗收指令

都在 repo 根目錄執行。`<檔案>` 是這次新增或修改的 Markdown 或資料夾，`<路徑>` 是站內網址去掉 `/ClaudeCodeOnTheWeb/` 之後的部分（例如 `notes/ubuntu-1404-cve-check/03-pro-fix-2004-2404/`）。

需要的工具：Node.js、`npm install` 裝好的套件、Playwright 與 Chromium。雲端工作階段都已預裝，不要再執行 `playwright install`。

## 1. 建置

```bash
npm run build
```

預期：`Complete!`，輸出裡沒有 `error` 或 `warn`。失敗時看錯誤訊息修正；缺少必要區塊時，錯誤會寫出是哪一篇、缺哪個標題。

## 2. 敏感資訊掃描

```bash
bash .claude/skills/publishing-content/scripts/scan-sensitive.sh <檔案>
```

預期：`✓ 沒有可疑的項目`。有列出的行就逐筆判斷，版號（例如 `1.2.3.4`）可以留，真實值就照 `CLAUDE.md` 的替換表換掉後重跑。腳本只認得常見格式，抓不到主機名稱、使用者名稱這類自由文字。所以還要拿 inbox 原稿出現過的每個真實值，用 `grep -rn '<真實值>' <檔案>` 確認沒有結果。

## 3. 程式碼區塊

```bash
grep -nE '^```' <檔案>
```

逐一確認：要讀者執行的指令是 `bash`、輸出是 `text`；`bash` 區塊裡沒有輸出，也沒有 `$` 或 `user@ubuntu-lab:~$` 提示字元。

## 4. 手機版跑版

先在背景啟動預覽（建置完才看得到最新內容）：

```bash
npx astro preview --port 4331
```

再執行：

```bash
node .claude/skills/publishing-content/scripts/check-overflow.cjs <路徑> [<路徑> ...]
```

預期：每一個路徑都是 `✓`。系列要一起檢查章節頁和系列總覽頁。`✗` 會列出超出的元素，通常是很長的行內程式碼或網址，改寫句子後重新建置再跑。

## 5. 預覽截圖（實作單元）

同一個預覽伺服器，用 Playwright 對新頁面各截一張桌面（寬 1280）與手機（寬 390）的整頁截圖，存在 scratchpad，用 `SendUserFile` 傳給編輯。

## 6. 部署確認

合併後用 `github:actions_list`（`method: list_workflow_runs`、`resource_id: deploy.yml`），找 `head_sha` 等於合併 commit 的那一筆。`status: in_progress` 就稍後再查，`conclusion: success` 才算完成；`failure` 時用 `github:get_job_logs` 看原因。
