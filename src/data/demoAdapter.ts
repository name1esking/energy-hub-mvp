
import {
  getSiteAssets,
  getSiteEvents,
  getSiteMeasurements,
  metricDictionary,
  sites,
  type Asset,
  type Measurement,
  type MetricId,
  type SiteId,
} from './demo/index.ts'

import type {
  AssetView,
  DataQualityRowView,
  EnergyObjectView,
  EventView,
  MeasurementView,
  MetricCardView,
  MetricIcon,
  MetricTone,
  Period,
  PowerChartView,
  ServiceView,
} from '../types/ui'

// Основные показатели
const metricCards: {
  metric: MetricId
  tone: MetricTone
  icon: MetricIcon
}[] = [
  { metric: 'consumption_energy', tone: 'teal', icon: 'activity' },
  { metric: 'consumption_power', tone: 'blue', icon: 'zap' },
  { metric: 'generation_energy', tone: 'amber', icon: 'sun' },
  { metric: 'battery_soc', tone: 'violet', icon: 'battery' },
]

// Преобразование измерения
function toMeasurementView(m: Measurement): MeasurementView {
  return {
    id: m.id,
    metric: m.metric,
    label: metricDictionary[m.metric].name,
    value: m.value,
    unit: m.unit,
    timestamp: m.timestamp,
    quality: m.quality,
    sourceLabel: 'Демонстрационные данные Astra / Lumen',
  }
}

// Паспортные характеристики оборудования
function assetDisplayValue(asset: Asset): string | null {
  const number = (key: string) => {
    const value = asset.parameters[key]
    return typeof value === 'number' ? value : null
  }

  switch (asset.type) {
    case 'solar_panel': {
      const value = number('peakPowerKw')
      return value === null ? null : `Паспорт: ${value} кВт`
    }

    case 'inverter': {
      const value = number('ratedPowerKw')
      return value === null ? null : `Номинал: ${value} кВт`
    }

    case 'battery': {
      const value = number('capacityKwh')
      return value === null ? null : `Ёмкость: ${value} кВт·ч`
    }

    case 'charger': {
      const value = number('ratedPowerKw')
      return value === null ? null : `Номинал: ${value} кВт`
    }

    case 'load': {
      const value = number('maxPowerKw')
      return value === null ? null : `Максимум: ${value} кВт`
    }

    case 'meter':
      return 'Измерительный канал · демо'

    default:
      return null
  }
}

// Оборудование
function buildAssets(siteId: SiteId): AssetView[] {
  return getSiteAssets(siteId).map((asset) => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    status: asset.status,
    displayValue: assetDisplayValue(asset),
    quality: 'simulated',
    isSimulated: true,
  }))
}

// Получение измерений за выбранный период
function getPeriodMeasurements(
  siteId: SiteId,
  metric: MetricId,
  period: Period,
): Measurement[] {
  const all = getSiteMeasurements(siteId, metric)

  switch (period) {
    case '24h':
      return all.slice(-24)

    case '7d':
      return all.slice(-7 * 24)

    case '30d':
      return all.slice(-30 * 24)

    default:
      return all
  }
}

// Основные показатели
function buildMetrics(
  siteId: SiteId,
  period: Period,
): MetricCardView[] {
  return metricCards.map((config) => {
    const measurements = getPeriodMeasurements(
      siteId,
      config.metric,
      period
    )

    const valid = measurements.filter((m) => m.value !== null)

    const latest = [...valid].reverse()[0] ?? null

    let value = latest?.value ?? 0

    // Энергия — сумма за выбранный период
    if (
      config.metric === 'consumption_energy' ||
      config.metric === 'generation_energy'
    ) {
      value = valid.reduce(
        (sum, m) => sum + (m.value ?? 0),
        0
      )
    }

    // Мощность — среднее значение за период
    if (config.metric === 'consumption_power') {
      value = valid.length > 0
        ? valid.reduce(
            (sum, m) => sum + (m.value ?? 0),
            0
          ) / valid.length
        : 0
    }

    const measurement = latest
      ? {
          ...toMeasurementView(latest),
          value,
        }
      : null

    const hint =
      config.metric === 'consumption_power'
        ? 'Средняя мощность за период · демо'
        : config.metric === 'battery_soc'
          ? 'Последнее значение за период · демо'
          : 'Сумма за выбранный период · демо'

    return {
      id: `metric-${config.metric}`,
      label: metricDictionary[config.metric].name,
      measurement,
      tone: config.tone,
      icon: config.icon,
      hint,
    }
  })
}

