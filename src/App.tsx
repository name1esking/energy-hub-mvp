import { useState } from 'react';
import { EnergyHubLayout } from './components/EnergyHubLayout';
import { buildDashboardData } from './data/demoAdapter';
import { sites } from './data/demo/index.ts';

import type { SiteId } from './data/demo/types';
import type { Period, UiRole } from './types/ui';

export default function App() {
  const [role, setRole] = useState<UiRole>('hub_operator');
  const [period, setPeriod] = useState<Period>('24h');
  const [siteId, setSiteId] = useState<SiteId>('site-astra');

  const dashboardData = buildDashboardData(siteId, period);

  const siteOptions = sites.map((site) => ({
    id: site.id,
    name: site.name,
  }));

  return (
    <EnergyHubLayout
      {...dashboardData}
      role={role}
      siteOptions={siteOptions}
      onSiteChange={(nextSiteId) =>
        setSiteId(nextSiteId as SiteId)
      }
      onRoleChange={setRole}
      onPeriodChange={setPeriod}
      onAssetSelect={(assetId) =>
        console.info('Selected Asset:', assetId)
      }
      onEventSelect={() =>
        document.getElementById('history')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        })
      }
      onServiceSelect={(serviceId) =>
        console.info('Selected Service:', serviceId)
      }
      onMeasurementSelect={(measurementId) =>
        console.info('Selected Measurement:', measurementId)
      }
    />
  );
}
