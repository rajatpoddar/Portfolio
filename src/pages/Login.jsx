import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { auth } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await auth.signIn(email, password);
    setLoading(false);
    if (err) {
      setError('Invalid credentials. Please try again.');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(108,99,255,0.12) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-3xl font-black gradient-text mb-2">RP.</div>
          <div className="text-sm" style={{ color: 'var(--text-muted)' }}>Admin Dashboard</div>
        </div>

        <div className="t-card rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1" style={{ color: 'var(--text)' }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Sign in to access your business OS</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="solutionspoddar@gmail.com" required autoComplete="email"
                className="rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                className="rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(108,99,255,0.35)' }}
              whileTap={{ scale: 0.98 }}
              className="mt-2 w-full py-3.5 rounded-xl bg-[#6c63ff] hover:bg-[#7c73ff] text-white font-semibold text-sm transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                  />
                  Signing in...
                </span>
              ) : 'Sign In →'}
            </motion.button>
          </form>
        </div>

        <div className="text-center mt-6">
          <a href="/" className="text-xs transition-colors" style={{ color: 'var(--text-muted)' }}>
            ← Back to portfolio
          </a>
        </div>
      </motion.div>
    </div>
  );
}
