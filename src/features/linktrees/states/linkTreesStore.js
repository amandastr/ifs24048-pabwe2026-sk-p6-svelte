import { writable } from "svelte/store";
import linkTreeApi from "../api/linkTreeApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

function createLinkTreesStore() {
  const initial = {
    linkTrees: [],
    linkTree: null,
    isLinkTree: false,
    isLinkTreeAdd: false,
    isLinkTreeAdded: false,
    isLinkTreeChange: false,
    isLinkTreeChanged: false,
    isLinkTreeChangeCover: false,
    isLinkTreeChangedCover: false,
    isLinkTreeDelete: false,
    isLinkTreeDeleted: false,
    isLinkTreeDeleteAll: false,
    isLinkTreeDeletedAll: false,
    isItemAdd: false,
    isItemAdded: false,
    isItemChange: false,
    isItemChanged: false,
    isItemDelete: false,
    isItemDeleted: false,
  };

  let currentState = { ...initial };
  const innerStore = writable(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get linkTrees() { return currentState.linkTrees; },
    get linkTree() { return currentState.linkTree; },
    get isLinkTree() { return currentState.isLinkTree; },
    get isLinkTreeAdd() { return currentState.isLinkTreeAdd; },
    get isLinkTreeAdded() { return currentState.isLinkTreeAdded; },
    get isLinkTreeChange() { return currentState.isLinkTreeChange; },
    get isLinkTreeChanged() { return currentState.isLinkTreeChanged; },
    get isLinkTreeChangeCover() { return currentState.isLinkTreeChangeCover; },
    get isLinkTreeChangedCover() { return currentState.isLinkTreeChangedCover; },
    get isLinkTreeDelete() { return currentState.isLinkTreeDelete; },
    get isLinkTreeDeleted() { return currentState.isLinkTreeDeleted; },
    get isLinkTreeDeleteAll() { return currentState.isLinkTreeDeleteAll; },
    get isLinkTreeDeletedAll() { return currentState.isLinkTreeDeletedAll; },
    get isItemAdd() { return currentState.isItemAdd; },
    get isItemAdded() { return currentState.isItemAdded; },
    get isItemChange() { return currentState.isItemChange; },
    get isItemChanged() { return currentState.isItemChanged; },
    get isItemDelete() { return currentState.isItemDelete; },
    get isItemDeleted() { return currentState.isItemDeleted; },
    get $state() { return currentState; },
    reset(state = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setLinkTrees(linkTrees) {
      innerStore.update((s) => ({ ...s, linkTrees }));
    },
    setLinkTree(linkTree) {
      innerStore.update((s) => ({ ...s, linkTree }));
    },
    setIsLinkTree(status) {
      innerStore.update((s) => ({ ...s, isLinkTree: status }));
    },
    setIsLinkTreeAdd(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeAdd: status }));
    },
    setIsLinkTreeAdded(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeAdded: status }));
    },
    setIsLinkTreeChange(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeChange: status }));
    },
    setIsLinkTreeChanged(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeChanged: status }));
    },
    setIsLinkTreeChangeCover(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeChangeCover: status }));
    },
    setIsLinkTreeChangedCover(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeChangedCover: status }));
    },
    setIsLinkTreeDelete(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeDelete: status }));
    },
    setIsLinkTreeDeleted(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeDeleted: status }));
    },
    setIsLinkTreeDeleteAll(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeDeleteAll: status }));
    },
    setIsLinkTreeDeletedAll(status) {
      innerStore.update((s) => ({ ...s, isLinkTreeDeletedAll: status }));
    },
    setIsItemAdd(status) {
      innerStore.update((s) => ({ ...s, isItemAdd: status }));
    },
    setIsItemAdded(status) {
      innerStore.update((s) => ({ ...s, isItemAdded: status }));
    },
    setIsItemChange(status) {
      innerStore.update((s) => ({ ...s, isItemChange: status }));
    },
    setIsItemChanged(status) {
      innerStore.update((s) => ({ ...s, isItemChanged: status }));
    },
    setIsItemDelete(status) {
      innerStore.update((s) => ({ ...s, isItemDelete: status }));
    },
    setIsItemDeleted(status) {
      innerStore.update((s) => ({ ...s, isItemDeleted: status }));
    },
    async asyncSetLinkTrees(isMe = "") {
      try {
        const linkTrees = await linkTreeApi.getLinkTrees(isMe);
        this.setLinkTrees(linkTrees);
      } catch {
        this.setLinkTrees([]);
      }
    },
    async asyncSetLinkTree(linkTreeId) {
      try {
        const linkTree = await linkTreeApi.getLinkTreeById(linkTreeId);
        this.setLinkTree(linkTree);
      } catch {
        this.setLinkTree(null);
      } finally {
        this.setIsLinkTree(true);
      }
    },
    async asyncSetIsLinkTreeAdd(title, type, description) {
      try {
        const message = await linkTreeApi.postLinkTree(title, type, description);
        showSuccessDialog(message || "Link tree berhasil ditambahkan!");
        this.setIsLinkTreeAdded(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeAdded(false);
      } finally {
        this.setIsLinkTreeAdd(true);
      }
    },
    async asyncSetIsLinkTreeChange(linkTreeId, title, type, description) {
      try {
        const message = await linkTreeApi.putLinkTree(linkTreeId, title, type, description);
        showSuccessDialog(message || "Link tree berhasil diperbarui!");
        this.setIsLinkTreeChanged(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeChanged(false);
      } finally {
        this.setIsLinkTreeChange(true);
      }
    },
    async asyncSetIsLinkTreeChangeCover(linkTreeId, cover) {
      try {
        const message = await linkTreeApi.postLinkTreeCover(linkTreeId, cover);
        showSuccessDialog(message || "Cover berhasil diperbarui!");
        this.setIsLinkTreeChangedCover(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeChangedCover(false);
      } finally {
        this.setIsLinkTreeChangeCover(true);
      }
    },
    async asyncSetIsLinkTreeDelete(linkTreeId) {
      try {
        const message = await linkTreeApi.deleteLinkTree(linkTreeId);
        showSuccessDialog(message || "Link tree berhasil dihapus!");
        this.setIsLinkTreeDeleted(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeDeleted(false);
      } finally {
        this.setIsLinkTreeDelete(true);
      }
    },
    async asyncSetIsLinkTreeDeleteAll() {
      try {
        const message = await linkTreeApi.deleteAllLinkTrees();
        showSuccessDialog(message || "Semua link tree berhasil dihapus!");
        this.setIsLinkTreeDeletedAll(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsLinkTreeDeletedAll(false);
      } finally {
        this.setIsLinkTreeDeleteAll(true);
      }
    },
    async asyncSetIsItemAdd(linkTreeId, title, url) {
      try {
        const message = await linkTreeApi.postItem(linkTreeId, title, url);
        showSuccessDialog(message || "Item tautan berhasil ditambahkan!");
        this.setIsItemAdded(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsItemAdded(false);
      } finally {
        this.setIsItemAdd(true);
      }
    },
    async asyncSetIsItemChange(linkTreeId, itemId, title, url) {
      try {
        const message = await linkTreeApi.putItem(linkTreeId, itemId, title, url);
        showSuccessDialog(message || "Item tautan berhasil diperbarui!");
        this.setIsItemChanged(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsItemChanged(false);
      } finally {
        this.setIsItemChange(true);
      }
    },
    async asyncSetIsItemDelete(linkTreeId, itemId) {
      try {
        const message = await linkTreeApi.deleteItem(linkTreeId, itemId);
        showSuccessDialog(message || "Item tautan berhasil dihapus!");
        this.setIsItemDeleted(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsItemDeleted(false);
      } finally {
        this.setIsItemDelete(true);
      }
    },
  };
}

export const linkTreesStore = createLinkTreesStore();
export const useLinkTreesStore = () => linkTreesStore;
export default linkTreesStore;
