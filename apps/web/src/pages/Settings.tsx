import React from 'react';

import { IntegrationCard } from '@/components/settings/IntegrationCard';
import { NewIntegrationCard } from '@/components/settings/NewIntegrationCard';
import { StoreCard } from '@/components/settings/StoreCard';

export const Settings: React.FC = () => {
  const currentStatus = 'existing';
  const INTEGRATIONS: Integration[] = [
    { id: '1', name: 'Polypizza' },
    { id: '2', name: 'Assets3D' },
    { id: '3', name: 'Musically' },
    { id: '4', name: 'AppleTree' },
    { id: '5', name: 'Coachella' },
  ];

  return (
    <div className="w-full min-h-screen p-6">
      <div className="magic-text text-center md:text-5xl text-3xl justify-center flex items-center gap-2 font-bold mb-6">
        Paramètres
      </div>

      <div className="container mx-auto py-10 w-full max-w-6xl sm:px-6 lg:px-8">
        <h2 className=" font-bold uppercase text-muted-foreground mb-3 ml-1">
          Store primaire
        </h2>

        <StoreCard
          name="Nom du store"
          currentStatus={currentStatus}
          url="http://localhost:5173/app/settings"
        />

        <h2 className=" font-bold uppercase text-muted-foreground mb-3 ml-1">
          Intégrations
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 ">
          <NewIntegrationCard />
          {INTEGRATIONS.map(integration => (
            <IntegrationCard id={integration.id} name={integration.name} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
