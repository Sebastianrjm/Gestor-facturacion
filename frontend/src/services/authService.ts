import API from './api';
import type { LoginCredentials, AuthResponse, RegisterCredentials } from '../types/auth';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>('/auth/login', credentials);
    return response.data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>('/auth/register', credentials);
    return response.data;
};

export const logoutUser = async (): Promise<void> => {
    try {
        await API.post('/auth/logout');
    } catch (error) {
        console.error('Error al cerrar sesión en el servidor', error);
    }
};