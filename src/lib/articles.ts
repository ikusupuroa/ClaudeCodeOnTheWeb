import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/** 首頁「最新精華導讀」顯示的篇數 */
export const HOME_ARTICLE_LIMIT = 6;

/** 排序用的時間：原文發布日期，沒有填就用導讀發表日 */
export function sortDate(article: Article): Date {
  return article.data.canonicalPubDate ?? article.data.pubDate;
}

/** 取得所有非草稿文章，依原文發布時間由新到舊排序，同一天再比導讀發表日 */
export async function getArticles(): Promise<Article[]> {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.sort(
    (a, b) =>
      sortDate(b).getTime() - sortDate(a).getTime() ||
      b.data.pubDate.getTime() - a.data.pubDate.getTime() ||
      a.data.title.localeCompare(b.data.title),
  );
}

/** 統計各標籤文章數，依數量排序 */
export function countTags(articles: Article[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
