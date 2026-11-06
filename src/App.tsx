import { useState } from 'react';
import { EnergyHubLayout } from './components/EnergyHubLayout';
import {
  demoAssets,
  demoEnergyObject,
  demoEvents,
  demoMetricCards,
  demoPowerChart,
  demoQualityRows,
  demoServices,
  demoTopology,
} from './data/demoData';
import type { UiRole } from './types/ui';

export default function App() {
  const [role, setRole] = useState<UiRole>('hub_operator');

  return (
    <EnergyHubLayout
      energyObject={demoEnergyObject}
      role={role}
      onRoleChange={setRole}
      assets={demoAssets}
      metrics={demoMetricCards}
      events={demoEvents}
      services={demoServices}
      chartData={demoPowerChart}
      qualityRows={demoQualityRows}
      topology={demoTopology}
      onAssetSelect={(assetId) => console.info('Selected Asset view:', assetId)}
      onEventSelect={(eventId) => console.info('Selected Event view:', eventId)}
      onServiceSelect={(serviceId) => console.info('Selected Service view:', serviceId)}
      onMeasurementSelect={(measurementId) => console.info('Selected Measurement view:', measurementId)}
    />
  );
}
