import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5001/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const endpoint = isLogin ? `${API_BASE}/auth/login` : `${API_BASE}/auth/signup`;
    const payload = isLogin 
      ? { email: formData.email, password: formData.password } 
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onAuthSuccess(data.user, data.token);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-dark-border bg-dark-card shadow-2xl glass-panel animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyber-cyan via-cyber-magenta to-cyber-purple" />
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-dark-muted hover:text-dark-text transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-sans tracking-wide text-white">
              {isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </h2>
            <p className="text-sm text-dark-muted mt-2">
              {isLogin ? 'Enter your details to access CodeArena' : 'Join the elite coding battlefield today'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-xs border border-cyber-magenta/20 bg-cyber-magenta/10 text-cyber-magenta rounded-lg p-3 mb-4">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="text-xs font-semibold text-dark-muted tracking-wider block mb-1">NAME</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-border bg-dark-bg/60 text-white placeholder-dark-muted/60 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30 transition-all font-sans text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-dark-muted tracking-wider block mb-1">EMAIL ADDRESS</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="name@domain.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-border bg-dark-bg/60 text-white placeholder-dark-muted/60 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30 transition-all font-sans text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-dark-muted tracking-wider block mb-1">PASSWORD</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" size={18} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-dark-border bg-dark-bg/60 text-white placeholder-dark-muted/60 focus:outline-none focus:border-cyber-cyan focus:ring-1 focus:ring-cyber-cyan/30 transition-all font-sans text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-lg bg-gradient-to-r from-cyber-cyan to-cyber-purple hover:from-cyber-cyan hover:to-cyber-magenta text-black font-bold font-sans tracking-wide transition-all shadow-glow-cyan/20 hover:shadow-glow-cyan/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 text-sm"
            >
              {loading ? 'PROCESSING...' : isLogin ? 'SIGN IN' : 'REGISTER'}
            </button>
          </form>

          {/* Toggle Tab Footer */}
          <div className="text-center mt-6 text-xs text-dark-muted">
            {isLogin ? (
              <span>
                New to the platform?{' '}
                <button 
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className="text-cyber-cyan hover:underline font-semibold"
                >
                  Create an account
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button 
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className="text-cyber-cyan hover:underline font-semibold"
                >
                  Sign in instead
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
