import { handleApiError } from '@/lib/api';
import axios from '@/services/axios.service';

// Settings
export const getSettings = async (): Promise<Settings> => {
  try {
    const response = await axios.get('api/settings');

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const updateStoreSettings = async (
  payload: Partial<Settings>
): Promise<Settings> => {
  try {
    const response = await axios.patch('api/settings/store', payload);

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
export const updateOrgSettings = async (
  payload: Partial<Settings>
): Promise<Settings> => {
  try {
    const response = await axios.patch('api/settings/org', payload);

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
// Integrations
export const getIntegrations = async (
  type?: IntegrationType
): Promise<Integration[]> => {
  try {
    const response = await axios.get('api/settings/integrations', {
      params: type ? { type } : undefined,
    });

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
export const getIntegrationById = async (id: string): Promise<Integration> => {
  try {
    const response = await axios.get(`api/settings/integrations/${id}`);

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const createIntegration = async (
  payload: Integration
): Promise<Integration> => {
  try {
    const response = await axios.post('api/settings/integrations', payload);

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const updateIntegration = async (
  id: string,
  payload: Partial<Integration>
): Promise<Integration> => {
  try {
    const response = await axios.patch(
      `api/settings/integrations/${id}`,
      payload
    );

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const toggleIntegration = async (id: string): Promise<Integration> => {
  try {
    const response = await axios.patch(
      `api/settings/integrations/${id}/toggle`
    );

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

export const deleteIntegration = async (id: string): Promise<void> => {
  try {
    const response = await axios.delete(`api/settings/integrations/${id}`);

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }
  } catch (error: any) {
    return handleApiError(error);
  }
};
