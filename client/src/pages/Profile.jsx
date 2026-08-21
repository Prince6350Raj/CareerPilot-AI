import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Save, User, Award, Tag, Mail, Camera, Link, Briefcase, RefreshCw, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
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

const LeetcodeIcon = ({ size = 18, className = '' }) => (
  <svg 
    stroke="currentColor" 
    fill="currentColor" 
    strokeWidth="0" 
    viewBox="0 0 24 24" 
    height={size} 
    width={size} 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.414l-9.75 9.75a1.375 1.375 0 0 0 0 1.945l1.9 1.9a1.375 1.375 0 0 0 1.95 0l9.75-9.75a1.375 1.375 0 0 0 0-1.945l-1.9-1.9A1.374 1.374 0 0 0 13.483 0zm-8.835 12.09c-.279-.279-.64-.424-1.002-.435a1.373 1.373 0 0 0-.961.414l-1.9 1.9a1.375 1.375 0 0 0 0 1.945l9.75 9.75a1.375 1.375 0 0 0 1.945 0l1.9-1.9a1.375 1.375 0 0 0 0-1.945l-9.732-9.732zm13.125-6.52c-.68 0-1.23.55-1.23 1.23v10.3c0 .68.55 1.23 1.23 1.23h1.8a1.23 1.23 0 0 0 1.23-1.23v-10.3a1.23 1.23 0 0 0-1.23-1.23h-1.8z"></path>
  </svg>
);

