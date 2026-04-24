import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Package, Calendar, MapPin, Truck, CheckCircle, Clock, CreditCard, Heart } from 'lucide-react';
import Swal from 'sweetalert2';
import DeliveryTracker from '../components/DeliveryTracker';

const OrderDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelling, setCancelling] = useState(false);
    const [retryingPayment, setRetryingPayment] = useState(false);
    const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes

    useEffect(() => {
        if (order && order.status === 'Pending') {
            const orderTime = new Date(order.createdAt).getTime();
            const now = new Date().getTime();
            const diffSecs = Math.floor((now - orderTime) / 1000);
            const remaining = 1200 - diffSecs;
            setTimeLeft(remaining > 0 ? remaining : 0);

            if (remaining > 0) {
                const interval = setInterval(() => {
                    setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
                }, 1000);
                return () => clearInterval(interval);
            }
        }
    }, [order]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get(`/api/orders/${id}`, config);
                setOrder(data);
                setLoading(false);
            } catch (err) {
                setError(
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : err.message
                );
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, user, navigate]);

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.get('success') === 'true' && order && !order.isPaid) {
            const markAsPaid = async () => {
                try {
                    const config = { headers: { Authorization: `Bearer ${user.token}` } };
                    const { data } = await axios.put(`/api/orders/${id}/pay`, {}, config);
                    setOrder(data);
                    Swal.fire('Success', 'Payment Successful!', 'success');
                    window.history.replaceState({}, document.title, window.location.pathname);
                } catch (err) {
                    console.error('Error verifying payment', err);
                }
            };
            markAsPaid();
        }
    }, [order, id, user]);

    const cancelOrderHandler = async () => {
        const result = await Swal.fire({
            title: 'Are you sure you want to cancel this order?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        });
        if (!result.isConfirmed) return;
        setCancelling(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.put(`/api/orders/${id}/cancel`, {}, config);
            setOrder(data);
            setCancelling(false);
            Swal.fire('Cancelled!', 'Order has been cancelled successfully.', 'success');
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Error cancelling order', 'error');
            setCancelling(false);
        }
    };

    const handleRetryPayment = async () => {
        setRetryingPayment(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/orders/create-checkout-session', {
                amount: Math.round(order.totalPrice * 100),
                orderId: order._id
            }, config);
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to initialize payment', 'error');
            setRetryingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADEF]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-4xl text-center">
                <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-4">
                    {error}
                </div>
                <button onClick={() => navigate(-1)} className="text-[#00ADEF] underline">Go Back</button>
            </div>
        );
    }

    if (!order) return null;

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Not Processed':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-[#00ADEF] mb-6 flex items-center transition">
                &larr; Back
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 p-6 bg-gray-50 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Order #{order._id}</h1>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                            <Calendar size={16} className="mr-1" />
                            Placed on {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                    <div className="flex flex-col items-end">
                        <div className="flex gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} mb-2`}>
                                {order.status}
                            </span>
                            {order.paymentMethod === 'Online Pay' && (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} mb-2`}>
                                    {order.isPaid ? 'Paid' : 'Unpaid'}
                                </span>
                            )}
                        </div>
                        <div className="text-gray-600 font-medium pb-2">
                            Total: <span className="text-xl font-bold text-gray-900 ml-1">£{(order.totalPrice || 0).toFixed(2)}</span>
                        </div>
                        {order.status === 'Pending' && order.user?._id === user?._id && (
                            <button
                                onClick={cancelOrderHandler}
                                disabled={cancelling}
                                className="mt-2 bg-red-100 text-red-600 hover:bg-red-200 px-4 py-2 rounded-full font-bold text-sm transition-colors border border-red-200"
                            >
                                {cancelling ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}
                    </div>
                </div>

                {order.status === 'Pending' && order.paymentMethod === 'Online Pay' && !order.isPaid ? (
                    <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 p-8 text-center text-white border-b-4 border-yellow-700">
                        <CreditCard className="mx-auto mb-3" size={40} fill="white" />
                        <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-wide">Awaiting Payment</h2>
                        <p className="text-yellow-100 font-medium text-lg mb-6">Your order is reserved. Please complete your payment to confirm it.</p>
                        <button 
                            onClick={handleRetryPayment}
                            disabled={retryingPayment}
                            className="bg-black text-white px-8 py-3 rounded-full font-black text-lg hover:bg-gray-900 transition shadow-[0_4px_0_#444] active:translate-y-1 active:shadow-none inline-flex items-center gap-2 disabled:opacity-50"
                        >
                            {retryingPayment ? 'Proceeding to Stripe...' : 'Pay with Stripe Now'}
                        </button>
                    </div>
                ) : order.status === 'Pending' && (
                    <div className="bg-gradient-to-r from-[#D91C2A] to-[#B01421] p-8 text-center text-white border-b-4 border-[#850E18]">
                        <Heart className="mx-auto mb-3" size={40} fill="white" />
                        <h2 className="text-2xl md:text-3xl font-black mb-2 uppercase tracking-wide">Thank you for your order!</h2>
                        <p className="text-pink-100 font-medium text-lg mb-6">Our awesome shoppers are currently picking your items locally.</p>
                        
                        <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md mx-auto max-w-sm shadow-xl border-4 border-[#FFD100]">
                            <h3 className="text-[#FFD100] font-black uppercase tracking-widest text-sm mb-2">Estimated Delivery In</h3>
                            <div className="text-6xl font-black font-mono tracking-tighter text-white drop-shadow-md">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                )}

                <div className="p-6 border-b border-gray-100">
                    <DeliveryTracker 
                        status={order.status} 
                        address={order.shippingAddress?.address} 
                        city={order.shippingAddress?.city} 
                    />
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
                            <MapPin size={20} className="mr-2 text-[#00ADEF]" />
                            Delivery Details
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-2">
                            <p><span className="font-semibold text-gray-900">Name:</span> {order.user?.name}</p>
                            <p><span className="font-semibold text-gray-900">Email:</span> {order.user?.email}</p>
                            <p><span className="font-semibold text-gray-900">Address:</span> {order.shippingAddress.address}</p>
                            <p><span className="font-semibold text-gray-900">City:</span> {order.shippingAddress.city}</p>
                            <p><span className="font-semibold text-gray-900">Postal Code:</span> {order.shippingAddress.postalCode}</p>
                            {order.deliveryInstruction && order.deliveryInstruction !== 'None' && (
                                <p><span className="font-semibold text-gray-900">Instructions:</span> {order.deliveryInstruction}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
                            <Package size={20} className="mr-2 text-[#00ADEF]" />
                            Order Summary
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-3">
                            <div className="flex justify-between">
                                <span>Items Total</span>
                                <span>£{(order.itemsPrice || 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery & Handling</span>
                                <span>£{(order.shippingPrice || 0).toFixed(2)}</span>
                            </div>
                            {order.isGiftPacked && (
                                <div className="flex justify-between">
                                    <span>Gift Packing</span>
                                    <span>£2.00</span>
                                </div>
                            )}
                            {order.tipAmount > 0 && (
                                <div className="flex justify-between">
                                    <span>Tip</span>
                                    <span>£{(order.tipAmount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>£{(order.taxPrice || 0).toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>-£{(order.discount || 0).toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                                <span>Total</span>
                                <span>£{(order.totalPrice || 0).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                        <Package size={20} className="mr-2 text-[#00ADEF]" />
                        Order Items ({order.orderItems.length})
                    </h2>

                    <div className="divide-y divide-gray-100">
                        {order.orderItems.map((item, idx) => (
                            <div key={idx} className="py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center w-full sm:w-auto">
                                    <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                        <img 
                                            src={item.image.startsWith('http') || item.image.startsWith('data:image') ? item.image : `http://localhost:5000${item.image}`} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="ml-4">
                                        <Link to={`/product/${item.product}`} className="font-semibold text-gray-800 hover:text-[#00ADEF] transition block mb-1">
                                            {item.name}
                                        </Link>
                                        <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            Qty: {item.qty}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right w-full sm:w-auto font-bold text-gray-900 shrink-0">
                                    {item.isFreeItem ? (
                                        <span className="text-green-600 px-2 py-1 bg-green-50 rounded text-sm">FREE</span>
                                    ) : (
                                        <span>£{(item.price || 0).toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Support Section */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#00ADEF]/10 rounded-full flex items-center justify-center text-[#00ADEF]">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">Need Help?</h3>
                            <p className="text-xs text-gray-500">We're here for you 24/7</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <a 
                            href="tel:07587764215" 
                            className="bg-white border-2 border-[#00ADEF] text-[#00ADEF] hover:bg-[#00ADEF] hover:text-white px-5 py-2 rounded-full font-bold text-sm transition-colors shadow-sm"
                        >
                            Call Customer Care
                        </a>
                        {['Shipped', 'Processing'].includes(order.status) && (
                            <button 
                                onClick={() => Swal.fire('Notice', 'Delivery Partner messaging is not yet integrated.', 'info')}
                                className="bg-gray-800 text-white hover:bg-gray-900 px-5 py-2 rounded-full font-bold text-sm transition-colors shadow-sm"
                            >
                                Contact Delivery Partner
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
