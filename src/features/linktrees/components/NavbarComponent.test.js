import { describe, it, expect, vi, beforeEach } from "vitest";
import NavbarComponent from "./NavbarComponent.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as routerModule from "../../../router";

describe("NavbarComponent", () => {
  const mockProfileWithPhoto = {
    name: "Abdullah",
    email: "abdullah@delcom.org",
    photo: "https://example.com/photo.jpg",
  };

  const mockProfileWithoutPhoto = {
    name: "Ubaid",
    email: "ubaid@delcom.org",
    photo: null,
  };

  const mockProfileEmpty = {
    name: "",
    email: "",
    photo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render profile photo and name correctly", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("abdullah@delcom.org");
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/photo.jpg");
  });

  it("should render avatar initial fallback when photo is null", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithoutPhoto,
        isSidebarOpen: true,
      },
    });

    expect(wrapper.text()).toContain("U");
  });

  it("should render default Pengguna fallback when name and email are empty", () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileEmpty,
        isSidebarOpen: false,
      },
    });

    expect(wrapper.text()).toContain("Pengguna");
  });

  it("should navigate to / when logo is clicked", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    const logoLink = wrapper.find("a");
    await logoLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should toggle sidebar on mobile menu button click", async () => {
    const toggleSpy = vi.fn();
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
        onToggleSidebar: toggleSpy,
      },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");
    expect(toggleSpy).toHaveBeenCalled();
  });

  it("should open and close profile dropdown menu, navigate to profile and trigger logout", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const logoutSpy = vi.fn();

    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
        onLogout: logoutSpy,
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    // Click profile link in dropdown
    const profileLink = wrapper.find('[data-testid="dropdown-profile-link"]');
    await profileLink.trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/profile");

    // Open again to click logout
    await dropdownBtn.trigger("click");
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    await logoutBtn.trigger("click");
    expect(logoutSpy).toHaveBeenCalled();
  });

  it("should close dropdown when clicking outside", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: false,
      },
    });

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    // Click inside
    const menu = wrapper.find('[data-testid="profile-dropdown-menu"]');
    menu.element.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(true);

    // Click outside
    document.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.find('[data-testid="profile-dropdown-menu"]').exists()).toBe(false);

    wrapper.unmount();
  });

  it("should handle toggle sidebar and logout when callback props are omitted", async () => {
    const { wrapper } = renderWithProviders(NavbarComponent, {
      props: {
        profile: mockProfileWithPhoto,
        isSidebarOpen: true,
      },
    });

    const toggleBtn = wrapper.find('[data-testid="toggle-sidebar-btn"]');
    await toggleBtn.trigger("click");

    const dropdownBtn = wrapper.find('[data-testid="profile-dropdown-button"]');
    await dropdownBtn.trigger("click");
    const logoutBtn = wrapper.find('[data-testid="dropdown-logout-button"]');
    await logoutBtn.trigger("click");
    expect(wrapper.exists()).toBe(true);
  });
});
