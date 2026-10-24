/**
 * 由 .github/workflows/monitor-feeds.yml 透過 actions/github-script 呼叫。
 * 讀取 fetch-sources.mjs 的 JSON 輸出，把「還沒在任何 new-articles Issue 列過」的文章
 * 開成一個新 Issue，並 @ repo 擁有者觸發 GitHub 通知（手機推播／Email）。
 */
const fs = require('node:fs');

const LABEL = 'new-articles';

function formatTaipei(iso) {
  if (!iso) return '（無日期）';
  return new Date(iso).toLocaleString('zh-TW', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

module.exports = async ({ github, context, core, reportPath }) => {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const { owner, repo } = context.repo;

  for (const { feed, error } of report.errors) {
    core.warning(`無法抓取 ${feed}：${error}`);
  }

  // 已經在任何 new-articles Issue（不論開關）列過的網址，不再重複通知
  const issues = await github.paginate(github.rest.issues.listForRepo, {
    owner,
    repo,
    labels: LABEL,
    state: 'all',
    per_page: 100,
  });
  const announced = issues.map((issue) => issue.body ?? '').join('\n');
  const fresh = report.newItems.filter((item) => !announced.includes(item.url));

  core.info(`未處理 ${report.newItems.length} 篇，其中尚未通知 ${fresh.length} 篇`);
  if (fresh.length === 0) return;

  try {
    await github.rest.issues.getLabel({ owner, repo, name: LABEL });
  } catch {
    await github.rest.issues.createLabel({
      owner,
      repo,
      name: LABEL,
      color: 'E95420',
      description: '官方 Blog 偵測到的新文章，待選題',
    });
  }

  const items = fresh.map((item, i) =>
    [
      `### ${i + 1}. ${item.title}`,
      '',
      `- 來源：${item.source}${item.author ? `（${item.author}）` : ''}`,
      `- 發布：${formatTaipei(item.pubDate)}（台北時間）`,
      `- 原文：${item.url}`,
      '',
      `> ${(item.summary || '（無摘要）').replace(/\s+/g, ' ')}`,
    ].join('\n'),
  );

  const warnings = report.errors.length
    ? ['', '> [!WARNING]', ...report.errors.map(({ feed, error }) => `> 無法抓取 ${feed}：${error}`)]
    : [];

  const body = [
    `@${owner} 官方 Blog 有 ${fresh.length} 篇尚未處理的新文章：`,
    '',
    items.join('\n\n'),
    ...warnings,
    '',
    '---',
    '',
    `要寫哪幾篇，回到 Claude Code 對話告訴我，例如「Issue #編號 的第 1、3 篇要寫，其他略過」。`,
  ].join('\n');

  const today = formatTaipei(report.checkedAt).slice(0, 10);
  const { data: issue } = await github.rest.issues.create({
    owner,
    repo,
    title: `📰 ${fresh.length} 篇新文章待選題（${today}）`,
    body,
    labels: [LABEL],
  });
  core.notice(`已建立 Issue #${issue.number}：${issue.html_url}`);
};
