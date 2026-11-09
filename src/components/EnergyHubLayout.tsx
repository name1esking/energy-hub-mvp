
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';

import { HubOperatorDashboard } from './dashboards/HubOperatorDashboard';
import { PlatformAdminDashboard } from './dashboards/PlatformAdminDashboard';
import { PortfolioOwnerDashboard } from './dashboards/PortfolioOwnerDashboard';
import { BuildingOwnerDashboard } from './dashboards/BuildingOwnerDashboard';

import { Header } from './Header';
import { Sidebar } from './Sidebar';

import type {
  AssetView,
  DataQualityRowView,
  EnergyObjectView,
  EnergyTopologyView,
  EventView,
  MetricCardView,
  Period,
  PowerChartView,
  ServiceView,
  SidebarPageId,
  ThemeMode,
  UiRole,
} from '../types/ui';

const roleDescriptions: Record<
  UiRole,
  { title: string; description: string }
> = {
  platform_admin: {
    title: 'Обзор платформы',
    description:
      'Объекты и подключённые энергетические сервисы платформы.',
  },

  portfolio_owner: {
    title: 'Обзор портфеля',
    description:
      'Сводное представление энергообъектов и областей внимания.',
  },

  hub_operator: {
    title: 'Мониторинг энергообъекта',
    description:
      'Оборудование, потоки энергии, измерения и события выбранного объекта.',
  },

  building_owner: {
    title: 'Мой энергообъект',
    description:
      'Потребление, генерация, сервисы и события в режиме просмотра.',
  },
};

const navTargets: Record<SidebarPageId, string> = {
  overview: 'overview',
  'energy-hub': 'energy-hub',
  objects: 'energy-hub',
  services: 'services',
  'data-quality': 'data-quality',
  history: 'history',
};

export interface EnergyHubLayoutProps {
  energyObject: EnergyObjectView;
  role: UiRole;

  assets: AssetView[];
  metrics: MetricCardView[];
  events: EventView[];
  services: ServiceView[];

  chartData: PowerChartView | null;
  qualityRows: DataQualityRowView[];

  topology?: EnergyTopologyView;

  initialTheme?: ThemeMode;

  onRoleChange?: (role: UiRole) => void;
  onPeriodChange?: (period: Period) => void;

  onAssetSelect?: (assetId: string) => void;
  onEventSelect?: (eventId: string) => void;
  onServiceSelect?: (serviceId: string) => void;
  onMeasurementSelect?: (measurementId: string) => void;
}

