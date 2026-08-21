import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Globe, FileText, Layout, Award, Search, Sparkles, CheckSquare, History, ListTodo, ShieldCheck, Clock, Trash2 } from 'lucide-react';
import './PortfolioReview.css';

const PORTFOLIO_GUIDELINES = [
  { id: 1, text: 'Hero Section: Highlighting clear value statement and tech stack' },
  { id: 2, text: 'Projects Grid: Showcase live URLs, source code, and tags' },
  { id: 3, text: 'Contact Form: Functional form or direct social credentials' },
  { id: 4, text: 'Responsive UI: Mobile, tablet, and desktop adaptive layout' },
  { id: 5, text: 'SEO & Meta Tags: Descriptive titles, descriptions, and open graph previews' },
  { id: 6, text: 'Interactive README: Clear deployment guides and file hierarchies' }
];

const PortfolioReview = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState('');
  
  // Audited links history tracker
  const [historyList, setHistoryList] = useState([]);

  // Load audit history on boot
  useEffect(() => {
    const list = localStorage.getItem('portfolio_audit_history');
    if (list) {
      try {
        setHistoryList(JSON.parse(list));
      } catch (e) {
        console.error('Error parsing audit history:', e);
      }
    }
  }, []);

  const handleReview = async (e) => {
    e.preventDefault();
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

        // Filter duplicates and prepend new audit
        const updatedHistory = [newAudit, ...historyList.filter(h => h.url !== newAudit.url)].slice(0, 5);
        setHistoryList(updatedHistory);
        localStorage.setItem('portfolio_audit_history', JSON.stringify(updatedHistory));
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
    localStorage.removeItem('portfolio_audit_history');
  };

  return (
    <div className="portfolio-review-view">
      <h1 className="page-title">AI Portfolio Reviewer</h1>
      <p className="page-subtitle">Paste your personal website or GitHub portfolio URL to audit README markdown structures, project scopes, UI/UX details, and SEO parameters.</p>

      <div className="portfolio-grid-layout">
        
        {/* Left Column: Input Form, Loader, and Active Report */}
        <div className="portfolio-main-content">
          
          {/* URL Input Form */}
          <div className="portfolio-input-card glass-card">
            <form onSubmit={handleReview} className="portfolio-form">
              <div className="url-input-box">
                <Globe className="globe-icon-style" size={20} />
                <input
                  type="url"
                  placeholder="https://github.com/username or https://myportfolio.com..."
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="url-input-field"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary review-submit-btn" disabled={loading}>
                {loading ? 'Auditing URL...' : 'Audit Portfolio'}
              </button>
            </form>
          </div>

          {error && (
            <div className="alert alert-error animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="audit-loader-wrapper glass-card animate-fade-in" style={{ marginTop: '1rem' }}>
              <div className="spinner-loader"></div>
              <p>Analyzing portfolio files, meta tags, and README hierarchies via CareerPilot AI...</p>
            </div>
          )}

          {/* Active Audit Report Card */}
          {reviewData && !loading && (
            <div className="portfolio-report-grid animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Report Header Summary banner */}
              <div className="report-hero-banner glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <Sparkles size={28} className="sparkle-icon-accent" />
                  <div>
                    <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '0 0 0.15rem 0' }}>Audit Complete for:</h3>
                    <a href={reviewData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="report-target-link" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none', wordBreak: 'break-all' }}>
                      {reviewData.portfolioUrl}
                    </a>
                  </div>
                </div>

                {/* Score Circle badge */}
                <div className="radial-score-box" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className="score-number-bubble" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--secondary-glow)', marginBottom: '0.25rem' }}>
                    <span className="score-val" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{reviewData.score || 72}</span>
                    <span className="score-pct" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>%</span>
                  </div>
                  <span className="score-caption" style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)' }}>AUDIT SCORE</span>
                </div>
              </div>

              {/* Suggestions grid columns (README, Projects, UI/UX, SEO) */}
              <div className="report-suggestions-columns">
                
                {/* README */}
                <div className="suggestion-card glass-card">
                  <div className="suggestion-card-header">
                    <FileText size={20} className="icon-orange" />
                    <h4>README & Docs</h4>
                  </div>
                  <ul className="advice-list-stack">
                    {reviewData.readmeAdvice?.map((tip, idx) => (
                      <li key={idx} className="advice-item">
                        <CheckSquare size={14} className="bullet-checkbox" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Projects */}
                <div className="suggestion-card glass-card">
                  <div className="suggestion-card-header">
                    <Award size={20} className="icon-indigo" />
                    <h4>Projects representation</h4>
                  </div>
                  <ul className="advice-list-stack">
                    {reviewData.projectAdvice?.map((tip, idx) => (
                      <li key={idx} className="advice-item">
                        <CheckSquare size={14} className="bullet-checkbox" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* UI/UX */}
                <div className="suggestion-card glass-card">
                  <div className="suggestion-card-header">
                    <Layout size={20} className="icon-emerald" />
                    <h4>UI/UX & Responsiveness</h4>
                  </div>
                  <ul className="advice-list-stack">
                    {reviewData.uiAdvice?.map((tip, idx) => (
                      <li key={idx} className="advice-item">
                        <CheckSquare size={14} className="bullet-checkbox" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* SEO */}
                <div className="suggestion-card glass-card">
                  <div className="suggestion-card-header">
                    <Search size={20} className="icon-amber" />
                    <h4>SEO Discoverability</h4>
                  </div>
                  <ul className="advice-list-stack">
                    {reviewData.seoAdvice?.map((tip, idx) => (
                      <li key={idx} className="advice-item">
                        <CheckSquare size={14} className="bullet-checkbox" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Aggregated Checklist banner */}
              <div className="suggestion-card glass-card" style={{ width: '100%', minHeight: 'auto' }}>
                <div className="suggestion-card-header">
                  <Sparkles size={20} className="icon-emerald" style={{ color: 'var(--accent-warning)' }} />
                  <h4>Top Priority Action Checklist</h4>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginTop: '0.5rem' }}>
                  {[
                    ...(reviewData.readmeAdvice?.slice(0, 2) || []),
                    ...(reviewData.projectAdvice?.slice(0, 2) || []),
                    ...(reviewData.uiAdvice?.slice(0, 2) || []),
                    ...(reviewData.seoAdvice?.slice(0, 2) || [])
                  ].map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', padding: '0.75rem', background: 'var(--bg-item)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <span style={{ color: 'var(--accent-warning)', fontWeight: 800, fontSize: '1rem', lineHeight: 1 }}>★</span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Empty Results Placeholder */}
          {!reviewData && !loading && (
            <div className="empty-results-portfolio glass-card">
              <Globe size={48} className="empty-portfolio-icon" style={{ opacity: 0.35, color: 'var(--text-muted)', marginBottom: '1.5rem' }} />
              <h3>No URL Audited Yet</h3>
              <p>Provide your online personal CV portfolio website or GitHub username profile page URL above to trigger the AI analysis engine.</p>
            </div>
          )}

        </div>

        {/* Right Column: Audit History Tracker & Manual checklist */}
        <div className="portfolio-sidebar-content">
          
          {/* History checklist */}
          <div className="portfolio-sidebar-box glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
                <History size={16} style={{ color: 'var(--primary)' }} />
                <span>Audited History</span>
              </h4>
              {historyList.length > 0 && (
                <button 
                  onClick={handleClearHistory} 
                  title="Clear history logs" 
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-error)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.2rem' }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {historyList.length === 0 ? (
              <div style={{ padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                <Clock size={20} style={{ margin: '0 auto 0.5rem auto', opacity: 0.3 }} />
                <span>No past audits saved.</span>
              </div>
            ) : (
              <div className="history-scroll-box" style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {historyList.map((item, index) => {
                  const scoreColor = item.score >= 80 ? 'var(--accent-success)' : item.score >= 60 ? 'var(--accent-warning)' : 'var(--accent-error)';
                  const scoreBg = item.score >= 80 ? 'rgba(16, 185, 129, 0.1)' : item.score >= 60 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                  return (
                    <div 
                      key={index} 
                      onClick={() => handleLoadHistoryReport(item)}
                      className="history-item-row"
                      style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-item)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', marginBottom: '0.5rem' }}
                      title={`Click to reload report of ${item.url}`}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', maxWidth: '72%' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.date}</span>
                      </div>
                      <span className="history-score-pill" style={{ fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.5rem', borderRadius: '10px', background: scoreBg, color: scoreColor, border: `1px solid ${scoreColor}` }}>
                        {item.score}%
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Guidelines manual Checklist panel */}
          <div className="portfolio-sidebar-box glass-card" style={{ padding: '1.5rem' }}>
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <ListTodo size={16} style={{ color: 'var(--primary)' }} />
              <span>Best Practices Checklist</span>
            </h4>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {PORTFOLIO_GUIDELINES.map(g => (
                <div key={g.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                  <ShieldCheck size={14} style={{ color: 'var(--accent-success)', flexShrink: 0, marginTop: '0.1rem' }} />
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{g.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default PortfolioReview;
