import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Building2,
  CheckCircle2,
  Database,
  Layers3,
  MapPin,
  PlugZap,
  Sun,
  Zap,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { MetricCard } from '../MetricCard';
import { PowerChart } from '../PowerChart';
import { AlertsPanel } from '../AlertsPanel';
import { EventTimeline } from '../EventTimeline';
import { AssetQuickView } from '../AssetQuickView';
import { DataQualityPanel } from '../DataQualityPanel';
import { ServicesPanel } from '../ServicesPanel';

import type { DashboardProps } from './types';

const assetIcons: Record<string, LucideIcon> = {
  solar_panel: Sun,
  battery: BatteryCharging,
  inverter: Zap,
  grid_connection: PlugZap,
  meter: Activity,
  load: Building2,
};

const assetStatusLabels: Record<string, { label: string; tone: string }> = {
  online: { label: 'В сети', tone: 'online' },
  warning: { label: 'Внимание', tone: 'warning' },
  critical: { label: 'Критично', tone: 'critical' },
  offline: { label: 'Не в сети', tone: 'offline' },
  maintenance: { label: 'Обслуживание', tone: 'maintenance' },
};

const qualityLabels: Record<string, string> = {
  complete: 'Получено',
  missing: 'Нет данных',
  stale: 'Устарело',
  estimated: 'Расчётное',
  simulated: 'Симуляция',
};

function getAssetStatus(status: string) {
  return assetStatusLabels[status] ?? {
    label: status || 'Неизвестно',
    tone: 'unknown',
  };
}

function getAssetQuality(quality?: string) {
  if (!quality) return 'Качество не указано';
  return qualityLabels[quality] ?? quality;
}

