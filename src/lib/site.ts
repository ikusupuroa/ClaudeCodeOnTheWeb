export const SITE = {
  name: 'ikusupuroa',
  nameZh: 'Ubuntu 技術筆記',
  title: 'ikusupuroa 的 Ubuntu 技術筆記',
  /** 首頁 Hero 的兩段介紹，各自一行 */
  intro: [
    '我是 ikusupuroa，一個 Ubuntu 使用者。',
    '這裡追蹤 Canonical 與 Ubuntu 官方的最新消息，用繁體中文整理重點，也分享我推薦 Ubuntu 的理由。',
  ],
  description:
    '我是 ikusupuroa，一個 Ubuntu 使用者。這裡追蹤 Canonical 與 Ubuntu 官方的最新消息，用繁體中文整理重點，也分享我推薦 Ubuntu 的理由。',
};

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  timeZone: 'Asia/Taipei',
});

export function formatDate(date: Date): string {
  return dateFormatter.format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** 為站內路徑加上部署子路徑（astro.config 的 base），例如 '/about/' → '/ClaudeCodeOnTheWeb/about/' */
export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
  return `${base}/${path.replace(/^\/+/, '')}`;
}
