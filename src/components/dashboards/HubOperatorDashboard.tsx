
import { Activity } from 'lucide-react';

import { MetricCard } from '../MetricCard';
import { EnergyFlow } from '../EnergyFlow';
import { PowerChart } from '../PowerChart';
import { AlertsPanel } from '../AlertsPanel';
import { EventTimeline } from '../EventTimeline';
import { EnergyObjectCard } from '../EnergyObjectCard';
import { AssetQuickView } from '../AssetQuickView';
import { DataQualityPanel } from '../DataQualityPanel';
import { ServicesPanel } from '../ServicesPanel';

import type { DashboardProps } from './types';

export function HubOperatorDashboard({
  energyObject,
  assets,
  metrics,
  events,
  services,
  chartData,
  qualityRows,
  topology,
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
  return (
    <div className="role-dashboard role-dashboard--operator">

      {/* Оперативный мониторинг */}
      <section className="role-metrics-block">

        <div className="panel-heading role-section-heading">
          <div className="panel-title-wrap">
            <div className="panel-icon">
              <Activity size={18} />
            </div>

            <div>
              <h2>Оперативный мониторинг</h2>
              <p>
                Энергетические показатели и состояние оборудования
              </p>
            </div>
          </div>

          <span className="flow-context-label">
            DEMO MODE
          </span>
        </div>

        <div className="metrics-grid role-metrics-grid">
          {metrics.map((metric) => (
            <MetricCard
              key={metric.id}
              metric={metric}
            />
          ))}
        </div>
      </section>

      {/* Основная рабочая область */}
      <div className="dashboard-grid">

        <div className="dashboard-main-column">

          <section className="scroll-anchor">
            <EnergyFlow
              assets={assets}
              topology={topology}
              selectedAssetId={selectedAssetId}
              onSelectAsset={onAssetSelect}
            />
          </section>

          <section className="scroll-anchor">
            <PowerChart
              data={chartData}
              theme={theme}
              period={period}
              title="Профиль мощности"
            />
          </section>

          <section className="scroll-anchor">
            <AlertsPanel
              events={events}
              onEventSelect={onEventSelect}
            />

            <EventTimeline events={events} />
          </section>

        </div>

        {/* Правая информационная колонка */}
        <aside className="dashboard-side-column">

          <EnergyObjectCard
            energyObject={energyObject}
          />

          <section
            id="asset-management"
            className="scroll-anchor"
          >
            <AssetQuickView
              asset={selectedAsset}
              onClose={() => onAssetReset?.()}
            />
          </section>

          <section className="scroll-anchor">
            <DataQualityPanel
              rows={qualityRows}
              onCellSelect={onMeasurementSelect}
            />
          </section>

          <section className="scroll-anchor">
            <ServicesPanel
              services={services}
              onServiceSelect={onServiceSelect}
            />
          </section>

        </aside>
      </div>
    </div>
  );
}

export default HubOperatorDashboard;
