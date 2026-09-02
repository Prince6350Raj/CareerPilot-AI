import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, 
  Brain, Briefcase, Target, Award, CheckCircle2, ShieldCheck, 
  Zap, Code2, Check, Stars
} from 'lucide-react';
import './Login.css';

const SHOWCASE_TABS = [
  {
    id: 'resume',
    icon: Sparkles,
    title: 'ATS Resume Engine',
    subtitle: 'Score 90+ with real-time keyword optimization',
    tag: 'ATS 96% Match',
    previewType: 'resume'
  },
  {
    id: 'interview',
    icon: Brain,
    title: 'AI Mock Interview',
    subtitle: 'Verbal speech assessments powered by Gemini 3.6 Flash',
    tag: 'Live Evaluation',
    previewType: 'interview'
  },
  {
    id: 'sandbox',
    icon: Code2,
    title: 'DSA Coding Sandbox',
    subtitle: '120+ Curated LeetCode problems with 0ms execution',
    tag: 'Multi-Language',
    previewType: 'sandbox'
  },
  {
    id: 'company',
    icon: Briefcase,
    title: 'Company Prep Guides',
    subtitle: 'Verified interview rounds for Google, Amazon, Microsoft',
    tag: '50+ Tech Firms',
    previewType: 'company'
  }
];

const CAREER_TRACKS = [
  { id: 'fullstack', label: 'Full Stack SDE', icon: '🚀' },
  { id: 'ai_ml', label: 'AI & ML Engineer', icon: '🧠' },
  { id: 'cloud', label: 'Cloud & DevOps', icon: '☁️' },
  { id: 'dsa', label: 'DSA & FAANG Prep', icon: '🎯' },
  { id: 'mobile', label: 'Mobile App Dev', icon: '📱' },
  { id: 'security', label: 'Cybersecurity', icon: '🛡️' }
];

