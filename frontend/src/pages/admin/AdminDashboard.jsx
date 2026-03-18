import { Link } from 'react-router-dom';

const AdminDashboard = () => {
    return (
        <div className="container mx-auto px-4 py-10">
            <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                <Link to="/admin/products" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">📦 Manage Products</h2>
                    <p className="text-gray-600">Add, edit, delete products and update stock.</p>
                </Link>

                <Link to="/admin/orders" className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition text-center">
                    <h2 className="text-2xl font-bold mb-2 text-[#00ADEF]">📊 Manage Orders</h2>
                    <p className="text-gray-600">View customer orders and update delivery status.</p>
                </Link>
            </div>
        </div>
    );
};

export default AdminDashboard;
