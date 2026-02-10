import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const { user, logout } = useContext(AuthContext);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setCartItems([]);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get('/api/cart', config);
            setCartItems(data);
        } catch (error) {
            console.error(error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout();
            }
        }
    };

    const addToCart = async (product, qty) => {
        if (!user) {
            alert('Please login to add to cart');
            return;
        }
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                '/api/cart/add',
                { productId: product._id, qty },
                config
            );
            setCartItems(data);
            alert('Item added to bag!');
        } catch (error) {
            console.error(error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout();
                alert('Session expired. Please login again.');
            } else {
                alert('Failed to add to cart. Please try again.');
            }
        }
    };

    const removeFromCart = async (id) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                '/api/cart/remove',
                { productId: id },
                config
            );
            setCartItems(data);
        } catch (error) {
            console.error(error);
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout();
            }
        }
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
