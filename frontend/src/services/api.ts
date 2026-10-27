import axios from 'axios';

const API = axios.create({
    baseURL: 'https://gestor-facturacion-ym1b.vercel.app/api/v1', 
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

export default API;