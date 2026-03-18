import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('United Kingdom');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Offers state
    const [isFirstOrder, setIsFirstOrder] = useState(false);

    // UK Postcode Regex (Simple version)
    // improved regex: ^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$
    const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;

    // Fetch orders to check for first order discount
    useEffect(() => {
        const checkFirstOrder = async () => {
            if (user) {
                try {
                    const axios = (await import('../api/axios')).default;
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.get('/api/orders/my', config);
                    const validOrders = data.filter(o => o.status !== 'Cancelled');
                    if (validOrders.length === 0) {
                        setIsFirstOrder(true);
                    }
                } catch (error) {
                    console.error('Failed to check orders', error);
                }
            }
        };
        checkFirstOrder();
    }, [user]);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [user, cartItems, navigate]);

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

        try {
            setIsSubmitting(true);
            const axios = (await import('../api/axios')).default;
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
                paymentMethod: 'COD',
                itemsPrice: subtotal,
                shippingPrice: deliveryFee === 'Free' ? 0 : deliveryFee,
                taxPrice: 0,
            };

            await axios.post('/api/orders', orderPayload, config);
            
            setIsSubmitting(false);
            alert('Order placed successfully! Payment will be collected at delivery.');
            clearCart();
            navigate('/');
        } catch (error) {
            setIsSubmitting(false);
            if (error.response && error.response.data && error.response.data.message) {
                setErrorMsg(error.response.data.message);
            } else {
                setErrorMsg('An error occurred. Please try again.');
            }
        }
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const deliveryFee = parseFloat(subtotal) > 50 ? 0.00 : 5.99;
    
    // Calculate total including discounts
    const discount = isFirstOrder ? 10.00 : 0.00;
    const computedTotal = (parseFloat(subtotal) + (deliveryFee === 0 ? 0 : parseFloat(deliveryFee))) - discount;
    const total = computedTotal > 0 ? computedTotal.toFixed(2) : '0.00';

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Shipping Form */}
                    <div className="md:w-2/3 bg-white p-6 rounded-lg shadow-sm border">
                        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                        <form onSubmit={submitHandler}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Address</label>
                                <input
                                    type="text"
                                    placeholder="Enter address"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">City</label>
                                <input
                                    type="text"
                                    placeholder="Enter city"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">Postal Code</label>
                                <input
                                    type="text"
                                    placeholder="Enter UK postcode"
                                    value={postalCode}
                                    onChange={(e) => setPostalCode(e.target.value)}
                                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 font-medium mb-2">Country</label>
                                <input
                                    type="text"
                                    placeholder="Enter country"
                                    value={country} // Controlled input
                                    // onChange={(e) => setCountry(e.target.value)} // Lock to UK or warn? User said "only for uk".
                                    // Let's allow editing but validation will fail? 
                                    // Better to just make it readOnly or select?
                                    // User said "search bar should work and should go to proper checkout page with details and address. only for uk".
                                    // I'll make it readonly to prevent errors.
                                    readOnly
                                    className="w-full p-3 border rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00ADEF]"
                                    required
                                />
                                <p className="text-sm text-gray-500 mt-1">We currently only ship to the United Kingdom.</p>
                            </div>

                            <h2 className="text-xl font-semibold mb-4 border-t pt-4">Payment Method</h2>
                            <div className="mb-6">
                                <div className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        id="stripe"
                                        name="paymentMethod"
                                        value="Stripe"
                                        checked
                                        readOnly
                                        className="text-[#00ADEF] focus:ring-[#00ADEF]"
                                    />
                                    <label htmlFor="stripe" className="ml-2">Stripe / Credit Card</label>
                                </div>
                                {/* Add more passed mocks if needed */}
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-[#00ADEF] text-white py-3 rounded-full font-bold text-lg hover:bg-[#0092ca] transition"
                            >
                                Place Order
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="md:w-1/3">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            
                            {isFirstOrder && (
                                <div className="mb-4 bg-green-100 text-green-800 p-2 rounded text-sm font-semibold text-center border border-green-200">
                                    👉 £10 OFF applied (First Order Offer)
                                </div>
                            )}
                            {parseFloat(subtotal) >= 20 && (
                                <div className="mb-4 bg-blue-100 text-[#00ADEF] p-2 rounded text-sm font-semibold text-center border border-blue-200">
                                    👉 Free Milk will be added to your order 🎉
                                </div>
                            )}

                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Items</span>
                                <span>£{subtotal}</span>
                            </div>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Shipping</span>
                                <span>{deliveryFee === 0 ? 'Free' : `£${deliveryFee}`}</span>
                            </div>
                            
                            {isFirstOrder && (
                                <div className="flex justify-between mb-2 text-green-600 font-medium">
                                    <span>First Order Discount</span>
                                    <span>-£10.00</span>
                                </div>
                            )}

                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>£{total}</span>
                            </div>

                            <div className="mt-6">
                                <h3 className="font-medium mb-2">Items in Cart:</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item.product} className="flex items-center gap-3 text-sm">
                                            <img src={item.image} alt={item.name} className="w-10 h-10 object-contain rounded" />
                                            <div className="flex-1">
                                                <div className="truncate font-medium">{item.name}</div>
                                                <div className="text-gray-500">Qty: {item.qty}</div>
                                            </div>
                                            <div>${(item.price * item.qty).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
