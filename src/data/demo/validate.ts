import { assets } from './equipment.ts'
import { events } from './events.ts'
import { invalidMeasurementExamples } from './invalidExamples.ts'
import { metricDictionary } from './metrics.ts'
import { HISTORY_DAYS, HISTORY_START_UTC, INTERVAL_MINUTES, measurements } from './readings.ts'
import { equipmentOutages } from './scenarios.ts'
import { portfolios, sites } from './sites.ts'
import { getGridExchangeAt, getLimitExcessPowerKw, getMeasurementAt, getSiteDataQuality } from './selectors.ts'
import { METRIC_IDS } from './types.ts'
import type { Measurement, SiteId } from './types.ts'

const EPS = 0.011
const siteIds = new Set(sites.map((site) => site.id))

/** Проверка одной записи, в том числе ошибочной fixture. */
export function validateMeasurement(m: Measurement): string[] {
  const errors: string[] = []
  if (!siteIds.has(m.siteId)) errors.push(`${m.id}: неизвестный siteId`)
  if (metricDictionary[m.metric]?.unit !== m.unit) errors.push(`${m.id}: некорректная единица ${m.unit} для ${m.metric}`)
  if (!Number.isFinite(Date.parse(m.timestamp)) || new Date(m.timestamp).toISOString() !== m.timestamp) errors.push(`${m.id}: timestamp не ISO UTC`)
  if ((m.value === null) !== (m.quality === 'missing')) errors.push(`${m.id}: несовпадение null и quality=missing`)
  if (m.value !== null && (!Number.isFinite(m.value) || m.value < 0)) errors.push(`${m.id}: некорректное числовое значение`)
  if (m.metric === 'battery_soc' && m.value !== null && m.value > 100) errors.push(`${m.id}: SOC > 100%`)
  return errors
}

function isUnique(values: readonly string[]) { return new Set(values).size === values.length }

