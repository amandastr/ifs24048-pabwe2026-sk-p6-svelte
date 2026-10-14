import { describe, it, expect, vi, beforeEach } from "vitest";
import ItemModal from "./ItemModal.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";

const tick = (ms = 10) => new Promise((r) => setTimeout(r, ms));

describe("ItemModal", () => {
  const mockItem = { id: 7, title: "GitHub", url: "https://github.com/del" };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should not render when show is false", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: false, linkTreeId: 1 },
    });
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(false);
  });

  it("should render add mode with empty fields", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });
    expect(wrapper.text()).toContain("Tambah Item Tautan");
    expect(wrapper.text()).toContain("Simpan Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
  });

  it("should render edit mode with item data", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem },
    });
    expect(wrapper.text()).toContain("Ubah Item Tautan");
    expect(wrapper.text()).toContain("Perbarui Tautan");
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("GitHub");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe(
      "https://github.com/del"
    );
  });

  it("should fall back to empty strings when item fields are missing", () => {
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: { id: 8 } },
    });
    expect(wrapper.find('[data-testid="item-title-input"]').element.value).toBe("");
    expect(wrapper.find('[data-testid="item-url-input"]').element.value).toBe("");
  });

  it("should validate empty title and empty url", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Judul tautan tidak boleh kosong");

    await wrapper.find('[data-testid="item-title-input"]').setValue("Judul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("URL tautan tidak boleh kosong");
  });

  it("should add an item, then reload the link tree and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });
    const addSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemAdd").mockResolvedValue();
    const reloadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    await wrapper.find('[data-testid="item-title-input"]').setValue("  Repo  ");
    await wrapper.find('[data-testid="item-url-input"]').setValue(" https://repo.com ");
    await wrapper.find("form").trigger("submit");

    expect(addSpy).toHaveBeenCalledWith(1, "Repo", "https://repo.com");

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(true);
    await tick();

    expect(reloadSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
    expect(linkTreesStore.isItemAdd).toBe(false);
    expect(linkTreesStore.isItemAdded).toBe(false);
  });

  it("should stay open when adding fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    linkTreesStore.setIsItemAdd(true);
    linkTreesStore.setIsItemAdded(false);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should update an item, then reload the link tree and close on success", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
    });
    const changeSpy = vi.spyOn(linkTreesStore, "asyncSetIsItemChange").mockResolvedValue();
    const reloadSpy = vi.spyOn(linkTreesStore, "asyncSetLinkTree").mockResolvedValue();

    await wrapper.find('[data-testid="item-title-input"]').setValue("GitHub Baru");
    await wrapper.find("form").trigger("submit");

    expect(changeSpy).toHaveBeenCalledWith(1, 7, "GitHub Baru", "https://github.com/del");

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(true);
    await tick();

    expect(reloadSpy).toHaveBeenCalledWith(1);
    expect(closeSpy).toHaveBeenCalled();
    expect(linkTreesStore.isItemChange).toBe(false);
    expect(linkTreesStore.isItemChanged).toBe(false);
  });

  it("should stay open when updating fails", async () => {
    const closeSpy = vi.fn();
    const { wrapper, linkTreesStore } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, item: mockItem, onClose: closeSpy },
    });

    linkTreesStore.setIsItemChange(true);
    linkTreesStore.setIsItemChanged(false);
    await tick();

    expect(closeSpy).not.toHaveBeenCalled();
    expect(wrapper.find('[data-testid="item-modal"]').exists()).toBe(true);
  });

  it("should close via close and cancel buttons, with or without onClose", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1, onClose: closeSpy },
    });

    await wrapper.find('[data-testid="close-item-modal-btn"]').trigger("click");
    await wrapper.find('[data-testid="cancel-item-modal-btn"]').trigger("click");
    expect(closeSpy).toHaveBeenCalledTimes(2);

    const { wrapper: wrapper2 } = renderWithProviders(ItemModal, {
      props: { show: true, linkTreeId: 1 },
    });
    await wrapper2.find('[data-testid="close-item-modal-btn"]').trigger("click");
    expect(wrapper2.exists()).toBe(true);
  });
});
