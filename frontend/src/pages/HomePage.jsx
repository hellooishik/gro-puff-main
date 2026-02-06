import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const location = useLocation();
    const keyword = new URLSearchParams(location.search).get('keyword');

    useEffect(() => {
        const fetchProducts = async () => {
            const { data } = await axios.get(`/api/products`);
            setProducts(data); // In a real app we might limit this to top 8 or 'featured'
        };

        fetchProducts();
    }, []);

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Hero Section */}
            <section className="bg-[#00ADEF] min-h-[500px] flex items-center relative overflow-hidden">
                <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center z-10 py-12">
                    <div className="text-white space-y-6">
                        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
                            Super-fast groceries at supermarket prices.
                        </h1>
                        <p className="text-xl font-medium opacity-90">
                            Delivered in minutes. No hidden fees.
                        </p>

                        <div className="bg-white p-2 rounded-full flex max-w-md shadow-2xl">
                            <input
                                type="text"
                                placeholder="Enter your address"
                                className="flex-1 px-6 py-3 rounded-full text-gray-800 focus:outline-none"
                            />
                            <button className="bg-[#2E2E2E] text-white px-8 py-3 rounded-full font-bold hover:bg-black transition">
                                Go
                            </button>
                        </div>
                    </div>
                    {/* Hero Image Mockup */}
                    <div className="hidden md:block relative">
                        {/* Placeholder for vibrant hero image */}
                        <div className="bg-yellow-400 rounded-full w-96 h-96 absolute -top-10 -right-10 opacity-20 blur-3xl"></div>
                        <div className="relative z-10 bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 shadow-xl transform rotate-3 hover:rotate-0 transition duration-500">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-red-500 h-32 rounded-xl flex items-center justify-center text-white font-bold">Ice Cream</div>
                                <div className="bg-green-500 h-32 rounded-xl flex items-center justify-center text-white font-bold">Snacks</div>
                                <div className="bg-purple-500 h-32 rounded-xl flex items-center justify-center text-white font-bold">Drinks</div>
                                <div className="bg-orange-500 h-32 rounded-xl flex items-center justify-center text-white font-bold">Alcohol</div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Wave/Curve separator could go here */}
            </section>

            {/* Features / Value Prop */}
            <section className="py-12 bg-gray-50 border-b">
                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="p-6">
                        <div className="text-4xl mb-4">🛍️</div>
                        <h3 className="text-xl font-bold mb-2">Thousands of items</h3>
                        <p className="text-gray-500">Cleaning items, OTC meds, food, drinks, electronics, baby essentials & more.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-4xl mb-4">⚡</div>
                        <h3 className="text-xl font-bold mb-2">Delivered fast</h3>
                        <p className="text-gray-500">Early morning or late night, we deliver in minutes.</p>
                    </div>
                    <div className="p-6">
                        <div className="text-4xl mb-4">🚚</div>
                        <h3 className="text-xl font-bold mb-2">Free delivery with Fam</h3>
                        <p className="text-gray-500">Join our Fam subscription service for unlimited free delivery on eligible orders.</p>
                    </div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container mx-auto px-4 py-16">
                <h2 className="text-4xl font-extrabold text-center mb-12 text-[#2E2E2E]">Browse popular categories</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {['Snacks', 'Drinks', 'Alcohol', 'Grocery', 'Cleaning', 'Ice Cream', 'Quick Meals', 'Bath & Beauty'].map((cat) => (
                        <Link to={`/search?category=${cat}`} key={cat} className="group cursor-pointer block">
                            <div className="bg-[#F1F1F1] rounded-2xl p-8 text-center hover:bg-white hover:shadow-xl transition duration-300 border border-transparent hover:border-gray-100 flex flex-col items-center justify-center h-48">
                                {/* Cat Placeholder Image */}
                                <div className={`w-20 h-20 mb-4 rounded-full flex items-center justify-center text-2xl
                                    ${cat === 'Snacks' ? 'bg-orange-100 text-orange-600' : ''}
                                    ${cat === 'Drinks' ? 'bg-red-100 text-red-600' : ''}
                                    ${cat === 'Alcohol' ? 'bg-purple-100 text-purple-600' : ''}
                                    ${cat === 'Grocery' ? 'bg-green-100 text-green-600' : ''}
                                `}>
                                    {cat === 'Snacks' && '🍟'}
                                    {cat === 'Drinks' && '🥤'}
                                    {cat === 'Alcohol' && '🍺'}
                                    {cat === 'Grocery' && '🥑'}
                                    {cat === 'Cleaning' && '🧹'}
                                    {cat === 'Ice Cream' && '🍦'}
                                    {cat === 'Quick Meals' && '🍕'}
                                    {cat === 'Bath & Beauty' && '💄'}
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">{cat}</h3>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-12">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8 text-[#2E2E2E]">Trending Near You</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                        {products.map((product) => (
                            <div key={product._id} className="group relative">
                                <div className="aspect-square bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition">
                                    <Link to={`/product/${product._id}`} className="block h-full w-full p-4">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                                        />
                                    </Link>
                                    <button className="absolute bottom-3 right-3 bg-[#00ADEF] text-white p-2 rounded-full shadow opacity-0 group-hover:opacity-100 transition translate-y-2 group-hover:translate-y-0">
                                        <span className="text-xl">+</span>
                                    </button>
                                </div>
                                <div className="mt-3">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900 leading-tight">
                                                <Link to={`/product/${product._id}`}>{product.name}</Link>
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">{product.brand}</p>
                                        </div>
                                        <span className="font-bold text-gray-900">${product.price}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* App Banner */}
            <section className="bg-[#00ADEF] py-20 text-white overflow-hidden relative">
                <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
                    <div className="md:w-1/2 mb-10 md:mb-0 z-10">
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6">Get the FreshPro App</h2>
                        <p className="text-xl mb-8 opacity-90 max-w-lg">
                            Shop faster and get exclusive deals on our mobile app. Coming soon to iOS and Android.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button className="bg-black text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2 shadow-lg">
                                <span></span> Download on App Store
                            </button>
                            <button className="bg-black text-white px-8 py-3.5 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2 shadow-lg">
                                <span>▶</span> Get it on Google Play
                            </button>
                        </div>
                    </div>

                    <div className="md:w-1/2 flex justify-center relative z-10">
                        {/* Abstract Phone Mockup */}
                        <div className="w-72 h-[500px] bg-black rounded-[3rem] border-[8px] border-gray-800 shadow-2xl relative overflow-hidden flex flex-col">
                            <div className="h-8 bg-gray-800 w-40 mx-auto rounded-b-xl absolute top-0 left-1/2 transform -translate-x-1/2 z-20"></div>
                            <div className="bg-white flex-1 pt-12 px-4 pb-4 overflow-hidden relative">
                                <div className="bg-[#F3F4F6] w-full h-full rounded-2xl p-4 space-y-4">
                                    <div className="h-8 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                    <div className="h-32 w-full bg-blue-100 rounded-xl animate-pulse"></div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                                        <div className="h-24 bg-gray-200 rounded-xl animate-pulse"></div>
                                    </div>
                                    <div className="h-10 w-full bg-blue-500 rounded-full mt-auto animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl transform -translate-x-1/3 translate-y-1/3"></div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
