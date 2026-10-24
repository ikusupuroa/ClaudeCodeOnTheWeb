import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    /** 繁體中文策展文章標題 */
    title: z.string(),
    /** 本站發表日期 */
    pubDate: z.coerce.date(),
    /** Canonical 原文英文標題 */
    canonicalTitle: z.string(),
    /** Canonical 原文連結 */
    canonicalUrl: z.url(),
    /** 原文來源 Feed */
    sourceFeed: z.enum(['Canonical Blog', 'Ubuntu Blog']),
    /** 2-3 句原文核心摘要 */
    summary: z.string(),
    /** ikusupuroa 觀點的核心引言 */
    takeaway: z.string(),
    /** 分類標籤，如 Cloud, Ubuntu, AI, Security, Kubernetes */
    tags: z.array(z.string()).min(1),
    /** （選填）原文作者 */
    canonicalAuthor: z.string().optional(),
    /** （選填）原文發布日期 */
    canonicalPubDate: z.coerce.date().optional(),
    /** （選填）草稿不會被建置 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles };
