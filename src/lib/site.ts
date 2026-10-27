export const SITE = {
  name: 'ikusupuroa',
  nameZh: 'Ubuntu 技術筆記',
  title: 'ikusupuroa 的 Ubuntu 技術筆記',
  /** 首頁 Hero 的兩段介紹，各自一行 */
  intro: [
    '我是 ikusupuroa，正在學習 Linux，選擇 Ubuntu 作為學習路線。',
    '這裡是我的學習筆記：整理 Canonical 與 Ubuntu 的官方消息，也記錄自己動手實作的過程。',
  ],
  description:
    '我是 ikusupuroa，正在學習 Linux，選擇 Ubuntu 作為學習路線。這裡是我的學習筆記：整理 Canonical 與 Ubuntu 的官方消息，也記錄自己動手實作的過程。',
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
