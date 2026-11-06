# Energy Hub: демонстрационные данные по DATA_MODEL.md v0.1

**Ветка для передачи:** только `feature/data`. **Версия источника:** `DATA_MODEL.md` v0.1 (Draft, Tech Lead).  
Общие типы, `App.tsx`, конфигурация проекта, роли и бизнес-логика сервисов этим комплектом **не изменяются**.

## Содержимое

```text
src/data/demo/
  types.ts               локальные типы Portfolio/Site/Asset/Measurement/Event
  sites.ts               один Portfolio и два вымышленных Site
  equipment.ts           17 Asset, все 6 type из DATA_MODEL.md
  scenarios.ts           интервалы неисправностей и пропусков, пики нагрузки
  readings.ts            2352 Measurement = 2 Site × 7 дней × 24 ч × 7 показателей
  events.ts              37 Event: неисправности, восстановления, пропуски, лимиты
  metrics.ts             словарь 7 согласованных метрик и формулы UI
  selectors.ts           фильтры, агрегаты и оценка качества, без React
  invalidExamples.ts     4 намеренно ошибочные Measurement, НЕ основные данные
  validate.ts            проверки схемы, ссылок, единиц и энергетики
  ExampleEnergyPanel.tsx пример React, не внедрён в App.tsx
  index.ts               публичные экспорты
scripts/
  validate-demo-data.mjs проверочный скрипт с Vite

docs/
  demo-energy-data.md    этот файл
  metrics-dictionary.md полный словарь и формулы
  tech-lead-proposals.md вопросы к Tech Lead
```

## Объекты и оборудование

| Site.id | Название | Тип | Локация | Количество Asset |
|---|---|---|---|---:|
| `site-astra` | Энергокомплекс «Астра-9» | `industrial` | вымышленная зона «Северная Линия» | 9 |
| `site-lumen` | Бизнес-центр «Люмен» | `office` | вымышленный квартал «Мозаика» | 8 |

Portfolio: `portfolio-nova` — Учебный портфель «Нова». Все названия и места — вымышленные. Персональных данных нет.

`Asset.type`: `solar_panel`, `battery`, `inverter`, `meter`, `charger`, `load` — именно названия из документа. `Asset.status`: `online`, `offline`, `warning`, `error` (в текущем состоянии батарея B имеет `warning`; временные отключения показаны в истории Event, оборудование восстановлено). Параметры представлены в локальном `parameters` (структура параметров в DATA_MODEL.md не утверждена).

- A: 40 панелей × 0.55 кВт = 22 кВт DC; 2 инвертора × 11 кВт AC; батарея 24 кВт·ч, SOC 58%; 3 счётчика; зарядка 7.4 кВт; нагрузка.
- B: 28 панелей × 0.50 кВт = 14 кВт DC; инвертор 14 кВт AC; батарея 18 кВт·ч, SOC 18%; 3 счётчика; зарядка 11 кВт; нагрузка.

**Упрощение демо:** батареи есть, но в 7-дневной истории **не заряжаются и не разряжаются**, SOC постоянен. Это позволяет математически согласовать вход/выход сети без выдумывания дополнительных типов Measurement, которых пока нет в модели. Событие низкого SOC у объекта B согласовано с его текущим состоянием.

## История, пропуски, неисправности

- История: **2026-10-30 00:00 UTC — 2026-11-06 00:00 UTC** (правая граница исключена). 168 почасовых интервалов на Site.
- **2352** строки `Measurement`, из них **7** с `value:null, quality:'missing'`; **615** содержат настоящий ноль.
- `stale` и `estimated` есть как отдельные примеры; исходное число сохранено.
- **37** событий (`Event`) — включая 26 подтверждённых почасовых превышений лимита, 3 отключения и 3 восстановления оборудования, 4 события по пропускам, 1 открытое предупреждение о низком SOC.
- Пропуски: потребление и экспорт A, солнечная генерация, SOC и лимит B. В сценарии временно пропадают именно показания, а не физическая энергия.
- **4 некорректные записи** только в `invalidMeasurementExamples`, они намеренно **не включены** в `measurements` и не должны отображаться на рабочих графиках.

