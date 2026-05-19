import React, { useState } from 'react';
import { loginUser, signupUser } from '../api/apiService';

export default function AuthPages({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'hr' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) { setError('Email and Password are required.'); setLoading(false); return; }
        const res = await loginUser({ email: formData.email, password: formData.password });
        if (res.data.success) onAuthSuccess(res.data.token, res.data.user);
      } else {
        if (!formData.username || !formData.email || !formData.password) { setError('All fields are required.'); setLoading(false); return; }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters.'); setLoading(false); return; }
        const res = await signupUser(formData);
        if (res.data.success) onAuthSuccess(res.data.token, res.data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="glass rounded-2xl p-8 sm:p-10 animate-pulse-glow">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-2xl mx-auto mb-4 shadow-lg shadow-indigo-500/25">
              {isLogin ? '🔐' : '🚀'}
            </div>
            <h2 className="text-2xl font-bold text-white">{isLogin ? 'Welcome Back' : 'Get Started'}</h2>
            <p className="text-sm text-slate-500 mt-1">{isLogin ? 'Sign in to access Grievance Dashboard' : 'Create a Municipal Admin account'}</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 animate-fade-in-up">
              <span>⚠️</span>
              <span className="text-sm text-red-400 font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Username</label>
                <input
                  type="text" name="username" value={formData.username} onChange={handleChange}
                  placeholder="e.g. municipal_officer"
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-indigo-500/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="e.g. officer@municipal.gov"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-indigo-500/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
              <input
                type="password" name="password" value={formData.password} onChange={handleChange} required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-black/60 border border-indigo-500/15 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300"
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Role</label>
                <select
                  name="role" value={formData.role} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-black/60 border border-indigo-500/15 text-white text-sm focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 cursor-pointer appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%236366f1' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center' }}
                >
                  <option value="hr" className="bg-[#1e1b4b] text-white">Municipal Officer</option>
                  <option value="admin" className="bg-[#1e1b4b] text-white">Administrator</option>
                </select>
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-50 cursor-pointer active:scale-[0.98] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                  Processing...
                </span>
              ) : (isLogin ? '🔐 Sign In' : '🚀 Create Account')}
            </button>
          </form>

          {/* Switch */}
          <div className="text-center mt-6 pt-5 border-t border-indigo-500/10">
            {isLogin ? (
              <p className="text-sm text-slate-500">
                Don't have an account?{' '}
                <span onClick={() => { setIsLogin(false); setError(''); }} className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300 transition-colors">
                  Create account
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-500">
                Already have an account?{' '}
                <span onClick={() => { setIsLogin(true); setError(''); }} className="text-indigo-400 font-semibold cursor-pointer hover:text-indigo-300 transition-colors">
                  Sign in
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
