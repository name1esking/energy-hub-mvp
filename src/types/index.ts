
/**
 * ENERGY HUB
 * Общие типы данных приложения
 * Version: 0.1
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
  objectIds?: string[];
}

// ==========================================
// 2. ПОРТФЕЛИ
// ==========================================

export interface Portfolio {
  id: string;
  name: string;
  description?: string;
  objectIds: string[];
}

// ==========================================
// 3. ЭНЕРГЕТИЧЕСКИЕ ОБЪЕКТЫ
// ==========================================

export type EnergyObjectType =
  | "building"
  | "industrial"
  | "energy_hub"
  | "other";

export type EnergyObjectStatus =
  | "active"
  | "inactive"
  | "maintenance"
  | "unknown";

export interface EnergyObject {
  id: string;
  name: string;
  type: EnergyObjectType;
  address?: string;
  timezone: string;
  status: EnergyObjectStatus;
  portfolioId?: string;
  assetIds: string[];
}

// ==========================================
// 4. ОБОРУДОВАНИЕ
// ==========================================

export type AssetType =
  | "solar_panel"
  | "inverter"
  | "battery"
  | "meter"
  | "ev_charger"
  | "grid_connection"
  | "load"
  | "other";

export type AssetStatus =
  | "online"
  | "offline"
  | "warning"
  | "maintenance"
  | "unknown";

export interface Asset {
  id: string;
  objectId: string;
  name: string;
  type: AssetType;
  manufacturer?: string;
  status: AssetStatus;
}

// ==========================================
// 5. ЭНЕРГЕТИЧЕСКИЕ ПОКАЗАТЕЛИ
// ==========================================

export type MeasurementMetric =
  | "power"
  | "energy"
  | "generation"
  | "consumption"
  | "grid_import"
  | "grid_export"
  | "battery_soc";

export type MeasurementUnit =
  | "kW"
  | "kWh"
  | "%";

export type DataQualityStatus =
  | "valid"
  | "missing"
  | "suspicious"
  | "invalid";

export interface Measurement {
  id: string;
  objectId: string;
  assetId?: string;
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
  | "new"
  | "acknowledged"
  | "resolved";

export interface EnergyEvent {
  id: string;
  objectId: string;
  assetId?: string;
  title: string;
  description: string;
  severity: EventSeverity;
  createdAt: string;
  status: EventStatus;
}

// ==========================================
// 7. ЭНЕРГЕТИЧЕСКИЕ СЕРВИСЫ
// ==========================================

export type ServiceType =
  | "peak_shaving"
  | "pv_self_consumption";

export type ServiceStatus =
  | "connected"
  | "disconnected"
  | "error"
  | "configuring";

export interface EnergyService {
  id: string;
  type: ServiceType;
  objectId: string;
  status: ServiceStatus;
  configuration: Record<string, unknown>;
  connectedAt?: string;
}
