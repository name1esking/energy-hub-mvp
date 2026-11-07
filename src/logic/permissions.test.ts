import { describe, it, expect } from "vitest";

import {
  canAccessSite,
  canPerformOnSite,
  hasRolePermission,
  isReadOnlyRole,
} from "./permissions";

import type { Permission } from "./permissions";

import type {
  Site,
  User,
  UserRole,
} from "../types";

const siteA: Site = {
  id: "site-1",
  name: "Industrial Hub",
  location: "Moscow",
  type: "industrial",
  portfolioId: "portfolio-1",
};

const siteB: Site = {
  id: "site-2",
  name: "Office Hub",
  location: "Kazan",
  type: "office",
  portfolioId: "portfolio-2",
};

function makeUser(
  role: UserRole,
  overrides: Partial<User> = {}
): User {
  return {
    id: "user-1",
    name: "Test User",
    role,
    ...overrides,
  };
}

describe("Permissions", () => {

  it("admin имеет доступ ко всем Site", () => {
    const user = makeUser("platform_admin");

    expect(canAccessSite(user, siteA)).toBe(true);
    expect(canAccessSite(user, siteB)).toBe(true);
  });

  it("portfolio_owner видит только свой Portfolio", () => {
    const user = makeUser("portfolio_owner", {
      portfolioIds: ["portfolio-1"],
    });

    expect(canAccessSite(user, siteA)).toBe(true);
    expect(canAccessSite(user, siteB)).toBe(false);
  });

  it("hub_operator видит только назначенные Site", () => {
    const user = makeUser("hub_operator", {
      siteIds: ["site-2"],
    });

    expect(canAccessSite(user, siteA)).toBe(false);
    expect(canAccessSite(user, siteB)).toBe(true);
  });

  it("building_owner видит назначенный Site независимо от типа", () => {
    const user = makeUser("building_owner", {
      siteIds: ["site-1"],
    });

    expect(canAccessSite(user, siteA)).toBe(true);
    expect(canAccessSite(user, siteB)).toBe(false);
  });

  it("hub_operator не может выполнять управляющие действия", () => {
    const user = makeUser("hub_operator", {
      siteIds: ["site-1"],
    });

    const forbidden: Permission[] = [
      "acknowledge_events",
      "change_limits",
      "manage_operating_modes",
      "manage_maintenance",
      "add_prepared_object",
      "add_asset",
      "connect_services",
      "disconnect_services",
      "configure_service",
    ];

    for (const permission of forbidden) {
      expect(
        canPerformOnSite(user, permission, siteA)
      ).toBe(false);
    }
  });

  it("hub_operator может просматривать Dashboard", () => {
    const user = makeUser("hub_operator", {
      siteIds: ["site-1"],
    });

    expect(
      canPerformOnSite(user, "view_dashboard", siteA)
    ).toBe(true);
  });

  it("пользователь не может действовать на чужом Site", () => {
    const user = makeUser("hub_operator", {
      siteIds: ["site-1"],
    });

    expect(
      canPerformOnSite(user, "view_dashboard", siteB)
    ).toBe(false);
  });

  it("все три пользовательские роли работают в read-only", () => {
    const roles: UserRole[] = [
      "portfolio_owner",
      "hub_operator",
      "building_owner",
    ];

    for (const role of roles) {
      expect(isReadOnlyRole(role)).toBe(true);
    }

    expect(isReadOnlyRole("platform_admin")).toBe(false);
  });

  it("admin сохраняет административные разрешения", () => {
    const user = makeUser("platform_admin");

    expect(
      hasRolePermission(user.role, "change_limits")
    ).toBe(true);

    expect(
      hasRolePermission(user.role, "manage_operating_modes")
    ).toBe(true);
  });

});