/** Пустой список означает, что основной набор прошёл все проверки. */
export function validateDemoData(): string[] {
  const errors: string[] = []
  if (sites.length !== 2 || !isUnique(sites.map((s) => s.id))) errors.push('Должно быть 2 уникальных Site.')
  if (!isUnique(portfolios.map((p) => p.id))) errors.push('Дублируются Portfolio.id.')
  if (!isUnique(assets.map((a) => a.id))) errors.push('Дублируются Asset.id.')
  if (!isUnique(measurements.map((m) => m.id))) errors.push('Дублируются Measurement.id.')
  if (!isUnique(events.map((e) => e.id))) errors.push('Дублируются Event.id.')
  const portfolioIds = new Set(portfolios.map((p) => p.id))
  for (const site of sites) if (!portfolioIds.has(site.portfolioId)) errors.push(`${site.id}: неизвестный Portfolio.`)
  for (const asset of assets) {
    if (!siteIds.has(asset.siteId)) errors.push(`${asset.id}: неизвестный Site.`)
    if (asset.type === 'solar_panel') {
      const count = asset.parameters.panelCount
      const eachKw = asset.parameters.panelPowerKw
      const peakKw = asset.parameters.peakPowerKw
      if (typeof count !== 'number' || typeof eachKw !== 'number' || typeof peakKw !== 'number' || Math.abs(count * eachKw - peakKw) > EPS) {
        errors.push(`${asset.id}: некорректная паспортная мощность PV.`)
      }
    }
  }
  const expectedCount = sites.length * HISTORY_DAYS * 24 * METRIC_IDS.length
  if (measurements.length !== expectedCount) errors.push(`Ожидалось ${expectedCount} Measurement, получено ${measurements.length}.`)
  const naturalKey = measurements.map((m) => `${m.siteId}|${m.timestamp}|${m.metric}`)
  if (!isUnique(naturalKey)) errors.push('Дубликаты по (siteId,timestamp,metric).')
  const validTimes = new Set<string>()
  for (let i = 0; i < HISTORY_DAYS * 24; i += 1) {
    validTimes.add(new Date(Date.parse(HISTORY_START_UTC) + i * INTERVAL_MINUTES * 60000).toISOString())
  }
  for (const m of measurements) {
    errors.push(...validateMeasurement(m))
    if (!validTimes.has(m.timestamp)) errors.push(`${m.id}: вне демопериода`)
  }
  for (const site of sites) {
    const pv = assets.filter((a) => a.siteId === site.id && a.type === 'solar_panel')
    const batteries = assets.filter((a) => a.siteId === site.id && a.type === 'battery')
    const chargers = assets.filter((a) => a.siteId === site.id && a.type === 'charger')
    const meters = assets.filter((a) => a.siteId === site.id && a.type === 'meter')
    if (pv.length === 0 || batteries.length === 0 || chargers.length === 0 || meters.length === 0) errors.push(`${site.id}: неполный набор оборудования`)
    const peakKw = pv.reduce((sum, a) => sum + Number(a.parameters.peakPowerKw), 0)
    for (const timestamp of validTimes) {
      const cPower = getMeasurementAt(site.id, 'consumption_power', timestamp)?.value ?? null
      const gPower = getMeasurementAt(site.id, 'generation_power', timestamp)?.value ?? null
      const cEnergy = getMeasurementAt(site.id, 'consumption_energy', timestamp)?.value ?? null
      const gEnergy = getMeasurementAt(site.id, 'generation_energy', timestamp)?.value ?? null
      const exportKwh = getMeasurementAt(site.id, 'grid_export_energy', timestamp)?.value ?? null
      const soc = getMeasurementAt(site.id, 'battery_soc', timestamp)?.value ?? null
      const limit = getMeasurementAt(site.id, 'power_limit', timestamp)?.value ?? null
      const presentCount = METRIC_IDS.filter((metric) => getMeasurementAt(site.id, metric, timestamp) !== undefined).length
      if (presentCount !== METRIC_IDS.length) errors.push(`${site.id}/${timestamp}: неполный набор метрик`)
      if (cPower !== null && cEnergy !== null && Math.abs(cPower - cEnergy) > EPS) errors.push(`${site.id}/${timestamp}: потребление кВт × 1ч != кВт·ч`)
      if (gPower !== null && gEnergy !== null && Math.abs(gPower - gEnergy) > EPS) errors.push(`${site.id}/${timestamp}: генерация кВт × 1ч != кВт·ч`)
      if (gPower !== null && gPower > peakKw + EPS) errors.push(`${site.id}/${timestamp}: PV выше паспорта`)
      const availableInverterKw = assets.filter((a) => a.siteId === site.id && a.type === 'inverter')
        .reduce((sum, a) => sum + (equipmentOutages.some((o) => o.assetId === a.id && o.start <= timestamp && timestamp < o.end) ? 0 : Number(a.parameters.ratedPowerKw)), 0)
      if (gPower !== null && gPower > availableInverterKw + EPS) errors.push(`${site.id}/${timestamp}: генерация выше доступного инвертора`)
      if (gEnergy !== null && exportKwh !== null && exportKwh > gEnergy + EPS) errors.push(`${site.id}/${timestamp}: экспорт больше генерации`)
      if (cEnergy !== null && gEnergy !== null && exportKwh !== null) {
        const expectedExport = Math.round(Math.max(0, gEnergy - cEnergy) * 100) / 100
        if (Math.abs(exportKwh - expectedExport) > EPS) errors.push(`${site.id}/${timestamp}: PV-экспорт не согласован с потреблением`)
        const imported = getGridExchangeAt(site.id, timestamp).importKwh
        if (imported === null || Math.abs(gEnergy + imported - cEnergy - exportKwh) > EPS) {
          errors.push(`${site.id}/${timestamp}: нарушен расчётный энергобаланс`)
        }
      }
      const expectedSoc = site.id === 'site-astra' ? 58 : 18
      if (soc !== null && Math.abs(soc - expectedSoc) > EPS) errors.push(`${site.id}/${timestamp}: батарея в простое — SOC должен быть постоянным`)
      if (limit !== null && limit <= 0) errors.push(`${site.id}/${timestamp}: лимит должен быть >0`)
    }
  }
  for (const event of events) {
    if (!siteIds.has(event.siteId)) errors.push(`${event.id}: событие с неизвестным siteId`)
    if (!Number.isFinite(Date.parse(event.timestamp))) errors.push(`${event.id}: неверная дата`)
    if (event.title.trim() === '' || event.description.trim() === '') errors.push(`${event.id}: пустые title/description`)
    if (event.id.startsWith('event-limit-') && (getLimitExcessPowerKw(event.siteId, event.timestamp) ?? 0) <= 0) errors.push(`${event.id}: нет подтверждённого превышения`)
  }
  const missingCount = measurements.filter((m) => m.value === null).length
  const zeroCount = measurements.filter((m) => m.value === 0).length
  if (missingCount < 1 || zeroCount < 1) errors.push('Должны быть и настоящие нули, и пропуски null.')
  if (!events.some((e) => e.title === 'Превышение лимита мощности')) errors.push('Нет превышений лимита.')
  if (!events.some((e) => e.status === 'open')) errors.push('Нет открытых событий.')
  for (const site of sites) {
    const quality = getSiteDataQuality(site.id)
    if (quality.total !== HISTORY_DAYS * 24 * METRIC_IDS.length) errors.push(`${site.id}: нарушено число ожидаемых показаний`)
  }
  return errors
}

/** Ожидаем, что ВСЕ отдельные ошибочные примеры будут обнаружены. */
export function validateInvalidFixtures(): string[] {
  const errors: string[] = []
  for (const m of invalidMeasurementExamples) {
    if (validateMeasurement(m).length === 0) errors.push(`${m.id}: намеренная ошибка не обнаружена`)
  }
  return errors
}

export function assertDemoDataValid(): void {
  const errors = [...validateDemoData(), ...validateInvalidFixtures()]
  if (errors.length > 0) throw new Error(`Не прошли проверки (${errors.length}):\n${errors.join('\n')}`)
}

export function getValidationStats(): {
  sites: number; assets: number; measurements: number; events: number;
  missing: number; zero: number; erroneousExamples: number; qualityBySite: Record<SiteId, number>
} {
  const qualityBySite = {} as Record<SiteId, number>
  for (const site of sites) qualityBySite[site.id] = getSiteDataQuality(site.id).qualityScorePercent
  return {
    sites: sites.length, assets: assets.length, measurements: measurements.length, events: events.length,
    missing: measurements.filter((m) => m.value === null).length,
    zero: measurements.filter((m) => m.value === 0).length,
    erroneousExamples: invalidMeasurementExamples.length,
    qualityBySite,
  }
}
