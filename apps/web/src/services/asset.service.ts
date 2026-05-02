import { handleApiError } from '@/lib/api';
import { buildBulkFormData, buildSingleFormData } from '@/lib/asset';
import axios from '@/services/axios.service';

/**
 * GET /storage/file/*
 * Get api file url
 */
export const fetchStorageFile = async (fileKey: string) => {
  try {
    const response = await axios.get(`/api/storage/file/${fileKey}`, {
      responseType: 'blob',
    });
    return response.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
/**
 * GET /assets
 * Paginated, filterable list. All params are optional.
 */
export const getAssets = async (
  params?: ListAssetsParams
): Promise<PaginatedAssets> => {
  try {
    const response = await axios.get('api/asset/list', { params });
    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * GET /assets/:id
 */
export const getAssetById = async (id: string): Promise<Asset> => {
  try {
    const response = await axios.get(`api/asset/${id}`);
    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * POST /assets
 * Multipart upload — file is required, thumbnail is optional.
 */
export const createAsset = async (input: CreateAssetInput): Promise<Asset> => {
  try {
    const response = await axios.post('api/asset', buildSingleFormData(input), {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * POST /assets/bulk
 * Upload up to 50 assets in one request.
 * Returns both succeeded and failed items (207 Multi-Status).
 */
export const bulkCreateAssets = async (
  input: BulkCreateAssetInput
): Promise<BulkCreateResult> => {
  try {
    const response = await axios.post(
      'api/asset/bulk',
      buildBulkFormData(input),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * PATCH /assets/:id
 * All fields are optional. Pass a `file` or `thumbnail` to replace them.
 */
export const updateAsset = async (
  id: string,
  input: UpdateAssetInput
): Promise<Asset> => {
  try {
    const response = await axios.patch(
      `api/asset/${id}`,
      buildSingleFormData(input),
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * DELETE /assets/:id
 * Also removes the file from storage.
 */
export const deleteAsset = async (id: string): Promise<void> => {
  try {
    await axios.delete(`api/asset/${id}`);
  } catch (error: any) {
    return handleApiError(error);
  }
};

/**
 * DELETE /assets/bulk
 * Returns counts of deleted and failed items (207 Multi-Status).
 */
export const bulkDeleteAssets = async (
  ids: string[]
): Promise<BulkDeleteResult> => {
  try {
    const response = await axios.delete('api/asset/bulk', {
      data: { ids },
    });
    return response.data.data;
  } catch (error: any) {
    return handleApiError(error);
  }
};
