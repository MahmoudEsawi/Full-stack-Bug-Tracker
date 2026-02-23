import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'https://full-stack-bug-tracker.onrender.com/api/auth/register';

function Register({ setToken }) {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(API_URL, formData);
            const token = res.data.token;
            localStorage.setItem('token', token);
            setToken(token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration Failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 w-full max-w-md">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
                        <span className="text-blue-600">Nexus</span> Tracker
                    </h1>
                    <p className="text-slate-500 font-medium">Create an account to track bugs instantly.</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm font-semibold border border-red-100 text-center">{error}</div>}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Choose Username</label>
                        <input
                            type="text"
                            required
                            minLength={3}
                            placeholder="e.g., johndoe99_dev"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all font-medium"
                            value={formData.username}
                            onChange={e => setFormData({ ...formData, username: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-600 mb-2 ml-1">Create Password</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            placeholder="At least 6 characters"
                            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800 transition-all font-medium"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <button type="submit" className="mt-4 w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-md shadow-blue-600/20 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200">
                        Sign Up
                    </button>
                </form>

                <p className="mt-8 text-center text-slate-500 font-medium text-sm">
                    Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-bold">Log in here</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;
