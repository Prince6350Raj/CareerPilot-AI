import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Briefcase, Code, Network, MessageCircle, DollarSign, BookOpen, Compass } from 'lucide-react';
import './CompanyPrep.css';

const CompanyPrep = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [prepData, setPrepData] = useState(null);
  const [error, setError] = useState('');

  const fetchPrepData = async (company) => {
    if (!company) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/career/prep`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ companyName: company })
      });
      const data = await res.json();
      if (data.success) {
        setPrepData(data.data);
      } else {
        setError(data.message || 'Failed to fetch preparation guide.');
      }
    } catch (err) {
      setError('Connection timeout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const companiesList = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Samsung', 'Accenture',
    'Flipkart', 'Zomato', 'Lenskart', 'TCS', 'Uber', 'Ola',
    'Meesho', 'Zepto', 'Razorpay', 'ShareChat', 'Paytm', 'Dunzo'
  ];

  return (
    <div className="company-prep-view-details">
      <h1 className="page-title">Company Preparation Guides</h1>
      <p className="page-subtitle">Get detailed interview structures, top DSA concepts, system design topics, and salary stats for top tech companies.</p>

      {/* Dropdown Selection Grid */}
      <div className="search-header-container glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <label htmlFor="company-dropdown-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Select Target Company:
          </label>
          <div style={{ display: 'flex', gap: '1rem', width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
            <select
              id="company-dropdown-select"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (val) {
                  fetchPrepData(val);
                }
              }}
              style={{
                flex: 1,
                minWidth: '260px',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-item)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'auto'
              }}
              disabled={loading}
            >
              <option value="">-- Choose Company --</option>
              {companiesList.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error animate-fade-in" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="prep-loader-wrapper glass-card">
          <div className="spinner-loader"></div>
          <p>Consulting CareerPilot AI database for {searchQuery} interview questions...</p>
        </div>
      )}

      {/* Main Analysis Display */}
      {prepData && !loading && (
        <div className="prep-report-grid animate-fade-in">
          {/* Header Card */}
          <div className="prep-company-hero glass-card">
            <div className="hero-avatar-logo">
              {prepData.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="hero-meta-details">
              <h2>{prepData.companyName} Interview Guide</h2>
              <div className="salary-tag-row">
                <DollarSign size={16} className="tag-icon" />
                <span>Average Compensation: <strong>{prepData.salary}</strong></span>
              </div>
            </div>
          </div>

          {/* Details splits */}
          <div className="details-columns-layout">
            {/* Left side: interview process */}
            <div className="details-column-card glass-card">
              <div className="card-header-icon-lbl">
                <Briefcase size={20} className="header-icon" />
                <h3>Interview Pattern</h3>
              </div>
              <div className="pattern-steps-trail">
                {prepData.interviewPattern?.map((step, idx) => (
                  <div key={idx} className="pattern-step-item">
                    <span className="step-num-bubble">{idx + 1}</span>
                    <p className="step-text">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Middle side: technical focus */}
            <div className="details-column-card glass-card">
              <div className="card-header-icon-lbl">
                <Code size={20} className="header-icon" />
                <h3>DSA & System Design Focus</h3>
              </div>
              
              <div className="skills-group-section">
                <h4>Most Asked DSA Topics</h4>
                <div className="tags-container">
                  {prepData.dsaTopics?.map((topic, i) => (
                    <span key={i} className="skill-tag detected-tag">{topic}</span>
                  ))}
                </div>
              </div>

              <div className="skills-group-section" style={{ marginTop: '1.5rem' }}>
                <h4>Typical System Design Focus</h4>
                <div className="tags-container">
                  {prepData.systemDesign?.map((topic, i) => (
                    <span key={i} className="skill-tag suggested-tag">{topic}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right side: HR and prep links */}
            <div className="details-column-card glass-card">
              <div className="card-header-icon-lbl">
                <MessageCircle size={20} className="header-icon" />
                <h3>Standard HR Questions</h3>
              </div>
              <ul className="hr-questions-bullets">
                {prepData.hrQuestions?.map((q, i) => (
                  <li key={i} className="hr-q-item">
                    <span className="quote-mark">“</span>
                    <p>{q}</p>
                  </li>
                ))}
              </ul>

              <div className="skills-group-section" style={{ marginTop: '1.5rem' }}>
                <div className="card-header-icon-lbl" style={{ marginBottom: '0.5rem' }}>
                  <BookOpen size={16} className="header-icon" />
                  <h4>Preparation Resources</h4>
                </div>
                <div className="prep-links-stack">
                  {prepData.resources?.map((res, i) => (
                    <a
                      key={i}
                      href={res.url || 'https://www.geeksforgeeks.org/'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prep-resource-link-item"
                    >
                      <Compass size={14} />
                      <span>{res.name || res}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!prepData && !loading && (
        <div className="empty-results-prep glass-card">
          <Briefcase size={48} className="empty-prep-icon" />
          <h3>No Company Selected</h3>
          <p>Search for a specific tech firm or click one of the popular buttons above to retrieve dynamic recruitment guides.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyPrep;
