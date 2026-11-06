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
};

function qualityClass(quality: string): string {
  switch (quality) {
    case 'complete': return 'heat-complete';
    case 'missing': return 'heat-missing';
    case 'stale': return 'heat-stale';
    case 'estimated': return 'heat-estimated';
    case 'simulated': return 'heat-simulated';
    default: return 'heat-unknown';
  }
}

export function DataQualityPanel({ rows, subtitle = 'Состояния качества по измерительным каналам', onCellSelect }: DataQualityPanelProps) {
  const columnCount = Math.max(1, ...rows.map((row) => row.cells.length));
  const labels = rows[0]?.cells.map((cell) => cell.label) ?? [];
  const gridTemplateColumns = `minmax(0, 1fr) repeat(${columnCount}, minmax(12px, 17px))`;

  return (
    <section className="panel quality-panel" aria-label="Качество данных" id="data-quality">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon"><Database size={17} /></div>
          <div><h2>Качество данных</h2><p>{subtitle}</p></div>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">Нет измерений для анализа качества.</div>
      ) : (
        <div className="heatmap-wrap">
          <div className="heatmap-labels" style={{ gridTemplateColumns }}>
            <span />
            {labels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
          </div>
          {rows.map((row) => (
            <div className="heatmap-row" key={row.id} style={{ gridTemplateColumns }}>
              <span className="heatmap-row-label" title={row.label}>{row.label}</span>
              {row.cells.map((cell, index) => (
                <button
                  type="button"
                  key={`${row.id}-${index}`}
                  className={`heatmap-cell ${qualityClass(cell.quality)}`}
                  title={`${row.label}, ${cell.label}: ${qualityLabels[cell.quality] ?? cell.quality}`}
                  aria-label={`${row.label}, ${cell.label}: ${qualityLabels[cell.quality] ?? cell.quality}`}
                  onClick={() => cell.measurementId && onCellSelect?.(cell.measurementId)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
      <div className="heatmap-legend">
        {Object.entries(qualityLabels).map(([quality, label]) => (
          <span key={quality}><i className={qualityClass(quality)} /> {label}</span>
        ))}
      </div>
      <div className="chart-note"><Info size={13} /> Нет данных — это не нулевое измерение. Значения quality приходят из слоя данных.</div>
    </section>
  );
}
