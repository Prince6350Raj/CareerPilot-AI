import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Code, 
  Terminal, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Award,
  Layers, 
  Search, 
  BarChart3, 
  Binary, 
  Compass, 
  Activity, 
  Shuffle, 
  Sigma, 
  Zap,
  Share2,
  GitBranch
} from 'lucide-react';
import './CodingChallenge.css';

const TOPICS = [
  { id: 'Arrays', name: 'Arrays & Hashing', icon: Code, desc: 'Vectors, sets, maps, hash tables' },
  { id: 'Strings', name: 'Strings Manipulation', icon: Terminal, desc: 'Substrings, regex, anagrams' },
  { id: 'Linked List', name: 'Linked Lists', icon: ArrowRight, desc: 'Singly, doubly, cycle detection' },
  { id: 'Stack', name: 'Stacks & LIFO', icon: Layers, desc: 'LIFO structures, matching parentheses' },
  { id: 'Queue', name: 'Queues & FIFO', icon: Shuffle, desc: 'FIFO structures, sliding windows' },
  { id: 'Searching', name: 'Searching Algorithms', icon: Search, desc: 'Binary search, divide & conquer' },
  { id: 'Sorting', name: 'Sorting Algorithms', icon: BarChart3, desc: 'Quick, merge, bubble, heap sorting' },
  { id: 'depth-first-search', name: 'Depth-First Search', icon: GitBranch, desc: 'Recursive tree and graph traversal' },
  { id: 'breadth-first-search', name: 'Breadth-First Search', icon: Share2, desc: 'Shortest path, level-order queues' },
  { id: 'two-pointer', name: 'Two-Pointer Technique', icon: Activity, desc: 'Slow-fast runners, bounded limits' },
  { id: 'counting', name: 'Counting & Hashing', icon: Binary, desc: 'Frequency counts, hash calculations' },
  { id: 'math', name: 'Math & Logic', icon: Sigma, desc: 'GCD, primes, combinations, logic' },
  { id: 'greedy', name: 'Greedy Algorithms', icon: Zap, desc: 'Local optimal choice, scheduling' },
  { id: 'Recursion', name: 'Recursion & DP', icon: Compass, desc: 'Dynamic programming, memoization' }
];

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

  // Local storage gamification to display LeetCode-style solved counts
  const [solvedEasy, setSolvedEasy] = useState(parseInt(localStorage.getItem('coding_solved_easy') || '4', 10));
  const [solvedMedium, setSolvedMedium] = useState(parseInt(localStorage.getItem('coding_solved_medium') || '2', 10));
  const [solvedHard, setSolvedHard] = useState(parseInt(localStorage.getItem('coding_solved_hard') || '1', 10));

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
        // Increment and save solved counts on correct submission
        if (data.data.isCorrect) {
          if (difficulty === 'Easy') {
            const nextVal = solvedEasy + 1;
            setSolvedEasy(nextVal);
            localStorage.setItem('coding_solved_easy', nextVal.toString());
          } else if (difficulty === 'Medium') {
            const nextVal = solvedMedium + 1;
            setSolvedMedium(nextVal);
            localStorage.setItem('coding_solved_medium', nextVal.toString());
          } else if (difficulty === 'Hard') {
            const nextVal = solvedHard + 1;
            setSolvedHard(nextVal);
            localStorage.setItem('coding_solved_hard', nextVal.toString());
          }
        }
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

      {error && (
        <div style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
          {error}
        </div>
      )}

      {/* Select panel */}
      {!challenge && (
        <div className="challenge-setup-dashboard animate-fade-in">
          
          {/* Left Column: LeetCode-style statistics panel */}
          <div className="stats-sidebar-panel glass-card">
            <h3 className="panel-section-title">Mastery Analytics</h3>
            <p className="panel-section-subtitle" style={{ margin: '0 0 1.5rem 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>Track your algorithm practice metrics.</p>
            
            {/* Circular Progress Ring */}
            <div className="leetcode-progress-circle-wrapper" style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0 2rem 0', position: 'relative' }}>
              <svg className="progress-ring-svg" width="120" height="120">
                <circle className="progress-ring-bg" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" r="48" cx="60" cy="60" />
                <circle 
                  className="progress-ring-fill" 
                  stroke="var(--primary)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  r="48" 
                  cx="60" 
                  cy="60" 
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - (solvedEasy + solvedMedium + solvedHard) / 30)}`}
                  strokeLinecap="round"
                  style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s ease' }}
                />
              </svg>
              <div className="progress-ring-center-text" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="total-solved-num" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-heading)' }}>{solvedEasy + solvedMedium + solvedHard}</span>
                <span className="total-solved-label" style={{ fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Solved</span>
              </div>
            </div>
            
            {/* Difficulty Progress Bars */}
            <div className="difficulty-bars-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="diff-bar-item easy">
                <div className="diff-bar-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <span className="diff-lbl" style={{ color: 'hsl(142, 70%, 45%)' }}>Easy</span>
                  <span className="diff-count" style={{ color: 'var(--text-secondary)' }}>{solvedEasy} / 10</span>
                </div>
                <div className="diff-bar-bg" style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div className="diff-bar-fill" style={{ height: '100%', width: `${Math.min(100, (solvedEasy / 10) * 100)}%`, background: 'hsl(142, 70%, 45%)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              <div className="diff-bar-item medium">
                <div className="diff-bar-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <span className="diff-lbl" style={{ color: 'hsl(38, 92%, 50%)' }}>Medium</span>
                  <span className="diff-count" style={{ color: 'var(--text-secondary)' }}>{solvedMedium} / 15</span>
                </div>
                <div className="diff-bar-bg" style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div className="diff-bar-fill" style={{ height: '100%', width: `${Math.min(100, (solvedMedium / 15) * 100)}%`, background: 'hsl(38, 92%, 50%)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>

              <div className="diff-bar-item hard">
                <div className="diff-bar-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <span className="diff-lbl" style={{ color: 'hsl(0, 84%, 60%)' }}>Hard</span>
                  <span className="diff-count" style={{ color: 'var(--text-secondary)' }}>{solvedHard} / 5</span>
                </div>
                <div className="diff-bar-bg" style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div className="diff-bar-fill" style={{ height: '100%', width: `${Math.min(100, (solvedHard / 5) * 100)}%`, background: 'hsl(0, 84%, 60%)', transition: 'width 0.4s ease' }}></div>
                </div>
              </div>
            </div>
            
            {/* Badges section */}
            <div className="stats-badges-box" style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <h4 className="section-small-lbl" style={{ margin: '0 0 0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 700 }}>
                <Award size={14} style={{ color: 'var(--accent-warning)' }} />
                <span>Earned Badges</span>
              </h4>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {(solvedEasy + solvedMedium + solvedHard) > 0 ? (
                  <span className="stats-badge-pill" style={{ fontSize: '0.72rem', background: 'var(--bg-item-hover)', border: '1px solid var(--border-color)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    ⚡ Coding Ninja
                  </span>
                ) : null}
                {solvedMedium > 0 ? (
                  <span className="stats-badge-pill gold" style={{ fontSize: '0.72rem', background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700, color: '#fbbf24' }}>
                    🏆 Logic Master
                  </span>
                ) : null}
                {solvedHard > 0 ? (
                  <span className="stats-badge-pill red" style={{ fontSize: '0.72rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 700, color: '#f87171' }}>
                    🔥 Hard Core
                  </span>
                ) : null}
                {(solvedEasy + solvedMedium + solvedHard) === 0 ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Solve questions to unlock achievements.</span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Explorer Dashboard */}
          <div className="explorer-main-panel glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 className="panel-section-title" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Select Algorithm Category</h3>
            <p className="panel-section-subtitle" style={{ margin: '0 0 1.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Pick a topic to generate your customized AI coding sandbox challenge.</p>
            
            {/* Grid of Topic Cards */}
            <div className="topics-explorer-grid">
              {TOPICS.map(t => {
                const IconComponent = t.icon;
                return (
                  <div 
                    key={t.id} 
                    className={`topic-selection-card ${topic === t.id ? 'active' : ''}`}
                    onClick={() => setTopic(t.id)}
                  >
                    <div className="topic-card-icon-wrap">
                      <IconComponent size={18} />
                    </div>
                    <div className="topic-card-meta">
                      <h4 className="topic-card-title">{t.name}</h4>
                      <p className="topic-card-desc">{t.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Difficulty config cards */}
            <div className="difficulty-section-panel" style={{ marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <h4 className="panel-section-title" style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem 0', color: 'var(--text-primary)' }}>Difficulty Rating</h4>
              <div className="difficulty-select-cards-row">
                {[
                  { id: 'Easy', color: 'hsl(142, 70%, 45%)', desc: 'Syntax verification, simple arrays & counting loops' },
                  { id: 'Medium', color: 'hsl(38, 92%, 50%)', desc: 'Nested loops, complex maps, sorting, two-pointer bounds' },
                  { id: 'Hard', color: 'hsl(0, 84%, 60%)', desc: 'Backtracking, DFS/BFS traversals, advanced greedy/DP' }
                ].map(d => (
                  <div 
                    key={d.id}
                    className={`difficulty-pill-card ${difficulty === d.id ? 'active' : ''}`}
                    onClick={() => setDifficulty(d.id)}
                    style={{ '--diff-brand-color': d.color }}
                  >
                    <div className="diff-card-header">
                      <span className="dot" style={{ background: d.color }}></span>
                      <span className="lbl">{d.id}</span>
                    </div>
                    <p className="desc">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
              <button 
                onClick={fetchChallenge} 
                className="btn btn-primary generate-challenge-btn" 
                style={{ width: 'auto', padding: '0 2.5rem', height: '44px' }} 
                disabled={loading}
              >
                {loading ? 'Compiling problem...' : 'Initiate Challenge'}
              </button>
            </div>
          </div>
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

            <button onClick={() => setChallenge(null)} className="btn btn-secondary" style={{ marginTop: '2rem' }}>
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
                      <XCircle size={24} style={{ color: 'var(--accent-error)' }} />
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Syntax Tests Failed</h3>
                    </>
                  )}
                </div>

                <div className="eval-complexity-stats" style={{ display: 'flex', gap: '2rem', marginTop: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <div className="stat">
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Correctness Score</span>
                    <strong style={{ fontSize: '1.25rem', color: evaluation.isCorrect ? 'var(--accent-success)' : 'var(--accent-error)' }}>
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
