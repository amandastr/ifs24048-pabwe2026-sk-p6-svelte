import { describe, it, expect, vi, beforeEach } from "vitest";
import { useLinkTreesStore, linkTreesStore } from "./linkTreesStore";
import linkTreeApi from "../api/linkTreeApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

const FLAGS = [
  "LinkTree",
  "LinkTreeAdd",
  "LinkTreeAdded",
  "LinkTreeChange",
  "LinkTreeChanged",
  "LinkTreeChangeCover",
  "LinkTreeChangedCover",
  "LinkTreeDelete",
  "LinkTreeDeleted",
  "LinkTreeDeleteAll",
  "LinkTreeDeletedAll",
  "ItemAdd",
  "ItemAdded",
  "ItemChange",
  "ItemChanged",
  "ItemDelete",
  "ItemDeleted",
];

describe("linkTreesStore", () => {
  beforeEach(() => {
    linkTreesStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useLinkTreesStore();
    expect(store.linkTrees).toEqual([]);
    expect(store.linkTree).toBeNull();
    FLAGS.forEach((flag) => expect(store[`is${flag}`]).toBe(false));
    expect(store.$state.linkTrees).toEqual([]);
  });

  it("should update state with setters", () => {
    const store = useLinkTreesStore();
    store.setLinkTrees([{ id: 1 }]);
    expect(store.linkTrees).toEqual([{ id: 1 }]);
    store.setLinkTree({ id: 1 });
    expect(store.linkTree).toEqual({ id: 1 });

    FLAGS.forEach((flag) => {
      store[`setIs${flag}`](true);
      expect(store[`is${flag}`]).toBe(true);
    });
  });

  it("should reset with a custom state", () => {
    const store = useLinkTreesStore();
    store.reset({ linkTrees: [{ id: 9 }] });
    expect(store.linkTrees).toEqual([{ id: 9 }]);
    expect(store.isLinkTree).toBe(false);
  });

  describe("asyncSetLinkTrees", () => {
    it("should set link trees on success", async () => {
      const spy = vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([{ id: 1 }]);
      await linkTreesStore.asyncSetLinkTrees("1");
      expect(spy).toHaveBeenCalledWith("1");
      expect(linkTreesStore.linkTrees).toEqual([{ id: 1 }]);
    });

    it("should default filter to empty string", async () => {
      const spy = vi.spyOn(linkTreeApi, "getLinkTrees").mockResolvedValue([]);
      await linkTreesStore.asyncSetLinkTrees();
      expect(spy).toHaveBeenCalledWith("");
    });

    it("should set empty array on error", async () => {
      linkTreesStore.setLinkTrees([{ id: 1 }]);
      vi.spyOn(linkTreeApi, "getLinkTrees").mockRejectedValue(new Error("x"));
      await linkTreesStore.asyncSetLinkTrees();
      expect(linkTreesStore.linkTrees).toEqual([]);
    });
  });

  describe("asyncSetLinkTree", () => {
    it("should set link tree and flag on success", async () => {
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ id: 1 });
      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toEqual({ id: 1 });
      expect(linkTreesStore.isLinkTree).toBe(true);
    });

    it("should set null and flag on error", async () => {
      linkTreesStore.setLinkTree({ id: 1 });
      vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("x"));
      await linkTreesStore.asyncSetLinkTree(1);
      expect(linkTreesStore.linkTree).toBeNull();
      expect(linkTreesStore.isLinkTree).toBe(true);
    });
  });

  // [nama aksi, nama api, argumen, flag proses, flag selesai, pesan default]
  const mutations = [
    ["asyncSetIsLinkTreeAdd", "postLinkTree", ["T", "public", "D"], "LinkTreeAdd", "LinkTreeAdded", "Link tree berhasil ditambahkan!"],
    ["asyncSetIsLinkTreeChange", "putLinkTree", [1, "T", "public", "D"], "LinkTreeChange", "LinkTreeChanged", "Link tree berhasil diperbarui!"],
    ["asyncSetIsLinkTreeChangeCover", "postLinkTreeCover", [1, "file"], "LinkTreeChangeCover", "LinkTreeChangedCover", "Cover berhasil diperbarui!"],
    ["asyncSetIsLinkTreeDelete", "deleteLinkTree", [1], "LinkTreeDelete", "LinkTreeDeleted", "Link tree berhasil dihapus!"],
    ["asyncSetIsLinkTreeDeleteAll", "deleteAllLinkTrees", [], "LinkTreeDeleteAll", "LinkTreeDeletedAll", "Semua link tree berhasil dihapus!"],
    ["asyncSetIsItemAdd", "postItem", [1, "T", "https://a.com"], "ItemAdd", "ItemAdded", "Item tautan berhasil ditambahkan!"],
    ["asyncSetIsItemChange", "putItem", [1, 2, "T", "https://a.com"], "ItemChange", "ItemChanged", "Item tautan berhasil diperbarui!"],
    ["asyncSetIsItemDelete", "deleteItem", [1, 2], "ItemDelete", "ItemDeleted", "Item tautan berhasil dihapus!"],
  ];

  describe.each(mutations)("%s", (action, apiName, args, flag, doneFlag, defaultMessage) => {
    it("should call api with arguments and show server message on success", async () => {
      const spy = vi.spyOn(linkTreeApi, apiName).mockResolvedValue("Pesan server");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await linkTreesStore[action](...args);

      expect(spy).toHaveBeenCalledWith(...args);
      expect(successSpy).toHaveBeenCalledWith("Pesan server");
      expect(linkTreesStore[`is${doneFlag}`]).toBe(true);
      expect(linkTreesStore[`is${flag}`]).toBe(true);
    });

    it("should fall back to default message when api returns no message", async () => {
      vi.spyOn(linkTreeApi, apiName).mockResolvedValue(undefined);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await linkTreesStore[action](...args);

      expect(successSpy).toHaveBeenCalledWith(defaultMessage);
    });

    it("should show error dialog and set flags on failure", async () => {
      vi.spyOn(linkTreeApi, apiName).mockRejectedValue(new Error("Gagal total"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
      linkTreesStore[`setIs${doneFlag}`](true);

      await linkTreesStore[action](...args);

      expect(errorSpy).toHaveBeenCalledWith("Gagal total");
      expect(linkTreesStore[`is${doneFlag}`]).toBe(false);
      expect(linkTreesStore[`is${flag}`]).toBe(true);
    });
  });
});
