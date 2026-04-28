import { Router, type Router as ExpressRouter } from 'express';

import SettingsController from './settings.controller';

import { authenticate, requireRole } from '@/middlewares/authentication';
import { ISettingsService } from '@/types';

export default function createSettingsRoutes(
  settingsService: ISettingsService
) {
  const settingsController = new SettingsController(settingsService);
  const settingsRoutes: ExpressRouter = Router();

  settingsRoutes.use(authenticate, requireRole('ADMIN'));

  // Singleton settings
  settingsRoutes.get('/', settingsController.getSettings);
  settingsRoutes.patch('/store', settingsController.updateStoreSettings);
  settingsRoutes.patch('/org', settingsController.updateOrgSettings);

  // Integrations
  settingsRoutes.get('/integrations', settingsController.getIntegrations);
  settingsRoutes.post('/integrations', settingsController.createIntegration);
  settingsRoutes.get(
    '/integrations/:integrationId',
    settingsController.getIntegrationById
  );
  settingsRoutes.patch(
    '/integrations/:integrationId',
    settingsController.updateIntegration
  );
  settingsRoutes.patch(
    '/integrations/:integrationId/toggle',
    settingsController.toggleIntegration
  );
  settingsRoutes.delete(
    '/integrations/:integrationId',
    settingsController.deleteIntegration
  );

  return settingsRoutes;
}
