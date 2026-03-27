import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, Gift } from 'lucide-react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import axios from '../api/axios';

const CartPage = () => {
    const { cartItems, addToCart, removeFromCart, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isGiftPacked, setIsGiftPacked] = useState(false);
    const [globalGiftPackingRate, setGlobalGiftPackingRate] = useState(2.00);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('/api/settings');
                if (data.giftPackingRate !== undefined) {
                    setGlobalGiftPackingRate(data.giftPackingRate);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        fetchSettings();
    }, []);

    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);
    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const deliveryFee = subtotal > 50 ? 0.00 : 5.99;
    const giftFee = isGiftPacked ? globalGiftPackingRate : 0.00;
    const total = (parseFloat(subtotal) + (deliveryFee === 'Free' ? 0 : parseFloat(deliveryFee)) + giftFee).toFixed(2);

    const checkoutHandler = () => {
        if (!user) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout', { state: { isGiftPacked } });
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="bg-[#f8fafc] min-h-screen pt-20 pb-10 flex flex-col items-center">
                <div className="bg-white p-12 rounded-[2rem] shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-gray-100 text-center max-w-lg w-full">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-200">
                        <ShoppingBag size={40} className="text-gray-400" />
                    </div>
                    <h2 className="text-3xl font-black mb-3 text-gray-800 tracking-tight">Your bag is empty</h2>
                    <p className="text-gray-500 font-medium mb-8">Looks like you haven't added anything yet. Start exploring our fresh produce!</p>
                    <Link to="/" className="inline-block bg-[#00ADEF] text-white px-8 py-4 rounded-xl font-black text-lg uppercase tracking-widest hover:bg-[#0092ca] transition-all shadow-[0_6px_0_#007fac] hover:-translate-y-1 active:shadow-none active:translate-y-1.5 w-full">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20 pt-10 font-sans selection:bg-[#00ADEF] selection:text-white">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <div className="mb-10 flex items-center gap-4">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ShoppingBag className="w-10 h-10 text-[#00ADEF]" /> Your Bag
                    </h1>
                    <span className="bg-[#00ADEF] text-white px-4 py-1.5 rounded-full font-black text-lg shadow-sm">
                        {totalItems} items
                    </span>
                </div>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items */}
                    <div className="lg:w-2/3 space-y-6">
                        {cartItems.map((item) => (
                            <div key={item.product} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6 transition-transform hover:-translate-y-1">
                                <div className="flex items-center space-x-6 w-full sm:w-auto">
                                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center p-2 border border-gray-100">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl text-gray-800 hover:text-[#00ADEF] transition-colors line-clamp-2 leading-tight mb-2">
                                            <Link to={`/product/${item.product}`}>{item.name}</Link>
                                        </h3>
                                        <p className="text-[#00ADEF] font-black text-lg">£{item.price.toFixed(2)}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between w-full sm:w-auto gap-8 border-t sm:border-t-0 pt-4 sm:pt-0">
                                    <div className="flex items-center bg-gray-50 border-2 border-gray-100 rounded-full px-1.5 py-1.5 shadow-sm">
                                        <button
                                            onClick={() => item.qty <= 1 ? removeFromCart(item.product) : addToCart({ _id: item.product }, item.qty - 1)}
                                            className="p-2 rounded-full hover:bg-white hover:text-red-500 hover:shadow-sm transition-all text-gray-500"
                                            title="Decrease Quantity"
                                        >
                                            <Minus size={18} strokeWidth={3} />
                                        </button>
                                        <span className="w-10 text-center font-black text-lg text-gray-800">{item.qty}</span>
                                        <button
                                            onClick={() => addToCart({ _id: item.product }, item.qty + 1)}
                                            className="p-2 rounded-full hover:bg-white hover:text-[#00ADEF] hover:shadow-sm transition-all text-gray-500"
                                            title="Increase Quantity"
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.product)}
                                        className="w-12 h-12 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                        title="Remove Item"
                                    >
                                        <Trash2 size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:w-1/3">
                        <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-gray-100 sticky top-28 overflow-hidden flex flex-col">
                            
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white text-center">
                                <h2 className="text-xl font-black tracking-widest uppercase">Order Summary</h2>
                            </div>

                            <div className="p-8 flex-grow space-y-6">
                                <div className="space-y-4 font-medium text-gray-600">
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-800 text-base">£{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span>Delivery Fee</span>
                                        {deliveryFee === 0 
                                            ? <span className="font-black text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider text-xs">Free</span>
                                            : <span className="font-bold text-gray-800 text-base">£{deliveryFee}</span>
                                        }
                                    </div>
                                    {isGiftPacked && (
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="flex items-center gap-1.5"><Gift size={16} className="text-pink-500"/> Gift Packing</span>
                                            <span className="font-bold text-pink-700 text-base">£{globalGiftPackingRate.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t-2 border-dashed border-gray-200 pt-6"></div>

                                {/* Gift Packing Toggle */}
                                <div 
                                    className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${isGiftPacked ? 'border-pink-500 bg-pink-50 shadow-md transform -translate-y-1' : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50/50'}`}
                                    onClick={() => setIsGiftPacked(!isGiftPacked)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isGiftPacked ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-pink-200 group-hover:text-pink-600'}`}>
                                            <Gift size={24} />
                                        </div>
                                        <div>
                                            <h4 className={`font-bold text-base ${isGiftPacked ? 'text-pink-800' : 'text-gray-700'}`}>Add Gift Packing</h4>
                                            <p className="text-xs font-medium text-gray-500">+£{globalGiftPackingRate.toFixed(2)} per order</p>
                                        </div>
                                    </div>
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isGiftPacked ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`}>
                                        {isGiftPacked && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-gray-900 p-8 mt-auto">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total to pay</span>
                                    <span className="text-4xl font-black text-white leading-none">£{total}</span>
                                </div>
                                
                                <button
                                    onClick={checkoutHandler}
                                    className="w-full bg-[#00ADEF] text-white py-4 rounded-xl font-black text-lg uppercase tracking-widest hover:bg-[#0092ca] transition-all shadow-[0_6px_0_#007fac] active:shadow-none active:translate-y-1.5 hover:-translate-y-1 hover:shadow-[0_8px_0_#007fac] flex flex-col items-center justify-center gap-1 group relative overflow-hidden"
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        Proceed to Checkout
                                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    </span>
                                </button>
                                
                                {deliveryFee !== 0 && (
                                    <p className="text-center text-xs text-green-400 font-bold mt-5 flex items-center justify-center gap-1.5 bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                                        Add £{(50 - subtotal).toFixed(2)} more for FREE delivery
                                    </p>
                                )}
                                {deliveryFee === 0 && (
                                    <p className="text-center text-xs text-green-400 font-bold mt-5 flex items-center justify-center gap-1.5 bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                                        🎉 You've unlocked FREE delivery!
                                    </p>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
