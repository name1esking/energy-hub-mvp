
import { describe, it, expect } from "vitest";

import {
  buildDashboard,
  type DashboardInput,
} from "./dashboardBuilder";

import type {
  Asset,
  EnergyObject,
  EnergyService,
  Measurement,
} from "../types";

// ==========================================
// ТЕСТОВЫЕ ОБЪЕКТЫ
// ==========================================

const objectA: EnergyObject = {
  id: "site-1",
  name: "Solar Energy Hub",
  type: "energy_hub",
  timezone: "Europe/Moscow",
  status: "active",
  assetIds: ["solar-1", "battery-1", "grid-1"],
};



// ==========================================
// ФАБРИКИ ТЕСТОВЫХ ДАННЫХ
// ==========================================

function makeAsset(
  id: string,
  type: Asset["type"],
  objectId = "site-1"
): Asset {
  return {
    id,
    objectId,
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
    objectId = "site-1",
    assetId,
    value = 10,
    unit = "kW",
    timestamp = "2026-11-06T10:00:00Z",
    quality = "valid",
  } = input;

  return {
    id,
    objectId,
    assetId,
    metric,
    value,
    unit,
    timestamp,
    quality,
  };
}

function makeDashboard(
  overrides: Partial<DashboardInput> = {}
) {
  return buildDashboard({
    object: objectA,
    assets: [],
    measurements: [],
    events: [],
    services: [],
    ...overrides,
  });
}

// ==========================================
// ТЕСТ 1. ОБЪЕКТ СО ВСЕМ ОБОРУДОВАНИЕМ
// ==========================================

describe("Dashboard Builder", () => {

  it("создаёт все необходимые блоки для энергохаба", () => {
    const dashboard = makeDashboard({
      assets: [
        makeAsset("solar-1", "solar_panel"),
        makeAsset("battery-1", "battery"),
        makeAsset("grid-1", "grid_connection"),
      ],

      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "power",
          value: 12,
        }),
        makeMeasurement({
          id: "m2",
          metric: "generation",
          value: 8,
        }),
        makeMeasurement({
          id: "m3",
          metric: "consumption",
          value: 5,
        }),
        makeMeasurement({
          id: "m4",
          metric: "battery_soc",
          value: 75,
          unit: "%",
        }),
        makeMeasurement({
          id: "m5",
          metric: "grid_import",
          value: 3,
        }),
      ],

      events: [
        {
          id: "event-1",
          objectId: "site-1",
          title: "Test alert",
          description: "Test event",
          severity: "warning",
          createdAt: "2026-11-06T10:00:00Z",
          status: "new",
        },
      ],

      services: [
        {
          id: "service-1",
          objectId: "site-1",
          type: "peak_shaving",
          status: "connected",
          configuration: {},
        },
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

  // ==========================================
  // ТЕСТ 2. ОБЪЕКТ БЕЗ СОЛНЕЧНЫХ ПАНЕЛЕЙ
  // И БАТАРЕЙ
  // ==========================================

  it("не показывает блоки отсутствующего оборудования", () => {
    const dashboard = makeDashboard({
      assets: [],

      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "generation",
        }),
        makeMeasurement({
          id: "m2",
          metric: "battery_soc",
          unit: "%",
        }),
        makeMeasurement({
          id: "m3",
          metric: "grid_import",
        }),
      ],
    });

    const types = dashboard.widgets.map(
      (widget) => widget.type
    );

    expect(types).not.toContain("solar_generation");
    expect(types).not.toContain("battery_status");
    expect(types).not.toContain("grid_exchange");
  });

  // ==========================================
  // ТЕСТ 3. НЕКОРРЕКТНЫЕ И ОТСУТСТВУЮЩИЕ ДАННЫЕ
  // ==========================================

  it("не использует недостоверные измерения", () => {
    const dashboard = makeDashboard({
      measurements: [
        makeMeasurement({
          id: "m1",
          metric: "power",
          value: 15,
          quality: "suspicious",
        }),
        makeMeasurement({
          id: "m2",
          metric: "generation",
          value: null,
          quality: "missing",
        }),
        makeMeasurement({
          id: "m3",
          metric: "consumption",
          value: null,
          quality: "valid",
        }),
      ],
    });

    const types = dashboard.widgets.map(
      (widget) => widget.type
    );

    expect(types).not.toContain("overview");
    expect(types).not.toContain("power_chart");
    expect(types).not.toContain("energy_flow");

    expect(types).toContain("data_quality");
  });

  // ==========================================
  // ТЕСТ 4. ПОДКЛЮЧЁННЫЕ И ОТКЛЮЧЁННЫЕ СЕРВИСЫ
  // ==========================================

  it("показывает только подключённые сервисы", () => {
    const services: EnergyService[] = [
      {
        id: "service-1",
        objectId: "site-1",
        type: "peak_shaving",
        status: "connected",
        configuration: {},
      },
      {
        id: "service-2",
        objectId: "site-1",
        type: "pv_self_consumption",
        status: "disconnected",
        configuration: {},
      },
    ];

    const dashboard = makeDashboard({ services });

    const serviceWidgets = dashboard.widgets.filter(
      (widget) => widget.type === "service"
    );

    expect(serviceWidgets).toHaveLength(1);
    expect(serviceWidgets[0].serviceId).toBe("service-1");
  });

  // ==========================================
  // ТЕСТ 5. ИЗОЛЯЦИЯ ДАННЫХ ОБЪЕКТОВ
  // ==========================================

  it("не использует данные другого объекта", () => {
    const dashboard = makeDashboard({
      assets: [
        makeAsset("solar-2", "solar_panel", "site-2"),
      ],

      measurements: [
        makeMeasurement({
          id: "m1",
          objectId: "site-2",
          metric: "generation",
        }),
      ],

      object: objectA,
    });

    expect(dashboard.widgets).toHaveLength(0);

    expect(dashboard.objectId).toBe("site-1");
    expect(dashboard.emptyState).toBeDefined();
  });

  // ==========================================
  // ТЕСТ 6. ПУСТОЙ ОБЪЕКТ
  // ==========================================

  it("возвращает пустое состояние без данных", () => {
    const dashboard = makeDashboard();

    expect(dashboard.widgets).toHaveLength(0);

    expect(dashboard.emptyState).toBe(
      "Для этого объекта пока нет доступных данных и подключённых сервисов."
    );
  });

});
