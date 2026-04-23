import axios from './axios.service';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

// ── Documents

export const documentsApi = {
  list: (): Promise<ApiResponse<DocumentListItem[]>> =>
    axios.get('/api/editor').then(res => res.data),

  get: (id: string): Promise<ApiResponse<Document>> =>
    axios.get(`/api/editor/${id}`).then(res => res.data),

  create: (payload: CreateDocumentPayload): Promise<ApiResponse<Document>> =>
    axios.post('/api/editor/', payload).then(res => res.data),

  update: (
    id: string,
    payload: UpdateDocumentPayload
  ): Promise<ApiResponse<Document>> =>
    axios.patch(`/api/editor/${id}`, payload).then(res => res.data),

  delete: (id: string): Promise<ApiResponse<{ success: boolean }>> =>
    axios.delete(`/api/editor/${id}`).then(res => res.data),

  save: (id: string, payload: Document): Promise<ApiResponse<Document>> =>
    axios.post(`/api/editor/${id}/save`, payload).then(res => res.data),
};
