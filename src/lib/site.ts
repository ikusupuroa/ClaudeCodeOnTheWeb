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

/** 實作單元使用的測試環境，顯示在「關於我」與技術筆記、套件功能頁首 */
export const LAB_ENV: {
  summary: string;
  updated: string;
  specs: { label: string; value: string | string[] }[];
} = {
  summary: 'ASUS VivoBook 筆電・Ubuntu Desktop 26.04 LTS',
  updated: '2026 年 10 月',
  specs: [
    { label: '筆電', value: 'ASUS VivoBook X513EQ（S513EQ）' },
    { label: '作業系統', value: 'Ubuntu Desktop 26.04.1 LTS（kernel 7.0.0-38-generic、GNOME Shell 50.1）' },
    { label: 'CPU', value: 'Intel Core i7-1165G7（第 11 代，8 執行緒）' },
    { label: '記憶體', value: '約 14 GiB（系統顯示的可用總量）' },
    { label: '儲存裝置', value: 'Intel NVMe SSD 512 GB（SSDPEKNW512G8）' },
    {
      label: 'GPU',
      value: ['Intel Iris Xe Graphics（內建顯示）', 'NVIDIA GeForce MX350 2 GB（獨立顯示卡，驅動程式 580.178.04）'],
    },
    { label: '虛擬化', value: 'LXD 6.10（snap，6/stable 頻道），用來建立其他 Ubuntu 版本的測試容器' },
  ],
};
