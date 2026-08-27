import React, { useContext, useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Map,
  MessageSquareCode,
  TrendingUp,
  User,
  ShieldAlert,
  LogOut,
  Compass,
  Sun,
  Moon,
  BookOpen,
  Briefcase,
  Sparkles,
  Search,
  Code,
  Settings
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Click outside to close custom select dropdown
  useEffect(() => {
    const handleOutsideClick = () => setIsThemeOpen(false);
    if (isThemeOpen) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [isThemeOpen]);

  return (
    <aside className="sidebar-container glass-card">
      <div 
        className="sidebar-logo" 
        onClick={() => setShowAboutModal(true)} 
        style={{ cursor: 'pointer' }}
        title="About CareerPilot AI"
      >
        <Compass size={32} className="logo-icon" />
        <span className="logo-text">CareerPilot <span className="logo-highlight">AI</span></span>
      </div>

      <Link to="/profile" className="sidebar-user">
        <div className="user-avatar" style={{ overflow: 'hidden', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {user?.profile?.avatar ? (
            <img 
              src={user.profile.avatar} 
              alt="User Avatar" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                transform: `scale(${user.profile.avatarScale || 1})`,
                objectPosition: `${user.profile.avatarX || 50}% ${user.profile.avatarY || 50}%`
              }} 
            />
          ) : (
            user?.name ? user.name.charAt(0).toUpperCase() : 'U'
          )}
        </div>
        <div className="user-info">
          <h4 className="user-name">{user?.name}</h4>
          <span className="user-title">{user?.profile?.title || 'Tech Aspirant'}</span>
        </div>
      </Link>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/resume-analyzer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Resume Analyzer</span>
        </NavLink>

        <NavLink to="/roadmap" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Map size={20} />
          <span>Learning Roadmap</span>
        </NavLink>

        <NavLink to="/mock-interview" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <MessageSquareCode size={20} />
          <span>Mock Interview</span>
        </NavLink>

        <NavLink to="/resources" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Learning Resources</span>
        </NavLink>

        <NavLink to="/company-prep" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Briefcase size={20} />
          <span>Company Prep</span>
        </NavLink>

        <NavLink to="/chatbot" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Sparkles size={20} />
          <span>Career Advisor</span>
        </NavLink>

        <NavLink to="/portfolio-reviewer" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Search size={20} />
          <span>Portfolio Review</span>
        </NavLink>

        <NavLink to="/coding-challenge" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Code size={20} />
          <span>Coding Sandbox</span>
        </NavLink>

        <NavLink to="/progress" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <TrendingUp size={20} />
          <span>Progress & Badges</span>
        </NavLink>

        <NavLink to="/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <User size={20} />
          <span>Profile Setting</span>
        </NavLink>

        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>System Settings</span>
        </NavLink>

        {user?.role === 'admin' && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item admin-item ${isActive ? 'active' : ''}`}>
            <ShieldAlert size={20} />
            <span>Admin Control</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer-row" style={{ flexDirection: 'column', gap: '0.75rem', alignItems: 'stretch' }}>
        <div className="theme-selector-label" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', paddingLeft: '0.15rem' }}>
          Theme Presets
        </div>
        
        {/* Custom Premium Dropdown Selector */}
        <div className="custom-theme-dropdown" style={{ position: 'relative', width: '100%', marginBottom: '0.25rem' }}>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIsThemeOpen(!isThemeOpen); }}
            className="theme-select-control"
            style={{
              width: '100%',
              background: 'var(--bg-item)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.55rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              outline: 'none',
              transition: 'var(--transition-smooth)'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>
                {theme === 'dark' && '🌌'}
                {theme === 'light' && '❄️'}
                {theme === 'cyberpunk' && '⚡'}
                {theme === 'emerald' && '🌲'}
                {theme === 'sakura' && '🌸'}
                {theme === 'ocean' && '🌊'}
                {theme === 'goldlight' && '👑'}
              </span>
              <span>
                {theme === 'dark' && 'Space Blue'}
                {theme === 'light' && 'Frosted Glass'}
                {theme === 'cyberpunk' && 'Cyberpunk Gold'}
                {theme === 'emerald' && 'Emerald Forest'}
                {theme === 'sakura' && 'Frosted Slate'}
                {theme === 'ocean' && 'Ocean Blue'}
                {theme === 'goldlight' && 'Golden Pastel'}
              </span>
            </span>
            <span style={{ fontSize: '0.6rem', transform: isThemeOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }}>▼</span>
          </button>

          {isThemeOpen && (
            <div 
              className="custom-theme-options" 
              style={{
                position: 'absolute',
                bottom: '108%',
                left: 0,
                width: '100%',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(20px)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                boxShadow: 'var(--glass-shadow)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                padding: '0.35rem',
                gap: '0.2rem',
                animation: 'slideUpDropdown 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {[
                { id: 'dark', emoji: '🌌', name: 'Space Blue' },
                { id: 'light', emoji: '❄️', name: 'Frosted Glass' },
                { id: 'cyberpunk', emoji: '⚡', name: 'Cyberpunk Gold' },
                { id: 'emerald', emoji: '🌲', name: 'Emerald Forest' },
                { id: 'sakura', emoji: '🌸', name: 'Frosted Slate' },
                { id: 'ocean', emoji: '🌊', name: 'Ocean Blue' },
                { id: 'goldlight', emoji: '👑', name: 'Golden Pastel' }
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setIsThemeOpen(false);
                  }}
                  className={`custom-theme-option ${theme === t.id ? 'active' : ''}`}
                  style={{
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: theme === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                    background: theme === t.id ? 'var(--bg-item)' : 'transparent',
                    transition: 'var(--transition-smooth)'
                  }}
                  onMouseEnter={(e) => {
                    if (theme !== t.id) e.currentTarget.style.background = 'var(--bg-item-hover)';
                  }}
                  onMouseLeave={(e) => {
                    if (theme !== t.id) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <span>{t.emoji}</span>
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button className="btn btn-secondary" onClick={logout} title="Sign Out" style={{ width: '100%', justifyContent: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
          <LogOut size={16} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Sign Out</span>
        </button>
      </div>

      {showAboutModal && (
        <div className="about-modal-overlay" onClick={() => setShowAboutModal(false)}>
          <div className="about-modal-content glass-card" onClick={(e) => e.stopPropagation()}>
            <button className="about-modal-close" onClick={() => setShowAboutModal(false)}>×</button>
            <div className="about-modal-header">
              <Compass size={40} className="logo-icon animate-pulse" style={{ color: 'var(--primary)' }} />
              <h2 style={{ margin: 0 }}>About CareerPilot <span className="logo-highlight">AI</span></h2>
            </div>
            <p className="about-modal-tagline">Your Comprehensive AI-Powered Career Development Suite</p>
            
            <div className="about-modal-body">
              <div className="about-section">
                <h3>Our Vision</h3>
                <p>CareerPilot AI is designed to bridge the gap between academic education and industry standards. By utilizing advanced AI algorithms, it helps candidates analyze resumes, practice mock interviews, customize learning roadmaps, and target top tech placements.</p>
              </div>

              <div className="about-features-grid">
                <div className="about-feat-item">
                  <h4>🔍 AI Resume Analyzer</h4>
                  <p>Analyzes tech competencies, action verbs, formatting, and structures high-precision ATS rating feedback.</p>
                </div>
                <div className="about-feat-item">
                  <h4>💬 Mock Interview Terminal</h4>
                  <p>Interactive theoretical coding, system design, and behavioral MCQ evaluation rounds grading responses out of 10.</p>
                </div>
                <div className="about-feat-item">
                  <h4>🗺️ Personal Roadmaps</h4>
                  <p>Generates week-by-week phases and curated directories of active resource tags customized to missing profile skills.</p>
                </div>
                <div className="about-feat-item">
                  <h4>🤖 Mentor Advisor</h4>
                  <p>A context-aware AI chatbot assistant retaining active profile memory for immediate technical or career advice.</p>
                </div>
              </div>

              <div className="about-modal-footer">
                <p>Developed with ❤️ by Prince Raj. Version 2.0 (Stable Release)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
