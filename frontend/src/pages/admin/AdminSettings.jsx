import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import { Save, Gift, Tag, AlertCircle } from 'lucide-react';

const AdminSettings = () => {
    const { user } = useContext(AuthContext);
    const [giftPackingRate, setGiftPackingRate] = useState('');
    const [promotionalOffers, setPromotionalOffers] = useState('');
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const { data } = await axios.get('/api/settings');
                setGiftPackingRate(data.giftPackingRate || 0);
                setPromotionalOffers(data.promotionalOffers ? data.promotionalOffers.join('\n') : '');
                setLoading(false);
            } catch (err) {
                setError('Failed to load settings');
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const submitHandler = async (e) => {
        e.preventDefault();
        setUpdating(true);
        setMessage('');
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const offersArray = promotionalOffers.split('\n').filter(o => o.trim() !== '');
            await axios.put('/api/settings', {
                giftPackingRate: Number(giftPackingRate),
                promotionalOffers: offersArray
            }, config);
            
            setMessage('Settings updated successfully');
            setUpdating(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Error updating settings');
            setUpdating(false);
        }
    };

    if (loading) return <div className="text-center py-20">Loading settings...</div>;

    return (
        <div className="container mx-auto px-4 py-10 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Store Settings</h1>
            
            {message && <div className="bg-green-100 text-green-700 p-4 rounded-xl mb-6 font-medium">{message}</div>}
            {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-6 flex items-center gap-2"><AlertCircle size={20}/> {error}</div>}

            <form onSubmit={submitHandler} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Gift className="text-pink-500" /> Gift Packing
                    </h2>
                    <label className="block text-gray-700 font-medium mb-2">Gift Packing Rate (£)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={giftPackingRate}
                        onChange={(e) => setGiftPackingRate(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] transition-all"
                        required
                    />
                    <p className="text-sm text-gray-500 mt-2">This rate will be applied to orders when customers select the Gift Packing option at checkout.</p>
                </div>

                <hr className="border-gray-100" />

                <div>
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
                        <Tag className="text-yellow-500" /> Promotional Offers
                    </h2>
                    <label className="block text-gray-700 font-medium mb-2">Active Offers (One per line)</label>
                    <textarea
                        rows="4"
                        value={promotionalOffers}
                        onChange={(e) => setPromotionalOffers(e.target.value)}
                        className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] transition-all"
                        placeholder="£10 OFF Your First Order!&#10;Spend £20 Get Free Milk!"
                    ></textarea>
                    <p className="text-sm text-gray-500 mt-2">These offers will be displayed on the website GUI (e.g. Header announcement bar).</p>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={updating}
                        className="bg-[#00ADEF] text-white px-8 py-3 rounded-full font-bold hover:bg-[#0092ca] transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save size={20} />
                        {updating ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminSettings;
