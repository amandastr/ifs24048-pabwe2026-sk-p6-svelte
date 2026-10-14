import { describe, it, expect, vi, beforeEach } from "vitest";
import LoginPage from "./LoginPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import apiHelper from "../../../helpers/apiHelper";

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render inputs and handle submit", async () => {
    const { wrapper, authStore } = renderWithProviders(LoginPage, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const loginSpy = vi
      .spyOn(authStore, "asyncSetIsAuthLogin")
      .mockReturnValue(Promise.resolve());

    const emailInput = wrapper.find('[data-testid="login-email-input"]');
    const passwordInput = wrapper.find('[data-testid="login-password-input"]');
    const form = wrapper.find("form");

    await emailInput.setValue("testing@delcom.org");
    await passwordInput.setValue("123456");
    await form.trigger("submit");

    expect(loginSpy).toHaveBeenCalledWith("testing@delcom.org", "123456");
  });

  it("should handle submit when token is present", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("valid-token");

    const { wrapper, authStore } = renderWithProviders(LoginPage, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const loginSpy = vi
      .spyOn(authStore, "asyncSetIsAuthLogin")
      .mockReturnValue(Promise.resolve());

    const emailInput = wrapper.find('[data-testid="login-email-input"]');
    const passwordInput = wrapper.find('[data-testid="login-password-input"]');
    const form = wrapper.find("form");

    await emailInput.setValue("token@delcom.org");
    await passwordInput.setValue("123456");
    await form.trigger("submit");

    expect(loginSpy).toHaveBeenCalledWith("token@delcom.org", "123456");
  });

  it("should handle error during form submit", async () => {
    const { wrapper, authStore } = renderWithProviders(LoginPage, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    vi.spyOn(authStore, "asyncSetIsAuthLogin").mockReturnValue(
      Promise.reject(new Error("Login failed"))
    );

    const emailInput = wrapper.find('[data-testid="login-email-input"]');
    const passwordInput = wrapper.find('[data-testid="login-password-input"]');
    const form = wrapper.find("form");

    await emailInput.setValue("error@delcom.org");
    await passwordInput.setValue("123456");
    await form.trigger("submit");

    expect(wrapper.find('[data-testid="login-submit-button"]').exists()).toBe(true);
  });

  it("should trigger asyncSetProfile when login succeeds and token exists", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue("test-token");

    const { authStore, usersStore } = renderWithProviders(LoginPage, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const setProfileSpy = vi
      .spyOn(usersStore, "asyncSetProfile")
      .mockReturnValue(Promise.resolve());

    authStore.setIsAuthLogin(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(setProfileSpy).toHaveBeenCalled();
  });

  it("should reset state when login fails or when isProfile finishes", async () => {
    vi.spyOn(apiHelper, "getAccessToken").mockReturnValue(null);

    const { authStore, usersStore } = renderWithProviders(LoginPage, {
      preloadedState: {
        isAuthLogin: false,
        isProfile: false,
      },
    });

    const setLoginActionSpy = vi.spyOn(authStore, "setIsAuthLogin");
    const setIsProfileSpy = vi.spyOn(usersStore, "setIsProfile");

    // Case 1: isAuthLogin true but no token
    authStore.setIsAuthLogin(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setLoginActionSpy).toHaveBeenCalledWith(false);

    // Case 2: isProfile true
    usersStore.setIsProfile(true);
    await new Promise((r) => setTimeout(r, 10));
    expect(setIsProfileSpy).toHaveBeenCalledWith(false);
  });
});
