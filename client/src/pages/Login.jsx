import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Compass, Mail, Lock, User, ArrowRight, Eye, EyeOff, Sparkles, 
  Brain, Briefcase, Target, Award, CheckCircle2, ShieldCheck, 
  Zap, Code2, Check, Stars, Volume2, VolumeX, X, Info, GraduationCap,
  Play, Pause, ChevronRight, CheckCircle, HelpCircle, Palette
} from 'lucide-react';
import NeuralCanvasBackground from '../components/NeuralCanvasBackground';
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

// Project Details & AI Voice Narration Modal
const ProjectOverviewModal = ({ isOpen, onClose }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef(null);

  const NARRATION_TEXT = 
    "Welcome to CareerPilot AI, your intelligent placement and career copilot. " +
    "Engineered for students, job seekers, and aspiring software engineers, CareerPilot AI equips you with ATS resume scoring, " +
    "Gemini 3.6 Flash verbal mock interviews, over 120 curated coding sandbox challenges, and verified FAANG hiring roadmaps. " +
    "Let CareerPilot AI power your journey to landing your dream tech career!";

  // Stop speech synthesis on modal close or unmount
  const stopVoice = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopVoice();
    }
  }, [isOpen]);

  const handleToggleVoice = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      stopVoice();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(NARRATION_TEXT);
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    // Pick English natural voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Karen')) && v.lang.startsWith('en')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="project-modal-backdrop" onClick={onClose}>
      <div className="project-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="modal-top-header">
          <div className="modal-badge-group">
            <div className="modal-logo-icon">
              <Compass size={22} className="compass-spin" />
            </div>
            <div>
              <h3 className="modal-project-title">CareerPilot <span className="ai-gradient-text">AI</span></h3>
              <p className="modal-project-tagline">Next-Gen Placement & Career Intelligence Platform</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* AI Voice Narration Banner */}
        <div className={`ai-voice-narrator-bar ${isSpeaking ? 'active-speaking' : ''}`}>
          <div className="narrator-left">
            <div className="narrator-soundwave">
              {isSpeaking ? (
                <>
                  <span></span><span></span><span></span><span></span><span></span>
                </>
              ) : (
                <Sparkles size={18} className="text-primary" />
              )}
            </div>
            <div className="narrator-text">
              <strong>{isSpeaking ? 'AI Voice Assistant Speaking...' : 'Interactive AI Voice Introduction'}</strong>
              <small>Listen to an overview of CareerPilot AI</small>
            </div>
          </div>
          <button 
            type="button" 
            className={`voice-action-btn ${isSpeaking ? 'btn-stop' : 'btn-play'}`}
            onClick={handleToggleVoice}
          >
            {isSpeaking ? (
              <>
                <VolumeX size={16} />
                <span>Stop Voice</span>
              </>
            ) : (
              <>
                <Volume2 size={16} />
                <span>Play Voice Intro</span>
              </>
            )}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="modal-content-body">
          {/* Target Audience Section */}
          <div className="overview-section">
            <h4 className="section-title">
              <span className="section-num">01</span> Who is this Platform For? (Target Audience)
            </h4>
            <div className="target-cards-grid">
              <div className="target-card">
                <span className="target-emoji">🎓</span>
                <strong>Students & Freshers</strong>
                <p>Master college placement drives, campus interviews, and foundational Data Structures & Algorithms.</p>
              </div>
              <div className="target-card">
                <span className="target-emoji">💻</span>
                <strong>Aspiring Software Engineers</strong>
                <p>Target product companies, high-growth tech startups, and FAANG technical interview loops.</p>
              </div>
              <div className="target-card">
                <span className="target-emoji">🚀</span>
                <strong>Career Pivoters & Switchers</strong>
                <p>Transition into tech and secure high-paying developer roles with structured career roadmaps.</p>
              </div>
            </div>
          </div>

          {/* Core Features Section */}
          <div className="overview-section">
            <h4 className="section-title">
              <span className="section-num">02</span> Core Features & Capabilities
            </h4>
            <div className="features-list-grid">
              <div className="feature-box">
                <div className="feat-header">
                  <Sparkles size={16} className="text-primary" />
                  <strong>1. ATS Resume Analyzer Engine</strong>
                </div>
                <p>Parses resumes in real time, generates 0-100 ATS scores, and provides instant checklists of missing keywords.</p>
              </div>

              <div className="feature-box">
                <div className="feat-header">
                  <Brain size={16} className="text-primary" />
                  <strong>2. AI Verbal Mock Interviews (Gemini 3.6 Flash)</strong>
                </div>
                <p>Conducts interactive voice interviews, grading communication clarity and technical accuracy on a 10-point scale.</p>
              </div>

              <div className="feature-box">
                <div className="feat-header">
                  <Code2 size={16} className="text-primary" />
                  <strong>3. 120+ DSA Coding Sandbox</strong>
                </div>
                <p>LeetCode-style interactive code editor with multi-language test runners, runtime metrics, and permanent progress tracking.</p>
              </div>

              <div className="feature-box">
                <div className="feat-header">
                  <Briefcase size={16} className="text-primary" />
                  <strong>4. Company-Specific Prep Matrices</strong>
                </div>
                <p>Verified hiring rounds, past interview questions, and insider tips for 50+ top firms including Google, Amazon, and Microsoft.</p>
              </div>

              <div className="feature-box">
                <div className="feat-header">
                  <Compass size={16} className="text-primary" />
                  <strong>5. 24/7 AI Career Advisor Copilot</strong>
                </div>
                <p>Instant career guidance, personalized learning paths, portfolio reviews, and on-demand skill gap analysis.</p>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="overview-section">
            <h4 className="section-title">
              <span className="section-num">03</span> Why Choose CareerPilot AI?
            </h4>
            <div className="why-us-banner">
              <div className="why-point">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <strong>All-in-One Placement Suite:</strong> Eliminate multiple paid subscriptions—all resume tools, coding IDE, and mock interviews are unified in one place.
                </div>
              </div>
              <div className="why-point">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <strong>Powered by Gemini 3.6 Flash:</strong> Experience sub-second AI response times and highly accurate technical feedback.
                </div>
              </div>
              <div className="why-point">
                <CheckCircle2 size={18} className="text-success" />
                <div>
                  <strong>100% Free & Open Access:</strong> Instant 1-click guest access allows recruiters and students to explore every feature with zero friction.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-bottom-footer" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button 
            type="button" 
            className="btn-modal-gotit" 
            style={{ flex: 1 }}
            onClick={onClose}
          >
            Got It! Start Exploring CareerPilot AI
          </button>
          <button 
            type="button" 
            className="btn-modal-gotit" 
            style={{ background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#ffffff', border: 'none', minWidth: '180px' }}
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('show-tech-preloader'));
            }}
          >
            🎬 Launch AI Intro Showcase
          </button>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const { login, register, guestLogin, forgotPassword } = useContext(AuthContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'whiteblue');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guestLoading, setGuestLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Sync theme selection to document root attributes & localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Project details modal state
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

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
  const isPasswordMatch = mode === 'signup' && confirmPassword.length > 0 && password === confirmPassword;
  const isPasswordMismatch = mode === 'signup' && confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Signup Validation
    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password confirmation.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    setLoading(true);

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
          setConfirmPassword('');
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
    <div className="auth-ultra-page" data-theme={theme}>
      {/* Top Navigation Bar (Theme Switcher + Mentor Intro Launcher) */}
      <div className="auth-top-navbar">
        <button
          type="button"
          className="btn-mentor-intro-pill"
          onClick={() => window.dispatchEvent(new CustomEvent('show-tech-preloader'))}
          title="Click to replay full AI Launch Diagnostics"
        >
          <Sparkles size={14} className="text-primary" />
          <span>AI Launch Intro</span>
        </button>

        <div className="theme-pill-glass">
          <Palette size={15} className="theme-pill-icon" />
          <select
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            className="theme-dropdown-select"
            aria-label="Select Theme"
          >
            <option value="blue-orange">🔥 Blue & Orange</option>
            <option value="blue-mobile">📱 Blue Mobile</option>
            <option value="white-bg">⚪ White BG</option>
            <option value="whiteblue">💎 White & Royal Blue</option>
            <option value="dark">🌌 Space Blue</option>
            <option value="light">❄️ Frosted Glass</option>
            <option value="cyberpunk">⚡ Cyberpunk Gold</option>
            <option value="emerald">🌲 Emerald Forest</option>
            <option value="sakura">🌸 Frosted Slate</option>
            <option value="ocean">🌊 Ocean Blue</option>
            <option value="goldlight">👑 Golden Pastel</option>
            <option value="redlight">🔴 Crimson White</option>
            <option value="orangelight">🟠 Sunset Light</option>
            <option value="greenlight">🟢 Mint Light</option>
            <option value="skyblue">☁️ Sky Blue</option>
          </select>
        </div>
      </div>

      {/* Interactive Clean Neural Synapse Canvas & AI Background */}
      <NeuralCanvasBackground theme={theme} />

      {/* Project Overview Details & AI Voice Modal */}
      <ProjectOverviewModal 
        isOpen={isProjectModalOpen} 
        onClose={() => setIsProjectModalOpen(false)} 
      />

      {/* Main Glassmorphic Split Card */}
      <div className="auth-master-card tech-glow-card">
        {/* SoftSynth Style HUD 4-Corner Targeting Brackets */}
        <div className="vh-corners">
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* ================= LEFT SIDE: STREAMLINED SHOWCASE ================= */}
        <div 
          className="auth-showcase-panel"
          onMouseEnter={() => setIsHoveredShowcase(true)}
          onMouseLeave={() => setIsHoveredShowcase(false)}
        >
          {/* Top Brand Tag with Click-To-View-Details Action */}
          <div className="showcase-brand-header">
            <button 
              type="button" 
              className="brand-badge-pill interactive-brand-btn"
              onClick={() => setIsProjectModalOpen(true)}
              title="Click to view full CareerPilot AI project features & listen to AI Voice introduction"
            >
              <div className="brand-logo-icon">
                <Compass size={20} className="compass-spin" />
              </div>
              <span className="brand-text">CareerPilot <strong className="ai-gradient-text">AI</strong></span>
              <span className="info-dot-badge">
                <Info size={12} />
                <span>About</span>
              </span>
            </button>
          </div>

          <div className="showcase-headline-block">
            <h2 className="showcase-main-title">
              Accelerate Your <span className="title-gradient">Dream Tech Career</span>
            </h2>
            <p className="showcase-subtext">
              The all-in-one neural ecosystem to optimize resumes, master 120+ coding challenges, and clear FAANG technical interviews.
            </p>
          </div>

          {/* Integrated Interactive Live Feature Simulation Widget */}
          <div className="live-demo-interactive-widget">
            {/* Built-in Feature Tabs Navigation */}
            <div className="widget-category-tabs">
              {SHOWCASE_TABS.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeTabIdx === idx;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    className={`widget-tab-pill ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveTabIdx(idx)}
                  >
                    <Icon size={14} />
                    <span>{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Widget Main Body Simulation */}
            <div className="widget-body">
              {currentTab.previewType === 'resume' && (
                <div className="preview-resume-content animate-fade-in">
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
                <div className="preview-interview-content animate-fade-in">
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
                <div className="preview-sandbox-content animate-fade-in">
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
                <div className="preview-company-content animate-fade-in">
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

            {/* Sub-status footer bar */}
            <div className="widget-bottom-footer">
              <div className="widget-dots-indicator">
                {SHOWCASE_TABS.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`indicator-dot ${activeTabIdx === idx ? 'active' : ''}`}
                    onClick={() => setActiveTabIdx(idx)}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
              <span className="widget-tag-pill">{currentTab.tag}</span>
            </div>
          </div>

          {/* Clean Trust Metrics */}
          <div className="showcase-trust-bar">
            <div className="trust-item">
              <ShieldCheck size={15} className="text-primary" />
              <span>256-Bit Encrypted</span>
            </div>
            <div className="trust-item">
              <Zap size={15} className="text-primary" />
              <span>Sub-second AI Speed</span>
            </div>
            <div className="trust-item">
              <Award size={15} className="text-primary" />
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
              {mode === 'signin' && 'Welcome!'}
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

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="auth-inputs-form">
            {mode === 'signup' && (
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

            {/* Confirm Password field on Signup */}
            {mode === 'signup' && (
              <div className="form-field-group">
                <div className="field-label-row">
                  <label className="field-label" htmlFor="auth-confirm-pass">Confirm Password</label>
                  {isPasswordMatch && <span className="pass-match-tag success">✅ Passwords match</span>}
                  {isPasswordMismatch && <span className="pass-match-tag error">❌ Passwords do not match</span>}
                </div>
                <div className="field-input-wrap">
                  <Lock size={18} className="field-icon" />
                  <input
                    id="auth-confirm-pass"
                    type={showConfirmPassword ? 'text' : 'password'}
                    className={`field-control ${isPasswordMismatch ? 'input-error' : isPasswordMatch ? 'input-success' : ''}`}
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="pass-visibility-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
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

          {/* 1-Click Instant Guest / Recruiter Demo Button Below Form */}
          {mode === 'signin' && (
            <div className="guest-quick-access-box">
              <div className="auth-divider-row">
                <span className="divider-line"></span>
                <span className="divider-text">OR EXPLORE INSTANTLY</span>
                <span className="divider-line"></span>
              </div>

              <button
                type="button"
                className="guest-demo-btn"
                onClick={handleGuestDemoLogin}
                disabled={guestLoading}
                title="1-Click Instant Guest Demo • No credentials required"
              >
                <Stars size={16} className="text-primary" />
                <span>Explore as Guest Developer</span>
                <span className="guest-fast-tag">1-Click Demo</span>
              </button>
            </div>
          )}

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
