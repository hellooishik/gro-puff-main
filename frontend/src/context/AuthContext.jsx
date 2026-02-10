import { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                if (parsedUser && parsedUser.token) {
                    setUser(parsedUser);
                } else {
                    localStorage.removeItem('userInfo');
                    setUser(null);
                }
            } catch (error) {
                console.error('Error parsing user info:', error);
                localStorage.removeItem('userInfo');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/auth/login', {
                email,
                password,
            });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Login failed';
            console.error('Login error details:', error.response?.data || error.message);
            throw errorMessage;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('/api/auth/register', {
                name,
                email,
                password,
            });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
            console.error('Registration error details:', error.response?.data || error.message);
            throw errorMessage;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
