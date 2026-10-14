<script>
  import { onMount, onDestroy } from "svelte";
  import Viewer from "@toast-ui/editor/dist/toastui-editor-viewer";
  import "@toast-ui/editor/dist/toastui-editor-viewer.css";

  export let content = "";

  let viewerContainer;
  let viewerInstance;

  onMount(() => {
    try {
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
