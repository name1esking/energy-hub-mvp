import { Building2, MapPin } from 'lucide-react';
import type { EnergyObjectView } from '../types/ui';

export interface EnergyObjectCardProps {
  energyObject: EnergyObjectView;
  onSelect?: (energyObjectId: string) => void;
}

export function EnergyObjectCard({ energyObject, onSelect }: EnergyObjectCardProps) {
  const content = (
    <>
      <span className="energy-object-icon"><Building2 size={19} /></span>
      <span className="energy-object-copy">
        <strong>{energyObject.name}</strong>
        <small>{energyObject.typeLabel ?? 'EnergyObject'}</small>
        {energyObject.locationLabel && <small className="energy-object-location"><MapPin size={11} /> {energyObject.locationLabel}</small>}
      </span>
    </>
  );

  return (
    <section className="panel energy-object-card" aria-label="Выбранный энергообъект">
      <div className="panel-heading">
        <div className="panel-title-wrap"><div className="panel-icon"><Building2 size={17} /></div><div><h2>Выбранный объект</h2><p>Контекст текущего дашборда</p></div></div>
      </div>
      {onSelect ? (
        <button type="button" className="energy-object-content" onClick={() => onSelect(energyObject.id)}>{content}</button>
      ) : (
        <div className="energy-object-content">{content}</div>
      )}
    </section>
  );
}
