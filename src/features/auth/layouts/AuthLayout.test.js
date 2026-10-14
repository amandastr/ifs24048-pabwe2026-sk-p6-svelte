import { describe, it, expect, vi, beforeEach } from "vitest";
import AuthLayout from "./AuthLayout.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";
import * as routerModule from "../../../router";

describe("AuthLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render branding and tabs", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { wrapper } = renderWithProviders(AuthLayout, {
      route: "/auth/login",
      preloadedState: {
        profile: null,
      },
    });

    expect(wrapper.text()).toContain("Delcom Link Tree");
    expect(wrapper.text()).toContain("Masuk Akun");
    expect(wrapper.text()).toContain("Daftar Baru");
  });

  it("should navigate to /auth/login and /auth/register when tab buttons are clicked", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(AuthLayout, {
      route: "/auth/login",
    });

    const buttons = wrapper.findAll("button");
    await buttons[0].trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/auth/login");

    await buttons[1].trigger("click");
    expect(navSpy).toHaveBeenCalledWith("/auth/register");
  });

  it("should call asyncSetProfile onMount if accessToken exists", () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { usersStore } = renderWithProviders(AuthLayout);
    expect(usersStore.asyncSetProfile).toBeDefined();
  });

  it("should navigate to home if user profile exists when isProfile is true", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { usersStore } = renderWithProviders(AuthLayout, {
      preloadedState: {
        profile: { id: 1, name: "Logged In User" },
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/");
  });

  it("should stay on auth layout if isProfile is true but profile is null", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});

    const { wrapper, usersStore } = renderWithProviders(AuthLayout, {
      preloadedState: {
        profile: null,
        isProfile: false,
      },
    });

    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Masuk Akun");
  });
});
