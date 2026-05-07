import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import '../style/Auth.css';

export default function Auth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { authType } = useParams();
  
  // Setează view-ul bazat pe URL
  const [view, setView] = useState(() => {
    if (location.pathname === '/register') return 'register';
    return 'login';
  });

  const [form, setForm] = useState({
    name: '',
    email: '',  
    password: '',
    confirm: '',
  });

  // Ascultă schimbările de URL
  useEffect(() => {
    if (location.pathname === '/register') {
      setView('register');
    } else if (location.pathname === '/login') {
      setView('login');
    }
  }, [location.pathname]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // TODO: logica de login
      console.log('Login:', { email: form.email, password: form.password });
      
      // Salvează token-ul (dacă ai)
      // localStorage.setItem('token', response.data.token);
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Validare parolă
    if (form.password !== form.confirm) {
      alert('Passwords do not match!');
      return;
    }
    
    try {
      // TODO: logica de register
      console.log('Register:', { name: form.name, email: form.email, password: form.password });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const switchView = (newView) => {
    setForm({ name: '', email: '', password: '', confirm: '' });
    // Navighează la URL-ul corespunzător
    navigate(`/${newView}`);
  };

  return (
    <div className="auth-wrapper">
      <div className={`auth-card ${view === 'register' ? 'auth-card--register' : ''}`}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-box">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="auth-title">
          {view === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="auth-subtitle">
          {view === 'login'
            ? 'Sign in to continue to your account'
            : 'Fill in the details to get started'}
        </p>

        {/* Google button */}
        <button className="auth-google-btn">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908C16.658 14.015 17.64 11.707 17.64 9.2z" fill="#4285F4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
            <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="auth-divider"><span>OR</span></div>

        {/* Form */}
        <form onSubmit={view === 'login' ? handleLogin : handleRegister} className="auth-form">

          {view === 'register' && (
            <div className="auth-field">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {view === 'register' && (
            <div className="auth-field">
              <label htmlFor="confirm">Confirm password</label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                placeholder="••••••••"
                value={form.confirm}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <button type="submit" className="auth-submit-btn">
            {view === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        {/* Footer switch */}
        <p className="auth-footer">
          {view === 'login' ? (
            <>No account?{' '}
              <button className="auth-link-btn" onClick={() => switchView('register')}>
                Register
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button className="auth-link-btn" onClick={() => switchView('login')}>
                Sign in
              </button>
            </>
          )}
        </p>

      </div>
    </div>
  );
}