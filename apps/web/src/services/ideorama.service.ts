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
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/`,{
        ideoramaId: ideoramaId,
      }
    );
    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Échec lors de la récupération de l\'idéorama');
  }
};

export const searchIdeoramas = async (query: string) => {
  return [query]
}

export const getEmptyIdeorama = async(): Promise<ApiResponse<IdeoramaModel>> => {
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
    throw new Error(error.response?.data?.error?.message || 'Échec lors de la récupération de l\'idéorama vide');
  }
}

export const createIdeorama = async (
  name: string, userId: string|undefined,
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/create`, {
        ideorama: {
          name: name,
          userId: userId
        }
      }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Échec lors de la récupération de l\'idéorama');
  }
};

export const saveIdeorama = async (
  model: string|null, ideoramaId: string|undefined, userId: string|undefined,
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/save`, {
        ideoramaId: ideoramaId,
        ideorama: {
          model: model,
          userId: userId
        }
      }
    );

    if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Échec lors de la récupération de l\'idéorama');
  }
};

export const getAllIdeoramas = async (
  userId :string | undefined
): Promise<ApiResponse<Ideorama[]>> => {
  try {
  const response = await axios.post(
      `http://localhost:3001/api/ideorama/all`, {
          userId: userId
        }
  );
 if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Échec lors de la récupération des idéoramas');
  }
}

export const deleteIdeorama = async (
  ideoramaId :string|undefined
): Promise<boolean> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/delete`, {
          ideoramaId: ideoramaId
        }
    );
    console.log("response: ", response)
    if (response.data.status === 'error') {
      // toast.error(response.data.error?.message)
    }
    toast.success('Suppression de l\'idéorama réussie');
    return true
  } catch (error: any) {
      // toast.error(error.message)
      return false
  }
}