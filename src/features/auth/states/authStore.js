import { writable } from "svelte/store";
import authApi from "../api/authApi";
import apiHelper from "../../../helpers/apiHelper";
import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

function createAuthStore() {
  const initial = {
    isAuthLogin: false,
    isAuthRegister: false,
    isAuthLogout: false,
  };

  let currentState = { ...initial };
  const innerStore = writable(currentState);
  innerStore.subscribe((val) => {
    currentState = val;
  });

  return {
    subscribe: innerStore.subscribe,
    get isAuthLogin() {
      return currentState.isAuthLogin;
    },
    get isAuthRegister() {
      return currentState.isAuthRegister;
    },
    get isAuthLogout() {
      return currentState.isAuthLogout;
    },
    get $state() {
      return currentState;
    },
    reset(state = initial) {
      innerStore.set({ ...initial, ...state });
    },
    setIsAuthLogin(value) {
      innerStore.update((s) => ({ ...s, isAuthLogin: value }));
    },
    setIsAuthRegister(value) {
      innerStore.update((s) => ({ ...s, isAuthRegister: value }));
    },
    setIsAuthLogout(value) {
      innerStore.update((s) => ({ ...s, isAuthLogout: value }));
    },
    async asyncSetIsAuthLogin(email, password) {
      try {
        const data = await authApi.postLogin(email, password);
        apiHelper.putAccessToken(data.token);
        this.setIsAuthLogin(true);
      } catch (error) {
        this.setIsAuthLogin(false);
        showErrorDialog(error.message);
      }
    },
    async asyncSetIsAuthRegister(name, email, password) {
      try {
        const message = await authApi.postRegister(name, email, password);
        this.setIsAuthRegister(true);
        showSuccessDialog(message);
      } catch (error) {
        this.setIsAuthRegister(false);
        showErrorDialog(error.message);
      }
    },
    async asyncSetIsAuthLogout() {
      try {
        await authApi.postLogout();
      } catch {
        // Still proceed with clearing token locally even if server error
      } finally {
        apiHelper.putAccessToken("");
        this.setIsAuthLogout(true);
      }
    },
  };
}

export const authStore = createAuthStore();
export const useAuthStore = () => authStore;
export default authStore;
