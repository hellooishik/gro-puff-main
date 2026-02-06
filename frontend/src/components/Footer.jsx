import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#1A1A1A] text-white pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div>
                        <Link to="/" className="text-3xl font-extrabold tracking-tighter text-[#00ADEF] mb-6 block">
                            FreshPro
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            Groceries delivered in minutes. Fresh produce, daily essentials, and more at supermarket prices.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition">
                                <Linkedin size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Company</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">About Us</Link></li>
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">Careers</Link></li>
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">Blog</Link></li>
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">Press</Link></li>
                        </ul>
                    </div>

                    {/* Help */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Help & Support</h3>
                        <ul className="space-y-4 text-gray-400">
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">Help Center</Link></li>
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">FAQ</Link></li>
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">Terms of Service</Link></li>
                            <li><Link to="/" className="hover:text-[#00ADEF] transition">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* App Links */}
                    <div>
                        <h3 className="text-lg font-bold mb-6">Get the App</h3>
                        <p className="text-gray-400 mb-6">Download for iOS and Android.</p>
                        <div className="space-y-4">
                            <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition flex items-center w-full justify-center gap-3">
                                {/* Apple Icon Placeholder */}
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase font-semibold text-gray-600">Download on the</div>
                                    <div className="text-sm">App Store</div>
                                </div>
                            </button>
                            <button className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition flex items-center w-full justify-center gap-3">
                                {/* Play Store Icon Placeholder */}
                                <div className="text-left leading-tight">
                                    <div className="text-[10px] uppercase font-semibold text-gray-600">Get it on</div>
                                    <div className="text-sm">Google Play</div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} FreshPro. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
