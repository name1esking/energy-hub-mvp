import { AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { EventView } from '../types/ui';

export interface AlertsPanelProps {
  events: EventView[];
  onEventSelect?: (eventId: string) => void;
}

const severityPresentation: Record<
  string,
  { icon: LucideIcon; label: string; className: string; priority: number }
> = {
  critical: {
    icon: AlertCircle,
    label: 'Критично',
    className: 'critical',
    priority: 0,
  },
  warning: {
    icon: AlertTriangle,
    label: 'Предупреждение',
    className: 'warning',
    priority: 1,
  },
  info: {
    icon: Info,
    label: 'Информация',
    className: 'info',
    priority: 2,
  },
};

const fallbackPresentation = {
  icon: Info,
  label: 'Другое событие',
  className: 'info',
  priority: 3,
};

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

export function AlertsPanel({ events, onEventSelect }: AlertsPanelProps) {
  const attentionEvents = events
    .filter((event) => event.severity !== 'info' && event.status !== 'resolved')
    .slice()
    .sort((a, b) => {
      const aPriority = severityPresentation[a.severity]?.priority ?? fallbackPresentation.priority;
      const bPriority = severityPresentation[b.severity]?.priority ?? fallbackPresentation.priority;
      return aPriority - bPriority;
    });

  const visibleEvents = attentionEvents.slice(0, 4);
  const criticalCount = attentionEvents.filter((event) => event.severity === 'critical').length;
  const warningCount = attentionEvents.filter((event) => event.severity === 'warning').length;
  const otherCount = attentionEvents.length - criticalCount - warningCount;
  const hiddenCount = Math.max(0, attentionEvents.length - visibleEvents.length);

  return (
    <section
      className="panel notifications-panel"
      id="notifications"
      aria-labelledby="notifications-title"
    >
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon">
            <AlertCircle size={17} />
          </div>
          <div>
            <h2 id="notifications-title">Уведомления</h2>
            <p>События, требующие внимания</p>
          </div>
        </div>
        <span className="panel-count panel-count--alert">
          {attentionEvents.length} требуют внимания
        </span>
      </div>

      {attentionEvents.length > 0 && (
        <div className="admin-alert-summary" aria-label="Распределение уведомлений">
          <span className="admin-alert-summary-item admin-alert-summary-item--critical">
            <i />
            {criticalCount} критичных
          </span>
          <span className="admin-alert-summary-item admin-alert-summary-item--warning">
            <i />
            {warningCount} предупреждений
          </span>
          {otherCount > 0 && (
            <span className="admin-alert-summary-item admin-alert-summary-item--other">
              <i />
              {otherCount} других
            </span>
          )}
        </div>
      )}

      <div className="notification-list">
        {visibleEvents.length === 0 ? (
          <div className="empty-state">Нет событий, требующих внимания</div>
        ) : (
          visibleEvents.map((event) => {
            const presentation = severityPresentation[event.severity] ?? fallbackPresentation;
            const Icon = presentation.icon;

            return (
              <button
                type="button"
                disabled={!onEventSelect}
                className={`notification-item severity-${presentation.className}`}
                key={event.id}
                onClick={() => onEventSelect?.(event.id)}
                aria-label={`${event.title}. ${presentation.label}. ${event.timestamp}. ${eventStatusLabel(event.status)}`}
              >
                <span className="notification-icon">
                  <Icon size={16} />
                </span>

                <span className="notification-content">
                  <span className="notification-title-row">
                    <strong>{event.title}</strong>
                    <span className="notification-severity">{presentation.label}</span>
                  </span>
                  <span className="notification-description">{event.description}</span>
                  <span className="notification-time">
                    <span>{event.timestamp}</span>
                    <span className="notification-time-separator">·</span>
                    <span>{eventStatusLabel(event.status)}</span>
                  </span>
                </span>
              </button>
            );
          })
        )}
      </div>

      {hiddenCount > 0 && (
        <div className="admin-alert-more">И ещё {hiddenCount} событий в списке истории</div>
      )}
    </section>
  );
}

export default AlertsPanel;
