import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  Mail,
  UserRound,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import '../style/Auth.css';

/* ── easings & variants ─────────────────────────────────────── */
const ease = [0.25, 0.46, 0.45, 0.94];
const smoothEase = [0.4, 0.0, 0.2, 1];

const panelVariants = {
  hidden: (dir) => ({ opacity: 0, x: dir === 'left' ? -30 : 30 }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.8, ease, delay: 0.2 },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease },
  },
};

const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
};

/* Collapsible: animates height + opacity smoothly, no layout jump */
const collapseVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: { duration: 0.45, ease: smoothEase },
  },
  show: {
    opacity: 1,
    height: 'auto',
    marginBottom: 0,
    transition: {
      height: { duration: 0.5, ease: smoothEase },
      opacity: { duration: 0.4, delay: 0.1, ease: smoothEase },
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    marginBottom: 0,
    transition: {
      opacity: { duration: 0.25, ease: smoothEase },
      height: { duration: 0.4, delay: 0.1, ease: smoothEase },
    },
  },
};

const forgotVariants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  show: {
    opacity: 1, height: 'auto', marginBottom: 0,
    transition: {
      height: { duration: 0.45, ease: smoothEase },
      opacity: { duration: 0.35, delay: 0.1, ease: smoothEase },
    },
  },
  exit: {
    opacity: 0, height: 0, marginBottom: 0,
    transition: {
      opacity: { duration: 0.2, ease: smoothEase },
      height: { duration: 0.35, delay: 0.08, ease: smoothEase },
    },
  },
};

/* ── SVG icons ──────────────────────────────────────────────── */
function GoogleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function getOAuthErrorMessage(searchParams) {
  const e = searchParams.get('error');
  if (e === 'google_auth_failed') return 'Google login failed. Please try again.';
  if (e === 'server_error') return 'Server error during Google login. Please try again.';
  return '';
}

