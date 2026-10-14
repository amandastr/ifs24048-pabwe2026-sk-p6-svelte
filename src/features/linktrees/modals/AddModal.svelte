<script>
  import { createEventDispatcher } from "svelte";
  import { Plus, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";
  import MarkdownEditor from "../components/MarkdownEditor.svelte";

  export let show = false;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let title = "";
  let type = "public";
  let description = "";

  function handleClose() {
    dispatch("close");
    if (onClose) onClose();
  }

  $: {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }

  $: if ($linkTreesStore.isLinkTreeAdd) {
    loading = false;
    linkTreesStore.setIsLinkTreeAdd(false);
    if ($linkTreesStore.isLinkTreeAdded) {
      linkTreesStore.setIsLinkTreeAdded(false);
      linkTreesStore.asyncSetLinkTrees();
      title = "";
      type = "public";
      description = "";
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tidak boleh kosong");
      return;
    }

    if (!description.trim()) {
      showErrorDialog("Deskripsi tidak boleh kosong");
      return;
    }

    loading = true;
    linkTreesStore.asyncSetIsLinkTreeAdd(title.trim(), type, description.trim());
  }
</script>

{#if show}
  <div
    data-testid="add-linktree-modal"
    class="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200 overflow-hidden"
  >
    <!-- Modal Header -->
    <div
      class="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 shrink-0"
    >
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center"
        >
          <Plus size={18} strokeWidth={2.5} />
        </div>
        <div>
          <h3 class="text-base font-bold text-slate-800">Tambah Link Tree Baru</h3>
          <p class="text-xs text-slate-500">
            Buat kumpulan tautan baru dan jelaskan dengan format Markdown
          </p>
        </div>
      </div>
      <button
        type="button"
        data-testid="close-add-modal-btn"
        on:click={handleClose}
        class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
      >
        <X size={20} />
      </button>
    </div>

    <!-- Modal Form Body -->
    <form
      on:submit|preventDefault={handleSave}
      class="flex-1 flex flex-col min-h-0 bg-white"
    >
      <div class="flex-1 flex flex-col min-h-0 p-6 md:p-8 space-y-4 w-full">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
          <div class="md:col-span-2">
            <label
              for="add-linktree-title-input"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Judul Link Tree <span class="text-red-500">*</span>
            </label>
            <input
              id="add-linktree-title-input"
              type="text"
              data-testid="add-linktree-title-input"
              bind:value={title}
              placeholder="Contoh: Tautan Praktikum PABWE"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
              required
            />
          </div>

          <div>
            <label
              for="add-linktree-type-select"
              class="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Tipe
            </label>
            <select
              id="add-linktree-type-select"
              data-testid="add-linktree-type-select"
              bind:value={type}
              class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
            >
              <option value="public">Public</option>
              <option value="unlisted">Unlisted</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div class="flex-1 flex flex-col min-h-0">
          <span
            class="block text-sm font-semibold text-slate-700 mb-1.5 shrink-0"
          >
            Deskripsi (Markdown) <span class="text-red-500">*</span>
          </span>
          <div class="flex-1 min-h-[300px]">
            <MarkdownEditor
              bind:value={description}
              placeholder="Tuliskan deskripsi kumpulan tautan dalam format Markdown..."
              height="100%"
              textareaTestId="add-linktree-description-input"
            />
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50/80 shrink-0"
      >
        <button
          type="button"
          data-testid="cancel-add-modal-btn"
          on:click={handleClose}
          disabled={loading}
          class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          type="submit"
          data-testid="submit-add-modal-btn"
          disabled={loading}
          class="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
        >
          {#if loading}
            <LoaderCircle size={18} class="animate-spin" />
            <span>Menyimpan...</span>
          {:else}
            <Plus size={18} strokeWidth={2.5} />
            <span>Tambah Link Tree</span>
          {/if}
        </button>
      </div>
    </form>
  </div>
{/if}
