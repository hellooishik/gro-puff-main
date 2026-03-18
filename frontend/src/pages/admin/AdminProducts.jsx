import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';

const AdminProducts = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form state
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        image: '',
        brand: '',
        category: '',
        countInStock: '',
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const { data } = await axios.get('/api/products');
            setProducts(data);
        } catch (err) {
            setError('Failed to fetch products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/products/${id}`, config);
                fetchProducts();
            } catch (err) {
                alert('Delete failed');
            }
        }
    };

    const handleCreate = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/products', {}, config);
            setEditingProduct(data);
            setFormData({
                name: data.name,
                price: data.price,
                description: data.description,
                image: data.image,
                brand: data.brand,
                category: data.category,
                countInStock: data.countInStock,
            });
        } catch (err) {
            alert('Create failed');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.put(`/api/products/${editingProduct._id}`, formData, config);
            setEditingProduct(null);
            fetchProducts();
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div>Loading products...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <button onClick={handleCreate} className="bg-[#00ADEF] text-white px-4 py-2 rounded">
                    + Create Product
                </button>
            </div>

            {editingProduct && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4">Edit Product</h2>
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Name</label>
                                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Price</label>
                                <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Image URL</label>
                                <input type="text" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Brand</label>
                                <input type="text" value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Category</label>
                                <input type="text" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Stock</label>
                                <input type="number" value={formData.countInStock} onChange={(e) => setFormData({...formData, countInStock: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Description</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded" required />
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setEditingProduct(null)} className="px-4 py-2 text-gray-600 bg-gray-200 rounded">Cancel</button>
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
                            <th className="p-3 text-left">PRICE</th>
                            <th className="p-3 text-left">STOCK</th>
                            <th className="p-3 text-left">ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id} className="border-b">
                                <td className="p-3 text-sm">{product._id}</td>
                                <td className="p-3">{product.name}</td>
                                <td className="p-3">${product.price}</td>
                                <td className="p-3">{product.countInStock}</td>
                                <td className="p-3">
                                    <button 
                                        onClick={() => {
                                            setEditingProduct(product);
                                            setFormData({
                                                name: product.name, price: product.price,
                                                description: product.description, image: product.image,
                                                brand: product.brand, category: product.category,
                                                countInStock: product.countInStock
                                            });
                                        }} 
                                        className="text-white bg-green-500 px-3 py-1 rounded mr-2"
                                    >Edit</button>
                                    <button 
                                        onClick={() => handleDelete(product._id)} 
                                        className="text-white bg-red-500 px-3 py-1 rounded"
                                    >Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
