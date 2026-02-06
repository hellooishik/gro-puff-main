import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';

const SearchPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    // Extract filtering parameters for display title
    const searchParams = new URLSearchParams(location.search);
    const keyword = searchParams.get('keyword');
    const category = searchParams.get('category');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/api/products${location.search}`);
                setProducts(data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
            setLoading(false);
        };

        fetchProducts();
    }, [location.search]);

    const getTitle = () => {
        if (category) return `Category: ${category}`;
        if (keyword) return `Search Results for "${keyword}"`;
        return 'All Products';
    };

    return (
        <div className="bg-white min-h-screen py-12">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-[#2E2E2E]">{getTitle()}</h1>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00ADEF]"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="text-center py-20">
                        <h2 className="text-2xl font-semibold text-gray-600">No products found.</h2>
                        <p className="text-gray-500 mt-2">Try adjusting your search or category.</p>
                        <Link to="/" className="inline-block mt-6 bg-[#00ADEF] text-white px-6 py-3 rounded-full font-bold hover:bg-[#0092ca] transition">
                            Back to Home
                        </Link>
                    </div>
                ) : (
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
                )}
            </div>
        </div>
    );
};

export default SearchPage;
