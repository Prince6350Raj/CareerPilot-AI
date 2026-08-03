import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, XCircle, Compass } from 'lucide-react';
import './Login.css';

const VerifyEmail = () => {
  const { verifyEmail } = useContext(AuthContext);
  const { token } = useParams();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  
  const hasCalledVerify = useRef(false);

  useEffect(() => {
    // Prevent double execution in React StrictMode
    if (hasCalledVerify.current) return;
    hasCalledVerify.current = true;

    const doVerify = async () => {
      try {
        const data = await verifyEmail(token);
        setStatus('success');
        setMessage(data.message || 'Email successfully verified!');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Verification link is invalid or expired.');
      }
    };
    if (token) {
      doVerify();
    }
  }, [token, verifyEmail]);

  return (
    <div className="login-container">
      <div className="background-decorations">
        <div className="glow-circle glow-1"></div>
        <div className="glow-circle glow-2"></div>
      </div>

      <div className="login-box glass-card animate-fade-in" style={{ textAlign: 'center' }}>
        <div className="login-header" style={{ marginBottom: '1.5rem' }}>
          <div className="brand-logo" style={{ marginBottom: '1rem' }}>
            <Compass size={40} className="brand-logo-icon" />
          </div>
          <h2 className="brand-name">CareerPilot <span className="logo-highlight">AI</span></h2>
        </div>

        <div style={{ margin: '2rem 0' }}>
          {status === 'verifying' && (
            <div>
              <div className="spinner-loader"></div>
              <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Verifying your email address, please wait...</p>
            </div>
          )}
          {status === 'success' && (
            <div>
              <CheckCircle size={48} style={{ color: 'var(--accent-success)', margin: '0 auto 1.25rem', display: 'block' }} />
              <p style={{ color: 'var(--accent-success)', fontWeight: 'bold', fontSize: '1.2rem' }}>Verification Successful!</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{message}</p>
              <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '1.75rem', width: '100%', justifyContent: 'center' }}>
                Go to Dashboard
              </Link>
            </div>
          )}
          {status === 'error' && (
            <div>
              <XCircle size={48} style={{ color: 'var(--accent-error)', margin: '0 auto 1.25rem', display: 'block' }} />
              <p style={{ color: 'var(--accent-error)', fontWeight: 'bold', fontSize: '1.2rem' }}>Verification Failed</p>
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{message}</p>
              <Link to="/login" className="btn btn-secondary" style={{ marginTop: '1.75rem', width: '100%', justifyContent: 'center' }}>
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
