<script>
  import { onMount, onDestroy } from "svelte";

  export let content = "";

  let viewerContainer;
  let viewerInstance;
  let destroyed = false;

  onMount(async () => {
    try {
      // Dimuat secara lazy agar bundle awal tetap ringan
      const [{ default: Viewer }] = await Promise.all([
        import("@toast-ui/editor/dist/toastui-editor-viewer"),
        import("@toast-ui/editor/dist/toastui-editor-viewer.css"),
      ]);
      if (destroyed) return;

      viewerInstance = new Viewer({
        el: viewerContainer,
        initialValue: content || "",
      });
    } catch {
      viewerInstance = null;
    }
  });

  $: if (viewerInstance && content !== undefined) {
    viewerInstance.setMarkdown(content || "");
  }

  onDestroy(() => {
    destroyed = true;
    if (viewerInstance) {
      viewerInstance.destroy();
      viewerInstance = null;
    }
  });
</script>

<div bind:this={viewerContainer} class="toastui-editor-viewer-wrapper" data-testid="markdown-viewer"></div>

<style>
  :global(.toastui-editor-viewer-wrapper .toastui-editor-contents) {
    font-family: inherit;
    font-size: 0.95rem;
    color: #475569;
  }
</style>
