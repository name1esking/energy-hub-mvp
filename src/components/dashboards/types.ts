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
  ThemeMode,
} from '../../types/ui';

/**
 * Shared presentation props for the four role-specific dashboards.
 * These are UI contracts, not new domain types.
 */
export interface DashboardProps {
  energyObject: EnergyObjectView;

  assets: AssetView[];
  metrics: MetricCardView[];
  events: EventView[];
  services: ServiceView[];

  chartData: PowerChartView | null;
  qualityRows: DataQualityRowView[];
  topology?: EnergyTopologyView;

  theme: ThemeMode;
  period: Period;

  selectedAsset: AssetView | null;
  selectedAssetId: string | null;

  onAssetReset?: () => void;

  onAssetSelect?: (assetId: string) => void;
  onEventSelect?: (eventId: string) => void;
  onServiceSelect?: (serviceId: string) => void;
  onMeasurementSelect?: (measurementId: string) => void;
}