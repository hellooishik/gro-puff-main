import { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import { CreditCard, Banknote, Truck, Gift, Tag, CheckCircle2, ShoppingBag, MapPin } from 'lucide-react';

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
    const [customTip, setCustomTip] = useState('');
    const location = useLocation();
    const [isGiftPacked, setIsGiftPacked] = useState(location.state?.isGiftPacked || false);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [isFirstOrder, setIsFirstOrder] = useState(false);
    const [globalGiftPackingRate, setGlobalGiftPackingRate] = useState(2.00);
    
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');

    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');

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
                if (data.giftPackingRate !== undefined) {
                    setGlobalGiftPackingRate(data.giftPackingRate);
                }
            } catch (error) {
                console.error("Failed to fetch settings", error);
            }
        };
        checkFirstOrder();
        fetchSettings();
    }, [user]);

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

    useEffect(() => {
        if (!user) navigate('/login');
        if (cartItems.length === 0) navigate('/cart');
    }, [user, cartItems, navigate]);

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const deliveryFee = parseFloat(subtotal) > 50 ? 0.00 : 5.99;
    
    // Calculate total
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

            clearCart();
            setLoading(false);

            if (paymentMethod === 'Online Pay') {
                if (computedTotal > 0) {
                    try {
                        const sessionRes = await axios.post('/api/orders/create-checkout-session', {
                            amount: Math.round(computedTotal * 100),
                            orderId: data._id
                        }, config);
                        
                        if (sessionRes.data.url) {
                            window.location.href = sessionRes.data.url;
                            return;
                        }
                    } catch (stripeErr) {
                        console.error('Stripe redirect failed:', stripeErr);
                        setErrorMsg('Payment gateway failed: ' + (stripeErr.response?.data?.message || stripeErr.message) + '. Please try another method.');
                        setLoading(false);
                        return; // Halt if stripe fails, so the user doesn't assume it was paid
                    }
                } else {
                    // Total is free because of discounts, bypass stripe and mark pending
                    navigate(`/order/${data._id}?success=true`);
                    return;
                }
            }

            navigate(`/order/${data._id}`);
        } catch (error) {
            console.error('Error details:', error);
            if (error.response?.data?.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg('An error occurred. Please try again.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-20 pt-10 font-sans selection:bg-[#00ADEF] selection:text-white">
            <div className="container mx-auto px-4 max-w-6xl">
                
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex justify-center items-center gap-3">
                        <ShoppingBag className="w-10 h-10 text-[#00ADEF]" /> Secure Checkout
                    </h1>
                    <p className="text-gray-500 mt-3 font-medium text-lg">Almost there! Choose your preferences and finalize your order.</p>
                </div>

                {errorMsg && (
                    <div className="mb-8 bg-red-50 border-l-8 border-red-500 p-6 rounded-r-2xl shadow-sm animate-pulse flex items-start gap-4">
                        <div className="text-red-500 text-2xl mt-1">⚠️</div>
                        <div>
                            <h3 className="text-red-800 font-bold text-lg">Action Required</h3>
                            <p className="text-red-600 font-medium">{errorMsg}</p>
                        </div>
                    </div>
                )}

                <form id="checkout-form" onSubmit={submitHandler}>
                    <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                        
                        {/* Left Column: Form Fields */}
                        <div className="lg:w-2/3 space-y-8">
                            
                            {/* Shipping Details */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-[#00ADEF]"></div>
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800">
                                    <MapPin className="text-[#00ADEF]" /> Delivery Address
                                </h2>
                                
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-gray-600 font-bold mb-2 uppercase tracking-wide text-xs">Street Address</label>
                                        <input
                                            type="text"
                                            placeholder="E.g. 123 Baker Street"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 transition-all text-gray-800 font-medium"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-gray-600 font-bold mb-2 uppercase tracking-wide text-xs">City</label>
                                            <input
                                                type="text"
                                                placeholder="E.g. London"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 transition-all text-gray-800 font-medium"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-gray-600 font-bold mb-2 uppercase tracking-wide text-xs">UK Postcode</label>
                                            <input
                                                type="text"
                                                placeholder="E.g. NW1 6XE"
                                                value={postalCode}
                                                onChange={(e) => setPostalCode(e.target.value)}
                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/10 transition-all text-gray-800 font-bold uppercase"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-gray-600 font-bold mb-2 uppercase tracking-wide text-xs">Country</label>
                                        <input
                                            type="text"
                                            value={country}
                                            readOnly
                                            className="w-full p-4 bg-gray-100 border-2 border-transparent rounded-xl text-gray-500 font-bold cursor-not-allowed"
                                        />
                                        <p className="text-xs text-blue-500 font-bold mt-2 flex items-center gap-1">
                                            <Truck size={14} /> Currently shipping exclusively to the United Kingdom.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Preferences */}
                            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-purple-500"></div>
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800">
                                    <Truck className="text-purple-500" /> Delivery Preferences
                                </h2>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-gray-600 font-bold mb-2 uppercase tracking-wide text-xs">Driver Instructions</label>
                                        <div className="relative">
                                            <select 
                                                value={deliveryInstruction} 
                                                onChange={(e) => setDeliveryInstruction(e.target.value)}
                                                className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all text-gray-800 font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="None">No special instructions</option>
                                                <option value="Avoid calling">Avoid calling me</option>
                                                <option value="Dont ring bell">Please don't ring the doorbell</option>
                                                <option value="Leave by door">Leave securely by the door</option>
                                                <option value="Pet at home">Beware - Pet at home!</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setIsGiftPacked(!isGiftPacked)}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group ${isGiftPacked ? 'border-pink-500 bg-pink-50 shadow-md transform -translate-y-1' : 'border-gray-100 hover:border-pink-200 hover:bg-pink-50/50'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isGiftPacked ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-400 group-hover:bg-pink-200 group-hover:text-pink-600'}`}>
                                                <Gift size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`font-bold text-lg ${isGiftPacked ? 'text-pink-800' : 'text-gray-700'}`}>Make it a Gift</h3>
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
                            <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                                <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-gray-800">
                                    <CreditCard className="text-green-500" /> Payment Details
                                </h2>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div 
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start gap-4 ${paymentMethod === 'COD' ? 'border-green-500 bg-green-50 shadow-md transform -translate-y-1' : 'border-gray-100 bg-white hover:border-green-200'}`}
                                    >
                                        <div className="flex justify-between w-full items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <Banknote size={20} />
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
                                                {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className={`font-black tracking-wide ${paymentMethod === 'COD' ? 'text-green-800' : 'text-gray-800'}`}>Pay on Delivery</h3>
                                            <p className="text-gray-500 text-xs font-medium mt-1">Cash or card at your door</p>
                                        </div>
                                    </div>

                                    <div 
                                        onClick={() => setPaymentMethod('Online Pay')}
                                        className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-start gap-4 ${paymentMethod === 'Online Pay' ? 'border-[#00ADEF] bg-[#f0f9ff] shadow-md transform -translate-y-1' : 'border-gray-100 bg-white hover:border-[#00ADEF]/30'}`}
                                    >
                                        <div className="flex justify-between w-full items-center">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'Online Pay' ? 'bg-[#00ADEF] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                <CreditCard size={20} />
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'Online Pay' ? 'bg-[#00ADEF] border-[#00ADEF]' : 'border-gray-300'}`}>
                                                {paymentMethod === 'Online Pay' && <div className="w-2.5 h-2.5 bg-white rounded-full"></div>}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className={`font-black tracking-wide ${paymentMethod === 'Online Pay' ? 'text-blue-900' : 'text-gray-800'}`}>Stripe Checkout</h3>
                                            <p className="text-gray-500 text-xs font-medium mt-1">Pay securely with card</p>
                                        </div>
                                    </div>
                                </div>


                            </div>
                            
                            <div className="bg-gray-100 p-6 rounded-2xl text-xs text-gray-500 font-medium text-center border border-gray-200">
                                <strong>Cancellation Policy:</strong> Once an order is placed, cancellation may result in a fee. If unexpected delays lead to order cancellation on our end, a complete refund will be provided automatically.
                            </div>

                            </div>
                        </div>

                        {/* Right Column: Order Summary */}
                        <div className="lg:w-1/3">
                            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-gray-100 sticky top-24 overflow-hidden flex flex-col">
                                
                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white pt-8">
                                    <h2 className="text-2xl font-black tracking-wide text-center uppercase">Order Summary</h2>
                            </div>

                            <div className="p-6 md:p-8 flex-grow space-y-6 bg-white shrink-0">
                                
                                {/* Promo Code */}
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                    <h3 className="font-black mb-3 text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                        <Tag size={14} className="text-[#00ADEF]" /> Add Promo Code
                                    </h3>
                                    <div className="flex gap-2">
                                        <input 
                                            type="text" 
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            placeholder="Enter code" 
                                            className="flex-1 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] uppercase text-sm font-bold tracking-wider placeholder-gray-300 transition-colors"
                                            disabled={appliedCoupon}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={applyCouponHandler}
                                            disabled={!couponCode || appliedCoupon}
                                            className="bg-gray-900 text-white px-5 rounded-xl font-bold text-sm hover:bg-[#00ADEF] transition-all disabled:opacity-50 disabled:hover:bg-gray-900 uppercase tracking-widest shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {couponError && <p className="text-red-500 text-xs mt-2 font-bold animate-pulse px-1">{couponError}</p>}
                                </div>

                                {/* Items list preview */}
                                <div className="space-y-4 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                                    {cartItems.map((item) => (
                                        <div key={item.product} className="flex gap-4 items-center p-2 hover:bg-gray-50 rounded-xl transition-colors">
                                            <div className="w-14 h-14 bg-gray-100 rounded-lg p-1.5 shrink-0 border border-gray-200">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-800 truncate text-sm">{item.name}</h4>
                                                <p className="text-gray-400 font-medium text-xs">Qty: {item.qty}</p>
                                            </div>
                                            <div className="font-black text-gray-800">£{(item.price * item.qty).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t-2 border-dashed border-gray-200 pt-6 space-y-3">
                                    <div className="flex justify-between items-center text-gray-600 font-medium text-sm">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-800">£{subtotal}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-600 font-medium text-sm">
                                        <span>Delivery</span>
                                        {deliveryFee === 0 
                                            ? <span className="font-black text-green-600 bg-green-100 px-2 py-0.5 rounded uppercase tracking-wider text-xs">Free</span>
                                            : <span className="font-bold text-gray-800">£{deliveryFee}</span>
                                        }
                                    </div>
                                    
                                    {isGiftPacked && (
                                        <div className="flex justify-between items-center text-gray-600 font-medium text-sm">
                                            <span className="flex items-center gap-1.5"><Gift size={14} className="text-pink-500"/> Gift Packing</span>
                                            <span className="font-bold text-pink-700">£{globalGiftPackingRate.toFixed(2)}</span>
                                        </div>
                                    )}

                                    {/* Tipping Slider */}
                                    <div className="pt-2">
                                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                            <span>Rider Tip</span>
                                            <span className="font-bold text-gray-800">£{parseFloat(tipAmount).toFixed(2)}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            {[0, 2, 5, 7].map(amount => (
                                                <button 
                                                    key={amount} 
                                                    type="button"
                                                    onClick={() => setTipAmount(amount)}
                                                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all border-2 ${tipAmount === amount ? 'border-[#00ADEF] bg-[#00ADEF] text-white shadow-md transform -translate-y-0.5' : 'border-gray-200 bg-white text-gray-600 hover:border-[#00ADEF]/50 hover:bg-[#00ADEF]/5'}`}
                                                >
                                                    {amount === 0 ? 'No tip' : `£${amount}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Active Offers */}
                                {(isFirstOrder || appliedCoupon) && (
                                    <div className="border-t-2 border-dashed border-gray-200 pt-5 space-y-2">
                                        {isFirstOrder && (
                                            <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                                                <span className="text-green-700 font-bold text-sm flex items-center gap-1.5">⚡ First Order Offer</span>
                                                <span className="font-black text-green-700">-£10.00</span>
                                            </div>
                                        )}
                                        {appliedCoupon && (
                                            <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg border border-green-200 group">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-green-700 font-bold text-sm tracking-wide bg-white px-2 py-0.5 rounded shadow-sm border border-green-200 uppercase">{appliedCoupon.code}</span>
                                                    <button type="button" onClick={() => {setAppliedCoupon(null); setCouponCode('');}} className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" title="Remove coupon">
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                                <span className="font-black text-green-700">-£{appliedCoupon.discount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Total and Submit Banner */}
                            <div className="bg-gray-900 p-6 md:p-8 mt-auto">
                                <div className="flex justify-between items-end mb-6">
                                    <span className="text-gray-400 font-bold uppercase tracking-widest text-sm">Total to pay</span>
                                    <span className="text-4xl font-black text-white leading-none">£{total}</span>
                                </div>
                                <button
                                    form="checkout-form"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#00ADEF] text-white py-4 rounded-xl font-black text-lg uppercase tracking-widest hover:bg-[#0092ca] transition-all disabled:opacity-50 shadow-[0_6px_0_#007fac] active:shadow-none active:translate-y-1.5 hover:-translate-y-1 hover:shadow-[0_8px_0_#007fac] group flex items-center justify-center gap-3 overflow-hidden relative"
                                >
                                    <span className="relative z-10">{loading ? 'Processing...' : 'Place Secure Order'}</span>
                                    {!loading && <svg className="w-6 h-6 relative z-10 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
                                </button>
                                <p className="text-center text-xs text-gray-500 font-bold mt-4 flex items-center justify-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/></svg> 
                                    256-bit SSL Encrypted Seamless Checkout
                                </p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;
