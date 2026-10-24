#!/usr/bin/env node
/**
 * 抓取 Canonical / Ubuntu 官方 RSS，與 src/data/sources-state.json 比對，
 * 列出尚未處理的新文章，方便在 Claude Code 對話中審查選題。
 *
 * 用法：
 *   node scripts/fetch-sources.mjs              # 列出所有未處理文章
 *   node scripts/fetch-sources.mjs --limit 5    # 每個 Feed 最多列 5 篇
 *   node scripts/fetch-sources.mjs --json       # 以 JSON 輸出（給程式或 Claude 解析）
 *
 * 本腳本只讀不寫：是否處理、處理結果，請在審查後手動（或請 Claude）更新 sources-state.json。
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';

const STATE_PATH = fileURLToPath(new URL('../src/data/sources-state.json', import.meta.url));
const SUMMARY_LENGTH = 200;
const FETCH_TIMEOUT_MS = 20_000;

const FEED_NAMES = {
  'canonical.com': 'Canonical Blog',
  'ubuntu.com': 'Ubuntu Blog',
};

// ---------- CLI 參數 ----------
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const limitIndex = args.indexOf('--limit');
const limit = limitIndex >= 0 ? Number.parseInt(args[limitIndex + 1], 10) : Infinity;
if (limitIndex >= 0 && !(limit > 0)) {
  console.error('--limit 需要正整數，例如 --limit 5');
  process.exit(2);
}

// ---------- 工具函式 ----------

/** 正規化網址，避免因 www、結尾斜線、重複斜線或追蹤參數造成重複判斷 */
function normalizeUrl(raw) {
  try {
    const url = new URL(String(raw).trim());
    url.protocol = 'https:';
    url.hostname = url.hostname.replace(/^www\./, '');
    url.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/+$/, '') || '/';
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) {
      if (key.startsWith('utm_')) url.searchParams.delete(key);
    }
    return url.toString();
  } catch {
    return String(raw).trim();
  }
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', hellip: '…' };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? Number.parseInt(code.slice(2), 16) : Number.parseInt(code.slice(1), 10);
      return Number.isFinite(n) ? String.fromCodePoint(n) : match;
    }
    return ENTITIES[code.toLowerCase()] ?? match;
  });
}

/** 去除 HTML 標籤並壓縮空白；實體可能被重複編碼（如 &amp;#8217;），解碼兩次 */
function toPlainText(html) {
  const text = decodeEntities(decodeEntities(String(html ?? '')))
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');
  return decodeEntities(text).replace(/\s+/g, ' ').trim();
}

/** Ubuntu Blog 的作者欄常是「Name (Name)」，去掉重複的括號 */
function cleanAuthor(raw) {
  const author = toPlainText(raw);
  const match = author.match(/^(.+?)\s*\((.+)\)$/);
  return match && match[1] === match[2] ? match[1] : author;
}

function truncate(text, length) {
  const chars = [...text];
  return chars.length > length ? `${chars.slice(0, length).join('')}…` : text;
}

/** fast-xml-parser 的節點可能是字串或 { '#text': ... } */
function textValue(node) {
  if (node == null) return '';
  if (typeof node === 'object') return String(node['#text'] ?? '');
  return String(node);
}

function toArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function feedName(feedUrl) {
  const host = new URL(feedUrl).hostname.replace(/^www\./, '');
  return FEED_NAMES[host] ?? host;
}

function formatDate(date) {
  if (!date || Number.isNaN(date.getTime())) return '（無日期）';
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Taipei',
  }).format(date);
}

// ---------- Feed 解析 ----------

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  processEntities: true,
  trimValues: true,
});

