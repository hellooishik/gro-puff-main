import { createContext, useState, useEffect, useContext } from 'react';
import axios from '../api/axios';
import AuthContext from './AuthContext';
import Swal from 'sweetalert2';

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
            Swal.fire({ title: 'Authentication Required', text: 'Please login to add to cart', icon: 'warning', confirmButtonColor: '#0D4E9A' });
            return;
        }

        // Optimistic UI implementation
        const previousCartItems = [...cartItems];
        const productId = product._id || product.product || product;
        
        let found = false;
        const newCartItems = previousCartItems.map(item => {
            if (item.product === productId) {
                found = true;
                return { ...item, qty };
            }
            return item;
        });

        // If not found, it means it's a new item (we might not have full product details locally, but we do our best)
        if (!found) {
             newCartItems.push({
                 product: productId,
                 name: product.name || 'Loading...',
                 price: product.price || 0,
                 image: product.image || '',
                 qty: qty
             });
        }
        setCartItems(newCartItems);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(
                '/api/cart/add',
                { productId: product._id || product.product || product, qty },
                config
            );
            setCartItems(data); // Sync with true server state
        } catch (error) {
            console.error(error);
            setCartItems(previousCartItems); // Revert on failure
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                logout();
                Swal.fire({ title: 'Session Expired', text: 'Please login again.', icon: 'warning', confirmButtonColor: '#0D4E9A' });
            } else {
                Swal.fire({ title: 'Error', text: 'Failed to add to cart. Please try again.', icon: 'error', confirmButtonColor: '#0D4E9A' });
            }
        }
    };

    const removeFromCart = async (id) => {
        const previousCartItems = [...cartItems];
        setCartItems(previousCartItems.filter(item => item.product !== id));

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
            setCartItems(previousCartItems);
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
