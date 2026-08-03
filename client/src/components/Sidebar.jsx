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
  Code
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showAboutModal, setShowAboutModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
        <div className="user-avatar">
          {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
        <div className="theme-palette-row" style={{ display: 'flex', gap: '0.35rem', justifyContent: 'space-between', padding: '0.35rem 0.5rem', background: 'var(--bg-item)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
          {[
            { id: 'dark', name: 'Deep Space', color: '#4f46e5', label: 'D' },
            { id: 'light', name: 'Frosted Glass', color: '#94a3b8', label: 'L' },
            { id: 'cyberpunk', name: 'Cyberpunk Neon', color: '#ec4899', label: 'C' },
            { id: 'emerald', name: 'Emerald Forest', color: '#10b981', label: 'E' },
            { id: 'sakura', name: 'Aura Obsidian', color: '#d97706', label: 'A' },
            { id: 'ocean', name: 'Geeta Portal', color: '#1e3a8a', label: 'G' }
          ].map(t => (
            <button
              key={t.id}
              className={`theme-dot ${theme === t.id ? 'active' : ''}`}
              onClick={() => setTheme(t.id)}
              title={t.name}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: t.color,
                border: theme === t.id ? '2px solid var(--text-primary)' : '2px solid transparent',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                fontWeight: 800,
                color: t.id === 'light' ? '#0f172a' : '#ffffff',
                boxShadow: theme === t.id ? `0 0 10px ${t.color}` : 'none'
              }}
            >
              {t.label}
            </button>
          ))}
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
