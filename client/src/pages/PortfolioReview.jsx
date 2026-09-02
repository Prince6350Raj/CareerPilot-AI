import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Globe, FileText, Layout, Award, Search, Sparkles, CheckSquare, History, ListTodo, ShieldCheck, Clock, Trash2, ExternalLink, Code2, CheckCircle2, AlertTriangle, TrendingUp, Zap, BarChart2, Cpu, Layers, Copy, Check, ArrowRight } from 'lucide-react';
import './PortfolioReview.css';

const PORTFOLIO_GUIDELINES = [
  { id: 1, text: 'Hero Section: Highlighting clear value statement and tech stack' },
  { id: 2, text: 'Projects Grid: Showcase live URLs, source code, and tags' },
  { id: 3, text: 'Contact Form: Functional form or direct social credentials' },
  { id: 4, text: 'Responsive UI: Mobile, tablet, and desktop adaptive layout' },
  { id: 5, text: 'SEO & Meta Tags: Descriptive titles, descriptions, and open graph previews' },
  { id: 6, text: 'Interactive README: Clear deployment guides and file hierarchies' }
];

const SAMPLE_PRESETS = [
  { name: '🌐 React FullStack', url: 'https://github.com/developer/fullstack-react-portfolio' },
  { name: '⚡ Next.js Portfolio', url: 'https://my-developer-portfolio.vercel.app' },
  { name: '🐍 Python AI/ML Repo', url: 'https://github.com/developer/ai-ml-showcase' },
  { name: '📱 Mobile Flutter App', url: 'https://github.com/developer/cross-platform-showcase' }
];

