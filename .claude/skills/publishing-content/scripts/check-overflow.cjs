// 檢查頁面在手機寬度下有沒有橫向跑版。
// 用法：node check-overflow.cjs <路徑> [<路徑> ...]
//   路徑是站內網址去掉 /ClaudeCodeOnTheWeb/ 之後的部分，例如 notes/ubuntu-1404-cve-check/03-pro-fix-2004-2404/
// 先在 repo 根目錄啟動預覽：npm run build && npx astro preview --port 4331
// 全部通過時 exit 0；有跑版或連不上時 exit 1。
const { chromium } = require('playwright');

// 和 checks.md 的預覽指令同一個 port
const BASE = process.env.PREVIEW_BASE || 'http://localhost:4331/ClaudeCodeOnTheWeb/';
// iPhone 14/15 的 CSS 寬度，是本站讀者最常見的手機寬度
const WIDTH = 390;
// 子像素四捨五入會讓元素右緣多出 1px，容許 2px 以免誤報
const TOLERANCE = 2;

const paths = process.argv.slice(2);
if (paths.length === 0) {
  console.error('用法：node check-overflow.cjs <路徑> [<路徑> ...]');
  process.exit(1);
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });
  let failed = false;
  for (const p of paths) {
    const url = BASE + p.replace(/^\//, '');
    let res;
    try {
      res = await page.goto(url);
    } catch (e) {
      console.error(`✗ ${url} 連不上：先執行 npx astro preview --port 4331（${e.message.split('\n')[0]}）`);
      failed = true;
      continue;
    }
    if (!res || res.status() !== 200) {
      console.error(`✗ ${url} 回應 ${res ? res.status() : '無'}：確認路徑是否正確`);
      failed = true;
      continue;
    }
    const r = await page.evaluate(({ limit }) => {
      // 程式碼區塊、表格這類放在可捲動或會裁切的容器裡的元素，不會撐開整頁，不算跑版
      const clipped = (e) => {
        for (let a = e.parentElement; a && a !== document.body; a = a.parentElement) {
          if (getComputedStyle(a).overflowX !== 'visible') return true;
        }
        return false;
      };
      const bad = [];
      document.querySelectorAll('main *').forEach((e) => {
        const x = e.getBoundingClientRect();
        if (x.right > limit && !clipped(e)) {
          bad.push(`<${e.tagName.toLowerCase()}> 右緣 ${Math.round(x.right)}px：${e.textContent.trim().slice(0, 50)}`);
        }
      });
      return { scrollWidth: document.documentElement.scrollWidth, bad: bad.slice(0, 6) };
    }, { limit: WIDTH + TOLERANCE });
    if (r.scrollWidth > WIDTH || r.bad.length) {
      failed = true;
      console.log(`✗ ${p} 頁面寬 ${r.scrollWidth}px（應為 ${WIDTH}px），超出的元素：`);
      r.bad.forEach((b) => console.log(`    ${b}`));
      console.log('  常見原因是很長的行內程式碼或網址：改寫句子或移到程式碼區塊。');
    } else {
      console.log(`✓ ${p}`);
    }
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
