#!/usr/bin/env node
/**
 * 監控導讀文章的原文有沒有更新。
 *
 * 文章 frontmatter 加上 `watchSource: true` 就會納入監控。
 * 每篇的比對基準存在 src/data/source-snapshots/<slug>.txt（原文擷取出的純文字）。
 *
 * 用法：
 *   node scripts/watch-source-updates.mjs --json
 *       檢查所有監控中的文章，輸出 JSON 報告（給 monitor-source-updates.yml 使用）
 *   node scripts/watch-source-updates.mjs --snapshot <slug>
 *       抓目前的原文，更新這篇的比對基準（文章依原文更新後執行）
 *   node scripts/watch-source-updates.mjs --snapshot <slug> --from-html <檔案>
 *       用已下載的原文 HTML 建立比對基準
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARTICLES_DIR = 'src/content/articles';
const SNAPSHOT_DIR = 'src/data/source-snapshots';
// 差異超過這個行數就截斷，避免超出 Issue 內文長度上限
const MAX_DIFF_LINES = 200;

/** 讀取文章 frontmatter 中需要的欄位 */
function readFrontmatter(file) {
  const text = readFileSync(file, 'utf8');
  const fm = text.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
  const get = (key) => fm.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))?.[1].trim().replace(/^["']|["']$/g, '');
  return {
    title: get('title'),
    canonicalTitle: get('canonicalTitle'),
    canonicalUrl: get('canonicalUrl'),
    watchSource: get('watchSource') === 'true',
    draft: get('draft') === 'true',
  };
}

function watchedArticles() {
  return readdirSync(ARTICLES_DIR)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ slug: f.replace(/\.md$/, ''), ...readFrontmatter(join(ARTICLES_DIR, f)) }))
    .filter((a) => a.watchSource && !a.draft && a.canonicalUrl);
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“', hellip: '…', ndash: '–', mdash: '—' };

function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e.toLowerCase()] ?? m;
  });
}

/**
 * 從 ubuntu.com／canonical.com 的 Blog 頁面取出正文：
 * <article> 開頭到產品卡片或電子報表單之前，不含分享按鈕等每次可能變動的區塊。
 */
export function extractText(html) {
  let s = html.match(/<article[\s>][\s\S]*?<\/article>/)?.[0];
  if (!s) throw new Error('找不到 <article>，頁面版型可能改了');
  const cut = s.search(/id="product-card"|class="blog-article-newsletter"|class="blog-article-share/);
  // 從那個區塊的開始標籤 `<` 截斷，不留下半個標籤
  if (cut > 0) s = s.slice(0, s.lastIndexOf('<', cut));
  s = s
    .replace(/<(script|style|svg|button|form)[\s>][\s\S]*?<\/\1>/gi, '')
    .replace(/<a\s[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 [$1]')
    .replace(/<h[1-6][^>]*>/gi, '\n## ')
    .replace(/<li[^>]*>/gi, '\n- ')
    .replace(/<t[dh][^>]*>/gi, ' | ')
    .replace(/<(br|p|div|tr|pre|section|header|table|ul|ol)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '');
  return decodeEntities(s)
    .split('\n')
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter((line) => line && line !== '|')
    .join('\n');
}

/** 逐行比較（LCS），回傳 unified diff 風格的行（不含上下文） */
export function diffLines(oldText, newText) {
  const a = oldText.split('\n');
  const b = newText.split('\n');
  const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const out = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push(`- ${a[i++]}`);
    } else {
      out.push(`+ ${b[j++]}`);
    }
  }
  while (i < a.length) out.push(`- ${a[i++]}`);
  while (j < b.length) out.push(`+ ${b[j++]}`);
  return out;
}

const hash = (text) => createHash('sha256').update(text).digest('hex').slice(0, 16);

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': 'ikusupuroa-notes-source-watch/1.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return extractText(await res.text());
}

const snapshotPath = (slug) => join(SNAPSHOT_DIR, `${slug}.txt`);

async function check() {
  const report = { checkedAt: new Date().toISOString(), updated: [], errors: [], watched: 0 };
  for (const article of watchedArticles()) {
    report.watched++;
    const path = snapshotPath(article.slug);
    if (!existsSync(path)) {
      report.errors.push({ slug: article.slug, error: `沒有比對基準 ${path}，請執行 --snapshot ${article.slug}` });
      continue;
    }
    try {
      const current = await fetchText(article.canonicalUrl);
      const baseline = readFileSync(path, 'utf8').trimEnd();
      if (current === baseline) continue;
      const diff = diffLines(baseline, current);
      report.updated.push({
        slug: article.slug,
        title: article.title,
        canonicalTitle: article.canonicalTitle,
        url: article.canonicalUrl,
        hash: hash(current),
        diff: diff.slice(0, MAX_DIFF_LINES),
        truncated: diff.length > MAX_DIFF_LINES,
      });
    } catch (e) {
      report.errors.push({ slug: article.slug, error: e.message });
    }
  }
  console.log(JSON.stringify(report, null, 2));
}

async function snapshot(slug, htmlFile) {
  const file = join(ARTICLES_DIR, `${slug}.md`);
  if (!existsSync(file)) throw new Error(`找不到文章 ${file}`);
  const { canonicalUrl } = readFrontmatter(file);
  const text = htmlFile ? extractText(readFileSync(htmlFile, 'utf8')) : await fetchText(canonicalUrl);
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  writeFileSync(snapshotPath(slug), `${text}\n`);
  console.error(`已更新 ${snapshotPath(slug)}（${text.split('\n').length} 行）`);
}

const args = process.argv.slice(2);
const flag = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : undefined;
};

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  try {
    if (args.includes('--snapshot')) await snapshot(flag('--snapshot'), flag('--from-html'));
    else if (args.includes('--json')) await check();
    else {
      console.error('用法：--json，或 --snapshot <slug> [--from-html <檔案>]');
      process.exit(1);
    }
  } catch (e) {
    console.error(`錯誤：${e.message}`);
    process.exit(1);
  }
}
