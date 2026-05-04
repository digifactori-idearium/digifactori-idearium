import { Router, type Router as ExpressRouter } from 'express';

import SettingsController from './settings.controller';

import { authenticate, requireRole } from '@/middlewares/authentication';
import { ISettingsService } from '@/types';

export default function createSettingsRoutes(
  settingsService: ISettingsService
) {
  const settingsController = new SettingsController(settingsService);
  const settingsRoutes: ExpressRouter = Router();

  settingsRoutes.use(authenticate);

  // Singleton settings
  settingsRoutes.get('/', requireRole('ADMIN'), settingsController.getSettings);
  settingsRoutes.patch(
    '/org',
    requireRole('ADMIN'),
    settingsController.updateOrgSettings
  );

  // Integrations
  settingsRoutes.get('/integrations', settingsController.getIntegrations);
  settingsRoutes.post(
    '/integrations',
    requireRole('ADMIN'),
    settingsController.createIntegration
  );
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
    requireRole('ADMIN'),
    settingsController.toggleIntegration
  );
  settingsRoutes.delete(
    '/integrations/:integrationId',
    requireRole('ADMIN'),
    settingsController.deleteIntegration
  );

  return settingsRoutes;
}
