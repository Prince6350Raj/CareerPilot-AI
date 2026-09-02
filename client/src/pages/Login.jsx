import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, Brain, Cpu, Activity, Briefcase, GraduationCap, Target, TrendingUp, Award } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // signin, signup, forgot
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light'); // Sync with global theme (default light/frosted glass)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sync theme selection to document root attributes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signin') {
        sessionStorage.clear(); // Reset welcomes for a fresh session
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'signup') {
        const data = await register(name, email, password);
        setMessage(data.message || 'Registration successful! Check your email console for the verification link.');
        setName('');
        setEmail('');
        setPassword('');
      } else if (mode === 'forgot') {
        const data = await forgotPassword(email);
        setMessage(data.message || 'Password reset link simulated in server console.');
        setEmail('');
      }
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const themeClassMap = {
    'dark': 'space-blue',
    'light': 'frosted-glass',
    'cyberpunk': 'cyberpunk-gold',
    'emerald': 'emerald-forest',
    'sakura': 'frosted-slate',
    'ocean': 'ocean-blue',
    'goldlight': 'golden-pastel',
    'whiteblue': 'white-blue'
  };

  const currentThemeClass = themeClassMap[theme] || 'frosted-glass';

  return (
    <div className={`login-container theme-${currentThemeClass}`}>
      {/* Theme Selector Dropdown */}
      <div className="theme-selector-container">
        <select 
          value={theme} 
          onChange={(e) => setTheme(e.target.value)}
          className="theme-select-control"
        >
          <option value="dark">🌌 Space Blue</option>
          <option value="light">❄️ Frosted Glass</option>
          <option value="cyberpunk">⚡ Cyberpunk Gold</option>
          <option value="emerald">🌲 Emerald Forest</option>
          <option value="sakura">🌸 Frosted Slate</option>
          <option value="ocean">🌊 Ocean Blue</option>
          <option value="goldlight">👑 Golden Pastel</option>
          <option value="whiteblue">💎 White, Grey & Blue</option>
        </select>
      </div>

      {/* Floating Animated Particles & Career Icons in Background */}
      <div className="background-decorations">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
        <div className="glow-circle glow-3"></div>
        
        {/* Floating Career Path Indicators */}
        <div className="career-icon-float cif-1">
          <Briefcase size={48} strokeWidth={1} />
        </div>
        <div className="career-icon-float cif-2">
          <GraduationCap size={58} strokeWidth={1} />
        </div>
        <div className="career-icon-float cif-3">
          <Target size={52} strokeWidth={1} />
        </div>
        <div className="career-icon-float cif-4">
          <TrendingUp size={44} strokeWidth={1} />
        </div>
        <div className="career-icon-float cif-5">
          <Award size={48} strokeWidth={1} />
        </div>
        <div className="career-icon-float cif-6">
          <Brain size={50} strokeWidth={1} />
        </div>
      </div>

      <div className="login-split-wrapper">
        {/* Left Side: Product Showcase */}
        <div className="login-showcase animate-slide-in-left">
          <div className="showcase-header">
            <div className="brand-logo-glow">
              <Compass size={44} className="brand-logo-icon-pulse" />
            </div>
            <h1 className="brand-title">CareerPilot <span className="highlight-ai">AI</span></h1>
            <p className="showcase-subtitle">Your Ultimate Intelligent Placement & Career Copilot</p>
          </div>

          <p className="showcase-desc">
            An advanced AI-powered ecosystem designed to analyze profiles, optimize resumes, guide company-specific preparations, and simulate mock interviews in real-time.
          </p>

          <div className="features-grid">
            <div className="feature-item-glow">
              <div className="feat-icon-box"><Sparkles size={20} /></div>
              <div>
                <h4>Resume Analyzer</h4>
                <p>Real-time ATS parsing & score optimization checklist</p>
              </div>
            </div>
            <div className="feature-item-glow">
              <div className="feat-icon-box"><Brain size={20} /></div>
              <div>
                <h4>Simulated Interviews</h4>
                <p>Gemini AI powered realistic verbal mock assessments</p>
              </div>
            </div>
            <div className="feature-item-glow">
              <div className="feat-icon-box"><Briefcase size={20} /></div>
              <div>
                <h4>Company Prep Guides</h4>
                <p>Verified round structures & roadmaps for top tech firms</p>
              </div>
            </div>
            <div className="feature-item-glow">
              <div className="feat-icon-box"><Activity size={20} /></div>
              <div>
                <h4>Telemetry & Logs</h4>
                <p>Real-time server query stream & system diagnostics cockpit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Frosted Card */}
        <div className="login-form-side animate-scale-up">
          <div className="login-box glass-card">
            <div className="login-header">
              <h2 className="form-greeting">
                {mode === 'signin' && 'Welcome Back'}
                {mode === 'signup' && 'Create Account'}
                {mode === 'forgot' && 'Reset Password'}
              </h2>
              <p className="brand-tagline">
                {mode === 'signin' && 'Sign in to access your AI Career Copilot'}
                {mode === 'signup' && 'Start your career optimization journey'}
                {mode === 'forgot' && 'Enter your email to regain platform access'}
              </p>
            </div>

            {error && <div className="alert-message error-alert">{error}</div>}
            {message && <div className="alert-message success-alert">{message}</div>}

            <form onSubmit={handleSubmit} className="login-form">
              {mode === 'signup' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="reg-name">Full Name</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      id="reg-name"
                      className="form-control"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="login-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    id="login-email"
                    className="form-control"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="form-group">
                  <div className="label-row">
                    <label className="form-label" htmlFor="login-password">Password</label>
                    {mode === 'signin' && (
                      <span className="form-link-span" onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}>
                        Forgot?
                      </span>
                    )}
                  </div>
                  <div className="input-with-icon">
                    <Lock size={18} className="input-icon" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              <button type="submit" className="btn btn-primary login-submit-btn" disabled={loading}>
                <span>{loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Instructions'}</span>
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="login-footer">
              {mode === 'signin' && (
                <p>
                  New to CareerPilot?{' '}
                  <span className="form-link-span highlight-link" onClick={() => { setMode('signup'); setError(''); setMessage(''); }}>
                    Sign Up Now
                  </span>
                </p>
              )}
              {mode === 'signup' && (
                <p>
                  Already have an account?{' '}
                  <span className="form-link-span highlight-link" onClick={() => { setMode('signin'); setError(''); setMessage(''); }}>
                    Sign In
                  </span>
                </p>
              )}
              {mode === 'forgot' && (
                <p>
                  Remember password?{' '}
                  <span className="form-link-span highlight-link" onClick={() => { setMode('signin'); setError(''); setMessage(''); }}>
                    Back to Sign In
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
