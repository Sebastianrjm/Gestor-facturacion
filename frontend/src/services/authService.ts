import API from './api';
import type { LoginCredentials, AuthResponse, RegisterCredentials } from '../types/auth';

export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>('/auth/login', credentials);

    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await API.post<AuthResponse>('/auth/register', credentials);

    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
}

export const logoutUser = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};