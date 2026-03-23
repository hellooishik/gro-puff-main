import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';

const AdminCategories = () => {
    const { user } = useContext(AuthContext);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        image: ''
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/categories');
            setCategories(data);
        } catch (err) {
            setError('Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/categories/${id}`, config);
                fetchCategories();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleCreate = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/categories', {}, config);
            setEditingCategory(data);
            setFormData({
                name: data.name,
                image: data.image
            });
        } catch (err) {
            alert('Create failed');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/categories/${editingCategory._id}`, formData, config);
            setEditingCategory(null);
            fetchCategories();
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div className="p-4">Loading categories...</div>;
    if (error) return <div className="p-4 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <button onClick={handleCreate} className="bg-[#00ADEF] text-white px-4 py-2 rounded">
                    + Create Category
                </button>
            </div>

            {editingCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit Category</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Image URL</label>
                                <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full border p-2 rounded" />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-[#00ADEF] text-white rounded">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border text-left">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-3">ID</th>
                            <th className="p-3">NAME</th>
                            <th className="p-3">IMAGE</th>
                            <th className="p-3">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category._id} className="border-b">
                                <td className="p-3 text-sm text-gray-500">{category._id}</td>
                                <td className="p-3 font-medium">{category.name}</td>
                                <td className="p-3">
                                    {category.image && <img src={category.image} alt={category.name} className="w-12 h-12 object-cover rounded" />}
                                </td>
                                <td className="p-3">
                                    <button 
                                        onClick={() => {
                                            setEditingCategory(category);
                                            setFormData({ name: category.name, image: category.image || '' });
                                        }} 
                                        className="text-white bg-green-500 px-3 py-1 rounded mr-2"
                                    >Edit</button>
                                    <button 
                                        onClick={() => handleDelete(category._id)} 
                                        className="text-white bg-red-500 px-3 py-1 rounded"
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                        {categories.length === 0 && (
                            <tr>
                                <td colSpan="4" className="p-4 text-center text-gray-500">No categories found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminCategories;
