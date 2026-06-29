/**
 * ForgotPasswordPage.jsx
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Music, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--accent)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'var(--accent)' }}>
            <Music className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-black text-primary">{submitted ? 'Check your email' : 'Reset password'}</h1>
          <p className="text-muted mt-1">
            {submitted
              ? `We sent a reset link to ${email}`
              : "Enter your email and we'll send a reset link"}
          </p>
        </div>

        <div className="glass rounded-2xl p-8 shadow-glass">
          {submitted ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--accent)' }} />
              <p className="text-sm text-secondary mb-6">If an account exists for {email}, you'll receive a password reset link shortly.</p>
              <Link
                to="/login"
                className="block w-full py-3 rounded-xl font-semibold text-sm text-center text-black hover:opacity-90 transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-secondary mb-1.5">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    id="reset-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-primary placeholder:text-muted outline-none transition-all"
                    style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255,255,255,0.08)' }}
                  />
                </div>
                {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
              </div>
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-semibold text-sm text-black hover:opacity-90 transition-all"
                style={{ background: 'var(--accent)' }}
              >
                Send Reset Link
              </button>
            </form>
          )}
        </div>

        <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-muted hover:text-primary mt-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to login
        </Link>
      </motion.div>
    </div>
  );
}
