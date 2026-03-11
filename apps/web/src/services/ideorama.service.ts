import axios from '../services/axios.service';

import { sceneState } from '@/stores';

interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
  status_code: number;
}

export const searchIdeorama = async (
  ideoramaId: string
): Promise<ApiResponse<Ideorama>> => {
  console.log("ideoramaIiiid: ", ideoramaId)
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

export const saveIdeorama = async (
  model: string, userId: string|undefined,
): Promise<ApiResponse<Ideorama>> => {
  try {
    const response = await axios.post(
      `http://localhost:3001/api/ideorama/save`, {
        ideoramaId: sceneState.id,
        ideorama: {
          model: model,
          name: "nom",
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
): Promise<ApiResponse<{ideoramas: Ideorama[], profile: Profile}>> => {
  console.log("userId: ", userId)
  try {
  const response = await axios.post(
      `http://localhost:3001/api/ideorama/all`, {
          userId: "cmltz3dgo000174utepn5f7zo"
        }
  );
 if (response.data.status === 'error') {
      throw new Error(
        response.data.errors[0]?.message || response.data.error?.message
      );
    }
    console.log("response: ", response)
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.error?.message || 'Échec lors de la récupération des idéoramas');
  }
}