import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  PlugZap,
  Zap,
} from 'lucide-react';

import { MetricCard } from '../MetricCard';
import { PowerChart } from '../PowerChart';
import { EnergyFlow } from '../EnergyFlow';
import { EnergyObjectCard } from '../EnergyObjectCard';
import { AlertsPanel } from '../AlertsPanel';
import { EventTimeline } from '../EventTimeline';
import { AssetQuickView } from '../AssetQuickView';
import { DataQualityPanel } from '../DataQualityPanel';
import { ServicesPanel } from '../ServicesPanel';

import type { DashboardProps } from './types';

const copy = {
  metricsTitle: '\u042d\u043d\u0435\u0440\u0433\u0435\u0442\u0438\u043a\u0430 \u0437\u0434\u0430\u043d\u0438\u044f',
  metricsDescription: '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u0434\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0433\u043e \u044d\u043d\u0435\u0440\u0433\u043e\u043e\u0431\u044a\u0435\u043a\u0442\u0430',
  assetsUnit: '\u0435\u0434.',
  objectTitle: '\u042d\u043d\u0435\u0440\u0433\u043e\u043e\u0431\u044a\u0435\u043a\u0442',
  objectDescription: '\u0414\u0430\u043d\u043d\u044b\u0435 \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e \u0437\u0434\u0430\u043d\u0438\u044f \u0438 \u043f\u043e\u0434\u043a\u043b\u044e\u0447\u0451\u043d\u043d\u043e\u0433\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044f',
  statusTitle: '\u0421\u043e\u0441\u0442\u043e\u044f\u043d\u0438\u0435 \u0437\u0434\u0430\u043d\u0438\u044f',
  statusDescription: '\u0421\u0432\u043e\u0434\u043a\u0430 \u043f\u043e \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u044e, \u0441\u043e\u0431\u044b\u0442\u0438\u044f\u043c \u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u0430\u043c',
  online: '\u0412 \u0441\u0435\u0442\u0438',
  attention: '\u0422\u0440\u0435\u0431\u0443\u044e\u0442 \u0432\u043d\u0438\u043c\u0430\u043d\u0438\u044f',
  importantEvents: '\u0412\u0430\u0436\u043d\u044b\u0435 \u0441\u043e\u0431\u044b\u0442\u0438\u044f',
  services: '\u042d\u043d\u0435\u0440\u0433\u043e\u0441\u0435\u0440\u0432\u0438\u0441\u044b',
  flowTitle: '\u042d\u043d\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0439 \u043f\u043e\u0442\u043e\u043a',
  chartTitle: '\u0414\u0438\u043d\u0430\u043c\u0438\u043a\u0430 \u043f\u043e\u0442\u0440\u0435\u0431\u043b\u0435\u043d\u0438\u044f \u0438 \u0433\u0435\u043d\u0435\u0440\u0430\u0446\u0438\u0438',
  historyTitle: '\u0418\u0441\u0442\u043e\u0440\u0438\u044f \u0441\u043e\u0431\u044b\u0442\u0438\u0439',
  equipment: '\u0414\u043e\u0441\u0442\u0443\u043f\u043d\u043e\u0435 \u043e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435',
  note: '\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u0438 \u043e\u0442\u0440\u0430\u0436\u0430\u044e\u0442 \u0442\u043e\u043b\u044c\u043a\u043e \u0434\u0430\u043d\u043d\u044b\u0435, \u043f\u0435\u0440\u0435\u0434\u0430\u043d\u043d\u044b\u0435 \u0438\u043d\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0443. \u0414\u0435\u043c\u043e\u043d\u0441\u0442\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0435 \u0437\u043d\u0430\u0447\u0435\u043d\u0438\u044f \u043d\u0435 \u044f\u0432\u043b\u044f\u044e\u0442\u0441\u044f \u043f\u043e\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0451\u043d\u043d\u043e\u0439 \u0442\u0435\u043b\u0435\u043c\u0435\u0442\u0440\u0438\u0435\u0439.',
};

