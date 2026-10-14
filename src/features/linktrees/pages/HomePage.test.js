import { describe, it, expect, vi, beforeEach } from "vitest";
import HomePage from "./HomePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";
import linkTreeApi from "../api/linkTreeApi";
import { linkTreesStore } from "../states/linkTreesStore";

const tick = (ms = 20) => new Promise((r) => setTimeout(r, ms));

describe("HomePage", () => {
  const mockProfile = { id: 1, name: "Abdullah", email: "abdul@del.org" };
  const mockLinkTrees = [
    {
      id: 1,
      title: "Link Praktikum",
      description: "Tautan praktikum PABWE",
      type: "public",
      cover: "https://example.com/cover1.jpg",
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
    },
    {
      id: 2,
      title: "Link Rahasia",
      description: "Hanya untuk saya",
      type: "private",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
    },
    {
      id: 3,
      title: "Link Tersembunyi",
      description: null,
      type: "unlisted",
      cover: null,
      created_at: "2024-02-26T02:34:26.000000Z",
      updated_at: "2024-02-26T02:44:47.000000Z",
    },
  ];

  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(linkTreesStore, "asyncSetLinkTrees").mockImplementation(() => Promise.resolve());
  });

  it("should render nothing when profile is not present", () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.find('[data-testid="add-linktree-btn"]').exists()).toBe(false);
  });

  it("should render header and empty state when there are no link trees", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });
    await tick();

    expect(wrapper.text()).toContain("Daftar Link Tree");
    expect(wrapper.text()).toContain("Belum ada data link tree yang cocok.");
    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("0");
  });

  it("should treat a null link tree collection as empty", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: null },
    });
    await tick();
    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("0");
  });

  it("should load link trees on mount with empty filter", async () => {
    renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });
    await tick();
    expect(linkTreesStore.asyncSetLinkTrees).toHaveBeenCalledWith("");
  });

  it("should show loading indicator while fetching", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });
    await tick();

    linkTreesStore.asyncSetLinkTrees.mockReturnValue(new Promise(() => {}));
    await wrapper.find('[data-testid="filter-mine-btn"]').trigger("click");

    expect(wrapper.text()).toContain("Memuat daftar link tree...");
  });

  it("should render rows, stats per type, cover, badges and dates", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();

    expect(wrapper.find('[data-testid="stat-total"]').text()).toBe("3");
    expect(wrapper.find('[data-testid="stat-public"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-unlisted"]').text()).toBe("1");
    expect(wrapper.find('[data-testid="stat-private"]').text()).toBe("1");
    expect(wrapper.text()).toContain("Link Praktikum");
    expect(wrapper.text()).toContain("Tautan praktikum PABWE");
    expect(wrapper.find('[data-testid="linktree-type-1"]').text()).toBe("public");
    expect(wrapper.find('[data-testid="linktree-row-1"] img').exists()).toBe(true);
    expect(wrapper.find('[data-testid="linktree-row-2"] img').exists()).toBe(false);
  });

  it("should fall back to private badge style for unknown types", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [{ ...mockLinkTrees[0], id: 9, type: "weird" }],
      },
    });
    await tick();

    expect(wrapper.find('[data-testid="linktree-type-9"]').classes("bg-slate-100")).toBe(true);
  });

  it("should search by title and description, including null fields", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: {
        profile: mockProfile,
        linkTrees: [...mockLinkTrees, { id: 4, title: null, description: null, type: "public" }],
      },
    });
    await tick();

    const search = wrapper.find('[data-testid="search-linktree-input"]');

    await search.setValue("Praktikum");
    expect(wrapper.text()).toContain("Link Praktikum");
    expect(wrapper.text()).not.toContain("Link Rahasia");

    await search.setValue("untuk saya");
    expect(wrapper.text()).toContain("Link Rahasia");
    expect(wrapper.text()).not.toContain("Link Praktikum");

    await search.setValue("   ");
    expect(wrapper.text()).toContain("Link Praktikum");
    expect(wrapper.text()).toContain("Link Rahasia");
  });

  it("should reload link trees when the 'milik saya' filter changes", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();

    await wrapper.find('[data-testid="filter-mine-btn"]').trigger("click");
    await tick();
    expect(linkTreesStore.asyncSetLinkTrees).toHaveBeenLastCalledWith("1");

    await wrapper.find('[data-testid="filter-all-btn"]').trigger("click");
    await tick();
    expect(linkTreesStore.asyncSetLinkTrees).toHaveBeenLastCalledWith("");
  });

  it("should navigate to detail page on view click", async () => {
    const navigateSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();

    await wrapper.find('[data-testid="view-linktree-1"]').trigger("click");
    expect(navigateSpy).toHaveBeenCalledWith("/link-trees/1");
  });

  it("should open and close the add modal", async () => {
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: [] },
    });
    await tick();

    await wrapper.find('[data-testid="add-linktree-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-add-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="add-linktree-modal"]').exists()).toBe(false);
  });

  it("should open and close the change modal", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTrees[0]);
    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();

    await wrapper.find('[data-testid="edit-linktree-1"]').trigger("click");
    await tick();
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(true);

    await wrapper.find('[data-testid="close-edit-modal-btn"]').trigger("click");
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should delete a link tree only after confirmation", async () => {
    const confirmSpy = vi
      .spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDelete")
      .mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();

    await wrapper.find('[data-testid="delete-linktree-1"]').trigger("click");
    await tick();
    expect(deleteSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-linktree-1"]').trigger("click");
    await tick();
    expect(confirmSpy).toHaveBeenCalledTimes(2);
    expect(deleteSpy).toHaveBeenCalledWith(1);
  });

  it("should delete all link trees only after confirmation", async () => {
    vi.spyOn(toolsHelper, "showConfirmDialog")
      .mockResolvedValueOnce({ isConfirmed: false })
      .mockResolvedValueOnce({ isConfirmed: true });
    const deleteAllSpy = vi
      .spyOn(linkTreesStore, "asyncSetIsLinkTreeDeleteAll")
      .mockImplementation(() => Promise.resolve());

    const { wrapper } = renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();

    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await tick();
    expect(deleteAllSpy).not.toHaveBeenCalled();

    await wrapper.find('[data-testid="delete-all-btn"]').trigger("click");
    await tick();
    expect(deleteAllSpy).toHaveBeenCalledTimes(1);
  });

  it("should reload and reset flag after a single delete", async () => {
    renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();
    const before = linkTreesStore.asyncSetLinkTrees.mock.calls.length;

    linkTreesStore.setIsLinkTreeDeleted(true);
    await tick();

    expect(linkTreesStore.isLinkTreeDeleted).toBe(false);
    expect(linkTreesStore.asyncSetLinkTrees.mock.calls.length).toBe(before + 1);
  });

  it("should reload and reset flag after delete all", async () => {
    renderWithProviders(HomePage, {
      preloadedState: { profile: mockProfile, linkTrees: mockLinkTrees },
    });
    await tick();
    const before = linkTreesStore.asyncSetLinkTrees.mock.calls.length;

    linkTreesStore.setIsLinkTreeDeletedAll(true);
    await tick();

    expect(linkTreesStore.isLinkTreeDeletedAll).toBe(false);
    expect(linkTreesStore.asyncSetLinkTrees.mock.calls.length).toBe(before + 1);
  });
});
