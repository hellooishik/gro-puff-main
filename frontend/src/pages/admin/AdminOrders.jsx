import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { MessageSquare, X, Send } from 'lucide-react';

const AdminOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [smsModalOrder, setSmsModalOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/orders', config);
            setOrders(data);
        } catch (err) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/orders/${id}/status`, { status: newStatus }, config);
            fetchOrders(); // Refresh table
            Swal.fire('Success', 'Status updated and SMS notification queued successfully', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const resendSms = async (orderId, type) => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post(`/api/orders/${orderId}/resend-sms`, { type }, config);
            Swal.fire('Success', data.message, 'success');
            fetchOrders();
            // Update modal data
            setSmsModalOrder(data.order);
        } catch (err) {
            Swal.fire('Error', err.response?.data?.message || 'Failed to resend SMS', 'error');
        }
    };

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8 relative">
            <h1 className="text-2xl font-bold mb-6">Orders</h1>
            
            <div className="overflow-x-auto">
                <table className="w-full border">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">USER</th>
                            <th className="p-3 text-left">DATE</th>
                            <th className="p-3 text-left">TOTAL</th>
                            <th className="p-3 text-left">PAID</th>
                            <th className="p-3 text-left">STATUS</th>
                            <th className="p-3 text-left">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order._id} className="border-b">
                                <td className="p-3 text-sm">{order._id}</td>
                                <td className="p-3">{order.user ? order.user.name : 'Deleted User'}</td>
                                <td className="p-3">{order.createdAt ? order.createdAt.substring(0, 10) : 'N/A'}</td>
                                <td className="p-3">£{(order.totalPrice || 0).toFixed(2)}</td>
                                <td className="p-3">{order.isPaid ? 'Yes' : 'No'}</td>
                                <td className="p-3">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        className="border p-1 rounded"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-3 flex items-center gap-3">
                                    <Link to={`/order/${order._id}`} className="text-sm text-[#00ADEF] hover:underline">View</Link>
                                    <button 
                                        onClick={() => setSmsModalOrder(order)}
                                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 transition"
                                        title="SMS Notifications"
                                    >
                                        <MessageSquare size={16} /> SMS
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SMS Modal */}
            {smsModalOrder && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <MessageSquare className="text-green-500" size={20} />
                                SMS Notifications (Order #{smsModalOrder._id.substring(0, 6)}...)
                            </h2>
                            <button onClick={() => setSmsModalOrder(null)} className="text-gray-400 hover:text-gray-700">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {[
                                { key: 'received', label: 'Order Received' },
                                { key: 'shipped', label: 'Order Shipped' },
                                { key: 'delivered', label: 'Order Delivered' }
                            ].map((smsType) => {
                                const notifData = smsModalOrder.smsNotifications?.[smsType.key] || { sent: false };
                                return (
                                    <div key={smsType.key} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg gap-3">
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{smsType.label}</p>
                                            <p className={`text-xs mt-1 ${notifData.sent ? 'text-green-600' : 'text-gray-500'}`}>
                                                {notifData.sent 
                                                    ? `✅ Sent at ${new Date(notifData.timestamp).toLocaleString()}` 
                                                    : '❌ Not Sent Yet'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => resendSms(smsModalOrder._id, smsType.key)}
                                            className="flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
                                        >
                                            <Send size={12} /> {notifData.sent ? 'Resend' : 'Send'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 text-right">
                            <button onClick={() => setSmsModalOrder(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;
