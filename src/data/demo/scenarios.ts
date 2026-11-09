import type { MetricId, MeasurementQuality, SiteId } from './types.ts'

/** Только сценарные константы: не изменяют DATA_MODEL.md. */
export const equipmentOutages = [
  { assetId: 'astra-inv-2', siteId: 'site-astra', start: '2026-11-01T12:00:00.000Z', end: '2026-11-01T14:00:00.000Z' },
  { assetId: 'lumen-inv', siteId: 'site-lumen', start: '2026-11-03T12:00:00.000Z', end: '2026-11-03T14:00:00.000Z' },
  { assetId: 'lumen-charger', siteId: 'site-lumen', start: '2026-11-04T19:00:00.000Z', end: '2026-11-04T20:00:00.000Z' },
] as const

export const loadPeaks: readonly { siteId: SiteId; timestamp: string; extraPowerKw: number }[] = [
  { siteId: 'site-astra', timestamp: '2026-10-31T19:00:00.000Z', extraPowerKw: 8.5 },
  { siteId: 'site-astra', timestamp: '2026-11-04T19:00:00.000Z', extraPowerKw: 10.2 },
  { siteId: 'site-lumen', timestamp: '2026-11-01T20:00:00.000Z', extraPowerKw: 5.8 },
  { siteId: 'site-lumen', timestamp: '2026-11-05T19:00:00.000Z', extraPowerKw: 6.3 },
]

export interface QualityOverride {
  siteId: SiteId
  metric: MetricId
  timestamp: string
  quality: MeasurementQuality
}

/** Пропуски всегда value:null; иные статусы сохраняют исходное числовое значение. */
export const qualityOverrides: readonly QualityOverride[] = [
  { siteId: 'site-astra', metric: 'grid_export_energy', timestamp: '2026-11-02T12:00:00.000Z', quality: 'missing' },
  { siteId: 'site-astra', metric: 'consumption_power', timestamp: '2026-11-02T10:00:00.000Z', quality: 'missing' },
  { siteId: 'site-astra', metric: 'consumption_energy', timestamp: '2026-11-02T10:00:00.000Z', quality: 'estimated' },
  { siteId: 'site-lumen', metric: 'generation_power', timestamp: '2026-11-04T09:00:00.000Z', quality: 'missing' },
  { siteId: 'site-lumen', metric: 'generation_energy', timestamp: '2026-11-04T09:00:00.000Z', quality: 'missing' },
  { siteId: 'site-lumen', metric: 'battery_soc', timestamp: '2026-11-05T05:00:00.000Z', quality: 'missing' },
  { siteId: 'site-lumen', metric: 'power_limit', timestamp: '2026-10-30T19:00:00.000Z', quality: 'missing' },
  { siteId: 'site-astra', metric: 'battery_soc', timestamp: '2026-11-03T04:00:00.000Z', quality: 'stale' },
  { siteId: 'site-lumen', metric: 'consumption_energy', timestamp: '2026-11-01T12:00:00.000Z', quality: 'estimated' },
  { siteId: 'site-lumen', metric: 'consumption_power', timestamp: '2026-11-01T12:00:00.000Z', quality: 'estimated' },
  { siteId: 'site-astra', metric: 'power_limit', timestamp: '2026-10-30T00:00:00.000Z', quality: 'complete' },
]

export function isEquipmentOffline(assetId: string, timestamp: string): boolean {
  return equipmentOutages.some((item) => item.assetId === assetId && item.start <= timestamp && timestamp < item.end)
}

export function getQualityOverride(siteId: SiteId, metric: MetricId, timestamp: string): MeasurementQuality | undefined {
  return qualityOverrides.find((item) => item.siteId === siteId && item.metric === metric && item.timestamp === timestamp)?.quality
}