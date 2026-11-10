import type {
  AssetView,
  DataQualityRowView,
  EnergyObjectView,
  EnergyTopologyView,
  EventView,
  MeasurementView,
  MetricCardView,
  PowerChartView,
  ServiceView,
} from '../types/ui';

/** Synthetic presentation data only. These objects are not the canonical domain model. */
export const demoEnergyObject: EnergyObjectView = {
  id: 'demo-energy-object-01',
  name: 'Северная площадка',
  typeLabel: 'Промышленный энергообъект',
  locationLabel: 'Демонстрационная территория',
};

export const demoAssets: AssetView[] = [
  { id: 'demo-asset-pv-01', name: 'Solar PV', type: 'solar_panel', status: 'online', displayValue: '132 кВт · демо', quality: 'simulated', isSimulated: true },
  { id: 'demo-asset-grid-01', name: 'Grid connection', type: 'grid_connection', status: 'warning', displayValue: 'Импорт · демо', quality: 'simulated', isSimulated: true },
  { id: 'demo-asset-battery-01', name: 'Battery ESS', type: 'battery', status: 'online', displayValue: '76% · симуляция', quality: 'simulated', isSimulated: true },
  { id: 'demo-asset-inverter-01', name: 'Inverter INV-02', type: 'inverter', status: 'online', displayValue: 'В работе · демо', quality: 'simulated', isSimulated: true },
  { id: 'demo-asset-meter-01', name: 'Meter MTR-04', type: 'meter', status: 'warning', displayValue: 'Нет данных', quality: 'missing' },
  { id: 'demo-asset-load-01', name: 'Building load', type: 'load', status: 'online', displayValue: '248 кВт · демо', quality: 'simulated', isSimulated: true },
];

export const demoMeasurements: MeasurementView[] = [
  { id: 'demo-measurement-01', metric: 'demo_consumption_energy', label: 'Энергия потребления', value: 1284, unit: 'кВт·ч', timestamp: '2026-11-06T10:45:00+03:00', quality: 'simulated', sourceLabel: 'Демо-генератор' },
  { id: 'demo-measurement-02', metric: 'demo_consumption_power', label: 'Мощность потребления', value: 248, unit: 'кВт', timestamp: '2026-11-06T10:45:00+03:00', quality: 'simulated', sourceLabel: 'Демо-генератор' },
  { id: 'demo-measurement-03', metric: 'demo_generation_energy', label: 'Выработанная энергия', value: 632, unit: 'кВт·ч', timestamp: '2026-11-06T10:45:00+03:00', quality: 'simulated', sourceLabel: 'Демо-генератор' },
  { id: 'demo-measurement-04', metric: 'demo_battery_soc', label: 'Уровень заряда батареи', value: 76, unit: '%', timestamp: '2026-11-06T10:45:00+03:00', quality: 'simulated', sourceLabel: 'Симуляция' },
  { id: 'demo-measurement-05', metric: 'demo_grid_power', label: 'Мощность сети', value: null, unit: 'кВт', timestamp: '2026-11-06T10:45:00+03:00', quality: 'missing', sourceLabel: 'Meter MTR-04' },
];

export const demoMetricCards: MetricCardView[] = [
  { id: 'metric-consumption', label: 'Энергия потребления', measurement: demoMeasurements[0], tone: 'teal', icon: 'activity', hint: 'За выбранный период · демо' },
  { id: 'metric-power', label: 'Мощность потребления', measurement: demoMeasurements[1], tone: 'blue', icon: 'zap', hint: 'Демонстрационное значение' },
  { id: 'metric-generation', label: 'Выработанная энергия', measurement: demoMeasurements[2], tone: 'amber', icon: 'sun', hint: 'За выбранный период · демо' },
  { id: 'metric-battery', label: 'Уровень заряда батареи', measurement: demoMeasurements[3], tone: 'violet', icon: 'battery', hint: 'Симуляция, не измерение' },
];

export const demoEvents: EventView[] = [
  { id: 'demo-event-01', title: 'Пропуски измерений', description: 'Канал мощности сети: значение отсутствует, поэтому оно не подменяется нулём.', severity: 'warning', status: 'demo_open', timestamp: 'Сегодня, 10:42', relatedAssetLabel: 'Meter MTR-04' },
  { id: 'demo-event-02', title: 'Пример превышения лимита', description: 'Демонстрационное событие для показа уведомления и истории.', severity: 'critical', status: 'demo_open', timestamp: 'Сегодня, 09:18', relatedAssetLabel: 'Grid connection' },
  { id: 'demo-event-03', title: 'Плановое обслуживание', description: 'Пример записи об обслуживании инвертора.', severity: 'info', status: 'demo_planned', timestamp: 'Вчера, 16:10', relatedAssetLabel: 'Inverter INV-02' },
];

