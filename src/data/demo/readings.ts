
import { metricDictionary } from './metrics.ts'
import { getQualityOverride, isEquipmentOffline, loadPeaks } from './scenarios.ts'
import { sites } from './sites.ts'
import { METRIC_IDS } from './types.ts'
import type { Measurement, MetricId, SiteId } from './types.ts'

export const HISTORY_START_UTC = '2026-10-11T00:00:00.000Z'
export const HISTORY_DAYS = 30
export const INTERVAL_MINUTES = 60

const SOLAR_PROFILE = [
  0, 0, 0, 0, 0, 0, 0.02, 0.10,
  0.25, 0.45, 0.65, 0.80, 0.90, 0.85,
  0.73, 0.53, 0.31, 0.08, 0, 0, 0, 0, 0, 0
] as const

const WEATHER_FACTOR = [0.80, 0.92, 0.98, 0.66, 0.94, 0.85, 0.90] as const

const round2 = (n: number): number =>
  Math.round((n + Number.EPSILON) * 100) / 100

/**
 * Генерация демонстрационных измерений.
 * 30 дней истории с часовым интервалом.
 * Погодный профиль повторяется каждые 7 дней.
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

    const timestamp = new Date(
      start + index * INTERVAL_MINUTES * 60000
    ).toISOString()

    const evPowerKw = isAstra
      ? (hour === 18 || hour === 19 ? 5.2 : 0)
      : (hour === 19 || hour === 20 ? 4.6 : 0)

    const offlineEv =
      !isAstra && isEquipmentOffline('lumen-charger', timestamp)

    const daytimeKw =
      hour >= 8 && hour <= 17
        ? (isAstra ? 3.0 : 2.3)
        : 0

    const eveningKw =
      hour >= 18 && hour <= 21
        ? (isAstra ? 2.7 : 3.0)
        : 0

    const baseKw = isAstra ? 7.6 : 5.3

    const spikeKw =
      loadPeaks.find(
        (s) => s.siteId === siteId && s.timestamp === timestamp
      )?.extraPowerKw ?? 0

    const consumptionKw = round2(
      baseKw +
      daytimeKw +
      eveningKw +
      (offlineEv ? 0 : evPowerKw) +
      spikeKw +
      (day % 3) * 0.2
    )

    const inverterLimitKw = isAstra
      ? 11 + (isEquipmentOffline('astra-inv-2', timestamp) ? 0 : 11)
      : (isEquipmentOffline('lumen-inv', timestamp) ? 0 : 14)

    // Важно: погодный профиль повторяется каждые 7 дней.
    // Благодаря этому генерация работает на протяжении всех 30 дней.
    const weatherFactor = WEATHER_FACTOR[day % WEATHER_FACTOR.length]

    const generationKw = round2(
      Math.min(
        peakPvKw * SOLAR_PROFILE[hour] * weatherFactor,
        inverterLimitKw
      )
    )

    const gridExportKwh = round2(
      Math.max(0, generationKw - consumptionKw)
    )

    const values: Record<MetricId, number> = {
      consumption_power: consumptionKw,
      generation_power: generationKw,
      consumption_energy: consumptionKw,
      generation_energy: generationKw,
      grid_export_energy: gridExportKwh,
      battery_soc: batterySoc,
      power_limit: limitKw,
    }

    for (const metric of METRIC_IDS) {
      const quality =
        getQualityOverride(siteId, metric, timestamp) ?? 'simulated'

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

/**
 * 2 объекта × 30 дней × 24 часа × 7 показателей
 * = 10080 измерений.
 */
export const measurements: readonly Measurement[] =
  sites.flatMap((site) => buildSiteMeasurements(site.id))
