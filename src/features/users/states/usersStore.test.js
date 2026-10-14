import { describe, it, expect, vi, beforeEach } from "vitest";
import { useUsersStore, usersStore } from "./usersStore";
import userApi from "../api/userApi";
import * as toolsHelper from "../../../helpers/toolsHelper";

describe("usersStore", () => {
  beforeEach(() => {
    usersStore.reset();
    vi.restoreAllMocks();
  });

  it("should have correct default state", () => {
    const store = useUsersStore();
    expect(store.users).toEqual([]);
    expect(store.user).toBeNull();
    expect(store.profile).toBeNull();
    expect(store.isProfile).toBe(false);
    expect(store.isChangeProfile).toBe(false);
    expect(store.isChangeProfilePhoto).toBe(false);
    expect(store.isChangeProfilePassword).toBe(false);
  });

  it("should update state with setters", () => {
    const store = useUsersStore();
    store.setUsers([{ id: 1 }]);
    expect(store.users).toEqual([{ id: 1 }]);

    store.setUser({ id: 2 });
    expect(store.user).toEqual({ id: 2 });

    store.setProfile({ id: 3 });
    expect(store.profile).toEqual({ id: 3 });

    store.setIsProfile(true);
    expect(store.isProfile).toBe(true);

    store.setIsChangeProfile(true);
    expect(store.isChangeProfile).toBe(true);

    store.setIsChangeProfilePhoto(true);
    expect(store.isChangeProfilePhoto).toBe(true);

    store.setIsChangeProfilePassword(true);
    expect(store.isChangeProfilePassword).toBe(true);
  });

  describe("asyncSetUsers", () => {
    it("should set users on success", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getUsers").mockResolvedValue([{ id: 1 }]);

      await store.asyncSetUsers();

      expect(store.users).toEqual([{ id: 1 }]);
    });

    it("should set empty array on error", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getUsers").mockRejectedValue(new Error("Error"));

      await store.asyncSetUsers();

      expect(store.users).toEqual([]);
    });
  });

  describe("asyncSetUserById", () => {
    it("should set user on success", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getUserById").mockResolvedValue({ id: 2 });

      await store.asyncSetUserById(2);

      expect(store.user).toEqual({ id: 2 });
    });

    it("should set null on error", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getUserById").mockRejectedValue(new Error("Error"));

      await store.asyncSetUserById(99);

      expect(store.user).toBeNull();
    });
  });

  describe("asyncSetProfile", () => {
    it("should set profile and setIsProfile to true on success", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getProfile").mockResolvedValue({ id: 3 });

      await store.asyncSetProfile();

      expect(store.profile).toEqual({ id: 3 });
      expect(store.isProfile).toBe(true);
    });

    it("should set profile null and setIsProfile to true on error", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "getProfile").mockRejectedValue(new Error("Failed"));

      await store.asyncSetProfile();

      expect(store.profile).toBeNull();
      expect(store.isProfile).toBe(true);
    });
  });

  describe("asyncPutProfile", () => {
    it("should update profile, show success, and set isChangeProfile to true", async () => {
      const store = useUsersStore();
      const updated = { id: 1, name: "New Name", email: "new@del.org" };
      vi.spyOn(userApi, "putProfile").mockResolvedValue(updated);
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutProfile("New Name", "new@del.org");

      expect(store.profile).toEqual(updated);
      expect(successSpy).toHaveBeenCalledWith("Profil berhasil diperbarui!");
      expect(store.isChangeProfile).toBe(true);
    });

    it("should show error dialog and set isChangeProfile to false on error", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "putProfile").mockRejectedValue(new Error("Gagal update"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPutProfile("New Name", "new@del.org");

      expect(errorSpy).toHaveBeenCalledWith("Gagal update");
      expect(store.isChangeProfile).toBe(false);
    });
  });

  describe("asyncPostProfilePhoto", () => {
    it("should upload photo, refresh profile, and show success dialog", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("Foto profil diubah");
      vi.spyOn(userApi, "getProfile").mockResolvedValue({ id: 1, photo: "new.jpg" });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "test.png");
      await store.asyncPostProfilePhoto(dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Foto profil diubah");
      expect(store.profile).toEqual({ id: 1, photo: "new.jpg" });
      expect(store.isChangeProfilePhoto).toBe(true);
    });

    it("should use fallback message in success dialog if message empty", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "postProfilePhoto").mockResolvedValue("");
      vi.spyOn(userApi, "getProfile").mockResolvedValue({ id: 1 });
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "test.png");
      await store.asyncPostProfilePhoto(dummyFile);

      expect(successSpy).toHaveBeenCalledWith("Foto profil berhasil diperbarui!");
    });

    it("should show error dialog and set isChangeProfilePhoto to false on failure", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "postProfilePhoto").mockRejectedValue(new Error("File terlalu besar"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      const dummyFile = new File([""], "test.png");
      await store.asyncPostProfilePhoto(dummyFile);

      expect(errorSpy).toHaveBeenCalledWith("File terlalu besar");
      expect(store.isChangeProfilePhoto).toBe(false);
    });
  });

  describe("asyncPutProfilePassword", () => {
    it("should update password, show success dialog, and set isChangeProfilePassword to true", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("Password diubah");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutProfilePassword("old", "new", "new");

      expect(successSpy).toHaveBeenCalledWith("Password diubah");
      expect(store.isChangeProfilePassword).toBe(true);
    });

    it("should use fallback message if server message empty", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "putProfilePassword").mockResolvedValue("");
      const successSpy = vi.spyOn(toolsHelper, "showSuccessDialog").mockImplementation(() => {});

      await store.asyncPutProfilePassword("old", "new", "new");

      expect(successSpy).toHaveBeenCalledWith("Kata sandi berhasil diperbarui!");
    });

    it("should show error dialog and set isChangeProfilePassword to false on failure", async () => {
      const store = useUsersStore();
      vi.spyOn(userApi, "putProfilePassword").mockRejectedValue(new Error("Password salah"));
      const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

      await store.asyncPutProfilePassword("old", "new", "new");

      expect(errorSpy).toHaveBeenCalledWith("Password salah");
      expect(store.isChangeProfilePassword).toBe(false);
    });
  });
});
