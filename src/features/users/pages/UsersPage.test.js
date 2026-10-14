import { describe, it, expect, vi, beforeEach } from "vitest";
import UsersPage from "./UsersPage.svelte";
import { renderWithProviders } from "../../../test-utils";
import { usersStore } from "../states/usersStore";

describe("UsersPage", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const mockUsers = [
    {
      id: 1,
      name: "Abdullah",
      email: "abdullah@delcom.org",
      photo: "https://example.com/photo.jpg",
      created_at: "2024-10-05T02:53:38.000000Z",
    },
    {
      id: 2,
      name: "Ubaid",
      email: "ubaid@delcom.org",
      photo: null,
      created_at: "2024-10-05T03:18:14.000000Z",
    },
    {
      id: 3,
      name: "",
      email: "",
      photo: null,
      created_at: "2024-10-05T03:18:14.000000Z",
    },
  ];

  it("should render users list, fallback initial avatar, and search users", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: mockUsers,
      },
    });

    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).toContain("Ubaid");
    expect(wrapper.text()).toContain("U"); // initial avatar fallback

    const searchInput = wrapper.find('[data-testid="search-user-input"]');

    // Search by name
    await searchInput.setValue("abdullah");
    expect(wrapper.text()).toContain("Abdullah");
    expect(wrapper.text()).not.toContain("Ubaid");

    // Search by email
    await searchInput.setValue("ubaid@delcom");
    expect(wrapper.text()).toContain("Ubaid");
    expect(wrapper.text()).not.toContain("Abdullah");

    // Search with non-matching query
    await searchInput.setValue("nonexistentquery");
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should handle state when users in store is null", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: null,
      },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Semua Pengguna");
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should show empty state when no users found and not loading", async () => {
    vi.spyOn(usersStore, "asyncSetUsers").mockImplementation(() => Promise.resolve());
    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [],
      },
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(wrapper.text()).toContain("Tidak ada data pengguna ditemukan.");
  });

  it("should show loading indicator while users are being fetched", async () => {
    let resolveLoad;
    const pendingPromise = new Promise((resolve) => {
      resolveLoad = resolve;
    });

    vi.spyOn(usersStore, "asyncSetUsers").mockReturnValue(pendingPromise);

    const { wrapper } = renderWithProviders(UsersPage, {
      preloadedState: {
        users: [],
      },
    });

    // loading is true while promise is pending and filteredUsers is empty
    expect(wrapper.text()).toContain("Memuat daftar pengguna...");

    resolveLoad();
    await pendingPromise;
    await new Promise((r) => setTimeout(r, 10));

    expect(wrapper.text()).not.toContain("Memuat daftar pengguna...");
  });
});
