import { describe, it, expect, vi, beforeEach } from "vitest";
import RegisterPage from "./RegisterPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import * as routerModule from "../../../router";

describe("RegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show error when name is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(RegisterPage);

    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Nama lengkap wajib diisi!");
  });

  it("should show error when email is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(RegisterPage);

    await wrapper.find('[data-testid="register-name-input"]').setValue("Abdul");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Email wajib diisi!");
  });

  it("should show error when password is empty", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(RegisterPage);

    await wrapper.find('[data-testid="register-name-input"]').setValue("Abdul");
    await wrapper.find('[data-testid="register-email-input"]').setValue("abdul@del.org");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi wajib diisi!");
  });

  it("should show error when password confirmation does not match", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});
    const { wrapper } = renderWithProviders(RegisterPage);

    await wrapper.find('[data-testid="register-name-input"]').setValue("Abdul");
    await wrapper.find('[data-testid="register-email-input"]').setValue("abdul@del.org");
    await wrapper.find('[data-testid="register-password-input"]').setValue("pass1");
    await wrapper.find('[data-testid="register-password-confirm-input"]').setValue("pass2");
    await wrapper.find("form").trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");
  });

  it("should submit form successfully when fields are valid", async () => {
    const { wrapper, authStore } = renderWithProviders(RegisterPage);
    const registerSpy = vi.spyOn(authStore, "asyncSetIsAuthRegister").mockResolvedValue();

    await wrapper.find('[data-testid="register-name-input"]').setValue("Abdul");
    await wrapper.find('[data-testid="register-email-input"]').setValue("abdul@del.org");
    await wrapper.find('[data-testid="register-password-input"]').setValue("pass123");
    await wrapper.find('[data-testid="register-password-confirm-input"]').setValue("pass123");
    await wrapper.find("form").trigger("submit");

    expect(registerSpy).toHaveBeenCalledWith("Abdul", "abdul@del.org", "pass123");
  });

  it("should navigate to /auth/login when registration succeeds", async () => {
    const navSpy = vi.spyOn(routerModule, "navigate").mockImplementation(() => {});
    const { authStore } = renderWithProviders(RegisterPage);

    authStore.setIsAuthRegister(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(navSpy).toHaveBeenCalledWith("/auth/login");
  });
});
