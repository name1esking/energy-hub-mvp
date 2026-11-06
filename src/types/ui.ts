/**
 * UI presentation contracts only.
 * These are NOT canonical Energy Hub domain types.
 * Tech Lead must decide the final EnergyObject/objectId/siteId, Asset,
 * Measurement, Event and Service contracts before creating domain types.
 */
export type UiRole =
  | 'platform_admin'
  | 'portfolio_owner'
  | 'hub_operator'
  | 'building_owner';

export type ThemeMode = 'dark' | 'light';
export type Period = '24h' | '7d' | '30d';
export type MetricTone = 'teal' | 'blue' | 'amber' | 'violet';
export type MetricIcon = 'activity' | 'zap' | 'sun' | 'battery' | 'database';

/** Minimal presentation information for the currently selected EnergyObject. */
export interface EnergyObjectView {
  id: string;
  name: string;
  typeLabel?: string;
  locationLabel?: string;
}

/** A visual projection of an Asset. `type` and `status` intentionally remain strings. */
export interface AssetView {
  id: string;
  name: string;
  type: string;
  status: string;
  displayValue?: string | null;
  quality?: string;
  isSimulated?: boolean;
}

/** A visual projection of Measurement. No objectId/siteId/assetId is assumed here. */
export interface MeasurementView {
  id: string;
  metric: string;
  label: string;
  value: number | null;
  unit: string;
  timestamp: string;
  quality: string;
  sourceLabel?: string;
  assetLabel?: string;
}

/** A visual projection of Event. `status` remains open until Tech Lead confirms its values. */
export interface EventView {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  timestamp: string;
  relatedAssetLabel?: string;
}

/** A visual projection of Service. The final Service schema belongs to the shared model. */
export interface ServiceView {
  id: string;
  name: string;
  type: string;
  description: string;
  stateLabel?: string;
  isSimulated?: boolean;
}

export interface MetricCardView {
  id: string;
  label: string;
  measurement: MeasurementView | null;
  tone: MetricTone;
  icon: MetricIcon;
  hint?: string;
}

/** One chart must contain values with the same unit. Do not mix kW and kWh. */
export interface ChartSeriesView {
  id: string;
  label: string;
  values: Array<number | null>;
  color: string;
}

export interface PowerChartView {
  labels: string[];
  unit: string;
  series: ChartSeriesView[];
}

export interface DataQualityCellView {
  label: string;
  quality: string;
  measurementId?: string;
}

export interface DataQualityRowView {
  id: string;
  label: string;
  cells: DataQualityCellView[];
}

/** Layout for drawing Asset cards. It does not assert domain relationships. */
export interface EnergyFlowPlacementView {
  assetId: string;
  x: number;
  y: number;
}

/**
 * Proposed visual connection only. Use actual edges only after Tech Lead confirms
 * the topology source and direction semantics. Demo edges must be marked simulated.
 */
export interface EnergyFlowConnectionView {
  id: string;
  sourceAssetId: string;
  targetAssetId: string;
  kind: 'energy' | 'data';
  direction: 'forward' | 'reverse' | 'bidirectional';
  value: number | null;
  unit?: string;
  quality?: string;
  isSimulated: boolean;
  label?: string;
}

export interface EnergyTopologyView {
  placements: EnergyFlowPlacementView[];
  connections: EnergyFlowConnectionView[];
  isDemo: boolean;
}

export type SidebarPageId =
  | 'overview'
  | 'energy-hub'
  | 'objects'
  | 'services'
  | 'data-quality'
  | 'history';
