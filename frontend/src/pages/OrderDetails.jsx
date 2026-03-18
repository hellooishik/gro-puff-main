import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Package, Calendar, MapPin, Truck, CheckCircle, Clock, CreditCard } from 'lucide-react';

const OrderDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} mb-2`}>
                            {order.status}
                        </span>
                        <div className="text-gray-600 font-medium">
                            Total: <span className="text-xl font-bold text-gray-900 ml-1">£{order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 flex items-center mb-4">
                            <MapPin size={20} className="mr-2 text-[#00ADEF]" />
                            Shipping Details
                        </h2>
                        <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 space-y-2">
                            <p><span className="font-semibold text-gray-900">Name:</span> {order.user?.name}</p>
                            <p><span className="font-semibold text-gray-900">Email:</span> {order.user?.email}</p>
                            <p><span className="font-semibold text-gray-900">Address:</span> {order.shippingAddress.address}</p>
                            <p><span className="font-semibold text-gray-900">City:</span> {order.shippingAddress.city}</p>
                            <p><span className="font-semibold text-gray-900">Postal Code:</span> {order.shippingAddress.postalCode}</p>
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
                                <span>£{order.itemsPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span>£{order.shippingPrice.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>£{order.taxPrice.toFixed(2)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>-£{order.discount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base text-gray-900">
                                <span>Total</span>
                                <span>£{order.totalPrice.toFixed(2)}</span>
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
                                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
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
                                        <span>£{item.price.toFixed(2)}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
