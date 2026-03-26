import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { ShoppingBag, LogOut } from 'lucide-react';

const Header = () => {
    const auth = useContext(AuthContext);
    const { user, logout } = auth || {};
    const cart = useContext(CartContext);
    const { cartItems } = cart || { cartItems: [] };

    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const totalQty = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
    const totalPrice = cartItems ? cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2) : '0.00';

    const handleSearch = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            navigate(`/search?keyword=${keyword}`);
        } else {
            navigate('/search');
        }
    };

    return (
        <header className="bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] sticky top-0 z-50 shadow-[0_4px_0_#4CAF50] border-b-[8px] border-[#2E8B57] relative overflow-hidden">
            {/* Decorative Countryside Elements */}
            <div className="absolute top-2 left-8 text-white text-5xl opacity-90 pointer-events-none animate-pulse">☁️</div>
            <div className="absolute top-4 right-1/4 text-white text-4xl opacity-80 pointer-events-none">☁️</div>
            <div className="absolute top-1 right-12 text-[#FFD100] text-6xl opacity-90 pointer-events-none" style={{ filter: 'drop-shadow(0 0 10px #FFD100)' }}>☀️</div>
            <div className="absolute -bottom-3 left-1/4 text-6xl pointer-events-none drop-shadow-md">🌳</div>
            <div className="absolute -bottom-2 right-1/3 text-5xl pointer-events-none drop-shadow-md">🌻</div>
            <div className="absolute -bottom-1 left-2 text-4xl pointer-events-none">🌾</div>

            <div className="container mx-auto px-4 py-4 flex justify-between items-center relative z-10">
                {/* Logo */}
                <Link to="/" className="mr-8 flex items-center transform hover:scale-105 transition-transform duration-300">
                    <span className="relative inline-block font-black text-4xl md:text-5xl tracking-tighter rotate-[-4deg] drop-shadow-lg">
                        <span className="absolute inset-0 text-[#2E8B57] select-none" style={{ WebkitTextStroke: '6px #2E8B57' }}>Winkin</span>
                        <span className="relative text-white drop-shadow-sm">Wink<span className="text-[#FFD100]">in</span></span>
                    </span>
                </Link>

                {/* Search Bar - Hidden on mobile, visible on md */}
                <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-3xl relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-6 w-6 text-[#2E8B57] group-focus-within:text-[#D91C2A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </div>
                    <input
                        type="text"
                        name="keyword"
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Search for farm fresh produce, snacks, drinks..."
                        className="w-full pl-12 pr-4 py-3 rounded-full bg-white/95 border-4 border-[#4CAF50] text-[#2E8B57] font-bold text-lg focus:outline-none focus:border-[#D91C2A] focus:ring-4 focus:ring-[#D91C2A]/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)] placeholder-[#4CAF50]/60"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#FFD100] text-black font-black px-5 py-2 rounded-full border-[3px] border-black shadow-[0_3px_0_#000] hover:translate-y-px hover:shadow-[0_2px_0_#000] active:translate-y-1 active:shadow-none transition-all tracking-wide text-lg">
                        GO!
                    </button>
                </form>

                {/* Nav Icons */}
                <nav className="flex items-center space-x-4 md:space-x-6 ml-6">
                    {user ? (
                        <div className="hidden md:flex items-center space-x-4 bg-white/70 px-4 py-2 rounded-full border-4 border-[#4CAF50] shadow-sm transform hover:scale-105 transition-transform">
                            <div className="text-right leading-tight">
                                <span className="text-[#2E8B57] font-black uppercase text-[10px] tracking-wider block">Howdy,</span>
                                <span className="font-black text-gray-900 text-sm">{user.name}</span>
                            </div>
                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard" className="text-white bg-[#2E8B57] text-xs font-black uppercase px-3 py-1.5 rounded-md border-2 border-black hover:bg-[#1e5c39] transition shadow-[0_2px_0_#000]">
                                    Admin
                                </Link>
                            )}
                            <Link to="/profile" className="text-[#D91C2A] text-sm font-black hover:underline uppercase tracking-wide">
                                Profile
                            </Link>
                            <button
                                onClick={logout}
                                className="text-white bg-gray-800 hover:bg-[#D91C2A] p-2 rounded-full transition shadow-[0_2px_0_#000] border-2 border-black active:translate-y-1 active:shadow-none"
                                title="Log Out"
                            >
                                <LogOut size={16} strokeWidth={3} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-[#005a26] hover:text-[#D91C2A] font-black uppercase tracking-wide hidden md:block drop-shadow-sm text-lg">
                                Log In
                            </Link>
                            <Link to="/register" className="flex items-center text-white bg-[#D91C2A] hover:bg-[#B01421] font-black px-6 py-3 rounded-full shadow-[0_4px_0_#850E18] hover:translate-y-1 hover:shadow-[0_2px_0_#850E18] active:translate-y-2 active:shadow-none border-[3px] border-black transition-all duration-300 tracking-wider uppercase text-sm md:text-base">
                                Join Now 🚜
                            </Link>
                        </div>
                    )}

                    <Link to="/cart" className="relative flex items-center bg-[#FFD100] text-black px-5 py-3 rounded-full hover:bg-[#f5c900] transition-all shadow-[0_4px_0_#000] hover:translate-y-1 hover:shadow-[0_2px_0_#000] active:translate-y-2 active:shadow-none border-[4px] border-black group">
                        <span className="font-black text-xl mr-2">£{totalPrice}</span>
                        <ShoppingBag size={26} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
                        {totalQty > 0 && (
                            <span className="absolute -top-3 -right-3 bg-[#D91C2A] text-white text-sm font-black rounded-full h-8 w-8 flex items-center justify-center border-[3px] border-black shadow-sm transform rotate-12">
                                {totalQty}
                            </span>
                        )}
                    </Link>
                </nav>
            </div>
        </header>
    );
};

export default Header;
