import { describe, it, expect, vi, beforeEach } from "vitest";
import authApi from "./authApi";
import apiHelper from "../../../helpers/apiHelper";

describe("authApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("postRegister", () => {
    it("should return message on success response", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil melakukan pendaftaran",
        }),
      });

      const message = await authApi.postRegister("Delcom", "delcom@org.id", "123456");
      expect(message).toBe("Berhasil melakukan pendaftaran");
    });

    it("should throw error when api returns fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123456")
      ).rejects.toThrow("Data tidak valid");
    });

    it("should use default fallback message when message is missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123456")
      ).rejects.toThrow("Gagal melakukan pendaftaran");
    });

    it("should handle when data object has no error messages", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
          data: {},
        }),
      });

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123")
      ).rejects.toThrow("Data tidak valid");
    });

    it("should format detailed validation errors when present", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
          data: {
            email: ["Email sudah terdaftar."],
          },
        }),
      });

      await expect(
        authApi.postRegister("Delcom", "delcom@org.id", "123")
      ).rejects.toThrow("Data tidak valid: Email sudah terdaftar.");
    });
  });

  describe("postLogin", () => {
    it("should return data on success response", async () => {
      const mockData = {
        user: { id: 1, name: "Test" },
        token: "fake-jwt",
      };

      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: mockData,
        }),
      });

      const data = await authApi.postLogin("test@delcom.org", "123456");
      expect(data).toEqual(mockData);
    });

    it("should throw error when login fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Kredensial akun tidak ditemukan",
        }),
      });

      await expect(
        authApi.postLogin("wrong@delcom.org", "wrong")
      ).rejects.toThrow("Kredensial akun tidak ditemukan");
    });

    it("should use default fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        authApi.postLogin("wrong@delcom.org", "wrong")
      ).rejects.toThrow("Gagal login");
    });
  });

  describe("postLogout", () => {
    it("should return message on success logout", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil logout",
        }),
      });

      const message = await authApi.postLogout();
      expect(message).toBe("Berhasil logout");
    });

    it("should throw error when logout fails", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Token tidak sah",
        }),
      });

      await expect(authApi.postLogout()).rejects.toThrow("Token tidak sah");
    });

    it("should use default fallback message when missing on logout failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(authApi.postLogout()).rejects.toThrow("Gagal logout");
    });
  });
});
