import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { CreditCard, Banknote, Truck, Gift, Tag, CheckCircle2, ShoppingBag, MapPin, ShieldCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('United Kingdom');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [deliveryInstruction, setDeliveryInstruction] = useState('None');
    const [tipAmount, setTipAmount] = useState(0);
    const location = useLocation();
    const [isGiftPacked, setIsGiftPacked] = useState(location.state?.isGiftPacked || false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isFirstOrder, setIsFirstOrder] = useState(false);
    const [globalGiftPackingRate, setGlobalGiftPackingRate] = useState(2.00);
    const [globalDeliveryRate, setGlobalDeliveryRate] = useState(5.99);
    const [globalFreeDeliveryThreshold, setGlobalFreeDeliveryThreshold] = useState(50.00);
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const [successState, setSuccessState] = useState(null);

    const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;

    useEffect(() => {
        const checkFirstOrder = async () => {
            if (user) {
                try {
                    const axiosModule = (await import('../api/axios')).default;
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axiosModule.get('/api/orders/my', config);
                    const validOrders = data.filter(o => o.status !== 'Cancelled');
                    if (validOrders.length === 0) {
                        setIsFirstOrder(true);
                    }
                } catch (error) {
                    console.error('Failed to check orders', error);
                }
            }
        };
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('/api/settings');
                if (data.giftPackingRate !== undefined) setGlobalGiftPackingRate(data.giftPackingRate);
                if (data.deliveryRate !== undefined) setGlobalDeliveryRate(data.deliveryRate);
                if (data.freeDeliveryThreshold !== undefined) setGlobalFreeDeliveryThreshold(data.freeDeliveryThreshold);
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        checkFirstOrder();
        fetchSettings();
    }, [user]);

    useEffect(() => {
        if (!user) navigate('/login');
        if (cartItems.length === 0 && !successState) navigate('/cart');
    }, [user, cartItems, navigate, successState]);

    useEffect(() => {
        if (successState) {
            const timer = setTimeout(() => {
                if (successState.type === 'stripe') {
                    window.location.href = successState.url;
                } else {
                    navigate(successState.url, { replace: true });
                }
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [successState, navigate]);

    const applyCouponHandler = async () => {
        if (!couponCode.trim()) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get(`/api/coupons/verify/${couponCode}`, config);
            setAppliedCoupon(data);
            setCouponError('');
        } catch (error) {
            setAppliedCoupon(null);
            setCouponError(error.response?.data?.message || 'Invalid coupon code');
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const deliveryFee = parseFloat(subtotal) > globalFreeDeliveryThreshold ? 0.00 : globalDeliveryRate;
    const giftFee = isGiftPacked ? globalGiftPackingRate : 0.00;
    const firstOrderDiscount = isFirstOrder ? 10.00 : 0.00;
    const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0.00;
    const computedTotal = (parseFloat(subtotal) + (deliveryFee === 0 ? 0 : parseFloat(deliveryFee)) + tipAmount + giftFee) - firstOrderDiscount - couponDiscount;
    const total = computedTotal > 0 ? computedTotal.toFixed(2) : '0.00';

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (country.trim().toLowerCase() !== 'united kingdom' && country.trim().toLowerCase() !== 'uk') {
            setErrorMsg('Sorry, we only ship to the United Kingdom.');
            return;
        }

        if (!ukPostcodeRegex.test(postalCode)) {
            setErrorMsg('Please enter a valid UK postcode.');
            return;
        }

        setLoading(true);

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const orderPayload = {
                orderItems: cartItems.map(item => ({
                     name: item.name,
                     qty: item.qty,
                     image: item.image,
                     price: item.price,
                     product: item.product
                })),
                shippingAddress: { address, city, postalCode, country },
                paymentMethod: paymentMethod,
                itemsPrice: subtotal,
                shippingPrice: deliveryFee === 0 ? 0 : deliveryFee,
                taxPrice: 0,
                deliveryInstruction,
                tipAmount,
                isGiftPacked
            };

            const { data } = await axios.post('/api/orders', orderPayload, config);

            if (paymentMethod === 'Online Pay') {
                if (computedTotal > 0) {
                    try {
                        const sessionRes = await axios.post('/api/orders/create-checkout-session', {
                            amount: Math.round(computedTotal * 100),
                            orderId: data._id
                        }, config);
                        
                        if (sessionRes.data.url) {
                            setSuccessState({ type: 'stripe', url: sessionRes.data.url });
                            clearCart();
                            setLoading(false);
                            return;
                        }
                    } catch (stripeErr) {
                        console.error('Stripe redirect failed:', stripeErr);
                        setErrorMsg('Payment gateway failed: ' + (stripeErr.response?.data?.message || stripeErr.message) + '. Please try another method.');
                        return;
                    }
                } else {
                    setSuccessState({ type: 'cod', url: `/order/${data._id}?success=true` });
                    clearCart();
                    setLoading(false);
                    return;
                }
            }

            setSuccessState({ type: 'cod', url: `/order/${data._id}` });
            clearCart();
            setLoading(false);
        } catch (error) {
            console.error('Error details:', error);
            setErrorMsg(error.response?.data?.message || 'An error occurred. Please try again.');
            setLoading(false);
        }
    };

    return (
        <>
            <AnimatePresence>
                {successState && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-xl"
                    >
                        <motion.div 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            transition={{ type: "spring", damping: 20, stiffness: 300 }}
                            className="bg-white p-12 rounded-[2.5rem] shadow-2xl flex flex-col items-center text-center max-w-md w-full mx-4 border border-gray-100"
                        >
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
                                className={`w-28 h-28 rounded-full flex items-center justify-center mb-8 shadow-inner ${successState.type === 'stripe' ? 'bg-[#635BFF]/10 text-[#635BFF]' : 'bg-green-100 text-green-500'}`}
                            >
                                {successState.type === 'stripe' ? <ShieldCheck size={56} strokeWidth={2.5} /> : <Check size={64} strokeWidth={3} />}
                            </motion.div>
                            
                            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                                {successState.type === 'stripe' ? "Secure Redirect" : "Order Confirmed!"}
                            </h2>
                            
                            <p className="text-gray-500 font-medium text-lg mb-8 leading-relaxed">
                                {successState.type === 'stripe' 
                                    ? "Thank you! We're transferring you securely to Stripe to complete your payment..."
                                    : "Thank you! Your awesome order has been placed and is being processed."}
                            </p>
                            
                            <motion.div 
                                animate={{ rotate: 360 }}
                                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                className={`w-10 h-10 border-4 border-gray-100 rounded-full ${successState.type === 'stripe' ? 'border-t-[#635BFF]' : 'border-t-green-500'}`}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-[#f8fafc] min-h-screen pb-24 pt-32 lg:pt-40 font-sans selection:bg-[#00ADEF] selection:text-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex justify-center items-center gap-4">
                            <ShoppingBag className="w-10 h-10 text-[#00ADEF]" /> Secure Checkout
                        </h1>
                        <p className="text-gray-500 mt-4 font-medium text-lg">Almost there! Choose your preferences and finalize your order.</p>
                    </div>

                    {errorMsg && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 bg-red-50 border border-red-100 p-6 rounded-2xl shadow-sm flex items-start gap-4">
                            <div className="text-red-500 text-2xl mt-0.5">⚠️</div>
                            <div>
                                <h3 className="text-red-800 font-bold text-lg mb-1">Action Required</h3>
                                <p className="text-red-600 font-medium">{errorMsg}</p>
                            </div>
                        </motion.div>
                    )}

                    <form id="checkout-form" onSubmit={submitHandler}>
                        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                            
                            {/* Left Column: Form Fields */}
                            <div className="lg:w-2/3 space-y-8">
                                
                                {/* Shipping Details */}
                                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100/50">
                                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900">
                                        <MapPin className="text-[#00ADEF]" size={28} /> Delivery Address
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-500 font-bold mb-2 uppercase tracking-wide text-xs">Street Address</label>
                                            <input
                                                type="text"
                                                placeholder="E.g. 123 Baker Street"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 transition-all text-gray-800 font-medium"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-gray-500 font-bold mb-2 uppercase tracking-wide text-xs">City</label>
                                                <input
                                                    type="text"
                                                    placeholder="E.g. London"
                                                    value={city}
                                                    onChange={(e) => setCity(e.target.value)}
                                                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 transition-all text-gray-800 font-medium"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-gray-500 font-bold mb-2 uppercase tracking-wide text-xs">UK Postcode</label>
                                                <input
                                                    type="text"
                                                    placeholder="E.g. NW1 6XE"
                                                    value={postalCode}
                                                    onChange={(e) => setPostalCode(e.target.value)}
                                                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 transition-all text-gray-800 font-bold uppercase tracking-widest"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-gray-500 font-bold mb-2 uppercase tracking-wide text-xs">Country</label>
                                            <input
                                                type="text"
                                                value={country}
                                                readOnly
                                                className="w-full p-4 bg-gray-100 border border-transparent rounded-2xl text-gray-400 font-bold cursor-not-allowed"
                                            />
                                            <p className="text-sm text-blue-500 font-bold mt-3 flex items-center gap-2 bg-blue-50 w-fit px-3 py-1.5 rounded-lg">
                                                <Truck size={16} /> Shipping exclusively to the UK.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Preferences */}
                                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100/50">
                                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900">
                                        <Truck className="text-purple-500" size={28} /> Delivery Preferences
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-gray-500 font-bold mb-2 uppercase tracking-wide text-xs">Driver Instructions</label>
                                            <div className="relative">
                                                <select 
                                                    value={deliveryInstruction} 
                                                    onChange={(e) => setDeliveryInstruction(e.target.value)}
                                                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-800 font-bold appearance-none cursor-pointer"
                                                >
                                                    <option value="None">No special instructions</option>
                                                    <option value="Avoid calling">Avoid calling me</option>
                                                    <option value="Dont ring bell">Please don't ring the doorbell</option>
                                                    <option value="Leave by door">Leave securely by the door</option>
                                                    <option value="Pet at home">Beware - Pet at home!</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-5 text-gray-400">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </div>

                                        <div 
                                            onClick={() => setIsGiftPacked(!isGiftPacked)}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${isGiftPacked ? 'border-pink-500 bg-pink-50/50 shadow-sm' : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50/30'}`}
                                        >
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isGiftPacked ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-pink-100 group-hover:text-pink-500'}`}>
                                                    <Gift size={26} />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-lg mb-0.5 ${isGiftPacked ? 'text-pink-900' : 'text-gray-800'}`}>Make it a Gift</h3>
                                                    <p className="text-gray-500 text-sm font-medium">Premium packaging (+£{globalGiftPackingRate.toFixed(2)})</p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isGiftPacked ? 'bg-pink-500 border-pink-500' : 'border-gray-300'}`}>
                                                {isGiftPacked && <CheckCircle2 size={16} className="text-white" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="bg-white p-8 md:p-10 rounded-[2rem] shadow-sm border border-gray-100/50">
                                    <h2 className="text-2xl font-black mb-8 flex items-center gap-3 text-gray-900">
                                        <CreditCard className="text-[#635BFF]" size={28} /> Payment Method
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div 
                                            onClick={() => setPaymentMethod('Online Pay')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start gap-5 relative overflow-hidden ${paymentMethod === 'Online Pay' ? 'border-[#635BFF] bg-[#635BFF]/5 shadow-md' : 'border-gray-100 bg-white hover:border-[#635BFF]/30 hover:bg-gray-50/50'}`}
                                        >
                                            <div className="flex justify-between w-full items-center">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'Online Pay' ? 'bg-[#635BFF] text-white shadow-lg shadow-[#635BFF]/30' : 'bg-gray-100 text-gray-400'}`}>
                                                    <CreditCard size={24} />
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'Online Pay' ? 'bg-[#635BFF] border-[#635BFF]' : 'border-gray-300'}`}>
                                                    {paymentMethod === 'Online Pay' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg tracking-wide mb-1 ${paymentMethod === 'Online Pay' ? 'text-[#635BFF]' : 'text-gray-800'}`}>Stripe Checkout</h3>
                                                <p className="text-gray-500 text-sm font-medium">Pay securely with any card</p>
                                            </div>
                                        </div>

                                        <div 
                                            onClick={() => setPaymentMethod('COD')}
                                            className={`p-6 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start gap-5 ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50/50 shadow-md' : 'border-gray-100 bg-white hover:border-green-200 hover:bg-gray-50/50'}`}
                                        >
                                            <div className="flex justify-between w-full items-center">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'bg-green-500 text-white shadow-lg shadow-green-500/30' : 'bg-gray-100 text-gray-400'}`}>
                                                    <Banknote size={24} />
                                                </div>
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'COD' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                    {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className={`font-black text-lg tracking-wide mb-1 ${paymentMethod === 'COD' ? 'text-green-700' : 'text-gray-800'}`}>Pay on Delivery</h3>
                                                <p className="text-gray-500 text-sm font-medium">Cash or card at your door</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-blue-50/50 p-6 rounded-2xl text-sm text-gray-500 font-medium text-center border border-blue-100">
                                    <ShieldCheck className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                                    <strong>Safe & Secure:</strong> Your data is protected by industry-leading 256-bit SSL encryption. You will be able to review your order details before final confirmation.
                                </div>

                            </div>

                            {/* Right Column: Order Summary */}
                            <div className="lg:w-1/3">
                                <div className="bg-white rounded-[2rem] shadow-lg shadow-gray-200/50 border border-gray-100 sticky top-32 overflow-hidden flex flex-col">
                                    
                                    <div className="bg-gray-900 p-8 text-white">
                                        <h2 className="text-2xl font-black tracking-wide uppercase">Order Summary</h2>
                                    </div>

                                    <div className="p-8 flex-grow space-y-8 bg-white shrink-0">
                                        
                                        {/* Promo Code */}
                                        <div className="space-y-3">
                                            <h3 className="font-bold text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                <Tag size={14} className="text-[#00ADEF]" /> Add Promo Code
                                            </h3>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter code" 
                                                    className="flex-1 px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 uppercase text-sm font-bold tracking-wider placeholder-gray-400 transition-all"
                                                    disabled={appliedCoupon}
                                                />
                                                <button 
                                                    type="button" 
                                                    onClick={applyCouponHandler}
                                                    disabled={!couponCode || appliedCoupon}
                                                    className="bg-gray-900 text-white px-6 rounded-xl font-bold text-sm hover:bg-[#00ADEF] transition-all disabled:opacity-50 disabled:hover:bg-gray-900 uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                            {couponError && <p className="text-red-500 text-xs font-bold animate-pulse px-1">{couponError}</p>}
                                        </div>

                                        {/* Items list preview */}
                                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                            {cartItems.map((item) => (
                                                <div key={item.product} className="flex gap-4 items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                                                    <div className="w-16 h-16 bg-white rounded-xl p-1.5 shrink-0 border border-gray-100 shadow-sm">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-gray-800 truncate text-sm mb-1">{item.name}</h4>
                                                        <p className="text-gray-400 font-semibold text-xs">Qty: {item.qty}</p>
                                                    </div>
                                                    <div className="font-black text-gray-900">£{(item.price * item.qty).toFixed(2)}</div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-100 pt-6 space-y-4">
                                            <div className="flex justify-between items-center text-gray-500 font-semibold text-sm">
                                                <span>Subtotal</span>
                                                <span className="font-bold text-gray-800">£{subtotal}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-gray-500 font-semibold text-sm">
                                                <span>Delivery</span>
                                                {deliveryFee === 0 
                                                    ? <span className="font-black text-green-600 bg-green-50 border border-green-100 px-2.5 py-1 rounded uppercase tracking-wider text-xs">Free</span>
                                                    : <span className="font-bold text-gray-800">£{deliveryFee.toFixed(2)}</span>
                                                }
                                            </div>
                                            
                                            {isGiftPacked && (
                                                <div className="flex justify-between items-center text-gray-500 font-semibold text-sm">
                                                    <span className="flex items-center gap-1.5"><Gift size={14} className="text-pink-500"/> Gift Packing</span>
                                                    <span className="font-bold text-pink-700">£{globalGiftPackingRate.toFixed(2)}</span>
                                                </div>
                                            )}

                                            {/* Tipping Slider */}
                                            <div className="pt-2">
                                                <div className="flex justify-between text-sm font-semibold text-gray-500 mb-3">
                                                    <span>Rider Tip</span>
                                                    <span className="font-bold text-gray-800">£{parseFloat(tipAmount).toFixed(2)}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[0, 2, 5, 7].map(amount => (
                                                        <button 
                                                            key={amount} 
                                                            type="button"
                                                            onClick={() => setTipAmount(amount)}
                                                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all border-2 ${tipAmount === amount ? 'border-[#00ADEF] bg-[#00ADEF] text-white shadow-md shadow-[#00ADEF]/20' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-[#00ADEF]/30 hover:text-[#00ADEF]'}`}
                                                        >
                                                            {amount === 0 ? 'No tip' : `£${amount}`}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Active Offers */}
                                        {(isFirstOrder || appliedCoupon) && (
                                            <div className="border-t border-gray-100 pt-6 space-y-3">
                                                {isFirstOrder && (
                                                    <div className="flex justify-between items-center bg-green-50/80 px-4 py-3 rounded-xl border border-green-100">
                                                        <span className="text-green-700 font-bold text-sm flex items-center gap-2">⚡ First Order Offer</span>
                                                        <span className="font-black text-green-700">-£10.00</span>
                                                    </div>
                                                )}
                                                {appliedCoupon && (
                                                    <div className="flex justify-between items-center bg-green-50/80 px-4 py-3 rounded-xl border border-green-100 group">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-green-700 font-bold text-sm tracking-wide bg-white px-2.5 py-1 rounded-lg shadow-sm border border-green-100 uppercase">{appliedCoupon.code}</span>
                                                            <button type="button" onClick={() => {setAppliedCoupon(null); setCouponCode('');}} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove coupon">
                                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <span className="font-black text-green-700">-£{appliedCoupon.discount.toFixed(2)}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Total and Submit Banner */}
                                    <div className="bg-gray-50 p-8 border-t border-gray-100 mt-auto">
                                        <div className="flex justify-between items-end mb-6">
                                            <span className="text-gray-500 font-black uppercase tracking-widest text-sm">Total</span>
                                            <span className="text-4xl font-black text-gray-900 leading-none">£{total}</span>
                                        </div>
                                        <button
                                            form="checkout-form"
                                            type="submit"
                                            disabled={loading || successState}
                                            className={`w-full py-5 rounded-2xl font-black text-lg uppercase tracking-widest transition-all disabled:opacity-70 shadow-lg group flex items-center justify-center gap-3 relative overflow-hidden ${
                                                paymentMethod === 'Online Pay' 
                                                    ? 'bg-[#635BFF] text-white hover:bg-[#5851e3] shadow-[#635BFF]/30 hover:shadow-[#635BFF]/40' 
                                                    : 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/30 hover:shadow-green-500/40'
                                            }`}
                                        >
                                            <span className="relative z-10 flex items-center gap-2">
                                                {loading || successState ? 'Processing...' : (
                                                    paymentMethod === 'Online Pay' ? (
                                                        <>Pay securely with Stripe <ShieldCheck size={20} /></>
                                                    ) : (
                                                        <>Confirm Order <CheckCircle2 size={20} /></>
                                                    )
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CheckoutPage;
