import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Code, Terminal, Play, CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';
import './CodingChallenge.css';

const CodingChallenge = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [topic, setTopic] = useState('Arrays');
  const [difficulty, setDifficulty] = useState('Medium');
  const [loading, setLoading] = useState(false);
  const [challenge, setChallenge] = useState(null);
  const [language, setLanguage] = useState('javascript');
  const [userCode, setUserCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');
  const [badgeUnlocked, setBadgeUnlocked] = useState(false);

  const fetchChallenge = async () => {
    setLoading(true);
    setError('');
    setEvaluation(null);
    setBadgeUnlocked(false);
    try {
      const res = await fetch(`${API_URL}/challenge/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ difficulty, topic })
      });
      const data = await res.json();
      if (data.success) {
        setChallenge(data.data);
        setUserCode(data.data.starterCode[language] || '');
      } else {
        setError(data.message || 'Failed to generate coding problem.');
      }
    } catch (err) {
      setError('Connection failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (challenge) {
      setUserCode(challenge.starterCode[language] || '');
    }
  }, [language]);

  const handleSubmitCode = async () => {
    if (!challenge || !userCode.trim()) return;

    setSubmitting(true);
    setError('');
    setEvaluation(null);
    setBadgeUnlocked(false);

    try {
      const res = await fetch(`${API_URL}/challenge/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          problemTitle: challenge.title,
          problemStatement: challenge.problemStatement,
          userCode: userCode.trim(),
          language
        })
      });
      const data = await res.json();
      if (data.success) {
        setEvaluation(data.data);
        if (data.badgeUnlocked) {
          setBadgeUnlocked(true);
        }
      } else {
        setError(data.message || 'Code evaluation failed.');
      }
    } catch (err) {
      setError('Submission error. Check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="coding-challenge-view">
      <h1 className="page-title">AI Coding Sandbox</h1>
      <p className="page-subtitle">Configure topics and code in the live terminal to test your syntax structure and runtime complexity parameters.</p>

      {/* Select panel */}
      {!challenge && (
        <div className="selector-config-card glass-card animate-fade-in">
          <div className="config-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="topic-sel">Algorithm Topic</label>
              <select id="topic-sel" className="form-control" value={topic} onChange={(e) => setTopic(e.target.value)}>
                <option value="Arrays">Arrays & Hashing</option>
                <option value="Strings">Strings Manipulations</option>
                <option value="Trees">Trees & Graphs</option>
                <option value="Linked List">Linked Lists</option>
                <option value="Recursion">Recursion & DP</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="diff-sel">Difficulty Rating</label>
              <select id="diff-sel" className="form-control" value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          <button onClick={fetchChallenge} className="btn btn-primary generate-challenge-btn" disabled={loading}>
            {loading ? 'Compiling problem...' : 'Initiate Challenge'}
          </button>
        </div>
      )}

      {challenge && (
        <div className="challenge-workspace-split animate-fade-in">
          {/* Left panel: problem description */}
          <div className="workspace-panel description-side glass-card">
            <div className="panel-header-row">
              <h3>{challenge.title}</h3>
              <span className={`diff-tag ${challenge.difficulty?.toLowerCase()}`}>
                {challenge.difficulty}
              </span>
            </div>

            <div className="problem-statement-text" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: '1rem', whiteSpace: 'pre-line' }}>
              {challenge.problemStatement}
            </div>

            {/* Examples list */}
            <div className="problems-sub-section" style={{ marginTop: '1.5rem' }}>
              <h4 className="section-small-lbl">Examples</h4>
              {challenge.examples?.map((ex, idx) => (
                <div key={idx} className="example-box" style={{ background: 'var(--bg-body)', padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
                  <p style={{ fontSize: '0.82rem', margin: '0 0 0.25rem 0' }}><strong>Input:</strong> <code>{ex.input}</code></p>
                  <p style={{ fontSize: '0.82rem', margin: '0 0 0.25rem 0' }}><strong>Output:</strong> <code>{ex.output}</code></p>
                  {ex.explanation && <p style={{ fontSize: '0.82rem', margin: 0, color: 'var(--text-muted)' }}><strong>Explanation:</strong> {ex.explanation}</p>}
                </div>
              ))}
            </div>

            {/* Constraints */}
            <div className="problems-sub-section" style={{ marginTop: '1.5rem' }}>
              <h4 className="section-small-lbl">Constraints</h4>
              <ul className="constraints-bullets-list" style={{ listStyle: 'disc', paddingLeft: '1.25rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {challenge.constraints?.map((con, idx) => (
                  <li key={idx} style={{ marginTop: '0.35rem' }}>{con}</li>
                ))}
              </ul>
            </div>

            <button onClick={() => setChallenge(null)} className="btn btn-secondary" style={{ marginTop: 'auto' }}>
              Back to configurations
            </button>
          </div>

          {/* Right panel: Editor sandbox */}
          <div className="workspace-panel editor-side">
            <div className="editor-window-card glass-card">
              <div className="editor-controls-row">
                <div className="editor-mode-indicator">
                  <Terminal size={14} />
                  <span>Interactive Terminal</span>
                </div>
                <select
                  className="lang-select-control"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>

              {/* Text Area Code Editor */}
              <div className="code-editor-area-wrapper">
                <textarea
                  className="code-textarea-editor"
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="// Type solution here..."
                />
              </div>

              <div className="editor-footer-row">
                <button onClick={handleSubmitCode} className="btn btn-primary submit-code-btn" disabled={submitting}>
                  <Play size={14} />
                  <span>{submitting ? 'Executing code tests...' : 'Submit Code Solution'}</span>
                </button>
              </div>
            </div>

            {/* Submissions feedback */}
            {evaluation && (
              <div className="evaluation-report-card glass-card animate-fade-in">
                <div className="eval-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {evaluation.isCorrect ? (
                    <>
                      <CheckCircle2 size={24} style={{ color: 'var(--accent-success)' }} />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Challenge Passed Successfully!</h3>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} style={{ color: 'var(--accent-red)' }} />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Syntax Tests Failed</h3>
                    </>
                  )}
                </div>

                <div className="eval-complexity-stats" style={{ display: 'flex', gap: '2rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div className="stat">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Correctness Score</span>
                    <strong style={{ fontSize: '1.25rem', color: evaluation.isCorrect ? 'var(--accent-success)' : 'var(--accent-red)' }}>
                      {evaluation.score} / 100
                    </strong>
                  </div>
                  <div className="stat">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Time Complexity</span>
                    <strong style={{ fontSize: '1.1rem' }}>{evaluation.timeComplexity}</strong>
                  </div>
                  <div className="stat">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Space Complexity</span>
                    <strong style={{ fontSize: '1.1rem' }}>{evaluation.spaceComplexity}</strong>
                  </div>
                </div>

                {badgeUnlocked && (
                  <div className="badge-unlock-banner animate-pulse" style={{ display: 'flex', gap: '1rem', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--accent-warning)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginTop: '1rem', alignItems: 'center' }}>
                    <Award size={24} style={{ color: 'var(--accent-warning)' }} />
                    <div>
                      <h5 style={{ fontWeight: 800, margin: 0, color: 'var(--accent-warning)' }}>Badge Unlocked: Coding Ninja</h5>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>You successfully solved your first AI coding challenge!</p>
                    </div>
                  </div>
                )}

                <div className="eval-feedback-text" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.45, marginTop: '1rem' }}>
                  {evaluation.feedback}
                </div>

                {evaluation.optimalSolution && (
                  <div className="optimal-solution-panel" style={{ marginTop: '1.5rem' }}>
                    <h4 className="section-small-lbl">Recommended Optimal Solution</h4>
                    <pre style={{ background: 'var(--bg-body)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflowX: 'auto', fontSize: '0.8rem', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                      <code>{evaluation.optimalSolution}</code>
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodingChallenge;
