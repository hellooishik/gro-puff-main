import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Package, Calendar, MapPin, CheckCircle, Clock, Truck } from 'lucide-react';

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyOrders = async () => {
            try {
                const { data } = await axios.get('/api/orders/my');
                setOrders(data);
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

        fetchMyOrders();
    }, [user, navigate]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'Shipped':
                return <Truck className="text-blue-500" size={20} />;
            case 'Not Processed':
                return <Clock className="text-gray-500" size={20} />;
            default:
                return <Package className="text-yellow-500" size={20} />;
        }
    };

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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ADEF]"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center space-x-4 mb-6">
                            <div className="bg-[#00ADEF] bg-opacity-10 w-16 h-16 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-[#00ADEF]">
                                    {user?.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-800">{user?.name}</h2>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 mb-1">Account Status</p>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Active
                            </span>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                            <Package className="mr-2 text-[#00ADEF]" size={24} />
                            Order History
                        </h2>

                        {error ? (
                            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm">
                                {error}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="text-gray-400" size={32} />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No orders yet</h3>
                                <p className="text-gray-500">When you place orders, they will appear here.</p>
                                <button
                                    onClick={() => navigate('/')}
                                    className="mt-4 px-6 py-2 bg-[#00ADEF] text-white font-medium rounded-full hover:bg-opacity-90 transition-colors"
                                >
                                    Start Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order._id} className="border border-gray-100 rounded-xl p-5 hover:border-[#00ADEF] transition-colors group">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-50 pb-4 mb-4 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500 mb-1">
                                                    Order <span className="font-semibold text-gray-800">#{order._id.substring(0, 8)}</span>
                                                </p>
                                                <div className="flex items-center text-xs text-gray-500">
                                                    <Calendar className="mr-1" size={14} />
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total</p>
                                                    <p className="font-bold text-gray-900">£{order.totalPrice.toFixed(2)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-start">
                                            <div className="flex -space-x-2">
                                                {order.orderItems.slice(0, 3).map((item, idx) => (
                                                    <div key={idx} className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 overflow-hidden relative" title={item.name}>
                                                        <img
                                                            src={item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                                {order.orderItems.length > 3 && (
                                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                                        +{order.orderItems.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-sm text-gray-600 flex items-start text-right">
                                               {order.orderItems.length} items
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
