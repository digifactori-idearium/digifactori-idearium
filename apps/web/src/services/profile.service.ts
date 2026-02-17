import { AxiosResponse } from 'axios';
import axios from '../axios';

interface Profile {
    pseudo: string;
    bio: string;
    avatar: string;
}


interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
    status_code: number;
}

// Services
export const getProfile = async (empId: string): Promise<ApiResponse<Profile>> => {
    try {
        const response: AxiosResponse<ApiResponse<Profile>> = await axios.get(`http://localhost:3001/api/profile/code=125`);
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Error fetching employer profile');
    }
};