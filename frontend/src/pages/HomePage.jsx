import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();

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
                        <span className="absolute inset-0 text-[#0051AC] select-none scale-[1.03]" style={{ WebkitTextStroke: '20px #0051AC' }}>Winkin</span>
                        <span className="relative text-white">Wink<span className="text-[#FFD100]">in</span></span>
                    </div>
                </div>

                <div className="bg-[#0051AC] text-white font-bold text-sm md:text-2xl py-2 px-6 rounded-full mx-auto inline-block border-2 border-white shadow-xl relative -top-6">
                    Your Local Groceries, Delivered Fast!
                </div>

                {/* Red Ribbon Banner */}
                <div className="relative mb-8 max-w-4xl mx-auto flex justify-center mt-4">
                    <div className="absolute inset-0 bg-[#C31820] transform skew-x-[-10deg] shadow-2xl skew-y-1 z-0 rounded-lg"></div>
                    <div className="relative bg-[#D91C2A] text-white text-4xl md:text-6xl font-black py-4 px-12 z-10 border-y-4 border-[#B01421] shadow-2xl tracking-tight uppercase" style={{ textShadow: '3px 3px 0 #850E18' }}>
                        ORDER NOW & SAVE!
                    </div>
                </div>

                {/* Grid of Badges */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-12 mb-16 px-4">
                    {/* £10 OFF Badge */}
                    <div className="bg-[#00883A] text-[#FFD100] p-6 text-center transform rotate-[-5deg] border-4 border-[#005a26] shadow-2xl max-w-sm w-full relative z-10 py-8" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)', borderRadius: '1rem' }}>
                        <div className="text-6xl font-black tracking-tighter drop-shadow-md pb-1 text-white" style={{ textShadow: '2px 2px 0 #005a26' }}>£10 <span className="text-3xl text-[#FFD100]">OFF</span></div>
                        <div className="text-white font-bold text-lg uppercase tracking-tighter bg-black/20 py-1 rounded">Your First Order!</div>
                    </div>

                    {/* Spend £20 Get Free Milk Badge */}
                    <div className="bg-white text-[#0D4E9A] p-6 border-4 border-[#0D4E9A] shadow-2xl transform rotate-[3deg] max-w-sm w-full relative z-10 py-6">
                        <div className="text-2xl font-black uppercase tracking-tight mb-1">Spend £20</div>
                        <div className="text-[#0D4E9A] text-4xl font-black uppercase tracking-tighter" style={{ textShadow: '1px 1px 0 #FFD100' }}>Get Free Milk!</div>
                    </div>
                </div>

                {/* Delivered in 20 Mins Ribbon */}
                <div className="relative inline-block mb-12 mx-auto transform hover:scale-105 transition duration-300 z-20">
                    <div className="bg-black border-4 border-[#FFD100] text-[#FFD100] font-black text-xs md:text-lg py-1 px-4 uppercase tracking-widest inline-block absolute -top-4 shadow-sm z-30 left-1/2 -translate-x-1/2">
                        ⏱️ DELIVERED IN
                    </div>
                    <div className="bg-[#FFD100] text-black font-black text-4xl md:text-6xl border-4 border-black py-6 px-12 shadow-[8px_8px_0px_#000] flex flex-col items-center">
                        <div style={{ textShadow: '2px 2px 0 #fff' }}>20 MINUTES</div>
                        <span className="bg-[#D91C2A] text-white text-xl md:text-3xl px-4 py-1 uppercase mt-2 shadow-[4px_4px_0_#850E18] transform rotate-[-2deg]">OR IT'S FREE!</span>
                    </div>
                </div>

                {/* Postal Code Checking Form */}
                <div className="max-w-xl mx-auto bg-white p-6 md:p-10 rounded-3xl shadow-[0_20px_0_#2b82b1] border-[6px] border-[#0D4E9A] mb-16 relative z-30">
                    <h3 className="text-2xl md:text-3xl font-black text-[#0D4E9A] mb-6 uppercase text-center flex items-center justify-center gap-2">
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
