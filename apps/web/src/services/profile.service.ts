import { AxiosResponse } from 'axios';
import { type User, Profile as ProfileType } from "../../../api/src/config/client.config";
import axios from '../services/axios.service';


type getProfileResponse = {
    profile: ProfileType,
    user: User
}


interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
    status_code: number;
}

// Services
export const getProfile = async (): Promise<ApiResponse<getProfileResponse>> => {
    console.log("getProfile...")
    try {
        const response: AxiosResponse<ApiResponse<getProfileResponse>> = await axios.post(`http://localhost:3001/api/profile/`, {});
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Error fetching employer profile');
    }
};