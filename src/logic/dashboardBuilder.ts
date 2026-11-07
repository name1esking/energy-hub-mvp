
import type {
  Asset,
  Event,
  Measurement,
  MeasurementMetric,
  ServiceInstance,
  ServiceType,
  Site,
  User,
} from "../types";

import { canAccessSite } from "./permissions";

// ==========================================
// 1. ТИПЫ БЛОКОВ DASHBOARD
// ==========================================

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

// ==========================================
// 2. ОПИСАНИЕ БЛОКА
// ==========================================

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

// ==========================================
// 3. КОНФИГУРАЦИЯ DASHBOARD ОДНОГО SITE
// ==========================================

export interface DashboardConfig {
  siteId: string;
  siteName: string;
  widgets: DashboardWidget[];
  emptyState?: string;
}

// ==========================================
// 4. ВХОДНЫЕ ДАННЫЕ ОДНОГО SITE
// ==========================================

export interface SiteDashboardInput {
  site: Site;
  assets: Asset[];
  measurements: Measurement[];
  events: Event[];
  services: ServiceInstance[];
}

// ==========================================
// 5. ВХОДНЫЕ ДАННЫЕ ПОЛЬЗОВАТЕЛЯ
// ==========================================

export interface UserDashboardInput {
  user: User;
  sites: Site[];
  assets: Asset[];
  measurements: Measurement[];
  events: Event[];
  services: ServiceInstance[];
}

// ==========================================
// 6. DASHBOARD ПОЛЬЗОВАТЕЛЯ
// ==========================================

export interface UserDashboardConfig {
  userId: string;
  role: User["role"];
  dashboards: DashboardConfig[];
  emptyState?: string;
}

// ==========================================
// 7. НАЗВАНИЯ ЭНЕРГЕТИЧЕСКИХ СЕРВИСОВ
// ==========================================

const SERVICE_TITLES: Record<ServiceType, string> = {
  peak_shaving: "Peak Shaving",
  pv_self_consumption: "PV Self-Consumption",
};

// ==========================================
// 8. ОТОБРАЖЕНИЕ КАЧЕСТВА ИЗМЕРЕНИЙ
// ==========================================

export function getMeasurementQualityLabel(
  quality: Measurement["quality"]
): string {
  switch (quality) {
    case "complete":
      return "Полные данные";

    case "missing":
      return "Данные отсутствуют";

    case "stale":
      return "Устаревшие данные";

    case "estimated":
      return "Расчётные данные";

    case "simulated":
      return "Демонстрационные данные";
  }
}

// Измерение можно использовать для отображения,
// если у него есть значение и оно не помечено missing.
function isDisplayableMeasurement(
  measurement: Measurement
): boolean {
  return (
    measurement.value !== null &&
    measurement.quality !== "missing"
  );
}

// ==========================================
// 9. ПОСТРОЕНИЕ DASHBOARD ОДНОГО SITE
// ==========================================

