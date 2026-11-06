import { Activity, BatteryCharging, Database, Sun, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { MetricCardView } from '../types/ui';

export interface MetricCardProps {
  metric: MetricCardView;
  onClick?: (metricId: string) => void;
}

const iconMap: Record<MetricCardView['icon'], LucideIcon> = {
  activity: Activity,
  zap: Zap,
  sun: Sun,
  battery: BatteryCharging,
  database: Database,
};

const qualityLabels: Record<string, string> = {
  complete: 'Получено',
  missing: 'Нет данных',
  stale: 'Устарело',
  estimated: 'Расчётное',
  simulated: 'Симуляция',
};

export function MetricCard({ metric, onClick }: MetricCardProps) {
  const Icon = iconMap[metric.icon];
  const measurement = metric.measurement;
  const value = measurement?.value;
  const formattedValue = value === null || value === undefined
    ? '—'
    : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 }).format(value);
  const quality = measurement?.quality;
  const qualityLabel = quality ? qualityLabels[quality] ?? `Качество: ${quality}` : 'Нет измерения';

  return (
    <article
      className={`metric-card tone-${metric.tone} ${onClick ? 'metric-card--interactive' : ''}`}
      onClick={onClick ? () => onClick(metric.id) : undefined}
      onKeyDown={onClick ? (event) => { if (event.key === 'Enter' || event.key === ' ') onClick(metric.id); } : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="metric-topline">
        <div className="metric-icon"><Icon size={18} strokeWidth={1.9} /></div>
        <span className="metric-period">{qualityLabel}</span>
      </div>
      <div className="metric-label">{metric.label}</div>
      <div className="metric-value-row">
        <strong className="metric-value">{formattedValue}</strong>
        <span className="metric-unit">{measurement?.unit ?? ''}</span>
      </div>
      <div className="metric-footnote">
        <span>{metric.hint ?? (measurement ? `Измерено: ${measurement.timestamp}` : 'Нет доступного измерения')}</span>
      </div>
    </article>
  );
}
