import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Globe, FileText, Layout, Award, Search, Sparkles, CheckSquare } from 'lucide-react';
import './PortfolioReview.css';

const PortfolioReview = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [error, setError] = useState('');

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
      } else {
        setError(data.message || 'Failed to analyze portfolio.');
      }
    } catch (err) {
      setError('Connection timeout. Please verify backend state.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portfolio-review-view">
      <h1 className="page-title">AI Portfolio Reviewer</h1>
      <p className="page-subtitle">Paste your personal website or GitHub portfolio URL to audit README markdown structures, project scopes, UI/UX details, and SEO parameters.</p>

      {/* Input container */}
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
        <div className="alert alert-error animate-fade-in" style={{ marginTop: '1.25rem' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="audit-loader-wrapper glass-card">
          <div className="spinner-loader"></div>
          <p>Analyzing portfolio files, meta tags, and README hierarchies via CareerPilot AI...</p>
        </div>
      )}

      {/* Review details */}
      {reviewData && !loading && (
        <div className="portfolio-report-grid animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header summary */}
          <div className="report-hero-banner glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <Sparkles size={28} className="sparkle-icon-accent" />
              <div>
                <h3>Audit Complete for:</h3>
                <a href={reviewData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="report-target-link">
                  {reviewData.portfolioUrl}
                </a>
              </div>
            </div>

            {/* Score Bubble */}
            <div className="radial-score-box" style={{ marginRight: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className="score-number-bubble" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--secondary-glow)', marginBottom: '0.25rem' }}>
                <span className="score-val" style={{ fontSize: '1.3rem', fontWeight: 800, color: 'white' }}>{reviewData.score || 72}</span>
                <span className="score-pct" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>%</span>
              </div>
              <span className="score-caption" style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)' }}>AUDIT SCORE</span>
            </div>
          </div>

          {/* Aggregated suggestions cards */}
          <div className="report-suggestions-columns">
            {/* README Audits */}
            <div className="suggestion-card glass-card">
              <div className="suggestion-card-header">
                <FileText size={20} className="icon-orange" />
                <h4>README & Documentation</h4>
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

            {/* Projects Audits */}
            <div className="suggestion-card glass-card">
              <div className="suggestion-card-header">
                <Award size={20} className="icon-indigo" />
                <h4>Projects Representation</h4>
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

            {/* UI/UX Audits */}
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

            {/* SEO Audits */}
            <div className="suggestion-card glass-card">
              <div className="suggestion-card-header">
                <Search size={20} className="icon-amber" />
                <h4>SEO & Search Discoverability</h4>
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

          {/* Aggregated Action checklist */}
          <div className="suggestion-card glass-card" style={{ width: '100%', minHeight: 'auto' }}>
            <div className="suggestion-card-header">
              <Sparkles size={20} className="icon-emerald" style={{ color: 'var(--accent-warning)' }} />
              <h4>Top Priority Action Checklist (Add/Fix items to boost score)</h4>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
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

      {/* Empty State */}
      {!reviewData && !loading && (
        <div className="empty-results-portfolio glass-card">
          <Globe size={48} className="empty-portfolio-icon" />
          <h3>No Link Audited</h3>
          <p>Provide your online personal CV portfolio or GitHub username profile page URL above to trigger the AI review process.</p>
        </div>
      )}
    </div>
  );
};

export default PortfolioReview;
