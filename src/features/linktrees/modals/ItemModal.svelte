<script>
  import { createEventDispatcher } from "svelte";
  import { Link2, X, LoaderCircle } from "lucide-svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { showErrorDialog } from "../../../helpers/toolsHelper";

  export let show = false;
  export let linkTreeId = null;
  export let item = null;
  export let onClose = undefined;

  const dispatch = createEventDispatcher();

  let loading = false;
  let title = "";
  let url = "";

  $: isEdit = !!item;

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

  $: if (show) {
    title = item?.title || "";
    url = item?.url || "";
  }

  $: if ($linkTreesStore.isItemAdd) {
    loading = false;
    linkTreesStore.setIsItemAdd(false);
    if ($linkTreesStore.isItemAdded) {
      linkTreesStore.setIsItemAdded(false);
      linkTreesStore.asyncSetLinkTree(linkTreeId);
      handleClose();
    }
  }

  $: if ($linkTreesStore.isItemChange) {
    loading = false;
    linkTreesStore.setIsItemChange(false);
    if ($linkTreesStore.isItemChanged) {
      linkTreesStore.setIsItemChanged(false);
      linkTreesStore.asyncSetLinkTree(linkTreeId);
      handleClose();
    }
  }

  function handleSave() {
    if (!title.trim()) {
      showErrorDialog("Judul tautan tidak boleh kosong");
      return;
    }

    if (!url.trim()) {
      showErrorDialog("URL tautan tidak boleh kosong");
      return;
    }

    loading = true;
    if (isEdit) {
      linkTreesStore.asyncSetIsItemChange(linkTreeId, item.id, title.trim(), url.trim());
    } else {
      linkTreesStore.asyncSetIsItemAdd(linkTreeId, title.trim(), url.trim());
    }
  }
</script>

{#if show}
  <div
    data-testid="item-modal"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
  >
    <div class="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <Link2 size={18} strokeWidth={2.5} />
          </div>
          <h3 class="text-base font-bold text-slate-800">
            {isEdit ? "Ubah Item Tautan" : "Tambah Item Tautan"}
          </h3>
        </div>
        <button
          type="button"
          data-testid="close-item-modal-btn"
          on:click={handleClose}
          class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="p-6 space-y-4">
        <div>
          <label for="item-title-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            Judul Tautan <span class="text-red-500">*</span>
          </label>
          <input
            id="item-title-input"
            type="text"
            data-testid="item-title-input"
            bind:value={title}
            placeholder="Contoh: Repositori GitHub"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
          />
        </div>

        <div>
          <label for="item-url-input" class="block text-sm font-semibold text-slate-700 mb-1.5">
            URL <span class="text-red-500">*</span>
          </label>
          <input
            id="item-url-input"
            type="url"
            data-testid="item-url-input"
            bind:value={url}
            placeholder="https://contoh.com"
            class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-sm shadow-xs"
          />
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            data-testid="cancel-item-modal-btn"
            on:click={handleClose}
            disabled={loading}
            class="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            data-testid="submit-item-modal-btn"
            disabled={loading}
            class="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-600/25 transition-all disabled:opacity-60"
          >
            {#if loading}
              <LoaderCircle size={18} class="animate-spin" />
              <span>Menyimpan...</span>
            {:else}
              <span>{isEdit ? "Perbarui Tautan" : "Simpan Tautan"}</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
