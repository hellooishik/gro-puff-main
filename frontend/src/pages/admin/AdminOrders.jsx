import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminOrders = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            Swal.fire('Success', 'Status updated successfully', 'success');
        } catch (err) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    if (loading) return <div>Loading orders...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
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
                                        <option value="Out_for_Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                    <Link to={`/order/${order._id}`} className="ml-2 text-sm text-[#00ADEF] underline">View</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminOrders;