/* ════════════════════════════════════════════════════════════
   AUTH COMPONENT - with Forgot & Reset Password views
   and ProtectedRoute redirect support
════════════════════════════════════════════════════════════ */
export default function Auth({ apiBaseUrl = 'http://localhost:5000' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // 🔥 IMPORTANT: Pagina de unde a venit userul (setată de ProtectedRoute)
  // Dacă nu există, merge la /home implicit
  const from = location.state?.from?.pathname || '/home';

  // Get current view from URL path
  const getViewFromPath = (pathname) => {
    if (pathname === '/register') return 'register';
    if (pathname === '/forgot-password') return 'forgot';
    if (pathname === '/reset-password') return 'reset';
    return 'login';
  };

  const view = getViewFromPath(location.pathname);
  const isLogin = view === 'login';
  const isRegister = view === 'register';
  const isForgot = view === 'forgot';
  const isReset = view === 'reset';
  
  const resetToken = searchParams.get('token') || '';

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => getOAuthErrorMessage(searchParams));
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle OAuth and verification messages
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') setSuccessMsg('Email verified! You can now sign in.');
  }, [searchParams]);

  useEffect(() => {
    document.body.classList.add('auth-page');
    return () => document.body.classList.remove('auth-page');
  }, []);

  const handleChange = (e) => {
    setForm((c) => ({ ...c, [e.target.name]: e.target.value }));
    setError('');
    setSuccessMsg('');
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

  // 🔥 MODIFICAT: Redirectează înapoi pe pagina de unde a venit userul
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await authFetch('/api/auth/login', { email: form.email, password: form.password });
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      // Redirect înapoi pe pagina protejată de unde a venit, sau /home
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 MODIFICAT: La register trimitem pe /home (cont nou, nu avem de unde să venim)
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
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const data = await authFetch('/api/auth/forgot-password', { email: form.email });
      setSuccessMsg(data.message || 'If that email exists, a reset link has been sent.');
      setForm({ ...form, email: '' });
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match!'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (!resetToken) { setError('Invalid or missing reset token. Please request a new link.'); return; }
    setLoading(true);
    setError('');
    try {
      const data = await authFetch('/api/auth/reset-password', {
        token: resetToken,
        password: form.password,
      });
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      setSuccessMsg('Password reset successfully! Redirecting…');
      setTimeout(() => navigate('/home', { replace: true }), 1800);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 MODIFICAT: Salvează `from` în sessionStorage pentru Google OAuth
  const handleGoogleLogin = () => {
    sessionStorage.setItem('authRedirectFrom', from);
    window.location.href = `${apiBaseUrl}/api/auth/google`;
  };

  const switchView = (newView) => {
    setForm({ name: '', email: '', password: '', confirm: '' });
    setError('');
    setSuccessMsg('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    
    const paths = {
      login: '/login',
      register: '/register',
      forgot: '/forgot-password',
    };
    // Păstrăm `from` în state pentru a fi disponibil în view-ul nou
    navigate(paths[newView] || '/login', { state: { from: location.state?.from } });
  };

  // Dynamic content based on current view
  const getHeadingContent = () => {
    if (isLogin) {
      return {
        title: 'Welcome Back',
        subtitle: 'Sign in to continue your beauty journey',
        spark: '✦',
      };
    }
    if (isRegister) {
      return {
        title: 'Create Account',
        subtitle: 'Join Beauty Rocks and start your journey',
        spark: '✦',
      };
    }
    if (isForgot) {
      return {
        title: 'Forgot Password?',
        subtitle: 'Enter your email and we\'ll send a reset link',
        spark: '✧',
      };
    }
    if (isReset) {
      return {
        title: 'Set New Password',
        subtitle: 'Choose a strong password for your account',
        spark: '⚡',
      };
    }
    return { title: 'Welcome', subtitle: '', spark: '✦' };
  };

  const headingContent = getHeadingContent();

  const getSubmitLabel = () => {
    if (loading) {
      if (isLogin) return 'Signing in…';
      if (isRegister) return 'Creating…';
      if (isForgot) return 'Sending…';
      if (isReset) return 'Resetting…';
    }
    if (isLogin) return 'Sign In';
    if (isRegister) return 'Create Account';
    if (isForgot) return 'Send Reset Link';
    if (isReset) return 'Reset Password';
    return 'Continue';
  };

  const handleSubmit = (e) => {
    if (isLogin) handleLogin(e);
    else if (isRegister) handleRegister(e);
    else if (isForgot) handleForgotPassword(e);
    else if (isReset) handleResetPassword(e);
  };

  return (
    <motion.main
      className={`auth-shell auth-shell-${view}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease }}
    >
      {/* ── LEFT: Image + Logo ─────────────────────────────── */}
      <motion.section
        className="auth-visual"
        aria-hidden="true"
        custom="left"
        variants={panelVariants}
        initial="hidden"
        animate="show"
      >
        <div className="auth-visual-bg" />
        <div className="auth-visual-overlay" />
        <motion.div
          className="auth-logo"
          role="img"
          aria-label="Beauty Rocks"
          variants={logoVariants}
          initial="hidden"
          animate="show"
        />
      </motion.section>

      {/* ── RIGHT: Form ────────────────────────────────────── */}
      <motion.section
        className="auth-panel"
        custom="right"
        variants={panelVariants}
        initial="hidden"
        animate="show"
      >
        {/* Language picker - hidden on forgot/reset */}
        {(isLogin || isRegister) && (
          <button type="button" className="language-button" aria-label="Select language">
            <Globe2 size={14} strokeWidth={1.8} />
            <span>EN</span>
            <ChevronDown size={12} strokeWidth={2} />
          </button>
        )}

        <div className="auth-panel-inner">
          {/* Back to Home link - for forgot/reset */}
          {(isForgot || isReset) && (
            <motion.button
              className="back-home-link"
              onClick={() => navigate('/login', { state: { from: location.state?.from } })}
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </motion.button>
          )}

          {/* Heading */}
          <motion.div
            className="auth-heading"
            key={`heading-${view}`}
            variants={headingVariants}
            initial="hidden"
            animate="show"
          >
            <span className="heading-spark" aria-hidden="true">{headingContent.spark}</span>
            <h1>{headingContent.title}</h1>
            <div className="heading-rule" aria-hidden="true">
              <span /><b>✦</b><span />
            </div>
            <p>{headingContent.subtitle}</p>
          </motion.div>

          {/* Error banner */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                className="auth-error"
                key={error}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success banner */}
          <AnimatePresence mode="wait">
            {successMsg && (
              <motion.div
                className="auth-success"
                key={successMsg}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22, ease }}
              >
                <CheckCircle size={16} style={{ flexShrink: 0 }} />
                {successMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <motion.div className="auth-flow" layout transition={{ layout: { duration: 0.5, ease: smoothEase } }}>
            <motion.form
              className="auth-form"
              layout
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.055 } } }}
              onSubmit={handleSubmit}
            >
              {/* Full Name — register only */}
              <AnimatePresence initial={false}>
                {isRegister && (
                  <motion.div
                    key="name"
                    className="auth-collapsible-field"
                    variants={collapseVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <InputRow
                      label="Full Name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.name}
                      onChange={handleChange}
                      disabled={loading}
                      icon={<UserRound size={17} strokeWidth={1.7} />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Email - shown on login, register, forgot */}
              {(isLogin || isRegister || isForgot) && (
                <motion.div variants={fieldVariants} layout>
                  <InputRow
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                    icon={<Mail size={17} strokeWidth={1.7} />}
                  />
                </motion.div>
              )}

              {/* Password - shown on login, register, reset */}
              {(isLogin || isRegister || isReset) && (
                <motion.div variants={fieldVariants} layout>
                  <InputRow
                    label={isReset ? 'New Password' : 'Password'}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isReset ? 'Choose a strong password' : 'Enter your password'}
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    icon={<LockKeyhole size={17} strokeWidth={1.7} />}
                    suffix={
                      <button
                        type="button"
                        className="input-action"
                        onClick={() => setShowPassword((c) => !c)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword
                          ? <EyeOff size={16} strokeWidth={1.8} />
                          : <Eye size={16} strokeWidth={1.8} />}
                      </button>
                    }
                  />
                </motion.div>
              )}

              {/* Confirm Password — register or reset */}
              <AnimatePresence initial={false}>
                {(isRegister || isReset) && (
                  <motion.div
                    key="confirm"
                    className="auth-collapsible-field"
                    variants={collapseVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                  >
                    <InputRow
                      label="Confirm Password"
                      name="confirm"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={form.confirm}
                      onChange={handleChange}
                      disabled={loading}
                      icon={<LockKeyhole size={17} strokeWidth={1.7} />}
                      suffix={
                        <button
                          type="button"
                          className="input-action"
                          onClick={() => setShowConfirmPassword((c) => !c)}
                          aria-label={showConfirmPassword ? 'Hide' : 'Show'}
                        >
                          {showConfirmPassword
                            ? <EyeOff size={16} strokeWidth={1.8} />
                            : <Eye size={16} strokeWidth={1.8} />}
                        </button>
                      }
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Forgot password link — login only */}
              <AnimatePresence initial={false}>
                {isLogin && (
                  <motion.button
                    type="button"
                    className="forgot-link-button"
                    key="forgot"
                    variants={forgotVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    layout
                    onClick={() => switchView('forgot')}
                  >
                    Forgot password?
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Submit button */}
              <motion.button
                type="submit"
                className="submit-button"
                disabled={loading || (isForgot && !!successMsg)}
                variants={fieldVariants}
                layout
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span>{getSubmitLabel()}</span>
                <ArrowRight size={18} strokeWidth={1.6} />
              </motion.button>
            </motion.form>
          </motion.div>

          {/* Divider & Social — only on login/register */}
          {(isLogin || isRegister) && (
            <>
              <div className="auth-divider">
                <span /><p>or continue with</p><span />
              </div>

              <div className="social-grid">
                <motion.button
                  type="button"
                  className="social-button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease }}
                >
                  <GoogleIcon />
                  <span>Google</span>
                </motion.button>
                <motion.button
                  type="button"
                  className="social-button"
                  disabled
                  aria-disabled="true"
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.18, ease }}
                >
                  <AppleIcon />
                  <span>Apple</span>
                </motion.button>
              </div>
            </>
          )}

          {/* Switch between login/register — only on login/register */}
          {(isLogin || isRegister) && (
            <p className="auth-switch">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <motion.button
                type="button"
                onClick={() => switchView(isLogin ? 'register' : 'login')}
                disabled={loading}
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.18, ease }}
              >
                <span>{isLogin ? 'Create Account' : 'Sign In'}</span>
                <ArrowRight size={16} strokeWidth={1.6} />
              </motion.button>
            </p>
          )}

          {/* Terms — only on login/register */}
          {(isLogin || isRegister) && (
            <p className="terms-note">
              By continuing, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
            </p>
          )}
        </div>
      </motion.section>
    </motion.main>
  );
}

/* ── InputRow ────────────────────────────────────────────────── */
function InputRow({ label, name, type, placeholder, value, onChange, disabled, icon, suffix }) {
  return (
    <label className="input-row">
      <span>{label}</span>
      <div className="input-shell">
        <span className="input-icon">{icon}</span>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required
          disabled={disabled}
          autoComplete={name === 'email' ? 'email' : name === 'password' ? 'current-password' : 'off'}
        />
        {suffix}
      </div>
    </label>
  );
}