Показатель качества: полнота (`null` / ожидаемые данные) и демонстрационный взвешенный индекс. Они вычисляются selector-функциями, не являются новыми Measurement.

## Поля и назначение

| Сущность | Поля в файлах | Назначение / статус |
|---|---|---|
| Portfolio | `id`, `name` | Группа двух Site; базовые поля пока не детализированы в модели. |
| Site | `id`, `name`, `location`, `type`, `portfolioId` | Объект, место и тип, связь с Portfolio. Названия связующих полей и enum `type` — локальные предложения. |
| Asset | `id`, `name`, `type`, `siteId`, `status`, `parameters` | Все пять обязательных полей и характеристики. `parameters` — предложенный контейнер параметров. |
| Measurement | `id`, `siteId`, `metric`, `value`, `unit`, `timestamp`, `quality` | **Точно названия полей из модели**. `metric` коды ещё на согласовании. |
| Event | `id`, `siteId`, `title`, `description`, `severity`, `status`, `timestamp` | **Точно названия полей из модели**. Предложение значений `status`: `open`/`resolved`. |

Связи `Site` ↔ `Asset`/`Measurement`/`Event` определяются по `siteId` без дублирования массивов внутри Site. Данные сервисов, пользователей и Dashboard **не создаются**: модель не определяет их поля, а команда распределила эти обязанности между другими участниками. Ни один сервис не обозначен подключённым без согласования.

## Подключение к React

```tsx
import { sites, getLatestMeasurement, getSiteDataQuality, formatMetric } from './data/demo/index.ts'

function ShortEnergyView() {
  return <div>{sites.map(site => {
    const m = getLatestMeasurement(site.id, 'consumption_power')
    const quality = getSiteDataQuality(site.id)
    return <div key={site.id}>
      <h3>{site.name}</h3>
      <span>{formatMetric(m?.value ?? null, 'кВт')}</span>
      <span> Полнота: {formatMetric(quality.completenessPercent, '%')}</span>
    </div>
  })}</div>
}
```

Вариант для UI-участника: `import { ExampleEnergyPanel } from './data/demo/ExampleEnergyPanel.tsx'` и рендер `<ExampleEnergyPanel />`, **только после согласования с владельцем интерфейса**. Наш комплект не трогает `App.tsx`.

```ts
import { getGridExchangeAt, getDailyEnergySummaries, getSiteEvents } from './data/demo/index.ts'
const hours = getGridExchangeAt('site-astra', '2026-11-02T12:00:00.000Z')
// hours.exportKwh === null, hours.importKwh === null — данные потеряны, НЕ нули.
const days = getDailyEnergySummaries('site-astra')
const events = getSiteEvents('site-astra')
```

## Проверка

Из **корня проекта** после установки зависимостей:

```powershell
npm.cmd run build
npm.cmd run lint
node .\scripts\validate-demo-data.mjs
```

Третья команда валидирует ссылочную целостность, все единицы, уникальность ID, равенство `кВт × 1 ч = кВт·ч`, мощности оборудования, работу отключённого инвертора, соотношение потребление/генерация/экспорт, события превышений, `null` и настоящие нули, а также факт обнаружения каждой некорректной fixture.

**Важно:** скрипт использует установленный Vite, не меняет `package.json`, не устанавливает зависимости и не требует `ts-node`/`tsx`. Если скрипт, сборка или линтер сообщают об ошибке — передайте весь вывод, не делайте push до исправления.

## Передача в GitHub (под руководством, по одной команде за раз)

1. Убедиться, что ветка `feature/data`: `git branch --show-current`.
2. После проверок посмотреть изменения: `git status`.
3. Добавить файлы: `git add .` (предварительно проверить, что нет посторонних изменений).
4. Коммит: `git commit -m "Add my work"`.
5. Первый push: `git push -u origin feature/data`, последующие: `git push`.
6. На GitHub `name1esking/energy-hub-mvp` создать **Pull Request: base `main`, compare `feature/data`**, приложить ссылку на документацию и результаты проверок.
7. **Merge не делать:** решение за Tech Lead.

Оговорка для Tech Lead: общие типы ещё не опубликованы в рамках текущих исходников. После согласования `DATA_MODEL.md` заменить импорты локальных интерфейсов на общие **отдельным согласованным PR**.
