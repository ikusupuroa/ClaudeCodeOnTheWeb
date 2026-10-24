export const SITE = {
  name: 'Canonical Taiwan Tech Hub',
  nameZh: 'Canonical 台灣技術觀點站',
  description:
    '專注追蹤 Canonical & Ubuntu 官方最新技術，為台灣開發者與企業提供繁體精華導讀與在地觀點。',
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
