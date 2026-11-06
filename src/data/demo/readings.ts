import { metricDictionary } from './metrics.ts'
import { getQualityOverride, isEquipmentOffline, loadPeaks } from './scenarios.ts'
import { sites } from './sites.ts'
import { METRIC_IDS } from './types.ts'
import type { Measurement, MetricId, SiteId } from './types.ts'

export const HISTORY_START_UTC = '2026-10-30T00:00:00.000Z'
export const HISTORY_DAYS = 7
export const INTERVAL_MINUTES = 60

const SOLAR_PROFILE = [0, 0, 0, 0, 0, 0, 0.02, 0.10, 0.25, 0.45, 0.65, 0.80, 0.90, 0.85, 0.73, 0.53, 0.31, 0.08, 0, 0, 0, 0, 0, 0] as const
const WEATHER_FACTOR = [0.80, 0.92, 0.98, 0.66, 0.94, 0.85, 0.90] as const
const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Демо-генератор возвращает только сущности Measurement из DATA_MODEL.md.
 * Мощность — средняя за час; энергия — интеграл за 1 час.
 * Батареи простаивают: фиксированный SOC, заряда/разряда нет.
 */
function buildSiteMeasurements(siteId: SiteId): Measurement[] {
  const output: Measurement[] = []
  const start = Date.parse(HISTORY_START_UTC)
  const isAstra = siteId === 'site-astra'
  const peakPvKw = isAstra ? 22 : 14
  const limitKw = isAstra ? 15 : 12
  const batterySoc = isAstra ? 58 : 18

  for (let index = 0; index < HISTORY_DAYS * 24; index += 1) {
    const hour = index % 24
    const day = Math.floor(index / 24)
    const timestamp = new Date(start + index * INTERVAL_MINUTES * 60000).toISOString()

    const evPowerKw = isAstra
      ? (hour === 18 || hour === 19 ? 5.2 : 0)
      : (hour === 19 || hour === 20 ? 4.6 : 0)
    const offlineEv = !isAstra && isEquipmentOffline('lumen-charger', timestamp)
    const daytimeKw = (hour >= 8 && hour <= 17) ? (isAstra ? 3.0 : 2.3) : 0
    const eveningKw = (hour >= 18 && hour <= 21) ? (isAstra ? 2.7 : 3.0) : 0
    const baseKw = isAstra ? 7.6 : 5.3
    const spikeKw = loadPeaks.find((s) => s.siteId === siteId && s.timestamp === timestamp)?.extraPowerKw ?? 0
    const consumptionKw = round2(baseKw + daytimeKw + eveningKw + (offlineEv ? 0 : evPowerKw) + spikeKw + day % 3 * 0.2)

    const inverterLimitKw = isAstra
      ? 11 + (isEquipmentOffline('astra-inv-2', timestamp) ? 0 : 11)
      : (isEquipmentOffline('lumen-inv', timestamp) ? 0 : 14)
    const generationKw = round2(Math.min(peakPvKw * SOLAR_PROFILE[hour] * WEATHER_FACTOR[day], inverterLimitKw))
    // В демо без аккумуляторных потоков сетевой экспорт = избыток PV.
    const gridExportKwh = round2(Math.max(0, generationKw - consumptionKw))

    const values: Record<MetricId, number> = {
      consumption_power: consumptionKw,
      generation_power: generationKw,
      consumption_energy: consumptionKw, // 1 час × средняя мощность
      generation_energy: generationKw,
      grid_export_energy: gridExportKwh,
      battery_soc: batterySoc,
      power_limit: limitKw,
    }

    for (const metric of METRIC_IDS) {
      const quality = getQualityOverride(siteId, metric, timestamp) ?? 'simulated'
      output.push({
        id: `measurement-${siteId}-${index.toString().padStart(3, '0')}-${metric}`,
        siteId,
        metric,
        value: quality === 'missing' ? null : values[metric],
        unit: metricDictionary[metric].unit,
        timestamp,
        quality,
      })
    }
  }
  return output
}

/** 2 × 7 × 24 × 7 = 2352 Measurement. */
export const measurements: readonly Measurement[] = sites.flatMap((site) => buildSiteMeasurements(site.id))
