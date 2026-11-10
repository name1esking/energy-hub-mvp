import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  Building2,
  CircleHelp,
  Gauge,
  PlugZap,
  Power,
  Sun,
  Zap,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AssetView } from '../types/ui';

export interface AssetQuickViewProps {
  asset: AssetView | null;
  onClose?: () => void;
}

const iconByType: Record<string, LucideIcon> = {
  solar_panel: Sun,
  battery: BatteryCharging,
  inverter: Zap,
  meter: Gauge,
  charger: PlugZap,
  ev_charger: PlugZap,
  grid_connection: Activity,
  load: Building2,
  other: CircleHelp,
};

const statusLabels: Record<string, string> = {
  online: 'В сети',
  normal: 'Нормальное состояние',
  warning: 'Предупреждение',
  error: 'Ошибка',
  offline: 'Отключено',
};

function statusClass(status: string): string {
  if (status === 'online' || status === 'normal') return 'normal';
  if (status === 'warning') return 'warning';
  if (status === 'error') return 'error';
  if (status === 'offline') return 'offline';
  return 'unknown';
}

export function AssetQuickView({ asset, onClose }: AssetQuickViewProps) {
  if (!asset) {
    return (
      <section className="panel asset-panel asset-empty">
        <div className="panel-heading">
          <div className="panel-title-wrap"><div className="panel-icon"><Building2 size={17} /></div><div><h2>Оборудование</h2><p>Быстрый просмотр выбранного Asset</p></div></div>
        </div>
        <div className="asset-empty-body">
          <div className="asset-empty-icon"><Building2 size={22} /></div>
          <strong>Выберите оборудование на схеме</strong>
          <span>Здесь появятся название, тип и статус оборудования.</span>
        </div>
      </section>
    );
  }

  const Icon = iconByType[asset.type] ?? CircleHelp;
  const state = statusClass(asset.status);
  const StatusIcon = state === 'normal' ? CheckCircle2 : state === 'offline' ? Power : AlertTriangle;

  return (
    <section className="panel asset-panel">
      <div className="panel-heading">
        <div className="panel-title-wrap"><div className="panel-icon"><Building2 size={17} /></div><div><h2>Оборудование</h2><p>Быстрый просмотр выбранного Asset</p></div></div>
        {onClose && <button type="button" className="text-button" onClick={onClose}>Сбросить</button>}
      </div>
      <div className="asset-main">
        <div className="asset-symbol"><Icon size={21} /></div>
        <div className="asset-heading-copy"><strong>{asset.name}</strong><span>{asset.type}</span></div>
      </div>
      <div className={`asset-state state-${state}`}>
        <StatusIcon size={14} /> {statusLabels[asset.status] ?? `Статус: ${asset.status}`}
      </div>
      <div className="asset-value-row"><span>Доступное значение</span><strong>{asset.displayValue ?? 'Нет данных'}</strong></div>
      {asset.quality && <div className="asset-value-row"><span>Качество</span><strong>{asset.quality}</strong></div>}
      {asset.isSimulated && <div className="asset-demo-note">Демонстрационное оборудование или значение. Не является подтверждённой телеметрией.</div>}
    </section>
  );
}
