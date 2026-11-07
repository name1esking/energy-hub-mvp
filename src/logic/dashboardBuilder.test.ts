import { describe, it, expect } from "vitest";

import {
  buildSiteDashboard,
  buildUserDashboard,
  getMeasurementQualityLabel,
  type SiteDashboardInput,
} from "./dashboardBuilder";

import type {
  Asset,
  Event,
  Measurement,
  ServiceInstance,
  Site,
  User,
} from "../types";

// ==========================================
// 1. ТЕСТОВЫЕ SITE
// ==========================================

const siteA: Site = {
  id: "site-1",
  name: "Solar Energy Hub",
  location: "Moscow",
  type: "industrial",
  portfolioId: "portfolio-1",
};

const siteB: Site = {
  id: "site-2",
  name: "Office Energy Hub",
  location: "Kazan",
  type: "office",
  portfolioId: "portfolio-2",
};

// ==========================================
// 2. ФАБРИКИ ТЕСТОВЫХ ДАННЫХ
// ==========================================

function makeAsset(
  id: string,
  type: Asset["type"],
  siteId = siteA.id
): Asset {
  return {
    id,
    siteId,
    name: id,
    type,
    status: "online",
  };
}

type MeasurementInput =
  Pick<Measurement, "id" | "metric"> &
  Partial<Omit<Measurement, "id" | "metric">>;

function makeMeasurement(
  input: MeasurementInput
): Measurement {
  const {
    id,
    metric,
    siteId = siteA.id,
    value = 10,
    unit = metric === "battery_soc"
      ? "%"
      : metric.endsWith("_energy")
        ? "кВт·ч"
        : "кВт",
    timestamp = "2026-11-06T10:00:00Z",
    quality = "complete",
  } = input;

  return {
    id,
    siteId,
    metric,
    value,
    unit,
    timestamp,
    quality,
  };
}

function makeEvent(
  id = "event-1",
  siteId = siteA.id
): Event {
  return {
    id,
    siteId,
    title: "Test alert",
    description: "Test event",
    severity: "warning",
    status: "open",
    timestamp: "2026-11-06T10:00:00Z",
  };
}

function makeService(
  id: string,
  status: ServiceInstance["status"],
  siteId = siteA.id
): ServiceInstance {
  return {
    id,
    siteId,
    type: "peak_shaving",
    status,
    configuration: {},
  };
}

function makeUser(
  role: User["role"],
  overrides: Partial<User> = {}
): User {
  return {
    id: "user-1",
    name: "Test User",
    role,
    ...overrides,
  };
}

function makeDashboard(
  overrides: Partial<SiteDashboardInput> = {}
) {
return buildSiteDashboard({
    site: siteA,
    assets: [],
    measurements: [],
    events: [],
    services: [],
    ...overrides,
  });
}

// ==========================================
// 3. DASHBOARD BUILDER — ШЕСТЬ ОСНОВНЫХ ТЕСТОВ
// ==========================================

describe("Dashboard Builder", () => {

  it("создаёт все необходимые блоки при наличии данных", () => {
    const dashboard = makeDashboard({
      assets: [
        makeAsset("solar-1", "solar_panel"),
        makeAsset("battery-1", "battery"),
        makeAsset("meter-1", "meter"),
      ],

      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "consumption_power",
          value: 12,
        }),
        makeMeasurement({
          id: "m2",
          metric: "generation_power",
          value: 8,
        }),
        makeMeasurement({
          id: "m3",
          metric: "consumption_energy",
          value: 5,
        }),
        makeMeasurement({
          id: "m4",
          metric: "generation_energy",
          value: 7,
        }),
        makeMeasurement({
          id: "m5",
          metric: "battery_soc",
          value: 75,
        }),
        makeMeasurement({
          id: "m6",
          metric: "grid_export_energy",
          value: 3,
        }),
      ],

      events: [
        makeEvent(),
      ],

      services: [
        makeService("service-1", "connected"),
      ],
    });

    const types = dashboard.widgets.map(
      (widget) => widget.type
    );

    expect(types).toContain("overview");
    expect(types).toContain("power_chart");
    expect(types).toContain("energy_flow");
    expect(types).toContain("solar_generation");
    expect(types).toContain("battery_status");
    expect(types).toContain("grid_exchange");
    expect(types).toContain("alerts");
    expect(types).toContain("data_quality");
    expect(types).toContain("service");

    expect(dashboard.emptyState).toBeUndefined();
  });

  it("не показывает блоки отсутствующего оборудования", () => {
    const dashboard = makeDashboard({
      assets: [],

      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "generation_power",
        }),
        makeMeasurement({
          id: "m2",
          metric: "battery_soc",
        }),
      ],
    });

    const types = dashboard.widgets.map(
      (widget) => widget.type
    );

    expect(types).not.toContain("solar_generation");
    expect(types).not.toContain("battery_status");
  });

  it("исключает missing и null из отображаемых числовых показателей", () => {
    const dashboard = makeDashboard({
      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "consumption_power",
          value: 15,
          quality: "missing",
        }),
        makeMeasurement({
          id: "m2",
          metric: "generation_power",
          value: null,
          quality: "complete",
        }),
        makeMeasurement({
          id: "m3",
          metric: "consumption_energy",
          value: null,
          quality: "missing",
        }),
      ],
    });

    const types = dashboard.widgets.map(
      (widget) => widget.type
    );

    expect(types).not.toContain("overview");
    expect(types).not.toContain("power_chart");
    expect(types).not.toContain("energy_flow");

    // Исходные измерения существуют,
    // поэтому блок качества данных сохраняется.
    expect(types).toContain("data_quality");
  });

  it("показывает только подключённые сервисы", () => {
    const dashboard = makeDashboard({
      services: [
        makeService("service-1", "connected"),
        makeService("service-2", "disconnected"),
      ],
    });

    const serviceWidgets = dashboard.widgets.filter(
      (widget) => widget.type === "service"
    );

    expect(serviceWidgets).toHaveLength(1);
    expect(serviceWidgets[0].serviceId).toBe("service-1");
  });

  it("не использует данные другого Site", () => {
    const dashboard = makeDashboard({
      assets: [
        makeAsset("solar-2", "solar_panel", "site-2"),
      ],

      measurements: [
        makeMeasurement({
          id: "m1",
          siteId: "site-2",
          metric: "generation_power",
        }),
      ],

      events: [
        makeEvent("event-2", "site-2"),
      ],

      services: [
        makeService("service-2", "connected", "site-2"),
      ],
    });

    expect(dashboard.widgets).toHaveLength(0);
    expect(dashboard.siteId).toBe("site-1");
    expect(dashboard.emptyState).toBeTruthy();
  });

  it("возвращает пустое состояние без данных", () => {
    const dashboard = makeDashboard();

    expect(dashboard.widgets).toHaveLength(0);
    expect(dashboard.emptyState).toBeTruthy();
  });

});

