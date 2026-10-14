import { describe, it, expect, vi, beforeEach } from "vitest";
import ChangeModal from "./ChangeModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import linkTreeApi from "../api/linkTreeApi";

describe("ChangeModal", () => {
  const mockLinkTree = {
    id: 1,
    title: "Initial Title",
    description: "Initial Desc",
    type: "public",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="edit-linktree-modal"]').exists()).toBe(false);
  });

  it("should populate inputs with link tree data and handle changes", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-linktree-title-input"]');
    const descInput = wrapper.find('[data-testid="edit-linktree-description-input"]');
    const statusSelect = wrapper.find('[data-testid="edit-linktree-type-select"]');

    expect(titleInput.element.value).toBe("Initial Title");
    expect(descInput.element.value).toBe("Initial Desc");
    expect(statusSelect.element.value).toBe("public");

    await statusSelect.setValue("private");
    expect(statusSelect.element.value).toBe("private");
  });

  it("should handle error in loadLinkTreeData and call handleClose", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockRejectedValue(new Error("Fail"));
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const closeSpy = vi.fn();

    renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(errorSpy).toHaveBeenCalledWith("Gagal mengambil data link tree");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle empty title and description in link tree object", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({
      id: 1,
      title: null,
      description: null,
      type: null,
    });

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    expect(wrapper.find('[data-testid="edit-linktree-title-input"]').element.value).toBe("");
  });

  it("should validate empty title and empty description", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const titleInput = wrapper.find('[data-testid="edit-linktree-title-input"]');
    const form = wrapper.find("form");

    await titleInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tidak boleh kosong");

    await titleInput.setValue("Valid Title");
    const descInput = wrapper.find('[data-testid="edit-linktree-description-input"]');
    await descInput.setValue("   ");
    await form.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Deskripsi tidak boleh kosong");
  });

  it("should dispatch asyncSetIsLinkTreeChange and close on success", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);
    const closeSpy = vi.fn();

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
      preloadedState: {
        isLinkTreeChange: false,
        isLinkTreeChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChange").mockReturnValue(Promise.resolve());

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Initial Title", "public", "Initial Desc");

    // Simulate completion with isLinkTreeChanged true
    linkTreesStore.setIsLinkTreeChange(true);
    linkTreesStore.setIsLinkTreeChanged(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(closeSpy).toHaveBeenCalled();
  });

  it("should dispatch asyncSetIsLinkTreeChange with the type from the API", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue({ ...mockLinkTree, type: "unlisted" });

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await new Promise((r) => setTimeout(r, 20));

    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsLinkTreeChange").mockReturnValue(Promise.resolve());

    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, "Initial Title", "unlisted", "Initial Desc");
  });

  it("should handle isLinkTreeChange true when isLinkTreeChanged is false", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
      preloadedState: {
        isLinkTreeChange: false,
        isLinkTreeChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    linkTreesStore.setIsLinkTreeChange(true);
    linkTreesStore.setIsLinkTreeChanged(false);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.find('[data-testid="edit-linktree-title-input"]').exists()).toBe(true);
  });

  it("should trigger onClose on cancel or close button click", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(mockLinkTree);
    const closeSpy = vi.fn();

    const { wrapper } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(1);

    const cancelBtn = wrapper.find('[data-testid="cancel-edit-modal-btn"]');
    await cancelBtn.trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);
  });

  it("should handle null getLinkTreeById response and changed and close without callback", async () => {
    vi.spyOn(linkTreeApi, "getLinkTreeById").mockResolvedValue(null);

    const { wrapper, linkTreesStore } = renderWithProviders(ChangeModal, {
      props: { show: true, linkTreeId: 1 },
      preloadedState: {
        isLinkTreeChange: false,
        isLinkTreeChanged: false,
      },
    });

    await new Promise((r) => setTimeout(r, 20));

    const closeBtn = wrapper.find('[data-testid="close-edit-modal-btn"]');
    await closeBtn.trigger("click");

    linkTreesStore.setIsLinkTreeChange(true);
    linkTreesStore.setIsLinkTreeChanged(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.exists()).toBe(true);
  });
});
