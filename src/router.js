import { writable, derived } from "svelte/store";

export const currentPath = writable(window.location.pathname);

window.addEventListener("popstate", () => {
  currentPath.set(window.location.pathname);
});

export function navigate(to, options = {}) {
  if (options.replace) {
    window.history.replaceState({}, "", to);
  } else {
    window.history.pushState({}, "", to);
  }
  currentPath.set(to);
}

export const router = {
  push: (to) => navigate(to),
  replace: (to) => navigate(to, { replace: true }),
};

export const routes = [
  { pattern: "/auth/login", name: "login", layout: "auth" },
  { pattern: "/auth/register", name: "register", layout: "auth" },
  { pattern: "/", name: "home", layout: "linktree" },
  { pattern: "/users", name: "users", layout: "linktree" },
  { pattern: "/profile", name: "profile", layout: "linktree" },
  { pattern: "/link-trees/:linkTreeId", name: "linktree-detail", layout: "linktree" },
];

export function matchPath(pattern, path) {
  const cleanPath = path === "" ? "/" : path;
  if (pattern === cleanPath) {
    return { matches: true, params: {} };
  }

  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = cleanPath.split("/").filter(Boolean);

  if (patternSegments.length !== pathSegments.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternSegments.length; i++) {
    const pSeg = patternSegments[i];
    const aSeg = pathSegments[i];

    if (pSeg.startsWith(":")) {
      params[pSeg.slice(1)] = aSeg;
    } else if (pSeg !== aSeg) {
      return null;
    }
  }

  return { matches: true, params };
}

export function resolveRoute(path, routesList = routes) {
  const cleanPath = path === "" ? "/" : path;
  for (const route of routesList) {
    const match = matchPath(route.pattern, cleanPath);
    if (match) {
      return {
        name: route.name,
        path: cleanPath,
        params: match.params,
        layout: route.layout,
      };
    }
  }

  return {
    name: "not-found",
    path: cleanPath,
    params: {},
    layout: "none",
  };
}

export const currentRoute = derived(currentPath, ($path) => resolveRoute($path));

export default router;
