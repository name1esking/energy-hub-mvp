import { assets, formatMetric, getLatestMeasurement, getSiteDataQuality, getSiteEvents, sites } from './index.ts'

/**
 * Неблокирующий пример подключения к React.
 * Не монтируется автоматически, App.tsx остаётся нетронутым.
 */
export function ExampleEnergyPanel() {
  return (
    <div>
      {sites.map((site) => {
        const power = getLatestMeasurement(site.id, 'consumption_power')
        const solar = getLatestMeasurement(site.id, 'generation_power')
        const quality = getSiteDataQuality(site.id)
        const siteAssets = assets.filter((a) => a.siteId === site.id)
        const alerts = getSiteEvents(site.id).filter((event) => event.status === 'open')
        return (
          <section key={site.id} style={{ marginBottom: 24 }}>
            <h2>{site.name}</h2>
            <p>{site.location}</p>
            <p>Потребляемая мощность: {formatMetric(power?.value ?? null, 'кВт')}</p>
            <p>Генерируемая мощность: {formatMetric(solar?.value ?? null, 'кВт')}</p>
            <p>Оборудования: {siteAssets.length}</p>
            <p>Полнота данных: {formatMetric(quality.completenessPercent, '%')}</p>
            <p>Оценка качества данных: {formatMetric(quality.qualityScorePercent, '%')}</p>
            <p>Открытых событий: {alerts.length}</p>
          </section>
        )
      })}
    </div>
  )
}
