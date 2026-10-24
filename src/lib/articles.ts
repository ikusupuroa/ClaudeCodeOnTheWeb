import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'articles'>;

/** 取得所有非草稿文章，依發表日期由新到舊排序 */
export async function getArticles(): Promise<Article[]> {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  return articles.sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

/** 統計各標籤文章數，依數量排序 */
export function countTags(articles: Article[]): [string, number][] {
  const counts = new Map<string, number>();
  for (const article of articles) {
    for (const tag of article.data.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}
