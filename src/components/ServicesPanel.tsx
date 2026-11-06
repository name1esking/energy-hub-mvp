import { BatteryCharging } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import type { ServiceView } from '../types/ui';

export interface ServicesPanelProps {
  services: ServiceView[];
  onServiceSelect?: (serviceId: string) => void;
}

export function ServicesPanel({ services, onServiceSelect }: ServicesPanelProps) {
  return (
    <section className="panel services-panel" id="services">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon"><BatteryCharging size={17} /></div>
          <div><h2>Энергетические сервисы</h2><p>Сервисы, переданные для выбранного энергообъекта</p></div>
        </div>
        <span className="panel-count">{services.length}</span>
      </div>
      <div className="service-list">
        {services.length === 0 ? (
          <div className="empty-state">К объекту не переданы подключённые сервисы.</div>
        ) : services.map((service) => (
          <ServiceCard key={service.id} service={service} onSelect={onServiceSelect} />
        ))}
      </div>
    </section>
  );
}
