
import type {
  User,
  UserRole,
  EnergyObject,
} from "../types";

// Возможные действия пользователя
export type Permission =
  | "view_dashboard"
  | "view_measurements"
  | "view_events"
  | "compare_objects"
  | "acknowledge_events"
  | "manage_hub_settings"
  | "manage_services"
  | "manage_users"
  | "manage_platform";

// Права каждой роли
export const ROLE_PERMISSIONS: Record<
  UserRole,
  readonly Permission[]
> = {
  platform_admin: [
    "view_dashboard",
    "view_measurements",
    "view_events",
    "compare_objects",
    "acknowledge_events",
    "manage_hub_settings",
    "manage_services",
    "manage_users",
    "manage_platform",
  ],

  portfolio_owner: [
    "view_dashboard",
    "view_measurements",
    "view_events",
    "compare_objects",
  ],

  hub_operator: [
    "view_dashboard",
    "view_measurements",
    "view_events",
    "acknowledge_events",
    "manage_hub_settings",
  ],

  building_owner: [
    "view_dashboard",
    "view_measurements",
    "view_events",
  ],
};

// Проверка наличия определённого права
export function hasRolePermission(
  role: UserRole,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Проверка доступа пользователя к объекту
export function canAccessObject(
  user: User,
  object: EnergyObject
): boolean {
  // Администратор имеет доступ ко всем объектам
  if (user.role === "platform_admin") {
    return true;
  }

  // Владелец портфеля видит объекты своего портфеля
  if (user.role === "portfolio_owner") {
    return (
      object.portfolioId !== undefined &&
      user.portfolioIds?.includes(object.portfolioId) === true
    );
  }

  // Оператор и собственник видят назначенные им объекты
  return user.objectIds?.includes(object.id) === true;
}

// Комплексная проверка действия над объектом
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
