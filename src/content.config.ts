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

/** 技術筆記與 Ubuntu 套件功能共用的實作文章欄位 */
const labSchema = z.object({
  /** 繁體中文標題 */
  title: z.string(),
  /** 本站發表日期 */
  pubDate: z.coerce.date(),
  /** （選填）最後更新日期 */
  updatedDate: z.coerce.date().optional(),
  /** 2-3 句摘要，顯示在列表卡片與頁首 */
  summary: z.string(),
  /** 分類標籤 */
  tags: z.array(z.string()).min(1),
  /** （選填）實作環境，例如 Ubuntu 24.04 LTS、LXD 6.10 */
  environment: z.array(z.string()).default([]),
  /** （選填）參考的官方文件 */
  references: z.array(z.object({ title: z.string(), url: z.url() })).default([]),
  /** （選填）草稿不會被建置 */
  draft: z.boolean().default(false),
  /** （選填）上鎖：列表與目錄只顯示標題與小鎖，文章頁只顯示「編輯中」，內文不會輸出到網站 */
  locked: z.boolean().default(false),
});

/** 技術筆記：議題 → Ubuntu 的解法 → 實作 */
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: labSchema,
});

/** Ubuntu 套件功能：產品介紹 → 技術文件導讀與實作 */
const packages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/packages' }),
  schema: labSchema.extend({
    /** 介紹的 Canonical 套件或產品名稱，例如 LXD、MicroCloud */
    product: z.string(),
    /** 技術文件導讀必須附上至少一份官方文件 */
    references: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
  }),
});

/** 連續章節的系列資訊：放在系列資料夾的 series.yaml */
const series = defineCollection({
  loader: glob({ pattern: '{notes,packages}/*/series.yaml', base: './src/content' }),
  schema: z.object({
    /** 系列標題 */
    title: z.string(),
    /** 系列簡介 */
    summary: z.string(),
    /** 連載中或已完結 */
    status: z.enum(['ongoing', 'completed']).default('ongoing'),
    /** （選填）草稿系列不會被建置 */
    draft: z.boolean().default(false),
  }),
});

export const collections = { articles, notes, packages, series };
