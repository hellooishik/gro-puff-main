import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Swal from 'sweetalert2';

const Footer = () => {
    return (
        <footer className="bg-[#5C9E31] text-[#003B18] pt-48 pb-8 relative overflow-hidden border-t-[12px] border-[#3B6E1A]">
            <style>{`
                @keyframes walkCow1 { 0% { transform: translateX(-150px) scaleX(-1); } 100% { transform: translateX(110vw) scaleX(-1); } }
                @keyframes walkCow2 { 0% { transform: translateX(-300px) scaleX(-1); } 100% { transform: translateX(110vw) scaleX(-1); } }
                @keyframes walkCow3 { 0% { transform: translateX(-500px) scaleX(-1); } 100% { transform: translateX(110vw) scaleX(-1); } }
                @keyframes walkTractor { 0% { transform: translateX(110vw); } 100% { transform: translateX(-300px); } }
                .animate-cow-1 { animation: walkCow1 25s linear infinite; }
                .animate-cow-2 { animation: walkCow2 30s linear infinite 2s; }
                .animate-cow-3 { animation: walkCow3 35s linear infinite 5s; }
                .animate-tractor { animation: walkTractor 40s linear infinite 10s; }
                .bounce-cow { animation: bounceCowKey 1s ease-in-out infinite; }
                .bounce-alt { animation: bounceCowKey 1.2s ease-in-out infinite 0.5s; }
                @keyframes bounceCowKey { 
                    0%, 100% { transform: translateY(0); } 
                    50% { transform: translateY(-6px) rotate(3deg); } 
                }
            `}</style>
            
            {/* Animated Countryside Scene */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#A4E0F9] to-[#87CEEB] z-0 border-b-[8px] border-[#4CAF50]">
                {/* Sun & Clouds */}
                <div className="absolute top-6 right-20 w-16 h-16 bg-[#FFD100] rounded-full shadow-[0_0_30px_#FFD100] animate-pulse"></div>
                <div className="absolute top-2 left-10 text-white text-5xl opacity-90">☁️</div>
                <div className="absolute top-8 left-1/3 text-white text-4xl opacity-80">☁️</div>
                <div className="absolute top-4 right-1/3 text-white text-6xl opacity-85">☁️</div>
                
                {/* Village Background (Positioned on the grass line) */}
                <div className="absolute -bottom-2 left-5 text-7xl drop-shadow-lg z-10">🏡</div>
                <div className="absolute -bottom-1 left-32 text-6xl drop-shadow-md z-10">🌲</div>
                <div className="absolute -bottom-2 left-1/4 text-[80px] drop-shadow-xl z-0">⛪</div>
                <div className="absolute -bottom-1 right-1/4 text-7xl drop-shadow-lg z-10">🏡</div>
                <div className="absolute -bottom-2 right-10 text-[90px] drop-shadow-xl z-0">🌳</div>
                <div className="absolute -bottom-1 right-40 text-6xl drop-shadow-md z-10">🌾</div>
                <div className="absolute bottom-2 left-1/2 text-5xl opacity-80 z-0">🦅</div>

                {/* Animated Entities */}
                <div className="absolute -bottom-4 left-0 w-full z-20 h-20 pointer-events-none">
                    <div className="animate-cow-1 absolute bottom-2 flex gap-1">
                        <div className="text-5xl bounce-cow filter drop-shadow-md">🐄</div>
                    </div>
                    <div className="animate-cow-2 absolute bottom-0 flex gap-4">
                        <div className="text-4xl bounce-alt filter drop-shadow-md">🐄</div>
                        <div className="text-3xl bounce-cow filter drop-shadow-md mt-2">🐄</div>
                    </div>
                    <div className="animate-cow-3 absolute bottom-3 flex gap-2">
                        <div className="text-6xl bounce-cow filter drop-shadow-lg">🐄</div>
                    </div>
                    <div className="animate-tractor absolute bottom-1 flex">
                        <div className="text-6xl filter drop-shadow-lg">🚜</div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 relative z-30">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 bg-white/40 p-8 rounded-3xl border-4 border-[#3B6E1A] shadow-[8px_8px_0_rgba(0,59,24,0.2)]">
                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="mb-6 block inline-block transform hover:scale-105 transition">
                            <span className="relative inline-block font-black text-5xl tracking-tighter rotate-[-4deg] drop-shadow-md">
                                <span className="absolute inset-0 text-[#2E8B57] select-none" style={{ WebkitTextStroke: '8px #2E8B57' }}>Winkin</span>
                                <span className="relative text-white drop-shadow-sm">Wink<span className="text-[#FFD100]">in</span></span>
                            </span>
                        </Link>
                        <p className="text-[#005a26] font-bold mb-6 leading-relaxed text-lg">
                            Fresh off the farm, delivered to your door in minutes! Groceries, daily essentials, and more at local prices.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="bg-[#2E8B57] p-2 rounded-full text-white hover:bg-[#FFD100] hover:text-black border-2 border-black shadow-[0_2px_0_#000] hover:translate-y-px transition-all">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="bg-[#2E8B57] p-2 rounded-full text-white hover:bg-[#FFD100] hover:text-black border-2 border-black shadow-[0_2px_0_#000] hover:translate-y-px transition-all">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="bg-[#2E8B57] p-2 rounded-full text-white hover:bg-[#FFD100] hover:text-black border-2 border-black shadow-[0_2px_0_#000] hover:translate-y-px transition-all">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="bg-[#2E8B57] p-2 rounded-full text-white hover:bg-[#FFD100] hover:text-black border-2 border-black shadow-[0_2px_0_#000] hover:translate-y-px transition-all">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-wider text-[#003B18] border-b-4 border-[#3B6E1A] inline-block pb-1">Company</h3>
                        <ul className="space-y-3 font-bold text-lg">
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🌾</span> About Us</Link></li>
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🌾</span> Careers</Link></li>
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🌾</span> Blog</Link></li>
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🌾</span> Press</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-wider text-[#003B18] border-b-4 border-[#3B6E1A] inline-block pb-1">Help & Support</h3>
                        <ul className="space-y-3 font-bold text-lg">
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🚜</span> Help Center</Link></li>
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🚜</span> FAQ</Link></li>
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🚜</span> Terms of Service</Link></li>
                            <li><Link to="/" className="hover:text-[#D91C2A] hover:pl-2 transition-all flex items-center gap-2"><span>🚜</span> Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* App Links */}
                    <div>
                        <h3 className="text-2xl font-black mb-6 uppercase tracking-wider text-[#003B18] border-b-4 border-[#3B6E1A] inline-block pb-1">Get the App</h3>
                        <p className="font-bold mb-6 text-lg">Download for iOS and Android to start saving directly from your village!</p>
                        <div className="space-y-4">
                            <button onClick={() => Swal.fire('Coming Soon!', 'Our app is coming soon!', 'info')} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-black border-4 border-black hover:bg-[#D91C2A] shadow-[0_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center w-full justify-center gap-3 group">
                                <span className="text-3xl group-hover:scale-110 transition-transform">🍏</span>
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase font-bold text-gray-300 group-hover:text-white">Download on the</div>
                                    <div className="text-lg">App Store</div>
                                </div>
                            </button>
                            <button onClick={() => Swal.fire('Coming Soon!', 'Our app is coming soon!', 'info')} className="bg-[#1A1A1A] text-white px-6 py-3 rounded-xl font-black border-4 border-black hover:bg-[#D91C2A] shadow-[0_4px_0_#000] hover:translate-y-1 hover:shadow-none transition-all flex items-center w-full justify-center gap-3 group">
                                <span className="text-3xl group-hover:scale-110 transition-transform">▶️</span>
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase font-bold text-gray-300 group-hover:text-white">Get it on</div>
                                    <div className="text-lg">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t-[4px] border-[#3B6E1A] pt-6 text-center font-black text-lg text-[#005a26] uppercase tracking-wide">
                    <p>@2026 Winkin Store . Powered by XNetwork</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