export function buildSiteDashboard(
  input: SiteDashboardInput
): DashboardConfig {
  const {
    site,
    assets,
    measurements,
    events,
    services,
  } = input;

  // Оставляем только данные выбранного Site.
  const siteAssets = assets.filter(
    (asset) => asset.siteId === site.id
  );

  const siteMeasurements = measurements.filter(
    (measurement) => measurement.siteId === site.id
  );

  const siteEvents = events.filter(
    (event) => event.siteId === site.id
  );

  const siteServices = services.filter(
    (service) => service.siteId === site.id
  );

  // Учитываем качество данных, не удаляя исходные измерения.
  const displayableMeasurements = siteMeasurements.filter(
    isDisplayableMeasurement
  );

  // Только подключённые сервисы.
  const connectedServices = siteServices.filter(
    (service) => service.status === "connected"
  );

  // Проверка наличия конкретного показателя.
  const hasMetric = (
    metric: MeasurementMetric
  ): boolean => {
    return displayableMeasurements.some(
      (measurement) => measurement.metric === metric
    );
  };

  // Проверка наличия хотя бы одного показателя.
  const hasAnyMetric = (
    metrics: MeasurementMetric[]
  ): boolean => {
    return metrics.some(hasMetric);
  };

  // Получение оборудования определённого типа.
  const getAssets = (
    type: Asset["type"]
  ): Asset[] => {
    return siteAssets.filter(
      (asset) => asset.type === type
    );
  };

  const widgets: DashboardWidget[] = [];

  // 1. Общий обзор.
  if (displayableMeasurements.length > 0) {
    widgets.push({
      id: "overview",
      type: "overview",
      title: "Общие показатели",
      description: "Основные энергетические показатели объекта",
      priority: 1,
    });
  }

  // 2. График мощности.
  if (
    hasAnyMetric([
      "consumption_power",
      "generation_power",
    ])
  ) {
    widgets.push({
      id: "power-chart",
      type: "power_chart",
      title: "Динамика мощности",
      description: "Изменение потребления и генерации мощности",
      priority: 2,
    });
  }

  // 3. Энергетические потоки.
  if (
    hasAnyMetric([
      "generation_energy",
      "consumption_energy",
      "grid_export_energy",
    ])
  ) {
    widgets.push({
      id: "energy-flow",
      type: "energy_flow",
      title: "Энергетические потоки",
      description: "Генерация, потребление и передача энергии",
      priority: 3,
    });
  }

  // 4. Солнечная генерация.
  const solarPanels = getAssets("solar_panel");

  if (
    solarPanels.length > 0 &&
    hasAnyMetric([
      "generation_power",
      "generation_energy",
    ])
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

  // 5. Состояние батарей.
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

  // 6. Обмен энергией с сетью.
  // Исходный показатель grid_import_energy не добавляем:
  // импорт должен поступать из согласованного расчётного selector.
  const meters = getAssets("meter");

  if (hasMetric("grid_export_energy")) {
    widgets.push({
      id: "grid-exchange",
      type: "grid_exchange",
      title: "Обмен с сетью",
      description: "Передача электроэнергии в сеть",
      priority: 6,
      ...(meters.length > 0
        ? { assetIds: meters.map((asset) => asset.id) }
        : {}),
    });
  }

  // 7. События и уведомления.
  if (siteEvents.length > 0) {
    widgets.push({
      id: "alerts",
      type: "alerts",
      title: "События и уведомления",
      description: "Проблемы и события энергетического объекта",
      priority: 7,
    });
  }

  // 8. Качество данных.
  // Показываем блок даже тогда, когда все измерения missing.
  if (siteMeasurements.length > 0) {
    widgets.push({
      id: "data-quality",
      type: "data_quality",
      title: "Качество данных",
      description: "Проверка достоверности и актуальности измерений",
      priority: 8,
    });
  }

  // 9. Подключённые энергетические сервисы.
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

  // Сортировка по приоритету.
  widgets.sort((a, b) => a.priority - b.priority);

  return {
    siteId: site.id,
    siteName: site.name,
    widgets,
    emptyState:
      widgets.length === 0
        ? "Для этого объекта пока нет доступных данных и подключённых сервисов."
        : undefined,
  };
}

// ==========================================
// 10. ПОСТРОЕНИЕ DASHBOARD ПОЛЬЗОВАТЕЛЯ
// ==========================================

export function buildUserDashboard(
  input: UserDashboardInput
): UserDashboardConfig {
  const {
    user,
    sites,
    assets,
    measurements,
    events,
    services,
  } = input;

  // Сначала проверяем права доступа.
  const accessibleSites = sites.filter(
    (site) => canAccessSite(user, site)
  );

  // Строим Dashboard только для доступных объектов.
  const dashboards = accessibleSites.map(
    (site) =>
      buildSiteDashboard({
        site,
        assets,
        measurements,
        events,
        services,
      })
  );

  return {
    userId: user.id,
    role: user.role,
    dashboards,
    emptyState:
      dashboards.length === 0
        ? "Нет доступных энергетических объектов."
        : undefined,
  };
}