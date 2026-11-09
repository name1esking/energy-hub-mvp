import { ArrowUpRight, BatteryCharging, CircleHelp, Sun } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ServiceView } from '../types/ui';

export interface ServiceCardProps {
  service: ServiceView;
  onSelect?: (serviceId: string) => void;
}

const iconByService: Record<string, LucideIcon> = {
  peak_shaving: BatteryCharging,
  pv_self_consumption: Sun,
};

const labelByService: Record<string, string> = {
  peak_shaving: 'Peak Shaving',
  pv_self_consumption: 'PV Self-Consumption',
};

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  const Icon = iconByService[service.type] ?? CircleHelp;
  const content = (
    <>
      <span className="service-icon"><Icon size={18} /></span>
      <span className="service-copy">
        <strong>{labelByService[service.type] ?? service.name}</strong>
        <small>{service.description}</small>
        {service.stateLabel && <small className="service-state">{service.stateLabel}</small>}
      </span>
      {service.isSimulated && <span className="service-demo">ДЕМО</span>}
      <ArrowUpRight size={15} className="service-arrow" />
    </>
  );

  return onSelect ? (
    <button type="button" className="service-item" onClick={() => onSelect(service.id)}>{content}</button>
  ) : (
    <div className="service-item service-item--static">{content}</div>
  );
}
