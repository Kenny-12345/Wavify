/**
 * LoginPage.jsx
 * Beautiful login page with glassmorphism design.
 */
import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Music, Lock, Mail, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await login(form.email, form.password);
    setLoading(false);
    if (result.success) {
      toast.success('Welcome back! 🎵');
      navigate('/');
    } else {
      toast.error(result.error);
      setErrors({ password: result.error });
    }
  };

  const handleChange = (field) => (e) => {
    const val = field === 'remember' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [field]: val }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const fillDemo = () => {
    // Register a demo user if not exists, then fill the form
    const db = JSON.parse(localStorage.getItem('wavify_users_db') || '[]');
    if (!db.find(u => u.email === 'demo@wavify.com')) {
      db.push({ id: 'user_demo', name: 'Demo User', email: 'demo@wavify.com', password: 'demo123', createdAt: new Date().toISOString() });
      localStorage.setItem('wavify_users_db', JSON.stringify(db));
    }
    setForm({ email: 'demo@wavify.com', password: 'demo123', remember: false });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow" style={{ background: 'var(--accent)' }} />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{ background: 'var(--accent-light)', animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-5 blur-3xl" style={{ background: 'white' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl" style={{ background: 'var(--accent)' }}>
            <Music className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black text-primary">Welcome back</h1>
          <p className="text-muted mt-1">Sign in to continue listening</p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-8 shadow-glass">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm text-primary placeholder:text-muted outline-none transition-all ${errors.email ? 'ring-2 ring-red-500' : ''}`}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
              </div>
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label htmlFor="login-password" className="text-sm font-medium text-secondary">Password</label>
                <Link to="/forgot-password" className="text-xs font-medium hover:underline" style={{ color: 'var(--accent)' }}>Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm text-primary placeholder:text-muted outline-none transition-all ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                  style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={form.remember}
                onChange={handleChange('remember')}
                className="w-4 h-4 rounded cursor-pointer"
                style={{ accentColor: 'var(--accent)' }}
              />
              <label htmlFor="remember" className="text-sm text-secondary cursor-pointer">Remember me</label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 pt-4 border-t border-white/5 text-center">
            <button onClick={fillDemo} className="text-xs text-muted hover:text-primary transition-colors">
              Use demo account → demo@wavify.com / demo123
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Sign up free</Link>
        </p>
      </motion.div>
    </div>
  );
}
