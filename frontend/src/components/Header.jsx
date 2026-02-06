import { Link } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { ShoppingBag, User, LogOut } from 'lucide-react';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const { cartItems } = useContext(CartContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const totalQty = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                {/* Logo */}
                <Link to="/" className="text-3xl font-extrabold tracking-tighter text-[#00ADEF] mr-8">
                    gopuff
                </Link>

                {/* Search Bar - Hidden on mobile, visible on md */}
                <div className="hidden md:flex flex-1 max-w-2xl relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search for chips, drinks, ice cream..."
                        className="w-full pl-10 pr-4 py-2.5 rounded-full bg-gray-100 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#00ADEF] focus:bg-white transition-colors"
                    />
                </div>

                {/* Nav Icons */}
                <nav className="flex items-center space-x-4 md:space-x-6 ml-4">
                    {user ? (
                        <div className="hidden md:flex items-center space-x-4">
                            <div className="text-sm">
                                <span className="text-gray-500 block text-xs">Welcome</span>
                                <span className="font-semibold text-gray-800">{user.name}</span>
                            </div>
                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard" className="text-[#00ADEF] text-sm font-semibold hover:underline">
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={logout}
                                className="text-gray-500 hover:text-[#00ADEF] transition"
                            >
                                <LogOut size={22} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="flex items-center space-x-1 text-gray-600 hover:text-[#00ADEF] font-medium">
                            <User size={22} />
                            <span className="hidden md:inline">Sign In</span>
                        </Link>
                    )}

                    <Link to="/cart" className="relative flex items-center bg-[#00ADEF] text-white px-4 py-2 rounded-full hover:bg-[#0092ca] transition shadow-md">
                        <span className="font-bold mr-2">${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
                        <ShoppingBag size={20} />
                        {totalQty > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                                {totalQty}
                            </span>
                        )}
                    </Link>
                </nav>
            </div>
            {/* Mobile Search - Helper below header if needed, or simple menu */}
        </header>
    );
};

export default Header;
