import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAuthStore, authStore } from "./authStore";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("authStore", () => {
  beforeEach(() => {
    authStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useAuthStore();
    expect(store.isAuthLogin).toBe(false);
    expect(store.isAuthRegister).toBe(false);
    expect(store.isAuthLogout).toBe(false);
  });

  it("should update state with setters", () => {
    const store = useAuthStore();
    store.setIsAuthLogin(true);
    expect(store.isAuthLogin).toBe(true);

    store.setIsAuthRegister(true);
    expect(store.isAuthRegister).toBe(true);

    store.setIsAuthLogout(true);
    expect(store.isAuthLogout).toBe(true);
  });

  describe("asyncSetIsAuthLogin", () => {
    it("should set isAuthLogin to true and store token on success", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "postLogin").mockResolvedValue({ token: "jwt-123" });
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await store.asyncSetIsAuthLogin("email@del.org", "password");

      expect(putTokenSpy).toHaveBeenCalledWith("jwt-123");
      expect(store.isAuthLogin).toBe(true);
    });

    it("should set isAuthLogin to false and show error on failure", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "postLogin").mockRejectedValue(new Error("Login gagal"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAuthLogin("email@del.org", "wrong");

      expect(errorSpy).toHaveBeenCalledWith("Login gagal");
      expect(store.isAuthLogin).toBe(false);
    });
  });

  describe("asyncSetIsAuthRegister", () => {
    it("should set isAuthRegister to true and show success dialog on success", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "postRegister").mockResolvedValue("Registrasi Berhasil");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncSetIsAuthRegister("Name", "name@del.org", "pass");

      expect(successSpy).toHaveBeenCalledWith("Registrasi Berhasil");
      expect(store.isAuthRegister).toBe(true);
    });

    it("should set isAuthRegister to false and show error dialog on failure", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "postRegister").mockRejectedValue(new Error("Email sudah terdaftar"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncSetIsAuthRegister("Name", "name@del.org", "pass");

      expect(errorSpy).toHaveBeenCalledWith("Email sudah terdaftar");
      expect(store.isAuthRegister).toBe(false);
    });
  });

  describe("asyncSetIsAuthLogout", () => {
    it("should clear token and set isAuthLogout to true on success", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "postLogout").mockResolvedValue("Berhasil logout");
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await store.asyncSetIsAuthLogout();

      expect(putTokenSpy).toHaveBeenCalledWith("");
      expect(store.isAuthLogout).toBe(true);
    });

    it("should still clear token and set isAuthLogout to true even if api throws error", async () => {
      const store = useAuthStore();
      vi.spyOn(authApi, "postLogout").mockRejectedValue(new Error("Network fail"));
      const putTokenSpy = vi.spyOn(apiHelper, "putAccessToken").mockImplementation(() => {});

      await store.asyncSetIsAuthLogout();

      expect(putTokenSpy).toHaveBeenCalledWith("");
      expect(store.isAuthLogout).toBe(true);
    });
  });
});
