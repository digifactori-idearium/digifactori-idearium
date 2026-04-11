import { toast } from 'sonner';

import axios from '../services/axios.service';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

export const searchIdeorama = async (
  ideoramaId: string
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(`http://localhost:3001/api/ideorama/`, {
      ideoramaId: ideoramaId,
    });
    console.log('search Ideorama: ', response);
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        "Échec lors de la récupération de l'idéorama"
    );
  }
};

export const searchIdeoramas = async (query: string) => {
  return [query];
};

export const getEmptyIdeorama = async (): Promise<
  ApiResponse<IdeoramaModel>
> => {
  try {
    const response = await axios.get(
      `http://localhost:3001/api/ideorama/empty`
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        "Échec lors de la récupération de l'idéorama vide"
    );
  }
};

export const createIdeorama = async (
  name: string,
  userId: string | undefined
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/save`,
      {
        ideorama: {
          name: name,
          userId: userId,
        },
      }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        "Échec lors de la récupération de l'idéorama"
    );
  }
};

export const saveIdeorama = async (
  model: string | null,
  ideoramaId: string | undefined,
  userId: string | undefined
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/save`,
      {
        ideoramaId: ideoramaId,
        ideorama: {
          model: model,
          userId: userId,
        },
      }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    console.error('Save error:', error);
    throw new Error(
      error.response?.data?.error?.message ||
        "Échec lors de la récupération de l'idéorama"
    );
  }
};

export const autoSaveIdeorama = (
  model: string | null,
  ideoramaId: string | undefined,
  userId: string | undefined
): boolean => {
  try {
    if (!ideoramaId || !userId) {
      console.warn('Cannot save: missing ideoramaid or userid');
      return false;
    }

    const baseURL =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

    axios
      .post(
        `${baseURL}/api/ideorama/save`,
        {
          ideoramaId,
          ideorama: { model, userId },
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

export const getAllIdeoramas = async (
  userId: string | undefined
): Promise<ApiResponse<{ ideoramas: Ideorama[]; profile: Profile }>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/all`,
      {
        userId: userId,
      }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        'Échec lors de la récupération des idéoramas'
    );
  }
};

export const deleteIdeorama = async (ideoramaId: string | undefined) => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/delete`,
      {
        ideoramaId: ideoramaId,
      }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    toast.success("Suppression de l'idéorama réussie");
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error?.message ||
        "Echec lors de la suppression de l'idéorama"
    );
  }
};
