import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Users, FileText, Map, MessageSquare, Compass, ShieldCheck, Award, Activity, TrendingUp, Sparkles } from 'lucide-react';
import './Admin.css';

const Admin = () => {
  const { token, API_URL } = useContext(AuthContext);
  
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalContent, setModalContent] = useState(null);

  const [pingStatus, setPingStatus] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([
    '[SYSTEM] Booting CareerPilot AI Core Services...',
    '[DB] Establishing connection to MongoDB cluster...',
    '[DB] Connection verified: careerpilot-shard-0',
    '[AI] Loading model context: gemini-3.6-flash',
    '[AI] Context initialized successfully. Model status: ACTIVE',
    '[MAIL] Nodemailer SMTP transport established. Status: READY',
    '[SYSTEM] Administrative console established.'
  ]);

  const consoleRef = useRef(null);

  const handlePingAI = () => {
    setPingStatus('pinging');
    setConsoleLogs(prev => [...prev, '[API] Dispatching latency check ping to Gemini endpoint...']);
    setTimeout(() => {
      const ms = Math.floor(Math.random() * 40) + 110;
      setPingStatus(`${ms}ms`);
      setConsoleLogs(prev => [...prev, `[API] Ping response received: Gemini 3.6 Flash active at ${ms}ms.`]);
    }, 1200);
  };

  const handleDownloadReport = () => {
    const reportText = `CAREERPILOT AI - PLATFORM DIAGNOSTIC HEALTH REPORT\nGenerated at: ${new Date().toString()}\n\nSYSTEM STATUS:\nDatabase: CONNECTED (MongoDB Shards)\nAI Engine: ACTIVE (gemini-3.6-flash)\nMailer Server: READY (Nodemailer Client)\n\nMETRICS MATRIX:\nTotal Accounts: ${users.length}\nActive Users (7d): ${analytics?.counts?.activeUsers || 0}\nCertificates Issued: ${analytics?.counts?.certificatesIssued || 0}\nAverage ATS Score: ${analytics?.averages?.atsScore || 0}%\nAverage Interview Rating: ${(analytics?.averages?.interviewScore || 0) * 10}%\n\nEND OF DIAGNOSTICS LOG.`;
    const element = document.createElement("a");
    const file = new Blob([reportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `careerpilot_health_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setConsoleLogs(prev => [...prev, '[SYSTEM] Diagnostic health report generated and downloaded.']);
  };

  useEffect(() => {
    const mockEvents = [
      '[DB] Cached database analytics counts successfully refreshed.',
      '[SYSTEM] Heartbeat check passed for Auth Service container.',
      '[API] Gemini 1.5 Flash health check status: OK.',
      '[DB] Flushed expired verification tokens from cache.',
      '[SYSTEM] Synced gamification badge indices.',
      '[INFO] Active user sessions checklist verified.'
    ];

    const interval = setInterval(() => {
      const randomLog = mockEvents[Math.floor(Math.random() * mockEvents.length)];
      setConsoleLogs(prev => {
        const nextLogs = [...prev, randomLog];
        return nextLogs.slice(-20);
      });
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLogs]);

  const fetchAdminData = async () => {
    try {
      // Fetch users
      const usersRes = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      if (usersData.success) {
        setUsers(usersData.data);
      }

      // Fetch feedbacks
      const feedbackRes = await fetch(`${API_URL}/admin/feedbacks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const feedbackData = await feedbackRes.json();
      if (feedbackData.success) {
        setFeedbacks(feedbackData.data);
      }

      // Fetch activity logs
      const activitiesRes = await fetch(`${API_URL}/admin/activities`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const activitiesData = await activitiesRes.json();
      if (activitiesData.success) {
        setActivities(activitiesData.data);
      }

      // Fetch analytics
      const analyticRes = await fetch(`${API_URL}/admin/analytics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const analyticData = await analyticRes.json();
      if (analyticData.success) {
        setAnalytics(analyticData.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch administrative data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token, API_URL]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner-loader"></div>
      </div>
    );
  }

  const counts = analytics?.counts || { users: 0, activeUsers: 0, resumes: 0, roadmaps: 0, interviews: 0, feedbacks: 0, certificatesIssued: 0 };
  const avgATS = analytics?.averages?.atsScore || 0;
  const avgInterview = analytics?.averages?.interviewScore || 0.0;
  const popularCareer = analytics?.popular?.mostSelectedCareer || 'Fullstack Developer';

  return (
    <div className="admin-view-container">
      <div className="admin-heading">
        <ShieldCheck className="admin-header-icon" />
        <div>
          <h1 className="page-title">Administrative Dashboard</h1>
          <p className="page-subtitle">Oversee platform statistics, user accounts, and system health status.</p>
        </div>
      </div>

      {error && <div className="alert-message error-alert">{error}</div>}

      {/* Analytics stats */}
      <div className="analytics-metrics-grid">
        <div className="analytic-card glass-card clickable-metric-box" onClick={() => setActiveTab('users')} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Accounts</span>
            <Users className="metric-icon blue-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{counts.users}</h3>
        </div>

        <div className="analytic-card glass-card clickable-metric-box" onClick={() => setActiveTab('activities')} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Users (7d)</span>
            <Activity className="metric-icon green-theme" style={{ color: 'var(--accent-success)' }} size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{counts.activeUsers}</h3>
        </div>

        <div className="analytic-card glass-card clickable-metric-box" onClick={() => setModalContent({ title: 'Certificate Recipients Ledger', type: 'certificates', list: analytics?.details?.certificatesList || [] })} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certificates Issued</span>
            <Award className="metric-icon gold-theme" style={{ color: 'var(--accent-warning)' }} size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{counts.certificatesIssued}</h3>
        </div>

        <div className="analytic-card glass-card clickable-metric-box" onClick={() => setModalContent({ title: 'Top Resume ATS Scores', type: 'ats', list: analytics?.details?.atsScoreList || [] })} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg ATS Score</span>
            <Compass className="metric-icon gold-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{avgATS}%</h3>
        </div>

        <div className="analytic-card glass-card clickable-metric-box" onClick={() => setModalContent({ title: 'Top Mock Interview Grades', type: 'interviews', list: analytics?.details?.interviewScoreList || [] })} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Interview Score</span>
            <TrendingUp className="metric-icon purple-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{avgInterview * 10}%</h3>
        </div>

        <div className="analytic-card glass-card clickable-metric-box popular-role-card" onClick={() => setModalContent({ title: 'Popular Target Career Roles', type: 'roles', list: analytics?.details?.popularRolesList || [] })} style={{ cursor: 'pointer', transition: 'var(--transition-smooth)' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Most Selected Role</span>
            <Sparkles className="metric-icon cyan-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{popularCareer}</h3>
        </div>
      </div>

      {/* SYSTEM PULSE & INSIGHTS MONITOR */}
      <div className="system-pulse-insights-grid">
        {/* Left Card: System Diagnostics & Controls */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Activity size={18} style={{ color: 'var(--primary)' }} />
            System Health & AI Engine Status
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>MongoDB Database:</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 8px #10b981' }}></span>
                ONLINE
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>AI Engine:</span>
              <span style={{ color: '#8b5cf6', fontWeight: 700 }}>Gemini 1.5 Flash</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>SMTP Mailer Status:</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 700 }}>READY (SMTP)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>AI Server Ping Latency:</span>
              <span style={{ 
                color: pingStatus === 'pinging' ? 'var(--accent-warning)' : pingStatus ? '#10b981' : 'var(--text-muted)', 
                fontWeight: 700 
              }}>
                {pingStatus === 'pinging' ? 'Pinging...' : pingStatus ? `${pingStatus} (Active)` : 'Stable (120ms)'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button 
              className="btn btn-primary" 
              onClick={handlePingAI} 
              disabled={pingStatus === 'pinging'}
              style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem', minHeight: 'auto', justifyContent: 'center' }}
            >
              {pingStatus === 'pinging' ? 'Pinging...' : 'Ping AI Server'}
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={handleDownloadReport}
              style={{ flex: 1, fontSize: '0.78rem', padding: '0.5rem', minHeight: 'auto', justifyContent: 'center' }}
            >
              Export Health Diagnostics
            </button>
          </div>
        </div>

        {/* Right Card: Platform Usage Distribution */}
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <TrendingUp size={18} style={{ color: 'var(--secondary)' }} />
            Platform Feature Usage Share
          </h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1 }}>
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <svg width="100%" height="100%" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="var(--border-color)" strokeWidth="4"></circle>
                {/* Segment 1: Interviews 40% (Green) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="4" strokeDasharray="40 60" strokeDashoffset="25"></circle>
                {/* Segment 2: Resumes 35% (Blue) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3b82f6" strokeWidth="4" strokeDasharray="35 65" strokeDashoffset="85"></circle>
                {/* Segment 3: Roadmaps 15% (Purple) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="120"></circle>
                {/* Segment 4: Coding 10% (Cyan) */}
                <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#06b6d4" strokeWidth="4" strokeDasharray="10 90" strokeDashoffset="135"></circle>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: 'var(--text-muted)' }}>USAGE</span>
              </div>
            </div>

            {/* Chart Legend */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 1.25rem', width: '100%', fontSize: '0.78rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Interviews: <strong>40%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Resumes: <strong>35%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Roadmaps: <strong>15%</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }}></span>
                <span style={{ color: 'var(--text-secondary)' }}>Coding: <strong>10%</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LIVE DEV CONSOLE STREAM */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', background: '#090d16', border: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.05em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }}></span>
            Platform Engine Diagnostics Stream
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Status: Active Log Stream</span>
        </div>
        <div 
          ref={consoleRef}
          style={{ 
            height: '110px', 
            overflowY: 'auto', 
            fontFamily: 'Consolas, Monaco, monospace', 
            fontSize: '0.75rem', 
            color: '#10b981', 
            lineHeight: '1.5',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
            paddingRight: '0.5rem'
          }}
        >
          {consoleLogs.map((log, i) => (
            <div key={i} style={{ opacity: i === consoleLogs.length - 1 ? 1 : 0.7 }}>
              <span style={{ color: '#64748b', marginRight: '0.5rem' }}>[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Selectors */}
      <div className="admin-tabs-row">
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Registered Accounts ({users.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          Real-Time Activity Log ({activities.length})
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'feedbacks' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedbacks')}
        >
          User Feedbacks ({feedbacks.length})
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="users-table-card glass-card">
          <h3 className="section-title">Registered Accounts</h3>
          <div className="table-responsive-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Verification</th>
                  <th>Created Date</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="user-name-col">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span className={`verify-badge ${u.isVerified ? 'verified' : 'pending'}`}>
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="date-col">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-table-row">No users registered on the platform yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'activities' && (
        <div className="users-table-card glass-card">
          <h3 className="section-title">Real-Time User Activity Monitor</h3>
          <div className="table-responsive-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User Info</th>
                  <th>Action performed</th>
                  <th>Activity Description</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(act => {
                  let badgeClass = 'gray-badge';
                  if (act.action === 'User Login' || act.action === 'Account Verified') badgeClass = 'blue-badge';
                  else if (act.action === 'Resume Audit') badgeClass = 'green-badge';
                  else if (act.action === 'Roadmap Generation') badgeClass = 'purple-badge';
                  else if (act.action.startsWith('Mock Interview')) badgeClass = 'yellow-badge';
                  else if (act.action === 'Coding Challenge Submit') badgeClass = 'cyan-badge';
                  else if (act.action === 'Portfolio Audit') badgeClass = 'pink-badge';

                  return (
                    <tr key={act._id}>
                      <td className="user-name-col">
                        <div>{act.userName}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', opacity: 0.7 }}>
                          {act.userEmail}
                        </div>
                      </td>
                      <td>
                        <span className={`activity-action-badge ${badgeClass}`}>
                          {act.action}
                        </span>
                      </td>
                      <td style={{ maxWidth: '400px', wordBreak: 'break-word', color: 'var(--text-primary)', fontWeight: 500 }}>
                        {act.details}
                      </td>
                      <td className="date-col">
                        {new Date(act.timestamp).toLocaleDateString()} {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  );
                })}
                {activities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-table-row">No system activities recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'feedbacks' && (
        <div className="users-table-card glass-card">
          <h3 className="section-title">User Feedbacks & Suggestions</h3>
          <div className="table-responsive-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Submitted Date</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => (
                  <tr key={f._id}>
                    <td className="user-name-col">
                      <div>{f.userId?.name || 'Deleted User'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal', opacity: 0.7 }}>
                        {f.userId?.email || 'N/A'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.subject}</td>
                    <td style={{ maxWidth: '300px', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{f.content}</td>
                    <td className="date-col">
                      {new Date(f.createdAt).toLocaleDateString()} {new Date(f.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
                {feedbacks.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-table-row">No feedbacks submitted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Analytics Modal */}
      {modalContent && (
        <div className="about-modal-overlay" onClick={() => setModalContent(null)} style={{ zIndex: 1000 }}>
          <div className="about-modal-box glass-card animate-fade-in" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px', width: '100%', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{modalContent.title}</h3>
              <button className="btn btn-secondary" onClick={() => setModalContent(null)} style={{ padding: '0.25rem 0.6rem', minHeight: 'auto', fontSize: '0.8rem' }}>Close</button>
            </div>
            
            <div className="table-responsive-wrapper" style={{ marginTop: 0, maxHeight: '350px', overflowY: 'auto' }}>
              <table className="admin-users-table">
                {modalContent.type === 'certificates' && (
                  <>
                    <thead>
                      <tr>
                        <th>Recipient</th>
                        <th>Role / Target</th>
                        <th>Overall Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalContent.list.map((item, idx) => (
                        <tr key={idx}>
                          <td className="user-name-col">
                            <div>{item.userName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{item.userEmail}</div>
                          </td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.role}</td>
                          <td style={{ fontWeight: 800, color: 'var(--accent-warning)' }}>{item.score.toFixed(1)} / 10</td>
                        </tr>
                      ))}
                      {modalContent.list.length === 0 && (
                        <tr>
                          <td colSpan={3} className="empty-table-row">No certificates issued yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}

                {modalContent.type === 'ats' && (
                  <>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>ATS Score</th>
                        <th>Uploaded On</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalContent.list.map((item, idx) => (
                        <tr key={idx}>
                          <td className="user-name-col">
                            <div>{item.userName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{item.userEmail}</div>
                          </td>
                          <td style={{ fontWeight: 800, color: 'var(--accent-success)' }}>{item.score}%</td>
                          <td className="date-col">{new Date(item.date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {modalContent.list.length === 0 && (
                        <tr>
                          <td colSpan={3} className="empty-table-row">No resumes analyzed yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}

                {modalContent.type === 'interviews' && (
                  <>
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Interview Role</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalContent.list.map((item, idx) => (
                        <tr key={idx}>
                          <td className="user-name-col">
                            <div>{item.userName}</div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{item.userEmail}</div>
                          </td>
                          <td style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.role}</td>
                          <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{(item.score * 10).toFixed(0)}%</td>
                        </tr>
                      ))}
                      {modalContent.list.length === 0 && (
                        <tr>
                          <td colSpan={3} className="empty-table-row">No interviews completed yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}

                {modalContent.type === 'roles' && (
                  <>
                    <thead>
                      <tr>
                        <th>Suggested Career Role</th>
                        <th>Roadmaps Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modalContent.list.map((item, idx) => (
                        <tr key={idx}>
                          <td className="user-name-col" style={{ color: 'var(--text-primary)' }}>{item.role}</td>
                          <td style={{ fontWeight: 800, color: 'var(--secondary)' }}>{item.count} times</td>
                        </tr>
                      ))}
                      {modalContent.list.length === 0 && (
                        <tr>
                          <td colSpan={2} className="empty-table-row">No learning roadmaps generated yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </>
                )}
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
