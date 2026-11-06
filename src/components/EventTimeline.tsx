import { CalendarClock, Info, AlertTriangle, AlertCircle, CircleDot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EventView } from '../types/ui';

export interface EventTimelineProps {
  events: EventView[];
  onEventSelect?: (eventId: string) => void;
}

const eventIcons: Record<string, LucideIcon> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertCircle,
};

export function EventTimeline({ events, onEventSelect }: EventTimelineProps) {
  return (
    <section className="panel timeline-panel" id="history">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon"><CalendarClock size={17} /></div>
          <div><h2>История событий</h2><p>События и проблемы выбранного EnergyObject</p></div>
        </div>
        <span className="panel-count">{events.length} событий</span>
      </div>
      <div className="timeline-list">
        {events.length === 0 ? <div className="empty-state">История пока пуста</div> : events.map((event, index) => {
          const Icon = eventIcons[event.severity] ?? CircleDot;
          return (
            <button
              type="button"
              className="timeline-item timeline-item--button"
              key={event.id}
              onClick={() => onEventSelect?.(event.id)}
            >
              <div className={`timeline-marker event-${event.severity}`}><Icon size={14} /></div>
              <div className="timeline-body">
                <div className="timeline-meta"><span>{event.timestamp}</span><span>{event.status}</span></div>
                <strong>{event.title}</strong>
                <p>{event.description}</p>
                <div className="timeline-footer">
                  <span className={`event-type event-type-${event.severity}`}>{event.severity}</span>
                  {event.relatedAssetLabel && <span className="timeline-asset">{event.relatedAssetLabel}</span>}
                </div>
              </div>
              {index !== events.length - 1 && <div className="timeline-stem" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}
