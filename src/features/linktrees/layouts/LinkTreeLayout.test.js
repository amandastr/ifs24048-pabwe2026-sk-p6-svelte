import { describe, it, expect, vi, beforeEach } from "vitest";
import LinkTreeLayout from "./LinkTreeLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import * as routerModule from "../../../router";
import { usersStore } from "../../users/states/usersStore";

describe("LinkTreeLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Hindari request jaringan nyata agar hasil tes deterministik
    vi.spyOn(usersStore, "asyncSetProfile").mockImplementation(() => Promise.resolve());
  });

  it("should redirect to login if access token does not exist", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(LinkTreeLayout, {
      preloadedState: {
        profile: null,
      },
    });

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
    expect(wrapper.text()).toContain("Memuat sesi pengguna...");
  });

  it("should render layout with navbar and sidebar when profile is present and handle sidebar toggling & logout", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper, authStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: {
        profile: {
          id: 1,
          name: "Test User",
          email: "test@delcom.org",
        },
      },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Test User");

    // Toggle sidebar
    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    // Click backdrop to close mobile sidebar
    const backdrop = wrapper.find('[data-testid="sidebar-backdrop"]');
    await backdrop.trigger("click");
    await new Promise((r) => setTimeout(r, 10));

    // Click nav link to close mobile sidebar as well
    const navLinks = wrapper.findAll("aside a");
    if (navLinks.length > 0) {
      await navLinks[0].trigger("click");
      await new Promise((r) => setTimeout(r, 10));
    }

    // Trigger logout from navbar
    const logoutSpy = vi.spyOn(authStore, "asyncSetIsAuthLogout").mockImplementation(() => {});
    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    await logoutBtn.trigger("click");

    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should stay on page when isProfile is triggered and profile exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Logged User");
  });

  it("should redirect to login when isProfile is triggered and profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: {
        profile: null,
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(putTokenSpy).toHaveBeenCalledWith("");
    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });

  it("should redirect to login when isAuthLogout is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { authStore } = renderWithProviders(LinkTreeLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged User" },
        isAuthLogout: false,
      },
    });

    authStore.setIsAuthLogout(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });
});
