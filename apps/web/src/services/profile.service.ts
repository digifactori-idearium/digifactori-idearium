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
export const getProfile = async (parentalCode: string = ""): Promise<ApiResponse<getProfileResponse>> => {
    try {
        const response: AxiosResponse<ApiResponse<getProfileResponse>> = await axios.post(`http://localhost:3001/api/profile/`, 
            parentalCode == "" ? {} : {parental_code: parentalCode});
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Error fetching employer profile');
    }
};

export const updateProfile = async (password: string, newUserInfo: Partial<User>, newProfileInfo: Partial<ProfileType>) => {
    try {
        const response: AxiosResponse<ApiResponse<getProfileResponse>> = await axios.post(`http://localhost:3001/api/profile/setting`, {
            password: password,
            user: newUserInfo,
            profile: newProfileInfo
        });
        return response.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Error fetching employer profile' + error);
    }
}