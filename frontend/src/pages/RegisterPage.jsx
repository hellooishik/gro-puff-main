import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const redirect = new URLSearchParams(location.search).get('redirect') || '/';

    useEffect(() => {
        if (user) {
            navigate(redirect);
        }
    }, [user, navigate, redirect]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
        } else {
            try {
                await register(email, password);
                navigate(redirect);
            } catch (err) {
                console.error('Register error:', err);
                setError(typeof err === 'string' ? err : err.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="flex justify-center items-center py-20 bg-gradient-to-b from-[#87CEEB] to-[#E0F6FF] min-h-[85vh] relative overflow-hidden">
            {/* Countryside Decor */}
            <div className="absolute top-10 right-10 text-white text-6xl opacity-80 pointer-events-none">☁️</div>
            <div className="absolute top-40 left-10 text-white text-5xl opacity-70 pointer-events-none">☁️</div>
            <div className="absolute bottom-10 right-20 text-7xl pointer-events-none drop-shadow-md z-0 transform scale-x-[-1]">🐄</div>

            <div className="bg-[#5C9E31] p-10 rounded-3xl shadow-[8px_8px_0_#3B6E1A] border-[6px] border-[#3B6E1A] w-full max-w-md relative z-10 text-white">
                
                <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter text-white" style={{ textShadow: '2px 2px 0 #003B18' }}>
                    Join The Village 🌾
                </h1>
                
                {message && (
                    <div className="bg-[#FFD100] border-4 border-black text-black font-bold px-4 py-3 rounded-xl mb-4 shadow-[4px_4px_0_#000]">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-[#D91C2A] border-4 border-black text-white font-bold px-4 py-3 rounded-xl mb-4 shadow-[4px_4px_0_#000]">
                        {error}
                    </div>
                )}
                
                <form onSubmit={submitHandler}>
                    <div className="bg-black/10 p-4 rounded-2xl border-2 border-white/20 mb-4 text-black">
                        <label className="block text-white font-black mb-2 text-sm uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #003B18' }}>Mailbox (Email)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                            placeholder="Enter your email"
                            required
                        />
                    </div>
                    <div className="bg-black/10 p-4 rounded-2xl border-2 border-white/20 mb-4 text-black">
                        <label className="block text-white font-black mb-2 text-sm uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #003B18' }}>Passcode</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                            placeholder="Enter a secure password"
                            required
                        />
                    </div>
                    <div className="bg-black/10 p-4 rounded-2xl border-2 border-white/20 mb-8 text-black">
                        <label className="block text-white font-black mb-2 text-sm uppercase tracking-widest" style={{ textShadow: '1px 1px 0 #003B18' }}>Confirm Passcode</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border-4 border-black rounded-xl focus:outline-none focus:ring-4 focus:ring-[#FFD100] text-lg font-bold shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
                            placeholder="Confirm your password"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-[#FFD100] text-black border-4 border-black py-4 rounded-xl font-black text-2xl uppercase tracking-wider hover:bg-white hover:translate-y-1 hover:shadow-[0_2px_0_#000] shadow-[0_6px_0_#000] active:translate-y-3 active:shadow-none transition flex items-center justify-center gap-3"
                    >
                        Start Farming 🚜
                    </button>
                </form>
                
                <div className="mt-8 text-center text-lg">
                    <p className="text-white font-bold inline-block bg-black/20 px-4 py-2 rounded-xl">
                        Have a barn slot?{' '}
                        <Link to={redirect !== '/' ? `/login?redirect=${redirect}` : '/login'} className="text-[#FFD100] font-black hover:underline uppercase tracking-wide">
                            Log In Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
