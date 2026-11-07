
import type {
  User,
  UserRole,
  Site,
} from "../types";

// ==========================================
// 1. СПИСОК ВОЗМОЖНЫХ ДЕЙСТВИЙ
// ==========================================

export type Permission =
  | "view_platform_overview"
  | "view_dashboard"
  | "view_measurements"
  | "view_events"
  | "view_services"
  | "view_history"
  | "compare_objects"
  | "acknowledge_events"
  | "change_limits"
  | "manage_operating_modes"
  | "manage_maintenance"
  | "add_prepared_object"
  | "add_asset"
  | "manage_service_catalog"
  | "connect_services"
  | "disconnect_services"
  | "configure_service";

// ==========================================
// 2. ПРАВА ЧЕТЫРЁХ РОЛЕЙ
// ==========================================

export const ROLE_PERMISSIONS: Record<
  UserRole,
  readonly Permission[]
> = {
  platform_admin: [
    "view_platform_overview",
    "view_dashboard",
    "view_measurements",
    "view_events",
    "view_services",
    "view_history",
    "compare_objects",
    "acknowledge_events",
    "change_limits",
    "manage_operating_modes",
    "manage_maintenance",
    "add_prepared_object",
    "add_asset",
    "manage_service_catalog",
    "connect_services",
    "disconnect_services",
    "configure_service",
  ],

  portfolio_owner: [
    "view_dashboard",
    "view_measurements",
    "view_events",
    "view_services",
    "view_history",
    "compare_objects",
  ],

  hub_operator: [
    "view_dashboard",
    "view_measurements",
    "view_events",
    "view_services",
    "view_history",
  ],

  building_owner: [
    "view_dashboard",
    "view_measurements",
    "view_events",
    "view_services",
    "view_history",
  ],
};

// ==========================================
// 3. ПРОВЕРКА ПРАВ РОЛИ
// ==========================================

export function hasRolePermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// ==========================================
// 4. ПРОВЕРКА ДОСТУПА К SITE
// ==========================================

export function canAccessSite(
  user: User,
  site: Site
): boolean {
  // Администратор видит все объекты.
  if (user.role === "platform_admin") {
    return true;
  }

  // Владелец портфеля видит только свой портфель.
  if (user.role === "portfolio_owner") {
    return user.portfolioIds?.includes(site.portfolioId) === true;
  }

  // Оператор видит только назначенные объекты.
  if (user.role === "hub_operator") {
    return user.siteIds?.includes(site.id) === true;
  }

  // Собственник видит только назначенные объекты.
  if (user.role === "building_owner") {
    return user.siteIds?.includes(site.id) === true;
  }

  return false;
}

// ==========================================
// 5. ПРОВЕРКА ВОЗМОЖНОСТИ ДЕЙСТВИЯ
// ==========================================

export function canPerformOnSite(
  user: User,
  permission: Permission,
  site: Site
): boolean {
  return (
    canAccessSite(user, site) &&
    hasRolePermission(user.role, permission)
  );
}

// ==========================================
// 6. ПРОВЕРКА РЕЖИМА ТОЛЬКО ДЛЯ ЧТЕНИЯ
// ==========================================

export function isReadOnlyRole(
  role: UserRole
): boolean {
  return (
    role === "portfolio_owner" ||
    role === "hub_operator" ||
    role === "building_owner"
  );
}
