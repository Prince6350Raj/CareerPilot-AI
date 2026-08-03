import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Upload, Trash2, CheckCircle2, AlertTriangle, Clock, AlertCircle, FileText, Briefcase, FileSignature, Layers, ArrowRight, Download } from 'lucide-react';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [error, setError] = useState('');
  
  // Tab states: 'ats', 'compare', 'coverletter', 'versions'
  const [activeTab, setActiveTab] = useState('ats');

  // AI Comparison states
  const [targetRole, setTargetRole] = useState('Fullstack Developer');
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Cover Letter states
  const [jobDescription, setJobDescription] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState('');

  // Version Comparison selection states
  const [vSelectedA, setVSelectedA] = useState('');
  const [vSelectedB, setVSelectedB] = useState('');
  const [versionDiff, setVersionDiff] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/resume/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        if (data.data.length > 0 && !activeResume) {
          setActiveResume(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching resume history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, API_URL]);

  const handleFileChange = (e) => {
    setError('');
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      setError('Please select a valid PDF document.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setStatusMessage('Extracting PDF text structures...');

    const formData = new FormData();
    formData.append('resume', file);

    const stage1 = setTimeout(() => setStatusMessage('Evaluating keyword matches via Gemini AI...'), 2000);
    const stage2 = setTimeout(() => setStatusMessage('Compiling feedback & scoring parameters...'), 4500);

    try {
      const res = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      clearTimeout(stage1);
      clearTimeout(stage2);

      if (data.success) {
        setActiveResume(data.data);
        setFile(null);
        fetchHistory();
      } else {
        setError(data.message || 'ATS Scanning failed.');
      }
    } catch (err) {
      clearTimeout(stage1);
      clearTimeout(stage2);
      setError('Server response timeout. Check connection.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this scan from history?')) return;
    try {
      const res = await fetch(`${API_URL}/resume/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (activeResume?._id === id) {
          setActiveResume(history.find(r => r._id !== id) || null);
        }
        fetchHistory();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Trigger Role Comparison
  const handleCompareRole = async () => {
    if (!activeResume) return;
    setComparing(true);
    setComparisonResult(null);
    try {
      const res = await fetch(`${API_URL}/resume/compare-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: activeResume._id, jobRole: targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setComparisonResult(data.data);
      } else {
        setError(data.message || 'Failed to compare resume.');
      }
    } catch (err) {
      setError('Comparison failed. Server error.');
    } finally {
      setComparing(false);
    }
  };

  // Generate Cover Letter
  const handleGenerateCoverLetter = async () => {
    if (!activeResume || !jobDescription.trim()) return;
    setGeneratingLetter(true);
    setCoverLetterResult('');
    try {
      const res = await fetch(`${API_URL}/resume/cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: activeResume._id, jobDescription: jobDescription.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCoverLetterResult(data.data.coverLetterText);
      } else {
        setError(data.message || 'Failed to generate cover letter.');
      }
    } catch (err) {
      setError('Cover letter failed. Server error.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  // Run Version History Comparison (Client-side Diff)
  const handleVersionCompare = () => {
    if (!vSelectedA || !vSelectedB) return;
    const resumeA = history.find(r => r._id === vSelectedA);
    const resumeB = history.find(r => r._id === vSelectedB);
    if (!resumeA || !resumeB) return;

    // Diff calculations: V_B (Newer) - V_A (Older)
    const scoreDiff = resumeB.atsScore - resumeA.atsScore;
    
    // Skills diff: in B but not in A
    const skillsAdded = resumeB.detectedSkills?.filter(s => !resumeA.detectedSkills?.includes(s)) || [];

    setVersionDiff({
      scoreA: resumeA.atsScore,
      scoreB: resumeB.atsScore,
      scoreDiff: scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff.toString(),
      skillsAdded,
      breakdownA: resumeA.breakdown,
      breakdownB: resumeB.breakdown
    });
  };

  const handlePrintCoverLetter = () => {
    window.print();
  };

  return (
    <div className="resume-analyzer-view">
      <h1 className="page-title">ATS Resume Hub</h1>
      <p className="page-subtitle">Manage resume versions, check job role suitability, and generate custom cover letters.</p>

      {/* Tab Select Header */}
      <div className="resume-tabs-row glass-card">
        {[
          { id: 'ats', label: 'ATS Audit Report', icon: FileText },
          { id: 'compare', label: 'AI Role Suitability', icon: Briefcase },
          { id: 'coverletter', label: 'AI Cover Letter Gen', icon: FileSignature },
          { id: 'versions', label: 'Version Diff History', icon: Layers }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn-item ${activeTab === t.id ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="analyzer-split-layout">
        {/* Left side: Version List & Upload */}
        <div className="analyzer-sidebar">
          {/* File Upload Box */}
          <div className="upload-box-card glass-card">
            <h3 className="card-mini-title">Upload New Resume</h3>
            <form onSubmit={handleUpload} className="upload-form">
              <label className="drag-drop-label">
                <Upload size={32} className="upload-icon-style" />
                <span className="upload-primary-text">Select Resume PDF</span>
                <span className="upload-secondary-text">PDF format, max 5MB</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden-file-input"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="file-preview-indicator">
                  <CheckCircle2 size={16} className="green-tick" />
                  <span className="file-name-text">{file.name}</span>
                </div>
              )}

              {error && <p className="upload-error-lbl">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary upload-submit"
                disabled={!file || loading}
              >
                {loading ? 'Analyzing...' : 'Scan Resume'}
              </button>
            </form>

            {loading && (
              <div className="scan-loader-overlay">
                <div className="spinner-loader"></div>
                <p className="loader-status-text">{statusMessage}</p>
              </div>
            )}
          </div>

          {/* History list */}
          <div className="scan-history-card glass-card">
            <h3 className="card-mini-title">Scan History</h3>
            <div className="history-list-items">
              {history.map((item, index) => (
                <div
                  key={item._id}
                  className={`history-item ${activeResume?._id === item._id ? 'active' : ''}`}
                  onClick={() => setActiveResume(item)}
                >
                  <div className="history-meta">
                    <span className="history-date">
                      V{history.length - index}: {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="history-score">{item.atsScore}% ATS</span>
                  </div>
                  <button className="delete-history-btn" onClick={(e) => handleDelete(item._id, e)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <p className="empty-text">No previous scans found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Contents Panel */}
        <div className="analyzer-results-panel">
          {activeResume ? (
            <>
              {/* TAB 1: ATS AUDIT */}
              {activeTab === 'ats' && (
                <div className="results-card glass-card animate-fade-in">
                  <div className="results-header-row">
                    <div>
                      <h2 className="results-panel-title">ATS Audit Report</h2>
                      <a href={activeResume.fileUrl} target="_blank" rel="noreferrer" className="resume-download-link">
                        View Scanned File Source
                      </a>
                    </div>
                    <div className="radial-score-box">
                      <div className="score-number-bubble">
                        <span className="score-val">{activeResume.atsScore}</span>
                        <span className="score-pct">%</span>
                      </div>
                      <span className="score-caption">ATS MATCH</span>
                    </div>
                  </div>

                  {/* Breakdown metrics */}
                  <div className="breakdown-grid">
                    {[
                      { name: 'Keyword Density', val: activeResume.breakdown?.keywordMatch || 0 },
                      { name: 'Formatting & Layout', val: activeResume.breakdown?.formatting || 0 },
                      { name: 'Impact & Action Verbs', val: activeResume.breakdown?.impactPhrases || 0 },
                      { name: 'Redundancy Filter', val: activeResume.breakdown?.redundancies || 0 }
                    ].map((metric, i) => (
                      <div key={i} className="breakdown-metric">
                        <div className="metric-header">
                          <span>{metric.name}</span>
                          <span>{metric.val}%</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${metric.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills Cloud */}
                  <div className="skills-cloud-section">
                    <h3 className="subsection-title">Skills Detected</h3>
                    <div className="tags-container">
                      {activeResume.detectedSkills?.map((skill, i) => (
                        <span key={i} className="skill-tag detected-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="skills-cloud-section">
                    <h3 className="subsection-title">Suggested High-Impact Skills</h3>
                    <div className="tags-container">
                      {activeResume.suggestedSkills?.map((skill, i) => (
                        <span key={i} className="skill-tag suggested-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions bullets */}
                  <div className="improvement-section">
                    <h3 className="subsection-title">Priority Fixes</h3>
                    <div className="feedback-bullets">
                      {activeResume.feedback?.map((tip, i) => (
                        <div key={i} className="feedback-bullet-item">
                          <AlertCircle className="bullet-icon-alert" size={16} />
                          <p>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ROLE COMPARISON */}
              {activeTab === 'compare' && (
                <div className="results-card glass-card animate-fade-in">
                  <h2 className="results-panel-title" style={{ marginBottom: '0.5rem' }}>AI Resume Suitability</h2>
                  <p className="subsection-desc">Analyze how your active resume matches the requirements of a specific career role.</p>

                  <div className="compare-config-row">
                    <div className="form-group flex-1">
                      <label className="form-label" htmlFor="role-select">Target Career Role</label>
                      <select
                        id="role-select"
                        className="form-control"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      >
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Fullstack Developer">Fullstack Developer</option>
                        <option value="Python Engineer">Python Engineer</option>
                        <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                        <option value="Data Structures Specialist">Data Structures Specialist</option>
                      </select>
                    </div>
                    <button onClick={handleCompareRole} className="btn btn-primary compare-btn" disabled={comparing}>
                      {comparing ? 'Comparing...' : 'Analyze Suitability'}
                    </button>
                  </div>

                  {comparisonResult && (
                    <div className="comparison-results-block animate-fade-in" style={{ marginTop: '2rem' }}>
                      <div className="results-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Match Suitability Analysis</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role: {targetRole}</span>
                        </div>
                        <div className="radial-score-box">
                          <div className="score-number-bubble">
                            <span className="score-val">{comparisonResult.matchScore}</span>
                            <span className="score-pct">%</span>
                          </div>
                          <span className="score-caption">ROLE MATCH</span>
                        </div>
                      </div>

                      {/* Missing Keywords & Skills */}
                      <div className="comparison-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div className="comparative-block">
                          <h4 className="subsection-title" style={{ color: '#ef4444' }}>Missing Keywords</h4>
                          <div className="tags-container">
                            {comparisonResult.missingKeywords?.map((kw, i) => (
                              <span key={i} className="skill-tag detected-tag" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                                ✕ {kw}
                              </span>
                            ))}
                            {(!comparisonResult.missingKeywords || comparisonResult.missingKeywords.length === 0) && (
                              <span className="empty-tag">No missing keywords found!</span>
                            )}
                          </div>
                        </div>

                        <div className="comparative-block">
                          <h4 className="subsection-title" style={{ color: '#ec4899' }}>Missing Skills</h4>
                          <div className="tags-container">
                            {comparisonResult.missingSkills?.map((skill, i) => (
                              <span key={i} className="skill-tag suggested-tag" style={{ border: '1px solid rgba(236, 72, 153, 0.3)', color: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.05)' }}>
                                ✕ {skill}
                              </span>
                            ))}
                            {(!comparisonResult.missingSkills || comparisonResult.missingSkills.length === 0) && (
                              <span className="empty-tag">No missing skills found!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Suggestions advice */}
                      <div className="improvement-section" style={{ marginTop: '1.5rem' }}>
                        <h4 className="subsection-title">AI Optimization Recommendations</h4>
                        <div className="feedback-bullets">
                          {comparisonResult.recommendations?.map((tip, i) => (
                            <div key={i} className="feedback-bullet-item">
                              <AlertCircle className="bullet-icon-alert" size={16} />
                              <p>{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COVER LETTER */}
              {activeTab === 'coverletter' && (
                <div className="results-card glass-card animate-fade-in">
                  <h2 className="results-panel-title" style={{ marginBottom: '0.5rem' }}>AI Cover Letter Generator</h2>
                  <p className="subsection-desc">Paste a job description to write a professional cover letter matching your resume.</p>

                  <div className="form-group" style={{ marginTop: '1.5rem' }}>
                    <label className="form-label" htmlFor="jd-textarea">Job Description / Requirements</label>
                    <textarea
                      id="jd-textarea"
                      placeholder="Paste the desired job posting or requirements details here..."
                      className="form-control"
                      rows={6}
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <button
                    onClick={handleGenerateCoverLetter}
                    className="btn btn-primary"
                    disabled={generatingLetter || !jobDescription.trim()}
                    style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                  >
                    {generatingLetter ? 'Generating Cover Letter...' : 'Generate Cover Letter'}
                  </button>

                  {coverLetterResult && (
                    <div className="cover-letter-output-wrapper animate-fade-in" style={{ marginTop: '2rem' }}>
                      <div className="output-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Generated Cover Letter</h3>
                        <button onClick={handlePrintCoverLetter} className="btn btn-secondary" style={{ gap: '0.5rem' }}>
                          <Download size={14} />
                          <span>Download PDF</span>
                        </button>
                      </div>

                      {/* Display Box */}
                      <div className="cover-letter-paper printable-cover-letter" style={{ padding: '1.5rem', background: 'var(--bg-item)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', whiteSpace: 'pre-line', fontSize: '0.9rem', color: 'var(--text-primary)', fontFamily: 'serif', lineHeight: 1.6 }}>
                        {coverLetterResult}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: VERSION HISTORY DIFF */}
              {activeTab === 'versions' && (
                <div className="results-card glass-card animate-fade-in">
                  <h2 className="results-panel-title" style={{ marginBottom: '0.5rem' }}>Version Diff Comparison</h2>
                  <p className="subsection-desc">Select any two scanned resumes to audit differences in scores and identified skills.</p>

                  <div className="version-selector-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="version-a">Base Version (Older)</label>
                      <select
                        id="version-a"
                        className="form-control"
                        value={vSelectedA}
                        onChange={(e) => setVSelectedA(e.target.value)}
                      >
                        <option value="">Select version...</option>
                        {history.map((h, i) => (
                          <option key={h._id} value={h._id}>
                            V{history.length - i} ({new Date(h.createdAt).toLocaleDateString()}) - {h.atsScore}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="version-b">Comparison Version (Newer)</label>
                      <select
                        id="version-b"
                        className="form-control"
                        value={vSelectedB}
                        onChange={(e) => setVSelectedB(e.target.value)}
                      >
                        <option value="">Select version...</option>
                        {history.map((h, i) => (
                          <option key={h._id} value={h._id}>
                            V{history.length - i} ({new Date(h.createdAt).toLocaleDateString()}) - {h.atsScore}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleVersionCompare}
                    className="btn btn-primary"
                    disabled={!vSelectedA || !vSelectedB}
                    style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                  >
                    Compare Selected Versions
                  </button>

                  {versionDiff && (
                    <div className="version-comparison-report animate-fade-in" style={{ marginTop: '2rem' }}>
                      <div className="results-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Performance Improvement Report</h3>
                        </div>
                        <div className="radial-score-box">
                          <div className="score-number-bubble" style={{ borderColor: versionDiff.scoreDiff.startsWith('+') ? 'var(--accent-success)' : 'var(--primary)' }}>
                            <span className="score-val" style={{ color: versionDiff.scoreDiff.startsWith('+') ? 'var(--accent-success)' : 'var(--primary)' }}>
                              {versionDiff.scoreDiff}
                            </span>
                          </div>
                          <span className="score-caption">SCORE CHANGE</span>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="breakdown-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="breakdown-metric">
                          <div className="metric-header">
                            <span>Base ATS Score (V_A)</span>
                            <span>{versionDiff.scoreA}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${versionDiff.scoreA}%` }}></div>
                          </div>
                        </div>

                        <div className="breakdown-metric">
                          <div className="metric-header">
                            <span>Comparison ATS Score (V_B)</span>
                            <span>{versionDiff.scoreB}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${versionDiff.scoreB}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Added Skills block */}
                      <div className="skills-cloud-section" style={{ marginTop: '1.5rem' }}>
                        <h4 className="subsection-title" style={{ color: 'var(--accent-success)' }}>+ Skills Added in Version B</h4>
                        <div className="tags-container" style={{ marginTop: '0.75rem' }}>
                          {versionDiff.skillsAdded?.map((skill, i) => (
                            <span key={i} className="skill-tag detected-tag" style={{ borderColor: 'var(--accent-success)', color: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                              ✓ {skill}
                            </span>
                          ))}
                          {(!versionDiff.skillsAdded || versionDiff.skillsAdded.length === 0) && (
                            <span className="empty-tag">No new skills added in this revision.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-results glass-card">
              <Upload size={48} className="empty-results-icon" />
              <h3>No Resume Audited</h3>
              <p>Upload a PDF resume on the left sidebar to generate your first ATS keywords report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
