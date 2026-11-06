
import type {
  Asset,
  EnergyEvent,
  EnergyObject,
  EnergyService,
  Measurement,
  MeasurementMetric,
  ServiceType,
} from "../types";

// Типы блоков, которые можно разместить на дашборде
export type DashboardWidgetType =
  | "overview"
  | "power_chart"
  | "energy_flow"
  | "solar_generation"
  | "battery_status"
  | "grid_exchange"
  | "alerts"
  | "data_quality"
  | "service";

// Описание одного блока
export interface DashboardWidget {
  id: string;
  type: DashboardWidgetType;
  title: string;
  description: string;
  priority: number;
  assetIds?: string[];
  serviceId?: string;
  serviceType?: ServiceType;
}

// Итоговая структура дашборда
export interface DashboardConfig {
  objectId: string;
  objectName: string;
  widgets: DashboardWidget[];
  emptyState?: string;
}

// Все данные, необходимые для построения дашборда
export interface DashboardInput {
  object: EnergyObject;
  assets: Asset[];
  measurements: Measurement[];
  events: EnergyEvent[];
  services: EnergyService[];
}

// Названия энергетических сервисов
const SERVICE_TITLES: Record<ServiceType, string> = {
  peak_shaving: "Peak Shaving",
  pv_self_consumption: "PV Self-Consumption",
};

// Главная функция построения дашборда
export function buildDashboard(
  input: DashboardInput
): DashboardConfig {
  const {
    object,
    assets,
    measurements,
    events,
    services,
  } = input;

  // Получаем оборудование выбранного объекта
  const objectAssets = assets.filter(
    (asset) => asset.objectId === object.id
  );

  // Получаем измерения выбранного объекта
  const objectMeasurements = measurements.filter(
    (measurement) => measurement.objectId === object.id
  );

  // Получаем события выбранного объекта
  const objectEvents = events.filter(
    (event) => event.objectId === object.id
  );

  // Получаем только подключённые сервисы
  const connectedServices = services.filter(
    (service) =>
      service.objectId === object.id &&
      service.status === "connected"
  );

  // Учитываем только достоверные измерения
  const validMeasurements = objectMeasurements.filter(
    (measurement) =>
      measurement.quality === "valid" &&
      measurement.value !== null
  );

  // Проверяем наличие конкретного показателя
  const hasMetric = (metric: MeasurementMetric): boolean => {
    return validMeasurements.some(
      (measurement) => measurement.metric === metric
    );
  };

  // Проверяем наличие хотя бы одного показателя из списка
  const hasAnyMetric = (
    metrics: MeasurementMetric[]
  ): boolean => {
    return metrics.some(hasMetric);
  };

  // Проверяем наличие оборудования определённого типа
  const getAssets = (type: Asset["type"]): Asset[] => {
    return objectAssets.filter(
      (asset) => asset.type === type
    );
  };

  const widgets: DashboardWidget[] = [];

  // 1. Общий обзор
  if (validMeasurements.length > 0) {
    widgets.push({
      id: "overview",
      type: "overview",
      title: "Общие показатели",
      description: "Основные энергетические показатели объекта",
      priority: 1,
    });
  }

  // 2. График мощности
  if (hasMetric("power")) {
    widgets.push({
      id: "power-chart",
      type: "power_chart",
      title: "Динамика мощности",
      description: "Изменение мощности во времени",
      priority: 2,
    });
  }

  // 3. Энергетические потоки
  if (
    hasAnyMetric([
      "generation",
      "consumption",
      "grid_import",
      "grid_export",
    ])
  ) {
    widgets.push({
      id: "energy-flow",
      type: "energy_flow",
      title: "Энергетические потоки",
      description: "Генерация, потребление и обмен с сетью",
      priority: 3,
    });
  }

  // 4. Солнечная генерация
  const solarPanels = getAssets("solar_panel");

  if (
    solarPanels.length > 0 &&
    hasMetric("generation")
  ) {
    widgets.push({
      id: "solar-generation",
      type: "solar_generation",
      title: "Солнечная генерация",
      description: "Показатели генерации солнечных панелей",
      priority: 4,
      assetIds: solarPanels.map((asset) => asset.id),
    });
  }

  // 5. Состояние батареи
  const batteries = getAssets("battery");

  if (
    batteries.length > 0 &&
    hasMetric("battery_soc")
  ) {
    widgets.push({
      id: "battery-status",
      type: "battery_status",
      title: "Состояние батарей",
      description: "Уровень заряда накопителей энергии",
      priority: 5,
      assetIds: batteries.map((asset) => asset.id),
    });
  }

  // 6. Обмен энергией с сетью
  const gridConnections = getAssets("grid_connection");

  if (
    gridConnections.length > 0 &&
    hasAnyMetric(["grid_import", "grid_export"])
  ) {
    widgets.push({
      id: "grid-exchange",
      type: "grid_exchange",
      title: "Обмен с сетью",
      description: "Получение и передача электроэнергии",
      priority: 6,
      assetIds: gridConnections.map((asset) => asset.id),
    });
  }

  // 7. Уведомления
  if (objectEvents.length > 0) {
    widgets.push({
      id: "alerts",
      type: "alerts",
      title: "События и уведомления",
      description: "Проблемы и события энергетического объекта",
      priority: 7,
    });
  }

  // 8. Качество данных
  if (objectMeasurements.length > 0) {
    widgets.push({
      id: "data-quality",
      type: "data_quality",
      title: "Качество данных",
      description: "Проверка достоверности измерений",
      priority: 8,
    });
  }

  // 9. Подключённые энергетические сервисы
  connectedServices.forEach((service, index) => {
    widgets.push({
      id: `service-${service.id}`,
      type: "service",
      title: SERVICE_TITLES[service.type],
      description: "Подключённый энергетический сервис",
      priority: 9 + index,
      serviceId: service.id,
      serviceType: service.type,
    });
  });

  // Сортируем блоки по приоритету
  widgets.sort((a, b) => a.priority - b.priority);

  return {
    objectId: object.id,
    objectName: object.name,
    widgets,
    emptyState:
      widgets.length === 0
        ? "Для этого объекта пока нет доступных данных и подключённых сервисов."
        : undefined,
  };
}
