import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, ShoppingBag, Truck, ChevronRight } from 'lucide-react';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const location = useLocation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get(`/api/products`);
                setProducts(data.slice(0, 8)); // Grab top 8
            } catch (error) {
                console.error("Failed to fetch products:", error);
            }
        };

        fetchProducts();
    }, []);

    // Animation Variants
    const staggerContainer = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariant = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
    };

    return (
        <div className="bg-[#050505] min-h-screen text-white font-sans overflow-x-hidden selection:bg-pink-500 selection:text-white pb-20">
            {/* --- HERO SECTION --- */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                {/* Abstract Ambient Glows */}
                <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-pink-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
                <div className="absolute bottom-[20%] right-[15%] w-[35vw] h-[35vw] max-w-[400px] max-h-[400px] bg-purple-700 rounded-full mix-blend-screen filter blur-[120px] opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] left-[50%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] bg-[#00ADEF] rounded-full mix-blend-screen filter blur-[150px] opacity-20 transform -translate-x-1/2"></div>
                
                {/* Mesh Texture Overlay (Optional, uses simple CSS grid lines) */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                <div className="container mx-auto px-4 z-10 flex flex-col items-center text-center mt-12">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-8 shadow-2xl"
                    >
                        <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-ping absolute"></span>
                        <span className="flex h-2 w-2 rounded-full bg-pink-500 relative ml-1"></span>
                        <span className="text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-pink-400 to-[#00ADEF] bg-clip-text text-transparent ml-2">Experience Winkin 2.0</span>
                    </motion.div>

                    <motion.h1 
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-[1.1]"
                    >
                        Superfast delivery.<br/>
                        <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-[#00ADEF] bg-clip-text text-transparent">Magic </span>
                        at your door.
                    </motion.h1>

                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="text-lg md:text-2xl text-gray-400 mb-10 max-w-2xl font-light"
                    >
                        Groceries, drinks, and daily essentials delivered into your hands in minutes. Elevate your everyday with Winkin.
                    </motion.p>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                        className="w-full max-w-xl relative group"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-[#00ADEF] rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex bg-[#111] border border-white/10 p-2 rounded-full shadow-2xl backdrop-blur-xl">
                            <input
                                type="text"
                                placeholder="Enter your delivery address..."
                                className="flex-1 px-6 py-4 rounded-full bg-transparent text-white focus:outline-none placeholder-gray-500 text-lg"
                            />
                            <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform duration-300 flex items-center gap-2">
                                Start Shopping <ChevronRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Abstract Elements */}
                <motion.div 
                    animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }} 
                    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="hidden lg:flex absolute top-1/4 right-[10%] w-24 h-24 bg-gradient-to-br from-pink-500 to-orange-400 rounded-3xl shadow-2xl items-center justify-center text-5xl transform rotate-12 backdrop-blur-md border border-white/20"
                >
                    🥑
                </motion.div>
                <motion.div 
                    animate={{ y: [0, 30, 0], rotate: [0, -10, 0] }} 
                    transition={{ repeat: Infinity, duration: 8, ease: "easeInOut", delay: 1 }}
                    className="hidden lg:flex absolute bottom-1/3 left-[15%] w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full shadow-2xl items-center justify-center text-4xl backdrop-blur-md border border-white/20"
                >
                    🥤
                </motion.div>
            </section>

            {/* --- FEATURES GRID --- */}
            <section className="py-24 relative z-20 -mt-10">
                <div className="container mx-auto px-4">
                    <motion.div 
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, margin: "-100px" }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {[
                            { icon: <ShoppingBag size={28} className="text-pink-400" />, title: "Endless Selection", desc: "Thousands of items from fresh produce to tech gadgets." },
                            { icon: <Zap size={28} className="text-[#00ADEF]" />, title: "Lightning Fast", desc: "Advanced logistics routing ensures delivery in mere minutes." },
                            { icon: <Truck size={28} className="text-purple-400" />, title: "Winkin+', Premium", desc: "Join our membership for zero delivery fees on eligible orders." }
                        ].map((feature, idx) => (
                            <motion.div 
                                key={idx}
                                variants={itemVariant}
                                whileHover={{ scale: 1.02, y: -5 }}
                                className="bg-white/5 backdrop-blur-lg border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors duration-300 group"
                            >
                                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* --- CATEGORIES MASONRY --- */}
            <section className="py-24 relative">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-16 md:flex md:justify-between md:items-end"
                    >
                        <div>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Explore Aisle</h2>
                            <p className="text-gray-400 text-lg max-w-xl">Curated perfectly for whatever you need, whenever you need it most.</p>
                        </div>
                        <Link to="/search" className="hidden md:flex items-center text-[#00ADEF] font-semibold hover:text-white transition-colors group">
                            View All Categories <ChevronRight size={20} className="ml-1 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        {['🚀 Snacks', '💧 Drinks', '🍷 Alcohol', '🥦 Grocery', '🧼 Cleaning', '🍦 Ice Cream', '🍕 Quick Meals', '💄 Beauty'].map((cat, idx) => {
                            const isLarge = idx === 0 || idx === 3; // Make some items span larger
                            const catName = cat.split(' ')[1];
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileHover={{ scale: 1.03 }}
                                    className={`relative rounded-[2rem] overflow-hidden cursor-pointer group bg-gradient-to-br ${
                                        idx % 3 === 0 ? 'from-[#1a1a2e] to-[#16213e]' : 
                                        idx % 2 === 0 ? 'from-[#0f2027] to-[#203a43]' : 
                                        'from-[#2c001e] to-[#1a1a1a]'
                                    } ${isLarge ? 'md:col-span-2 md:row-span-2 aspect-[2/1] md:aspect-square' : 'aspect-square'} border border-white/5 hover:border-white/20 transition-all duration-500`}
                                >
                                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500"></div>
                                    <div className="absolute bottom-6 left-6 right-6">
                                        <div className="text-4xl md:text-6xl mb-4 transform group-hover:-translate-y-2 transition-transform duration-500 drop-shadow-2xl">{cat.split(' ')[0]}</div>
                                        <h3 className="text-xl md:text-3xl font-bold tracking-tight text-white/90 group-hover:text-white">{catName}</h3>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- TRENDING PRODUCTS --- */}
            <section className="py-24 bg-[#0a0a0a] border-t border-white/5">
                <div className="container mx-auto px-4">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-12"
                    >
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-4 text-white">Trending Near You</h2>
                        <div className="h-1 w-20 bg-gradient-to-r from-pink-500 to-[#00ADEF] rounded-full"></div>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
                        {products.map((product, idx) => (
                            <motion.div 
                                key={product._id} 
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: idx * 0.1 }}
                                className="group"
                            >
                                <div className="aspect-square bg-[#111] rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition duration-300 relative">
                                    <Link to={`/product/${product._id}`} className="block h-full w-full p-6">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-110 transition duration-700 ease-out drop-shadow-2xl"
                                        />
                                    </Link>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none"></div>
                                    <button className="absolute bottom-4 right-4 bg-white text-black w-12 h-12 flex items-center justify-center rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0 hover:scale-110">
                                        <span className="text-2xl font-light mb-1">+</span>
                                    </button>
                                </div>
                                <div className="mt-5">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors">
                                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                                        </div>
                                        <span className="font-bold text-lg text-white">${product.price}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- APP BANNER --- */}
            <section className="py-24 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="bg-gradient-to-r from-[#111] to-[#0a0a0a] rounded-[3rem] border border-white/10 p-10 md:p-20 relative overflow-hidden">
                        {/* Glows inside banner */}
                        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00ADEF] opacity-20 rounded-full blur-[100px] transform translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 opacity-10 rounded-full blur-[100px] transform -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center relative z-10">
                            <div className="md:w-1/2 mb-12 md:mb-0">
                                <motion.h2 
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight leading-tight"
                                >
                                    The entire store, <br/> in your pocket.
                                </motion.h2>
                                <motion.p 
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.2 }}
                                    className="text-xl text-gray-400 mb-10 max-w-lg"
                                >
                                    Download the Winkin app for exclusive deals, hyper-fast checkout, and real-time live delivery tracking.
                                </motion.p>
                                <motion.div 
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 }}
                                    className="flex flex-col sm:flex-row gap-4"
                                >
                                    <button className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition flex items-center justify-center gap-3">
                                        <span className="inline-block w-5 h-5 bg-black rounded-sm" style={{ clipPath: 'polygon(50% 0%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></span> App Store
                                    </button>
                                    <button className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full font-bold hover:bg-white/20 transition flex items-center justify-center gap-3 backdrop-blur-md">
                                        <span className="text-xl">▶</span> Google Play
                                    </button>
                                </motion.div>
                            </div>

                            <div className="md:w-1/2 flex justify-center relative">
                                <motion.div 
                                    initial={{ opacity: 0, y: 50 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    className="relative"
                                >
                                    {/* Abstract Premium Phone Mockup */}
                                    <div className="w-[300px] h-[600px] bg-black rounded-[3rem] border-[6px] border-gray-800 shadow-[0_0_50px_rgba(0,173,239,0.3)] relative overflow-hidden flex flex-col z-20">
                                        <div className="absolute top-0 inset-x-0 h-7 bg-black z-30 rounded-t-[2.5rem] flex justify-center">
                                            <div className="w-1/3 h-5 bg-black rounded-b-[1rem] mt-0"></div>
                                        </div>
                                        
                                        <div className="flex-1 overflow-hidden relative bg-[#050505]">
                                            {/* Mockup UI Inner Glow */}
                                            <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500 blur-[50px] opacity-30"></div>
                                            
                                            <div className="p-6 pt-16 space-y-6">
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="w-24 h-6 bg-white/10 rounded-full animate-pulse"></div>
                                                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse"></div>
                                                </div>
                                                <div className="h-40 w-full bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-2xl border border-white/5 relative overflow-hidden">
                                                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="h-28 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="h-28 bg-white/5 rounded-2xl border border-white/5 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                                <div className="h-14 w-full bg-[#00ADEF] rounded-2xl mt-8 flex items-center justify-center shadow-[0_0_20px_rgba(0,173,239,0.5)]">
                                                    <div className="w-1/3 h-2 bg-white/50 rounded-full"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating elements around phone */}
                                    <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -left-12 top-1/4 w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl z-30 flex items-center justify-center p-3 shadow-2xl">
                                        <div className="w-full h-full bg-pink-500 rounded-lg opacity-80"></div>
                                    </motion.div>
                                    <motion.div animate={{ y: [10, -10, 10] }} transition={{ repeat: Infinity, duration: 5 }} className="absolute -right-8 bottom-1/3 w-16 h-16 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full z-30 shadow-2xl flex items-center justify-center">
                                        <span className="text-2xl">⚡</span>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
