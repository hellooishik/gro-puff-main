import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import AuthContext from '../../context/AuthContext';
import Swal from 'sweetalert2';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [code, setCode] = useState('');
    const [discount, setDiscount] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data } = await axios.get('/api/coupons', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setCoupons(data);
        } catch (error) {
            console.error('Failed to fetch coupons', error);
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            if (editId) {
                await axios.put(`/api/coupons/${editId}`, { code, discount, isActive }, config);
            } else {
                await axios.post('/api/coupons', { code, discount, isActive }, config);
            }
            setCode('');
            setDiscount('');
            setIsActive(true);
            setEditId(null);
            fetchCoupons();
            Swal.fire('Success', editId ? 'Coupon updated' : 'Coupon created', 'success');
        } catch (error) {
            Swal.fire('Error', error.response?.data?.message || 'Error saving coupon', 'error');
        } finally {
            setLoading(false);
        }
    };

    const editHandler = (coupon) => {
        setCode(coupon.code);
        setDiscount(coupon.discount);
        setIsActive(coupon.isActive);
        setEditId(coupon._id);
    };

    const deleteHandler = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });
        if (result.isConfirmed) {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.delete(`/api/coupons/${id}`, config);
                fetchCoupons();
                Swal.fire('Deleted!', 'Coupon has been deleted.', 'success');
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Error deleting coupon', 'error');
            }
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <h1 className="text-3xl font-bold mb-6 text-gray-800 border-b-4 border-[#00ADEF] inline-block pb-2">Manage Coupons</h1>

            <div className="grid md:grid-cols-3 gap-8 mt-4">
                <div className="md:col-span-1">
                    <form onSubmit={submitHandler} className="bg-white p-6 rounded-2xl shadow-[4px_4px_0_#e5e7eb] border-2 border-gray-200">
                        <h2 className="text-2xl font-black mb-6 text-[#00ADEF]">{editId ? 'Edit Coupon' : 'Create Coupon'}</h2>
                        
                        <div className="mb-4">
                            <label className="block text-gray-700 font-bold mb-2 uppercase tracking-wide text-sm">Coupon Code</label>
                            <input 
                                type="text" 
                                value={code} 
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/20 uppercase font-black text-xl text-gray-800 placeholder-gray-300 transition"
                                placeholder="E.g. SUMMER10"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2 uppercase tracking-wide text-sm">Discount Amount (£)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-xl text-gray-400">£</span>
                                <input 
                                    type="number" 
                                    value={discount} 
                                    onChange={(e) => setDiscount(e.target.value)}
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full p-3 pl-8 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#00ADEF] focus:ring-4 focus:ring-[#00ADEF]/20 font-black text-xl text-gray-800 transition"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-8 flex items-center bg-gray-50 p-4 rounded-xl border-2 border-transparent hover:border-gray-200 transition cursor-pointer" onClick={() => setIsActive(!isActive)}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${isActive ? 'bg-[#00ADEF] text-white shadow-sm' : 'bg-gray-200 text-gray-400'}`}>
                                {isActive && <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                            <div>
                                <h3 className="text-gray-800 font-bold tracking-wide">Status: {isActive ? 'Active' : 'Draft'}</h3>
                                <p className="text-xs text-gray-500 font-medium">{isActive ? 'Available to users' : 'Hidden from users'}</p>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-[#00ADEF] text-white py-4 rounded-xl font-black text-lg hover:bg-[#0092ca] transition disabled:opacity-50 shadow-[0_4px_0_#007fac] hover:translate-y-1 hover:shadow-none uppercase tracking-wider"
                        >
                            {loading ? 'Processing...' : (editId ? 'Update Coupon' : 'Create Coupon')}
                        </button>
                        
                        {editId && (
                            <button 
                                type="button" 
                                onClick={() => { setEditId(null); setCode(''); setDiscount(''); setIsActive(true); }}
                                className="w-full bg-white text-gray-600 border-2 border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition mt-4 uppercase tracking-wide"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </form>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl shadow-[4px_4px_0_#e5e7eb] border-2 border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-100/50 border-b-2 border-gray-200 uppercase tracking-widest text-xs font-black text-gray-500">
                                    <th className="p-5 w-1/3">Coupon Code</th>
                                    <th className="p-5">Discount</th>
                                    <th className="p-5">Status</th>
                                    <th className="p-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon._id} className="hover:bg-gray-50/80 transition group">
                                        <td className="p-5 align-middle">
                                            <div className="inline-block bg-yellow-100 px-3 py-1.5 rounded-lg border-2 border-yellow-200 border-dashed text-yellow-800 font-black tracking-widest uppercase">
                                                {coupon.code}
                                            </div>
                                        </td>
                                        <td className="p-5 align-middle text-[#D91C2A] font-black text-xl">
                                            £{coupon.discount.toFixed(2)}
                                        </td>
                                        <td className="p-5 align-middle">
                                            {coupon.isActive 
                                                ? <span className="bg-green-100 text-green-800 border border-green-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Active</span> 
                                                : <span className="bg-gray-100 text-gray-600 border border-gray-200 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">Inactive</span>}
                                        </td>
                                        <td className="p-5 align-middle text-right space-x-2">
                                            <button 
                                                onClick={() => editHandler(coupon)}
                                                className="bg-blue-50 text-blue-600 border border-blue-200 px-4 py-2 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition shadow-sm"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => deleteHandler(coupon._id)}
                                                className="bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl font-bold hover:bg-red-600 hover:text-white transition shadow-sm"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {coupons.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="p-12 text-center text-gray-400 font-medium">
                                            <div className="text-4xl mb-4 opacity-50">🎟️</div>
                                            No active coupons found. <br />Create one to start offering discounts!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCoupons;
