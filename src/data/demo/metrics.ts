import type { MetricId, Unit } from './types.ts'

export interface MetricDefinition {
  name: string
  unit: Unit
  description: string
  aggregation: 'average' | 'sum' | 'last'
}

/** Все СЕМЬ показателей из таблицы DATA_MODEL.md v0.1, в её порядке. */
export const metricDictionary: Readonly<Record<MetricId, MetricDefinition>> = {
  consumption_power: { name: 'Потребляемая мощность', unit: 'кВт', aggregation: 'average', description: 'Средняя активная мощность нагрузки за час; включает зарядные станции.' },
  generation_power: { name: 'Генерируемая мощность', unit: 'кВт', aggregation: 'average', description: 'Средняя AC-мощность солнечной генерации за час.' },
  consumption_energy: { name: 'Энергия потребления', unit: 'кВт·ч', aggregation: 'sum', description: 'Потреблённая электроэнергия за один час, включая зарядные станции.' },
  generation_energy: { name: 'Выработанная энергия', unit: 'кВт·ч', aggregation: 'sum', description: 'AC-энергия солнечной генерации за один час.' },
  grid_export_energy: { name: 'Отдача энергии в сеть', unit: 'кВт·ч', aggregation: 'sum', description: 'Солнечная энергия, переданная во внешнюю сеть за один час.' },
  battery_soc: { name: 'Уровень заряда батареи', unit: '%', aggregation: 'last', description: 'SOC на конец часового интервала; батареи в данном сценарии не заряжаются и не разряжаются.' },
  power_limit: { name: 'Лимит мощности', unit: 'кВт', aggregation: 'last', description: 'Максимум средней мощности потребления за час; по объекту.' },
}

/** Качество данных — производная UI-метрика, НЕ дополнительный тип Measurement. */
export const dataQualityDictionary = {
  completenessPercent: { name: 'Полнота данных', unit: '%' as const, description: 'Число value !== null / число ожидаемых Measurement × 100.' },
  qualityScorePercent: { name: 'Оценка качества', unit: '%' as const, description: 'Средневзвешенное качество: complete/simulated=1, estimated=0.5, stale=0.25, missing=0; затем × 100.' },
} as const

export const derivedMetricDictionary = {
  gridImportEnergy: { name: 'Расчётный импорт из сети', unit: 'кВт·ч' as const, description: 'max(потребление − генерация + экспорт, 0); допускается только при простое батарей и наличии всех трёх измерений.' },
  solarSelfConsumed: { name: 'Солнечная энергия, использованная на объекте', unit: 'кВт·ч' as const, description: 'Генерация − экспорт; только если оба значения доступны.' },
  solarSelfConsumptionPercent: { name: 'Доля собственного потребления СЭС', unit: '%' as const, description: '100 × (генерация − экспорт) / генерация; при нулевой генерации = null.' },
  limitExcessPower: { name: 'Превышение лимита', unit: 'кВт' as const, description: 'max(мощность потребления − лимит мощности, 0), если оба показания имеются.' },
} as const

export function formatMetric(value: number | null, unit: Unit): string {
  return value === null ? 'Нет данных' : `${value.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${unit}`
}
