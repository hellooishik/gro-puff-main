import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import Swal from 'sweetalert2';

function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 999;
    const R = 3958.8;
    const dLat = (lat2-lat1) * (Math.PI/180);
    const dLon = (lon2-lon1) * (Math.PI/180); 
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c;
}

const HomePage = () => {
    const [postcode, setPostcode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const navigate = useNavigate();
    const { addToCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);

    const handleAddToCart = (e, product) => {
        e.preventDefault();
        if (!user) {
            Swal.fire({ title: 'Authentication Required', text: 'Please sign in before adding items to the cart.', icon: 'warning', confirmButtonColor: '#3B6E1A' });
            navigate('/login');
            return;
        }
        addToCart(product, 1);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                const { data } = await axios.get(`${API_URL}/api/products`);
                if (Array.isArray(data)) {
                    setProducts(data); // fetch all for categorization
                } else if (data && Array.isArray(data.products)) {
                    setProducts(data.products);
                } else {
                    console.error("API did not return an array:", data);
                    setProducts([]);
                }

                // Fetch active coupons
                try {
                    const couponRes = await axios.get(`${API_URL}/api/coupons`);
                    setCoupons(couponRes.data.filter(c => c.isActive));
                } catch (err) {
                    console.error("Failed to fetch coupons:", err);
                }
            } catch (error) {
                console.error("Failed to fetch products:", error);
                setProducts([]);
            }
        };

        fetchProducts();
    }, []);

    const handleCheckDelivery = async (e) => {
        e.preventDefault();
        if(!postcode) return;
        setLoading(true);
        setError('');

        try {
            const res = await axios.get(`https://api.postcodes.io/postcodes/${encodeURIComponent(postcode)}`);
            if (res.data && res.data.result) {
                const { latitude, longitude } = res.data.result;
                const STORE_LAT = 51.5898;
                const STORE_LON = -0.3394;
                const distance = getDistanceFromLatLonInMiles(STORE_LAT, STORE_LON, latitude, longitude);

                if (distance <= 1.0) {
                    navigate('/search');
                } else {
                    setError('We are currently expanding. Your area will be available soon.');
                }
            } else {
                setError('Please enter a valid UK postcode.');
            }
        } catch (err) {
            setError('Please enter a valid UK postcode.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#60B3E6] to-[#A4E0F9] text-center overflow-x-hidden font-sans relative">
            {/* Background Clouds Pattern */}
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.4) 10%, transparent 11%), radial-gradient(circle at 80% 40%, rgba(255,255,255,0.4) 15%, transparent 16%), radial-gradient(circle at 50% 10%, rgba(255,255,255,0.3) 8%, transparent 9%)', backgroundSize: '100% 100%' }}></div>
            
            <div className="container mx-auto px-4 py-8 relative z-10 w-full">
                
                {/* Top UK App Banner */}
                <div className="bg-[#D91C2A] text-white font-bold text-sm md:text-xl py-2 px-8 uppercase tracking-widest mx-auto max-w-2xl transform shadow-lg mb-8 border-y-4 border-[#B01421] relative">
                    <div className="absolute top-0 right-full w-4 h-full bg-[#D91C2A] border-y-4 border-[#B01421]" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 50%)' }}></div>
                    <div className="absolute top-0 left-full w-4 h-full bg-[#D91C2A] border-y-4 border-[#B01421]" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 50%)' }}></div>
                    UK's FIRST LAST-MINUTE DELIVERY APP!
                </div>

                {/* Brand Logo Simulation */}
                <div className="mb-8 transform rotate-[-2deg] drop-shadow-2xl">
                    <div className="relative inline-block font-black text-6xl md:text-8xl tracking-tighter">
                        <span className="absolute inset-0 text-[#2E8B57] select-none scale-[1.03]" style={{ WebkitTextStroke: '20px #2E8B57' }}>Winkin</span>
                        <span className="relative text-white">Wink<span className="text-[#FFD100]">in</span></span>
                    </div>
                </div>

                <div className="bg-[#2E8B57] text-white font-bold text-sm md:text-2xl py-2 px-6 rounded-full mx-auto inline-block border-2 border-white shadow-xl relative -top-6">
                    Your Local Groceries, Delivered Fast!
                </div>

                {/* Red Ribbon Banner */}
                <div className="relative mb-8 max-w-4xl mx-auto flex justify-center mt-4">
                    <div className="absolute inset-0 bg-[#C31820] transform skew-x-[-10deg] shadow-2xl skew-y-1 z-0 rounded-lg"></div>
                    <div className="relative bg-[#D91C2A] text-white text-4xl md:text-6xl font-black py-4 px-12 z-10 border-y-4 border-[#B01421] shadow-2xl tracking-tight uppercase" style={{ textShadow: '3px 3px 0 #850E18' }}>
                        ORDER NOW & SAVE!
                    </div>
                </div>

                {/* Active Coupons Section */}
                {coupons.length > 0 && (
                    <div className="mb-12 max-w-5xl mx-auto bg-green-50 p-6 md:p-8 rounded-3xl border-4 border-green-600 shadow-[8px_8px_0_#16a34a] relative z-20 overflow-hidden transform rotate-[1deg]">
                        <div className="absolute -right-10 -top-10 text-8xl opacity-10">🎟️</div>
                        <h2 className="text-2xl md:text-3xl font-black text-green-800 mb-6 uppercase tracking-widest border-b-4 border-green-200 inline-block pb-1">
                            Current Offers
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            {coupons.map(coupon => (
                                <div key={coupon._id} className="bg-white border-4 border-dashed border-green-400 rounded-xl p-4 flex items-center justify-between min-w-[300px] flex-1 shadow-[4px_4px_0_#86efac] hover:-translate-y-1 hover:shadow-[6px_6px_0_#86efac] transition cursor-pointer">
                                    <div>
                                        <div className="text-green-600 font-black text-3xl">£{coupon.discount.toFixed(2)} OFF</div>
                                        <div className="text-gray-500 font-bold text-sm uppercase">Use code at checkout</div>
                                    </div>
                                    <div className="bg-green-100 text-green-800 px-6 py-3 rounded-lg font-black tracking-widest text-2xl border-2 border-green-300 shadow-inner">
                                        {coupon.code}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Unified Premium Promo Banner */}
                <div className="max-w-6xl mx-auto mb-16 relative z-20 px-4">
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.15)] border-4 border-[#3B6E1A] relative overflow-hidden flex flex-col items-center justify-center text-center gap-8">
                        {/* Background Decor */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#FFD100] rounded-full mix-blend-multiply filter blur-3xl opacity-50 pointer-events-none"></div>
                        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#5C9E31] rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
                        
                        {/* Promoted Content - Speed Guarantee */}
                        <div className="w-full relative z-10">
                            <div className="inline-flex items-center gap-2 bg-black text-[#FFD100] font-black text-xs md:text-sm py-1.5 px-4 rounded-full uppercase tracking-widest mb-4 shadow-md">
                                <span className="animate-pulse">⏱️</span> Delivered In
                            </div>
                            <h2 className="text-5xl md:text-7xl font-black text-gray-900 leading-none tracking-tighter mb-2" style={{ textShadow: '2px 2px 0px #FFD100' }}>
                                20 MINUTES
                            </h2>
                            <div className="bg-[#D91C2A] text-white text-2xl md:text-3xl font-black py-2 px-6 inline-block uppercase mt-1 shadow-[4px_4px_0_#850E18] rounded-xl transform -rotate-2">
                                OR IT'S FREE!
                            </div>
                        </div>


                    </div>
                </div>

                {/* Postal Code Checking Form */}
                <div className="max-w-xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-[0_20px_0_#2E8B57] border-[6px] border-[#3B6E1A] mb-16 relative z-30">
                    <h3 className="text-2xl md:text-3xl font-black text-[#3B6E1A] mb-6 uppercase text-center flex items-center justify-center gap-2">
                        Enter your destination and start shopping
                    </h3>
                    <form onSubmit={handleCheckDelivery} className="flex flex-col gap-4">
                        <input
                            type="text"
                            placeholder="Enter Postcode (e.g. HA1 1AA)"
                            value={postcode}
                            onChange={(e) => setPostcode(e.target.value)}
                            className="w-full text-center px-4 py-4 rounded-xl border-4 border-gray-300 text-2xl font-bold uppercase focus:outline-none focus:border-[#D91C2A] focus:ring-4 focus:ring-[#D91C2A]/20 text-gray-800 transition"
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !postcode}
                            className="bg-[#D91C2A] text-white text-3xl font-black py-5 rounded-xl shadow-[0_8px_0_#850E18] hover:translate-y-1 hover:shadow-[0_4px_0_#850E18] active:translate-y-3 active:shadow-[0_0px_0_#850E18] transition disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-wide border-2 border-[#850E18]"
                        >
                            {loading ? 'Checking...' : 'Start Shopping!'} <span className="text-4xl filter drop-shadow">🛵</span>
                        </button>
                    </form>
                    {error && (
                        <div className="mt-6 p-4 bg-red-100 border-4 border-red-500 text-[#D91C2A] font-bold rounded-xl text-lg animate-pulse">
                            {error}
                        </div>
                    )}
                </div>

                {/* Categories Grid */}
                <div className="mb-16 mt-12 bg-white p-6 md:p-10 rounded-3xl shadow-[0_20px_0_#2E8B57] border-[6px] border-[#3B6E1A] relative z-20">
                    <h2 className="text-3xl md:text-5xl font-black text-[#3B6E1A] mb-8 uppercase text-center tracking-tighter" style={{ textShadow: '2px 2px 0 #FFD100' }}>
                        Shop By Category
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {['Snacks', 'Drinks', 'Alcohol', 'Grocery', 'Cleaning', 'Ice Cream', 'Bakery', 'Beauty'].map((cat, idx) => (
                            <Link to={`/search?category=${cat}`} key={cat} className="group cursor-pointer block transform hover:scale-105 transition-transform duration-200">
                                <div className={`h-32 md:h-48 rounded-2xl p-4 md:p-6 text-center border-[4px] border-black flex flex-col items-center justify-center shadow-[4px_4px_0_#000] ${idx % 2 === 0 ? 'bg-[#FFD100]' : 'bg-[#60B3E6]'}`}>
                                    <div className="w-12 h-12 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center text-3xl md:text-4xl mb-3 border-4 border-black shadow-inner">
                                        {cat === 'Snacks' && '🍿'}
                                        {cat === 'Drinks' && '🥤'}
                                        {cat === 'Alcohol' && '🍺'}
                                        {cat === 'Grocery' && '🥑'}
                                        {cat === 'Cleaning' && '🧼'}
                                        {cat === 'Ice Cream' && '🍦'}
                                        {cat === 'Bakery' && '🥐'}
                                        {cat === 'Beauty' && '💄'}
                                    </div>
                                    <h3 className="text-lg md:text-2xl font-black text-black tracking-tight uppercase leading-tight">{cat}</h3>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Top Sellers Grid */}
                {Array.isArray(products) && products.length > 0 && (
                    <div className="mb-16 relative z-20">
                        <h2 className="text-3xl md:text-5xl font-black text-[#3B6E1A] mb-10 uppercase text-center tracking-tighter inline-block relative border-4 border-black bg-white px-8 py-4 shadow-[8px_8px_0_#000] rotate-[1deg]">
                            Most Ordered <span className="text-black">🏆</span>
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {products.slice(0, 4).map((product) => (
                                <div key={`top-${product._id}`} className="bg-white rounded-2xl overflow-hidden border-[4px] border-[#3B6E1A] shadow-[6px_6px_0_#3B6E1A] flex flex-col group hover:-translate-y-2 transition-transform duration-300">
                                    <Link to={`/product/${product._id}`} className="block relative aspect-square p-6 bg-gray-50 border-b-[4px] border-[#3B6E1A]">
                                        <div className="absolute top-2 left-2 bg-[#D91C2A] text-white font-black px-3 py-1 text-sm border-2 border-black rotate-[-5deg] z-10 shadow-sm">
                                            BEST SELLER
                                        </div>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300 ease-out drop-shadow-md relative z-0"
                                        />
                                    </Link>
                                    <div className="p-4 md:p-5 flex flex-col flex-grow text-left">
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-900 md:text-lg leading-tight mb-1 line-clamp-2">
                                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                                            </h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase">{product.brand}</p>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="font-black text-2xl md:text-3xl text-[#3B6E1A]">£{product.price.toFixed(2)}</span>
                                            <button onClick={(e) => handleAddToCart(e, product)} className="bg-[#D91C2A] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-2xl md:text-3xl border-[3px] border-black shadow-[0_4px_0_#000] hover:translate-y-1 hover:shadow-[0_2px_0_#000] active:translate-y-2 active:shadow-none transition">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Trending Products Grid */}
                {Array.isArray(products) && products.length > 4 && (
                    <div className="mb-20 relative z-20">
                        <h2 className="text-3xl md:text-5xl font-black text-[#D91C2A] mb-10 uppercase text-center tracking-tighter inline-block relative border-4 border-black bg-[#FFD100] px-8 py-4 shadow-[8px_8px_0_#000] rotate-[-2deg]">
                            Trending Near You <span className="text-black">🔥</span>
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {products.slice(4, 12).map((product) => (
                                <div key={`trend-${product._id}`} className="bg-white rounded-2xl overflow-hidden border-[4px] border-black shadow-[6px_6px_0_#000] flex flex-col group hover:-translate-y-2 transition-transform duration-300">
                                    <Link to={`/product/${product._id}`} className="block relative aspect-square p-6 bg-gray-50 border-b-[4px] border-black">
                                        <div className="absolute top-2 left-2 bg-[#FFD100] text-black font-black px-3 py-1 text-sm border-2 border-black rotate-[3deg] z-10 shadow-sm">
                                            HOT
                                        </div>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition duration-300 ease-out drop-shadow-md"
                                        />
                                    </Link>
                                    <div className="p-4 md:p-5 flex flex-col flex-grow text-left">
                                        <div className="flex-grow">
                                            <h3 className="font-bold text-gray-900 md:text-lg leading-tight mb-1 line-clamp-2">
                                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                                            </h3>
                                            <p className="text-xs text-gray-500 font-bold uppercase">{product.brand}</p>
                                        </div>
                                        <div className="mt-4 flex justify-between items-center">
                                            <span className="font-black text-2xl md:text-3xl text-[#3B6E1A]">£{product.price.toFixed(2)}</span>
                                            <button onClick={(e) => handleAddToCart(e, product)} className="bg-[#D91C2A] text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black text-2xl md:text-3xl border-[3px] border-black shadow-[0_4px_0_#000] hover:translate-y-1 hover:shadow-[0_2px_0_#000] active:translate-y-2 active:shadow-none transition">
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category-Wise Product Breakdown */}
                {Array.isArray(products) && products.length > 0 && (
                    <div className="space-y-16 relative z-20 mb-20 max-w-7xl mx-auto">
                        {['Snacks', 'Drinks', 'Alcohol', 'Grocery', 'Cleaning', 'Ice Cream', 'Bakery', 'Beauty'].map(cat => {
                            const catProducts = products.filter(p => p.category === cat);
                            if (catProducts.length === 0) return null;
                            
                            return (
                                <div key={cat} className="bg-white p-6 md:p-10 rounded-3xl border-[6px] border-[#3B6E1A] shadow-[8px_8px_0_#2E8B57] relative">
                                    <div className="flex justify-between items-end mb-8 border-b-4 border-dashed border-gray-200 pb-4">
                                        <h2 className="text-4xl font-black text-[#D91C2A] uppercase tracking-tighter" style={{ textShadow: '2px 2px 0 #FFD100' }}>
                                            {cat} Aisle
                                        </h2>
                                        <Link to={`/search?category=${cat}`} className="text-[#3B6E1A] font-bold text-xl hover:underline uppercase tracking-wide">
                                            View All &rarr;
                                        </Link>
                                    </div>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                        {catProducts.slice(0, 4).map(product => (
                                            <div key={product._id} className="bg-white rounded-2xl overflow-hidden border-[4px] border-black shadow-[4px_4px_0_#000] flex flex-col group hover:-translate-y-1 transition-transform duration-300">
                                                <Link to={`/product/${product._id}`} className="block relative aspect-square p-4 bg-gray-50 border-b-[4px] border-black">
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition duration-300" />
                                                </Link>
                                                <div className="p-4 flex flex-col flex-grow text-left">
                                                    <div className="flex-grow">
                                                        <h3 className="font-bold text-gray-900 leading-tight mb-1 line-clamp-2">
                                                            <Link to={`/product/${product._id}`}>{product.name}</Link>
                                                        </h3>
                                                        <p className="text-xs text-gray-500 font-bold uppercase">{product.brand}</p>
                                                    </div>
                                                    <div className="mt-3 flex justify-between items-center">
                                                        <span className="font-black text-2xl text-[#3B6E1A]">£{product.price.toFixed(2)}</span>
                                                        <button onClick={(e) => handleAddToCart(e, product)} className="bg-[#D91C2A] text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-2xl border-[3px] border-black shadow-[0_3px_0_#000] hover:translate-y-1 hover:shadow-none transition">
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Bottom Footer Callout */}
                <div className="bg-[#00883A] text-white font-black text-2xl md:text-4xl py-6 mx-auto w-full md:w-[80%] transform skew-x-[-10deg] shadow-2xl border-y-4 border-[#005a26] tracking-tighter uppercase mb-2">
                    SUPPORTING YOUR LOCAL SHOPS!
                </div>
            </div>
            
            <div className="w-full bg-[#1A1A1A] text-white py-12 text-center text-xl font-bold uppercase relative z-10 border-t-8 border-[#D91C2A]">
                Download the app & Start Saving!
            </div>
        </div>
    );
};

export default HomePage
