<script>
  import { onMount } from "svelte";
  import { navigate } from "../../../router.js";
  import ChangeCoverModal from "../modals/ChangeCoverModal.svelte";
  import ChangeModal from "../modals/ChangeModal.svelte";
  import ItemModal from "../modals/ItemModal.svelte";
  import MarkdownViewer from "../components/MarkdownViewer.svelte";
  import { linkTreesStore } from "../states/linkTreesStore";
  import { usersStore } from "../../users/states/usersStore";
  import { formatDate, showConfirmDialog } from "../../../helpers/toolsHelper";
  import {
    ArrowLeft,
    ImagePlus,
    PenLine,
    Trash2,
    Calendar,
    Plus,
    Pencil,
    ExternalLink,
    Link2,
  } from "lucide-svelte";

  export let linkTreeId;

  $: profile = $usersStore.profile;
  $: linkTree = $linkTreesStore.linkTree;
  $: items = linkTree?.items || [];

  let showCoverModal = false;
  let showEditModal = false;
  let showItemModal = false;
  let selectedItem = null;

  onMount(() => {
    if (linkTreeId) {
      linkTreesStore.asyncSetLinkTree(linkTreeId);
    }
  });

  let prevId = linkTreeId;
  $: if (linkTreeId !== prevId) {
    prevId = linkTreeId;
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  $: if ($linkTreesStore.isLinkTree) {
    linkTreesStore.setIsLinkTree(false);
    if (!linkTree) {
      navigate("/");
    }
  }

  $: if ($linkTreesStore.isLinkTreeDeleted) {
    linkTreesStore.setIsLinkTreeDeleted(false);
    navigate("/");
  }

  $: if ($linkTreesStore.isItemDeleted) {
    linkTreesStore.setIsItemDeleted(false);
    linkTreesStore.asyncSetLinkTree(linkTreeId);
  }

  async function handleDelete() {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus link tree ini?");
    if (result.isConfirmed && linkTree) {
      linkTreesStore.asyncSetIsLinkTreeDelete(linkTree.id);
    }
  }

  function handleAddItem() {
    selectedItem = null;
    showItemModal = true;
  }

  function handleEditItem(item) {
    selectedItem = item;
    showItemModal = true;
  }

  async function handleDeleteItem(item) {
    const result = await showConfirmDialog("Apakah Anda yakin ingin menghapus item tautan ini?");
    if (result.isConfirmed) {
      linkTreesStore.asyncSetIsItemDelete(linkTree.id, item.id);
    }
  }
</script>

{#if !profile || !linkTree}
  <div class="flex flex-col items-center justify-center py-20">
    <div class="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
{:else}
  <div class="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-300">
    <!-- Back button & Action buttons -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <a
        href="/"
        data-testid="back-to-linktrees-link"
        on:click|preventDefault={() => navigate("/")}
        class="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Kembali ke Link Tree
      </a>

      <div class="flex items-center gap-2">
        <button
          type="button"
          data-testid="edit-cover-btn"
          on:click={() => (showCoverModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/60 transition-colors"
        >
          <ImagePlus size={16} />
          Ubah Sampul
        </button>
        <button
          type="button"
          data-testid="edit-detail-linktree-btn"
          on:click={() => (showEditModal = true)}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200/60 transition-colors"
        >
          <PenLine size={16} />
          Ubah Data
        </button>
        <button
          type="button"
          data-testid="delete-detail-linktree-btn"
          on:click={handleDelete}
          class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/60 transition-colors"
        >
          <Trash2 size={16} />
          Hapus
        </button>
      </div>
    </div>

    <!-- Main Detail Card -->
    <div class="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {#if linkTree.cover}
        <div class="relative w-full h-64 sm:h-80 bg-slate-900 overflow-hidden">
          <img src={linkTree.cover} alt={linkTree.title} class="w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent"></div>
        </div>
      {/if}

      <div class="p-6 sm:p-8 space-y-6">
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <span class="font-mono text-xs font-bold text-slate-400">{"#" + linkTree.id}</span>
            <span
              data-testid="detail-linktree-type"
              class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 capitalize"
            >
              {linkTree.type}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {linkTree.title}
          </h1>

          <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0" />
              <span>Dibuat: <strong class="text-slate-500">{formatDate(linkTree.created_at)}</strong></span>
            </div>
            <div class="flex items-center gap-1.5">
              <Calendar size={14} class="shrink-0" />
              <span>Diperbarui: <strong class="text-slate-500">{formatDate(linkTree.updated_at)}</strong></span>
            </div>
          </div>
        </div>

        <div
          data-testid="linktree-detail-description"
          class="prose max-w-none text-slate-600 bg-slate-50/60 p-6 rounded-2xl border border-slate-100 leading-relaxed"
        >
          {#if linkTree.description}
            <MarkdownViewer content={linkTree.description} />
          {:else}
            <p class="italic text-slate-400">Tidak ada deskripsi untuk link tree ini.</p>
          {/if}
        </div>

        <!-- Items -->
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-bold text-slate-800">{"Daftar Tautan (" + items.length + ")"}</h2>
            <button
              type="button"
              data-testid="add-item-btn"
              on:click={handleAddItem}
              class="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-colors"
            >
              <Plus size={16} strokeWidth={2.5} />
              Tambah Tautan
            </button>
          </div>

          {#if items.length === 0}
            <div data-testid="items-empty" class="text-center py-10 rounded-2xl border border-dashed border-slate-200 text-slate-400">
              <Link2 size={32} class="mx-auto text-slate-300 mb-2" />
              <p class="text-sm font-medium">Belum ada tautan pada link tree ini.</p>
            </div>
          {:else}
            <ul class="space-y-2">
              {#each items as item (item.id)}
                <li
                  data-testid={`item-row-${item.id}`}
                  class="flex items-center justify-between gap-3 p-4 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50/70 transition-colors"
                >
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-testid={`item-link-${item.id}`}
                    class="min-w-0 flex-1 group"
                  >
                    <p class="font-semibold text-slate-800 group-hover:text-indigo-600 inline-flex items-center gap-1.5">
                      {item.title}
                      <ExternalLink size={14} class="text-slate-400" />
                    </p>
                    <p class="text-xs text-slate-400 truncate">{item.url}</p>
                  </a>
                  <div class="inline-flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      data-testid={`edit-item-${item.id}`}
                      on:click={() => handleEditItem(item)}
                      class="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Ubah Tautan"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      type="button"
                      data-testid={`delete-item-${item.id}`}
                      on:click={() => handleDeleteItem(item)}
                      class="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Hapus Tautan"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>
    </div>

    <!-- Cover Modal -->
    <ChangeCoverModal
      show={showCoverModal}
      {linkTree}
      onClose={() => (showCoverModal = false)}
      on:close={() => (showCoverModal = false)}
    />

    <!-- Edit Modal -->
    <ChangeModal
      show={showEditModal}
      linkTreeId={linkTree.id}
      onClose={() => (showEditModal = false)}
      on:close={() => (showEditModal = false)}
    />

    <!-- Item Modal -->
    <ItemModal
      show={showItemModal}
      linkTreeId={linkTree.id}
      item={selectedItem}
      onClose={() => (showItemModal = false)}
      on:close={() => (showItemModal = false)}
    />
  </div>
{/if}
