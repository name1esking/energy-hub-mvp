import type { Asset, SiteId } from './types.ts'

/** Значения мощности — кВт; ёмкости — кВт·ч; SOC — проценты. */
export const assets: readonly Asset[] = [
  { id: 'astra-pv', siteId: 'site-astra', name: 'Солнечное поле A: 40 панелей', type: 'solar_panel', status: 'online', parameters: { panelCount: 40, panelPowerKw: 0.55, peakPowerKw: 22 } },
  { id: 'astra-inv-1', siteId: 'site-astra', name: 'Инвертор A1', type: 'inverter', status: 'online', parameters: { ratedPowerKw: 11 } },
  { id: 'astra-inv-2', siteId: 'site-astra', name: 'Инвертор A2', type: 'inverter', status: 'online', parameters: { ratedPowerKw: 11 } },
  { id: 'astra-battery', siteId: 'site-astra', name: 'Батарея A', type: 'battery', status: 'online', parameters: { capacityKwh: 24, maxChargePowerKw: 8, maxDischargePowerKw: 8, socPercent: 58 } },
  { id: 'astra-meter-grid', siteId: 'site-astra', name: 'Сетевой счётчик A', type: 'meter', status: 'online', parameters: { measures: ['grid_export_energy'] } },
  { id: 'astra-meter-pv', siteId: 'site-astra', name: 'Счётчик генерации A', type: 'meter', status: 'online', parameters: { measures: ['generation_power', 'generation_energy'] } },
  { id: 'astra-meter-load', siteId: 'site-astra', name: 'Счётчик потребления A', type: 'meter', status: 'online', parameters: { measures: ['consumption_power', 'consumption_energy'] } },
  { id: 'astra-charger', siteId: 'site-astra', name: 'Зарядная станция A', type: 'charger', status: 'online', parameters: { ratedPowerKw: 7.4, connectorCount: 1 } },
  { id: 'astra-load', siteId: 'site-astra', name: 'Потребители объекта A', type: 'load', status: 'online', parameters: { maxPowerKw: 32 } },
  { id: 'lumen-pv', siteId: 'site-lumen', name: 'Солнечная крыша B: 28 панелей', type: 'solar_panel', status: 'online', parameters: { panelCount: 28, panelPowerKw: 0.5, peakPowerKw: 14 } },
  { id: 'lumen-inv', siteId: 'site-lumen', name: 'Инвертор B1', type: 'inverter', status: 'online', parameters: { ratedPowerKw: 14 } },
  { id: 'lumen-battery', siteId: 'site-lumen', name: 'Батарея B', type: 'battery', status: 'warning', parameters: { capacityKwh: 18, maxChargePowerKw: 6, maxDischargePowerKw: 6, socPercent: 18 } },
  { id: 'lumen-meter-grid', siteId: 'site-lumen', name: 'Сетевой счётчик B', type: 'meter', status: 'online', parameters: { measures: ['grid_export_energy'] } },
  { id: 'lumen-meter-pv', siteId: 'site-lumen', name: 'Счётчик генерации B', type: 'meter', status: 'online', parameters: { measures: ['generation_power', 'generation_energy'] } },
  { id: 'lumen-meter-load', siteId: 'site-lumen', name: 'Счётчик потребления B', type: 'meter', status: 'online', parameters: { measures: ['consumption_power', 'consumption_energy'] } },
  { id: 'lumen-charger', siteId: 'site-lumen', name: 'Зарядная станция B', type: 'charger', status: 'online', parameters: { ratedPowerKw: 11, connectorCount: 1 } },
  { id: 'lumen-load', siteId: 'site-lumen', name: 'Потребители объекта B', type: 'load', status: 'online', parameters: { maxPowerKw: 28 } },
]

export function getSiteAssets(siteId: SiteId): Asset[] {
  return assets.filter((asset) => asset.siteId === siteId)
}
