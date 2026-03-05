import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import axios from '../api/axios';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';

// Initialize Stripe with publishable key
const stripePromise = loadStripe('pk_test_51T52ZkDZCNoQB45O9G5PlLYzHyh7dyuUCf50qUnbxvsazruQ7PzVxvT57bgVR0EBOOV4tSaKlrQB4DgdHdPIRcfx00OlozjpRu');

const CheckoutPage = () => {
    const { cartItems, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('United Kingdom'); // Default to UK
    const [paymentMethod, setPaymentMethod] = useState('Stripe');
    const [loading, setLoading] = useState(false);

    // UK Postcode Regex (Simple version)
    // improved regex: ^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$
    const ukPostcodeRegex = /^([A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}|GIR ?0AA)$/i;

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
        if (cartItems.length === 0) {
            navigate('/cart');
        }
    }, [user, cartItems, navigate]);

    const handlePayment = async () => {
        setLoading(true);
        const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
        const deliveryFee = subtotal > 50 ? 0 : 5.99;
        const total = parseFloat(subtotal) + deliveryFee;
        const amountInCents = Math.round(total * 100); // Stripe expects amount in cents

        try {
            const response = await axios.post('/create-checkout-session', {
                amount: amountInCents,
            });

            const session = response.data;

            const stripe = await stripePromise;
            const result = await stripe.redirectToCheckout({
                sessionId: session.id,
            });

            if (result.error) {
                alert(result.error.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const submitHandler = (e) => {
        e.preventDefault();

        // Strict UK Validation
        if (country.trim().toLowerCase() !== 'united kingdom' && country.trim().toLowerCase() !== 'uk') {
            alert('Sorry, we only ship to the United Kingdom.');
            return;
        }

        if (!ukPostcodeRegex.test(postalCode)) {
            alert('Please enter a valid UK postcode.');
            return;
        }

        // Proceed to payment
        handlePayment();
    };

    const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2);
    const deliveryFee = subtotal > 50 ? 0.00 : 5.99;
    const total = (parseFloat(subtotal) + (deliveryFee === 'Free' ? 0 : parseFloat(deliveryFee))).toFixed(2);

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
                                disabled={loading}
                                className="w-full bg-[#00ADEF] text-white py-3 rounded-full font-bold text-lg hover:bg-[#0092ca] transition disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="md:w-1/3">
                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm border sticky top-24">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Items</span>
                                <span>${subtotal}</span>
                            </div>
                            <div className="flex justify-between mb-2 text-gray-600">
                                <span>Shipping</span>
                                <span>{deliveryFee === 0 ? 'Free' : `$${deliveryFee}`}</span>
                            </div>
                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>Tax</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                <span>Total</span>
                                <span>${total}</span>
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
