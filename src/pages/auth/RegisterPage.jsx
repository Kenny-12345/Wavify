/**
 * RegisterPage.jsx
 */
import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Music, Lock, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  if (isAuthenticated) return <Navigate to="/" replace />;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    const result = await register({ name: form.name, email: form.email, password: form.password });
    setLoading(false);
    if (result.success) {
      toast.success('Welcome to Wavify! 🎵');
      navigate('/');
    } else {
      toast.error(result.error);
      setErrors({ email: result.error });
    }
  };

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', icon: User, placeholder: 'Your name', autoComplete: 'name' },
    { id: 'email', label: 'Email', type: 'email', icon: Mail, placeholder: 'you@example.com', autoComplete: 'email' },
    { id: 'password', label: 'Password', type: showPass ? 'text' : 'password', icon: Lock, placeholder: '••••••••', autoComplete: 'new-password', showToggle: true },
    { id: 'confirm', label: 'Confirm Password', type: showPass ? 'text' : 'password', icon: Lock, placeholder: '••••••••', autoComplete: 'new-password' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-8" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse-slow" style={{ background: 'var(--accent)' }} />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10 blur-3xl animate-pulse-slow" style={{ background: 'var(--accent-light)', animationDelay: '1s' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl" style={{ background: 'var(--accent)' }}>
            <Music className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-black text-primary">Join Wavify</h1>
          <p className="text-muted mt-1">Start listening for free</p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glass">
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ id, label, type, icon: Icon, placeholder, autoComplete, showToggle }) => (
              <div key={id}>
                <label htmlFor={`reg-${id}`} className="block text-sm font-medium text-secondary mb-1.5">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id={`reg-${id}`}
                    type={type}
                    autoComplete={autoComplete}
                    value={form[id]}
                    onChange={handleChange(id)}
                    placeholder={placeholder}
                    className={`w-full pl-10 pr-${showToggle ? '10' : '4'} py-3 rounded-xl text-sm text-primary placeholder:text-muted outline-none transition-all ${errors[id] ? 'ring-2 ring-red-500' : ''}`}
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                  {showToggle && (
                    <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[id] && <p className="text-xs text-red-400 mt-1">{errors[id]}</p>}
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-sm text-black transition-all hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
