import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Award, Flame, Send, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import './Progress.css';

const ProgressPage = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const fetchProgress = async () => {
    try {
      const res = await fetch(`${API_URL}/progress/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [token, API_URL]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !content) return;

    setSubmittingFeedback(true);
    setFormError('');
    setFormSuccess('');

    try {
      const res = await fetch(`${API_URL}/feedback/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, content })
      });
      const data = await res.json();
      if (data.success) {
        setFormSuccess('Feedback submitted successfully. Thank you for your support!');
        setSubject('');
        setContent('');
      } else {
        setFormError(data.message || 'Failed to submit feedback.');
      }
    } catch (err) {
      setFormError('Network communication error.');
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner-loader"></div>
      </div>
    );
  }

  // Pre-compiled list of badges for the visual grid
  const badgeLibrary = [
    { id: 'resume_pro', title: 'Resume Pro', desc: 'Audit a PDF resume for ATS optimization.', icon: 'FileText' },
    { id: 'first_roadmap', title: 'Roadmap Builder', desc: 'Create a custom week-by-week career roadmap.', icon: 'Map' },
    { id: 'first_interview', title: 'First Steps', desc: 'Finish a mock interview session.', icon: 'MessageSquare' },
    { id: 'interview_ace', title: 'Interview Ace', desc: 'Achieve an average score of 8/10 or more.', icon: 'Award' },
    { id: 'streak_3', title: 'Streak Explorer', desc: 'Keep a daily active streak of 3 days.', icon: 'Flame' },
    { id: 'streak_7', title: 'Streak Veteran', desc: 'Keep a daily active streak of 7 days.', icon: 'Award' }
  ];

  return (
    <div className="progress-page-view">
      <h1 className="page-title">Achievements & Progress</h1>
      <p className="page-subtitle">Unlock badges, track your calendar streaks, and submit feedback to improve CareerPilot.</p>

      <div className="progress-split-grid">
        {/* Badges showcase */}
        <div className="badges-cabinet-card glass-card col-span-2">
          <h3 className="section-title">Badge Trophy Cabinet</h3>
          <div className="badges-display-grid">
            {badgeLibrary.map(badge => {
              const unlockedBadge = progress?.badges?.find(b => b.badgeId === badge.id);
              const isUnlocked = !!unlockedBadge;
              return (
                <div key={badge.id} className={`badge-trophy-box ${isUnlocked ? 'unlocked' : 'locked'}`}>
                  <div className="trophy-icon-wrapper">
                    {badge.id.startsWith('streak') || badge.id === 'first_interview' ? (
                      <Flame size={32} className="badge-render-icon" />
                    ) : (
                      <Award size={32} className="badge-render-icon" />
                    )}
                    {!isUnlocked && <div className="lock-icon-overlay">🔒</div>}
                  </div>
                  <h4 className="badge-title-lbl">{badge.title}</h4>
                  <p className="badge-desc-lbl">{badge.desc}</p>
                  {isUnlocked && (
                    <span className="unlocked-date-lbl">
                      Unlocked: {new Date(unlockedBadge.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right side: Streak and feedback form */}
        <div className="progress-sidebar-right">
          {/* Streak details */}
          <div className="streak-focus-card glass-card">
            <div className="streak-content">
              <Flame size={48} className="sidebar-streak-icon animate-pulse" />
              <h2>{progress?.dailyStreak || 0} Day Streak</h2>
              <p>Practice daily to maintain your learning streak and build consistent habits.</p>
            </div>
          </div>

          {/* Feedback Card */}
          <div className="feedback-form-card glass-card">
            <h3 className="card-mini-title">Submit Platform Feedback</h3>
            {formSuccess && <div className="alert-message success-alert">{formSuccess}</div>}
            {formError && <div className="alert-message error-alert">{formError}</div>}
            <form onSubmit={handleFeedbackSubmit} className="feedback-form">
              <div className="form-group">
                <label className="form-label" htmlFor="feed-subject">Subject</label>
                <input
                  type="text"
                  id="feed-subject"
                  className="form-control"
                  placeholder="e.g. Bug on Mock Interview / Suggestion"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="feed-content">Description</label>
                <textarea
                  id="feed-content"
                  className="form-control textarea-field"
                  placeholder="Details..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary submit-feedback" disabled={submittingFeedback}>
                <Send size={14} />
                <span>{submittingFeedback ? 'Sending Feedback...' : 'Send Feedback'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;
