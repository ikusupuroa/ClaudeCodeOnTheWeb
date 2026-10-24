/**
 * Sätteri hast 外掛：將文章 Markdown 依 `##` 標題切成 <section>，並依標題文字套用 id 與 class：
 *   - 含「台灣觀點」 → #taiwan-analysis.section-taiwan（台灣觀點點評 Callout）
 *   - 含「原文精華」 → #digest.section-digest（原文精華導讀）
 * 作者只需照常寫 `## 🇹🇼 台灣觀點點評` 與 `## 原文精華導讀`，不必手寫 HTML。
 */

/** @param {string} heading */
function sectionFor(heading) {
  if (heading.includes('台灣觀點')) return { id: 'taiwan-analysis', className: 'section-taiwan' };
  if (heading.includes('原文精華')) return { id: 'digest', className: 'section-digest' };
  return { id: undefined, className: 'section-generic' };
}

/** @type {import('satteri').HastPluginDefinition} */
export default function digestSections() {
  return {
    name: 'digest-sections',
    before(root, ctx) {
      /** @type {any[]} */
      const children = [];
      /** @type {any} */
      let current = null;

      for (const node of root.children) {
        if (node.type === 'element' && node.tagName === 'h2') {
          const { id, className } = sectionFor(ctx.textContent(node));
          current = {
            type: 'element',
            tagName: 'section',
            properties: { id, className: ['digest-section', className] },
            children: [node],
          };
          children.push(current);
        } else if (current) {
          current.children.push(node);
        } else {
          children.push(node);
        }
      }

      ctx.replaceNode(root, { type: 'root', children });
    },
  };
}
