import { prisma } from '@/config/client.config';
import { ISettingsService } from '@/types';
import { errorMessage } from '@/utils/errors';

const settingTable = prisma.setting;
const integrationTable = prisma.integration;

export default class SettingsService implements ISettingsService {
  /**
   * Return the application settings, creating the singleton row if it doesn't
   * exist yet (upsert on id = 1).
   */
  async getSettings() {
    try {
      const settings = await settingTable.upsert({
        where: { id: 1 },
        create: {
          id: 1,
        },
        update: {},
        include: { integrations: true, storage: true },
      });

      return settings;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des paramètres: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Update application-level settings (storeName, storeURL).
   * Creates the singleton row if it doesn't exist yet.
   */
  async updateSettings(data: { orgCode?: number; orgParentalCode?: number }) {
    try {
      const settings = await settingTable.upsert({
        where: { id: 1 },
        create: {
          id: 1,
          orgCode: data.orgCode ?? undefined,
          orgParentalCode: data.orgParentalCode ?? undefined,
        },
        update: {
          ...(data.orgCode !== undefined && { orgCode: data.orgCode }),
          ...(data.orgParentalCode !== undefined && {
            orgParentalCode: data.orgParentalCode,
          }),
        },
        include: { integrations: true, storage: true },
      });

      return settings;
    } catch (error) {
      throw new Error(
        `Erreur lors de la mise à jour des paramètres: ${errorMessage(error)}`
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Integrations
  // ---------------------------------------------------------------------------

  /**
   * List all integrations by type if any
   */
  async getIntegrations(type?: string) {
    try {
      const integrations = await integrationTable.findMany({
        where: {
          settingId: 1,
          ...(type ? { type: type as any } : {}),
        },
        orderBy: { createdAt: 'desc' },
      });

      return integrations;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération des intégrations: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Get a single integration by its ID.
   */
  async getIntegrationById(integrationId: string) {
    try {
      const integration = await integrationTable.findUnique({
        where: { id: integrationId },
      });

      if (!integration) {
        throw new Error('Integration not found');
      }

      return integration;
    } catch (error) {
      throw new Error(
        `Erreur lors de la récupération de l'intégration: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Add a new integration to the singleton settings row.
   * NOTE: `key` is stored as-is — encrypt before passing if it is sensitive.
   */
  async createIntegration(data: {
    id: string;
    name: string;
    url: string;
    type: string;
    key: string;
    isActive?: boolean;
    fieldMapping?: Record<string, any>;
  }) {
    try {
      const integration = await integrationTable.create({
        data: {
          id: data.id,
          settingId: 1,
          name: data.name,
          url: data.url,
          type: data.type as any,
          key: data.key ?? null,
          isActive: data.isActive ?? true,
          fieldMapping: data.fieldMapping ?? {},
        },
      });

      return integration;
    } catch (error) {
      throw new Error(
        `Erreur lors de la création de l'intégration: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Update an existing integration.
   */
  async updateIntegration(
    integrationId: string,
    data: {
      name?: string;
      url?: string;
      type?: string;
      key?: string;
      isActive?: boolean;
      fieldMapping?: Record<string, any>;
    }
  ) {
    try {
      const integration = await integrationTable.update({
        where: { id: integrationId },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.url !== undefined && { url: data.url }),
          ...(data.type !== undefined && { type: data.type as any }),
          ...(data.key !== undefined && { key: data.key }),
          ...(data.isActive !== undefined && { isActive: data.isActive }),
          ...(data.fieldMapping !== undefined && {
            fieldMapping: data.fieldMapping,
          }),
        },
      });

      return integration;
    } catch (error) {
      throw new Error(
        `Erreur lors de la mise à jour de l'intégration: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Toggle the isActive flag on an integration.
   */
  async toggleIntegration(integrationId: string) {
    try {
      const current = await integrationTable.findUniqueOrThrow({
        where: { id: integrationId },
      });

      const integration = await integrationTable.update({
        where: { id: integrationId },
        data: { isActive: !current.isActive },
      });

      return integration;
    } catch (error) {
      throw new Error(
        `Erreur lors du basculement de l'intégration: ${errorMessage(error)}`
      );
    }
  }

  /**
   * Delete an integration.
   */
  async deleteIntegration(integrationId: string) {
    try {
      const integration = await integrationTable.delete({
        where: { id: integrationId },
      });

      return integration;
    } catch (error) {
      throw new Error(
        `Erreur lors de la suppression de l'intégration: ${errorMessage(error)}`
      );
    }
  }
}
