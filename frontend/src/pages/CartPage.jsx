import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const CartPage = () => {
    const { cartItems, addToCart, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const deliveryFee = subtotal > 50 ? 0.00 : 5.99;
    const total = (parseFloat(subtotal) + (deliveryFee === 'Free' ? 0 : parseFloat(deliveryFee))).toFixed(2);

    const checkoutHandler = () => {
        if (!user) {
            navigate('/login');
        } else {
            // Here we would create an order in backend or go to checkout page
            alert('Checkout functionality coming soon! (Order creation logic implemented in backend)');
            // Example: logic to call createOrder would go here or in accessible Checkout component
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold mb-4">Your bag is empty</h2>
                <p className="text-gray-500 mb-8">Start adding some items to get started!</p>
                <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-700 transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8">Your Bag ({totalItems} items)</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items */}
                <div className="lg:w-2/3">
                    {cartItems.map((item) => (
                        <div key={item.product} className="flex items-center justify-between border-b py-6">
                            <div className="flex items-center space-x-4">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-contain" />
                                <div>
                                    <h3 className="font-semibold text-lg hover:text-blue-600">
                                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                                    </h3>
                                    <p className="text-gray-500">${item.price}</p>
                                </div>
                            </div>

                            <div className="flex items-center space-x-6">
                                <div className="flex items-center border rounded-full px-2 py-1">
                                    <button
                                        onClick={() => addToCart({ _id: item.product }, item.qty - 1)}
                                        disabled={item.qty <= 1}
                                        className="p-1 disabled:opacity-30 hover:text-blue-600"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="mx-3 font-medium">{item.qty}</span>
                                    <button
                                        onClick={() => addToCart({ _id: item.product }, item.qty + 1)}
                                        className="p-1 hover:text-blue-600"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => removeFromCart(item.product)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="lg:w-1/3">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm border sticky top-24">
                        <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                        <div className="flex justify-between mb-3 text-gray-600">
                            <span>Subtotal</span>
                            <span>${subtotal}</span>
                        </div>
                        <div className="flex justify-between mb-3 text-gray-600">
                            <span>Delivery Fee</span>
                            <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee}`}</span>
                        </div>
                        <div className="flex justify-between mb-6 text-gray-600">
                            <span>Tax (Est.)</span>
                            <span>$0.00</span>
                        </div>

                        <div className="border-t pt-4 flex justify-between font-bold text-xl mb-6">
                            <span>Total</span>
                            <span>${total}</span>
                        </div>

                        <button
                            onClick={checkoutHandler}
                            className="w-full bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg"
                        >
                            Checkout
                        </button>
                        <div className="mt-4 text-center text-sm text-gray-500">
                            Free delivery on orders over $50
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