export function PortfolioOwnerDashboard({
  energyObject,
  assets,
  metrics,
  events,
  services,
  chartData,
  qualityRows,
  theme,
  period,
  selectedAsset,
  selectedAssetId,
  onAssetSelect,
  onAssetReset,
  onEventSelect,
  onServiceSelect,
  onMeasurementSelect,
}: DashboardProps) {
  const onlineAssets = assets.filter((asset) => asset.status === 'online').length;
  const attentionAssets = assets.filter((asset) =>
    ['warning', 'critical', 'offline'].includes(asset.status),
  ).length;

  const criticalEvents = events.filter((event) => event.severity === 'critical').length;
  const warningEvents = events.filter((event) => event.severity === 'warning').length;
  const attentionEvents = criticalEvents + warningEvents;

  const qualityCounts = qualityRows.reduce<Record<string, number>>((counts, row) => {
    row.cells.forEach((cell) => {
      counts[cell.quality] = (counts[cell.quality] ?? 0) + 1;
    });
    return counts;
  }, {});

  const missingChannels = qualityCounts.missing ?? 0;
  const staleChannels = qualityCounts.stale ?? 0;
  const simulatedChannels = qualityCounts.simulated ?? 0;

  return (
    <div className="role-dashboard role-dashboard--portfolio">
      {/* PORTFOLIO KPI */}
      <section className="role-metrics-block portfolio-metrics-block">
        <div className="panel-heading portfolio-section-heading">
          <div className="panel-title-wrap">
            <div className="panel-icon">
              <Layers3 size={18} />
            </div>
            <div>
              <h2>Ключевые показатели</h2>
              <p>Данные доступного демонстрационного энергообъекта</p>
            </div>
          </div>

          <span className="portfolio-scope-badge">
            <span className="portfolio-scope-dot" />
            PORTFOLIO DEMO
          </span>
        </div>

        <div className="metrics-grid role-metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      {/* PORTFOLIO WORKSPACE */}
      <div className="dashboard-grid portfolio-dashboard-grid">
        <div className="dashboard-main-column portfolio-main-column">
          {/* ENERGY ANALYTICS */}
          <PowerChart
            data={chartData}
            theme={theme}
            period={period}
            title="Энергетическая динамика"
          />

          {/* PORTFOLIO OBJECTS */}
          <section
            className="panel portfolio-objects-panel"
            id="energy-hub"
            aria-labelledby="portfolio-objects-title"
          >
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 id="portfolio-objects-title">Объекты портфеля</h2>
                  <p>Энергообъекты, переданные в текущий набор данных</p>
                </div>
              </div>

              <span className="portfolio-count-badge">
                1 объект
              </span>
            </div>

            <div className="portfolio-object-list">
              <article className="portfolio-object-card">
                <div className="portfolio-object-icon">
                  <Building2 size={21} />
                </div>

                <div className="portfolio-object-copy">
                  <span className="portfolio-object-kicker">Доступный энергообъект</span>
                  <strong>{energyObject.name}</strong>
                  <small>{energyObject.typeLabel ?? 'Энергетический объект'}</small>

                  {energyObject.locationLabel && (
                    <span className="portfolio-object-location">
                      <MapPin size={12} />
                      {energyObject.locationLabel}
                    </span>
                  )}
                </div>

                <span className="portfolio-object-tag">ДЕМО</span>
              </article>
            </div>

            <div className="portfolio-panel-note">
              Сейчас в переданном наборе доступен один энергообъект.
              Показатели выше относятся к нему и не являются суммой нескольких объектов.
            </div>
          </section>

          {/* EQUIPMENT OVERVIEW */}
          <section
            className="panel portfolio-assets-panel"
            aria-labelledby="portfolio-assets-title"
          >
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Zap size={18} />
                </div>
                <div>
                  <h2 id="portfolio-assets-title">Состояние оборудования</h2>
                  <p>Состав оборудования доступного энергообъекта</p>
                </div>
              </div>

              <span className="panel-count">{assets.length} единиц</span>
            </div>

            <div className="portfolio-assets-summary">
              <span className="portfolio-health-chip portfolio-health-chip--online">
                <i />
                В сети: {onlineAssets}
              </span>
              <span className="portfolio-health-chip portfolio-health-chip--attention">
                <i />
                Требуют внимания: {attentionAssets}
              </span>
            </div>

            <div className="portfolio-asset-list">
              {assets.length === 0 ? (
                <div className="empty-state">Оборудование не передано.</div>
              ) : (
                assets.map((asset) => {
                  const Icon = assetIcons[asset.type] ?? Database;
                  const status = getAssetStatus(asset.status);
                  const isSelected = selectedAssetId === asset.id;

                  return (
                    <button
                      type="button"
                      key={asset.id}
                      className={`portfolio-asset-item ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => onAssetSelect?.(asset.id)}
                      disabled={!onAssetSelect}
                      aria-pressed={isSelected}
                    >
                      <span className="portfolio-asset-icon">
                        <Icon size={17} />
                      </span>

                      <span className="portfolio-asset-copy">
                        <strong>{asset.name}</strong>
                        <small>{asset.type}</small>
                      </span>

                      <span className={`portfolio-asset-status portfolio-asset-status--${status.tone}`}>
                        {status.label}
                      </span>

                      <span className="portfolio-asset-value">
                        {asset.displayValue ?? 'Нет отображаемого значения'}
                        {asset.quality && (
                          <small>{getAssetQuality(asset.quality)}</small>
                        )}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* EVENT HISTORY */}
          <EventTimeline
            events={events}
            onEventSelect={onEventSelect}
          />
        </div>

        <aside className="dashboard-side-column portfolio-side-column">
          {/* PORTFOLIO SUMMARY */}
          <section className="panel portfolio-summary-panel">
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Layers3 size={18} />
                </div>
                <div>
                  <h2>Сводка портфеля</h2>
                  <p>Состав текущего демонстрационного набора</p>
                </div>
              </div>
            </div>

            <div className="portfolio-stat-grid">
              <div className="portfolio-stat-card portfolio-stat-card--teal">
                <div className="portfolio-stat-top">
                  <span className="portfolio-stat-icon"><Building2 size={16} /></span>
                  <strong>1</strong>
                </div>
                <b>Энергообъекты</b>
                <small>доступен в демо-наборе</small>
              </div>

              <div className="portfolio-stat-card portfolio-stat-card--blue">
                <div className="portfolio-stat-top">
                  <span className="portfolio-stat-icon"><Zap size={16} /></span>
                  <strong>{assets.length}</strong>
                </div>
                <b>Оборудование</b>
                <small>единиц оборудования</small>
              </div>

              <div className="portfolio-stat-card portfolio-stat-card--amber">
                <div className="portfolio-stat-top">
                  <span className="portfolio-stat-icon"><AlertTriangle size={16} /></span>
                  <strong>{attentionEvents}</strong>
                </div>
                <b>События внимания</b>
                <small>{criticalEvents} критичных · {warningEvents} предупреждений</small>
              </div>

              <div className="portfolio-stat-card portfolio-stat-card--violet">
                <div className="portfolio-stat-top">
                  <span className="portfolio-stat-icon"><PlugZap size={16} /></span>
                  <strong>{services.length}</strong>
                </div>
                <b>Энергосервисы</b>
                <small>передано для объекта</small>
              </div>
            </div>

            <div className="portfolio-panel-note portfolio-summary-note">
              Счётчики отражают только данные, переданные интерфейсу, а не статистику всей платформы.
            </div>
          </section>

          {/* PORTFOLIO HEALTH */}
          <section className="panel portfolio-health-panel">
            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <h2>Состояние портфеля</h2>
                  <p>Сводка статусов оборудования и каналов</p>
                </div>
              </div>
            </div>

            <div className="portfolio-health-list">
              <div className="portfolio-health-row">
                <span><i className="portfolio-health-dot portfolio-health-dot--online" />Оборудование в сети</span>
                <strong>{onlineAssets} / {assets.length}</strong>
              </div>
              <div className="portfolio-health-row">
                <span><i className="portfolio-health-dot portfolio-health-dot--attention" />Оборудование с предупреждениями</span>
                <strong>{attentionAssets}</strong>
              </div>
              <div className="portfolio-health-row">
                <span><i className="portfolio-health-dot portfolio-health-dot--missing" />Каналы без данных</span>
                <strong>{missingChannels}</strong>
              </div>
              <div className="portfolio-health-row">
                <span><i className="portfolio-health-dot portfolio-health-dot--stale" />Устаревшие каналы</span>
                <strong>{staleChannels}</strong>
              </div>
            </div>

            <div className="portfolio-health-footnote">
              <span className="portfolio-health-dot portfolio-health-dot--demo" />
              Демонстрационных каналов: {simulatedChannels}. Значения не являются подтверждённой телеметрией.
            </div>
          </section>

          {/* ALERTS */}
          <AlertsPanel
            events={events}
            onEventSelect={onEventSelect}
          />

          {/* SELECTED EQUIPMENT */}
          <AssetQuickView
            asset={selectedAsset}
            onClose={() => onAssetReset?.()}
          />

          {/* DATA QUALITY */}
          <DataQualityPanel
            rows={qualityRows}
            onCellSelect={onMeasurementSelect}
          />

          {/* ENERGY SERVICES */}
          <ServicesPanel
            services={services}
            onServiceSelect={onServiceSelect}
          />
        </aside>
      </div>
    </div>
  );
}

export default PortfolioOwnerDashboard;
