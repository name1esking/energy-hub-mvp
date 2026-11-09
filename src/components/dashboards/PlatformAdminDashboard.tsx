import {
  Activity,
  BatteryCharging,
  Building2,
  Database,
  Layers3,
  MapPin,
} from 'lucide-react';

import { MetricCard } from '../MetricCard';
import { PowerChart } from '../PowerChart';
import { AlertsPanel } from '../AlertsPanel';
import { EventTimeline } from '../EventTimeline';
import { DataQualityPanel } from '../DataQualityPanel';
import { ServicesPanel } from '../ServicesPanel';

import type { DashboardProps } from './types';

export function PlatformAdminDashboard({
  energyObject,
  assets,
  metrics,
  events,
  services,
  chartData,
  qualityRows,
  theme,
  period,
  onEventSelect,
  onServiceSelect,
  onMeasurementSelect,
}: DashboardProps) {
  return (
    <div className="role-dashboard role-dashboard--admin">
      <section className="role-metrics-block admin-metrics-block">
        <div className="role-section-heading admin-section-heading">
          <div className="admin-heading-copy">
            <h2>Обзор энергетических показателей</h2>
            <p>Показатели доступного демонстрационного энергообъекта</p>
          </div>

          <span className="admin-scope-badge" aria-label="Демонстрационный набор платформы">
            <span className="admin-scope-dot" />
            PLATFORM DEMO
          </span>
        </div>

        <div className="metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <div className="dashboard-grid admin-dashboard-grid">
        <div className="dashboard-main-column">
          <section className="panel admin-objects-panel" aria-labelledby="admin-objects-title">
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 id="admin-objects-title">Энергетические объекты</h2>
                  <p>Доступные объекты демонстрационного набора</p>
                </div>
              </div>

              <span className="admin-count-badge">1 объект</span>
            </div>

            <div className="admin-object-summary">
              <div className="admin-object-icon">
                <Building2 size={23} />
              </div>

              <div className="admin-object-copy">
                <span className="admin-object-kicker">Текущий энергообъект</span>
                <h3>{energyObject.name}</h3>
                <p>{energyObject.typeLabel ?? 'Энергетический объект'}</p>

                {energyObject.locationLabel && (
                  <div className="admin-object-location">
                    <MapPin size={13} />
                    <span>{energyObject.locationLabel}</span>
                  </div>
                )}
              </div>

              <span className="admin-object-status">Демо</span>
            </div>

            <div className="admin-objects-footnote">
              Сейчас доступен один демонстрационный энергообъект. Реестр остальных объектов
              будет подключён после согласования общей модели данных.
            </div>
          </section>

          <PowerChart
            data={chartData}
            theme={theme}
            period={period}
            title="Энергетическая аналитика"
          />

          <section
            id="alerts-events"
            className="admin-events-section"
            aria-label="Уведомления и история событий"
          >
            <AlertsPanel events={events} onEventSelect={onEventSelect} />
            <EventTimeline events={events} onEventSelect={onEventSelect} />
          </section>
        </div>

        <aside className="dashboard-side-column admin-side-column">
          <section className="panel admin-inventory-panel" aria-labelledby="admin-inventory-title">
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Layers3 size={18} />
                </div>
                <div>
                  <h2 id="admin-inventory-title">Состав платформы</h2>
                  <p>Элементы переданного демо-набора</p>
                </div>
              </div>
            </div>

            <div className="admin-inventory-current">
              <div className="admin-inventory-current-icon">
                <Building2 size={17} />
              </div>
              <div className="admin-inventory-current-copy">
                <span>Текущий энергообъект</span>
                <strong>{energyObject.name}</strong>
                <small>{energyObject.typeLabel ?? 'Энергетический объект'}</small>
              </div>
              <span className="admin-inventory-current-status">Демо</span>
            </div>

            <div className="admin-inventory-summary">
              <div className="admin-inventory-stat admin-inventory-stat--blue">
                <div className="admin-inventory-stat-top">
                  <span className="admin-inventory-stat-icon">
                    <Layers3 size={16} />
                  </span>
                  <strong>{assets.length}</strong>
                </div>
                <span className="admin-inventory-stat-label">Единицы оборудования</span>
                <span className="admin-inventory-stat-caption">Передано для объекта</span>
              </div>

              <div className="admin-inventory-stat admin-inventory-stat--amber">
                <div className="admin-inventory-stat-top">
                  <span className="admin-inventory-stat-icon">
                    <Activity size={16} />
                  </span>
                  <strong>{events.length}</strong>
                </div>
                <span className="admin-inventory-stat-label">События</span>
                <span className="admin-inventory-stat-caption">В доступной истории</span>
              </div>

              <div className="admin-inventory-stat admin-inventory-stat--teal">
                <div className="admin-inventory-stat-top">
                  <span className="admin-inventory-stat-icon">
                    <BatteryCharging size={16} />
                  </span>
                  <strong>{services.length}</strong>
                </div>
                <span className="admin-inventory-stat-label">Энергетические сервисы</span>
                <span className="admin-inventory-stat-caption">Передано для объекта</span>
              </div>

              <div className="admin-inventory-stat admin-inventory-stat--violet">
                <div className="admin-inventory-stat-top">
                  <span className="admin-inventory-stat-icon">
                    <Database size={16} />
                  </span>
                  <strong>{qualityRows.length}</strong>
                </div>
                <span className="admin-inventory-stat-label">Каналы качества</span>
                <span className="admin-inventory-stat-caption">В матрице измерений</span>
              </div>
            </div>

            <div className="admin-inventory-note">
              Счётчики отражают только данные, переданные для выбранного демонстрационного
              энергообъекта, а не статистику всей платформы.
            </div>
          </section>

          <section className="panel admin-comparison-panel" aria-labelledby="admin-comparison-title">
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 id="admin-comparison-title">Сравнение объектов</h2>
                  <p>Сопоставление энергетических показателей</p>
                </div>
              </div>
            </div>

            <div className="admin-comparison-intro">
              Значения текущего объекта и незаполненная колонка для второго объекта.
            </div>

            <div
              className="admin-comparison-table"
              role="table"
              aria-label="Сравнение показателей двух энергообъектов"
            >
              <div className="admin-comparison-table-head" role="row">
                <span role="columnheader">Показатель</span>

                <div
                  className="admin-comparison-object-head admin-comparison-object-head--current"
                  role="columnheader"
                >
                  <strong>{energyObject.name}</strong>
                  <small>Демо-объект</small>
                </div>

                <div className="admin-comparison-object-head" role="columnheader">
                  <strong>Второй объект</strong>
                  <small>Не подключён</small>
                </div>
              </div>

              {metrics.map((metric) => {
                const measurement = metric.measurement;
                const value = measurement?.value;
                const formattedValue =
                  value === null || value === undefined
                    ? '—'
                    : new Intl.NumberFormat('ru-RU', {
                        maximumFractionDigits: 1,
                      }).format(value);

                return (
                  <div className="admin-comparison-row" role="row" key={metric.id}>
                    <span className="admin-comparison-metric" role="rowheader">
                      {metric.label}
                    </span>

                    <strong className="admin-comparison-value" role="cell">
                      {formattedValue}
                      {value !== null && value !== undefined && measurement?.unit && (
                        <small> {measurement.unit}</small>
                      )}
                    </strong>

                    <span className="admin-comparison-pending" role="cell" aria-label="Нет данных">
                      —
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="admin-comparison-footnote">
              <span className="admin-comparison-status-dot" />
              Для полноценного сравнения необходимо подключить второй энергообъект и получить
              его измерения. Отсутствующие данные не заменяются нулевыми значениями.
            </div>
          </section>

          <DataQualityPanel rows={qualityRows} onCellSelect={onMeasurementSelect} />

          <ServicesPanel services={services} onServiceSelect={onServiceSelect} />
        </aside>
      </div>
    </div>
  );
}

export default PlatformAdminDashboard;
