export interface User {
    id: number;
    nombre: string;
    email: string;
    emisorID: string;
}

export interface LoginCredentials {
    email: string,
    password: string
}

export interface RegisterCredentials {
    nombre: string;
    email: string;
    password: string;
    razonSocial: string;
    identificacionFiscal: string;
}

export interface AuthResponse {
    message: string;
    token: string;
    user: User;   
}