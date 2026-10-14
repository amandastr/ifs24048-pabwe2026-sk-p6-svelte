import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { router, navigate, currentPath, currentRoute, matchPath, resolveRoute } from "./router";

describe("router", () => {
  beforeEach(() => {
    navigate("/");
  });

  it("should navigate to /auth/login and derive correct route", () => {
    router.push("/auth/login");
    expect(get(currentPath)).toBe("/auth/login");
    const route = get(currentRoute);
    expect(route).toEqual({
      name: "login",
      path: "/auth/login",
      params: {},
      layout: "auth",
    });
  });

  it("should replace route to /auth/register and derive correct route", () => {
    router.replace("/auth/register");
    expect(get(currentPath)).toBe("/auth/register");
    const route = get(currentRoute);
    expect(route).toEqual({
      name: "register",
      path: "/auth/register",
      params: {},
      layout: "auth",
    });
  });

  it("should derive home route for / and empty string", () => {
    navigate("/");
    expect(get(currentRoute)).toEqual({
      name: "home",
      path: "/",
      params: {},
      layout: "linktree",
    });

    currentPath.set("");
    expect(get(currentRoute)).toEqual({
      name: "home",
      path: "/",
      params: {},
      layout: "linktree",
    });
  });

  it("should derive users and profile routes", () => {
    navigate("/users");
    expect(get(currentRoute)).toEqual({
      name: "users",
      path: "/users",
      params: {},
      layout: "linktree",
    });

    navigate("/profile");
    expect(get(currentRoute)).toEqual({
      name: "profile",
      path: "/profile",
      params: {},
      layout: "linktree",
    });
  });

  it("should derive linktree-detail route with linkTreeId param", () => {
    navigate("/link-trees/abc-123");
    expect(get(currentRoute)).toEqual({
      name: "linktree-detail",
      path: "/link-trees/abc-123",
      params: { linkTreeId: "abc-123" },
      layout: "linktree",
    });
  });

  it("should derive not-found route for unmatched paths", () => {
    navigate("/random-route");
    expect(get(currentRoute)).toEqual({
      name: "not-found",
      path: "/random-route",
      params: {},
      layout: "none",
    });
  });

  it("should handle popstate event", () => {
    window.history.pushState({}, "", "/users");
    window.dispatchEvent(new PopStateEvent("popstate"));
    expect(get(currentPath)).toBe("/users");
  });

  it("should match parameterized path using matchPath helper", () => {
    const match = matchPath("/link-trees/:linkTreeId", "/link-trees/42");
    expect(match).toEqual({ matches: true, params: { linkTreeId: "42" } });
  });

  it("should return null for mismatched segment counts", () => {
    const match = matchPath("/link-trees/:linkTreeId", "/link-trees/42/extra");
    expect(match).toBeNull();
  });

  it("should return null when static segments do not match", () => {
    const match = matchPath("/link-trees/:linkTreeId", "/users/42");
    expect(match).toBeNull();
  });

  it("should match exact path directly without params", () => {
    const match = matchPath("/users", "/users");
    expect(match).toEqual({ matches: true, params: {} });
  });

  it("should support custom routesList in resolveRoute", () => {
    const customRoutes = [
      { pattern: "/items/:id", name: "item-detail", layout: "custom" },
    ];
    const resolved = resolveRoute("/items/99", customRoutes);
    expect(resolved).toEqual({
      name: "item-detail",
      path: "/items/99",
      params: { id: "99" },
      layout: "custom",
    });
  });

  it("should handle empty string path in matchPath", () => {
    const match = matchPath("/", "");
    expect(match).toEqual({ matches: true, params: {} });
  });
});


