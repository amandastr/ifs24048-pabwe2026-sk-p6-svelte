// Renderer Markdown ringan dan aman (semua HTML di-escape lebih dulu).
// Mendukung: heading, bold, italic, inline code, code block, link, list, blockquote, hr.

export function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const SAFE_URL = /^(https?:\/\/|mailto:)/i;
const FENCE = /^\s*```/;
const HEADING = /^(#{1,6})\s+(.*)$/;
const HR = /^\s*(-{3,}|\*{3,})\s*$/;
const QUOTE = /^>\s?/;
const UNORDERED = /^\s*[-*+]\s+/;
const ORDERED = /^\s*\d+\.\s+/;

function isBlockStart(line) {
  return (
    FENCE.test(line) ||
    HEADING.test(line) ||
    HR.test(line) ||
    QUOTE.test(line) ||
    UNORDERED.test(line) ||
    ORDERED.test(line)
  );
}

export function renderInline(raw) {
  const tokens = [];
  const stash = (html) => {
    tokens.push(html);
    return `\u0000${tokens.length - 1}\u0000`;
  };

  const text = escapeHtml(raw.replace(/\u0000/g, ""))
    .replace(/`([^`]+)`/g, (_, code) => stash(`<code>${code}</code>`))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label, url) =>
      SAFE_URL.test(url)
        ? stash(`<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`)
        : match
    )
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/(^|\W)_(.+?)_(?=\W|$)/g, "$1<em>$2</em>");

  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[index]);
}

export function renderMarkdown(markdown) {
  const lines = (markdown || "").replace(/\r\n?/g, "\n").split("\n");
  const html = [];
  let i = 0;

  const takeWhile = (test) => {
    const taken = [];
    while (i < lines.length && test(lines[i])) {
      taken.push(lines[i]);
      i++;
    }
    return taken;
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i++;
    } else if (FENCE.test(line)) {
      i++;
      const code = takeWhile((l) => !FENCE.test(l));
      i++; // lewati penutup ```
      html.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
    } else if (HEADING.test(line)) {
      const [, hashes, title] = line.match(HEADING);
      html.push(`<p class="md-heading md-h${hashes.length}">${renderInline(title)}</p>`);
      i++;
    } else if (HR.test(line)) {
      html.push("<hr>");
      i++;
    } else if (QUOTE.test(line)) {
      const quote = takeWhile((l) => QUOTE.test(l)).map((l) => renderInline(l.replace(QUOTE, "")));
      html.push(`<blockquote>${quote.join("<br>")}</blockquote>`);
    } else if (UNORDERED.test(line)) {
      const items = takeWhile((l) => UNORDERED.test(l)).map(
        (l) => `<li>${renderInline(l.replace(UNORDERED, ""))}</li>`
      );
      html.push(`<ul>${items.join("")}</ul>`);
    } else if (ORDERED.test(line)) {
      const items = takeWhile((l) => ORDERED.test(l)).map(
        (l) => `<li>${renderInline(l.replace(ORDERED, ""))}</li>`
      );
      html.push(`<ol>${items.join("")}</ol>`);
    } else {
      const paragraph = takeWhile((l) => l.trim() && !isBlockStart(l)).map(renderInline);
      html.push(`<p>${paragraph.join("<br>")}</p>`);
    }
  }

  return html.join("");
}
