import { BatteryCharging } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import type { ServiceView } from '../types/ui';

export interface ServicesPanelProps {
  services: ServiceView[];
  onServiceSelect?: (serviceId: string) => void;
}

function serviceCountLabel(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} сервисов`;
  if (lastOne === 1) return `${count} сервис`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} сервиса`;
  return `${count} сервисов`;
}

export function ServicesPanel({ services, onServiceSelect }: ServicesPanelProps) {
  const simulatedCount = services.filter((service) => service.isSimulated).length;

  return (
    <section className="panel services-panel" id="services" aria-labelledby="services-title">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon">
            <BatteryCharging size={17} />
          </div>
          <div>
            <h2 id="services-title">Энергетические сервисы</h2>
            <p>Сервисы, переданные для выбранного энергообъекта</p>
          </div>
        </div>
        <span className="panel-count">{serviceCountLabel(services.length)}</span>
      </div>

      {simulatedCount > 0 && (
        <div className="services-summary">
          <span className="services-summary-dot" />
          Демо-сервисов: {simulatedCount}
        </div>
      )}

      <div className="service-list">
        {services.length === 0 ? (
          <div className="empty-state">К объекту не переданы подключённые сервисы.</div>
        ) : (
          services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={onServiceSelect}
            />
          ))
        )}
      </div>
    </section>
  );
}

export default ServicesPanel;
