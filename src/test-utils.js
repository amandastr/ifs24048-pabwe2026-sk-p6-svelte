import { render } from "@testing-library/svelte";
import { authStore } from "./features/auth/states/authStore";
import { usersStore } from "./features/users/states/usersStore";
import { linkTreesStore } from "./features/linktrees/states/linkTreesStore";
import { router, navigate, currentPath } from "./router";

export function setupMockStores(initialState = {}) {
  authStore.reset();
  usersStore.reset();
  linkTreesStore.reset();

  Object.entries(initialState).forEach(([key, val]) => {
    if (key in authStore.$state) {
      authStore.$state[key] = val;
      if (typeof authStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] === "function") {
        authStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](val);
      }
    }
    if (key in usersStore.$state) {
      usersStore.$state[key] = val;
      if (typeof usersStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] === "function") {
        usersStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](val);
      }
    }
    if (key in linkTreesStore.$state) {
      linkTreesStore.$state[key] = val;
      if (typeof linkTreesStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`] === "function") {
        linkTreesStore[`set${key.charAt(0).toUpperCase() + key.slice(1)}`](val);
      }
    }
  });

  return { authStore, usersStore, linkTreesStore };
}

export function createMockPinia(initialState = {}) {
  return setupMockStores(initialState);
}

export function renderWithProviders(
  component,
  {
    props = {},
    preloadedState = {},
    route = "/",
    ...options
  } = {}
) {
  const { authStore: a, usersStore: u, linkTreesStore: t } = setupMockStores(preloadedState);
  if (route) {
    navigate(route);
  }

  const result = render(component, { props, ...options });

  const createWrapperElement = (el) => {
    if (!el) {
      return {
        exists: () => false,
        element: null,
        text: () => "",
        attributes: () => ({}),
        classes: () => [],
        trigger: async () => {},
        setValue: async () => {},
      };
    }
    return {
      exists: () => true,
      element: el,
      text: () => el.textContent || "",
      attributes: (name) => (name ? el.getAttribute(name) : {}),
      classes: (cls) => (cls ? el.classList.contains(cls) : Array.from(el.classList)),
      trigger: async (event, eventInit = {}) => {
        if (event === "click") {
          el.click();
        } else if (event === "submit") {
          el.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
        } else if (event.startsWith("key")) {
          el.dispatchEvent(new KeyboardEvent(event, { bubbles: true, ...eventInit }));
        } else {
          el.dispatchEvent(new Event(event, { bubbles: true, ...eventInit }));
        }
      },
      setValue: async (val) => {
        el.value = val;
        el.dispatchEvent(new Event("input", { bubbles: true }));
        el.dispatchEvent(new Event("change", { bubbles: true }));
      },
      find: (sel) => createWrapperElement(el.querySelector(sel)),
      findAll: (sel) => Array.from(el.querySelectorAll(sel)).map(createWrapperElement),
    };
  };

  const wrapper = {
    exists: () => !!result.container.firstElementChild,
    element: result.container.firstElementChild,
    text: () => result.container.textContent || "",
    html: () => result.container.innerHTML,
    find: (selector) => createWrapperElement(result.container.querySelector(selector)),
    findAll: (selector) =>
      Array.from(result.container.querySelectorAll(selector)).map(createWrapperElement),
    unmount: result.unmount,
  };

  return {
    ...result,
    wrapper,
    authStore: a,
    usersStore: u,
    linkTreesStore: t,
    router,
    currentPath,
  };
}
