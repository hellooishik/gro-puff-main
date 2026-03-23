import { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
        } else {
            try {
                await register(email, password);
                navigate('/');
            } catch (err) {
                console.error('Register error:', err);
                setError(typeof err === 'string' ? err : err.message || 'Registration failed');
            }
        }
    };

    return (
        <div className="flex justify-center items-center py-20 bg-gradient-to-br from-[#60B3E6] to-[#A4E0F9] min-h-[85vh]">
            <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-lg border-4 border-[#0D4E9A]">
                <h1 className="text-4xl font-black mb-8 text-center text-[#D91C2A] uppercase tracking-tighter" style={{ textShadow: '1px 1px 0 #850E18' }}>Join Now</h1>
                
                {message && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4 font-bold">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 font-bold">
                        {error}
                    </div>
                )}
                
                <form onSubmit={submitHandler}>
                    <div className="mb-6">
                        <label className="block text-[#0D4E9A] font-bold mb-2 text-xl uppercase tracking-widest">Email Address</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 border-4 border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] bg-gray-50 text-xl transition"
                            placeholder="Enter email"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-[#0D4E9A] font-bold mb-2 text-xl uppercase tracking-widest">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border-4 border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] bg-gray-50 text-xl transition"
                            placeholder="Enter password"
                            required
                        />
                    </div>
                    <div className="mb-8">
                        <label className="block text-[#0D4E9A] font-bold mb-2 text-xl uppercase tracking-widest">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 border-4 border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] bg-gray-50 text-xl transition"
                            placeholder="Confirm password"
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-[#FFD100] text-black border-4 border-black py-4 rounded-xl font-black text-2xl uppercase tracking-wide hover:translate-y-1 hover:shadow-[0_2px_0_#000] shadow-[0_6px_0_#000] active:translate-y-3 active:shadow-none transition flex items-center justify-center gap-3"
                    >
                        Create Account 🚀
                    </button>
                </form>
                
                <div className="mt-8 text-center text-lg">
                    <p className="text-gray-600 font-bold">
                        Have an account?{' '}
                        <Link to="/login" className="text-[#0D4E9A] font-black hover:underline uppercase">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
