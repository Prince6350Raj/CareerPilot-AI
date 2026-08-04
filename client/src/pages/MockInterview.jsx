import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, ArrowRight, Play, Timer, Check, Info, Award, Download, Briefcase, Search, ChevronDown } from 'lucide-react';
import './MockInterview.css';

const MockInterview = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [role, setRole] = useState('');
  const [type, setType] = useState('Mixed');
  const [format, setFormat] = useState('theory');
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  
  // Terminal states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState(null);
  
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Scorecard state
  const [scorecard, setScorecard] = useState(null);
  const [history, setHistory] = useState([]);
  const [showFormats, setShowFormats] = useState(false);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/interview/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, API_URL]);

  // Timer runner
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setScorecard(null);
    try {
      const res = await fetch(`${API_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, type, limit, format })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSession(data.data);
        setCurrentIndex(0);
        setUserAnswer('');
        setQuestionFeedback(null);
        setSeconds(0);
        setTimerActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;

    setSubmittingAnswer(true);
    setTimerActive(false); // pause timer during evaluation

    const currentQuestion = activeSession.questions[currentIndex];

    try {
      const res = await fetch(`${API_URL}/interview/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId: activeSession._id,
          questionId: currentQuestion._id,
          userAnswer
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuestionFeedback(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeSession.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setQuestionFeedback(null);
      setSeconds(0);
      setTimerActive(true);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setTimerActive(false);
    try {
      const res = await fetch(`${API_URL}/interview/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewId: activeSession._id })
      });
      const data = await res.json();
      if (data.success) {
        setScorecard(data.data);
        setActiveSession(null);
        fetchHistory();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const getBadgeDetails = (score) => {
    const pct = (score || 0) * 10;
    if (pct < 40) return { label: 'FAIL', className: 'cert-badge-fail', color: '#ef4444', ribbon: '#991b1b', inner: '#fee2e2' };
    if (pct < 60) return { label: 'PASS', className: 'cert-badge-pass', color: '#10b981', ribbon: '#065f46', inner: '#d1fae5' };
    if (pct < 70) return { label: 'BRONZE', className: 'cert-badge-bronze', color: '#cd7f32', ribbon: '#7c2d12', inner: '#ffedd5' };
    if (pct <= 85) return { label: 'SILVER', className: 'cert-badge-silver', color: '#94a3b8', ribbon: '#475569', inner: '#f1f5f9' };
    return { label: 'GOLD', className: 'cert-badge-gold', color: '#eab308', ribbon: '#a16207', inner: '#fef9c3' };
  };

  const downloadCertificate = (exportType = 'pdf') => {
    if (!scorecard) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    
    // 1. Draw premium background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.5, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);
    
    // 2. Draw dual-line certificate border
    ctx.strokeStyle = '#0284c7'; 
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 1160, 810);
    
    ctx.strokeStyle = '#cbd5e1'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 1130, 780);

    // Decorative corner brackets
    ctx.fillStyle = '#0f4c81';
    ctx.fillRect(20, 20, 80, 8);
    ctx.fillRect(20, 20, 8, 80);
    ctx.fillRect(1100, 20, 80, 8);
    ctx.fillRect(1172, 20, 8, 80);
    ctx.fillRect(20, 822, 80, 8);
    ctx.fillRect(20, 750, 8, 80);
    ctx.fillRect(1100, 822, 80, 8);
    ctx.fillRect(1172, 750, 8, 80);

    // 3. Draw Watermark logo in center
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 75px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CAREERPILOT AI', 600, 425);
    ctx.restore();

    // 4. Header text
    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF RECOGNITION', 600, 140);
    
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px Georgia';
    ctx.fillText('This assessment certificate is proudly presented to', 600, 210);

    // 5. User name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 52px Arial';
    ctx.fillText(user?.name || 'Tech Aspirant', 600, 295);
    
    // Decorative underline under name
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 325);
    ctx.lineTo(850, 325);
    ctx.stroke();
    
    // 6. Presentation detail
    ctx.fillStyle = '#334155';
    ctx.font = '18px Arial';
    ctx.fillText(`for successfully completing the AI Mock Interview Assessment as a`, 600, 385);
    
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(scorecard.role.toUpperCase(), 600, 435);

    // 7. Score Badge card in center
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(450, 485, 300, 90, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('ASSESSMENT PERFORMANCE SCORE', 600, 515);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${scorecard.overallScore ? scorecard.overallScore.toFixed(1) : '0.0'} / 10`, 600, 555);

    // 8. Footer metadata: Date, Verification ID
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${new Date(scorecard.createdAt || Date.now()).toLocaleDateString()}`, 100, 680);
    ctx.fillText(`Credential ID: CP-${scorecard._id ? scorecard._id.substring(scorecard._id.length - 8).toUpperCase() : 'VERIFY'}`, 100, 710);
    ctx.fillText('Verification: Secure Blockchain Ledgers', 100, 740);

    ctx.textAlign = 'right';
    ctx.fillText('Evaluated & Certified By:', 1100, 680);
    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 18px Georgia';
    ctx.fillText('CareerPilot AI Grader', 1100, 715);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(900, 690);
    ctx.lineTo(1100, 690);
    ctx.stroke();

    // 9. Draw the score-specific stamp emblem in the bottom center
    const stamp = getBadgeDetails(scorecard.overallScore);
    ctx.fillStyle = stamp.color; 
    ctx.beginPath();
    ctx.arc(600, 680, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Ribbon triangles for stamp
    ctx.fillStyle = stamp.ribbon;
    ctx.beginPath();
    ctx.moveTo(580, 710);
    ctx.lineTo(570, 760);
    ctx.lineTo(600, 740);
    ctx.lineTo(630, 760);
    ctx.lineTo(620, 710);
    ctx.fill();

    // Inner stamp circle
    ctx.strokeStyle = stamp.inner;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 680, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = stamp.label.length > 5 ? 'bold 8px Arial' : 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(stamp.label, 600, 683);

    // 10. Trigger file download based on selected format (PDF, PNG, or Word)
    const fileName = `Certificate_CareerPilot_${scorecard.role.replace(/\s+/g, '_')}`;
    const imgData = canvas.toDataURL('image/png');

    if (exportType === 'png') {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = imgData;
      link.click();
    } else if (exportType === 'word') {
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>CareerPilot AI Certificate</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 11in 8.5in; /* Landscape Letter size */
              margin: 0.25in;
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin: 0;
              padding: 0;
            }
            .cert-container {
              width: 100%;
              max-width: 10.5in;
              margin: 0 auto;
            }
            img {
              width: 100%;
              height: auto;
              border: 2px solid #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <h2 style="color: #0f4c81; margin-bottom: 10px;">CareerPilot AI Assessment Record</h2>
            <p style="color: #64748b; font-size: 12pt; margin-bottom: 20px;">
              This document contains the verified mock interview achievement certificate for <b>${user?.name || 'Candidate'}</b> in the <b>${scorecard.role}</b> track.
            </p>
            <img src="${imgData}" alt="Certificate" />
          </div>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Default to PDF
      import('jspdf').then(({ jsPDF }) => {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1200, 850]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 1200, 850);
        pdf.save(`${fileName}.pdf`);
      }).catch(err => {
        console.error("Failed to load jsPDF, falling back to PNG:", err);
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = imgData;
        link.click();
      });
    }
  };

  return (
    <div className="interview-view-container">
      <h1 className="page-title">AI Mock Interview</h1>
      <p className="page-subtitle">Simulate real technical, HR, and behavioral interview environments and get graded feedback.</p>

      {/* 1. SETUP MODULE */}
      {!activeSession && !scorecard && (
        <div className="setup-split-layout">
          <div className="setup-card-box glass-card animate-fade-in">
            <h3 className="card-mini-title">Setup Simulated Session</h3>
            <form onSubmit={handleStart} className="setup-form">
              <div className="form-group">
                <label className="form-label" htmlFor="role-input">Target Job Role</label>
                <input
                  type="text"
                  id="role-input"
                  className="form-control"
                  placeholder="e.g. Frontend React Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="type-input">Question Category</label>
                <select
                  id="type-input"
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="Mixed">Mixed HR & Tech</option>
                  <option value="Technical">Strictly Technical</option>
                  <option value="Behavioral">Strictly Behavioral (HR)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="limit-input">Number of Questions</label>
                <select
                  id="limit-input"
                  className="form-control"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                >
                  {Array.from({ length: 18 }, (_, i) => i + 3).map(num => (
                    <option key={num} value={num}>{num} Questions</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="format-input">Interview Format</label>
                <select
                  id="format-input"
                  className="form-control"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  <option value="theory">Subjective / Written (Theory)</option>
                  <option value="mcq">Multiple Choice Questions (MCQ)</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary start-btn" disabled={loading}>
                <Play size={16} />
                <span>{loading ? 'Initializing Console...' : 'Initiate Session'}</span>
              </button>
            </form>
          </div>

          {/* History */}
          <div className="interview-history-card glass-card">
            <h3 className="card-mini-title">Session History</h3>
            <div className="history-list">
              {history.map(item => (
                <div
                  key={item._id}
                  className="history-interview-item"
                  onClick={() => setScorecard(item)}
                >
                  <MessageSquare size={18} className="interview-meta-icon" />
                  <div className="interview-meta-details">
                    <span className="interview-title">{item.role}</span>
                    <span className="interview-score">Score: {item.overallScore ? item.overallScore.toFixed(1) : 0}/10</span>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <p className="empty-text">No previous sessions found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. ACTIVE TERMINAL */}
      {activeSession && (
        <div className="active-terminal-card glass-card animate-fade-in">
          {/* Header */}
          <div className="terminal-header-bar">
            <div className="q-indicator">
              <span>QUESTION {currentIndex + 1} OF {activeSession.questions.length}</span>
              <span className="q-category">{activeSession.questions[currentIndex].category}</span>
            </div>
            <div className="terminal-timer">
              <Timer size={16} />
              <span>{formatTime(seconds)}</span>
            </div>
          </div>

          {/* Question Text */}
          <div className="terminal-prompt-box">
            <p className="terminal-prompt-text">
              {activeSession.questions[currentIndex].questionText}
            </p>
          </div>

          {/* Answer Input (MCQ Choices or Subjective Textarea) */}
          {activeSession.format === 'mcq' ? (
            <div className="mcq-choices-container">
              {activeSession.questions[currentIndex].options?.map((opt, idx) => {
                const optLetter = opt.substring(0, 1).toUpperCase(); 
                const isSelected = userAnswer === optLetter;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`mcq-choice-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (questionFeedback === null) {
                        setUserAnswer(optLetter);
                      }
                    }}
                    disabled={questionFeedback !== null || submittingAnswer}
                  >
                    <span className="choice-letter">{optLetter}</span>
                    <span className="choice-text">{opt.substring(3)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="terminal-textarea-container">
              <textarea
                className="terminal-textarea"
                placeholder="Type your structured answer here. Be detailed, explain systems, algorithms, and practical usages..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={questionFeedback !== null || submittingAnswer}
                rows={8}
              />
            </div>
          )}

          {/* Controls */}
          <div className="terminal-actions-bar">
            {questionFeedback === null ? (
              <button
                className="btn btn-primary"
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim() || submittingAnswer}
              >
                <span>{submittingAnswer ? 'Evaluating Answer...' : 'Submit Response'}</span>
                {!submittingAnswer && <Check size={16} />}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={handleNext}>
                <span>
                  {currentIndex < activeSession.questions.length - 1 ? 'Next Question' : 'View Full Scorecard'}
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* AI Feedback Overlay */}
          {questionFeedback && (
            <div className="terminal-evaluation-overlay animate-fade-in">
              <div className="feedback-badge-row">
                <div className="rating-badge">
                  <span>Rating: {questionFeedback.rating}/10</span>
                </div>
              </div>

              <div className="evaluation-details">
                <div className="feedback-section">
                  <h4 className="section-small-lbl">AI Evaluation Comments</h4>
                  <p className="eval-text">{questionFeedback.feedback}</p>
                </div>

                <div className="feedback-section">
                  <h4 className="section-small-lbl">Optimal Model Solution</h4>
                  <p className="model-ans-text">{questionFeedback.modelAnswer}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SCORECARD MODULE */}
      {scorecard && (
        <div className="scorecard-view-details animate-fade-in">
          <div className="scorecard-summary-card glass-card">
            <div className="summary-details">
              <h2>Performance Scorecard: {scorecard.role}</h2>
              <p className="summary-desc">{scorecard.summaryFeedback}</p>
              <button className="btn btn-primary" style={{ marginTop: '1.25rem' }} onClick={() => setScorecard(null)}>
                Take Another Test
              </button>
            </div>
            <div className="scorecard-total-badge">
              <Award size={48} className="badge-glow-decor" />
              <span className="total-score-val">{scorecard.overallScore ? scorecard.overallScore.toFixed(1) : 0}</span>
              <span className="total-score-lbl">
                OVERALL / 10
                <span style={{ fontSize: '0.7rem', display: 'block', opacity: 0.8, marginTop: '0.2rem' }}>
                  ({scorecard.questions?.reduce((sum, q) => sum + (q.rating || 0), 0)} / {scorecard.questions?.length * (scorecard.format === 'mcq' ? 5 : 10)} Marks)
                </span>
              </span>
            </div>
          </div>

          {/* Certificate Generation & Jobs Grid */}
          <div className="scorecard-extras-grid">
            {/* Certificate Card */}
            <div className="extra-feature-card glass-card certificate-card">
              <div className="extra-card-header">
                <Award size={22} className="accent-icon" />
                <h3>Your Assessment Certificate</h3>
              </div>
              <p className="extra-card-desc">
                Congratulations! You successfully finished the mock interview. You can now download a certified record of your performance.
              </p>
              
              {/* Visual Certificate Card Preview */}
              {(() => {
                const badgeInfo = getBadgeDetails(scorecard.overallScore);
                return (
                  <div className="certificate-mini-preview">
                    <div className="cert-preview-border">
                      <div className="cert-preview-content" style={{ position: 'relative', overflow: 'hidden' }}>
                        <span className="cert-lbl-mini">CERTIFICATE OF ACHIEVEMENT</span>
                        <span className="cert-name-mini">{user?.name || 'Candidate'}</span>
                        <span className="cert-role-mini">Role: {scorecard.role}</span>
                        <span className="cert-score-mini">Score: {scorecard.overallScore ? scorecard.overallScore.toFixed(1) : 0}/10</span>
                        <span className={`cert-badge-mini ${badgeInfo.className}`}>{badgeInfo.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="download-dropdown-container" style={{ position: 'relative', width: '100%' }}>
                <button 
                  className="btn btn-primary download-cert-btn" 
                  onClick={() => setShowFormats(!showFormats)}
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} />
                  <span>Download Certificate</span>
                  <ChevronDown size={14} style={{ marginLeft: 'auto', transform: showFormats ? 'rotate(180deg)' : 'none', transition: 'var(--transition-smooth)' }} />
                </button>
                
                {showFormats && (
                  <div 
                    className="download-formats-menu glass-card" 
                    style={{ 
                      position: 'absolute', 
                      bottom: 'calc(100% + 0.5rem)', 
                      left: 0, 
                      width: '100%', 
                      zIndex: 10, 
                      padding: '0.5rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.25rem',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <button 
                      className="format-option-btn" 
                      onClick={() => { downloadCertificate('pdf'); setShowFormats(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', width: '100%', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>📄</span> Export as PDF Document (.pdf)
                    </button>
                    <button 
                      className="format-option-btn" 
                      onClick={() => { downloadCertificate('png'); setShowFormats(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', width: '100%', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>🖼️</span> Export as Image file (.png)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Company Vacancies Card */}
            <div className="extra-feature-card glass-card">
              <div className="extra-card-header">
                <Briefcase size={22} className="accent-icon" />
                <h3>Direct Company Job Openings</h3>
              </div>
              
              {scorecard.overallScore < 4.0 ? (
                <div className="assessment-failed-message" style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'var(--bg-item)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🎯</span>
                  <h4 style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Assessment Unsuccessful
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    You did not pass the assessment this time. Please prepare more thoroughly and retake the test.
                    Once you achieve a passing score (4.0+), we will unlock customized company career recommendations and job vacancy portals matching your profile.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                    "Success is not final, failure is not fatal: it is the courage to continue that counts."
                  </p>
                </div>
              ) : (
                <>
                  <p className="extra-card-desc">
                    {scorecard.overallScore > 8.5 
                      ? 'Outstanding performance! You earned a GOLD Badge. Here are direct hiring links for Tier-1 Tech Giants:'
                      : scorecard.overallScore >= 7.0
                      ? 'Great effort! You earned a SILVER Badge. Here are career opportunities at top national tech leaders:'
                      : 'Good job! You earned a BRONZE/PASS Badge. Expand your experience at fast-growing local startups:'}
                  </p>

                  <div className="company-vacancies-list">
                    {(() => {
                      const roleQuery = encodeURIComponent(scorecard.role);
                      const score = scorecard.overallScore || 0;

                      if (score > 8.5) {
                        return [
                          {
                            name: 'Google Careers',
                            logo: 'G',
                            color: '#4285F4',
                            url: `https://www.google.com/about/careers/applications/jobs/results/?q=${roleQuery}`,
                            desc: 'Apply for elite roles at Google'
                          },
                          {
                            name: 'Microsoft Careers',
                            logo: 'M',
                            color: '#F25022',
                            url: `https://careers.microsoft.com/us/en/search-results?keywords=${roleQuery}`,
                            desc: 'Explore engineering roles at Microsoft'
                          },
                          {
                            name: 'Amazon Jobs',
                            logo: 'A',
                            color: '#FF9900',
                            url: `https://www.amazon.jobs/en/search?base_query=${roleQuery}`,
                            desc: 'Search direct opportunities at Amazon'
                          },
                          {
                            name: 'Meta Careers',
                            logo: 'Me',
                            color: '#0668E1',
                            url: `https://www.metacareers.com/jobs?q=${roleQuery}`,
                            desc: 'Explore product engineering at Meta'
                          },
                          {
                            name: 'Samsung Careers',
                            logo: 'S',
                            color: '#034EA2',
                            url: `https://sec.careers.samsung.com/`,
                            desc: 'Apply for core tech roles at Samsung Global'
                          },
                          {
                            name: 'Accenture Jobs',
                            logo: 'Ac',
                            color: '#A100FF',
                            url: `https://www.accenture.com/in-en/careers/jobsearch?jk=${roleQuery}`,
                            desc: 'Explore consultant and systems developer roles'
                          }
                        ];
                      } else if (score >= 7.0) {
                        return [
                          {
                            name: 'Flipkart Careers',
                            logo: 'F',
                            color: '#2874F0',
                            url: `https://www.flipkartcareers.com/#!/joblist?search=${roleQuery}`,
                            desc: 'Apply to top e-commerce roles at Flipkart'
                          },
                          {
                            name: 'Zomato Careers',
                            logo: 'Z',
                            color: '#CB202D',
                            url: `https://www.zomato.com/careers`,
                            desc: 'Explore tech developer roles at Zomato'
                          },
                          {
                            name: 'Lenskart Jobs',
                            logo: 'L',
                            color: '#000045',
                            url: `https://lenskart.peoplestrong.com/portal/home`,
                            desc: 'Search active tech vacancies at Lenskart'
                          },
                          {
                            name: 'TCS Careers',
                            logo: 'T',
                            color: '#1E3A8A',
                            url: `https://www.tcs.com/careers/search-results?keyword=${roleQuery}`,
                            desc: 'Search enterprise roles at Tata Consultancy Services'
                          },
                          {
                            name: 'Uber Careers',
                            logo: 'U',
                            color: '#000000',
                            url: `https://www.uber.com/global/en/careers/list/?q=${roleQuery}`,
                            desc: 'Search ride-sharing tech roles at Uber'
                          },
                          {
                            name: 'Ola Cabs Careers',
                            logo: 'O',
                            color: '#4CA64C',
                            url: `https://www.olacabs.com/careers`,
                            desc: 'Explore mobility developer roles at Ola Cabs'
                          },
                          {
                            name: 'boAt Lifestyle',
                            logo: 'bA',
                            color: '#E31E24',
                            url: `https://www.boat-lifestyle.com/pages/careers`,
                            desc: 'Apply for direct product & developer roles at boAt'
                          }
                        ];
                      } else {
                        return [
                          {
                            name: 'Meesho Careers',
                            logo: 'Me',
                            color: '#F43F5E',
                            url: `https://www.meesho.careers/`,
                            desc: 'Explore developer roles at Meesho social commerce'
                          },
                          {
                            name: 'Zepto Careers',
                            logo: 'Zp',
                            color: '#3B0764',
                            url: `https://www.zepto.careers/`,
                            desc: 'Apply for quick-commerce roles at Zepto'
                          },
                          {
                            name: 'Razorpay Jobs',
                            logo: 'Rp',
                            color: '#0B72E7',
                            url: `https://razorpay.com/jobs/`,
                            desc: 'Explore fintech engineer roles at Razorpay'
                          },
                          {
                            name: 'ShareChat Jobs',
                            logo: 'Sc',
                            color: '#FF6E14',
                            url: `https://sharechat.com/careers`,
                            desc: 'Search social platform engineering at ShareChat'
                          },
                          {
                            name: 'Paytm Careers',
                            logo: 'Py',
                            color: '#002E6E',
                            url: `https://careers.paytm.com/`,
                            desc: 'Apply to dynamic fintech slots at Paytm'
                          },
                          {
                            name: 'Dunzo Careers',
                            logo: 'Dn',
                            color: '#00BFA5',
                            url: `https://www.dunzo.com/careers`,
                            desc: 'Search localized delivery roles at Dunzo'
                          }
                        ];
                      }
                    })().map((company, idx) => (
                      <a 
                        key={idx}
                        href={company.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-vacancy-item"
                      >
                        <div className="company-logo-avatar" style={{ backgroundColor: company.color }}>
                          {company.logo}
                        </div>
                        <div className="company-meta-info">
                          <span className="company-name">{company.name}</span>
                          <span className="company-job-desc">{company.desc}</span>
                        </div>
                        <div className="vacancy-pulse-indicator">
                          <span className="pulse-dot"></span>
                          <span className="pulse-lbl">Open</span>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Separated Job Search Portals Section */}
                  <div className="job-portals-section-divider" style={{ margin: '2rem 0 1rem 0', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      <span style={{ fontSize: '1.2rem' }}>🌐</span> Global Job Search Engines
                    </h4>
                    <p className="extra-card-desc" style={{ marginBottom: '1rem' }}>
                      Search aggregated listings across top worldwide job discovery platforms for custom roles:
                    </p>
                  </div>

                  <div className="company-vacancies-list">
                    {(() => {
                      const roleQuery = encodeURIComponent(scorecard.role);
                      return [
                        {
                          name: 'LinkedIn Jobs',
                          logo: 'In',
                          color: '#0A66C2',
                          url: `https://www.linkedin.com/jobs/search/?keywords=${roleQuery}`,
                          desc: `Search active ${scorecard.role} roles on LinkedIn`
                        },
                        {
                          name: 'Indeed Jobs',
                          logo: 'Id',
                          color: '#2164f3',
                          url: `https://www.indeed.com/jobs?q=${roleQuery}`,
                          desc: `Search localized jobs on Indeed portal`
                        },
                        {
                          name: 'Naukri.com',
                          logo: 'N',
                          color: '#ff6f00',
                          url: `https://www.naukri.com/${roleQuery.replace(/%20/g, '-')}-jobs`,
                          desc: `Explore top Indian openings on Naukri`
                        }
                      ];
                    })().map((portal, idx) => (
                      <a 
                        key={idx}
                        href={portal.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-vacancy-item"
                        style={{ border: '1px solid hsla(215, 85%, 60%, 0.15)', background: 'hsla(215, 85%, 60%, 0.03)' }}
                      >
                        <div className="company-logo-avatar" style={{ backgroundColor: portal.color }}>
                          {portal.logo}
                        </div>
                        <div className="company-meta-info">
                          <span className="company-name">{portal.name}</span>
                          <span className="company-job-desc">{portal.desc}</span>
                        </div>
                        <div className="vacancy-pulse-indicator">
                          <span className="pulse-dot" style={{ backgroundColor: 'var(--secondary)' }}></span>
                          <span className="pulse-lbl" style={{ color: 'var(--secondary)' }}>Search</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="scorecard-qa-trail">
            {scorecard.questions?.map((q, i) => (
              <div key={q._id || i} className="qa-accordion-item glass-card">
                <div className="accordion-header">
                  <h4>Q{i + 1}: {q.questionText}</h4>
                  <span className="item-rating-tag">
                    {q.rating}/{scorecard.format === 'mcq' ? 5 : 10}
                  </span>
                </div>
                <div className="accordion-body">
                  <div className="body-block">
                    <span className="block-lbl">Your Answer</span>
                    <p className="block-text italic-text">{q.userAnswer || 'No response provided.'}</p>
                  </div>

                  <div className="body-block">
                    <span className="block-lbl">AI Evaluation Reviews</span>
                    <p className="block-text">{q.feedback}</p>
                  </div>

                  <div className="body-block">
                    <span className="block-lbl">Reference Answer Guide</span>
                    <p className="block-text green-theme">{q.modelAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
