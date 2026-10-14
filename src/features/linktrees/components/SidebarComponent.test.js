import { describe, it, expect, vi } from "vitest";
import SidebarComponent from "./SidebarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("SidebarComponent", () => {
  it("should render navigation links properly", () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Semua Link Tree");
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Profil Saya");
  });

  it("should render backdrop and trigger close-mobile when backdrop clicked on mobile", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    expect(backdrop.exists()).toBe(true);
    await backdrop.trigger("click");
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should close on backdrop keydown Escape and ignore other keys", async () => {
    const closeSpy = vi.fn();
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("keydown", { key: "Enter" });
    expect(closeSpy).not.toHaveBeenCalled();

    await backdrop.trigger("keydown", { key: "Escape" });
    expect(closeSpy).toHaveBeenCalled();
  });

  it("should handle backdrop click and keydown when onCloseMobile is undefined", async () => {
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("click");
    await backdrop.trigger("keydown", { key: "Escape" });
    expect(wrapper.exists()).toBe(true);
  });

  it("should trigger close-mobile and navigate when clicking navigation link", async () => {
    const closeSpy = vi.fn();
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
        onCloseMobile: closeSpy,
      },
    });

    const links = wrapper.findAll("a");
    const usersLink = links.find((l) => l.text().includes("Semua Pengguna"));
    expect(usersLink).toBeDefined();
    await usersLink.trigger("click");

    expect(closeSpy).toHaveBeenCalled();
    expect(navSpy).toHaveBeenCalledWith("/users");
  });

  it("should trigger navigation when clicking link without onCloseMobile prop", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(SidebarComponent, {
      props: {
        isSidebarOpen: true,
      },
    });

    const links = wrapper.findAll("a");
    const profileLink = links.find((l) => l.text().includes("Profil Saya"));
    await profileLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");
  });
});
