import type { Measurement } from './types.ts'

/**
 * Изолированные НЕВАЛИДНЫЕ fixture-записи для тестов/UX.
 * ВАЖНО: никогда не смешивать с основным массивом measurements!
 * В модели нет quality='invalid', поэтому ошибки обнаруживает validateMeasurement().
 */
export const invalidMeasurementExamples: readonly Measurement[] = [
  {
    id: 'invalid-negative-energy', siteId: 'site-astra', metric: 'consumption_energy',
    value: -4.2, unit: 'кВт·ч', timestamp: '2026-11-02T09:00:00.000Z', quality: 'simulated',
  },
  {
    id: 'invalid-soc-over-100', siteId: 'site-lumen', metric: 'battery_soc',
    value: 114, unit: '%', timestamp: '2026-11-03T09:00:00.000Z', quality: 'simulated',
  },
  {
    id: 'invalid-unit', siteId: 'site-astra', metric: 'consumption_power',
    value: 12, unit: 'кВт·ч', timestamp: '2026-11-04T10:00:00.000Z', quality: 'simulated',
  },
  {
    id: 'invalid-missing-quality', siteId: 'site-lumen', metric: 'generation_energy',
    value: null, unit: 'кВт·ч', timestamp: '2026-11-02T11:00:00.000Z', quality: 'simulated',
  },
]
