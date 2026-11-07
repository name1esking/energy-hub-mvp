
/**
 * ENERGY HUB
 * Общие типы данных приложения
 * Version: 0.2
 *
 * Основа: DATA_MODEL.md v0.1
 * и согласованные решения Tech Lead.
 */

// ==========================================
// 1. ПОЛЬЗОВАТЕЛИ И РОЛИ
// ==========================================

export type UserRole =
  | "platform_admin"
  | "portfolio_owner"
  | "hub_operator"
  | "building_owner";

export interface User {
  id: string;
  name: string;
  email?: string;
  role: UserRole;
  portfolioIds?: string[];
  siteIds?: string[];
}

// ==========================================
// 2. ПОРТФЕЛИ
// ==========================================

export interface Portfolio {
  id: string;
  name: string;
}

// ==========================================
// 3. ЭНЕРГЕТИЧЕСКИЕ ОБЪЕКТЫ (SITE)
// ==========================================

/**
 * Предварительный справочник типов объектов.
 * Требует окончательного утверждения Tech Lead.
 */
export type SiteType =
  | "industrial"
  | "office";

export interface Site {
  id: string;
  name: string;
  location: string;
  type: SiteType;
  portfolioId: string;
}

// ==========================================
// 4. ОБОРУДОВАНИЕ
// ==========================================

export type AssetType =
  | "solar_panel"
  | "battery"
  | "inverter"
  | "meter"
  | "charger"
  | "load";

export type AssetStatus =
  | "online"
  | "offline"
  | "warning"
  | "error";

/**
 * Параметры оборудования.
 * Конкретный состав зависит от типа оборудования.
 */
export interface Asset {
  id: string;
  siteId: string;
  name: string;
  type: AssetType;
  manufacturer?: string;
  status: AssetStatus;
  parameters?: Record<string, unknown>;
}

// ==========================================
// 5. ЭНЕРГЕТИЧЕСКИЕ ПОКАЗАТЕЛИ
// ==========================================

export type MeasurementMetric =
  | "consumption_power"
  | "generation_power"
  | "consumption_energy"
  | "generation_energy"
  | "grid_export_energy"
  | "battery_soc"
  | "power_limit";

export type MeasurementUnit =
  | "кВт"
  | "кВт·ч"
  | "%";

/**
 * Статусы качества исходных данных.
 * Все пять статусов необходимо сохранять.
 */
export type DataQualityStatus =
  | "complete"
  | "missing"
  | "stale"
  | "estimated"
  | "simulated";

export interface Measurement {
  id: string;
  siteId: string;
  metric: MeasurementMetric;
  value: number | null;
  unit: MeasurementUnit;
  timestamp: string;
  quality: DataQualityStatus;
}

// ==========================================
// 6. СОБЫТИЯ И УВЕДОМЛЕНИЯ
// ==========================================

export type EventSeverity =
  | "info"
  | "warning"
  | "critical";

export type EventStatus =
  | "open"
  | "resolved";

export interface Event {
  id: string;
  siteId: string;
  title: string;
  description: string;
  severity: EventSeverity;
  status: EventStatus;
  timestamp: string;
}

// ==========================================
// 7. ЭНЕРГЕТИЧЕСКИЕ СЕРВИСЫ
// ==========================================

export type ServiceType =
  | "peak_shaving"
  | "pv_self_consumption";

/**
 * Предварительные статусы сервиса.
 * Требуют отдельного согласования.
 */
export type ServiceInstanceStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "configuring";

/**
 * Предварительный контракт ServiceInstance.
 * Не означает наличие реальных подключённых сервисов.
 */
export interface ServiceInstance {
  id: string;
  siteId: string;
  type: ServiceType;
  status: ServiceInstanceStatus;
  configuration: Record<string, unknown>;
  connectedAt?: string;
}
