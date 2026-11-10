import {
  CalendarClock,
  Info,
  AlertTriangle,
  AlertCircle,
  CircleDot,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EventView } from '../types/ui';

export interface EventTimelineProps {
  events: EventView[];
  onEventSelect?: (eventId: string) => void;
}

const eventPresentation: Record<string, { icon: LucideIcon; label: string }> = {
  info: { icon: Info, label: 'Информация' },
  warning: { icon: AlertTriangle, label: 'Предупреждение' },
  critical: { icon: AlertCircle, label: 'Критично' },
};

function eventCountLabel(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} событий`;
  if (lastOne === 1) return `${count} событие`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} события`;
  return `${count} событий`;
}

function eventStatusLabel(status: string): string {
  switch (status) {
    case 'open':
      return 'Открыто';
    case 'resolved':
      return 'Решено';
    case 'demo_open':
      return 'Открыто · демо';
    case 'demo_planned':
      return 'Запланировано · демо';
    default:
      return status.replace(/_/g, ' ');
  }
}

export function EventTimeline({ events, onEventSelect }: EventTimelineProps) {
  return (
    <section className="panel timeline-panel" id="history" aria-labelledby="event-history-title">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon">
            <CalendarClock size={17} />
          </div>
          <div>
            <h2 id="event-history-title">История событий</h2>
            <p>События и проблемы выбранного EnergyObject</p>
          </div>
        </div>
        <span className="panel-count">{eventCountLabel(events.length)}</span>
      </div>

      <div className="timeline-list">
        {events.length === 0 ? (
          <div className="empty-state">История пока пуста</div>
        ) : (
          events.map((event, index) => {
            const presentation = eventPresentation[event.severity] ?? {
              icon: CircleDot,
              label: 'Другое событие',
            };
            const Icon = presentation.icon;

            const content = (
              <>

                <span className={`timeline-marker event-${event.severity}`}>
                  <Icon size={14} />
                </span>

                <span className="timeline-body">
                  <span className="timeline-meta">
                    <span>{event.timestamp}</span>
                    <span className="timeline-status">{eventStatusLabel(event.status)}</span>
                  </span>
                  <strong>{event.title}</strong>
                  <span className="timeline-description">{event.description}</span>
                  <span className="timeline-footer">
                    <span className={`event-type event-type-${event.severity}`}>
                      {presentation.label}
                    </span>
                    {event.relatedAssetLabel && (
                      <span className="timeline-asset">{event.relatedAssetLabel}</span>
                    )}
                  </span>
                </span>

                {index !== events.length - 1 && <span className="timeline-stem" />}

              </>
            );

            return onEventSelect ? (
              <button
                type="button"
                className="timeline-item timeline-item--button"
                key={event.id}
                onClick={() => onEventSelect(event.id)}
                aria-label={`${event.title}. ${presentation.label}. ${event.timestamp}. ${eventStatusLabel(event.status)}`}
              >
                {content}
              </button>
            ) : (
              <div className="timeline-item" key={event.id}>
                {content}
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

export default EventTimeline;
