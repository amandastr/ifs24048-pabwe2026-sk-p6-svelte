import { describe, it, expect, vi, beforeEach } from "vitest";
import userApi from "./userApi";
import apiHelper from "../../../helpers/apiHelper";

describe("userApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("getUsers", () => {
    it("should return users array on success", async () => {
      const mockUsers = [{ id: 1, name: "Ubaid" }];
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { users: mockUsers },
        }),
      });

      const users = await userApi.getUsers();
      expect(users).toEqual(mockUsers);
    });

    it("should return empty array if data.users is empty", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: {},
        }),
      });

      const users = await userApi.getUsers();
      expect(users).toEqual([]);
    });

    it("should throw error when api status is fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Data tidak valid",
        }),
      });

      await expect(userApi.getUsers()).rejects.toThrow("Data tidak valid");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(userApi.getUsers()).rejects.toThrow("Gagal mengambil data pengguna");
    });
  });

  describe("getUserById", () => {
    it("should return user object on success", async () => {
      const mockUser = { id: 2, name: "Abdullah" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { user: mockUser },
        }),
      });

      const user = await userApi.getUserById(2);
      expect(user).toEqual(mockUser);
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "User tidak ditemukan",
        }),
      });

      await expect(userApi.getUserById(99)).rejects.toThrow("User tidak ditemukan");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(userApi.getUserById(99)).rejects.toThrow("Gagal mengambil detail pengguna");
    });
  });

  describe("getProfile", () => {
    it("should return profile user object on success", async () => {
      const mockUser = { id: 3, name: "Profile" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { user: mockUser },
        }),
      });

      const user = await userApi.getProfile();
      expect(user).toEqual(mockUser);
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Akses ditolak",
        }),
      });

      await expect(userApi.getProfile()).rejects.toThrow("Akses ditolak");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(userApi.getProfile()).rejects.toThrow("Gagal mengambil data profil");
    });
  });

  describe("putProfile", () => {
    it("should update and return user data on success", async () => {
      const mockUser = { id: 1, name: "Updated Name", email: "updated@del.org" };
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          data: { user: mockUser },
        }),
      });

      const user = await userApi.putProfile("Updated Name", "updated@del.org");
      expect(user).toEqual(mockUser);
    });

    it("should throw error on fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Email sudah digunakan",
        }),
      });

      await expect(userApi.putProfile("Updated Name", "updated@del.org")).rejects.toThrow(
        "Email sudah digunakan"
      );
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(userApi.putProfile("Name", "email")).rejects.toThrow(
        "Gagal mengubah profil"
      );
    });
  });

  describe("postProfilePhoto", () => {
    it("should post photo with FormData and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah foto profil",
        }),
      });

      const file = new File(["dummy"], "photo.png", { type: "image/png" });
      const msg = await userApi.postProfilePhoto(file);
      expect(msg).toBe("Berhasil mengubah foto profil");
    });

    it("should handle photo file without name properly", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil",
        }),
      });

      const file = new Blob(["dummy"], { type: "image/png" });
      const msg = await userApi.postProfilePhoto(file);
      expect(msg).toBe("Berhasil");
    });

    it("should throw error on photo upload failure", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "File tidak didukung",
        }),
      });

      const file = new File(["dummy"], "photo.png", { type: "image/png" });
      await expect(userApi.postProfilePhoto(file)).rejects.toThrow("File tidak didukung");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      const file = new File(["dummy"], "photo.png", { type: "image/png" });
      await expect(userApi.postProfilePhoto(file)).rejects.toThrow(
        "Gagal mengubah foto profil"
      );
    });
  });

  describe("putProfilePassword", () => {
    it("should update password and return message on success", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah kata sandi",
        }),
      });

      const msg = await userApi.putProfilePassword("old123", "new123", "new123");
      expect(msg).toBe("Berhasil mengubah kata sandi");
    });

    it("should fallback confirmation to newPassword when confirmation omitted", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "success",
          message: "Berhasil mengubah kata sandi",
        }),
      });

      const msg = await userApi.putProfilePassword("old123", "new123");
      expect(msg).toBe("Berhasil mengubah kata sandi");
    });

    it("should throw error on password change fail", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
          message: "Kata sandi lama keliru",
        }),
      });

      await expect(
        userApi.putProfilePassword("wrong", "new123", "new123")
      ).rejects.toThrow("Kata sandi lama keliru");
    });

    it("should use fallback error message when missing", async () => {
      vi.spyOn(apiHelper, "fetchData").mockResolvedValue({
        json: async () => ({
          status: "fail",
        }),
      });

      await expect(
        userApi.putProfilePassword("wrong", "new123", "new123")
      ).rejects.toThrow("Gagal mengubah kata sandi");
    });
  });
});
