import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Heart, Lock, Mail, Sparkles, UserRound } from 'lucide-react';
import '../style/Auth.css';

export default function Auth({ apiBaseUrl = 'http://localhost:5000' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [view, setView] = useState(() =>
    location.pathname === '/register' ? 'register' : 'login'
  );
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Show error if Google OAuth failed and redirected back here
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError === 'google_auth_failed') setError('Google login failed. Please try again.');
    if (oauthError === 'server_error') setError('Server error during Google login. Please try again.');
  }, []);

  useEffect(() => {
    if (location.pathname === '/register') setView('register');
    else if (location.pathname === '/login') setView('login');
    setError('');
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const authFetch = async (endpoint, body) => {
    const res = await fetch(`${apiBaseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authFetch('/api/auth/login', { email: form.email, password: form.password });
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match!'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authFetch('/api/auth/register', {
        username: form.name,
        email: form.email,
        password: form.password,
      });
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  
  const handleGoogleLogin = () => {

    window.location.href = `${apiBaseUrl}/api/auth/google`;
  };

  const switchView = (newView) => {
    setForm({ name: '', email: '', password: '', confirm: '' });
    setError('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    navigate(`/${newView}`);
  };

  const cardReveal = {
    hidden: { opacity: 0, y: 46, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1], delayChildren: 0.12, staggerChildren: 0.08 } },
  };
  const cardItem = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  };

  return (
    <motion.div className="auth-shell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, ease: 'easeOut' }}>
      <div className="auth-frame">
        <motion.aside className="auth-showcase" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
          <div className="auth-silk auth-silk-one" />
          <div className="auth-silk auth-silk-two" />
          <div className="auth-orbit" />
          <motion.div className="auth-float auth-float-top" animate={{ y: [0, -8, 0], rotate: [0, 8, 0] }} transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}><Heart size={28} /></motion.div>
          <motion.div className="auth-float auth-float-side" animate={{ y: [0, 10, 0], rotate: [0, -9, 0] }} transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut' }}><Sparkles size={22} /></motion.div>
          <motion.div className="auth-float auth-float-bottom" animate={{ y: [0, -9, 0], rotate: [0, 6, 0] }} transition={{ duration: 6.8, repeat: Infinity, ease: 'easeInOut' }}><Heart size={20} /></motion.div>
          <div className="auth-showcase-content">
            <div className="brand-mark" aria-label="Beauty Rocks">
              <div className="brand-tools"><span /><img src="/img/instruments-cropped.png" alt="" aria-hidden="true" /><span /></div>
              <strong>Beauty</strong><em>Rocks</em>
              <div className="brand-heart"><span /><Heart size={20} /><span /></div>
            </div>
            <div className="showcase-copy">
              <h2>Welcome, <span>Beautiful!</span></h2>
              <div className="mini-heart"><Heart size={18} /></div>
              <p>Your beauty, your time, your way.</p>
              <p>Book appointments, explore exclusive services, and enjoy a luxury salon experience.</p>
            </div>
          </div>
        </motion.aside>

        <motion.section className="auth-form-panel" initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease: 'easeOut' }}>
          <motion.div className="auth-card" whileHover={{ y: -1 }} transition={{ duration: 0.25 }} variants={cardReveal} initial="hidden" animate="show">
            <motion.div variants={cardItem}>
              <Link to="/" className="back-home"><ArrowLeft size={13} />Back to Home</Link>
            </motion.div>

            <motion.div variants={cardItem} className="auth-heading">
              <p>Beauty Rocks</p>
              <h1>{view === 'login' ? 'Welcome Back!' : 'Create Account'}</h1>
              <span>{view === 'login' ? 'Sign in to manage your beauty appointments' : 'Join Beauty Rocks and start your beauty journey'}</span>
            </motion.div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div key={error} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="auth-error-box">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.form key={view} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.28, ease: 'easeInOut' }} onSubmit={view === 'login' ? handleLogin : handleRegister} className="auth-form">
                {view === 'register' && (
                  <InputRow label="Full Name" name="name" type="text" placeholder="Jane Doe" value={form.name} onChange={handleChange} disabled={loading} icon={<UserRound size={16} />} />
                )}
                <InputRow label="Email Address" name="email" type="email" placeholder="jane@example.com" value={form.email} onChange={handleChange} disabled={loading} icon={<Mail size={16} />} />
                <InputRow label="Password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={form.password} onChange={handleChange} disabled={loading} icon={<Lock size={16} />}
                  suffix={<button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                />
                {view === 'register' && (
                  <InputRow label="Confirm Password" name="confirm" type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password" value={form.confirm} onChange={handleChange} disabled={loading} icon={<Lock size={16} />}
                    suffix={<button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">{showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
                  />
                )}
                {view === 'login' && <div className="forgot-password"><a href="#forgot">Forgot password?</a></div>}
                <motion.button type="submit" disabled={loading} whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.99 }} className="submit-button">
                  {loading ? 'Processing...' : view === 'login' ? 'Sign In' : 'Create Account'}
                </motion.button>
              </motion.form>
            </AnimatePresence>

            <motion.div variants={cardItem} className="auth-divider"><span>Or continue with</span></motion.div>

            <motion.div variants={cardItem} className="social-grid">
              {/* Google button — redirects to backend OAuth flow */}
              <button type="button" className="social-button" onClick={handleGoogleLogin} disabled={loading}>
                <span className="google-mark">G</span>
                <span>Google</span>
              </button>
              <button type="button" className="social-button" disabled>
                <span className="apple-mark">●</span>
                <span>Apple</span>
              </button>
            </motion.div>

            <motion.p variants={cardItem} className="auth-switch">
              {view === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => switchView(view === 'login' ? 'register' : 'login')} disabled={loading}>
                {view === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </motion.p>
            <motion.p variants={cardItem} className="terms-copy">
              By continuing, you agree to our <Link to="#">Terms of Service</Link> and <Link to="#">Privacy Policy</Link>.
            </motion.p>
          </motion.div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function InputRow({ label, name, type, placeholder, value, onChange, disabled, icon, suffix }) {
  return (
    <label className="input-row">
      <span>{label}</span>
      <div className="input-shell">
        <span className="input-icon">{icon}</span>
        <input type={type} name={name} placeholder={placeholder} value={value} onChange={onChange} required disabled={disabled} />
        {suffix}
      </div>
    </label>
  );
}