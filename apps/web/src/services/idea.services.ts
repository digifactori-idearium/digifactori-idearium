import { toast } from 'sonner';

import axios from '../services/axios.service';

// ================= TYPES =================
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

// ================= GET IDEAS =================
export const getIdeas = async (): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.get(`http://localhost:3001/api/idea`);

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors?.[0]?.message || response.data.error?.message
      );
    }

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        'Échec lors de la récupération des idées'
    );
  }
};

// ================= SAVE IDEAS =================
export const saveIdeas = async (data: any): Promise<ApiResponse<any>> => {
  try {
    const response = await axios.post(`http://localhost:3001/api/idea`, {
      data, // ⚠️ important → correspond au Prisma Json
    });

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors?.[0]?.message || response.data.error?.message
      );
    }

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        "Échec lors de l'enregistrement des idées"
    );
  }
};

// ================= AUTO SAVE (OPTIONNEL 🔥) =================
export const autoSaveIdeas = (data: any): boolean => {
  try {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    axios
      .post(
        `${baseURL}/api/ideas`,
        {
          data,
        },
        {
          fetchOptions: { keepalive: true },
        }
      )
      .catch(err => console.error('Keepalive save failed:', err));

    return true;
  } catch (error) {
    console.error('Error queuing keepalive save:', error);
    return false;
  }
};

// ================= RESET IDEAS (OPTIONNEL) =================
export const resetIdeas = async (): Promise<boolean> => {
  try {
    const response = await axios.delete(`http://localhost:3001/api/ideas`);

    if (response.data.status === 'error') {
      throw new Error(response.data.error?.message);
    }

    toast.success('Réinitialisation des idées réussie');
    return true;
  } catch (error: any) {
    console.error(error);
    toast.error('Erreur lors de la réinitialisation');
    return false;
  }
};
