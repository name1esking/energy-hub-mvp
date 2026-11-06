import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EventView } from '../types/ui';

export interface AlertsPanelProps {
  events: EventView[];
  onEventSelect?: (eventId: string) => void;
}

const severityPresentation: Record<string, { icon: LucideIcon; label: string; className: string }> = {
  info: { icon: Info, label: 'Информация', className: 'info' },
  warning: { icon: AlertTriangle, label: 'Предупреждение', className: 'warning' },
  critical: { icon: AlertCircle, label: 'Критично', className: 'critical' },
};

export function AlertsPanel({ events, onEventSelect }: AlertsPanelProps) {
  const attentionEvents = events.filter((event) => event.severity !== 'info').slice(0, 4);

  return (
    <section className="panel notifications-panel" id="notifications">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon"><AlertCircle size={17} /></div>
          <div><h2>Уведомления</h2><p>События, требующие внимания</p></div>
        </div>
        <span className="panel-count">{attentionEvents.length} важных</span>
      </div>
      <div className="notification-list">
        {attentionEvents.length === 0 ? (
          <div className="empty-state">Нет событий, требующих внимания</div>
        ) : attentionEvents.map((event) => {
          const presentation = severityPresentation[event.severity] ?? severityPresentation.info;
          const Icon = presentation.icon;
          return (
            <button
              type="button"
              className={`notification-item severity-${presentation.className}`}
              key={event.id}
              onClick={() => onEventSelect?.(event.id)}
            >
              <div className="notification-icon"><Icon size={16} /></div>
              <div className="notification-content">
                <div className="notification-title-row"><strong>{event.title}</strong></div>
                <p>{event.description}</p>
                <span className="notification-time">{event.timestamp} · {presentation.label} · {event.status}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
