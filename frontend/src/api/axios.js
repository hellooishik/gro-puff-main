import axios from 'axios';

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://gro-puff-main-s1t8.vercel.app',
});

export default instance;
