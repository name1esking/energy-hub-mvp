import { events } from './events.ts'
import { measurements, HISTORY_DAYS, HISTORY_START_UTC, INTERVAL_MINUTES } from './readings.ts'
import { METRIC_IDS } from './types.ts'
import type { DataQualitySummary, DailyEnergySummary, Measurement, MetricId, SiteId } from './types.ts'

const round2 = (n: number): number => Math.round((n + Number.EPSILON) * 100) / 100

export function getSiteMeasurements(siteId: SiteId, metric?: MetricId): Measurement[] {
  return measurements.filter((m) => m.siteId === siteId && (metric === undefined || m.metric === metric))
}

export function getSiteEvents(siteId: SiteId) {
  return events.filter((event) => event.siteId === siteId)
}

export function getMeasurementAt(siteId: SiteId, metric: MetricId, timestamp: string): Measurement | undefined {
  return measurements.find((m) => m.siteId === siteId && m.metric === metric && m.timestamp === timestamp)
}

export function getLatestMeasurement(siteId: SiteId, metric: MetricId): Measurement | undefined {
  return getSiteMeasurements(siteId, metric).at(-1)
}

/** Вес — правило отображения качества в DEMO, не согласованное поле модели. */
const qualityWeights = { complete: 1, simulated: 1, estimated: 0.5, stale: 0.25, missing: 0 } as const

export function getSiteDataQuality(siteId: SiteId): DataQualitySummary {
  const list = getSiteMeasurements(siteId)
  const counts = { total: list.length, available: 0, missing: 0, stale: 0, estimated: 0, simulated: 0, complete: 0 }
  let weighted = 0
  for (const m of list) {
    if (m.value !== null) counts.available += 1
    counts[m.quality] += 1
    weighted += qualityWeights[m.quality]
  }
  return {
    siteId,
    ...counts,
    completenessPercent: counts.total === 0 ? 0 : round2(counts.available / counts.total * 100),
    qualityScorePercent: counts.total === 0 ? 0 : round2(weighted / counts.total * 100),
  }
}

/** Только расчёт: в DATA_MODEL.md нет утверждённой метрики импорта из сети. */
export function getGridExchangeAt(siteId: SiteId, timestamp: string): { importKwh: number | null; exportKwh: number | null } {
  const consumption = getMeasurementAt(siteId, 'consumption_energy', timestamp)?.value ?? null
  const generation = getMeasurementAt(siteId, 'generation_energy', timestamp)?.value ?? null
  const exportKwh = getMeasurementAt(siteId, 'grid_export_energy', timestamp)?.value ?? null
  return {
    importKwh: consumption === null || generation === null || exportKwh === null
      ? null
      : round2(Math.max(0, consumption - generation + exportKwh)),
    exportKwh,
  }
}

export function getLimitExcessPowerKw(siteId: SiteId, timestamp: string): number | null {
  const power = getMeasurementAt(siteId, 'consumption_power', timestamp)?.value ?? null
  const limit = getMeasurementAt(siteId, 'power_limit', timestamp)?.value ?? null
  return power === null || limit === null ? null : round2(Math.max(0, power - limit))
}

/** Не суммируем неполные сутки как полноценные: при любом пропуске итог = null. */
export function getDailyEnergySummaries(siteId: SiteId): DailyEnergySummary[] {
  const result: DailyEnergySummary[] = []
  const start = Date.parse(HISTORY_START_UTC)
  for (let day = 0; day < HISTORY_DAYS; day += 1) {
    const hourlyValues: { consumption: number | null; generation: number | null; exported: number | null; imported: number | null; selfConsumed: number | null }[] = []
    for (let hour = 0; hour < 24; hour += 1) {
      const timestamp = new Date(start + (day * 24 + hour) * INTERVAL_MINUTES * 60000).toISOString()
      const consumption = getMeasurementAt(siteId, 'consumption_energy', timestamp)?.value ?? null
      const generation = getMeasurementAt(siteId, 'generation_energy', timestamp)?.value ?? null
      const exported = getMeasurementAt(siteId, 'grid_export_energy', timestamp)?.value ?? null
      const { importKwh } = getGridExchangeAt(siteId, timestamp)
      const selfConsumed = generation === null || exported === null ? null : round2(generation - exported)
      hourlyValues.push({ consumption, generation, exported, imported: importKwh, selfConsumed })
    }
    const sumFullDay = (key: keyof (typeof hourlyValues)[number]): number | null => {
      const values = hourlyValues.map((hour) => hour[key])
      return values.some((v) => v === null) ? null : round2(values.reduce<number>((sum, v) => sum + (v ?? 0), 0))
    }
    const consumptionKwh = sumFullDay('consumption')
    const generationKwh = sumFullDay('generation')
    const gridExportKwh = sumFullDay('exported')
    const derivedGridImportKwh = sumFullDay('imported')
    const solarSelfConsumedKwh = sumFullDay('selfConsumed')
    result.push({
      siteId,
      date: new Date(start + day * 24 * INTERVAL_MINUTES * 60000).toISOString().slice(0, 10),
      consumptionKwh,
      generationKwh,
      gridExportKwh,
      derivedGridImportKwh,
      solarSelfConsumedKwh,
      solarSelfConsumptionPercent: generationKwh === null || solarSelfConsumedKwh === null || generationKwh === 0
        ? null : round2(solarSelfConsumedKwh / generationKwh * 100),
    })
  }
  return result
}

/** Для интерфейса: полный комплект METRIC_IDS на выбранный час. */
export function getSiteSnapshot(siteId: SiteId, timestamp: string): Partial<Record<MetricId, Measurement>> {
  const result: Partial<Record<MetricId, Measurement>> = {}
  for (const metric of METRIC_IDS) {
    const measurement = getMeasurementAt(siteId, metric, timestamp)
    if (measurement) result[metric] = measurement
  }
  return result
}