// События
function buildEvents(siteId: SiteId): EventView[] {
  return getSiteEvents(siteId).map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    severity: event.severity,
    status: event.status,
    timestamp: `${event.timestamp.slice(0, 10)} ${event.timestamp.slice(11, 16)} UTC`,
  }))
}

// График мощности
function buildChart(
  siteId: SiteId,
  period: Period,
): PowerChartView | null {
  const selected = getPeriodMeasurements(
    siteId,
    'consumption_power',
    period
  )

  const timestamps = selected.map((m) => m.timestamp)

  if (timestamps.length === 0) {
    return null
  }

  const valuesFor = (metric: MetricId) => {
    const lookup = new Map(
      getSiteMeasurements(siteId, metric).map(
        (m) => [m.timestamp, m.value] as const
      )
    )

    return timestamps.map(
      (timestamp) => lookup.get(timestamp) ?? null
    )
  }

  return {
    unit: 'кВт',

    labels: timestamps.map((timestamp) =>
      period === '24h'
        ? timestamp.slice(11, 16)
        : `${timestamp.slice(5, 10)} ${timestamp.slice(11, 16)}`
    ),

    series: [
      {
        id: 'consumption',
        label: 'Потребление',
        color: '#35B6A3',
        values: valuesFor('consumption_power'),
      },
      {
        id: 'generation',
        label: 'Генерация',
        color: '#E9AC47',
        values: valuesFor('generation_power'),
      },
      {
        id: 'limit',
        label: 'Лимит мощности',
        color: '#8C9AAF',
        values: valuesFor('power_limit'),
      },
    ],
  }
}

// Качество данных за выбранный период
function buildQualityRows(
  siteId: SiteId,
  period: Period,
): DataQualityRowView[] {
  const qualityMetrics: MetricId[] = [
    'consumption_power',
    'generation_power',
    'grid_export_energy',
  ]

  const timestamps = getPeriodMeasurements(
    siteId,
    'consumption_power',
    period
  ).map((m) => m.timestamp)

  return qualityMetrics.map((metric) => {
    const lookup = new Map(
      getSiteMeasurements(siteId, metric).map(
        (m) => [m.timestamp, m] as const
      )
    )

    return {
      id: `quality-${metric}`,
      label: metricDictionary[metric].name,

      cells: timestamps.map((timestamp) => {
        const measurement = lookup.get(timestamp)

        return {
          label: period === '24h'
            ? timestamp.slice(11, 16)
            : `${timestamp.slice(5, 10)} ${timestamp.slice(11, 16)}`,

          quality: measurement?.quality ?? 'unknown',
          measurementId: measurement?.id,
        }
      }),
    }
  })
}

// Главная функция адаптера
export function buildDashboardData(
  siteId: SiteId,
  period: Period,
) {
  const site = sites.find((item) => item.id === siteId)

  if (!site) {
    throw new Error(`Неизвестный объект: ${siteId}`)
  }

  const energyObject: EnergyObjectView = {
    id: site.id,
    name: site.name,

    typeLabel: site.type === 'industrial'
      ? 'Промышленный энергообъект'
      : 'Офисный энергообъект',

    locationLabel: site.location,
  }

  const services: ServiceView[] = []

  return {
    energyObject,
    assets: buildAssets(siteId),
    metrics: buildMetrics(siteId, period),
    events: buildEvents(siteId),
    services,
    chartData: buildChart(siteId, period),
    qualityRows: buildQualityRows(siteId, period),
  }
}
