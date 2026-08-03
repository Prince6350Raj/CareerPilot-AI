import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import './Login.css';

const Login = () => {
  const { login, register, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // signin, signup, forgot
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signin') {
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

  return (
    <div className="login-container">
      <div className="background-decorations">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      <div className="login-box glass-card animate-fade-in">
        <div className="login-header">
          <div className="brand-logo">
            <Compass size={40} className="brand-logo-icon" />
          </div>
          <h1 className="brand-name">CareerPilot <span className="logo-highlight">AI</span></h1>
          <p className="brand-tagline">
            {mode === 'signin' && 'Sign in to access your AI Career Copilot'}
            {mode === 'signup' && 'Create your account to initiate career growth'}
            {mode === 'forgot' && 'Reset your password and regain dashboard access'}
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
  );
};

export default Login;
