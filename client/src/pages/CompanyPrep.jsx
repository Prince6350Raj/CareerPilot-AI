import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Search, Briefcase, Code, Network, MessageCircle, DollarSign, BookOpen, Compass } from 'lucide-react';
import './CompanyPrep.css';

const CompanyPrep = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Consulting CareerPilot database...');
  const [prepData, setPrepData] = useState(null);
  const [error, setError] = useState('');

  const fetchPrepData = async (company) => {
    if (!company) return;
    setLoading(true);
    setLoadingText(`Consulting CareerPilot AI database for ${company}...`);
    setError('');
    
    const steps = [
      `Fetching interview pattern parameters for ${company}...`,
      `Retrieving most asked DSA topics...`,
      `Gathering typical system design focuses...`,
      `Structuring standard HR behavior queries...`,
      `Checking salary & compensation estimates...`
    ];
    let idx = 0;
    const timer = setInterval(() => {
      setLoadingText(steps[idx]);
      idx = (idx + 1) % steps.length;
    }, 1200);

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
      clearInterval(timer);
      setLoading(false);
    }
  };

  const companiesList = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Samsung', 'Accenture',
    'Flipkart', 'Zomato', 'Lenskart', 'Uber', 'Ola',
    'Meesho', 'Zepto', 'Razorpay', 'ShareChat', 'Paytm', 'Dunzo'
  ];

  const popularCompanies = [
    { name: 'Google', color: 'rgba(219, 68, 85, 0.12)', border: '#db4437', char: 'G' },
    { name: 'Microsoft', color: 'rgba(0, 164, 239, 0.12)', border: '#00a4ef', char: 'M' },
    { name: 'Amazon', color: 'rgba(255, 153, 0, 0.12)', border: '#ff9900', char: 'A' },
    { name: 'Meta', color: 'rgba(6, 104, 226, 0.12)', border: '#0668e2', char: 'Meta' },
    { name: 'Uber', color: 'rgba(15, 15, 15, 0.4)', border: 'var(--text-primary)', char: 'U' },
    { name: 'Flipkart', color: 'rgba(40, 116, 240, 0.12)', border: '#2874f0', char: 'F' },
    { name: 'Zomato', color: 'rgba(226, 55, 68, 0.12)', border: '#e23744', char: 'Z' },
    { name: 'Meesho', color: 'rgba(244, 51, 151, 0.12)', border: '#f43397', char: 'M' }
  ];

  return (
    <div className="company-prep-view-details">
      <h1 className="page-title">Company Preparation Guides</h1>
      <p className="page-subtitle">Get detailed interview structures, top DSA concepts, system design topics, and salary stats for top tech companies.</p>

      {/* Popular Companies Grid */}
      <div className="popular-companies-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.85rem', marginBottom: '1.5rem' }}>
        {popularCompanies.map(item => {
          const isActive = searchQuery === item.name;
          return (
            <div 
              key={item.name}
              className={`popular-company-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setSearchQuery(item.name);
                fetchPrepData(item.name);
              }}
              style={{
                background: isActive ? 'var(--bg-item-hover)' : 'var(--bg-card)',
                border: `1px solid ${isActive ? item.border : 'var(--border-color)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                boxShadow: isActive ? `0 0 10px ${item.border}33` : 'none'
              }}
            >
              <div 
                style={{ 
                  width: '40px', 
                  height: '40px', 
                  borderRadius: '50%', 
                  background: item.color, 
                  border: `1px solid ${item.border}`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '0.9rem', 
                  fontWeight: 800, 
                  color: item.border,
                  marginBottom: '0.5rem'
                }}
              >
                {item.char}
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>{item.name}</span>
            </div>
          );
        })}
      </div>

      {/* Dropdown Selection Grid */}
      <div className="search-header-container glass-card" style={{ padding: '1.25rem 1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
          <label htmlFor="company-dropdown-select" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Or Select Other Company:
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
        <div className="alert alert-error animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {loading && (
        <div className="prep-loader-wrapper glass-card animate-fade-in" style={{ marginTop: '1rem' }}>
          <div className="spinner-loader"></div>
          <p>{loadingText}</p>
        </div>
      )}

      {/* Main Analysis Display */}
      {prepData && !loading && (
        <div className="prep-report-grid animate-fade-in" style={{ marginTop: '1rem' }}>
          {/* Header Card */}
          <div className="prep-company-hero glass-card">
            <div className="hero-avatar-logo">
              {prepData.companyName.charAt(0).toUpperCase()}
            </div>
            <div className="hero-meta-details">
              <h2>{prepData.companyName} Interview Guide</h2>
              <div className="salary-tag-row">
                <DollarSign size={16} className="tag-icon" />
                <span>Average Compensation: <strong>{prepData.salary || 'Market Standard'}</strong></span>
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
                <div className="tags-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {prepData.dsaTopics?.map((topic, i) => (
                    <span key={i} className="skill-tag detected-tag" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', background: 'rgba(79, 70, 229, 0.1)', border: '1px solid rgba(79, 70, 229, 0.2)', borderRadius: '4px', color: 'var(--primary)', fontWeight: 700 }}>{topic}</span>
                  ))}
                </div>
              </div>

              <div className="skills-group-section" style={{ marginTop: '1.5rem' }}>
                <h4>Typical System Design Focus</h4>
                <div className="tags-container" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {prepData.systemDesign?.map((topic, i) => (
                    <span key={i} className="skill-tag suggested-tag" style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)', borderRadius: '4px', color: 'var(--secondary)', fontWeight: 700 }}>{topic}</span>
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
                <div className="card-header-icon-lbl" style={{ marginBottom: '0.5rem', borderBottom: 'none', paddingBottom: 0 }}>
                  <BookOpen size={16} className="header-icon" />
                  <h4 style={{ margin: 0 }}>Preparation Resources</h4>
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
          <Briefcase size={48} className="empty-prep-icon" style={{ opacity: 0.3, marginBottom: '1.5rem' }} />
          <h3>No Company Selected</h3>
          <p>Choose one of the popular tech companies above or use the dropdown to retrieve dynamic recruitment guides.</p>
        </div>
      )}
    </div>
  );
};

export default CompanyPrep;
