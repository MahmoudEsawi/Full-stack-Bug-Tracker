import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = '/api/auth/register';

function Register({ setToken }) {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(API_URL, formData);
      const token = res.data.token;
      localStorage.setItem('token', token);
      setToken(token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f6f0] text-[#0d382b] font-grotesk flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background Poster Grid */}
      <div className="absolute inset-0 poster-grid-bg opacity-60 pointer-events-none" />

      <div className="bg-[#f8faf6] p-8 sm:p-10 rounded-3xl shadow-2xl border-2 border-[#0d382b] w-full max-w-md relative z-10">
        
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="text-xs font-mono font-bold text-[#0d382b]/70 hover:text-[#0d382b] flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Back to Landing</span>
          </Link>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#22c55e] text-[#08241b] rounded uppercase">
            NEW ACCOUNT
          </span>
        </div>

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-[#0d382b] text-[#facc15] font-syne font-black text-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
            ⚡
          </div>
          <h1 className="text-3xl font-syne font-black text-[#0d382b] tracking-tight mb-1">
            Create Workspace User
          </h1>
          <p className="text-xs font-sans text-[#0d382b]/70 font-medium">
            Join your team or create your own engineering space.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-6 text-xs font-mono font-bold border border-red-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-bold text-[#0d382b]/80 uppercase tracking-wider mb-1.5">
              Choose Username
            </label>
            <input
              type="text"
              required
              minLength={3}
              placeholder="e.g. alex_dev"
              className="w-full p-3 bg-white border-2 border-[#0d382b]/20 rounded-xl focus:outline-none focus:border-[#0d382b] text-[#0d382b] text-sm font-medium transition-all"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold text-[#0d382b]/80 uppercase tracking-wider mb-1.5">
              Choose Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full p-3 bg-white border-2 border-[#0d382b]/20 rounded-xl focus:outline-none focus:border-[#0d382b] text-[#0d382b] text-sm font-medium transition-all"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full bg-[#0d382b] hover:bg-[#144636] text-[#facc15] font-syne font-black text-base py-3.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 border border-[#22c55e]/30"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up & Enter'}</span>
            <span>→</span>
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-sans text-[#0d382b]/70">
          Already have an account?{' '}
          <Link to="/login" className="text-[#0d382b] hover:underline font-bold">
            Sign In ↗
          </Link>
        </p>

        {/* Quick Demo Invite Code Tip */}
        <div className="mt-6 pt-4 border-t border-[#0d382b]/15 text-[11px] font-mono text-[#0d382b]/70 text-center">
          <span>Join existing demo team with code: </span>
          <strong className="text-[#0d382b] px-1.5 py-0.5 bg-[#facc15] rounded font-bold">ALPHA1</strong>
        </div>

      </div>
    </div>
  );
}

export default Register;
