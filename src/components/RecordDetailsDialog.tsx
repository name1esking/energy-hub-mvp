import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import type { EventView, MeasurementView } from '../types/ui';

interface RecordDetailsDialogProps {
  event: EventView | null;
  measurement: MeasurementView | null;
  onClose: () => void;
}

interface DetailFieldProps {
  label: string;
  value: string;
}

const severityLabels: Record<string, string> = {
  critical: '\u041a\u0440\u0438\u0442\u0438\u0447\u043d\u043e',
  warning: '\u041f\u0440\u0435\u0434\u0443\u043f\u0440\u0435\u0436\u0434\u0435\u043d\u0438\u0435',
  info: '\u0418\u043d\u0444\u043e\u0440\u043c\u0430\u0446\u0438\u044f',
};

const statusLabels: Record<string, string> = {
  open: '\u041e\u0442\u043a\u0440\u044b\u0442\u043e',
  resolved: '\u0420\u0435\u0448\u0435\u043d\u043e',
  demo_open: '\u041e\u0442\u043a\u0440\u044b\u0442\u043e \u00b7 \u0434\u0435\u043c\u043e',
  demo_planned: '\u0417\u0430\u043f\u043b\u0430\u043d\u0438\u0440\u043e\u0432\u0430\u043d\u043e \u00b7 \u0434\u0435\u043c\u043e',
};

const qualityLabels: Record<string, string> = {
  complete: '\u0414\u0430\u043d\u043d\u044b\u0435 \u043f\u043e\u043b\u0443\u0447\u0435\u043d\u044b',
  missing: '\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445',
  stale: '\u0423\u0441\u0442\u0430\u0440\u0435\u0432\u0448\u0438\u0435 \u0434\u0430\u043d\u043d\u044b\u0435',
  estimated: '\u0420\u0430\u0441\u0447\u0435\u0442\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435',
  simulated: '\u0414\u0435\u043c\u043e\u043d\u0441\u0442\u0440\u0430\u0446\u0438\u043e\u043d\u043d\u044b\u0435 \u0434\u0430\u043d\u043d\u044b\u0435',
  unknown: '\u041d\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043d\u043e\u0435 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u043e',
};

function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="record-details-field">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return timestamp;

  return `${date.toLocaleString('ru-RU', { timeZone: 'UTC' })} UTC`;
}

export function RecordDetailsDialog({
  event,
  measurement,
  onClose,
}: RecordDetailsDialogProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isOpen = Boolean(event || measurement);

  useEffect(() => {
    if (!isOpen) return;

    const previousFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      previousFocus?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const title =
    event?.title ??
    measurement?.label ??
    '\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438';

  const description =
    event?.description ??
    `\u0418\u0437\u043c\u0435\u0440\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0439 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c: ${measurement?.metric ?? '\u043d\u0435 \u0443\u043a\u0430\u0437\u0430\u043d'}.`;

  const formattedValue =
    measurement?.value === null || measurement?.value === undefined
      ? '\u041d\u0435\u0442 \u0434\u0430\u043d\u043d\u044b\u0445'
      : `${new Intl.NumberFormat('ru-RU', {
          maximumFractionDigits: 2,
        }).format(measurement.value)} ${measurement.unit}`;

  return (
    <div
      className="record-details-backdrop"
      onMouseDown={(mouseEvent) => {
        if (mouseEvent.target === mouseEvent.currentTarget) onClose();
      }}
    >
      <section
        className="record-details-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-details-title"
        aria-describedby="record-details-description"
      >
        <header className="record-details-heading">
          <div>
            <span className="record-details-kicker">
              {event
                ? '\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438 \u0441\u043e\u0431\u044b\u0442\u0438\u044f'
                : '\u041f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438 \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f'}
            </span>
            <h2 id="record-details-title">{title}</h2>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            className="record-details-close"
            onClick={onClose}
            aria-label={'\u0417\u0430\u043a\u0440\u044b\u0442\u044c \u043f\u043e\u0434\u0440\u043e\u0431\u043d\u043e\u0441\u0442\u0438'}
          >
            <X size={18} />
          </button>
        </header>

        {event ? (
          <div className="record-details-grid">
            <DetailField
              label={'\u041f\u0440\u0438\u043e\u0440\u0438\u0442\u0435\u0442'}
              value={severityLabels[event.severity] ?? event.severity}
            />
            <DetailField
              label={'\u0421\u0442\u0430\u0442\u0443\u0441'}
              value={statusLabels[event.status] ?? event.status.replace(/_/g, ' ')}
            />
            <DetailField
              label={'\u0412\u0440\u0435\u043c\u044f \u0441\u043e\u0431\u044b\u0442\u0438\u044f'}
              value={event.timestamp}
            />
            {event.relatedAssetLabel && (
              <DetailField
                label={'\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435'}
                value={event.relatedAssetLabel}
              />
            )}
          </div>
        ) : measurement ? (
          <div className="record-details-grid">
            <DetailField
              label={'\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044c'}
              value={measurement.label}
            />
            <DetailField
              label={'\u0417\u043d\u0430\u0447\u0435\u043d\u0438\u0435'}
              value={formattedValue}
            />
            <DetailField
              label={'\u041a\u0430\u0447\u0435\u0441\u0442\u0432\u043e \u0434\u0430\u043d\u043d\u044b\u0445'}
              value={qualityLabels[measurement.quality] ?? measurement.quality}
            />
            <DetailField
              label={'\u0412\u0440\u0435\u043c\u044f \u0438\u0437\u043c\u0435\u0440\u0435\u043d\u0438\u044f'}
              value={formatTimestamp(measurement.timestamp)}
            />
            <DetailField
              label={'\u041a\u043e\u0434 \u043f\u043e\u043a\u0430\u0437\u0430\u0442\u0435\u043b\u044f'}
              value={measurement.metric}
            />
            {measurement.sourceLabel && (
              <DetailField
                label={'\u0418\u0441\u0442\u043e\u0447\u043d\u0438\u043a'}
                value={measurement.sourceLabel}
              />
            )}
            {measurement.assetLabel && (
              <DetailField
                label={'\u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435'}
                value={measurement.assetLabel}
              />
            )}
          </div>
        ) : null}

        <p id="record-details-description" className="record-details-description">
          {description}
        </p>

        <div className="record-details-id">
          ID: {event?.id ?? measurement?.id}
        </div>
      </section>
    </div>
  );
}
