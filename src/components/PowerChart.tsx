import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';
import { Activity, Info } from 'lucide-react';
import type { Period, PowerChartView, ThemeMode } from '../types/ui';

export interface PowerChartProps {
  data: PowerChartView | null;
  theme: ThemeMode;
  period: Period;
  title?: string;
}

export function PowerChart({ data, theme, period, title = 'Профиль мощности' }: PowerChartProps) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9AACC0' : '#718096';
  const axisColor = isDark ? '#29384B' : '#E6ECF2';
  const periodLabel = period === '24h'
    ? 'Последние 24 часа'
    : period === '7d'
      ? 'Последние 7 дней'
      : 'Последние 30 дней';

  const option: EChartsOption = {
    animation: false,
    color: data?.series.map((series) => series.color),
    grid: { left: 8, right: 12, top: 30, bottom: 8, containLabel: true },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 8,
      itemHeight: 8,
      textStyle: { color: textColor, fontSize: 11 },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: isDark ? '#172538' : '#FFFFFF',
      borderColor: isDark ? '#34465C' : '#DDE5ED',
      textStyle: { color: isDark ? '#E8EEF5' : '#24364A' },
      valueFormatter: (value) => value === null || value === undefined
        ? 'Нет данных'
        : `${value} ${data?.unit ?? ''}`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data?.labels ?? [],
      axisLabel: { color: textColor, fontSize: 10 },
      axisLine: { lineStyle: { color: axisColor } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      name: data?.unit ?? '',
      nameTextStyle: { color: textColor, fontSize: 10, padding: [0, 0, 6, 0] },
      axisLabel: { color: textColor, fontSize: 10 },
      splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
    },
    series: (data?.series ?? []).map((series) => ({
      name: series.label,
      type: 'line',
      smooth: true,
      connectNulls: false,
      symbol: 'none',
      lineStyle: { width: 2.4, color: series.color },
      itemStyle: { color: series.color },
      data: series.values,
    })),
  };

  return (
    <section className="panel chart-panel" id="analytics">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon"><Activity size={17} /></div>
          <div><h2>{title}</h2><p>{periodLabel} · значения переданы приложением</p></div>
        </div>
        <span className="chart-unit">{data?.unit ?? '—'}</span>
      </div>
      {data && data.labels.length > 0 && data.series.length > 0 ? (
        <div className="chart-container">
          <ReactECharts option={option} notMerge lazyUpdate style={{ height: 260, width: '100%' }} />
        </div>
      ) : (
        <div className="empty-state chart-empty">Нет данных для графика за выбранный период.</div>
      )}
      <div className="chart-note"><Info size={13} /> Пропуски показаны как разрывы графика. Не смешивайте мощность (кВт) и энергию (кВт·ч) на одной шкале.</div>
    </section>
  );
}
