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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      fetchPrepData(searchQuery.trim());
    }
  };

  return (
    <div className="company-prep-view-details">
      <h1 className="page-title">Company Preparation Guides</h1>
      <p className="page-subtitle">Get detailed interview structures, top DSA concepts, system design topics, and salary stats for top tech companies.</p>

      {/* Search and Presets */}
      <div className="search-header-container glass-card">
        <form onSubmit={handleSearchSubmit} className="prep-search-form">
          <div className="search-input-box">
            <Search className="search-icon-decor" size={20} />
            <input
              type="text"
              placeholder="Search company (e.g. Google, Microsoft, Netflix, Swiggy)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-field"
            />
          </div>
          <button type="submit" className="btn btn-primary search-submit-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search Guide'}
          </button>
        </form>

        <div className="company-preset-chips">
          <span className="preset-lbl">Popular:</span>
          {['Google', 'Microsoft', 'Amazon', 'Meta', 'TCS'].map((name) => (
            <button
              key={name}
              onClick={() => {
                setSearchQuery(name);
                fetchPrepData(name);
              }}
              className="preset-chip-btn"
              disabled={loading}
            >
              {name}
            </button>
          ))}
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
                  {prepData.resources?.map((resName, i) => (
                    <a
                      key={i}
                      href="https://www.geeksforgeeks.org/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="prep-resource-link-item"
                    >
                      <Compass size={14} />
                      <span>{resName}</span>
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
