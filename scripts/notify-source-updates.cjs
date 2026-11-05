/**
 * 由 .github/workflows/monitor-source-updates.yml 透過 actions/github-script 呼叫。
 * 讀取 watch-source-updates.mjs 的 JSON 報告：原文有更新的文章開一個 Issue，
 * 並 @ repo 擁有者觸發 GitHub 通知。同一篇已有未關閉的 Issue 時，只在內容又變了才留言補充。
 */
const fs = require('node:fs');

const LABEL = 'source-updated';
const marker = (slug, hash) => `<!-- source-watch slug=${slug} hash=${hash} -->`;

function diffBlock(item) {
  return [
    '```diff',
    ...item.diff,
    '```',
    ...(item.truncated ? ['', '（差異太長，只列出前段；完整內容請看原文）'] : []),
  ].join('\n');
}

module.exports = async ({ github, context, core, reportPath }) => {
  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const { owner, repo } = context.repo;

  for (const { slug, error } of report.errors) core.warning(`${slug}：${error}`);
  core.info(`監控 ${report.watched} 篇，原文有更新 ${report.updated.length} 篇`);
  if (report.updated.length === 0) return;

  try {
    await github.rest.issues.getLabel({ owner, repo, name: LABEL });
  } catch {
    await github.rest.issues.createLabel({
      owner,
      repo,
      name: LABEL,
      color: '0E8A16',
      description: '已發表文章的原文有更新，待同步',
    });
  }

  const open = await github.paginate(github.rest.issues.listForRepo, {
    owner,
    repo,
    labels: LABEL,
    state: 'open',
    per_page: 100,
  });

  for (const item of report.updated) {
    const slugMarker = `<!-- source-watch slug=${item.slug} `;
    const existing = open.find((issue) => (issue.body ?? '').includes(slugMarker));

    if (existing) {
      const comments = await github.paginate(github.rest.issues.listComments, {
        owner,
        repo,
        issue_number: existing.number,
        per_page: 100,
      });
      const seen = [existing.body ?? '', ...comments.map((c) => c.body ?? '')].some((b) =>
        b.includes(marker(item.slug, item.hash)),
      );
      if (seen) {
        core.info(`${item.slug}：Issue #${existing.number} 已通知過這次的內容`);
        continue;
      }
      await github.rest.issues.createComment({
        owner,
        repo,
        issue_number: existing.number,
        body: [
          marker(item.slug, item.hash),
          `@${owner} 原文又有更新，以下是和本站比對基準的完整差異：`,
          '',
          diffBlock(item),
        ].join('\n'),
      });
      core.notice(`${item.slug}：已在 Issue #${existing.number} 補充新的差異`);
      continue;
    }

    const body = [
      marker(item.slug, item.hash),
      `@${owner} 本站文章〈${item.title}〉的原文有更新：`,
      '',
      `- 原文：[${item.canonicalTitle}](${item.url})`,
      `- 本站文章：\`src/content/articles/${item.slug}.md\``,
      '',
      '### 和本站比對基準的差異',
      '',
      '`-` 是本站撰寫時的原文，`+` 是現在的原文。',
      '',
      diffBlock(item),
      '',
      '---',
      '',
      `要同步的話，回到 Claude Code 對話告訴我，例如「Issue #編號 的更新要同步」；不需要同步也請告訴我，我會更新比對基準並關閉 Issue。`,
    ].join('\n');

    const { data: issue } = await github.rest.issues.create({
      owner,
      repo,
      title: `🔄 原文有更新：${item.title}`,
      body,
      labels: [LABEL],
    });
    core.notice(`${item.slug}：已建立 Issue #${issue.number}：${issue.html_url}`);
  }
};
