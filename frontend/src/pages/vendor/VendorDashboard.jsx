import { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { Store, TrendingUp, Package, Truck, LogOut, Loader } from 'lucide-react';

const VendorDashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'vendor') {
            navigate('/login');
            return;
        }

        const fetchVendorStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                const { data } = await axios.get('/api/orders/vendor-sales', config);
                // Sales aggregation returns array. Grab first if exists
                if (data && data.length > 0) {
                    setStats(data[0]);
                } else {
                    setStats({ totalRevenue: 0, totalOrders: 0, totalItemsSold: 0 });
                }
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message);
                setLoading(false);
            }
        };

        fetchVendorStats();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-[#E0F6FF]">
                <div className="animate-bounce bg-[#2E8B57] text-white font-black px-6 py-3 rounded-full border-4 border-[#005a26] shadow-[0_4px_0_#005a26] flex items-center gap-2">
                    <Loader className="animate-spin" /> Gathering Harvest Data...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] py-12 relative overflow-hidden font-sans">
            {/* Countryside Decor */}
            <div className="absolute top-10 left-10 text-white text-6xl opacity-80 pointer-events-none">☁️</div>
            <div className="absolute top-40 right-10 text-white text-5xl opacity-70 pointer-events-none">☁️</div>
            <div className="absolute bottom-0 left-0 w-full h-32 bg-[#5C9E31] z-0 hidden md:block" style={{ borderTop: '8px solid #3B6E1A' }}></div>
            <div className="absolute bottom-24 left-20 text-7xl pointer-events-none drop-shadow-lg z-10 hidden md:block">🏡</div>
            <div className="absolute bottom-24 right-32 text-6xl pointer-events-none drop-shadow-lg z-10 hidden md:block">🚜</div>

            <div className="container mx-auto px-4 relative z-20">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-[#003B18] uppercase tracking-tighter drop-shadow-md flex items-center gap-4">
                        <Store size={48} className="text-[#2E8B57]" />
                        Vendor Terminal 🌾
                    </h1>
                    <button
                        onClick={logout}
                        className="mt-4 md:mt-0 flex items-center gap-2 bg-[#D91C2A] text-white px-6 py-3 rounded-xl font-black border-4 border-black shadow-[4px_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all uppercase"
                    >
                        <LogOut size={20} /> Close Barn
                    </button>
                </div>

                {error && (
                    <div className="bg-[#FFD100] border-4 border-black text-black font-bold p-4 rounded-xl mb-8 shadow-[4px_4px_0_#000]">
                        {error}
                    </div>
                )}

                {/* Dashboard Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Revenue Card */}
                    <div className="bg-white rounded-3xl p-8 border-[6px] border-[#2E8B57] shadow-[8px_8px_0_#2E8B57] hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[#4CAF50] font-bold uppercase tracking-widest mb-2">Total Harvest Revenue</p>
                                <h3 className="text-5xl font-black text-black">£{stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                            </div>
                            <div className="bg-[#E8F5E9] p-4 rounded-2xl border-4 border-[#4CAF50]">
                                <TrendingUp className="text-[#4CAF50]" size={36} strokeWidth={3} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Gross sales driven by your crops.</p>
                    </div>

                    {/* Products Sold Card */}
                    <div className="bg-white rounded-3xl p-8 border-[6px] border-[#FFD100] shadow-[8px_8px_0_#FFD100] hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[#F57F17] font-bold uppercase tracking-widest mb-2">Total Units Depleted</p>
                                <h3 className="text-5xl font-black text-black">{stats?.totalItemsSold || 0}</h3>
                            </div>
                            <div className="bg-[#FFF9C4] p-4 rounded-2xl border-4 border-[#FFD100]">
                                <Package className="text-[#F57F17]" size={36} strokeWidth={3} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Individual items shipped to locals.</p>
                    </div>

                    {/* Orders Card */}
                    <div className="bg-white rounded-3xl p-8 border-[6px] border-[#00ADEF] shadow-[8px_8px_0_#00ADEF] hover:scale-105 transition-transform duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <p className="text-[#0277BD] font-bold uppercase tracking-widest mb-2">Active Trajectories</p>
                                <h3 className="text-5xl font-black text-black">{stats?.totalOrders || 0}</h3>
                            </div>
                            <div className="bg-[#E1F5FE] p-4 rounded-2xl border-4 border-[#00ADEF]">
                                <Truck className="text-[#0277BD]" size={36} strokeWidth={3} />
                            </div>
                        </div>
                        <p className="text-sm font-bold text-gray-500 uppercase">Unique delivery routes initiated.</p>
                    </div>
                </div>

                {/* Operations Navigation */}
                <h2 className="text-3xl font-black text-[#003B18] uppercase tracking-tighter mb-8 bg-white/50 backdrop-blur inline-block px-6 py-2 rounded-2xl border-4 border-dashed border-[#2E8B57]">
                    Farm Management
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Link to="/vendor/products" className="bg-[#D91C2A] text-white rounded-3xl p-8 border-[6px] border-[#850E18] shadow-[8px_8px_0_#850E18] hover:translate-y-1 hover:shadow-[4px_4px_0_#850E18] transition-all group block">
                        <h3 className="text-3xl font-black uppercase tracking-wider mb-4 flex items-center gap-4">
                            <Package size={40} className="group-hover:rotate-12 transition-transform" />
                            Manage Crops 🌽
                        </h3>
                        <p className="font-bold text-xl opacity-90 leading-relaxed">
                            Plant new produce into the catalog, update your stock yields, or adjust local pricing points. You hold absolute control over your crops.
                        </p>
                    </Link>

                    <div className="bg-[#1A1A1A] text-white rounded-3xl p-8 border-[6px] border-black shadow-[8px_8px_0_rgba(0,0,0,0.5)] flex flex-col justify-center items-center text-center">
                        <span className="text-6xl mb-4">📢</span>
                        <h3 className="text-2xl font-black uppercase tracking-widest text-[#FFD100] mb-2">Coming Soon</h3>
                        <p className="font-bold text-gray-400">Advanced predictive weather modeling and AI crop forecasting tools are under active development.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VendorDashboard;
