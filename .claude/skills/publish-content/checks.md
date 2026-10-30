# 驗收清單的指令

以下指令都在 repo 根目錄執行。`<檔案>` 換成這次新增或修改的 Markdown。

## 1. 建置

```bash
npm run build
```

輸出要零錯誤、零警告。

## 2. 敏感資訊掃描

```bash
# IPv4：除了 192.0.2.x 和版號，其他都要人工確認
grep -nE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' <檔案> | grep -v '192\.0\.2\.'
# MAC、Email
grep -nEi '([0-9a-f]{2}:){5}[0-9a-f]{2}|[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}' <檔案>
# 提示字元與本機路徑：只能是 user@ubuntu-lab、/home/user
grep -nE '[a-z0-9_-]+@[a-z0-9_-]+:|/home/[^u/ ]|/home/u[^s]' <檔案>
# Token、金鑰類字串
grep -nEi 'token|password|passwd|secret|C1[0-9A-Za-z]{20,}' <檔案>
```

有結果不一定是問題（例如版號 `1.2.3.4` 或說明文字裡的 token 一詞），逐筆判斷。也要比對 inbox 原稿出現過的真實值，確認文章裡已經全部替換。

## 3. 程式碼區塊

```bash
# 列出每個程式碼區塊的語言標記，確認指令是 bash、輸出是 text
grep -nE '^```' <檔案>
```

`bash` 區塊裡不應該有指令輸出、也不應該有 `$` 或 `user@ubuntu-lab:~$` 提示字元。

## 4. 手機版跑版檢查

```bash
npm run build && npx astro preview --port 4331 &
```

把下面的腳本存到 scratchpad（例如 `overflow.cjs`），`PAGES` 換成要檢查的網址路徑，再用 `node` 執行：

```js
const { chromium } = require('playwright');
const BASE = 'http://localhost:4331/ClaudeCodeOnTheWeb/';
const PAGES = ['notes/<series>/<chapter>/', 'notes/<series>/'];
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 900 } });
  for (const u of PAGES) {
    await p.goto(BASE + u);
    const r = await p.evaluate(() => {
      const bad = [];
      document.querySelectorAll('main *').forEach((e) => {
        const x = e.getBoundingClientRect();
        if (x.right > 392 && !e.closest('pre') && !e.closest('.overflow-x-auto'))
          bad.push(`${e.tagName}: ${e.textContent.slice(0, 50)} (${Math.round(x.right)})`);
      });
      return { scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 6) };
    });
    console.log(u, r);
  }
  await b.close();
})();
```

`scrollWidth` 要等於 390、`bad` 要是空的。超出通常是很長的行內程式碼或網址，改寫句子。

## 5. 預覽截圖（實作單元）

同一個 preview 伺服器，用 Playwright 對新頁面各截一張桌面（1280 寬）與手機（390 寬）的整頁截圖，存在 scratchpad，用 `SendUserFile` 傳給編輯。

## 6. 部署確認

合併後用 GitHub MCP 的 `actions_list`（`method: list_workflow_runs`、`resource_id: deploy.yml`），找 `head_sha` 等於合併 commit 的那一筆，`conclusion` 要是 `success`。
