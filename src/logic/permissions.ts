
import type {
  User,
  UserRole,
  EnergyObject,
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
    "acknowledge_events",
    "change_limits",
    "manage_operating_modes",
    "manage_maintenance",
    "add_prepared_object",
    "add_asset",
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
// 3. ПРОВЕРКА ПРАВ
// ==========================================

export function hasRolePermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// ==========================================
// 4. ПРОВЕРКА ДОСТУПА К ОБЪЕКТУ
// ==========================================

export function canAccessObject(
  user: User,
  object: EnergyObject
): boolean {

  // Администратор видит всю платформу
  if (user.role === "platform_admin") {
    return true;
  }

  // Владелец портфеля видит свои объекты
  if (user.role === "portfolio_owner") {
    return (
      object.portfolioId !== undefined &&
      user.portfolioIds?.includes(object.portfolioId) === true
    );
  }

  // Оператор видит только назначенные ему объекты
  if (user.role === "hub_operator") {
    return user.objectIds?.includes(object.id) === true;
  }

  // Собственник видит только своё здание
  if (user.role === "building_owner") {
    return (
      object.type === "building" &&
      user.objectIds?.includes(object.id) === true
    );
  }

  return false;
}

// ==========================================
// 5. КОМПЛЕКСНАЯ ПРОВЕРКА ДЕЙСТВИЯ
// ==========================================

export function canPerformOnObject(
  user: User,
  permission: Permission,
  object: EnergyObject
): boolean {
  return (
    hasRolePermission(user.role, permission) &&
    canAccessObject(user, object)
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
    role === "building_owner"
  );
}