/** 同時支援 RSS 2.0 與 Atom */
function parseFeed(xml, source) {
  const doc = parser.parse(xml);

  if (doc.rss?.channel) {
    return toArray(doc.rss.channel.item).map((item) => ({
      source,
      title: toPlainText(textValue(item.title)),
      url: normalizeUrl(textValue(item.link)),
      pubDate: new Date(textValue(item.pubDate)),
      author: cleanAuthor(textValue(item.author ?? item['dc:creator'])),
      summary: truncate(toPlainText(textValue(item.description) || textValue(item['content:encoded'])), SUMMARY_LENGTH),
    }));
  }

  if (doc.feed) {
    return toArray(doc.feed.entry).map((entry) => {
      const links = toArray(entry.link);
      const link = links.find((l) => l['@_rel'] === 'alternate' || !l['@_rel']) ?? links[0];
      return {
        source,
        title: toPlainText(textValue(entry.title)),
        url: normalizeUrl(link?.['@_href'] ?? textValue(link)),
        pubDate: new Date(textValue(entry.published ?? entry.updated)),
        author: cleanAuthor(textValue(entry.author?.name)),
        summary: truncate(toPlainText(textValue(entry.summary) || textValue(entry.content)), SUMMARY_LENGTH),
      };
    });
  }

  throw new Error('無法辨識的 Feed 格式（非 RSS 2.0 或 Atom）');
}

async function fetchFeed(feedUrl) {
  const response = await fetch(feedUrl, {
    headers: {
      'User-Agent': 'ikusupuroa-ubuntu-notes/1.0 (+feed monitor)',
      Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, */*;q=0.8',
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${response.statusText}`);
  return parseFeed(await response.text(), feedName(feedUrl));
}

// ---------- 主流程 ----------

async function main() {
  const state = JSON.parse(await readFile(STATE_PATH, 'utf8'));
  const known = new Map(toArray(state.items).map((item) => [normalizeUrl(item.url), item]));

  const results = await Promise.allSettled(state.monitored_feeds.map(fetchFeed));

  const errors = [];
  const newItems = [];
  let fetched = 0;

  results.forEach((result, i) => {
    const feedUrl = state.monitored_feeds[i];
    if (result.status === 'rejected') {
      errors.push({ feed: feedUrl, error: result.reason?.cause?.message ?? result.reason?.message ?? String(result.reason) });
      return;
    }
    fetched += result.value.length;
    const fresh = result.value
      .filter((item) => item.url && !known.has(item.url))
      .sort((a, b) => b.pubDate - a.pubDate)
      .slice(0, limit);
    newItems.push(...fresh);
  });

  // 同一篇文章可能同時出現在兩個 Feed
  const seen = new Set();
  const unique = newItems
    .filter((item) => (seen.has(item.url) ? false : seen.add(item.url)))
    .sort((a, b) => b.pubDate - a.pubDate);

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          fetched,
          newItems: unique.map((item) => ({ ...item, pubDate: Number.isNaN(item.pubDate.getTime()) ? null : item.pubDate.toISOString() })),
          errors,
        },
        null,
        2,
      ),
    );
  } else {
    printReport({ fetched, known: known.size, unique, errors });
  }

  // 所有 Feed 都失敗才回傳非 0，部分失敗仍輸出可用結果
  if (errors.length === state.monitored_feeds.length) process.exitCode = 1;
}

function printReport({ fetched, known, unique, errors }) {
  const line = '─'.repeat(72);
  console.log(`\nikusupuroa Ubuntu 技術筆記｜新文章監控  ${formatDate(new Date())}`);
  console.log(line);
  console.log(`已抓取 ${fetched} 篇 ・ 追蹤檔已記錄 ${known} 篇 ・ 未處理 ${unique.length} 篇`);

  for (const { feed, error } of errors) {
    console.warn(`\n⚠ 無法抓取 ${feed}\n  原因：${error}`);
  }

  if (unique.length === 0) {
    console.log('\n沒有未處理的新文章。\n');
    return;
  }

  unique.forEach((item, i) => {
    console.log(`\n[${String(i + 1).padStart(2, '0')}] ${item.title}`);
    console.log(`     來源：${item.source}${item.author ? ` ・ 作者：${item.author}` : ''}`);
    console.log(`     發布：${formatDate(item.pubDate)}`);
    console.log(`     網址：${item.url}`);
    console.log(`     摘要：${item.summary || '（無摘要）'}`);
  });

  console.log(`\n${line}`);
  console.log('下一步：在 Claude Code 對話中挑選要發布的編號，並更新 src/data/sources-state.json。\n');
}

main().catch((error) => {
  console.error(`執行失敗：${error.message}`);
  process.exit(1);
});
