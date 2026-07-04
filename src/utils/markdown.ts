/**
 * Lightweight, dependency-free markdown → HTML renderer.
 * All raw input is HTML-escaped first, so author content cannot inject
 * script tags. Supports: headings, bold, italic, links, images, ordered
 * and unordered lists, blockquotes, inline code, code blocks, and hr.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeUrl(url: string): string {
  const trimmed = url.trim();
  if (/^(https?:\/\/|\/|#|mailto:|tel:|data:image\/)/i.test(trimmed)) return trimmed;
  return '#';
}

function renderInline(text: string): string {
  let out = text;
  // Images: ![alt](url)
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (_m, alt, url) => {
    return `<img src="${sanitizeUrl(url)}" alt="${alt}" class="rounded-xl my-4 max-w-full" />`;
  });
  // Links: [text](url)
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label, url) => {
    return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  });
  // Bold, italic, inline code
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  return out;
}

export function renderMarkdown(markdown: string): string {
  const escaped = escapeHtml(markdown.replace(/\r\n/g, '\n'));
  const lines = escaped.split('\n');
  const html: string[] = [];

  let inUl = false;
  let inOl = false;
  let inCode = false;
  let paragraph: string[] = [];

  const closeLists = () => {
    if (inUl) { html.push('</ul>'); inUl = false; }
    if (inOl) { html.push('</ol>'); inOl = false; }
  };

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };

  for (const line of lines) {
    // Code block fences
    if (/^```/.test(line.trim())) {
      flushParagraph();
      closeLists();
      if (inCode) { html.push('</code></pre>'); inCode = false; }
      else { html.push('<pre><code>'); inCode = true; }
      continue;
    }
    if (inCode) { html.push(line); continue; }

    const trimmed = line.trim();

    if (trimmed === '') { flushParagraph(); closeLists(); continue; }

    // Horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph(); closeLists();
      html.push('<hr />');
      continue;
    }

    // Headings
    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      flushParagraph(); closeLists();
      const level = heading[1].length + 1; // # → h2 (h1 reserved for page title)
      html.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      continue;
    }

    // Blockquote
    const quote = trimmed.match(/^&gt;\s?(.*)$/);
    if (quote) {
      flushParagraph(); closeLists();
      html.push(`<blockquote>${renderInline(quote[1])}</blockquote>`);
      continue;
    }

    // Unordered list
    const ul = trimmed.match(/^[-*]\s+(.*)$/);
    if (ul) {
      flushParagraph();
      if (inOl) { html.push('</ol>'); inOl = false; }
      if (!inUl) { html.push('<ul>'); inUl = true; }
      html.push(`<li>${renderInline(ul[1])}</li>`);
      continue;
    }

    // Ordered list
    const ol = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (ol) {
      flushParagraph();
      if (inUl) { html.push('</ul>'); inUl = false; }
      if (!inOl) { html.push('<ol>'); inOl = true; }
      html.push(`<li>${renderInline(ol[1])}</li>`);
      continue;
    }

    paragraph.push(trimmed);
  }

  flushParagraph();
  closeLists();
  if (inCode) html.push('</code></pre>');

  return html.join('\n');
}

/**
 * Detects legacy HTML blog content (written before the markdown editor)
 * so it can still be rendered as-is.
 */
export function isHtmlContent(content: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(content.trim().slice(0, 200));
}
