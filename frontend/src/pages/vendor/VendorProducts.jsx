import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { Edit2, Trash2, PlusCircle, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const VendorProducts = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'vendor') {
            navigate('/login');
            return;
        }
        fetchProducts();
    }, [user, navigate]);

    const fetchProducts = async () => {
        try {
            // Vendors can filter by their own ID natively if we updated backend, or we can filter frontend if public doesn't protect it
            // Assuming getProducts handles it or we just filter client side for now.
            const { data } = await axios.get('/api/products');
            const myProducts = data.filter(p => p.user === user._id);
            setProducts(myProducts);
            setLoading(false);
        } catch (err) {
            setError('Error fetching your crops');
            setLoading(false);
        }
    };

    const deleteHandler = async (id) => {
        const result = await Swal.fire({
            title: 'Are you certain you want to root out this crop?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#D91C2A',
            confirmButtonText: 'Yes, root it out!'
        });
        if (result.isConfirmed) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/products/${id}`, config);
                fetchProducts();
                Swal.fire({ title: 'Deleted!', text: 'Crop has been rooted out.', icon: 'success', confirmButtonColor: '#4CAF50' });
            } catch (err) {
                Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message, icon: 'error', confirmButtonColor: '#4CAF50' });
            }
        }
    };

    const createProductHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.post('/api/products', {}, config);
            // navigate to generic edit page or admin product edit, since we rely on `/admin/product/:id/edit` layout
            // Let's just use the admin edit layout since it's just a form.
            navigate(`/admin/product/${data._id}/edit`);
        } catch (err) {
            Swal.fire({ title: 'Error', text: err.response?.data?.message || err.message, icon: 'error', confirmButtonColor: '#4CAF50' });
        }
    };

    if (loading) return <div className="p-8 text-center text-2xl font-black text-[#2E8B57]">Loading Farm Inventory... 🌾</div>;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#E0F6FF] to-[#A4E0F9] py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Link to="/vendor/dashboard" className="inline-flex items-center gap-2 bg-[#FFD100] text-black font-black uppercase px-6 py-3 rounded-full border-4 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all mb-8 text-lg">
                    <ArrowLeft size={24} /> Back to Terminal
                </Link>

                <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl border-[6px] border-[#2E8B57] shadow-[8px_8px_0_rgba(46,139,87,0.3)]">
                    <h1 className="text-4xl font-black text-[#003B18] uppercase flex items-center gap-4">
                        🌾 Crop Inventory
                    </h1>
                    <button 
                        onClick={createProductHandler}
                        className="flex items-center gap-2 bg-[#4CAF50] text-white px-6 py-3 rounded-xl font-black text-lg border-4 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all cursor-pointer uppercase tracking-wider"
                    >
                        <PlusCircle size={24} /> Plant New Crop
                    </button>
                </div>

                {error ? (
                    <div className="bg-[#D91C2A] text-white p-6 rounded-2xl font-bold border-4 border-black shadow-[4px_4px_0_#000]">{error}</div>
                ) : products.length === 0 ? (
                    <div className="text-center py-24 bg-white/60 rounded-3xl border-4 border-dashed border-[#2E8B57]">
                        <span className="text-6xl block mb-6">🌱</span>
                        <h2 className="text-3xl font-black text-[#003B18] uppercase mb-4">No crops planted yet</h2>
                        <p className="text-xl text-gray-600 font-bold mb-8">Start by planting your first crop so locals can order it.</p>
                        <button onClick={createProductHandler} className="bg-[#4CAF50] text-white px-8 py-4 rounded-full font-black text-xl border-4 border-black shadow-[6px_6px_0_#000] hover:translate-y-1 transition-all uppercase">
                            Plant Seed
                        </button>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border-[6px] border-black shadow-[8px_8px_0_#000] overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#FFD100] text-black uppercase tracking-widest text-sm border-b-4 border-black">
                                        <th className="p-5 font-black">ID</th>
                                        <th className="p-5 font-black">Product Crop</th>
                                        <th className="p-5 font-black">Price</th>
                                        <th className="p-5 font-black">Category</th>
                                        <th className="p-5 font-black">Stock Yield</th>
                                        <th className="p-5 font-black text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="font-bold text-gray-700">
                                    {products.map((product) => (
                                        <tr key={product._id} className="border-b-2 border-dashed border-gray-300 hover:bg-[#F2FDF5] transition">
                                            <td className="p-5 font-mono text-sm">{product._id.substring(0,6)}...</td>
                                            <td className="p-5 text-black">{product.name}</td>
                                            <td className="p-5 text-[#2E8B57] text-lg">£{product.price}</td>
                                            <td className="p-5">{product.category}</td>
                                            <td className="p-5">
                                                <span className={`px-3 py-1 rounded-full text-sm ${product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {product.countInStock > 0 ? `${product.countInStock} Units` : 'Barren / OOS'}
                                                </span>
                                            </td>
                                            <td className="p-5 flex justify-center gap-3">
                                                <button onClick={() => navigate(`/admin/product/${product._id}/edit`)} className="bg-white text-[#00ADEF] p-3 rounded-lg border-2 border-[#00ADEF] hover:bg-[#00ADEF] hover:text-white transition shadow-sm">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => deleteHandler(product._id)} className="bg-white text-[#D91C2A] p-3 rounded-lg border-2 border-[#D91C2A] hover:bg-[#D91C2A] hover:text-white transition shadow-sm">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VendorProducts;
