import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { Bell } from 'lucide-react';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders', config);
                const pending = data.filter(order => order.status === 'Pending');
                setPendingCount(pending.length);
            } catch (err) {
                console.error('Failed to fetch orders for notification', err);
            }
        };

        if (user && user.role === 'admin') {
            fetchPendingOrders();
            // Poll every 15 seconds
            const interval = setInterval(fetchPendingOrders, 15000);
            return () => clearInterval(interval);
        }
    }, [user]);

    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>

            {pendingCount > 0 && (
                <div className="max-w-4xl mx-auto mb-8 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r shadow-sm flex items-center justify-between animate-pulse">
                    <div className="flex items-center">
                        <Bell className="mr-3" size={24} />
                        <div>
                            <p className="font-bold text-lg">New Orders Alert!</p>
                            <p>You have {pendingCount} order(s) awaiting processing.</p>
                        </div>
                    </div>
                    <Link to="/admin/orders" className="bg-red-500 text-white px-4 py-2 rounded font-bold hover:bg-red-600 transition">
                        View Orders
                    </Link>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">📦 Manage Products</h2>
                    <p className="text-gray-600">Add, edit, delete products and update stock.</p>
                </Link>

                <Link to="/admin/orders" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center relative">
                    {pendingCount > 0 && (
                        <span className="absolute -top-3 -right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center rounded-full font-bold shadow animate-bounce">
                            {pendingCount}
                        </span>
                    )}
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">📊 Manage Orders</h2>
                    <p className="text-gray-600">View customer orders and update delivery status.</p>
                </Link>

                <Link to="/admin/users" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">👥 Manage Users</h2>
                    <p className="text-gray-600">View and edit user access and profiles.</p>
                </Link>

                <Link to="/admin/categories" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">📁 Manage Categories</h2>
                    <p className="text-gray-600">Add, edit, and delete product categories.</p>
                </Link>

                <Link to="/admin/coupons" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">🎟️ Manage Coupons</h2>
                    <p className="text-gray-600">Add, edit, and delete discount coupons.</p>
                </Link>

                <Link to="/admin/settings" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center col-span-1 md:col-span-2">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">⚙️ Store Settings</h2>
                    <p className="text-gray-600">Update global store settings, display offers, and gift packing rates.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
