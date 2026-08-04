import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Flame, Award, ClipboardCheck, ArrowRight, FileText, Map, MessageSquare, Compass, CheckCircle, BookOpen, Code } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './Dashboard.css';

// Register ChartJS elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [progress, setProgress] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch progress dashboard
        const progRes = await fetch(`${API_URL}/progress/dashboard`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const progData = await progRes.json();
        if (progData.success) {
          setProgress(progData.data);
        }

        // Fetch resume history to see ATS scores
        const resRes = await fetch(`${API_URL}/resume/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resData = await resRes.json();
        if (resData.success) {
          setResumes(resData.data);
        }

        // Fetch interview history to calculate average score
        const intRes = await fetch(`${API_URL}/interview/history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const intData = await intRes.json();
        if (intData.success) {
          setInterviews(intData.data);
        }

        // Fetch roadmaps to compute learning score
        const roadRes = await fetch(`${API_URL}/career/roadmaps`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const roadData = await roadRes.json();
        if (roadData.success) {
          setRoadmaps(roadData.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, API_URL]);

  const handleToggleGoal = async (goalId) => {
    try {
      const res = await fetch(`${API_URL}/progress/goals/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ goalId })
      });
      const data = await res.json();
      if (data.success) {
        setProgress(data.data);
      }
    } catch (err) {
      console.error('Error toggling goal:', err);
    }
  };

  const getGreeting = () => {
    return 'Hello';
  };

  if (loading) {
    return (
      <div className="dashboard-loader">
        <div className="spinner-loader"></div>
      </div>
    );
  }

  // Calculate stats
  const latestATS = resumes.length > 0 ? resumes[0].atsScore : 0;
  
  const completedInterviews = interviews.filter(i => i.overallScore !== undefined);
  const avgInterviewScore = completedInterviews.length > 0
    ? Math.round((completedInterviews.reduce((sum, i) => sum + i.overallScore, 0) / completedInterviews.length) * 10)
    : 0;

  const completedGoals = progress?.dailyGoals?.filter(g => g.completed).length || 0;
  const totalGoals = progress?.dailyGoals?.length || 0;
  const activeStreak = progress?.dailyStreak || user?.streak?.count || 1;

  // New Score Metrics
  const learningScore = roadmaps.length > 0 ? Math.min(100, 70 + (completedGoals * 10)) : 0;
  const portfolioScore = localStorage.getItem('latestPortfolioScore')
    ? parseInt(localStorage.getItem('latestPortfolioScore'), 10)
    : (user?.profile?.title ? 75 : 0);

  const overallCareerScore = Math.round((latestATS + avgInterviewScore + learningScore + portfolioScore) / 4);

  const latestInterview = completedInterviews.length > 0 ? completedInterviews[0] : null;
  const latestInterviewScore = latestInterview ? Math.round(latestInterview.overallScore * 10) : 0;

  const getCareerRecommendations = () => {
    const recs = [];
    if (latestATS === 0) {
      recs.push({ text: 'Upload your PDF Resume in the Resume Hub to start tracking your ATS Score.', urgency: 'high' });
    } else if (latestATS < 78) {
      recs.push({ text: `Resume ATS Score is ${latestATS}%. Add core technical skills and action verbs to cross the 80% threshold.`, urgency: 'medium' });
    }

    if (avgInterviewScore === 0) {
      recs.push({ text: 'Start your first Mock Interview session to test your concepts.', urgency: 'high' });
    } else if (avgInterviewScore < 75) {
      recs.push({ text: `Interview average is ${avgInterviewScore}%. Try doing multiple-choice (MCQ) sets to review syntax rules.`, urgency: 'medium' });
    }

    if (learningScore === 0) {
      recs.push({ text: 'Generate a personalized roadmap to track your step-by-step career path.', urgency: 'medium' });
    } else if (completedGoals < totalGoals) {
      recs.push({ text: "Complete today's daily checklist goals to increment your learning score.", urgency: 'low' });
    }

    if (portfolioScore === 0) {
      recs.push({ text: 'Audit your portfolio URL in the Reviewer section to discover SEO and link gaps.', urgency: 'medium' });
    }

    if (recs.length === 0) {
      recs.push({ text: 'All stats are looking excellent! Stay consistent and practice advanced DSA queries.', urgency: 'success' });
    }

    return recs.slice(0, 3);
  };

  // Chart configuration
  const chartDataPoints = [...resumes].reverse().slice(-7); // Last 7 scans
  const chartLabels = chartDataPoints.map((r, i) => `Scan ${i + 1}`);
  const chartScores = chartDataPoints.map(r => r.atsScore);

  const lineChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Scan 1'],
    datasets: [
      {
        label: 'ATS Optimization Trend',
        data: chartScores.length > 0 ? chartScores : [0],
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#a855f7',
        pointBorderColor: '#fff',
        pointHoverRadius: 8
      }
    ]
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)'
      }
    }
  };

  return (
    <div className="dashboard-view-container">
      <div className="dashboard-heading-row">
        <div>
          <h1 className="page-title">
            {getGreeting()}, <span className="dynamic-pop-name">{user?.name || 'Explorer'}</span>!
          </h1>
          <p className="page-subtitle">Track your career guidance progress and optimization scores.</p>
        </div>
        <div className="header-widgets-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="streak-badge glass-card">
            <Flame className="streak-icon animate-pulse" size={24} />
            <div>
              <span className="streak-num">{activeStreak} Days</span>
              <span className="streak-label">Current Streak</span>
            </div>
          </div>

          {/* Orbit Widget on the right */}
          <div className="portal-orbit-widget">
            <div className="orbit-path-circle">
              <div className="orbiting-item orange-square-node"></div>
              <div className="orbiting-item book-orbit-badge">
                <BookOpen size={14} className="orbit-book-icon" />
              </div>
              <div className="orbiting-item orange-dot-1"></div>
              <div className="orbiting-item orange-dot-2"></div>
            </div>
            
            <div className="inner-glass-core">
              <Award className="core-award-icon" size={24} style={{ color: 'var(--secondary)' }} />
              <div className="core-core-text">
                <span>Learn.</span>
                <span>Grow.</span>
                <span>Succeed.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overall Career Score Card */}
      <div className="career-score-hero-card glass-card">
        <div className="score-circle-section">
          <div className="score-circle-outer">
            <div className="score-circle-inner">
              <span className="score-number">{overallCareerScore}</span>
              <span className="score-label">Career Score</span>
            </div>
          </div>
          <p className="score-eval-text">
            {overallCareerScore >= 80 ? 'Placement Ready!' : overallCareerScore >= 50 ? 'Growing Foundations' : 'Action Required'}
          </p>
        </div>

        <div className="score-breakdown-section">
          <h3 className="score-section-title">Career Pillars Audit</h3>
          <div className="pillars-grid">
            <div className="pillar-item">
              <div className="pillar-info">
                <span>Resume ATS Check</span>
                <span>{latestATS}/100</span>
              </div>
              <div className="pillar-bar">
                <div className="pillar-bar-fill cyan-theme" style={{ width: `${latestATS}%` }}></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-info">
                <span>Last Interview Score</span>
                <span>{latestInterviewScore}/100</span>
              </div>
              <div className="pillar-bar">
                <div className="pillar-bar-fill purple-theme" style={{ width: `${latestInterviewScore}%` }}></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-info">
                <span>Roadmap Learning</span>
                <span>{learningScore}/100</span>
              </div>
              <div className="pillar-bar">
                <div className="pillar-bar-fill gold-theme" style={{ width: `${learningScore}%` }}></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-info">
                <span>Portfolio & Projects</span>
                <span>{portfolioScore}/100</span>
              </div>
              <div className="pillar-bar">
                <div className="pillar-bar-fill green-theme" style={{ width: `${portfolioScore}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="score-consultant-section">
          <h3 className="score-section-title">AI Career Consultant Suggestions</h3>
          <ul className="consultant-suggestions-list">
            {getCareerRecommendations().map((rec, idx) => (
              <li key={idx} className={`suggestion-item urgency-${rec.urgency}`}>
                <span className="suggestion-bullet">•</span>
                <span className="suggestion-text">{rec.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Metric Cards Row (4 Columns Grid) */}
        <div className="metric-card-box glass-card">
          <div className="card-top">
            <span className="card-lbl">Current ATS Score</span>
            <FileText className="card-icon cyan-theme" />
          </div>
          <h2 className="card-value">{latestATS}%</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill cyan-theme" style={{ width: `${latestATS}%` }}></div>
          </div>
          <p className="card-desc">Based on latest scanned resume</p>
        </div>

        <div className="metric-card-box glass-card">
          <div className="card-top">
            <span className="card-lbl">Last Interview Score</span>
            <MessageSquare className="card-icon purple-theme" />
          </div>
          <h2 className="card-value">{latestInterviewScore > 0 ? `${latestInterviewScore}%` : 'No practice'}</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill purple-theme" style={{ width: `${latestInterviewScore}%` }}></div>
          </div>
          <p className="card-desc">Score of your latest mock session</p>
        </div>

        <div className="metric-card-box glass-card">
          <div className="card-top">
            <span className="card-lbl">Learning Progress</span>
            <Compass className="card-icon gold-theme" />
          </div>
          <h2 className="card-value">{learningScore}%</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill gold-theme" style={{ width: `${learningScore}%` }}></div>
          </div>
          <p className="card-desc">Tracked from customized roadmap</p>
        </div>

        <div className="metric-card-box glass-card">
          <div className="card-top">
            <span className="card-lbl">Project Readiness</span>
            <Award className="card-icon green-theme" />
          </div>
          <h2 className="card-value">{portfolioScore}%</h2>
          <div className="progress-bar-container">
            <div className="progress-bar-fill green-theme" style={{ width: `${portfolioScore}%` }}></div>
          </div>
          <p className="card-desc">Audited from portfolio projects</p>
        </div>

        {/* Charts & Trends */}
        <div className="dashboard-chart-box glass-card col-span-2">
          <h3 className="section-title">ATS Performance Trend</h3>
          <div className="chart-wrapper">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Daily Goals Checklist */}
        <div className="dashboard-goals-box glass-card">
          <h3 className="section-title">Today's Goal Checklist</h3>
          <div className="goals-list">
            {progress?.dailyGoals && progress.dailyGoals.map(goal => (
              <div 
                key={goal._id} 
                className={`goal-item ${goal.completed ? 'completed' : ''}`}
                onClick={() => handleToggleGoal(goal._id)}
              >
                <div className="goal-checkbox">
                  {goal.completed && <CheckCircle size={16} className="checked-tick" />}
                </div>
                <span className="goal-text">{goal.goalText}</span>
              </div>
            ))}
            {(!progress?.dailyGoals || progress.dailyGoals.length === 0) && (
              <p className="empty-text">No daily missions available right now.</p>
            )}
          </div>
        </div>

        {/* Recommended Learning */}
        <div className="dashboard-learning-box glass-card">
          <h3 className="section-title">Recommended Learning</h3>
          <div className="learning-recommendations-list">
            {roadmaps.length > 0 && roadmaps[0].phases?.length > 0 ? (
              roadmaps[0].phases[0].resources?.slice(0, 3).map((res, i) => (
                <a 
                  key={i} 
                  href={res.url || 'https://roadmap.sh'} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="learning-item-card"
                >
                  <div className="learning-item-icon-wrap">
                    <BookOpen size={16} />
                  </div>
                  <div className="learning-item-info">
                    <span className="learning-item-title">{res.title}</span>
                    <span className="learning-item-type">{res.type || 'Resource'} • Phase 1</span>
                  </div>
                </a>
              ))
            ) : (
              <>
                <a href="https://roadmap.sh" target="_blank" rel="noopener noreferrer" className="learning-item-card">
                  <div className="learning-item-icon-wrap">
                    <Compass size={16} style={{ color: 'var(--secondary)' }} />
                  </div>
                  <div className="learning-item-info">
                    <span className="learning-item-title">System Design Roadmap</span>
                    <span className="learning-item-type">Guide • Architecture</span>
                  </div>
                </a>
                <a href="https://leetcode.com" target="_blank" rel="noopener noreferrer" className="learning-item-card">
                  <div className="learning-item-icon-wrap">
                    <Code size={16} style={{ color: '#8b5cf6' }} />
                  </div>
                  <div className="learning-item-info">
                    <span className="learning-item-title">Top 150 Interview Questions</span>
                    <span className="learning-item-type">Practice • DSA</span>
                  </div>
                </a>
                <a href="https://freecodecamp.org" target="_blank" rel="noopener noreferrer" className="learning-item-card">
                  <div className="learning-item-icon-wrap">
                    <BookOpen size={16} style={{ color: '#06b6d4' }} />
                  </div>
                  <div className="learning-item-info">
                    <span className="learning-item-title">Full Stack Developer Courses</span>
                    <span className="learning-item-type">Tutorials • Web Dev</span>
                  </div>
                </a>
              </>
            )}
          </div>
        </div>

        {/* Navigation Quick Actions */}
        <div className="quick-actions-box glass-card col-span-4">
          <h3 className="section-title">Initiate Career Modules</h3>
          <div className="actions-grid">
            <Link to="/resume-analyzer" className="action-button-card">
              <div className="action-icon-wrap cyan-theme">
                <FileText size={24} />
              </div>
              <div className="action-details">
                <h4>Resume Hub</h4>
                <p>Upload a new PDF to detect syntax issues, compile cover letters, and track version scores.</p>
              </div>
            </Link>

            <Link to="/roadmap" className="action-button-card">
              <div className="action-icon-wrap purple-theme">
                <Map size={24} />
              </div>
              <div className="action-details">
                <h4>Roadmap Generator</h4>
                <p>Generate week-by-week courses, articles, and download roadmap outlines.</p>
              </div>
            </Link>

            <Link to="/mock-interview" className="action-button-card">
              <div className="action-icon-wrap gold-theme">
                <MessageSquare size={24} />
              </div>
              <div className="action-details">
                <h4>Interview Terminal</h4>
                <p>Run simulated AI descriptive or MCQ mock sessions and take coding challenges.</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
