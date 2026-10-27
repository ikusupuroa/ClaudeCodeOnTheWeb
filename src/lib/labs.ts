import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * 「技術筆記」與「Ubuntu 套件功能」兩個實作單元的共用邏輯。
 *
 * 內容放法（以技術筆記為例，套件功能把 notes 換成 packages）：
 *   src/content/notes/<slug>.md                    單篇
 *   src/content/notes/<slug>/index.md + images/    有截圖的單篇
 *   src/content/notes/<series>/series.yaml         系列資訊
 *   src/content/notes/<series>/01-<name>.md        系列章節，檔名開頭的數字是章節順序
 */

export type LabSectionKey = 'notes' | 'packages';
export type LabDoc = CollectionEntry<'notes'> | CollectionEntry<'packages'>;
type SeriesDoc = CollectionEntry<'series'>;

export const RECAP_SECTION = '## 前情提要';

export const LAB_SECTIONS = {
  notes: {
    key: 'notes',
    label: '技術筆記',
    navLabel: '技術筆記',
    eyebrow: 'TECH NOTES',
    path: '/notes/',
    description: '學習過程中注意到的技術議題：查看 Ubuntu 提供的解決方式，自己動手試一次，記下步驟與畫面。',
    introSection: '## 探討議題',
    labSection: '## 實作筆記與畫面',
  },
  packages: {
    key: 'packages',
    label: 'Ubuntu 套件功能',
    navLabel: '套件功能',
    eyebrow: 'UBUNTU PACKAGES',
    path: '/packages/',
    description: '認識 Canonical 推出的套件與產品：整理它解決什麼問題，對照官方技術文件動手操作，記下步驟與畫面。',
    introSection: '## 產品介紹',
    labSection: '## 技術文件導讀與實作',
  },
} as const;

export type LabSection = (typeof LAB_SECTIONS)[LabSectionKey];

export interface LabEntry {
  section: LabSectionKey;
  doc: LabDoc;
  /** 單元內的網址路徑，例如 'my-note' 或 'my-series/01-setup' */
  slug: string;
  /** 系列章節才有 */
  seriesSlug?: string;
  chapter?: number;
}

export interface LabSeries {
  section: LabSectionKey;
  slug: string;
  data: SeriesDoc['data'];
  /** 已發布的章節，依章節順序 */
  chapters: LabEntry[];
}

export type LabItem = { kind: 'single'; entry: LabEntry } | { kind: 'series'; series: LabSeries };

export interface LabContent {
  singles: LabEntry[];
  series: LabSeries[];
  /** 單篇與系列混合，依最近更新的發表日由新到舊 */
  items: LabItem[];
}

export function sectionHref(section: LabSectionKey, slug = ''): string {
  return `${LAB_SECTIONS[section].path}${slug ? `${slug}/` : ''}`;
}

export function itemDate(item: LabItem): Date {
  if (item.kind === 'single') return item.entry.doc.data.pubDate;
  return item.series.chapters.at(-1)!.doc.data.pubDate;
}

function fail(message: string): never {
  throw new Error(message);
}

/** 檢查必要區塊：單篇與第 1 章要有導入區塊＋實作區塊；第 2 章起要有前情提要＋實作區塊 */
function checkSections(section: LabSectionKey, doc: LabDoc, chapter?: number) {
  const { introSection, labSection } = LAB_SECTIONS[section];
  const required = chapter && chapter > 1 ? [RECAP_SECTION, labSection] : [introSection, labSection];
  const missing = required.filter((heading) => !doc.body?.includes(heading));
  if (missing.length > 0) fail(`${section}/${doc.id} 缺少必要區塊：${missing.join('、')}`);
}

const cache = new Map<LabSectionKey, Promise<LabContent>>();

/** 載入單元內容並驗證格式；草稿也會驗證，但不會出現在結果中 */
export function getLabContent(section: LabSectionKey): Promise<LabContent> {
  if (!cache.has(section)) cache.set(section, load(section));
  return cache.get(section)!;
}

async function load(section: LabSectionKey): Promise<LabContent> {
  const docs: LabDoc[] = await getCollection(section);
  const seriesDocs = new Map(
    (await getCollection('series'))
      .filter((s) => s.id.startsWith(`${section}/`))
      .map((s) => [s.id.split('/')[1], s] as const),
  );

  const singles: LabEntry[] = [];
  const chaptersBySeries = new Map<string, LabEntry[]>();

  for (const doc of docs) {
    const parts = doc.id.split('/');
    if (parts.length === 1) {
      checkSections(section, doc);
      singles.push({ section, doc, slug: doc.id });
      continue;
    }
    if (parts.length !== 2) fail(`${section}/${doc.id}：資料夾最多一層（單篇資料夾或系列資料夾）`);

    const [seriesSlug, file] = parts;
    if (!seriesDocs.has(seriesSlug)) fail(`${section}/${doc.id}：系列資料夾「${seriesSlug}」缺少 series.yaml`);
    const match = file.match(/^(\d+)-/);
    if (!match) fail(`${section}/${doc.id}：章節檔名要以章節數字開頭，例如 01-setup.md`);
    const chapter = Number(match[1]);
    checkSections(section, doc, chapter);

    const list = chaptersBySeries.get(seriesSlug) ?? [];
    if (list.some((c) => c.chapter === chapter)) fail(`${section}/${seriesSlug}：第 ${chapter} 章重複`);
    list.push({ section, doc, slug: doc.id, seriesSlug, chapter });
    chaptersBySeries.set(seriesSlug, list);
  }

  const series: LabSeries[] = [];
  for (const [slug, seriesDoc] of seriesDocs) {
    if (singles.some((s) => s.slug === slug)) fail(`${section}/${slug}：單篇與系列使用了相同的網址`);
    if (seriesDoc.data.draft) continue;
    const chapters = (chaptersBySeries.get(slug) ?? [])
      .filter((c) => !c.doc.data.draft)
      .sort((a, b) => a.chapter! - b.chapter!);
    if (chapters.length > 0) series.push({ section, slug, data: seriesDoc.data, chapters });
  }

  const published = singles.filter((s) => !s.doc.data.draft);
  const items: LabItem[] = [
    ...published.map((entry) => ({ kind: 'single' as const, entry })),
    ...series.map((s) => ({ kind: 'series' as const, series: s })),
  ].sort((a, b) => itemDate(b).getTime() - itemDate(a).getTime());

  return { singles: published, series, items };
}

export type LabPage =
  | { kind: 'entry'; entry: LabEntry; series?: LabSeries }
  | { kind: 'series'; series: LabSeries };

/** 單元內所有要產生的頁面：單篇、系列總覽、系列章節 */
export async function getLabPaths(section: LabSectionKey) {
  const { singles, series } = await getLabContent(section);
  const pages: { params: { slug: string }; props: { page: LabPage } }[] = [
    ...singles.map((entry) => ({ params: { slug: entry.slug }, props: { page: { kind: 'entry' as const, entry } } })),
  ];
  for (const s of series) {
    pages.push({ params: { slug: s.slug }, props: { page: { kind: 'series', series: s } } });
    for (const entry of s.chapters) {
      pages.push({ params: { slug: entry.slug }, props: { page: { kind: 'entry', entry, series: s } } });
    }
  }
  return pages;
}
