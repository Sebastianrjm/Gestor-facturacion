import axios from 'axios';

const API = axios.create({
    baseURL: '/api/v1', 
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, 
});

export default API;