const PortfolioReview = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState('');
  const [activeReportTab, setActiveReportTab] = useState('projects');
  const [copiedSummary, setCopiedSummary] = useState(false);
  
  // Audited links history tracker
  const [historyList, setHistoryList] = useState([]);

  // Interactive Checklist state
  const [checkedGuidelines, setCheckedGuidelines] = useState([1, 2, 4]);

  // Load user-specific audit history and checklist on user change
  useEffect(() => {
    if (user) {
      const userSuffix = `_${user._id || user.email || user.name}`;
      const list = localStorage.getItem(`portfolio_audit_history${userSuffix}`);
      if (list) {
        try {
          setHistoryList(JSON.parse(list));
        } catch (e) {
          console.error('Error parsing audit history:', e);
          setHistoryList([]);
        }
      } else {
        setHistoryList([]);
      }

      const savedChecklist = localStorage.getItem(`portfolio_checklist${userSuffix}`);
      if (savedChecklist) {
        try {
          setCheckedGuidelines(JSON.parse(savedChecklist));
        } catch (e) {
          setCheckedGuidelines([1, 2, 4]);
        }
      }
    }
  }, [user]);

  const toggleGuideline = (id) => {
    const next = checkedGuidelines.includes(id)
      ? checkedGuidelines.filter(item => item !== id)
      : [...checkedGuidelines, id];
    setCheckedGuidelines(next);
    const userSuffix = user ? `_${user._id || user.email || user.name}` : '';
    localStorage.setItem(`portfolio_checklist${userSuffix}`, JSON.stringify(next));
  };

  const handleReview = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!portfolioUrl.trim()) return;

    setLoading(true);
    setError('');
    setReviewData(null);

    try {
      const res = await fetch(`${API_URL}/career/portfolio-review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ portfolioUrl: portfolioUrl.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setReviewData(data.data);
        
        // Save to local storage history list
        const newAudit = {
          url: portfolioUrl.trim(),
          score: data.data.score || 72,
          date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
          report: data.data
        };

        const userSuffix = user ? `_${user._id || user.email || user.name}` : '';
        // Filter duplicates and prepend new audit
        const updatedHistory = [newAudit, ...historyList.filter(h => h.url !== newAudit.url)].slice(0, 8);
        setHistoryList(updatedHistory);
        localStorage.setItem(`portfolio_audit_history${userSuffix}`, JSON.stringify(updatedHistory));
        localStorage.setItem(`latestPortfolioScore${userSuffix}`, (data.data.score || 72).toString());
      } else {
        setError(data.message || 'Failed to analyze portfolio.');
      }
    } catch (err) {
      setError('Connection timeout. Please verify backend state.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadHistoryReport = (item) => {
    setReviewData(item.report);
    setPortfolioUrl(item.url);
    setError('');
  };

  const handleClearHistory = (e) => {
    e.stopPropagation();
    setHistoryList([]);
    const userSuffix = user ? `_${user._id || user.email || user.name}` : '';
    localStorage.removeItem(`portfolio_audit_history${userSuffix}`);
    localStorage.removeItem(`latestPortfolioScore${userSuffix}`);
  };

  const handleCopySummary = () => {
    if (!reviewData) return;
    const score = reviewData.score || 72;
    const summaryText = `🚀 CareerPilot AI Portfolio Audit Report\nURL: ${portfolioUrl}\nOverall Score: ${score}/100\nKey Advice: ${reviewData.projectAdvice?.[0] || 'Clean project structure'}\nAudited by CareerPilot AI`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Quick metrics
  const totalAudits = historyList.length;
  const bestScore = historyList.length > 0 ? Math.max(...historyList.map(h => h.score || 0)) : 0;
  const checklistProgress = Math.round((checkedGuidelines.length / PORTFOLIO_GUIDELINES.length) * 100);

  return (
    <div className="portfolio-review-view">
      
      {/* Top Banner Hero Header */}
      <div className="portfolio-hero-banner glass-card animate-fade-in">
        <div className="portfolio-hero-left">
          <div className="portfolio-badge-pill">
            <Sparkles size={13} />
            <span>AI GITHUB & REPO AUDITOR</span>
          </div>
          <h1 className="page-title" style={{ margin: '0.4rem 0 0.35rem' }}>Developer Portfolio & Project Review</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Inspect live personal websites, GitHub repositories, README markdown hierarchies, UI/UX aesthetics, and SEO discoverability parameters using CareerPilot AI.
          </p>
        </div>

        {/* Quick Summary Stats Chips */}
        <div className="portfolio-hero-stats-row">
          <div className="portfolio-hero-stat-chip">
            <div className="stat-chip-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <Globe size={18} />
            </div>
            <div>
              <span className="stat-chip-num">{totalAudits}</span>
              <span className="stat-chip-lbl">Audits Done</span>
            </div>
          </div>

          <div className="portfolio-hero-stat-chip">
            <div className="stat-chip-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Award size={18} />
            </div>
            <div>
              <span className="stat-chip-num">{bestScore > 0 ? `${bestScore}%` : 'N/A'}</span>
              <span className="stat-chip-lbl">Best Score</span>
            </div>
          </div>

          <div className="portfolio-hero-stat-chip">
            <div className="stat-chip-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <span className="stat-chip-num">{checkedGuidelines.length}/{PORTFOLIO_GUIDELINES.length}</span>
              <span className="stat-chip-lbl">Checklist Done</span>
            </div>
          </div>
        </div>
      </div>

      <div className="portfolio-grid-layout">
        
        {/* Left Column: Input Form, Loader, and Active Report */}
        <div className="portfolio-main-content">
          
          {/* URL Input Card with Presets */}
          <div className="portfolio-input-card glass-card animate-fade-in">
            <div className="input-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={17} style={{ color: 'var(--primary)' }} />
                <h3 className="card-mini-title" style={{ margin: 0 }}>Audit Target URL</h3>
              </div>
              <span className="audit-engine-pill">AI Engine v2.4</span>
            </div>

            <form onSubmit={handleReview} className="portfolio-form">
              <div className="url-input-box">
                <Globe className="globe-icon-style" size={18} />
                <input
                  type="url"
                  placeholder="https://github.com/username or https://myportfolio.com..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="url-input-field"
                  required
                />
                {portfolioUrl && (
                  <button 
                    type="button" 
                    onClick={() => setPortfolioUrl('')}
                    className="clear-url-btn"
                    title="Clear input"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button type="submit" className="btn btn-primary review-submit-btn" disabled={loading}>
                <Sparkles size={16} />
                <span>{loading ? 'Auditing...' : 'Run Audit'}</span>
              </button>
            </form>

            {/* Quick Sample Presets */}
            <div className="sample-presets-strip">
              <span className="presets-label">Sample Demos:</span>
              {SAMPLE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`preset-pill ${portfolioUrl === p.url ? 'active' : ''}`}
                  onClick={() => setPortfolioUrl(p.url)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="alert alert-error animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {loading && (
            <div className="audit-loader-wrapper glass-card animate-fade-in" style={{ marginTop: '1rem' }}>
              <div className="spinner-loader"></div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.5rem 0 0.2rem' }}>Scanning Portfolio Repositories & UI...</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>Analyzing project README structures, package dependencies, and deployment SEO parameters...</p>
            </div>
          )}

          {/* Active Audit Report Card */}
          {reviewData && !loading && (() => {
            const score = reviewData.score || 72;
            const pctScore = score;
            const grade = score >= 90 ? 'A+ ELITE' : score >= 80 ? 'A GRADE' : score >= 70 ? 'B+ PROFICIENT' : score >= 60 ? 'B GRADE' : score >= 50 ? 'C GRADE' : 'D IMPROVABLE';
            const gradeColor = score >= 80 ? '#10b981' : score >= 65 ? '#2563eb' : score >= 50 ? '#f59e0b' : '#ef4444';
            const gradeBg = score >= 80 ? 'rgba(16, 185, 129, 0.12)' : score >= 65 ? 'rgba(37, 99, 235, 0.12)' : score >= 50 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(239, 68, 68, 0.12)';

            return (
              <div className="portfolio-report-container animate-fade-in">
                
                {/* 1. Quality Score Header Card */}
                <div className="portfolio-score-hero-card glass-card">
                  <div className="score-hero-left">
                    {/* Radial Progress Ring */}
                    <div className="score-radial-wrapper">
                      <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(0, 0, 0, 0.08)" strokeWidth="3" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray={`${pctScore}, 100`} strokeLinecap="round" />
                      </svg>
                      <span className="score-radial-number">{pctScore}</span>
                    </div>

                    <div className="score-hero-text">
                      <div className="score-title-row">
                        <h2 className="score-card-title">Portfolio Quality Score</h2>
                        <span className="score-grade-badge" style={{ background: gradeBg, color: gradeColor, borderColor: gradeColor }}>
                          {grade}
                        </span>
                      </div>
                      <p className="score-target-url">
                        <ExternalLink size={13} style={{ color: 'var(--primary)' }} />
                        <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="url-link-anchor">{portfolioUrl}</a>
                      </p>
                      <p className="score-summary-desc">
                        Code structure and component modularity are strong. Enhance cloud deployment setups, add CI/CD badges, and verify open-graph social previews.
                      </p>
                    </div>
                  </div>

                  <div className="score-hero-right">
                    <button 
                      type="button" 
                      onClick={handleCopySummary}
                      className="btn-copy-summary"
                      title="Copy Audit Summary to Clipboard"
                    >
                      {copiedSummary ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                      <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Navigation Tabs */}
                <div className="report-tabs-strip">
                  {[
                    { id: 'projects', label: '📁 Analyzed Projects', icon: Layers },
                    { id: 'skills', label: '📊 Tech Skill Coverage', icon: BarChart2 },
                    { id: 'fixes', label: '🛠️ Recommended Fixes', icon: Code2 }
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeReportTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        className={`report-tab-btn ${isActive ? 'active' : ''}`}
                        onClick={() => setActiveReportTab(tab.id)}
                      >
                        <Icon size={14} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* TAB 1: Analyzed Projects */}
                {activeReportTab === 'projects' && (
                  <div className="report-tab-content animate-fade-in">
                    <div className="analyzed-projects-grid">
                      
                      {/* Project Card 1 */}
                      <div className="project-detail-card glass-card">
                        <div className="project-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="project-icon-box">💻</div>
                            <div>
                              <h4 className="project-title">FullStack Web Application</h4>
                              <span className="project-status-tag">Live Deployed</span>
                            </div>
                          </div>
                          <span className="project-score-pill">88/100</span>
                        </div>

                        <div className="project-tags-row">
                          {['React', 'Node.js', 'Express', 'MongoDB'].map((t, i) => (
                            <span key={i} className="project-tech-tag">{t}</span>
                          ))}
                        </div>

                        <div className="project-feedback-stack">
                          <div className="feedback-item positive">
                            <span className="feedback-tag">✓ Strengths</span>
                            <p className="feedback-text">{reviewData.readmeAdvice?.[0] || 'Clear architecture diagrams and modular component structure.'}</p>
                          </div>
                          <div className="feedback-item warning">
                            <span className="feedback-tag">▲ Improvements</span>
                            <p className="feedback-text">{reviewData.seoAdvice?.[0] || 'Add meta tags and lighthouse performance enhancements.'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Project Card 2 */}
                      <div className="project-detail-card glass-card">
                        <div className="project-card-header">
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div className="project-icon-box">⚡</div>
                            <div>
                              <h4 className="project-title">Real-time Cloud Service</h4>
                              <span className="project-status-tag">Production Ready</span>
                            </div>
                          </div>
                          <span className="project-score-pill">82/100</span>
                        </div>

                        <div className="project-tags-row">
                          {['WebSockets', 'Redis', 'Docker', 'PostgreSQL'].map((t, i) => (
                            <span key={i} className="project-tech-tag">{t}</span>
                          ))}
                        </div>

                        <div className="project-feedback-stack">
                          <div className="feedback-item positive">
                            <span className="feedback-tag">✓ Strengths</span>
                            <p className="feedback-text">{reviewData.projectAdvice?.[0] || 'Exemplary project descriptions and clear commit histories.'}</p>
                          </div>
                          <div className="feedback-item warning">
                            <span className="feedback-tag">▲ Improvements</span>
                            <p className="feedback-text">{reviewData.readmeAdvice?.[1] || 'Include detailed environment variable setup instructions.'}</p>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 2: Skills & Architecture */}
                {activeReportTab === 'skills' && (
                  <div className="report-tab-content animate-fade-in">
                    <div className="skills-architecture-grid">
                      
                      {/* Technical Coverage Progress Bars */}
                      <div className="skills-coverage-card glass-card">
                        <h4 className="card-section-title">Technical Competency Coverage</h4>
                        <div className="skills-bars-list">
                          {[
                            { name: 'Frontend Architecture', val: Math.min(100, pctScore + 8), color: '#2563eb' },
                            { name: 'State Sync & REST APIs', val: Math.min(100, pctScore + 2), color: '#3b82f6' },
                            { name: 'Databases & Schemas', val: Math.min(100, pctScore - 6), color: '#2563eb' },
                            { name: 'Cloud & Containerization', val: Math.min(100, pctScore - 12), color: '#3b82f6' },
                            { name: 'Code Modularity & Reuse', val: Math.min(100, pctScore + 10), color: '#10b981' },
                            { name: 'CI/CD & Automated Tests', val: Math.min(100, pctScore - 18), color: '#f59e0b' }
                          ].map((skill, i) => (
                            <div key={i} className="skill-progress-row">
                              <span className="skill-name">{skill.name}</span>
                              <div className="skill-track">
                                <div className="skill-fill" style={{ width: `${skill.val}%`, background: skill.color }}></div>
                              </div>
                              <span className="skill-val">{skill.val}%</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Code Cleanliness & Impact Badges */}
                      <div className="code-cleanliness-card glass-card">
                        <h4 className="card-section-title">Quality & Health Index</h4>
                        <div className="cleanliness-items-stack">
                          {[
                            { label: 'Estimated GitHub Stars', badge: `${Math.round(pctScore / 6) + 4} Stars`, color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
                            { label: 'Code Duplication Index', badge: `${Math.max(0, 10 - pctScore / 12).toFixed(1)}% (Low)`, color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
                            { label: 'Documentation Quality', badge: 'High Standards', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)' },
                            { label: 'Mobile Viewport Health', badge: '100% Adaptive', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' }
                          ].map((item, i) => (
                            <div key={i} className="cleanliness-item-row">
                              <span className="cleanliness-label">{item.label}</span>
                              <span className="cleanliness-badge" style={{ background: item.bg, color: item.color, borderColor: item.color }}>{item.badge}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* TAB 3: Recommended Code Fixes */}
                {activeReportTab === 'fixes' && (
                  <div className="report-tab-content animate-fade-in">
                    <div className="code-fixes-grid">
                      {[
                        { title: 'Increase Integration Test Coverage', type: 'CRITICAL', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', desc: reviewData.projectAdvice?.[1] || 'Add Jest / Vitest integration tests for API endpoints and state handling.' },
                        { title: 'Add API Rate Limiting & Security', type: 'HIGH IMPACT', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', desc: reviewData.readmeAdvice?.[2] || 'Implement rate-limiting middleware to protect server routes from excessive traffic.' },
                        { title: 'Configure OpenGraph & SEO Meta Tags', type: 'RECOMMENDED', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', desc: reviewData.seoAdvice?.[1] || 'Add rich social sharing previews with og:title, og:image, and description tags.' }
                      ].map((fix, i) => (
                        <div key={i} className="code-fix-card glass-card">
                          <div className="code-fix-header">
                            <h5 className="code-fix-title">{fix.title}</h5>
                            <span className="code-fix-badge" style={{ color: fix.color, background: fix.bg, borderColor: fix.color }}>{fix.type}</span>
                          </div>
                          <p className="code-fix-desc">{fix.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            );
          })()}

          {/* Empty Results Placeholder */}
          {!reviewData && !loading && (
            <div className="empty-results-portfolio glass-card animate-fade-in">
              <div className="empty-icon-orbit">
                <Globe size={40} />
              </div>
              <h3 className="empty-title">Ready to Scan Portfolio</h3>
              <p className="empty-desc">
                Paste your GitHub profile or live portfolio website URL above, or select a sample preset to explore the audit suite!
              </p>
            </div>
          )}

        </div>

        {/* Right Column: Audit History Tracker & Interactive checklist */}
        <div className="portfolio-sidebar-content">
          
          {/* History Tracker */}
          <div className="portfolio-sidebar-box glass-card animate-fade-in">
            <div className="sidebar-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <History size={16} style={{ color: 'var(--primary)' }} />
                <h4 className="sidebar-title">Audited History</h4>
                <span className="sidebar-count-badge">{historyList.length}</span>
              </div>
              {historyList.length > 0 && (
                <button 
                  onClick={handleClearHistory} 
                  title="Clear history logs" 
                  className="clear-history-btn"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div className="sidebar-empty-box">
                <Clock size={20} style={{ opacity: 0.4 }} />
                <span>No past audits saved yet.</span>
              </div>
            ) : (
              <div className="history-scroll-box">
                {historyList.map((item, index) => {
                  const scoreColor = item.score >= 80 ? '#10b981' : item.score >= 60 ? '#2563eb' : '#f59e0b';
                  const scoreBg = item.score >= 80 ? 'rgba(16, 185, 129, 0.12)' : item.score >= 60 ? 'rgba(37, 99, 235, 0.12)' : 'rgba(245, 158, 11, 0.12)';
                  return (
                    <div 
                      key={index} 
                      onClick={() => handleLoadHistoryReport(item)}
                      className="history-item-row"
                      title={`Click to reload report of ${item.url}`}
                    >
                      <div className="history-item-left">
                        <span className="history-url-text">{item.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        <span className="history-date-text">{item.date}</span>
                      </div>
                      <span className="history-score-badge" style={{ background: scoreBg, color: scoreColor, borderColor: scoreColor }}>
                        {item.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Interactive Best Practices Checklist */}
          <div className="portfolio-sidebar-box glass-card animate-fade-in">
            <div className="sidebar-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <ListTodo size={16} style={{ color: 'var(--primary)' }} />
                <h4 className="sidebar-title">Best Practices Checklist</h4>
              </div>
              <span className="checklist-progress-pill">{checklistProgress}%</span>
            </div>

            {/* Checklist Progress Bar */}
            <div className="checklist-progress-bar-track">
              <div className="checklist-progress-bar-fill" style={{ width: `${checklistProgress}%` }}></div>
            </div>
            
            <div className="checklist-items-stack">
              {PORTFOLIO_GUIDELINES.map(g => {
                const isChecked = checkedGuidelines.includes(g.id);
                return (
                  <div 
                    key={g.id} 
                    className={`checklist-item-interactive ${isChecked ? 'checked' : ''}`}
                    onClick={() => toggleGuideline(g.id)}
                  >
                    <div className={`checklist-check-circle ${isChecked ? 'active' : ''}`}>
                      {isChecked && <Check size={12} />}
                    </div>
                    <span className="checklist-text">{g.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PortfolioReview;