export function EnergyHubLayout({
  energyObject,
  role,
  assets,
  metrics,
  events,
  services,
  chartData,
  qualityRows,
  topology,
  initialTheme = 'dark',
  onRoleChange,
  onPeriodChange,
  onAssetSelect,
  onEventSelect,
  onServiceSelect,
  onMeasurementSelect,
}: EnergyHubLayoutProps) {

  // Theme
  const [theme, setTheme] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') {
      return initialTheme;
    }

    const saved = window.localStorage.getItem(
      'energy-hub-theme',
    );

    return saved === 'light' || saved === 'dark'
      ? saved
      : initialTheme;
  });

  // Dashboard state
  const [period, setPeriod] = useState<Period>('24h');

  const [activePage, setActivePage] =
    useState<SidebarPageId>('overview');

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  // Selected equipment
  const [selectedAssetId, setSelectedAssetId] =
    useState<string | null>(null);

  // Persist theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;

    window.localStorage.setItem(
      'energy-hub-theme',
      theme,
    );
  }, [theme]);

  // Selected Asset
  const selectedAsset = useMemo(
    () =>
      assets.find(
        (asset) => asset.id === selectedAssetId,
      ) ?? null,
    [assets, selectedAssetId],
  );

  // Current role description
  const currentRole = roleDescriptions[role];

  // Attention counter
  const attentionCount = events.filter(
    (event) =>
      event.severity === 'warning' ||
      event.severity === 'critical',
  ).length;

  // Navigation
  const handleNavigate = useCallback(
    (page: SidebarPageId) => {
      setActivePage(page);

      document
        .getElementById(navTargets[page])
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    },
    [],
  );

  // Period selection
  const handlePeriodChange = useCallback(
    (nextPeriod: Period) => {
      setPeriod(nextPeriod);
      onPeriodChange?.(nextPeriod);
    },
    [onPeriodChange],
  );

  // Asset selection
  const handleAssetSelect = useCallback(
    (assetId: string) => {
      setSelectedAssetId(assetId);
      onAssetSelect?.(assetId);
    },
    [onAssetSelect],
  );

  // Asset reset
  const handleAssetReset = useCallback(() => {
    setSelectedAssetId(null);
  }, []);

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <Sidebar
        activePage={activePage}
        role={role}
        onNavigate={handleNavigate}
        mobileOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="app-main">

        {/* HEADER */}
        <Header
          energyObject={energyObject}
          role={role}
          onRoleChange={(nextRole) =>
            onRoleChange?.(nextRole)
          }
          theme={theme}
          onThemeChange={setTheme}
          period={period}
          onPeriodChange={handlePeriodChange}
          onMenuClick={() => setMobileMenuOpen(true)}
          unreadCount={attentionCount}
        />

        <main className="dashboard-content">

          {/* COMMON PAGE HEADER */}
          <section
            className="page-intro"
            id="overview"
          >
            <div>
              <div className="eyebrow">
                <span className="eyebrow-dot" />
                ENERGY HUB / DEMO WORKSPACE
              </div>

              <h1>{currentRole.title}</h1>

              <p>{currentRole.description}</p>

              <div className="object-context">
                {energyObject.typeLabel ?? 'EnergyObject'}
                {' В· '}
                {energyObject.locationLabel ??
                  energyObject.name}
              </div>
            </div>

            <div className="intro-meta">
              <div className="data-freshness">
                <span className="freshness-dot" />
                Демонстрационные данные
              </div>

              <div className="period-caption">
                <CalendarDays size={14} />

                {period === '24h'
                  ? '24 часа'
                  : period === '7d'
                    ? '7 дней'
                    : '30 дней'}
              </div>
            </div>
          </section>

          {/* ==================================
              HUB OPERATOR DASHBOARD
          ================================== */}

          {role === 'hub_operator' && (
            <HubOperatorDashboard
              energyObject={energyObject}
              assets={assets}
              metrics={metrics}
              events={events}
              services={services}
              chartData={chartData}
              qualityRows={qualityRows}
              topology={topology}
              theme={theme}
              period={period}
              selectedAsset={selectedAsset}
              selectedAssetId={selectedAssetId}
              onAssetSelect={handleAssetSelect}
              onAssetReset={handleAssetReset}
              onEventSelect={onEventSelect}
              onServiceSelect={onServiceSelect}
              onMeasurementSelect={onMeasurementSelect}
            />
          )}

          {/* ==================================
              PLATFORM ADMIN DASHBOARD
          ================================== */}

          {role === 'platform_admin' && (
            <PlatformAdminDashboard
              energyObject={energyObject}
              assets={assets}
              metrics={metrics}
              events={events}
              services={services}
              chartData={chartData}
              qualityRows={qualityRows}
              topology={topology}
              theme={theme}
              period={period}
              selectedAsset={selectedAsset}
              selectedAssetId={selectedAssetId}
              onAssetSelect={handleAssetSelect}
              onAssetReset={handleAssetReset}
              onEventSelect={onEventSelect}
              onServiceSelect={onServiceSelect}
              onMeasurementSelect={onMeasurementSelect}
            />
          )}

          {/* ==================================
              PORTFOLIO OWNER DASHBOARD
          ================================== */}
          {role === 'portfolio_owner' && (
            <PortfolioOwnerDashboard
              energyObject={energyObject}
              assets={assets}
              metrics={metrics}
              events={events}
              services={services}
              chartData={chartData}
              qualityRows={qualityRows}
              theme={theme}
              period={period}
              selectedAsset={selectedAsset}
              selectedAssetId={selectedAssetId}
              onAssetSelect={handleAssetSelect}
              onAssetReset={handleAssetReset}
              onEventSelect={onEventSelect}
              onServiceSelect={onServiceSelect}
              onMeasurementSelect={onMeasurementSelect}
            />
          )}

          {/* BUILDING OWNER DASHBOARD */}
          {role === 'building_owner' && (
            <BuildingOwnerDashboard
              energyObject={energyObject}
              assets={assets}
              metrics={metrics}
              events={events}
              services={services}
              chartData={chartData}
              qualityRows={qualityRows}
              topology={topology}
              theme={theme}
              period={period}
              selectedAsset={selectedAsset}
              selectedAssetId={selectedAssetId}
              onAssetSelect={handleAssetSelect}
              onAssetReset={handleAssetReset}
              onEventSelect={onEventSelect}
              onServiceSelect={onServiceSelect}
              onMeasurementSelect={onMeasurementSelect}
            />
          )}
          {/* FOOTER */}
          <footer className="dashboard-footer">

            <span>ENERGY HUB MVP</span>

            <span>
              UI presentation layer В· no backend
            </span>

            <span className="footer-status">
              <span className="freshness-dot" />
              UI ready
            </span>

          </footer>

        </main>
      </div>
    </div>
  );
}

export default EnergyHubLayout;
