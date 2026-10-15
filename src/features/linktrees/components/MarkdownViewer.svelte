<script>
  import { renderMarkdown } from "../../../helpers/markdownHelper";

  export let content = "";

  $: html = renderMarkdown(content);
</script>

<div class="md-viewer" data-testid="markdown-viewer">{@html html}</div>

<style>
  .md-viewer {
    font-size: 0.95rem;
    line-height: 1.7;
    color: #334155;
    overflow-wrap: anywhere;
  }
  .md-viewer :global(p) {
    margin: 0 0 0.75rem;
  }
  .md-viewer :global(p:last-child) {
    margin-bottom: 0;
  }
  .md-viewer :global(.md-heading) {
    font-weight: 800;
    color: #0f172a;
    margin: 1rem 0 0.5rem;
  }
  .md-viewer :global(.md-h1) {
    font-size: 1.5rem;
  }
  .md-viewer :global(.md-h2) {
    font-size: 1.25rem;
  }
  .md-viewer :global(.md-h3) {
    font-size: 1.1rem;
  }
  .md-viewer :global(ul) {
    list-style: disc;
    padding-left: 1.5rem;
    margin: 0 0 0.75rem;
  }
  .md-viewer :global(ol) {
    list-style: decimal;
    padding-left: 1.5rem;
    margin: 0 0 0.75rem;
  }
  .md-viewer :global(blockquote) {
    border-left: 4px solid #c7d2fe;
    padding: 0.25rem 1rem;
    margin: 0 0 0.75rem;
    color: #475569;
  }
  .md-viewer :global(code) {
    background: #e2e8f0;
    color: #0f172a;
    padding: 0.1rem 0.35rem;
    border-radius: 0.375rem;
    font-size: 0.85em;
  }
  .md-viewer :global(pre) {
    background: #0f172a;
    color: #f8fafc;
    padding: 0.875rem 1rem;
    border-radius: 0.75rem;
    overflow-x: auto;
    margin: 0 0 0.75rem;
  }
  .md-viewer :global(pre code) {
    background: transparent;
    color: inherit;
    padding: 0;
  }
  .md-viewer :global(a) {
    color: #4338ca;
    text-decoration: underline;
  }
  .md-viewer :global(hr) {
    border: 0;
    border-top: 1px solid #cbd5e1;
    margin: 1rem 0;
  }
</style>