// Interactive Neural Synapse Canvas & Hologram Background Component
const NeuralTechBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactive coordinates
    const mouse = { x: null, y: null, radius: 140 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Neural Synapse Particles
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles = [];

    class SynapseParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.7;
        this.vy = (Math.random() - 0.5) * 0.7;
        this.radius = Math.random() * 2.2 + 1.2;
        this.baseAlpha = Math.random() * 0.4 + 0.3;
        this.pulseSpeed = Math.random() * 0.02 + 0.01;
        this.pulse = Math.random() * Math.PI;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        // Bounce from edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction attraction/deflection
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.8;
            this.y -= (dy / dist) * force * 1.8;
          }
        }
      }

      draw() {
        const currentAlpha = this.baseAlpha + Math.sin(this.pulse) * 0.2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(2, 132, 199, ${Math.max(currentAlpha, 0.15)})`;
        ctx.shadowColor = '#0284c7';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new SynapseParticle());
    }

    const connectParticles = () => {
      const maxDistance = 140;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const opacity = 1 - dist / maxDistance;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(2, 132, 199, ${opacity * 0.22})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Connect to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const opacity = 1 - dist / mouse.radius;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(37, 99, 235, ${opacity * 0.45})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="auth-background-neural-wrapper">
      <canvas ref={canvasRef} className="neural-canvas-layer" />
      <div className="grid-blueprint-overlay" />

      {/* Floating 3D Tech Hologram Badges in Background */}
      <div className="floating-hologram-badge holo-1">
        <span className="holo-icon">🧠</span>
        <div className="holo-info">
          <strong>Gemini 3.6 Flash</strong>
          <small>Neural Engine Active</small>
        </div>
      </div>

      <div className="floating-hologram-badge holo-2">
        <span className="holo-icon">📊</span>
        <div className="holo-info">
          <strong>ATS 98% Match</strong>
          <small>Resume Keyword Scorer</small>
        </div>
      </div>

      <div className="floating-hologram-badge holo-3">
        <span className="holo-icon">⚡</span>
        <div className="holo-info">
          <strong>120+ Curated DSA</strong>
          <small>FAANG LeetCode Matrix</small>
        </div>
      </div>

      <div className="floating-hologram-badge holo-4">
        <span className="holo-icon">🎯</span>
        <div className="holo-info">
          <strong>AI Mock Copilot</strong>
          <small>Real-Time Verbal Scoring</small>
        </div>
      </div>

      <div className="floating-hologram-badge holo-5">
        <span className="holo-icon">🔒</span>
        <div className="holo-info">
          <strong>256-Bit Guard</strong>
          <small>Enterprise JWT Auth</small>
        </div>
      </div>

      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>
    </div>
  );
};

const Login = () => {
  const { login, register, guestLogin, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetTrack, setTargetTrack] = useState('fullstack');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Interactive Left Showcase State
  const [activeTabIdx, setActiveTabIdx] = useState(0);
  const [isHoveredShowcase, setIsHoveredShowcase] = useState(false);

  // Auto-rotate showcase tabs every 5 seconds if not hovered
  useEffect(() => {
    if (isHoveredShowcase) return;
    const interval = setInterval(() => {
      setActiveTabIdx((prev) => (prev + 1) % SHOWCASE_TABS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isHoveredShowcase]);

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '#e2e8f0' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, text: 'Weak', color: '#ef4444' };
      case 2:
        return { score: 50, text: 'Fair', color: '#f59e0b' };
      case 3:
        return { score: 75, text: 'Good', color: '#3b82f6' };
      case 4:
        return { score: 100, text: 'Strong', color: '#10b981' };
      default:
        return { score: 0, text: '', color: '#e2e8f0' };
    }
  };

  const passStrength = getPasswordStrength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (mode === 'signin') {
        sessionStorage.clear();
        await login(email, password);
        navigate('/dashboard');
      } else if (mode === 'signup') {
        const data = await register(name, email, password);
        if (data.token) {
          navigate('/dashboard');
        } else {
          setMessage(data.message || 'Account created successfully! Check email for verification.');
          setName('');
          setEmail('');
          setPassword('');
        }
      } else if (mode === 'forgot') {
        const data = await forgotPassword(email);
        setMessage(data.message || 'Password reset instructions sent to your email.');
        setEmail('');
      }
    } catch (err) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemoLogin = async () => {
    setGuestLoading(true);
    setError('');
    setMessage('');
    try {
      sessionStorage.clear();
      await guestLogin();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not start guest session. Please try regular login.');
    } finally {
      setGuestLoading(false);
    }
  };

  const currentTab = SHOWCASE_TABS[activeTabIdx];

  return (
    <div className="auth-ultra-page">
      {/* Interactive Neural Synapse Canvas & AI Background */}
      <NeuralTechBackground />

      {/* Main Glassmorphic Split Card */}
      <div className="auth-master-card">
        {/* ================= LEFT SIDE: INTERACTIVE SHOWCASE ================= */}
        <div 
          className="auth-showcase-panel"
          onMouseEnter={() => setIsHoveredShowcase(true)}
          onMouseLeave={() => setIsHoveredShowcase(false)}
        >
          {/* Top Brand Tag */}
          <div className="showcase-brand-header">
            <div className="brand-badge-pill">
              <div className="brand-logo-icon">
                <Compass size={22} className="compass-spin" />
              </div>
              <span className="brand-text">CareerPilot <strong className="ai-gradient-text">AI</strong></span>
            </div>
            <div className="engine-status-tag">
              <span className="live-dot-pulse"></span>
              <span>Gemini 3.6 Flash Active</span>
            </div>
          </div>

          <div className="showcase-headline-block">
            <h2 className="showcase-main-title">
              Accelerate Your <span className="title-gradient">Dream Tech Career</span>
            </h2>
            <p className="showcase-subtext">
              The all-in-one neural ecosystem to optimize resumes, master 120+ coding challenges, and clear FAANG technical interviews.
            </p>
          </div>

          {/* Interactive Live Demo Simulation Widget */}
          <div className="live-demo-interactive-widget">
            <div className="widget-topbar">
              <div className="widget-dots">
                <span className="dot dot-red"></span>
                <span className="dot dot-yellow"></span>
                <span className="dot dot-green"></span>
              </div>
              <div className="widget-title-badge">
                <currentTab.icon size={14} />
                <span>{currentTab.title}</span>
              </div>
              <span className="widget-status-badge">{currentTab.tag}</span>
            </div>

            <div className="widget-body">
              {currentTab.previewType === 'resume' && (
                <div className="preview-resume-content">
                  <div className="ats-score-meter-row">
                    <div className="ats-circle-badge">
                      <span className="ats-num">96</span>
                      <span className="ats-lbl">ATS SCORE</span>
                    </div>
                    <div className="ats-meter-details">
                      <div className="meter-label-row">
                        <strong>Software Architect Match</strong>
                        <span className="text-success font-bold">Excellent Match</span>
                      </div>
                      <div className="ats-progress-track">
                        <div className="ats-progress-fill" style={{ width: '96%' }}></div>
                      </div>
                      <div className="ats-tags-row">
                        <span className="ats-tag">✅ React 19</span>
                        <span className="ats-tag">✅ Python FastAPI</span>
                        <span className="ats-tag">✅ System Design</span>
                        <span className="ats-tag">✅ MongoDB</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentTab.previewType === 'interview' && (
                <div className="preview-interview-content">
                  <div className="speech-wave-banner">
                    <div className="soundwave-anim">
                      <span></span><span></span><span></span><span></span><span></span><span></span><span></span>
                    </div>
                    <span className="speech-status">Verbal Answer Analysis Stream</span>
                  </div>
                  <div className="chat-mini-dialog">
                    <div className="mini-bubble ai">
                      <strong>AI Interviewer:</strong> "How do you optimize React render cycles in large-scale trees?"
                    </div>
                    <div className="mini-bubble user">
                      <strong>Candidate:</strong> "By using useMemo, React.memo with custom comparison, and state colocation..."
                    </div>
                  </div>
                  <div className="interview-score-chip">
                    <CheckCircle2 size={15} color="#10b981" />
                    <span>Clarity: <strong>9.4/10</strong> • Technical Precision: <strong>9.8/10</strong></span>
                  </div>
                </div>
              )}

              {currentTab.previewType === 'sandbox' && (
                <div className="preview-sandbox-content">
                  <div className="sandbox-header-row">
                    <span className="sandbox-prob-title">Problem #242 • Valid Anagram</span>
                    <span className="sandbox-badge-easy">Easy</span>
                  </div>
                  <div className="mini-code-window">
                    <code>
                      <span className="kw">function</span> <span className="fn">isAnagram</span>(s, t) &#123;<br/>
                      &nbsp;&nbsp;<span className="kw">if</span> (s.length !== t.length) <span className="kw">return</span> <span className="bool">false</span>;<br/>
                      &nbsp;&nbsp;<span className="kw">return</span> s.split(<span className="str">''</span>).sort().join(<span className="str">''</span>) === t.split(<span className="str">''</span>).sort().join(<span className="str">''</span>);<br/>
                      &#125;
                    </code>
                  </div>
                  <div className="sandbox-test-status">
                    <span className="test-pass-pill">✅ 3/3 Testcases Passed</span>
                    <span className="test-time">⚡ Runtime: 0.2ms</span>
                  </div>
                </div>
              )}

              {currentTab.previewType === 'company' && (
                <div className="preview-company-content">
                  <div className="company-logos-row">
                    <span className="comp-pill active">Google</span>
                    <span className="comp-pill">Microsoft</span>
                    <span className="comp-pill">Amazon</span>
                    <span className="comp-pill">Uber</span>
                  </div>
                  <div className="company-rounds-grid">
                    <div className="round-card">
                      <span className="round-idx">R1</span>
                      <div>
                        <strong>Online Assessment</strong>
                        <p>Graph BFS / DP Hard</p>
                      </div>
                    </div>
                    <div className="round-card">
                      <span className="round-idx">R2</span>
                      <div>
                        <strong>System Design</strong>
                        <p>Distributed Caching & Sharding</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Feature Selectors */}
          <div className="showcase-tabs-nav">
            {SHOWCASE_TABS.map((tab, idx) => {
              const Icon = tab.icon;
              const isActive = activeTabIdx === idx;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`showcase-nav-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTabIdx(idx)}
                >
                  <div className="nav-icon-wrap">
                    <Icon size={16} />
                  </div>
                  <div className="nav-text-wrap">
                    <span className="nav-title">{tab.title}</span>
                    <span className="nav-sub">{tab.subtitle}</span>
                  </div>
                  {isActive && <div className="active-glow-bar" />}
                </button>
              );
            })}
          </div>

          {/* Trust proof bar */}
          <div className="showcase-trust-bar">
            <div className="trust-item">
              <ShieldCheck size={16} className="text-primary" />
              <span>256-Bit Encrypted</span>
            </div>
            <div className="trust-item">
              <Zap size={16} className="text-primary" />
              <span>Sub-second AI Speed</span>
            </div>
            <div className="trust-item">
              <Award size={16} className="text-primary" />
              <span>10,000+ Placements</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: AUTHENTICATION FORM ================= */}
        <div className="auth-form-panel">
          {/* Mode Switcher Pill Slider */}
          <div className="auth-mode-pill-container">
            <button
              type="button"
              className={`mode-tab-btn ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`mode-tab-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
            >
              Create Account
            </button>
          </div>

          {/* Form Header */}
          <div className="auth-form-header">
            <h1 className="auth-heading">
              {mode === 'signin' && 'Welcome Back'}
              {mode === 'signup' && 'Get Started Free'}
              {mode === 'forgot' && 'Reset Password'}
            </h1>
            <p className="auth-subheading">
              {mode === 'signin' && 'Enter your credentials to access your personal AI Copilot workspace.'}
              {mode === 'signup' && 'Create your account in seconds to begin optimizing your career.'}
              {mode === 'forgot' && 'Enter your registered email address to receive password reset link.'}
            </p>
          </div>

          {/* Alerts */}
          {error && (
            <div className="auth-alert error-banner">
              <span>⚠️ {error}</span>
            </div>
          )}
          {message && (
            <div className="auth-alert success-banner">
              <span>✅ {message}</span>
            </div>
          )}

          {/* 1-Click Instant Guest / Recruiter Demo Button */}
          {mode === 'signin' && (
            <div className="guest-quick-access-box">
              <button
                type="button"
                className="guest-demo-btn"
                onClick={handleGuestDemoLogin}
                disabled={guestLoading}
              >
                <div className="guest-btn-content">
                  <div className="guest-icon-pulse">
                    <Stars size={18} />
                  </div>
                  <div className="guest-btn-texts">
                    <strong>Explore as Guest Developer</strong>
                    <span>1-Click Instant Demo • No credentials required</span>
                  </div>
                </div>
                <ArrowRight size={18} className="guest-arrow" />
              </button>

              <div className="auth-divider-row">
                <span className="divider-line"></span>
                <span className="divider-text">OR CONTINUE WITH EMAIL</span>
                <span className="divider-line"></span>
              </div>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="auth-inputs-form">
            {mode === 'signup' && (
              <>
                <div className="form-field-group">
                  <label className="field-label" htmlFor="auth-name">Full Name</label>
                  <div className="field-input-wrap">
                    <User size={18} className="field-icon" />
                    <input
                      id="auth-name"
                      type="text"
                      className="field-control"
                      placeholder="e.g. Prince Raj"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Interactive Career Track Picker */}
                <div className="form-field-group">
                  <label className="field-label">Target Role / Track</label>
                  <div className="track-picker-grid">
                    {CAREER_TRACKS.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        className={`track-pill-btn ${targetTrack === t.id ? 'selected' : ''}`}
                        onClick={() => setTargetTrack(t.id)}
                      >
                        <span className="track-emoji">{t.icon}</span>
                        <span className="track-name">{t.label}</span>
                        {targetTrack === t.id && <Check size={12} className="track-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="form-field-group">
              <label className="field-label" htmlFor="auth-email">Email Address</label>
              <div className="field-input-wrap">
                <Mail size={18} className="field-icon" />
                <input
                  id="auth-email"
                  type="email"
                  className="field-control"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div className="form-field-group">
                <div className="field-label-row">
                  <label className="field-label" htmlFor="auth-pass">Password</label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      className="forgot-link-btn"
                      onClick={() => { setMode('forgot'); setError(''); setMessage(''); }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="field-input-wrap">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="auth-pass"
                    type={showPassword ? 'text' : 'password'}
                    className="field-control"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="pass-visibility-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Live Password Strength Meter on Signup */}
                {mode === 'signup' && password.length > 0 && (
                  <div className="password-strength-container">
                    <div className="strength-bar-track">
                      <div 
                        className="strength-bar-fill"
                        style={{ 
                          width: `${passStrength.score}%`, 
                          background: passStrength.color 
                        }}
                      />
                    </div>
                    <div className="strength-caption-row">
                      <span>Strength: <strong style={{ color: passStrength.color }}>{passStrength.text}</strong></span>
                      <span className="strength-hint">8+ chars with numbers & symbols</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Primary Submit Button */}
            <button 
              type="submit" 
              className="auth-primary-submit-btn" 
              disabled={loading || guestLoading}
            >
              {loading ? (
                <div className="btn-spinner-row">
                  <span className="spinner-dot"></span>
                  <span>Authenticating...</span>
                </div>
              ) : (
                <>
                  <span>
                    {mode === 'signin' && 'Sign In to Workspace'}
                    {mode === 'signup' && 'Create Free Account'}
                    {mode === 'forgot' && 'Send Reset Instructions'}
                  </span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Form Footer Switcher */}
          <div className="auth-footer-navigation">
            {mode === 'signin' && (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                >
                  Create an account
                </button>
              </p>
            )}
            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
                >
                  Sign in here
                </button>
              </p>
            )}
            {mode === 'forgot' && (
              <p>
                Remembered your password?{' '}
                <button
                  type="button"
                  className="footer-nav-link"
                  onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
                >
                  Back to Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
