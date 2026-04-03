import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState({});
    const [recommendations, setRecommendations] = useState([]);
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    // Initial Product Fetch
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        setLoading(true);
        fetchProduct();
    }, [id]);

    // Recommendation Engine: Fetch Category Peers
    useEffect(() => {
        if (product.category) {
            const fetchRecommendations = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    const { data } = await axios.get(`${API_URL}/api/products?category=${encodeURIComponent(product.category)}`);
                    // Filter out the current product and grab up to 4 recommendations
                    const filtered = data.filter((p) => p._id !== product._id && p.name !== 'Sample name').slice(0, 4);
                    setRecommendations(filtered);
                } catch (error) {
                    console.error('Recommendations failed:', error);
                }
            };
            fetchRecommendations();
        }
    }, [product.category, product._id]);

    const addToCartHandler = () => {
        if (!user) {
            Swal.fire({ title: 'Authentication Required', text: 'Please sign in before adding items to the cart.', icon: 'warning', confirmButtonColor: '#4CAF50' });
            navigate('/login');
            return;
        }
        addToCart(product, qty);
    };

    const handleQuickAdd = (e, recProduct) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            Swal.fire({ title: 'Authentication Required', text: 'Please sign in before adding items to the cart.', icon: 'warning', confirmButtonColor: '#4CAF50' });
            navigate('/login');
            return;
        }
        addToCart(recProduct, 1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-[70vh] bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF]">
                <div className="animate-bounce bg-[#2E8B57] text-white font-black px-8 py-4 rounded-full border-[6px] border-[#003B18] shadow-[0_6px_0_#003B18] text-2xl uppercase tracking-widest">
                    Loading Crop... 🌾
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] min-h-screen py-10 relative overflow-hidden font-sans pb-32">
            {/* Ambient Background */}
            <div className="absolute top-10 right-20 text-white text-6xl opacity-80 pointer-events-none">☁️</div>
            <div className="absolute top-40 left-10 text-white text-5xl opacity-70 pointer-events-none">☁️</div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <Link to="/" className="inline-flex items-center gap-2 bg-[#FFD100] text-black font-black uppercase px-6 py-3 rounded-full border-4 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-[2px_2px_0_#000] transition-all mb-8 text-lg">
                    <ArrowLeft size={24} /> Back to Village
                </Link>

                <div className="grid md:grid-cols-2 gap-12 mb-20 bg-white/40 p-6 md:p-10 rounded-3xl border-[6px] border-[#2E8B57] shadow-[8px_8px_0_rgba(46,139,87,0.3)] backdrop-blur-sm">
                    {/* Image Barn */}
                    <div className="bg-white rounded-3xl border-[6px] border-black shadow-[8px_8px_0_#000] flex items-center justify-center p-8 relative group overflow-hidden h-[400px] md:h-[500px]">
                        <div className="absolute top-4 right-4 bg-[#FFD100] text-black font-black px-4 py-1.5 rounded-full border-2 border-black shadow-[2px_2px_0_#000] transform rotate-12 z-10">
                            {product.category}
                        </div>
                        <img
                            src={product.image?.startsWith('http') || product.image?.startsWith('data:image') ? product.image : `http://localhost:5000${product.image}`}
                            alt={product.name}
                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    {/* Details Barn */}
                    <div className="flex flex-col justify-center">
                        <h1 className="text-4xl md:text-5xl font-black mb-4 text-[#003B18] uppercase tracking-tighter leading-tight" style={{ textShadow: '2px 2px 0 #fff' }}>
                            {product.name}
                        </h1>

                        <div className="flex flex-wrap items-center gap-4 mb-8">
                            <span className="text-4xl font-black text-[#D91C2A] bg-white px-6 py-2 rounded-2xl border-4 border-black shadow-[4px_4px_0_#000] transform -rotate-2">
                                £{product.price?.toFixed(2)}
                            </span>
                            <span className="bg-[#FFD100] text-black px-4 py-2 rounded-full text-sm font-black uppercase border-2 border-black shadow-[2px_2px_0_#000]">
                                From {product.brand || 'Local Farm'}
                            </span>
                            <span className={`px-4 py-2 rounded-full text-sm font-black uppercase border-2 border-black shadow-[2px_2px_0_#000] ${product.countInStock > 0 ? 'bg-[#4CAF50] text-white' : 'bg-gray-400 text-white'}`}>
                                {product.countInStock > 0 ? 'Plot Ready 🌱' : 'Harvest Empty'}
                            </span>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border-4 border-[#2E8B57] shadow-[4px_4px_0_rgba(46,139,87,0.5)] mb-8">
                            <h3 className="text-[#003B18] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span>🌾</span> Crop Details
                            </h3>
                            <p className="text-gray-700 text-lg leading-relaxed font-bold">
                                {product.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-6 bg-[#D91C2A] p-6 rounded-3xl border-[6px] border-[#850E18] shadow-[8px_8px_0_#850E18]">
                            {/* QTY Control */}
                            <div className="flex items-center bg-white rounded-full border-4 border-black px-2 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]">
                                <button
                                    onClick={() => setQty(Math.max(1, qty - 1))}
                                    className="p-3 text-[#D91C2A] hover:scale-125 transition-transform"
                                >
                                    <Minus size={24} strokeWidth={3} />
                                </button>
                                <span className="w-12 text-center font-black text-2xl text-black">{qty}</span>
                                <button
                                    onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                                    className="p-3 text-[#4CAF50] hover:scale-125 transition-transform"
                                >
                                    <Plus size={24} strokeWidth={3} />
                                </button>
                            </div>

                            <button
                                onClick={addToCartHandler}
                                disabled={product.countInStock === 0}
                                className="flex-1 w-full bg-[#FFD100] text-black py-4 rounded-full font-black text-2xl hover:bg-white transition-all shadow-[0_6px_0_#000] hover:translate-y-1 hover:shadow-[0_4px_0_#000] active:translate-y-3 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border-[4px] border-black uppercase tracking-wider"
                            >
                                <ShoppingBag size={28} strokeWidth={2.5} />
                                Load Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recommendation Engine */}
                {recommendations.length > 0 && (
                    <div className="mt-12 bg-[#5C9E31] p-8 md:p-12 rounded-[40px] border-[8px] border-[#3B6E1A] shadow-[8px_16px_0_rgba(0,0,0,0.2)] relative">
                        {/* Aesthetic Header */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#FFD100] px-8 py-3 rounded-full border-4 border-black shadow-[4px_4px_0_#000] transform -rotate-2">
                            <h2 className="text-2xl md:text-3xl font-black text-black uppercase tracking-widest flex items-center gap-3">
                                <span>🚜</span> More from this farm
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mt-6">
                            {recommendations.map(rec => (
                                <div 
                                    key={rec._id} 
                                    onClick={() => navigate(`/product/${rec._id}`)}
                                    className="bg-white rounded-[2rem] p-4 md:p-6 shadow-[4px_8px_0_rgba(0,0,0,0.1)] hover:shadow-[8px_16px_0_rgba(0,0,0,0.2)] hover:-translate-y-2 transition-all duration-300 relative group cursor-pointer border-4 border-black flex flex-col h-full"
                                >
                                    {rec.countInStock === 0 && (
                                        <div className="absolute top-4 left-4 right-4 bg-black/80 text-white text-center py-1 rounded-full text-xs font-black uppercase z-10 border-2 border-white shadow-sm backdrop-blur-sm rotate-2">
                                            Out of Stock
                                        </div>
                                    )}

                                    <div className="h-32 md:h-40 w-full mb-4 bg-gray-50 rounded-2xl flex items-center justify-center p-2 group-hover:bg-[#E0F6FF] transition-colors border-2 border-gray-100 overflow-hidden isolate relative">
                                        <img 
                                            src={rec.image?.startsWith('http') || rec.image?.startsWith('data:image') ? rec.image : `http://localhost:5000${rec.image}`} 
                                            alt={rec.name} 
                                            className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-300 z-10"
                                        />
                                    </div>

                                    <div className="mt-auto">
                                        <h3 className="font-black text-base md:text-xl text-gray-800 leading-tight mb-2 uppercase line-clamp-2" title={rec.name}>
                                            {rec.name}
                                        </h3>
                                        <div className="flex justify-between items-center mt-4">
                                            <div className="flex flex-col">
                                                <span className="text-[#FFC107] text-[10px] md:text-xs font-black uppercase tracking-wider bg-yellow-50 px-2 py-0.5 rounded-full w-fit mb-1 border border-yellow-200">
                                                    £{(rec.price * 1.2).toFixed(2)} RRP
                                                </span>
                                                <span className="text-xl md:text-2xl font-black text-[#D91C2A] drop-shadow-sm flex items-center gap-1">
                                                    <span className="text-sm">£</span>{rec.price?.toFixed(2)}
                                                </span>
                                            </div>

                                            <button 
                                                onClick={(e) => handleQuickAdd(e, rec)}
                                                disabled={rec.countInStock === 0}
                                                className="bg-[#D91C2A] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-xl hover:bg-[#850E18] transition-colors shadow-[0_4px_0_#850E18] hover:translate-y-1 hover:shadow-none active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-black"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDetails;