export function BuildingOwnerDashboard({
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
  const onlineAssets = assets.filter((asset) => asset.status === 'online').length;

  const attentionAssets = assets.filter((asset) =>
    ['warning', 'critical', 'offline'].includes(asset.status),
  ).length;

  const attentionEvents = events.filter(
    (event) => event.severity === 'warning' || event.severity === 'critical',
  ).length;

  return (
    <div className="role-dashboard role-dashboard--building">

      <section className="role-metrics-block building-metrics-block">

        <div className="role-section-heading building-section-heading">
          <div>
            <h2>{copy.metricsTitle}</h2>
            <p>{copy.metricsDescription}</p>
          </div>

          <span className="building-scope-badge">
            <span className="building-scope-dot" />
            BUILDING DEMO
          </span>
        </div>

        <div className="metrics-grid role-metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.id} metric={metric} />
          ))}
        </div>

      </section>

      <div className="dashboard-grid building-dashboard-grid">

        <div className="dashboard-main-column building-main-column">

          <section className="panel building-object-panel">

            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Building2 size={18} />
                </div>

                <div>
                  <h2>{copy.objectTitle}</h2>
                  <p>{copy.objectDescription}</p>
                </div>
              </div>

              <span className="building-object-count">
                {assets.length} {copy.assetsUnit}
              </span>
            </div>

            <EnergyObjectCard energyObject={energyObject} />

            <p className="building-panel-note">
              {copy.note}
            </p>

          </section>

          <section className="building-flow-section">

            <div className="building-subsection-heading">
              <div className="panel-icon">
                <Zap size={18} />
              </div>

              <div>
                <h2>{copy.flowTitle}</h2>
                <p>{copy.equipment}</p>
              </div>
            </div>

            <EnergyFlow
              assets={assets}
              topology={topology}
              selectedAssetId={selectedAssetId}
              onSelectAsset={onAssetSelect}
            />

          </section>

          <PowerChart
            data={chartData}
            theme={theme}
            period={period}
            title={copy.chartTitle}
          />

          <section
            className="building-history-section"
            aria-label={copy.historyTitle}
          >
            <EventTimeline
              events={events}
              onEventSelect={onEventSelect}
            />
          </section>

        </div>

        <aside className="dashboard-side-column building-side-column">

          <section className="panel building-status-panel">

            <div className="panel-heading">
              <div className="panel-title-wrap">
                <div className="panel-icon">
                  <Activity size={18} />
                </div>

                <div>
                  <h2>{copy.statusTitle}</h2>
                  <p>{copy.statusDescription}</p>
                </div>
              </div>
            </div>

            <div className="building-status-grid">

              <div className="building-stat-card building-stat-card--online">
                <span className="building-stat-icon">
                  <CheckCircle2 size={16} />
                </span>
                <strong>{onlineAssets}/{assets.length}</strong>
                <small>{copy.online}</small>
              </div>

              <div className="building-stat-card building-stat-card--attention">
                <span className="building-stat-icon">
                  <AlertTriangle size={16} />
                </span>
                <strong>{attentionAssets}</strong>
                <small>{copy.attention}</small>
              </div>

              <div className="building-stat-card building-stat-card--events">
                <span className="building-stat-icon">
                  <Activity size={16} />
                </span>
                <strong>{attentionEvents}</strong>
                <small>{copy.importantEvents}</small>
              </div>

              <div className="building-stat-card building-stat-card--services">
                <span className="building-stat-icon">
                  <PlugZap size={16} />
                </span>
                <strong>{services.length}</strong>
                <small>{copy.services}</small>
              </div>

            </div>

          </section>

          <AlertsPanel
            events={events}
            onEventSelect={onEventSelect}
          />

          <AssetQuickView
            asset={selectedAsset}
            onClose={onAssetReset}
          />

          <DataQualityPanel
            rows={qualityRows}
            onCellSelect={onMeasurementSelect}
          />

          <ServicesPanel
            services={services}
            onServiceSelect={onServiceSelect}
          />

        </aside>

      </div>
    </div>
  );
}

export default BuildingOwnerDashboard;