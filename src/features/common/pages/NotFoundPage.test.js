import { describe, it, expect, vi } from "vitest";
import NotFoundPage from "./NotFoundPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("NotFoundPage", () => {
  it("should render 404 text and description properly", () => {
    const { wrapper } = renderWithProviders(NotFoundPage);

    expect(wrapper.text()).toContain("404");
    expect(wrapper.text()).toContain("Halaman Tidak Ditemukan");
    expect(wrapper.text()).toContain(
      "Maaf, halaman yang Anda cari tidak dapat ditemukan"
    );
  });

  it("should navigate back when Kembali button is clicked", async () => {
    const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(NotFoundPage);

    const backButton = wrapper.find('[data-testid="back-button"]');
    await backButton.trigger("click");

    expect(backSpy).toHaveBeenCalled();
  });

  it("should navigate to home when Beranda button is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(NotFoundPage);

    const homeButton = wrapper.find('[data-testid="home-button"]');
    await homeButton.trigger("click");

    expect(navSpy).toHaveBeenCalledWith("/");
  });
});
