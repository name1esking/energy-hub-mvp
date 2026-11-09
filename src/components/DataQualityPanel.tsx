import { Database, Info } from 'lucide-react';
import type { DataQualityRowView } from '../types/ui';

export interface DataQualityPanelProps {
  rows: DataQualityRowView[];
  subtitle?: string;
  onCellSelect?: (measurementId: string) => void;
}

const qualityLabels: Record<string, string> = {
  complete: 'Данные получены',
  missing: 'Нет данных',
  stale: 'Устаревшие данные',
  estimated: 'Расчётные данные',
  simulated: 'Демонстрационные данные',
  unknown: 'Неизвестное качество',
};

function channelCountLabel(count: number): string {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 14) return `${count} каналов`;
  if (lastOne === 1) return `${count} канал`;
  if (lastOne >= 2 && lastOne <= 4) return `${count} канала`;
  return `${count} каналов`;
}

function qualityLabel(quality: string): string {
  return qualityLabels[quality] ?? `Неизвестно: ${quality}`;
}

function qualityClass(quality: string): string {
  switch (quality) {
    case 'complete':
      return 'heat-complete';
    case 'missing':
      return 'heat-missing';
    case 'stale':
      return 'heat-stale';
    case 'estimated':
      return 'heat-estimated';
    case 'simulated':
      return 'heat-simulated';
    default:
      return 'heat-unknown';
  }
}

export function DataQualityPanel({
  rows,
  subtitle = 'Состояния качества по измерительным каналам',
  onCellSelect,
}: DataQualityPanelProps) {
  const columnCount = Math.max(0, ...rows.map((row) => row.cells.length));
  const labels = Array.from({ length: columnCount }, (_, index) => {
    return rows.find((row) => row.cells[index])?.cells[index].label ?? `Точка ${index + 1}`;
  });
  const gridTemplateColumns = `minmax(112px, 1fr) repeat(${columnCount}, minmax(14px, 17px))`;

  const allCells = rows.flatMap((row) => row.cells);
  const completeCount = allCells.filter((cell) => cell.quality === 'complete').length;
  const attentionCount = allCells.filter(
    (cell) => cell.quality === 'missing' || cell.quality === 'stale',
  ).length;

  return (
    <section
      className="panel quality-panel"
      aria-label="Качество данных"
      id="data-quality"
      aria-labelledby="data-quality-title"
    >
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon">
            <Database size={17} />
          </div>
          <div>
            <h2 id="data-quality-title">Качество данных</h2>
            <p>{subtitle}</p>
          </div>
        </div>
        <span className="panel-count">{channelCountLabel(rows.length)}</span>
      </div>

      {rows.length === 0 ? (
        <div className="empty-state">Нет измерений для анализа качества.</div>
      ) : (
        <>
          <div className="quality-summary" aria-label="Сводка по качеству данных">
            <div className="quality-summary-item">
              <span>Точек проверки</span>
              <strong>{allCells.length}</strong>
            </div>
            <div className="quality-summary-item quality-summary-item--complete">
              <span>Получено</span>
              <strong>{completeCount}</strong>
            </div>
            <div className="quality-summary-item quality-summary-item--attention">
              <span>Нужно проверить</span>
              <strong>{attentionCount}</strong>
            </div>
          </div>

          {columnCount > 0 ? (
            <div className="heatmap-scroll">
              <div className="heatmap-wrap">
                <div className="heatmap-labels" style={{ gridTemplateColumns }}>
                  <span />
                  {labels.map((label, index) => (
                    <span key={`${label}-${index}`} title={label}>
                      {label}
                    </span>
                  ))}
                </div>

                {rows.map((row) => (
                  <div className="heatmap-row" key={row.id} style={{ gridTemplateColumns }}>
                    <span className="heatmap-row-label" title={row.label}>
                      {row.label}
                    </span>

                    {Array.from({ length: columnCount }, (_, index) => {
                      const cell = row.cells[index];

                      if (!cell) {
                        return (
                          <span
                            className="heatmap-cell heatmap-cell--empty"
                            key={`${row.id}-empty-${index}`}
                            aria-hidden="true"
                          />
                        );
                      }

                      const label = qualityLabel(cell.quality);
                      const accessibleLabel = `${row.label}, ${cell.label}: ${label}`;

                      return (
                        <button
                          type="button"
                          key={`${row.id}-${index}`}
                          className={`heatmap-cell ${qualityClass(cell.quality)}`}
                          title={accessibleLabel}
                          aria-label={accessibleLabel}
                          disabled={!cell.measurementId || !onCellSelect}
                          onClick={() => {
                            if (cell.measurementId) onCellSelect?.(cell.measurementId);
                          }}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">Для каналов пока не переданы точки проверки.</div>
          )}
        </>
      )}

      <div className="heatmap-legend" aria-label="Обозначения качества данных">
        {Object.entries(qualityLabels).map(([quality, label]) => (
          <span key={quality}>
            <i className={qualityClass(quality)} />
            {label}
          </span>
        ))}
      </div>

      <div className="chart-note">
        <Info size={13} />
        <span>
          Отсутствующее значение не является нулевым измерением. Состояния качества поступают
          из слоя данных.
        </span>
      </div>
    </section>
  );
}

export default DataQualityPanel;
