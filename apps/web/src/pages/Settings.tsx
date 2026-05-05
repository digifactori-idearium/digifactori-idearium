import React, { useEffect, useState } from 'react';

import { IntegrationCard } from '@/components/settings/IntegrationCard';
import { NewIntegrationCard } from '@/components/settings/NewIntegrationCard';
import { OrgCard } from '@/components/settings/OrgCard';
import { StoreCard } from '@/components/settings/StoreCard';
import { getSettings, getIntegrations } from '@/services/settings.service';

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [settingsData, integrationsData] = await Promise.all([
        getSettings(),
        getIntegrations(),
      ]);

      setSettings(settingsData);
      setIntegrations(integrationsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="w-full min-h-screen p-6">
      <div className="magic-text text-center md:text-5xl text-3xl flex items-center justify-center gap-2 font-bold mb-6">
        Paramètres
      </div>

      <div className="container mx-auto py-10 w-full max-w-6xl sm:px-6 lg:px-8">
        <h2 className="font-bold uppercase text-muted-foreground mb-3 ml-1">
          Organisation
        </h2>

        <OrgCard setting={settings} onUpdated={fetchData} />

        <h2 className="font-bold uppercase text-muted-foreground mb-3 ml-1">
          Store primaire
        </h2>

        <StoreCard storage={settings?.storage} onUpdated={fetchData} />

        <h2 className="font-bold uppercase text-muted-foreground mb-3 ml-1">
          Intégrations
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <NewIntegrationCard onCreated={fetchData} />

          {integrations.map(integration => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onUpdated={fetchData}
              onDeleted={fetchData}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
