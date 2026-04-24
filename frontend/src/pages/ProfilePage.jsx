import { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import AuthContext from '../context/AuthContext';
import { Package, Calendar, MapPin, CheckCircle, Clock, Truck, Camera } from 'lucide-react';

const ProfilePage = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Profile form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [profileMessage, setProfileMessage] = useState(null);
    const [updateSuccess, setUpdateSuccess] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchMyOrders = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders/my', config);
                setOrders(Array.isArray(data) ? data : []);
                setLoading(false);
            } catch (err) {
                setError(
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : err.message
                );
                setLoading(false);
            }
        };

        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setUsername(user.username || '');
            setPhone(user.phone || '');
            setAvatar(user.avatar || '');
            fetchMyOrders();
        }
    }, [user, navigate]);

    const submitProfileHandler = async (e) => {
        e.preventDefault();
        setProfileMessage(null);
        setUpdateSuccess(false);

        if (password !== confirmPassword) {
            setProfileMessage('Passwords do not match');
        } else {
            try {
                await updateProfile({
                    name,
                    email,
                    username,
                    phone,
                    avatar,
                    password: password || undefined
                });
                setUpdateSuccess(true);
                setPassword('');
                setConfirmPassword('');
                setTimeout(() => setUpdateSuccess(false), 3000);
            } catch (err) {
                setProfileMessage(typeof err === 'string' ? err : err.message || 'Update failed');
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 2MB to fit in MongoDB easily)
            if (file.size > 2 * 1024 * 1024) {
                setProfileMessage('Image must be less than 2MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered':
                return <CheckCircle className="text-white" size={20} />;
            case 'Shipped':
                return <Truck className="text-white" size={20} />;
            case 'Not Processed':
                return <Clock className="text-white" size={20} />;
            default:
                return <Package className="text-black" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Delivered':
                return 'bg-[#4CAF50] text-white border-2 border-black';
            case 'Shipped':
                return 'bg-[#00ADEF] text-white border-2 border-black';
            case 'Not Processed':
                return 'bg-gray-400 text-white border-2 border-black';
            default:
                return 'bg-[#FFD100] text-black border-2 border-black';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-[#E0F6FF]">
                <div className="animate-bounce bg-[#2E8B57] text-white font-black px-6 py-3 rounded-full border-4 border-[#005a26] shadow-[0_4px_0_#005a26]">
                    Loading Farm... 🚜
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] py-12 relative overflow-hidden">
            {/* Background Countryside Ambience */}
            <div className="absolute top-10 left-10 text-white text-6xl opacity-80 pointer-events-none">☁️</div>
            <div className="absolute top-32 right-20 text-white text-5xl opacity-70 pointer-events-none">☁️</div>
            <div className="absolute bottom-20 left-10 text-5xl pointer-events-none drop-shadow-md">🌳</div>
            <div className="absolute bottom-10 right-10 text-6xl pointer-events-none drop-shadow-lg">🚜</div>

            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <h1 className="text-4xl md:text-6xl font-black mb-10 text-[#2E8B57] uppercase tracking-tighter text-center" style={{ textShadow: '3px 3px 0 #FFD100' }}>
                    My Village Profile 🌾
                </h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* User Info Form (The Barn) */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#D91C2A] rounded-3xl shadow-[8px_8px_0_#850E18] border-[6px] border-[#850E18] p-6 text-white relative">
                            {/* Barn Roof Deco */}
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-[#850E18] rounded-t-2xl" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)' }}></div>

                            <div className="flex items-center space-x-4 mb-8 mt-2">
                                <div className="relative group">
                                    <div className="bg-[#FFD100] border-4 border-black w-20 h-20 rounded-full flex items-center justify-center shadow-[4px_4px_0_#000] transform rotate-[-5deg] overflow-hidden bg-white">
                                        {avatar ? (
                                            <img src={avatar} alt="Avatar" className="w-full h-full object-cover transform rotate-[5deg] scale-125" />
                                        ) : (
                                            <span className="text-4xl font-black text-black">
                                                {name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || '🚜'}
                                            </span>
                                        )}
                                    </div>
                                    <label className="absolute -bottom-1 -right-1 bg-white text-black p-1.5 rounded-full border-2 border-black cursor-pointer shadow-sm hover:scale-110 transition-transform">
                                        <Camera size={16} strokeWidth={3} />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-wide" style={{ textShadow: '2px 2px 0 #000' }}>{user?.name || 'Farmer'}</h2>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-[#4CAF50] text-white border-2 border-black shadow-[2px_2px_0_#000] mt-2 uppercase tracking-wide">
                                        Status: Active 🍏
                                    </span>
                                </div>
                            </div>

                            {profileMessage && (
                                <div className="bg-[#FFD100] border-4 border-black text-black font-bold px-4 py-3 rounded-xl mb-6 text-sm shadow-[4px_4px_0_#000]">
                                    {profileMessage}
                                </div>
                            )}
                            {updateSuccess && (
                                <div className="bg-[#4CAF50] border-4 border-black text-white font-bold px-4 py-3 rounded-xl mb-6 text-sm shadow-[4px_4px_0_#000]">
                                    Profile Harvested Successfully! 🌾
                                </div>
                            )}

                            <form onSubmit={submitProfileHandler} className="space-y-4">
                                <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                                    <label className="block text-sm font-bold text-[#FFD100] mb-1 uppercase tracking-wider">Farmer Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                        required
                                    />
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                                    <label className="block text-sm font-bold text-[#FFD100] mb-1 uppercase tracking-wider">Call Sign (Username)</label>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                        required
                                    />
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                                    <label className="block text-sm font-bold text-[#FFD100] mb-1 uppercase tracking-wider">Telegraph (Phone)</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                        required
                                    />
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                                    <label className="block text-sm font-bold text-[#FFD100] mb-1 uppercase tracking-wider">Mailbox (Email)</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                        required
                                    />
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                                    <label className="block text-sm font-bold text-[#FFD100] mb-1 uppercase tracking-wider">New Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] placeholder-gray-400"
                                        placeholder="Leave blank to keep"
                                    />
                                </div>
                                <div className="bg-white/10 p-4 rounded-2xl border-2 border-white/20">
                                    <label className="block text-sm font-bold text-[#FFD100] mb-1 uppercase tracking-wider">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-2 bg-white text-gray-900 border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-[#FFD100] text-black py-4 rounded-xl font-black text-xl hover:bg-white border-[4px] border-black shadow-[0_6px_0_#000] hover:translate-y-1 hover:shadow-[0_4px_0_#000] active:translate-y-3 active:shadow-none transition-all uppercase tracking-widest mt-4"
                                >
                                    Update Details 🛠️
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Orders Section (The Field) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-[8px_8px_0_rgba(46,139,87,0.3)] border-[6px] border-[#2E8B57] p-6 lg:p-10 relative">
                            {/* Decorative grass at bottom of container */}
                            <div className="absolute -bottom-6 right-10 text-6xl pointer-events-none drop-shadow-md">🌾</div>
                            
                            <h2 className="text-3xl font-black text-[#003B18] mb-8 flex items-center uppercase tracking-tighter" style={{ textShadow: '2px 2px 0 #fff' }}>
                                <Package className="mr-3 text-[#2E8B57]" size={36} strokeWidth={2.5} />
                                Order History
                            </h2>

                            {error ? (
                                <div className="bg-[#D91C2A] text-white border-4 border-black p-6 rounded-2xl font-bold shadow-[4px_4px_0_#000]">
                                    {error}
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center py-20 bg-white/50 rounded-3xl border-4 border-dashed border-[#2E8B57]">
                                    <div className="text-6xl mb-6">🛒</div>
                                    <h3 className="text-2xl font-black text-[#003B18] mb-2 uppercase">No Harvest Found</h3>
                                    <p className="text-gray-600 font-bold mb-8">Your cart is empty! Head to the market to buy some goods.</p>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-8 py-4 bg-[#2E8B57] text-white font-black text-xl rounded-full border-[4px] border-black shadow-[0_6px_0_#000] hover:translate-y-1 hover:shadow-[0_4px_0_#000] active:translate-y-2 active:shadow-none transition-all uppercase tracking-wider"
                                    >
                                        Visit Market 🌻
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <Link to={`/order/${order._id}`} key={order._id} className="block bg-white border-[4px] border-[#2E8B57] rounded-3xl p-6 hover:bg-[#F2FDF5] transition-colors group cursor-pointer shadow-[4px_4px_0_#2E8B57] hover:translate-y-[-4px] hover:shadow-[8px_8px_0_#2E8B57]">
                                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b-4 border-dashed border-gray-200 pb-4 mb-4 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-500 font-bold uppercase tracking-widest mb-1">
                                                        Order <span className="text-[#003B18] text-lg">#{order._id.substring(0, 8)}</span>
                                                    </p>
                                                    <div className="flex items-center font-bold text-gray-600">
                                                        <Calendar className="mr-2 text-[#2E8B57]" size={18} strokeWidth={2.5} />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wide shadow-sm ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                    <div className="text-right border-l-4 border-gray-200 pl-4">
                                                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</p>
                                                        <p className="font-black text-2xl text-[#003B18]">£{(order.totalPrice || 0).toFixed(2)}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div className="flex -space-x-4">
                                                    {order.orderItems.slice(0, 4).map((item, idx) => (
                                                        <div key={idx} className="w-16 h-16 rounded-full border-4 border-[#2E8B57] bg-white overflow-hidden relative shadow-md group-hover:scale-110 transition-transform" style={{ zIndex: 10 - idx }} title={item.name}>
                                                            <img
                                                                src={item.image.startsWith('http') || item.image.startsWith('data:image') ? item.image : `http://localhost:5000${item.image}`}
                                                                alt={item.name}
                                                                className="w-full h-full object-contain p-2"
                                                            />
                                                        </div>
                                                    ))}
                                                    {order.orderItems.length > 4 && (
                                                        <div className="w-16 h-16 rounded-full border-4 border-[#2E8B57] bg-[#FFD100] flex items-center justify-center text-xl font-black text-black shadow-md z-0">
                                                            +{order.orderItems.length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-lg font-black text-[#D91C2A] uppercase tracking-wide bg-red-50 px-4 py-2 rounded-xl border-2 border-[#D91C2A]">
                                                   View Details &rarr;
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
