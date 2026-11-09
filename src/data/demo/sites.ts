import type { Portfolio, Site } from './types.ts'

/** Все объекты и географические обозначения вымышлены. */
export const portfolios: readonly Portfolio[] = [
  { id: 'portfolio-nova', name: 'Учебный портфель «Нова»' },
]

export const sites: readonly Site[] = [
  {
    id: 'site-astra',
    name: 'Энергокомплекс «Астра-9»',
    location: 'Вымышленная зона «Северная Линия»',
    type: 'industrial',
    portfolioId: 'portfolio-nova',
  },
  {
    id: 'site-lumen',
    name: 'Бизнес-центр «Люмен»',
    location: 'Вымышленный квартал «Мозаика»',
    type: 'office',
    portfolioId: 'portfolio-nova',
  },
]
