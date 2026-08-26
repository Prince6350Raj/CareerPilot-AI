import React, { useState, useEffect, useContext } from 'react';
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
      <div className="analytics-metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="analytic-card glass-card">
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Accounts</span>
            <Users className="metric-icon blue-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{counts.users}</h3>
        </div>

        <div className="analytic-card glass-card">
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active Users (7d)</span>
            <Activity className="metric-icon green-theme" style={{ color: 'var(--accent-success)' }} size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{counts.activeUsers}</h3>
        </div>

        <div className="analytic-card glass-card">
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Certificates Issued</span>
            <Award className="metric-icon gold-theme" style={{ color: 'var(--accent-warning)' }} size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{counts.certificatesIssued}</h3>
        </div>

        <div className="analytic-card glass-card">
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg ATS Score</span>
            <Compass className="metric-icon gold-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{avgATS}%</h3>
        </div>

        <div className="analytic-card glass-card">
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Interview Score</span>
            <TrendingUp className="metric-icon purple-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{avgInterview * 10}%</h3>
        </div>

        <div className="analytic-card glass-card" style={{ gridColumn: 'span 2' }}>
          <div className="meta-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Most Selected Role</span>
            <Sparkles className="metric-icon cyan-theme" size={20} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{popularCareer}</h3>
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
    </div>
  );
};

export default Admin;
