import { describe, it, expect, vi, beforeEach } from "vitest";
import DetailPage from "./DetailPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as router from "../../../router";
import linkTreeApi from "../api/linkTreeApi";
import { linkTreesStore } from "../states/linkTreesStore";

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

describe("DetailPage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockItems = [
    { id: 11, title: "GitHub", url: "https://github.com/del" },
    { id: 12, title: "Slides", url: "https://slides.example.com" },
  ];
  const mockLinkTree = {
    id: 1,
    title: "Detail Link Tree Judul",
    description: "Detail Link Tree Deskripsi",
    type: "public",
    cover: "https://example.com/cover.jpg",
    created_at: "2024-02-26T02:34:26.000000Z",
    updated_at: "2024-02-26T02:44:47.000000Z",
    items: mockItems,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockImplementation(() => Promise.resolve());
  });

  const render = (linkTree = mockLinkTree, props = { linkTreeId: 1 }) =>
    renderWithProviders(DetailPage, {
      props,
      preloadedState: { profile: mockProfile, linkTree },
    });

  it("should render spinner if profile or link tree is missing", () => {
    const { wrapper } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: null, linkTree: null },
    });
    expect(wrapper.text()).not.toContain("Detail Link Tree Judul");

    const { wrapper: wrapper2 } = renderWithProviders(DetailPage, {
      props: { linkTreeId: 1 },
      preloadedState: { profile: mockProfile, linkTree: null },
    });
    expect(wrapper2.text()).not.toContain("Detail Link Tree Judul");
  });

  it("should not fetch when linkTreeId is not provided", () => {
    render(mockLinkTree, { linkTreeId: null });
    expect(linkTreesStore.asyncSetLinkTree).not.toHaveBeenCalled();
  });

  it("should fetch the link tree on mount", () => {
    render();
    expect(linkTreesStore.asyncSetLinkTree).toHaveBeenCalledWith(1);
  });

  it("should refetch when linkTreeId prop changes", async () => {
    const { rerender } = render();
    await rerender({ linkTreeId: 2 });
    await tick();
    expect(linkTreesStore.asyncSetLinkTree).toHaveBeenCalledWith(2);
  });

  it("should render details, cover, type, dates and markdown description", () => {
    const { wrapper } = render();

    expect(wrapper.text()).toContain("Detail Link Tree Judul");
    expect(wrapper.text()).toContain("Detail Link Tree Deskripsi");
    expect(wrapper.find('[data-testid="detail-linktree-type"]').text()).toContain("public");
    expect(wrapper.find("img").exists()).toBe(true);
  });

  it("should render without cover and show empty description text", () => {
    const { wrapper } = render({ ...mockLinkTree, cover: null, description: "" });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.text()).toContain("Tidak ada deskripsi untuk link tree ini.");
  });

  it("should navigate back to the list", async () => {
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    const { wrapper } = render();

    await wrapper.find('[data-testid="back-to-linktrees-link"]').trigger("click");
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should open and close the cover modal", async () => {
    const { wrapper } = render();

    await wrapper.find('[data-testid="edit-cover-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-cover-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="change-cover-modal"]').exists()).toBe(false);
  });

  it("should open and close the edit modal", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);
    const { wrapper } = render();

    await wrapper.find('[data-testid="edit-detail-linktree-btn"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should redirect to home when the fetched link tree is missing", async () => {
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    render(null);

    linkTreesStore.setIsLinkTree(true);
    await tick();

    expect(linkTreesStore.isLinkTree).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should stay on page when the fetched link tree exists", async () => {
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    render();
    navigateSpy.mockClear();

    linkTreesStore.setIsLinkTree(true);
    await tick();

    expect(linkTreesStore.isLinkTree).toBe(false);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it("should navigate home after the link tree is deleted", async () => {
    const navigateSpy = vi.spyOn(router, "navigate").mockImplementation(() => {});
    render();

    linkTreesStore.setIsLinkTreeDeleted(true);
    await tick();

    expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith("/");
  });

  it("should delete the link tree only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => Promise.resolve());
    const { wrapper } = render();

    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    await tick();
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should not delete when the link tree disappears during confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog").mockImplementation(async () => {
      linkTreesStore.setLinkTree(null);
      return { isConfirmed: true };
    });
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => Promise.resolve());
    const { wrapper } = render();

    await wrapper.find('[data-testid="delete-detail-linktree-btn"]').trigger("click");
    await tick();

    expect(deleteSpy).not.toHaveBeenCalled();
  });

  describe("items", () => {
    it("should list items with external links", () => {
      const { wrapper } = render();

      expect(wrapper.text()).toContain("Daftar Tautan (2)");
      const link = wrapper.find('[data-testid="item-link-11"]');
      expect(link.attributes("href")).toBe("https://github.com/del");
      expect(link.attributes("target")).toBe("_blank");
      expect(wrapper.text()).toContain("Slides");
    });

    it("should render an item whose title is missing", () => {
      const { wrapper } = render({
        ...mockLinkTree,
        items: [{ id: 13, title: null, url: "https://no-title.example.com" }],
      });
      expect(wrapper.find('[data-testid="item-row-13"]').exists()).toBe(true);
    });

    it("should show empty state when there are no items or items is undefined", () => {
      const { wrapper } = render({ ...mockLinkTree, items: [] });
      expect(wrapper.find('[data-testid="items-empty"]').exists()).toBe(true);

      const { wrapper: wrapper2 } = render({ ...mockLinkTree, items: undefined });
      expect(wrapper2.text()).toContain("Daftar Tautan (0)");
    });

    it("should open the item modal in add mode and close it", async () => {
      const { wrapper } = render();

      await wrapper.find('[data-testid="add-item-btn"]').trigger("click");
      expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");

      await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
      expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
    });

    it("should open the item modal in edit mode with the item's data", async () => {
      const { wrapper } = render();

      await wrapper.find('[data-testid="edit-item-12"]').trigger("click");
      expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("Slides");
      expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(
        "https://slides.example.com"
      );
    });

    it("should delete an item only after confirmation", async () => {
      vi.spyOn(toolsHelper, "showConfirmDialog")
        .mockResolvedValueOnce({ isConfirmed: false })
        .mockResolvedValueOnce({ isConfirmed: true });
      const deleteSpy = vi
        .spyOn(linkTreesStore, "asyncSetIsItemDelete")
        .mockImplementation(() => Promise.resolve());
      const { wrapper } = render();

      await wrapper.find('[data-testid="delete-item-11"]').trigger("click");
      await tick();
      expect(deleteSpy).not.toHaveBeenCalled();

      await wrapper.find('[data-testid="delete-item-11"]').trigger("click");
      await tick();
      expect(deleteSpy).toHaveBeenCalledWith(1, 11);
    });

    it("should reload the link tree after an item is deleted", async () => {
      render();
      const before = linkTreesStore.asyncSetLinkTree.mock.calls.length;

      linkTreesStore.setIsItemDeleted(true);
      await tick();

      expect(linkTreesStore.isItemDeleted).toBe(false);
      expect(linkTreesStore.asyncSetLinkTree.mock.calls.length).toBe(before + 1);
    });
  });
});
