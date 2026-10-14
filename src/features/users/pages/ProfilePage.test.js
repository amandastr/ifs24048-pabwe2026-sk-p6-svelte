import { describe, it, expect, vi, beforeEach } from "vitest";
import ProfilePage from "./ProfilePage.svelte";
import { renderWithProviders } from "../../../test-utils";
import * as toolsHelper from "../../../helpers/toolsHelper";
import { usersStore } from "../states/usersStore";

describe("ProfilePage", () => {
  const mockProfile = {
    id: 1,
    name: "Abdullah Ubaid",
    email: "ifs18005@del.ac.id",
    photo: "https://example.com/photo.jpg",
  };

  const mockProfileEmptyName = {
    id: 3,
    name: "",
    email: "",
    photo: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show loading indicator when profile is null", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: null },
    });
    expect(wrapper.text()).toContain("Memuat data profil...");
  });

  it("should display profile information and initial avatar fallback", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: {
          id: 2,
          name: "Budi",
          email: "budi@del.ac.id",
          photo: null,
        },
      },
    });

    expect(wrapper.text()).toContain("Budi");
    expect(wrapper.text()).toContain("budi@del.ac.id");
    expect(wrapper.text()).toContain("B");
  });

  it("should handle profile with empty name and email using fallback avatar initial", () => {
    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: mockProfileEmptyName,
      },
    });

    expect(wrapper.text()).toContain("U");
  });

  it("should validate and submit update profile", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    const putProfileSpy = vi
      .spyOn(usersStore, "asyncPutProfile")
      .mockReturnValue(Promise.resolve());

    const nameInput = wrapper.find('[data-testid="profile-name-input"]');
    const emailInput = wrapper.find('[data-testid="profile-email-input"]');

    // Empty name
    await nameInput.setValue("   ");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Nama tidak boleh kosong!");

    // Empty email
    await nameInput.setValue("Abdullah Baru");
    await emailInput.setValue("   ");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Email tidak boleh kosong!");

    // Valid
    await emailInput.setValue("baru@del.ac.id");
    await wrapper.findAll("form")[0].trigger("submit");
    expect(putProfileSpy).toHaveBeenCalledWith("Abdullah Baru", "baru@del.ac.id");
  });

  it("should validate and upload photo", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    const photoSpy = vi
      .spyOn(usersStore, "asyncPostProfilePhoto")
      .mockReturnValue(Promise.resolve());

    const fileInput = wrapper.find('[data-testid="profile-photo-file-input"]');

    // Empty file
    await fileInput.trigger("change");

    // Invalid file type
    const textFile = new File(["dummy"], "file.txt", { type: "text/plain" });
    Object.defineProperty(fileInput.element, "files", {
      value: [textFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Pilih file gambar yang valid!");

    // Large file (>3MB)
    const largeFile = new File([new Uint8Array(4 * 1024 * 1024)], "large.png", {
      type: "image/png",
    });
    Object.defineProperty(fileInput.element, "files", {
      value: [largeFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(errorSpy).toHaveBeenCalledWith("Ukuran file foto maksimal 3MB!");

    // Valid file
    const validFile = new File(["img"], "profile.png", { type: "image/png" });
    Object.defineProperty(fileInput.element, "files", {
      value: [validFile],
      configurable: true,
    });
    await fileInput.trigger("change");
    expect(photoSpy).toHaveBeenCalledWith(validFile);
  });

  it("should validate and submit password update", async () => {
    const errorSpy = vi.spyOn(toolsHelper, "showErrorDialog").mockImplementation(() => {});

    const { wrapper } = renderWithProviders(ProfilePage, {
      preloadedState: { profile: mockProfile },
    });

    const putPasswordSpy = vi
      .spyOn(usersStore, "asyncPutProfilePassword")
      .mockReturnValue(Promise.resolve());

    const oldPassInput = wrapper.find('[data-testid="current-password-input"]');
    const newPassInput = wrapper.find('[data-testid="new-password-input"]');
    const confirmPassInput = wrapper.find('[data-testid="confirm-password-input"]');
    const passwordForm = wrapper.findAll("form")[1];

    // Empty old password
    await passwordForm.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi lama wajib diisi!");

    // Short new password (<6)
    await oldPassInput.setValue("old123");
    await newPassInput.setValue("123");
    await passwordForm.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Kata sandi baru minimal 6 karakter!");

    // Confirmation mismatch
    await newPassInput.setValue("password123");
    await confirmPassInput.setValue("mismatch123");
    await passwordForm.trigger("submit");
    expect(errorSpy).toHaveBeenCalledWith("Konfirmasi kata sandi tidak cocok!");

    // Valid
    await confirmPassInput.setValue("password123");
    await passwordForm.trigger("submit");
    expect(putPasswordSpy).toHaveBeenCalledWith(
      "old123",
      "password123",
      "password123"
    );
  });

  it("should handle status flags from store", async () => {
    const { wrapper, usersStore: uStore } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: mockProfile,
        isChangeProfile: false,
        isChangeProfilePhoto: false,
        isChangeProfilePassword: false,
      },
    });

    uStore.setIsChangeProfile(true);
    uStore.setIsChangeProfilePhoto(true);
    uStore.setIsChangeProfilePassword(true);
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).toContain("Profil Akun");
  });

  it("should sync form inputs when profile updates", async () => {
    const { wrapper, usersStore: uStore } = renderWithProviders(ProfilePage, {
      preloadedState: {
        profile: mockProfile,
      },
    });

    uStore.setProfile({
      id: 1,
      name: "Updated Name",
      email: "updated@del.org",
      photo: null,
    });
    await new Promise((r) => setTimeout(r, 10));

    const nameInput = wrapper.find('[data-testid="profile-name-input"]');
    expect(nameInput.element.value).toBe("Updated Name");
  });
});
