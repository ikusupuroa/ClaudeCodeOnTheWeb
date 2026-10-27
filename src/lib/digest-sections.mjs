/**
 * Sätteri hast 外掛：將文章 Markdown 依 `##` 標題切成 <section>，並依標題文字套用 id 與 class：
 *   - 含「ikusupuroa 觀點」 → #my-take.section-take（觀點 Callout）
 *   - 含「原文精華」 → #digest.section-digest（原文精華導讀）
 *   - 含「探討議題」 → #issue.section-take（技術筆記的議題，沿用觀點 Callout）
 *   - 含「產品介紹」 → #product.section-digest（套件功能的產品介紹）
 *   - 含「前情提要」 → #recap.section-recap（系列第 2 章起的前情提要）
 *   - 含「實作筆記」或「技術文件導讀」 → #lab.section-lab（實作步驟與畫面）
 * 另外，單獨成段的圖片會轉成 <figure>，並以圖片的替代文字作為圖說。
 * 作者只需照常寫 Markdown，不必手寫 HTML。
 */

const SECTIONS = [
  { match: 'ikusupuroa 觀點', id: 'my-take', className: 'section-take' },
  { match: '原文精華', id: 'digest', className: 'section-digest' },
  { match: '探討議題', id: 'issue', className: 'section-take' },
  { match: '產品介紹', id: 'product', className: 'section-digest' },
  { match: '前情提要', id: 'recap', className: 'section-recap' },
  { match: '實作筆記', id: 'lab', className: 'section-lab' },
  { match: '技術文件導讀', id: 'lab', className: 'section-lab' },
];

/** @param {string} heading */
function sectionFor(heading) {
  const found = SECTIONS.find((section) => heading.includes(section.match));
  return found ? { id: found.id, className: found.className } : { id: undefined, className: 'section-generic' };
}

/** @param {any} node */
const isBlank = (node) => node.type === 'text' && !node.value.trim();

/**
 * 段落裡只有一張圖片時，改成 <figure>＋<figcaption>；其他節點往下遞迴
 * @param {any} node
 * @returns {any}
 */
function toFigures(node) {
  if (node.type === 'element' && node.tagName === 'p') {
    const content = node.children.filter((c) => !isBlank(c));
    const img = content[0];
    if (content.length === 1 && img.type === 'element' && img.tagName === 'img') {
      const alt = String(img.properties?.alt ?? '').trim();
      return {
        type: 'element',
        tagName: 'figure',
        properties: { className: ['lab-figure'] },
        children: alt
          ? [img, { type: 'element', tagName: 'figcaption', properties: {}, children: [{ type: 'text', value: alt }] }]
          : [img],
      };
    }
  }
  if (!node.children) return node;
  return { ...node, children: node.children.map(toFigures) };
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

      // ctx.textContent 只能讀原始節點，所以先判斷標題，再轉換圖片
      for (const original of root.children) {
        const node = toFigures(original);
        if (original.type === 'element' && original.tagName === 'h2') {
          const { id, className } = sectionFor(ctx.textContent(original));
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
