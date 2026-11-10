/**
 * ЛОКАЛЬНЫЕ типы fixture-данных по DATA_MODEL.md v0.1.
 * НЕ являются общим контрактом проекта и не должны подменять типы Tech Lead.
 * Поля и enum, не закреплённые в DATA_MODEL.md, помечены как provisional.
 */
export type SiteId = 'site-astra' | 'site-lumen'
export type AssetType = 'solar_panel' | 'battery' | 'inverter' | 'meter' | 'charger' | 'load'
export type AssetStatus = 'online' | 'offline' | 'warning' | 'error'
export type MeasurementQuality = 'complete' | 'missing' | 'stale' | 'estimated' | 'simulated'
export type EventSeverity = 'info' | 'warning' | 'critical'
/** PROVISIONAL: DATA_MODEL.md содержит status, но не задаёт варианты. */
export type EventStatus = 'open' | 'resolved'
export type Unit = 'кВт' | 'кВт·ч' | '%'

/** PROVISIONAL: коды metric не утверждены Tech Lead; единицы — строго по DATA_MODEL.md. */
export const METRIC_IDS = [
  'consumption_power',
  'generation_power',
  'consumption_energy',
  'generation_energy',
  'grid_export_energy',
  'battery_soc',
  'power_limit',
] as const
export type MetricId = (typeof METRIC_IDS)[number]

export interface Portfolio {
  id: string
  name: string
}

export interface Site {
  id: SiteId
  name: string
  /** PROVISIONAL имя поля; DATA_MODEL.md требует условное местоположение. */
  location: string
  /** PROVISIONAL значения; DATA_MODEL.md не задаёт справочник типов объектов. */
  type: 'industrial' | 'office'
  /** PROVISIONAL связь Site -> Portfolio. */
  portfolioId: string
}

export type AssetParameter = string | number | boolean | readonly string[]
export interface Asset {
  id: string
  name: string
  type: AssetType
  siteId: SiteId
  status: AssetStatus
  /** PROVISIONAL вложенная структура характеристик, DATA_MODEL.md не фиксирует её имя. */
  parameters: Readonly<Record<string, AssetParameter>>
}

/** Поля точно соответствуют разделу Measurement DATA_MODEL.md v0.1. */
export interface Measurement {
  id: string
  siteId: SiteId
  metric: MetricId
  value: number | null
  unit: Unit
  /** ISO 8601 UTC, НАЧАЛО часового интервала для энергии. */
  timestamp: string
  quality: MeasurementQuality
}

/** Поля точно соответствуют разделу Event DATA_MODEL.md v0.1. */
export interface Event {
  id: string
  siteId: SiteId
  title: string
  description: string
  severity: EventSeverity
  status: EventStatus
  timestamp: string
}

/** Derived, не новая сущность Measurement и не часть общего контракта. */
export interface DataQualitySummary {
  siteId: SiteId
  total: number
  available: number
  missing: number
  stale: number
  estimated: number
  simulated: number
  complete: number
  completenessPercent: number
  qualityScorePercent: number
}

export interface DailyEnergySummary {
  siteId: SiteId
  date: string
  consumptionKwh: number | null
  generationKwh: number | null
  gridExportKwh: number | null
  /** Вычислен, НЕ измерен: в DATA_MODEL.md нет импорта из сети. */
  derivedGridImportKwh: number | null
  solarSelfConsumedKwh: number | null
  solarSelfConsumptionPercent: number | null
}
