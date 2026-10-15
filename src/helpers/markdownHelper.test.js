import { describe, it, expect } from "vitest";
import { escapeHtml, renderInline, renderMarkdown } from "./markdownHelper";

describe("markdownHelper", () => {
  describe("escapeHtml", () => {
    it("should escape html special characters", () => {
      expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
        "&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;"
      );
    });
  });

  describe("renderInline", () => {
    it("should render bold, italic and inline code", () => {
      expect(renderInline("**tebal** __tebal2__ *miring* _miring2_ `kode`")).toBe(
        "<strong>tebal</strong> <strong>tebal2</strong> <em>miring</em> <em>miring2</em> <code>kode</code>"
      );
    });

    it("should not apply emphasis inside inline code or inside words", () => {
      expect(renderInline("`a*b*c` snake_case_name")).toBe("<code>a*b*c</code> snake_case_name");
    });

    it("should render safe links and keep underscores in their url", () => {
      expect(renderInline("[Repo](https://github.com/a_b_c) [Mail](mailto:a@b.co)")).toBe(
        '<a href="https://github.com/a_b_c" target="_blank" rel="noopener noreferrer">Repo</a> ' +
          '<a href="mailto:a@b.co" target="_blank" rel="noopener noreferrer">Mail</a>'
      );
    });

    it("should not render unsafe link protocols", () => {
      const html = renderInline("[klik](javascript:alert(1))");
      expect(html).not.toContain("<a");
      expect(html).toContain("[klik](javascript:alert(1))");
    });

    it("should escape html and strip null characters", () => {
      expect(renderInline("<b>x</b>\u0000")).toBe("&lt;b&gt;x&lt;/b&gt;");
    });
  });

  describe("renderMarkdown", () => {
    it("should return an empty string for empty input", () => {
      expect(renderMarkdown("")).toBe("");
      expect(renderMarkdown(null)).toBe("");
      expect(renderMarkdown(undefined)).toBe("");
    });

    it("should render headings as styled paragraphs", () => {
      expect(renderMarkdown("# Satu\n###### Enam")).toBe(
        '<p class="md-heading md-h1">Satu</p><p class="md-heading md-h6">Enam</p>'
      );
    });

    it("should render paragraphs with line breaks and skip blank lines", () => {
      expect(renderMarkdown("baris 1\nbaris 2\n\n\nparagraf 2")).toBe(
        "<p>baris 1<br>baris 2</p><p>paragraf 2</p>"
      );
    });

    it("should normalize windows line endings", () => {
      expect(renderMarkdown("a\r\nb\rc")).toBe("<p>a<br>b<br>c</p>");
    });

    it("should render unordered and ordered lists", () => {
      expect(renderMarkdown("- a\n* b\n+ c")).toBe("<ul><li>a</li><li>b</li><li>c</li></ul>");
      expect(renderMarkdown("1. satu\n2. dua")).toBe("<ol><li>satu</li><li>dua</li></ol>");
    });

    it("should render blockquotes and horizontal rules", () => {
      expect(renderMarkdown("> kutipan\n> lanjut\n---\n***")).toBe(
        "<blockquote>kutipan<br>lanjut</blockquote><hr><hr>"
      );
    });

    it("should render fenced code blocks with escaped content", () => {
      expect(renderMarkdown("```js\n<div>&</div>\n```\nsetelah")).toBe(
        "<pre><code>&lt;div&gt;&amp;&lt;/div&gt;</code></pre><p>setelah</p>"
      );
    });

    it("should handle an unclosed code fence", () => {
      expect(renderMarkdown("```\nkode")).toBe("<pre><code>kode</code></pre>");
    });

    it("should stop a paragraph when another block starts", () => {
      expect(renderMarkdown("teks\n# Judul\n- item")).toBe(
        '<p>teks</p><p class="md-heading md-h1">Judul</p><ul><li>item</li></ul>'
      );
    });
  });
});
