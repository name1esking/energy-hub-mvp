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

export function PowerChart({
  data,
  theme,
  period,
  title = 'Профиль мощности',
}: PowerChartProps) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#9AACC0' : '#718096';
  const axisColor = isDark ? '#29384B' : '#E6ECF2';
  const tooltipBackground = isDark ? '#172538' : '#FFFFFF';
  const tooltipText = isDark ? '#E8EEF5' : '#24364A';

  const periodLabel =
    period === '24h'
      ? 'Последние 24 часа'
      : period === '7d'
        ? 'Последние 7 дней'
        : 'Последние 30 дней';

  const series = data?.series ?? [];
  const option: EChartsOption = {
    animation: false,
    color: series.map((item) => item.color),
    grid: {
      left: 12,
      right: 16,
      top: series.length > 1 ? 38 : 24,
      bottom: 18,
      containLabel: true,
    },
    legend: {
      show: series.length > 1,
      top: 0,
      right: 0,
      itemWidth: 9,
      itemHeight: 9,
      itemGap: 16,
      textStyle: { color: textColor, fontSize: 11 },
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      backgroundColor: tooltipBackground,
      borderColor: isDark ? '#34465C' : '#DDE5ED',
      borderWidth: 1,
      textStyle: { color: tooltipText, fontSize: 11 },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: isDark ? '#718399' : '#A8B6C5',
          type: 'dashed',
        },
      },
      valueFormatter: (value) =>
        value === null || value === undefined ? 'Нет данных' : `${value} ${data?.unit ?? ''}`,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data?.labels ?? [],
      axisLabel: {
        color: textColor,
        fontSize: 10,
        hideOverlap: true,
      },
      axisLine: { lineStyle: { color: axisColor } },
      axisTick: { show: false },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      name: data?.unit ?? '',
      nameTextStyle: {
        color: textColor,
        fontSize: 10,
        padding: [0, 0, 7, 0],
      },
      axisLabel: { color: textColor, fontSize: 10 },
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: {
          color: axisColor,
          type: 'dashed',
        },
      },
    },
    series: series.map((item) => ({
      name: item.label,
      type: 'line',
      smooth: true,
      connectNulls: false,
      showSymbol: false,
      symbol: 'circle',
      symbolSize: 6,
      lineStyle: {
        width: 2.5,
        color: item.color,
        cap: 'round',
      },
      itemStyle: { color: item.color },
      emphasis: {
        focus: 'series',
        scale: true,
      },
      data: item.values,
    })),
  };

  const hasChartData = Boolean(data && data.labels.length > 0 && series.length > 0);

  return (
    <section className="panel chart-panel" id="analytics" aria-labelledby="power-chart-title">
      <div className="panel-heading">
        <div className="panel-title-wrap">
          <div className="panel-icon">
            <Activity size={17} />
          </div>
          <div>
            <h2 id="power-chart-title">{title}</h2>
            <p>{periodLabel} · значения переданы приложением</p>
          </div>
        </div>
        <span className="chart-unit">{data?.unit ?? '—'}</span>
      </div>

      {hasChartData ? (
        <div className="chart-container">
          <ReactECharts
            option={option}
            notMerge
            lazyUpdate
            style={{ height: 280, width: '100%' }}
          />
        </div>
      ) : (
        <div className="empty-state chart-empty">
          <span className="chart-empty-icon">
            <Activity size={20} />
          </span>
          <strong>Нет данных для графика</strong>
          <span>Измерения за выбранный период пока не переданы.</span>
        </div>
      )}

      <div className="chart-note">
        <Info size={13} />
        <span>
          Пропуски показаны как разрывы графика. Не смешивайте мощность (кВт) и энергию (кВт·ч)
          на одной шкале.
        </span>
      </div>
    </section>
  );
}

export default PowerChart;
