import { measurements } from './readings.ts'
import type { Event } from './types.ts'

/** Event содержит ровно согласованные поля DATA_MODEL.md. */
const fixedEvents: readonly Event[] = [
  { id: 'event-astra-inverter-off', siteId: 'site-astra', title: 'Инвертор A2 был отключён', description: 'Оборудование astra-inv-2: 01.11 12:00–14:00 UTC; доступная мощность инверторов снижена до 11 кВт.', severity: 'critical', status: 'resolved', timestamp: '2026-11-01T12:00:00.000Z' },
  { id: 'event-astra-inverter-on', siteId: 'site-astra', title: 'Инвертор A2 восстановлен', description: 'Оборудование astra-inv-2 вернулось в работу.', severity: 'info', status: 'resolved', timestamp: '2026-11-01T14:00:00.000Z' },
  { id: 'event-lumen-inverter-off', siteId: 'site-lumen', title: 'Инвертор B1 был отключён', description: 'Оборудование lumen-inv: 03.11 12:00–14:00 UTC; генерация в эти часы равна 0 кВт.', severity: 'critical', status: 'resolved', timestamp: '2026-11-03T12:00:00.000Z' },
  { id: 'event-lumen-inverter-on', siteId: 'site-lumen', title: 'Инвертор B1 восстановлен', description: 'Оборудование lumen-inv вернулось в работу.', severity: 'info', status: 'resolved', timestamp: '2026-11-03T14:00:00.000Z' },
  { id: 'event-lumen-charger-off', siteId: 'site-lumen', title: 'Зарядная станция была отключена', description: 'Оборудование lumen-charger: 04.11 19:00–20:00 UTC, EV-нагрузка отсутствует.', severity: 'warning', status: 'resolved', timestamp: '2026-11-04T19:00:00.000Z' },
  { id: 'event-lumen-charger-on', siteId: 'site-lumen', title: 'Зарядная станция восстановлена', description: 'Оборудование lumen-charger снова доступно.', severity: 'info', status: 'resolved', timestamp: '2026-11-04T20:00:00.000Z' },
  { id: 'event-astra-meter-gap', siteId: 'site-astra', title: 'Пропали показания счётчика A', description: 'Оборудование astra-meter-load: нет значений мощности и энергии потребления 02.11 10:00 UTC.', severity: 'warning', status: 'resolved', timestamp: '2026-11-02T10:00:00.000Z' },
  { id: 'event-astra-grid-gap', siteId: 'site-astra', title: 'Пропали показания сетевого счётчика A', description: 'Оборудование astra-meter-grid: нет показания отдачи в сеть 02.11 12:00 UTC.', severity: 'warning', status: 'resolved', timestamp: '2026-11-02T12:00:00.000Z' },
  { id: 'event-lumen-pv-gap', siteId: 'site-lumen', title: 'Пропали показания счётчика генерации B', description: 'Оборудование lumen-meter-pv: нет мощности и энергии генерации 04.11 09:00 UTC.', severity: 'warning', status: 'resolved', timestamp: '2026-11-04T09:00:00.000Z' },
  { id: 'event-lumen-battery-low', siteId: 'site-lumen', title: 'Низкий заряд батареи', description: 'Оборудование lumen-battery: уровень заряда 18%. Событие открыто, батарея в status=warning.', severity: 'warning', status: 'open', timestamp: '2026-10-30T08:00:00.000Z' },
  { id: 'event-lumen-battery-gap', siteId: 'site-lumen', title: 'Нет телеметрии SOC батареи', description: 'Показатель battery_soc отсутствует 05.11 05:00 UTC (null, не 0).', severity: 'warning', status: 'resolved', timestamp: '2026-11-05T05:00:00.000Z' },
]

/** Превышение регистрируется только если известны и мощность, и лимит. */
const powerBySiteAndTime = new Map(
  measurements.filter((m) => m.metric === 'consumption_power').map((m) => [`${m.siteId}|${m.timestamp}`, m] as const),
)
const limitEvents: Event[] = measurements
  .filter((m) => m.metric === 'power_limit' && m.value !== null)
  .flatMap((limit) => {
    const current = powerBySiteAndTime.get(`${limit.siteId}|${limit.timestamp}`)
    if (current?.value === null || current?.value === undefined || limit.value === null || current.value <= limit.value) return []
    const excess = Math.round((current.value - limit.value) * 100) / 100
    return [{
      id: `event-limit-${limit.siteId}-${limit.timestamp.slice(0, 13).replaceAll(/[-T:]/g, '')}`,
      siteId: limit.siteId,
      title: 'Превышение лимита мощности',
      description: `Средняя мощность ${current.value} кВт > лимита ${limit.value} кВт; превышение ${excess} кВт. Интервал начинается ${limit.timestamp}.`,
      severity: excess >= 5 ? 'critical' as const : 'warning' as const,
      status: 'resolved' as const,
      timestamp: limit.timestamp,
    }]
  })

export const events: readonly Event[] = [...fixedEvents, ...limitEvents]