const GlobeIcon = ({ size = 18, className = '' }) => (
  <svg 
    stroke="currentColor" 
    fill="none" 
    strokeWidth="2" 
    viewBox="0 0 24 24" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    height={size} 
    width={size} 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
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
  const [leetcode, setLeetcode] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Image zoom and position alignment states
  const [avatarScale, setAvatarScale] = useState(1);
  const [avatarX, setAvatarX] = useState(50);
  const [avatarY, setAvatarY] = useState(50);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Device Upload & Camera capture hooks
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

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
      setLeetcode(user.profile?.leetcode || '');
      setPortfolio(user.profile?.portfolio || '');
      setAvatarScale(user.profile?.avatarScale ?? 1);
      setAvatarX(user.profile?.avatarX ?? 50);
      setAvatarY(user.profile?.avatarY ?? 50);
    }
  }, [user]);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Calculate Profile Strength score
  const getProfileStrength = () => {
    let score = 0;
    if (name.trim()) score += 15;
    if (email.trim()) score += 15;
    if (title.trim()) score += 15;
    if (skills.trim()) score += 15;
    if (targetRoles.trim()) score += 15;
    if (experienceLevel) score += 10;
    
    // Social links points
    let socialPoints = 0;
    if (github.trim()) socialPoints += 3.75;
    if (linkedin.trim()) socialPoints += 3.75;
    if (leetcode.trim()) socialPoints += 3.75;
    if (portfolio.trim()) socialPoints += 3.75;
    score += Math.ceil(socialPoints);

    return Math.min(100, score);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setError('Image size should be less than 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setAvatar(reader.result);
        // Reset scale and positions on upload
        setAvatarScale(1);
        setAvatarX(50);
        setAvatarY(50);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setCameraLoading(true);
    setError('');
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 300, facingMode: 'user' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      setError('Could not access device camera. Please check permissions.');
      setShowCamera(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 300, 300);
      const base64Selfie = canvasRef.current.toDataURL('image/jpeg');
      setAvatar(base64Selfie);
      // Reset scale and positions on capture
      setAvatarScale(1);
      setAvatarX(50);
      setAvatarY(50);
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setShowCamera(false);
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

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
        linkedin,
        leetcode,
        portfolio,
        avatarScale,
        avatarX,
        avatarY
      });
      setMessage('Profile settings saved successfully!');
    } catch (err) {
      setError(err.message || 'Failed to update profile details. (Try using a smaller image if limit exceeded)');
    } finally {
      setLoading(false);
    }
  };

  const currentAvatarUrl = avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + encodeURIComponent(name || 'Explorer');
  const strengthScore = getProfileStrength();

  return (
    <div className="profile-view-container">
      <h1 className="page-title">Profile Settings</h1>
      <p className="page-subtitle">Configure your professional title, target career paths, and technical skill sets.</p>

      <div className="profile-layout-grid animate-fade-in">
        
        {/* Left Column: Visual Dev Passport Badge Card */}
        <div className="profile-sidebar-card dev-id-badge glass-card">
          <div className="dev-badge-header">
            <span className="badge-logo">CP // PILOT</span>
            <span className="badge-status-dot active">VERIFIED</span>
          </div>

          <div className="avatar-preview-section">
            <div className="avatar-container-circle clickable" onClick={triggerFileSelect}>
              <img 
                src={currentAvatarUrl} 
                alt="User Avatar" 
                className="profile-display-avatar" 
                style={{ 
                  transform: `scale(${avatarScale})`, 
                  objectPosition: `${avatarX}% ${avatarY}%`,
                  transition: 'transform 0.1s ease, object-position 0.1s ease'
                }} 
              />
              <div className="avatar-edit-icon-overlay">
                <Camera size={18} />
                <span style={{ fontSize: '0.62rem', fontWeight: 700, marginTop: '0.15rem' }}>CHANGE</span>
              </div>
            </div>
            <h3 className="user-sidebar-name">{name || 'Explorer'}</h3>
            <span className="user-sidebar-title">{title || 'Full Stack Developer'}</span>
          </div>

          {/* Social icons display */}
          <div className="profile-sidebar-socials-row">
            {github && (
              <a href={github} target="_blank" rel="noopener noreferrer" className="sidebar-social-link github" title="GitHub Profile">
                <GithubIcon size={16} />
              </a>
            )}
            {linkedin && (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="sidebar-social-link linkedin" title="LinkedIn Profile">
                <LinkedinIcon size={16} />
              </a>
            )}
            {leetcode && (
              <a href={leetcode} target="_blank" rel="noopener noreferrer" className="sidebar-social-link leetcode" title="LeetCode Profile">
                <LeetcodeIcon size={16} />
              </a>
            )}
            {portfolio && (
              <a href={portfolio} target="_blank" rel="noopener noreferrer" className="sidebar-social-link portfolio" title="Personal Portfolio">
                <GlobeIcon size={16} />
              </a>
            )}
            {!github && !linkedin && !leetcode && !portfolio && (
              <span className="no-socials-text">Social links are empty</span>
            )}
          </div>

          {/* Profile Strength Meter */}
          <div className="profile-strength-meter-section" style={{ width: '100%', marginTop: '1.75rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 800, marginBottom: '0.35rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              <span>Profile Strength</span>
              <span style={{ color: strengthScore === 100 ? 'var(--accent-success)' : strengthScore > 60 ? 'var(--accent-warning)' : 'var(--accent-error)' }}>{strengthScore}%</span>
            </div>
            <div className="strength-bar-bg" style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
              <div className="strength-bar-fill" style={{ height: '100%', width: `${strengthScore}%`, background: strengthScore === 100 ? 'hsl(142, 70%, 45%)' : strengthScore > 60 ? 'hsl(38, 92%, 50%)' : 'hsl(0, 84%, 60%)', transition: 'width 0.4s ease' }}></div>
            </div>
          </div>

          <div className="sidebar-stats-divider"></div>

          {/* Quick Info summary */}
          <div className="sidebar-info-summary">
            <div className="summary-item">
              <span className="lbl">System ID</span>
              <span className="val" style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>UID-{user?.id?.slice(-8).toUpperCase() || 'EXPLORER'}</span>
            </div>
            <div className="summary-item">
              <span className="lbl">Email Coordinate</span>
              <span className="val">{email || 'Not provided'}</span>
            </div>
          </div>

          {/* Barcode Mock styling decoration */}
          <div className="dev-badge-barcode-decoration">
            <div className="barcode-line thin"></div>
            <div className="barcode-line thick"></div>
            <div className="barcode-line medium"></div>
            <div className="barcode-line thin"></div>
            <div className="barcode-line thick"></div>
            <div className="barcode-line thin"></div>
            <span className="barcode-text">CAREERPILOT.AI // DEV-PASS</span>
          </div>
        </div>

        {/* Right Column: Settings configuration forms */}
        <div className="profile-settings-main glass-card">
          {message && <div className="alert-message success-alert" style={{ padding: '0.85rem 1rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-success)', color: 'var(--accent-success)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{message}</div>}
          {error && <div className="alert-message error-alert" style={{ padding: '0.85rem 1rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--accent-error)', color: 'var(--accent-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{error}</div>}

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            accept="image/*" 
          />

          <form onSubmit={handleSubmit} className="profile-edit-form">
            
            {/* 1. General Profile details */}
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: 0, fontSize: '0.95rem', fontWeight: 800 }}>
              <User size={16} style={{ color: 'var(--primary)' }} />
              <span>Personal Information</span>
            </h3>
            
            <div className="settings-section-row">
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

            <div className="settings-section-row" style={{ marginBottom: '2rem' }}>
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

            {/* 2. Image Selection & Upload Area */}
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              <Camera size={16} style={{ color: 'var(--primary)' }} />
              <span>Choose Profile Avatar / Photo</span>
            </h3>
            
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 1.25rem 0' }}>Upload a file, take a live webcam selfie, or choose one of our programmer character presets.</p>
            
            <div className="image-sourcing-panel-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
              
              {/* Device File Upload card */}
              <div className="image-source-box drag-upload-card" onClick={triggerFileSelect}>
                <Upload size={22} className="upload-box-icon" />
                <span className="lbl">Upload Image</span>
                <span className="desc">PNG, JPG up to 8MB</span>
              </div>

              {/* Webcam Selfie Capture Card */}
              <div className="image-source-box selfie-cam-card" onClick={startCamera}>
                <Camera size={22} className="upload-box-icon" />
                <span className="lbl">Take live Selfie</span>
                <span className="desc">Capture using webcam</span>
              </div>

            </div>

            {/* Webcam Live Feed Modal/Box */}
            {showCamera && (
              <div className="webcam-capture-modal animate-fade-in">
                <div className="webcam-header-row">
                  <span>Live Camera Capture</span>
                  <button type="button" onClick={stopCamera} className="btn-close-cam">Cancel</button>
                </div>
                {cameraLoading ? (
                  <div className="webcam-loading-spinner">Connecting camera...</div>
                ) : (
                  <div className="webcam-feed-container">
                    <video ref={videoRef} autoPlay playsInline width="280" height="280" className="camera-video-stream"></video>
                    <canvas ref={canvasRef} width="300" height="300" style={{ display: 'none' }}></canvas>
                    <button type="button" onClick={captureSelfie} className="btn btn-primary capture-selfie-action-btn">
                      <Camera size={14} />
                      <span>Capture Photo</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Live adjustments sliders */}
            {avatar && (
              <div className="avatar-alignment-adjust-panel" style={{ background: 'var(--bg-item)', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                  📏 Adjust Photo Position & Zoom
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  {/* Scale Zoom Slider */}
                  <div className="adjust-slider-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <label>Zoom Scale</label>
                      <span>{avatarScale.toFixed(2)}x</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="3" 
                      step="0.05" 
                      value={avatarScale} 
                      onChange={(e) => setAvatarScale(parseFloat(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </div>
                  {/* Horizontal Offset Slider */}
                  <div className="adjust-slider-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <label>Horizontal Align</label>
                      <span>{avatarX}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="1" 
                      value={avatarX} 
                      onChange={(e) => setAvatarX(parseInt(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </div>
                  {/* Vertical Offset Slider */}
                  <div className="adjust-slider-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <label>Vertical Align</label>
                      <span>{avatarY}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      step="1" 
                      value={avatarY} 
                      onChange={(e) => setAvatarY(parseInt(e.target.value))}
                      style={{ width: '100%', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Avatar presets selection */}
            <div className="presets-select-sub-panel" style={{ background: 'var(--bg-item)', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Character Presets</span>
              <div className="avatar-presets-grid" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {AVATAR_PRESETS.map(preset => (
                  <div 
                    key={preset.name} 
                    className={`avatar-preset-item ${avatar === preset.url ? 'active' : ''}`}
                    onClick={() => {
                      setAvatar(preset.url);
                      setAvatarScale(1);
                      setAvatarX(50);
                      setAvatarY(50);
                    }}
                    style={{ width: '54px', height: '54px', borderRadius: '50%', overflow: 'hidden', border: avatar === preset.url ? '3px solid var(--primary)' : '2px solid var(--border-color)', cursor: 'pointer', transition: 'all 0.2s ease', background: 'var(--bg-item)' }}
                  >
                    <img src={preset.url} alt={preset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label className="form-label" htmlFor="prof-avatar-url">Custom Photo URL</label>
              <input
                type="text"
                id="prof-avatar-url"
                className="form-control"
                placeholder="https://domain.com/picture.png"
                value={avatar}
                onChange={(e) => {
                  setAvatar(e.target.value);
                  setAvatarScale(1);
                  setAvatarX(50);
                  setAvatarY(50);
                }}
              />
            </div>

            {/* 3. Social Coordinates links */}
            <h3 className="section-title-minor" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1.5rem', fontSize: '0.95rem', fontWeight: 800 }}>
              <Link size={16} style={{ color: 'var(--primary)' }} />
              <span>Social Coordinates</span>
            </h3>
            
            <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '1.25rem' }}>
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

            <div className="settings-section-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              <div className="form-group">
                <label className="form-label" htmlFor="prof-leetcode">LeetCode Profile Link</label>
                <div className="input-with-icon">
                  <LeetcodeIcon size={15} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="prof-leetcode"
                    className="form-control"
                    placeholder="https://leetcode.com/username"
                    value={leetcode}
                    onChange={(e) => setLeetcode(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prof-portfolio">Portfolio / Personal Website</label>
                <div className="input-with-icon">
                  <GlobeIcon size={15} className="input-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    id="prof-portfolio"
                    className="form-control"
                    placeholder="https://myportfolio.com"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    style={{ paddingLeft: '38px' }}
                  />
                </div>
              </div>
            </div>

            {/* 4. Professional skills details */}
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