// ==========================================
// 4. КАЧЕСТВО ДАННЫХ
// ==========================================

describe("Measurement Data Quality", () => {

  it("поддерживает все пять статусов качества данных", () => {
    const qualities: Measurement["quality"][] = [
      "complete",
      "missing",
      "stale",
      "estimated",
      "simulated",
    ];

    for (const quality of qualities) {
      const label = getMeasurementQualityLabel(quality);

      expect(label).toBeTruthy();
      expect(typeof label).toBe("string");
    }
  });

  it("не исключает stale, estimated и simulated из отображения", () => {
    const dashboard = makeDashboard({
      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "consumption_power",
          quality: "stale",
        }),
        makeMeasurement({
          id: "m2",
          metric: "generation_power",
          quality: "estimated",
        }),
        makeMeasurement({
          id: "m3",
          metric: "consumption_energy",
          quality: "simulated",
        }),
      ],
    });

    const types = dashboard.widgets.map(
      (widget) => widget.type
    );

    expect(types).toContain("overview");
    expect(types).toContain("power_chart");
    expect(types).toContain("energy_flow");
    expect(types).toContain("data_quality");
  });

});

// ==========================================
// 5. ДОСТУП ПО РОЛЯМ
// ==========================================

describe("User Dashboard Permissions", () => {

  it("platform_admin видит все Site", () => {
    const user = makeUser("platform_admin");

    const dashboard = buildUserDashboard({
      user,
      sites: [siteA, siteB],
      assets: [],
      measurements: [],
      events: [],
      services: [],
    });

    expect(dashboard.role).toBe("platform_admin");

    expect(
      dashboard.dashboards.map((item) => item.siteId)
    ).toEqual(["site-1", "site-2"]);
  });

  it("portfolio_owner видит только объекты своего Portfolio", () => {
    const user = makeUser("portfolio_owner", {
      portfolioIds: ["portfolio-1"],
    });

    const dashboard = buildUserDashboard({
      user,
      sites: [siteA, siteB],
      assets: [],
      measurements: [],
      events: [],
      services: [],
    });

    expect(
      dashboard.dashboards.map((item) => item.siteId)
    ).toEqual(["site-1"]);
  });

  it("hub_operator видит только назначенные siteIds", () => {
    const user = makeUser("hub_operator", {
      siteIds: ["site-2"],
    });

    const dashboard = buildUserDashboard({
      user,
      sites: [siteA, siteB],
      assets: [],
      measurements: [],
      events: [],
      services: [],
    });

    expect(
      dashboard.dashboards.map((item) => item.siteId)
    ).toEqual(["site-2"]);
  });

  it("building_owner видит назначенный Site без ограничения по типу", () => {
    const user = makeUser("building_owner", {
      siteIds: ["site-1"],
    });

    const dashboard = buildUserDashboard({
      user,
      sites: [siteA, siteB],
      assets: [],
      measurements: [],
      events: [],
      services: [],
    });

    // siteA имеет тип industrial.
    // Доступ определяется назначенным siteId.
    expect(
      dashboard.dashboards.map((item) => item.siteId)
    ).toEqual(["site-1"]);
  });

  it("не предоставляет Dashboard пользователю без доступа", () => {
    const user = makeUser("hub_operator", {
      siteIds: [],
    });

    const dashboard = buildUserDashboard({
      user,
      sites: [siteA, siteB],
      assets: [],
      measurements: [],
      events: [],
      services: [],
    });

    expect(dashboard.dashboards).toHaveLength(0);
    expect(dashboard.emptyState).toBeTruthy();
  });

});