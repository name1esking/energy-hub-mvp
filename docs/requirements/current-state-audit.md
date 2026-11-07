
# Current-state audit — Energy Hub MVP

**Дата проверки:** 7 ноября 2026  
**Базовая ветка:** `main`  
**Рабочая ветка документации:** `feature/qa`

## 1. Что уже находится в main

На момент проверки ветка `main` указывает на commit `ad5fd4be99dd77005fc4ebf55bb7b25bf0e411d1`.

В `main` находится стартовый React + TypeScript + Vite шаблон:
- Vite/React entry point и стартовый `src/App.tsx`;
- шаблонный экран Get started, счётчик и ссылки на документацию React/Vite;
- базовые CSS, конфигурация TypeScript/Vite и зависимости React.

В `main` пока отсутствуют:
- каталог `docs/`;
- модель данных Energy Hub;
- общие доменные типы и core-логика;
- интерфейс Energy Hub;
- демонстрационный набор энергетических данных.

**Вывод:** интегрированного Energy Hub MVP в `main` пока нет.

## 2. Что существует только в открытых Pull Requests

Все перечисленные PR на момент проверки открыты и не объединены с `main`.

| PR | Ветка | Содержимое | Статус |
|---|---|---|---|
| [#1](https://github.com/name1esking/energy-hub-mvp/pull/1) | `feature/data` | Demo data, локальные типы, словарь метрик, события, оборудование и проверки | Только PR |
| [#2](https://github.com/name1esking/energy-hub-mvp/pull/2) | `feature/qa` | Документация ролей, доступа, сценариев и QA | Текущий PR |
| [#3](https://github.com/name1esking/energy-hub-mvp/pull/3) | `feature/ui` | UI-компоненты Energy Hub, Dashboard, графики, события, качество данных и сервисы | Только PR |
| [#4](https://github.com/name1esking/energy-hub-mvp/pull/4) | `feature/core` | Общие TS-типы, permissions, Dashboard Builder, тесты и Draft-модель | Только PR |

### PR #1 — демонстрационные данные

В описании PR заявлены:
- 2 демонстрационных объекта;
- 17 единиц оборудования;
- 2352 измерения за 7 дней;
- 37 событий;
- словарь метрик и selectors;
- проверки демонстрационных данных.

Коды метрик предварительные. Локальные типы не являются общим контрактом.

### PR #3 — пользовательский интерфейс

В PR присутствуют:
- Header и Sidebar;
- RoleSwitcher;
- MetricCard и PowerChart;
- EnergyFlow;
- EventTimeline;
- AlertsPanel;
- DataQualityPanel;
- ServicesPanel;
- AssetQuickView;
- EnergyHubLayout.

Это UI-слой. Наличие переключателя ролей не доказывает наличие серверной авторизации. В описании PR указано, что backend не добавлялся.

### PR #4 — модель и core-логика

В PR находится [`docs/DATA_MODEL.md`](https://github.com/name1esking/energy-hub-mvp/blob/feature/core/docs/DATA_MODEL.md), версия 0.1 Draft.

Также добавлены:
- `src/types/index.ts` — общие TypeScript-типы;
- `src/logic/permissions.ts` — логика разрешений;
- `src/logic/dashboardBuilder.ts` — построение конфигурации Dashboard;
- `src/logic/dashboardBuilder.test.ts` — тесты Dashboard Builder.

Модель и код пока находятся в открытом PR, а не в `main`.

## 3. Что пока отсутствует или не подтверждено

- Слияние PR #1–#4 в `main`.
- Единая интегрированная сборка UI, core и demo data.
- Подключение demo data к UI и core в одной проверенной сборке.
- Backend и серверное хранение.
- Реальные источники телеметрии.
- Серверная авторизация.
- Утверждённая матрица прав.
- Единый окончательный словарь метрик.
- Согласованный формат качества данных.
- Полная спецификация управления энергетическими сервисами.
- Сквозные тесты объединённого приложения.

## 4. Обнаруженные расхождения между PR

| Область | DATA_MODEL.md в PR #4 | TS-типы в PR #4 | Demo data в PR #1 |
|---|---|---|---|
| Объект | `Site` | `EnergyObject` | `Site` |
| Событие | `Event` | `EnergyEvent` | `Event` |
| Сервис | `ServiceInstance` | `EnergyService` | Сервисы не заведены |
| Связь измерения | `siteId` | `objectId` | `siteId` |
| Тип зарядки | `charger` | `ev_charger` | `charger` |
| Статус Asset | `online/offline/warning/error` | `online/offline/warning/maintenance/unknown` | `online/offline/warning/error` |
| Качество Measurement | `complete/missing/stale/estimated/simulated` | `valid/missing/suspicious/invalid` | `complete/missing/stale/estimated/simulated` |
| Метрики | Русские названия | `power/energy/generation/consumption/grid_import/grid_export/battery_soc` | Например, `consumption_power`, `power_limit` |

### Что требуется сделать с расхождениями

Эти различия необходимо передать Tech Lead для согласования.

В рамках документационного аудита:
- не переименовываем сущности;
- не меняем общие TypeScript-типы;
- не исправляем модель данных;
- не выбираем самостоятельно окончательные enum и metric IDs.

## 5. Источники проверки

- [Репозиторий main](https://github.com/name1esking/energy-hub-mvp/tree/main)
- [PR #1 — Demo data](https://github.com/name1esking/energy-hub-mvp/pull/1)
- [PR #2 — Documentation](https://github.com/name1esking/energy-hub-mvp/pull/2)
- [PR #3 — UI](https://github.com/name1esking/energy-hub-mvp/pull/3)
- [PR #4 — Core architecture](https://github.com/name1esking/energy-hub-mvp/pull/4)
- [DATA_MODEL.md в PR #4](https://github.com/name1esking/energy-hub-mvp/blob/feature/core/docs/DATA_MODEL.md)

---

**Правило актуализации:** после слияния любого PR необходимо пересмотреть этот аудит и перенести соответствующие компоненты из категории «только в PR» в категорию «в main».
