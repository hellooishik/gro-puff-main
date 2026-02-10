import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const instance = axios.create({
    baseURL: baseURL.endsWith('/') ? baseURL : baseURL + '/',
});

// Add token to requests
instance.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const user = JSON.parse(userInfo);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            } catch (error) {
                console.error('Error parsing user info:', error);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

