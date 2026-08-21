import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Save, User, Award, Tag, Mail, Camera, Link, Briefcase } from 'lucide-react';
import './Profile.css';

const AVATAR_PRESETS = [
  { name: 'Felix', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix' },
  { name: 'Aneka', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka' },
  { name: 'Garfield', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=Garfield' },
  { name: 'Jack', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jack' }
];

// Custom inline SVG icons to prevent lucide-react case-sensitive or missing export issues
const GithubIcon = ({ size = 18, className = '' }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 16 16" 
    height={size} 
    width={size} 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path>
  </svg>
);

const LinkedinIcon = ({ size = 18, className = '' }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 16 16" 
    height={size} 
    width={size} 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm10.934 8.212V9.97c0-2.03-1.085-2.977-2.533-2.977-1.168 0-1.691.644-1.982 1.096V6.168H7.78c.03.677 0 7.225 0 7.225h2.4v-4.03c0-.216.015-.432.078-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401z"></path>
  </svg>
);

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry');
  const [skills, setSkills] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  const [avatar, setAvatar] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load user profile details on boot
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setTitle(user.profile?.title || '');
      setExperienceLevel(user.profile?.experienceLevel || 'Entry');
      setSkills(user.profile?.skills?.join(', ') || '');
      setTargetRoles(user.profile?.targetRoles?.join(', ') || '');
      setAvatar(user.profile?.avatar || '');
      setGithub(user.profile?.github || '');
      setLinkedin(user.profile?.linkedin || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    // Parse comma strings
    const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
    const rolesArray = targetRoles.split(',').map(r => r.trim()).filter(Boolean);

    try {
      await updateProfile({
        name,
        email,
        title,
        experienceLevel,
        skills: skillsArray,
        targetRoles: rolesArray,
        avatar,
        github,
        linkedin
      });
      setMessage('Profile settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  const currentAvatarUrl = avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(name || 'Explorer');

  return (
    <div className="profile-view-container">
      <h1 className="page-title">Profile Settings</h1>
      <p className="page-subtitle">Configure your professional title, target career paths, and technical skill sets.</p>

      <div className="profile-layout-grid animate-fade-in">
        
        {/* Left Column: Visual Profile Card */}
        <div className="profile-sidebar-card glass-card">
          <div className="avatar-preview-section">
            <div className="avatar-container-circle">
              <img src={currentAvatarUrl} alt="User Avatar" className="profile-display-avatar" />
              <div className="avatar-edit-icon-overlay">
                <Camera size={18} />
              </div>
            </div>
            <h3 className="user-sidebar-name">{name || 'Explorer'}</h3>
            <span className="user-sidebar-title">{title || 'Career Pilot User'}</span>
          </div>

          {/* Social icons display */}
          <div className="profile-sidebar-socials-row">
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="sidebar-social-link github">
                <GithubIcon size={18} />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="sidebar-social-link linkedin">
                <LinkedinIcon size={18} />
              </a>
            )}
            {!github && !linkedin && (
              <span className="no-socials-text">Add socials in configuration</span>
            )}
          </div>

          <div className="sidebar-stats-divider"></div>

          {/* Quick Info summary */}
          <div className="sidebar-info-summary">
            <div className="summary-item">
              <span className="lbl">Email Address</span>
              <span className="val">{email || 'Not provided'}</span>
            </div>
            <div className="summary-item">
              <span className="lbl">Experience Tier</span>
              <span className="val">{experienceLevel} Tier</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings configuration forms */}
        <div className="profile-settings-main glass-card">
          {message && <div className="alert-message success-alert" style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', color: 'var(--accent-success)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{message}</div>}
          {error && <div className="alert-message error-alert" style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}

          <form onSubmit={handleSubmit} className="profile-edit-form">
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 0, fontSize: '0.95rem', fontWeight: 800 }}>
              <User size={16} style={{ color: 'var(--primary)' }} />
              <span>Personal Information</span>
            </h3>
            
            <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">Full Name</label>
                <input
                  type="text"
                  id="prof-name"
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-email">Email Address</label>
                <div className="input-with-icon">
                  <Mail size={15} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    id="prof-email"
                    className="form-control"
                    placeholder="e.g. name@domain.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-title">Professional Title</label>
                <div className="input-with-icon">
                  <Briefcase size={15} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="prof-title"
                    className="form-control"
                    placeholder="e.g. Fullstack Developer"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-experience">Experience Tier</label>
                <select
                  id="prof-experience"
                  className="form-control"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Entry">Entry Level (0-2 Years)</option>
                  <option value="Mid">Mid Level (2-5 Years)</option>
                  <option value="Senior">Senior Level (5+ Years)</option>
                </select>
              </div>
            </div>

            {/* Avatar customization */}
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              <Camera size={16} style={{ color: 'var(--primary)' }} />
              <span>Choose Profile Avatar</span>
            </h3>
            
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0' }}>Select one of our premium character presets, or paste your custom image URL below.</p>
            
            <div className="avatar-presets-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
              {AVATAR_PRESETS.map(preset => (
                <div 
                  key={preset.name} 
                  className={`avatar-preset-item ${avatar === preset.url ? 'active' : ''}`}
                  onClick={() => setAvatar(preset.url)}
                  style={{ width: '60px', height: '60px', borderRadius: '50%', overflow: 'hidden', border: avatar === preset.url ? '3px solid var(--primary)' : '2px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s ease', background: 'var(--bg-item)' }}
                >
                  <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="prof-avatar-url">Custom Image URL</label>
              <input
                type="text"
                id="prof-avatar-url"
                className="form-control"
                placeholder="e.g. https://domain.com/picture.png"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
              />
            </div>

            {/* Social links */}
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              <Link size={16} style={{ color: 'var(--primary)' }} />
              <span>Social Coordinates</span>
            </h3>
            
            <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-github">GitHub Profile Link</label>
                <div className="input-with-icon">
                  <GithubIcon size={15} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="prof-github"
                    className="form-control"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-linkedin">LinkedIn Profile Link</label>
                <div className="input-with-icon">
                  <LinkedinIcon size={15} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="prof-linkedin"
                    className="form-control"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            </div>

            {/* Professional metadata */}
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              <Tag size={16} style={{ color: 'var(--primary)' }} />
              <span>Technical Skills & Alignment</span>
            </h3>
            
            <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-skills">Technical Skills (comma separated)</label>
                <textarea
                  id="prof-skills"
                  className="form-control textarea-field"
                  placeholder="React, Node.js, Express, MongoDB, Git"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-roles">Target Career Roles (comma separated)</label>
                <textarea
                  id="prof-roles"
                  className="form-control textarea-field"
                  placeholder="Fullstack Developer, Software Engineer"
                  value={targetRoles}
                  onChange={(e) => setTargetRoles(e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className="profile-form-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary save-profile-btn" disabled={loading} style={{ width: 'auto', padding: '0 2.5rem' }}>
                <Save size={16} />
                <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
