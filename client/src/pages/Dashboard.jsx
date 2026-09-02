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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clickedResources, setClickedResources] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      const userSuffix = `_${user._id || user.email || user.name}`;
      try {
        const stored = localStorage.getItem(`clickedResources${userSuffix}`);
        if (stored) {
          setClickedResources(JSON.parse(stored));
        } else {
          setClickedResources([]);
        }
      } catch (e) {
        console.error('Error loading clicked resources:', e);
        setClickedResources([]);
      }
    }
  }, [user]);

  // Voice welcome greeting when user signs in (lands on dashboard)
  useEffect(() => {
    if (!loading && user && user.name) {
      const isGreetingEnabled = localStorage.getItem('ai-welcome-speech') !== 'false';
      if (!isGreetingEnabled) return;

      const welcomeKey = `has_welcomed_${user._id || user.email || user.name}`;
      const hasWelcomed = sessionStorage.getItem(welcomeKey);
      
      if (!hasWelcomed) {
        // Detect if user is new based on recent creation timestamp or zero dashboard history
        const isNewUser = (user.createdAt && (new Date() - new Date(user.createdAt)) < 180000) || 
                          (resumes.length === 0 && interviews.length === 0);
        
        const intro = isNewUser ? `Welcome, ${user.name}!` : `Welcome back, ${user.name}!`;
        const greetingText = `${intro} I am your CareerPilot AI assistant. I am ready to help you analyze resumes, practice mock interviews, and build your career roadmap today! Let's get started.`;
        
        const triggerSpeech = () => {
          try {
            if ('speechSynthesis' in window) {
              if (localStorage.getItem('ai-welcome-speech') === 'false') return;

              window.speechSynthesis.cancel();
              const utterance = new SpeechSynthesisUtterance(greetingText);
              const storedSpeed = localStorage.getItem('voice-speed');
              utterance.rate = storedSpeed ? parseFloat(storedSpeed) : 1.0;
              
              const voices = window.speechSynthesis.getVoices();
              const preferredVoice = voices.find(v => 
                v.lang.startsWith('en') && 
                (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft'))
              ) || voices.find(v => v.lang.startsWith('en'));
              
              if (preferredVoice) {
                utterance.voice = preferredVoice;
              }
              window.speechSynthesis.speak(utterance);
              sessionStorage.setItem(welcomeKey, 'true');
              
              document.removeEventListener('click', triggerSpeech);
            }
          } catch (speechErr) {
            console.error('Welcome voice synthesis failed:', speechErr);
          }
        };

        const playTimeout = setTimeout(() => {
          if (!sessionStorage.getItem(welcomeKey)) {
            triggerSpeech();
          }
        }, 1200);

        document.addEventListener('click', triggerSpeech);

        return () => {
          clearTimeout(playTimeout);
          document.removeEventListener('click', triggerSpeech);
        };
      }
    }
  }, [user, loading]);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

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
    : 0;

  const fsPercentage = portfolioScore > 0 ? Math.round(portfolioScore * 0.48) : 0;
  const libPercentage = portfolioScore > 0 ? Math.round(portfolioScore * 0.3) : 0;
  const uiPercentage = portfolioScore > 0 ? Math.round(portfolioScore * 0.22) : 0;
  const missingPercentage = 100 - (fsPercentage + libPercentage + uiPercentage);

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
  const currentGlobalTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const isWhiteBlueTheme = currentGlobalTheme === 'whiteblue';

  const chartDataPoints = [...resumes].reverse().slice(-7); // Last 7 scans
  const chartLabels = chartDataPoints.map((r, i) => `Scan ${i + 1}`);
  const chartScores = chartDataPoints.map(r => r.atsScore);

  const lineChartData = {
    labels: chartLabels.length > 0 ? chartLabels : ['Scan 1'],
    datasets: [
      {
        label: 'ATS Optimization Trend',
        data: chartScores.length > 0 ? chartScores : [0],
        borderColor: isWhiteBlueTheme ? '#2563eb' : '#06b6d4',
        backgroundColor: isWhiteBlueTheme ? 'rgba(37, 99, 235, 0.08)' : 'rgba(6, 182, 212, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: isWhiteBlueTheme ? '#2563eb' : '#a855f7',
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
        grid: { color: isWhiteBlueTheme ? '#f3f4f6' : 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: isWhiteBlueTheme ? '#6b7280' : '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: isWhiteBlueTheme ? '#6b7280' : '#94a3b8' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isWhiteBlueTheme ? '#000000' : '#0f172a',
        titleFont: { family: 'Outfit' },
        bodyFont: { family: 'Plus Jakarta Sans' },
        borderWidth: 1,
        borderColor: isWhiteBlueTheme ? '#e5e7eb' : 'rgba(255, 255, 255, 0.1)'
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
          <div className="dashboard-date-time-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem', fontWeight: 600 }}>
            <span>🕒 {formatDate(currentTime)}</span>
            <span style={{ color: 'var(--border-color)', opacity: 0.5 }}>|</span>
            <span style={{ color: 'var(--primary)', fontFamily: 'monospace', letterSpacing: '0.05em' }}>{formatTime(currentTime)}</span>
          </div>
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
          <div className="score-circle-outer" style={{
            background: 'conic-gradient(#f97316 0deg, #eab308 90deg, #22c55e 180deg, #3b82f6 270deg, #8b5cf6 360deg)',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.25)'
          }}>
            <div className="score-circle-inner" style={{
              background: 'var(--bg-card, #0b1528)'
            }}>
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
              <div className="pillar-bar" style={{ background: 'rgba(15, 23, 42, 0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div className="pillar-bar-fill" style={{ width: `${latestATS}%`, height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', borderRadius: '3px', transition: 'width 0.8s ease-out' }}></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-info">
                <span>Last Interview Score</span>
                <span>{latestInterviewScore}/100</span>
              </div>
              <div className="pillar-bar" style={{ background: 'rgba(15, 23, 42, 0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div className="pillar-bar-fill" style={{ width: `${latestInterviewScore}%`, height: '100%', background: 'linear-gradient(90deg, #8b5cf6, #d946ef)', borderRadius: '3px', transition: 'width 0.8s ease-out' }}></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-info">
                <span>Roadmap Learning</span>
                <span>{learningScore}/100</span>
              </div>
              <div className="pillar-bar" style={{ background: 'rgba(15, 23, 42, 0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div className="pillar-bar-fill" style={{ width: `${learningScore}%`, height: '100%', background: 'linear-gradient(90deg, #f97316, #eab308)', borderRadius: '3px', transition: 'width 0.8s ease-out' }}></div>
              </div>
            </div>

            <div className="pillar-item">
              <div className="pillar-info">
                <span>Portfolio & Projects</span>
                <span>{portfolioScore}/100</span>
              </div>
              <div className="pillar-bar" style={{ background: 'rgba(15, 23, 42, 0.06)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div className="pillar-bar-fill" style={{ width: `${portfolioScore}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #10b981)', borderRadius: '3px', transition: 'width 0.8s ease-out' }}></div>
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
        {/* Metric Cards Row (4 Columns Grid) */}
        <div className="metric-card-box glass-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', minHeight: '110px', padding: '1.25rem' }}>
          {/* Radial progress ring */}
          <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray={`${overallCareerScore || 0}, 100`} />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>{overallCareerScore || 0}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block', letterSpacing: '0.05em' }}>Career Readiness</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.15rem 0' }}>
              {overallCareerScore || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
            </h3>
            <span style={{ fontSize: '0.68rem', fontWeight: 800, color: overallCareerScore > 0 ? '#10b981' : 'var(--text-muted)' }}>
              {overallCareerScore > 0 ? '+2.4% this week' : 'No activity this week'}
            </span>
          </div>
        </div>

        <div className="metric-card-box glass-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', minHeight: '110px', padding: '1.25rem' }}>
          {/* Radial progress ring */}
          <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray={`${latestATS || 0}, 100`} />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>{latestATS || 0}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block', letterSpacing: '0.05em' }}>ATS Resume Score</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.15rem 0' }}>
              {latestATS || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {resumes.length > 0 ? 'Target: 80+ optimal' : 'No resume uploaded'}
            </span>
          </div>
        </div>

        <div className="metric-card-box glass-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1.25rem', minHeight: '110px', padding: '1.25rem' }}>
          {/* Radial progress ring */}
          <div style={{ position: 'relative', width: '56px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="56" height="56" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="#f97316" strokeWidth="3" strokeDasharray={`${latestInterviewScore || 0}, 100`} />
            </svg>
            <span style={{ position: 'absolute', fontSize: '0.82rem', fontWeight: 900, color: 'var(--text-primary)' }}>{latestInterviewScore || 0}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block', letterSpacing: '0.05em' }}>Mock Interview</span>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.15rem 0' }}>
              {latestInterviewScore || 0} <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 100</span>
            </h3>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {completedInterviews.length > 0 ? `${completedInterviews.length} completed recently` : 'No interviews taken'}
            </span>
          </div>
        </div>

        <div className="metric-card-box glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '110px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>Learning Progress</span>
            <BookOpen size={14} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: '0.15rem 0', lineHeight: 1 }}>{learningScore || 0}%</h2>
            <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.05)', borderRadius: '2.5px', overflow: 'hidden', margin: '0.35rem 0' }}>
              <div style={{ height: '100%', width: `${learningScore || 0}%`, background: 'var(--primary)' }}></div>
            </div>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              {roadmaps.length > 0 ? `${completedGoals}/${totalGoals} goals completed` : 'No roadmaps generated'}
            </span>
          </div>
        </div>

        {/* Charts & Trends */}
        <div className="dashboard-chart-box glass-card col-span-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 className="section-title" style={{ margin: 0 }}>Weekly Readiness Progress (Past 8 Weeks)</h3>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', fontWeight: 700 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Your Score</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
                <span style={{ color: 'var(--text-muted)' }}>Peer Average</span>
              </div>
            </div>
          </div>
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
          <div className="learning-recommendations-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {(clickedResources.length > 0 ? clickedResources : [
              {
                title: 'Advanced React Patterns',
                provider: 'Codecademy',
                duration: 'Not started yet',
                progress: 0,
                url: 'https://roadmap.sh',
                logo: (
                  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                    <circle cx="50" cy="50" r="8" fill="#0ea5e9" />
                    <ellipse cx="50" cy="50" rx="38" ry="12" stroke="#0ea5e9" strokeWidth="4" transform="rotate(30 50 50)" />
                    <ellipse cx="50" cy="50" rx="38" ry="12" stroke="#0ea5e9" strokeWidth="4" transform="rotate(90 50 50)" />
                    <ellipse cx="50" cy="50" rx="38" ry="12" stroke="#0ea5e9" strokeWidth="4" transform="rotate(150 50 50)" />
                  </svg>
                )
              },
              {
                title: 'Data Structures in Python',
                provider: 'Coursera',
                duration: 'Not started yet',
                progress: 0,
                url: 'https://leetcode.com',
                logo: (
                  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                    <path d="M48 10C30 10 25 18 25 28v10h25v5H20c-10 0-15 8-15 25v15c0 15 8 20 28 20h12v-12c0-8 6-15 15-15h20V48c0-18-8-23-28-23h-4V10z" fill="#f97316" />
                    <path d="M52 90c18 0 23-8 23-18V62H50v-5h30c10 0 15-8 15-25V17c0-15-8-20-28-20H55v12c0 8-6 15-15 15H20v23c0 18 8 23 28 23h4v12z" fill="#3b82f6" />
                  </svg>
                )
              },
              {
                title: 'System Design Fundamentals',
                provider: 'Udemy',
                duration: 'Not started yet',
                progress: 0,
                url: 'https://freecodecamp.org',
                logo: (
                  <svg width="20" height="20" viewBox="0 0 100 100" fill="none">
                    <rect x="35" y="10" width="30" height="20" rx="4" fill="none" stroke="#10b981" strokeWidth="6" />
                    <rect x="10" y="65" width="28" height="20" rx="4" fill="none" stroke="#10b981" strokeWidth="6" />
                    <rect x="62" y="65" width="28" height="20" rx="4" fill="none" stroke="#10b981" strokeWidth="6" />
                    <path d="M50 30v20M50 50H24v15M50 50h26v15" stroke="#10b981" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                )
              }
            ]).map((course, idx) => (
              <a 
                key={idx} 
                href={course.url}
                target="_blank"
                rel="noopener noreferrer"
                className="learning-item-card" 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  padding: '0.75rem', 
                  background: 'var(--bg-item)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '6px',
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer'
                }}
              >
                {/* Custom Logo Wrap */}
                <div style={{ 
                  width: '42px', 
                  height: '42px', 
                  borderRadius: '6px', 
                  background: 'rgba(0,0,0,0.3)', 
                  border: '1px solid rgba(255,255,255,0.03)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0 
                }}>
                  {course.logo || (course.type === 'youtube' ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="23 7 16 12 23 17 23 7" />
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  ))}
                </div>
                
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block' }}>{course.title}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'block' }}>{course.provider} {course.duration ? `• ${course.duration}` : ''}</span>
                  
                  {/* Progress bar */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${course.progress !== undefined ? course.progress : 100}%`, background: 'var(--primary)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', width: '24px', textAlign: 'right' }}>{course.progress !== undefined ? course.progress : 100}%</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Project Readiness Breakdown */}
        <div className="dashboard-readiness-breakdown-box glass-card col-span-4" style={{ padding: '1.5rem', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Project Readiness Breakdown</h3>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)' }}>{portfolioScore}% Total Readiness</span>
          </div>

          {/* Segmented progress bar */}
          <div style={{ display: 'flex', width: '100%', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{ width: `${fsPercentage}%`, background: '#2563eb' }} title={`Full-stack apps: ${fsPercentage}%`}></div>
            <div style={{ width: `${libPercentage}%`, background: '#10b981' }} title={`Libraries/Packages: ${libPercentage}%`}></div>
            <div style={{ width: `${uiPercentage}%`, background: '#f97316' }} title={`UI/Design system: ${uiPercentage}%`}></div>
            <div style={{ width: `${missingPercentage}%`, background: 'rgba(255,255,255,0.06)' }} title={`Missing category coverage: ${missingPercentage}%`}></div>
          </div>

          {/* Bullets grid */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.75rem', fontWeight: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Full-stack apps ({fsPercentage}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>Libraries/Packages ({libPercentage}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }}></span>
              <span style={{ color: 'var(--text-secondary)' }}>UI/Design system ({uiPercentage}%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }}></span>
              <span style={{ color: 'var(--text-muted)' }}>Missing category coverage ({missingPercentage}%)</span>
            </div>
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
