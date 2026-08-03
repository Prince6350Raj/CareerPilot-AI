import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Save, User, Award, Tag } from 'lucide-react';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Entry');
  const [skills, setSkills] = useState('');
  const [targetRoles, setTargetRoles] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load user profile details on boot
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setTitle(user.profile?.title || '');
      setExperienceLevel(user.profile?.experienceLevel || 'Entry');
      setSkills(user.profile?.skills?.join(', ') || '');
      setTargetRoles(user.profile?.targetRoles?.join(', ') || '');
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
        title,
        experienceLevel,
        skills: skillsArray,
        targetRoles: rolesArray
      });
      setMessage('Profile settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-view-container">
      <h1 className="page-title">Profile Settings</h1>
      <p className="page-subtitle">Configure your professional title, target career paths, and technical skill sets.</p>

      <div className="profile-card glass-card animate-fade-in">
        {message && <div className="alert-message success-alert">{message}</div>}
        {error && <div className="alert-message error-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="profile-edit-form">
          <div className="profile-form-grid">
            {/* Left Col */}
            <div className="form-column">
              <h3 className="section-title-minor">General Information</h3>
              
              <div className="form-group">
                <label className="form-label" htmlFor="prof-name">Full Name</label>
                <div className="input-with-icon">
                  <User size={16} className="input-icon" />
                  <input
                    type="text"
                    id="prof-name"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-title">Professional Title</label>
                <input
                  type="text"
                  id="prof-title"
                  className="form-control"
                  placeholder="e.g. Front-End Web Developer"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
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

            {/* Right Col */}
            <div className="form-column">
              <h3 className="section-title-minor">Skill Gaps & Alignment</h3>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-skills">Technical Skills (comma separated)</label>
                <div className="input-with-icon">
                  <Tag size={16} className="input-icon" />
                  <textarea
                    id="prof-skills"
                    className="form-control textarea-field"
                    placeholder="React, CSS, HTML5, Git, JavaScript"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-roles">Target Career Roles (comma separated)</label>
                <div className="input-with-icon">
                  <Award size={16} className="input-icon" />
                  <textarea
                    id="prof-roles"
                    className="form-control textarea-field"
                    placeholder="Fullstack Developer, Frontend Specialist"
                    value={targetRoles}
                    onChange={(e) => setTargetRoles(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-form-footer">
            <button type="submit" className="btn btn-primary save-profile-btn" disabled={loading}>
              <Save size={16} />
              <span>{loading ? 'Saving Settings...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
