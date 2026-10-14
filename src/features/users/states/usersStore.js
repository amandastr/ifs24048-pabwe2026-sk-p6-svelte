import { writable } from "svelte/store";
import userApi from "../api/userApi";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

function createUsersStore() {
  const initial = {
    users: [],
    user: null,
    profile: null,
    isProfile: false,
    isChangeProfile: false,
    isChangeProfilePhoto: false,
    isChangeProfilePassword: false,
  };

  let currentState = { ...initial };
  const innerStore = writable(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get users() { return currentState.users; },
    get user() { return currentState.user; },
    get profile() { return currentState.profile; },
    get isProfile() { return currentState.isProfile; },
    get isChangeProfile() { return currentState.isChangeProfile; },
    get isChangeProfilePhoto() { return currentState.isChangeProfilePhoto; },
    get isChangeProfilePassword() { return currentState.isChangeProfilePassword; },
    get $state() { return currentState; },
    reset(state = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setUsers(users) {
      innerStore.update((s) => ({ ...s, users }));
    },
    setUser(user) {
      innerStore.update((s) => ({ ...s, user }));
    },
    setProfile(profile) {
      innerStore.update((s) => ({ ...s, profile }));
    },
    setIsProfile(status) {
      innerStore.update((s) => ({ ...s, isProfile: status }));
    },
    setIsChangeProfile(status) {
      innerStore.update((s) => ({ ...s, isChangeProfile: status }));
    },
    setIsChangeProfilePhoto(status) {
      innerStore.update((s) => ({ ...s, isChangeProfilePhoto: status }));
    },
    setIsChangeProfilePassword(status) {
      innerStore.update((s) => ({ ...s, isChangeProfilePassword: status }));
    },
    async asyncSetUsers() {
      try {
        const users = await userApi.getUsers();
        this.setUsers(users);
      } catch {
        this.setUsers([]);
      }
    },
    async asyncSetUserById(userId) {
      try {
        const user = await userApi.getUserById(userId);
        this.setUser(user);
      } catch {
        this.setUser(null);
      }
    },
    async asyncSetProfile() {
      try {
        const profile = await userApi.getProfile();
        this.setProfile(profile);
      } catch {
        this.setProfile(null);
      } finally {
        this.setIsProfile(true);
      }
    },
    async asyncPutProfile(name, email) {
      try {
        const profile = await userApi.putProfile(name, email);
        this.setProfile(profile);
        showSuccessDialog("Profil berhasil diperbarui!");
        this.setIsChangeProfile(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeProfile(false);
      }
    },
    async asyncPostProfilePhoto(photo) {
      try {
        const message = await userApi.postProfilePhoto(photo);
        showSuccessDialog(message || "Foto profil berhasil diperbarui!");
        const profile = await userApi.getProfile();
        this.setProfile(profile);
        this.setIsChangeProfilePhoto(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeProfilePhoto(false);
      }
    },
    async asyncPutProfilePassword(oldPassword, newPassword, newPasswordConfirmation) {
      try {
        const message = await userApi.putProfilePassword(oldPassword, newPassword, newPasswordConfirmation);
        showSuccessDialog(message || "Kata sandi berhasil diperbarui!");
        this.setIsChangeProfilePassword(true);
      } catch (error) {
        showErrorDialog(error.message);
        this.setIsChangeProfilePassword(false);
      }
    },
  };
}

export const usersStore = createUsersStore();
export const useUsersStore = () => usersStore;
export default usersStore;