export const demoServices: ServiceView[] = [
  { id: 'demo-service-01', name: 'Peak Shaving', type: 'peak_shaving', description: 'Ограничение пиков мощности · шаблонный просмотр', stateLabel: 'Подключение для демонстрации', isSimulated: true },
  { id: 'demo-service-02', name: 'PV Self-Consumption', type: 'pv_self_consumption', description: 'Анализ собственного потребления солнечной энергии', stateLabel: 'Подключение для демонстрации', isSimulated: true },
];

export const demoPowerChart: PowerChartView = {
  labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
  unit: 'кВт',
  series: [
    { id: 'demand', label: 'Потребление', color: '#35B6A3', values: [118, 105, 99, 112, 148, 192, 224, 248, 220, 205, 178, 142] },
    { id: 'pv', label: 'PV генерация', color: '#E9AC47', values: [0, 0, 0, 8, 42, 96, 132, 145, 118, 72, 18, 0] },
    { id: 'limit', label: 'Лимит', color: '#8C9AAF', values: Array(12).fill(240) },
  ],
};

export const demoQualityRows: DataQualityRowView[] = [
  { id: 'quality-demand', label: 'Demand power', cells: ['complete', 'complete', 'complete', 'stale', 'simulated', 'complete', 'complete'].map((quality, index) => ({ label: ['00:00', '04:00', '08:00', '10:00', '12:00', '16:00', '20:00'][index], quality, measurementId: `demo-quality-demand-${index}` })) },
  { id: 'quality-pv', label: 'PV generation', cells: ['complete', 'missing', 'estimated', 'simulated', 'simulated', 'complete', 'missing'].map((quality, index) => ({ label: ['00:00', '04:00', '08:00', '10:00', '12:00', '16:00', '20:00'][index], quality, measurementId: `demo-quality-pv-${index}` })) },
  { id: 'quality-grid', label: 'Grid connection', cells: ['complete', 'complete', 'stale', 'missing', 'missing', 'simulated', 'complete'].map((quality, index) => ({ label: ['00:00', '04:00', '08:00', '10:00', '12:00', '16:00', '20:00'][index], quality, measurementId: `demo-quality-grid-${index}` })) },
];

export const demoTopology: EnergyTopologyView = {
  isDemo: true,
  placements: [
    { assetId: 'demo-asset-pv-01', x: 25, y: 20 },
    { assetId: 'demo-asset-grid-01', x: 25, y: 230 },
    { assetId: 'demo-asset-battery-01', x: 300, y: 20 },
    { assetId: 'demo-asset-inverter-01', x: 300, y: 230 },
    { assetId: 'demo-asset-load-01', x: 600, y: 120 },
    { assetId: 'demo-asset-meter-01', x: 600, y: 330 },
  ],
  connections: [
    { id: 'demo-edge-pv-inverter', sourceAssetId: 'demo-asset-pv-01', targetAssetId: 'demo-asset-inverter-01', kind: 'energy', direction: 'forward', value: 132, unit: 'кВт', isSimulated: true, label: 'PV · демо' },
    { id: 'demo-edge-grid-inverter', sourceAssetId: 'demo-asset-grid-01', targetAssetId: 'demo-asset-inverter-01', kind: 'energy', direction: 'forward', value: null, unit: 'кВт', isSimulated: true, label: 'Импорт · демо' },
    { id: 'demo-edge-battery-inverter', sourceAssetId: 'demo-asset-battery-01', targetAssetId: 'demo-asset-inverter-01', kind: 'energy', direction: 'bidirectional', value: null, unit: 'кВт', isSimulated: true, label: 'Заряд / разряд · демо' },
    { id: 'demo-edge-inverter-load', sourceAssetId: 'demo-asset-inverter-01', targetAssetId: 'demo-asset-load-01', kind: 'energy', direction: 'forward', value: 248, unit: 'кВт', isSimulated: true, label: 'Потребление · демо' },
    { id: 'demo-edge-load-meter', sourceAssetId: 'demo-asset-load-01', targetAssetId: 'demo-asset-meter-01', kind: 'data', direction: 'forward', value: null, isSimulated: true, label: 'Передача данных · демо' },
  ],
};
