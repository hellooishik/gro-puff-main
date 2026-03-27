import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminUsers = () => {
    const { user } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        username: '',
        phone: '',
        role: '',
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/auth', config);
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/auth/${editingUser._id}`, formData, config);
            setEditingUser(null);
            fetchUsers();
            Swal.fire('Success', 'User updated successfully', 'success');
        } catch (err) {
            Swal.fire('Error', 'Update failed', 'error');
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">Users Management</h1>

            {editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit User Requirements</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Username</label>
                                <input type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Phone</label>
                                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Role</label>
                                <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full border p-2 rounded">
                                    <option value="customer">Customer</option>
                                    <option value="admin">Admin</option>
                                    <option value="delivery">Delivery</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[#00ADEF] text-white rounded">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3 text-left">ID</th>
                            <th className="p-3 text-left">NAME</th>
                            <th className="p-3 text-left">EMAIL</th>
                            <th className="p-3 text-left">PHONE</th>
                            <th className="p-3 text-left">ROLE</th>
                            <th className="p-3 text-left">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id} className="border-b">
                                <td className="p-3 text-sm">{u._id}</td>
                                <td className="p-3">{u.name} ({u.username})</td>
                                <td className="p-3">{u.email}</td>
                                <td className="p-3">{u.phone}</td>
                                <td className="p-3">{u.role}</td>
                                <td className="p-3">
                                    <button 
                                        onClick={() => {
                                            setEditingUser(u);
                                            setFormData({
                                                name: u.name, email: u.email,
                                                username: u.username || '', phone: u.phone || '',
                                                role: u.role
                                            });
                                        }} 
                                        className="text-white bg-[#00ADEF] px-3 py-1 rounded"
                                    >Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;
