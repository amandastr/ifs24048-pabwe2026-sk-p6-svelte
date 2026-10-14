import { describe, it, expect, vi, beforeEach } from "vitest";
import linkTreeApi from "./linkTreeApi";
import apiHelper from "../../../helpers/apiHelper";

const mockResponse = (body) =>
  vi.spyOn(apiHelper, "fetchData").mockResolvedValue({ json: async () => body });

describe("linkTreeApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postLinkTree", () => {
    it("should create link tree with title, type and description", async () => {
      const spy = mockResponse({ status: "success", data: { link_tree_id: 10 } });

      const res = await linkTreeApi.postLinkTree("Judul", "public", "Deskripsi");

      expect(res).toEqual({ link_tree_id: 10 });
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({
        title: "Judul",
        type: "public",
        description: "Deskripsi",
      });
    });

    it("should throw server message on failure", async () => {
      mockResponse({ status: "fail", message: "Data tidak valid" });
      await expect(linkTreeApi.postLinkTree("", "x", "")).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback message when missing", async () => {
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.postLinkTree("", "x", "")).rejects.toThrow(
        "Gagal menambahkan link tree"
      );
    });

    it("should accept result.success flag as success", async () => {
      mockResponse({ success: true, data: { ok: 1 } });
      expect(await linkTreeApi.postLinkTree("a", "public", "b")).toEqual({ ok: 1 });
    });
  });

  describe("postLinkTreeCover", () => {
    it("should upload cover with FormData and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil mengubah cover" });
      const file = new File(["dummy"], "cover.jpg", { type: "image/jpeg" });

      const msg = await linkTreeApi.postLinkTreeCover(1, file);

      expect(msg).toBe("Berhasil mengubah cover");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/cover");
      expect(options.body).toBeInstanceOf(FormData);
    });

    it("should handle cover without name property", async () => {
      mockResponse({ status: "success", message: "Berhasil" });
      const blob = new Blob(["dummy"], { type: "image/jpeg" });
      expect(await linkTreeApi.postLinkTreeCover(1, blob)).toBe("Berhasil");
    });

    it("should throw on failure with and without message", async () => {
      const file = new File(["dummy"], "cover.jpg");
      mockResponse({ status: "fail", message: "Format tidak didukung" });
      await expect(linkTreeApi.postLinkTreeCover(1, file)).rejects.toThrow("Format tidak didukung");
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.postLinkTreeCover(1, file)).rejects.toThrow("Gagal mengubah cover");
    });
  });

  describe("putLinkTree", () => {
    it("should update link tree and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Berhasil diubah" });

      const msg = await linkTreeApi.putLinkTree(2, "T", "private", "D");

      expect(msg).toBe("Berhasil diubah");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/2");
      expect(options.method).toBe("PUT");
      expect(JSON.parse(options.body)).toEqual({ title: "T", type: "private", description: "D" });
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Gagal" });
      await expect(linkTreeApi.putLinkTree(2, "", "", "")).rejects.toThrow("Gagal");
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.putLinkTree(2, "", "", "")).rejects.toThrow(
        "Gagal mengubah link tree"
      );
    });
  });

  describe("getLinkTrees", () => {
    it("should fetch all link trees without filter", async () => {
      const spy = mockResponse({ status: "success", data: { link_trees: [{ id: 1 }] } });

      expect(await linkTreeApi.getLinkTrees()).toEqual([{ id: 1 }]);
      expect(spy.mock.calls[0][0]).toMatch(/\/link-trees\/$/);
    });

    it("should append is_me query when filter is provided", async () => {
      const spy = mockResponse({ status: "success", data: { link_trees: [] } });

      await linkTreeApi.getLinkTrees("1");
      expect(spy.mock.calls[0][0]).toContain("/?is_me=1");

      await linkTreeApi.getLinkTrees(0);
      expect(spy.mock.calls[1][0]).toContain("/?is_me=0");
    });

    it("should treat null and undefined as no filter", async () => {
      const spy = mockResponse({ status: "success", data: { link_trees: [] } });
      await linkTreeApi.getLinkTrees(null);
      await linkTreeApi.getLinkTrees(undefined);
      expect(spy.mock.calls[0][0]).not.toContain("is_me");
      expect(spy.mock.calls[1][0]).not.toContain("is_me");
    });

    it("should return empty array when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await linkTreeApi.getLinkTrees()).toEqual([]);
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak bisa" });
      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Tidak bisa");
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.getLinkTrees()).rejects.toThrow("Gagal mengambil data link tree");
    });
  });

  describe("getLinkTreeById", () => {
    it("should return link tree detail", async () => {
      const spy = mockResponse({
        status: "success",
        data: { link_tree: { id: 5, items: [] } },
      });

      expect(await linkTreeApi.getLinkTreeById(5)).toEqual({ id: 5, items: [] });
      expect(spy.mock.calls[0][0]).toContain("/link-trees/5");
    });

    it("should return undefined when data is missing", async () => {
      mockResponse({ status: "success" });
      expect(await linkTreeApi.getLinkTreeById(5)).toBeUndefined();
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Tidak ditemukan" });
      await expect(linkTreeApi.getLinkTreeById(5)).rejects.toThrow("Tidak ditemukan");
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.getLinkTreeById(5)).rejects.toThrow(
        "Gagal mengambil detail link tree"
      );
    });
  });

  describe("deleteLinkTree", () => {
    it("should delete link tree and return message", async () => {
      const spy = mockResponse({ status: "success", message: "Terhapus" });
      expect(await linkTreeApi.deleteLinkTree(3)).toBe("Terhapus");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
      expect(spy.mock.calls[0][0]).toContain("/link-trees/3");
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Gagal hapus" });
      await expect(linkTreeApi.deleteLinkTree(3)).rejects.toThrow("Gagal hapus");
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.deleteLinkTree(3)).rejects.toThrow("Gagal menghapus link tree");
    });
  });

  describe("deleteAllLinkTrees", () => {
    it("should delete all link trees", async () => {
      const spy = mockResponse({ status: "success", message: "Semua terhapus" });
      expect(await linkTreeApi.deleteAllLinkTrees()).toBe("Semua terhapus");
      expect(spy.mock.calls[0][1].method).toBe("DELETE");
      expect(spy.mock.calls[0][0]).toMatch(/\/link-trees\/$/);
    });

    it("should throw on failure", async () => {
      mockResponse({ status: "fail", message: "Gagal semua" });
      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow("Gagal semua");
      mockResponse({ status: "fail" });
      await expect(linkTreeApi.deleteAllLinkTrees()).rejects.toThrow(
        "Gagal menghapus semua link tree"
      );
    });
  });

  describe("items", () => {
    it("should add an item", async () => {
      const spy = mockResponse({ status: "success", message: "Item ditambah" });
      expect(await linkTreeApi.postItem(1, "GitHub", "https://github.com")).toBe("Item ditambah");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/items");
      expect(options.method).toBe("POST");
      expect(JSON.parse(options.body)).toEqual({ title: "GitHub", url: "https://github.com" });
    });

    it("should update an item", async () => {
      const spy = mockResponse({ status: "success", message: "Item diubah" });
      expect(await linkTreeApi.putItem(1, 7, "GH", "https://gh.com")).toBe("Item diubah");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/items/7");
      expect(options.method).toBe("PUT");
    });

    it("should delete an item", async () => {
      const spy = mockResponse({ status: "success", message: "Item dihapus" });
      expect(await linkTreeApi.deleteItem(1, 7)).toBe("Item dihapus");
      const [url, options] = spy.mock.calls[0];
      expect(url).toContain("/link-trees/1/items/7");
      expect(options.method).toBe("DELETE");
    });

    it("should throw with server message or fallback on item failures", async () => {
      mockResponse({ status: "fail", message: "Ditolak" });
      await expect(linkTreeApi.postItem(1, "a", "b")).rejects.toThrow("Ditolak");
      await expect(linkTreeApi.putItem(1, 2, "a", "b")).rejects.toThrow("Ditolak");
      await expect(linkTreeApi.deleteItem(1, 2)).rejects.toThrow("Ditolak");

      mockResponse({ status: "fail" });
      await expect(linkTreeApi.postItem(1, "a", "b")).rejects.toThrow(
        "Gagal menambahkan item tautan"
      );
      await expect(linkTreeApi.putItem(1, 2, "a", "b")).rejects.toThrow(
        "Gagal mengubah item tautan"
      );
      await expect(linkTreeApi.deleteItem(1, 2)).rejects.toThrow("Gagal menghapus item tautan");
    });
  });
});
