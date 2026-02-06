import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Minus, Plus, ShoppingBag } from 'lucide-react';
import CartContext from '../context/CartContext';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [qty, setQty] = useState(1);
    const [loading, setLoading] = useState(true);

    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
                setProduct(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id]);

    const addToCartHandler = () => {
        addToCart(product, qty);
        // Optionally show toast or redirect
    };

    if (loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div className="container mx-auto px-4 py-10">
            <Link to="/" className="text-gray-500 hover:text-black mb-6 inline-block">
                &larr; Back to Home
            </Link>

            <div className="grid md:grid-cols-2 gap-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border flex items-center justify-center">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-[400px] object-contain"
                    />
                </div>

                <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                    <div className="flex items-center space-x-4 mb-6">
                        <span className="text-2xl font-bold text-blue-600">${product.price}</span>
                        <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm">
                            {product.brand}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm ${product.countInStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <p className="text-gray-700 text-lg leading-relaxed mb-8">
                        {product.description}
                    </p>

                    <div className="flex items-center space-x-6 border-t pt-8">
                        <div className="flex items-center border rounded-full px-4 py-2 bg-white">
                            <button
                                onClick={() => setQty(Math.max(1, qty - 1))}
                                className="p-2 hover:text-blue-600"
                            >
                                <Minus size={20} />
                            </button>
                            <span className="mx-4 font-bold text-xl w-6 text-center">{qty}</span>
                            <button
                                onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                                className="p-2 hover:text-blue-600"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <button
                            onClick={addToCartHandler}
                            disabled={product.countInStock === 0}
                            className="flex-1 bg-blue-600 text-white py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ShoppingBag size={24} />
                            <span>Add to Bag</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
