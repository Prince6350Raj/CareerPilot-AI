import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Map, Compass, Video, FileText, ExternalLink, Calendar, CheckSquare } from 'lucide-react';
import './Roadmap.css';

const Roadmap = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [targetRole, setTargetRole] = useState('');
  const [currentSkills, setCurrentSkills] = useState('');
  const [missingSkills, setMissingSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [error, setError] = useState('');

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch(`${API_URL}/career/roadmaps`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        if (data.data.length > 0 && !activeRoadmap) {
          setActiveRoadmap(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching roadmaps:', err);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, [token, API_URL]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!targetRole) return;

    setLoading(true);
    setError('');

    // Parse comma separated values
    const currentArray = currentSkills.split(',').map(s => s.trim()).filter(Boolean);
    const missingArray = missingSkills.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const res = await fetch(`${API_URL}/career/roadmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetRole,
          currentSkills: currentArray,
          missingSkills: missingArray
        })
      });
      const data = await res.json();
      if (data.success) {
        setActiveRoadmap(data.data);
        setTargetRole('');
        setCurrentSkills('');
        setMissingSkills('');
        fetchRoadmaps();
      } else {
        setError(data.message || 'AI generation failed. Please try again.');
      }
    } catch (err) {
      setError('Network communication failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'video':
        return <Video className="resource-icon video-theme" size={16} />;
      default:
        return <FileText className="resource-icon doc-theme" size={16} />;
    }
  };

  return (
    <div className="roadmap-view-container">
      <h1 className="page-title">AI Learning Roadmaps</h1>
      <p className="page-subtitle">Build customized, phase-by-phase learning plans tailored to your career milestones and skill gaps.</p>

      <div className="roadmap-split-layout">
        {/* Creation panel */}
        <div className="roadmap-creation-sidebar">
          <div className="creation-form-card glass-card">
            <h3 className="card-mini-title">Generate Custom Plan</h3>
            <form onSubmit={handleGenerate} className="creation-form">
              <div className="form-group">
                <label className="form-label" htmlFor="role-input">Target Career Role</label>
                <input
                  type="text"
                  id="role-input"
                  className="form-control"
                  placeholder="e.g. Fullstack Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="current-skills-input">Current Skills (comma separated)</label>
                <textarea
                  id="current-skills-input"
                  className="form-control textarea-field"
                  placeholder="e.g. HTML, CSS, JavaScript"
                  value={currentSkills}
                  onChange={(e) => setCurrentSkills(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="missing-skills-input">Target Skills to Learn (comma separated)</label>
                <textarea
                  id="missing-skills-input"
                  className="form-control textarea-field"
                  placeholder="e.g. Node.js, Express, MongoDB"
                  value={missingSkills}
                  onChange={(e) => setMissingSkills(e.target.value)}
                  rows={2}
                />
              </div>

              {error && <p className="error-message-label">{error}</p>}

              <button type="submit" className="btn btn-primary generate-submit" disabled={loading}>
                {loading ? 'Generating Milestone Phases...' : 'Generate Roadmap'}
              </button>
            </form>
          </div>

          {/* History selector */}
          <div className="roadmap-history-card glass-card">
            <h3 className="card-mini-title">Saved Roadmaps</h3>
            <div className="history-list">
              {history.map(item => (
                <div
                  key={item._id}
                  className={`history-roadmap-item ${activeRoadmap?._id === item._id ? 'active' : ''}`}
                  onClick={() => setActiveRoadmap(item)}
                >
                  <Map size={18} className="roadmap-meta-icon" />
                  <div className="roadmap-meta-details">
                    <span className="roadmap-title">{item.targetRole}</span>
                    <span className="roadmap-weeks">{item.weeksEstimate} Week Guide</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="empty-text">No roadmaps generated yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Timeline output */}
        <div className="roadmap-timeline-panel">
          {activeRoadmap ? (
            <div className="active-roadmap-details animate-fade-in">
              <div className="roadmap-summary-banner glass-card">
                <div className="banner-details">
                  <h2>{activeRoadmap.targetRole} Path</h2>
                  <p className="banner-weeks-info">
                    <Calendar size={16} />
                    <span>Estimated Completion: {activeRoadmap.weeksEstimate} Weeks</span>
                  </p>
                  <button onClick={() => window.print()} className="btn btn-secondary print-roadmap-btn" style={{ marginTop: '0.75rem', gap: '0.5rem' }}>
                    <Compass size={14} />
                    <span>Download PDF Roadmap</span>
                  </button>
                </div>
                <Compass className="banner-decor-icon" size={64} />
              </div>

              {/* Timeline Nodes */}
              <div className="timeline-trail">
                {activeRoadmap.phases?.map((phase, index) => (
                  <div key={phase._id || index} className="timeline-node">
                    <div className="timeline-badge-indicator">
                      <span>P{phase.phaseNumber}</span>
                    </div>

                    <div className="timeline-content-card glass-card">
                      <div className="card-header-bar">
                        <h3>{phase.title}</h3>
                        <span className="duration-tag">{phase.duration}</span>
                      </div>

                      {/* Objectives */}
                      <div className="phase-section">
                        <h4 className="section-small-lbl">Learning Objectives</h4>
                        <ul className="objectives-list">
                          {phase.objectives?.map((obj, i) => (
                            <li key={i}>
                              <CheckSquare size={14} className="bullet-obj-icon" />
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Resources */}
                      {phase.resources?.length > 0 && (
                        <div className="phase-section">
                          <h4 className="section-small-lbl">Curated Study Resources</h4>
                          <div className="resources-grid">
                            {phase.resources.map((resource, i) => (
                              <a
                                key={i}
                                href={resource.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="resource-link-card"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  if (resource.url) {
                                    window.open(resource.url, '_blank', 'noopener,noreferrer');
                                  }
                                }}
                              >
                                {getResourceIcon(resource.type)}
                                <span className="resource-title-text">{resource.title}</span>
                                <ExternalLink size={12} className="link-arrow" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Projects */}
                      {phase.projects?.length > 0 && (
                        <div className="phase-section">
                          <h4 className="section-small-lbl">Milestone Project Challenge</h4>
                          {phase.projects.map((project, i) => (
                            <div key={i} className="project-detail-box">
                              <div className="project-header">
                                <h5>{project.title}</h5>
                                <span className={`difficulty-badge ${project.difficulty?.toLowerCase()}`}>
                                  {project.difficulty}
                                </span>
                              </div>
                              <p className="project-desc">{project.description}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-results glass-card">
              <Map size={48} className="empty-results-icon" />
              <h3>No Career Roadmap Generated</h3>
              <p>Type in a target career role on the left sidebar to generate a week-by-week visual curriculum.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
