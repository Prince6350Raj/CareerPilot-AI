import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Type, Palette, Monitor, Save, RotateCcw, Cpu, Activity, Database, Trash2, ShieldCheck, ToggleLeft, ToggleRight, Sparkles, Volume2, VolumeX, CheckCircle2, Bell, Zap, Check, ExternalLink, Sliders, Shield, HardDrive, Wifi, Layers, MessageSquare, Play } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  // Read initial states from localStorage
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('app-font-family') || "'Plus Jakarta Sans', sans-serif");
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('app-font-size') || '15'));
  const [isBold, setIsBold] = useState(localStorage.getItem('app-font-weight') === 'bold');
  const [isItalic, setIsItalic] = useState(localStorage.getItem('app-font-style') === 'italic');
  const [bgType, setBgType] = useState(localStorage.getItem('app-bg-type') || 'dynamic'); // dynamic, flat, grid, neon
  const [activeTab, setActiveTab] = useState('common'); // common, theme, font, copilot, health, integrations
  const [themeFilter, setThemeFilter] = useState('all');

  // Common Preferences
  const [uiAnimations, setUiAnimations] = useState(localStorage.getItem('ui-animations') !== 'false');
  const [soundEffects, setSoundEffects] = useState(localStorage.getItem('sound-effects') === 'true');
  const [compactSidebar, setCompactSidebar] = useState(localStorage.getItem('compact-sidebar') === 'true');

  // AI Copilot states
  const [copilotModel, setCopilotModel] = useState(localStorage.getItem('copilot-model') || 'gemini-3.6-flash');
  const [voiceSpeed, setVoiceSpeed] = useState(parseFloat(localStorage.getItem('voice-speed') || '1.0'));
  const [autoSpeech, setAutoSpeech] = useState(localStorage.getItem('auto-speech') !== 'false');
  const [welcomeSpeech, setWelcomeSpeech] = useState(localStorage.getItem('ai-welcome-speech') !== 'false');
  const [copilotPersona, setCopilotPersona] = useState(localStorage.getItem('copilot-persona') || 'architect');
  const [isPlayingTestAudio, setIsPlayingTestAudio] = useState(false);

  // Integrations states
  const [linkedInSync, setLinkedInSync] = useState(localStorage.getItem('linkedin-sync') === 'true');
  const [githubSync, setGithubSync] = useState(localStorage.getItem('github-sync') === 'true');
  const [emailAlerts, setEmailAlerts] = useState(localStorage.getItem('email-alerts') === 'true');
  const [discordSync, setDiscordSync] = useState(localStorage.getItem('discord-sync') === 'false');
  const [calendarSync, setCalendarSync] = useState(localStorage.getItem('calendar-sync') === 'true');

  const [cacheNotice, setCacheNotice] = useState('');

  // Sync state settings to localStorage in real time
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-body', fontFamily);
    localStorage.setItem('app-font-family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    localStorage.setItem('app-font-size', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    const val = isBold ? 'bold' : 'normal';
    document.documentElement.style.setProperty('--app-font-weight', val);
    localStorage.setItem('app-font-weight', val);
  }, [isBold]);

  useEffect(() => {
    const val = isItalic ? 'italic' : 'normal';
    document.documentElement.style.setProperty('--app-font-style', val);
    localStorage.setItem('app-font-style', val);
  }, [isItalic]);

  useEffect(() => {
    document.documentElement.classList.toggle('flat-bg', bgType === 'flat');
    document.documentElement.classList.toggle('grid-bg', bgType === 'grid');
    localStorage.setItem('app-bg-type', bgType);
  }, [bgType]);

  useEffect(() => {
    localStorage.setItem('ui-animations', uiAnimations.toString());
  }, [uiAnimations]);

  useEffect(() => {
    localStorage.setItem('sound-effects', soundEffects.toString());
  }, [soundEffects]);

  useEffect(() => {
    localStorage.setItem('compact-sidebar', compactSidebar.toString());
  }, [compactSidebar]);

  useEffect(() => {
    localStorage.setItem('copilot-model', copilotModel);
  }, [copilotModel]);

  useEffect(() => {
    localStorage.setItem('voice-speed', voiceSpeed.toString());
  }, [voiceSpeed]);

  useEffect(() => {
    localStorage.setItem('auto-speech', autoSpeech.toString());
  }, [autoSpeech]);

  useEffect(() => {
    localStorage.setItem('ai-welcome-speech', welcomeSpeech.toString());
  }, [welcomeSpeech]);

  useEffect(() => {
    localStorage.setItem('copilot-persona', copilotPersona);
  }, [copilotPersona]);

  useEffect(() => {
    localStorage.setItem('linkedin-sync', linkedInSync.toString());
  }, [linkedInSync]);

  useEffect(() => {
    localStorage.setItem('github-sync', githubSync.toString());
  }, [githubSync]);

  useEffect(() => {
    localStorage.setItem('email-alerts', emailAlerts.toString());
  }, [emailAlerts]);

  useEffect(() => {
    localStorage.setItem('discord-sync', discordSync.toString());
  }, [discordSync]);

  useEffect(() => {
    localStorage.setItem('calendar-sync', calendarSync.toString());
  }, [calendarSync]);

  const handleTestVoice = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance("CareerPilot AI voice synthesis is operational. Speech playback speed is set to " + voiceSpeed.toFixed(1) + "x.");
      utterance.rate = voiceSpeed;
      utterance.onstart = () => setIsPlayingTestAudio(true);
      utterance.onend = () => setIsPlayingTestAudio(false);
      utterance.onerror = () => setIsPlayingTestAudio(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const clearCache = () => {
    localStorage.removeItem('clickedResources');
    localStorage.removeItem('portfolio_audit_history');
    setCacheNotice('Cache successfully cleared! Dashboard and portfolio history have been reset.');
    setTimeout(() => setCacheNotice(''), 4000);
  };

  const resetToDefaults = () => {
    setTheme('light');
    setFontFamily("'Plus Jakarta Sans', sans-serif");
    setFontSize(15);
    setIsBold(false);
    setIsItalic(false);
    setBgType('dynamic');
    setUiAnimations(true);
    setSoundEffects(false);
    setCompactSidebar(false);
    setCopilotModel('gemini-3.6-flash');
    setVoiceSpeed(1.0);
    setAutoSpeech(true);
    setWelcomeSpeech(true);
    setCopilotPersona('architect');
    setLinkedInSync(false);
    setGithubSync(false);
    setEmailAlerts(false);
    setDiscordSync(false);
    setCalendarSync(true);
  };

  const themeList = [
    { id: 'dark', name: 'Space Blue', color: '#4f46e5', type: 'dark', desc: 'Deep galactic space blue interface' },
    { id: 'light', name: 'Frosted Glass', color: '#94a3b8', type: 'light', desc: 'Vibrant clean white-blue frosted view' },
    { id: 'whiteblue', name: 'White, Grey & Blue', color: '#2563eb', type: 'minimal', desc: 'Crisp white, cool grey & modern tech blue' },
    { id: 'cyberpunk', name: 'Cyberpunk Gold', color: '#eab308', type: 'dark', desc: 'Neon yellow-gold developer terminal theme' },
    { id: 'emerald', name: 'Emerald Forest', color: '#10b981', type: 'dark', desc: 'Dark emerald green palette' },
    { id: 'sakura', name: 'Frosted Slate', color: '#ec4899', type: 'light', desc: 'Soft pastel slate-pink backdrop' },
    { id: 'ocean', name: 'Ocean Blue', color: '#0891b2', type: 'dark', desc: 'Turquoise ocean blue theme' },
    { id: 'goldlight', name: 'Golden Pastel', color: '#f59e0b', type: 'light', desc: 'Bright gold & cream pastel scheme' },
    { id: 'redlight', name: 'Red & White', color: '#ef4444', type: 'light', desc: 'Sleek crimson-white light profile' },
    { id: 'orangelight', name: 'Orange & White', color: '#f97316', type: 'light', desc: 'Vibrant sunset-white light profile' },
    { id: 'greenlight', name: 'Light Green & White', color: '#10b981', type: 'light', desc: 'Fresh mint-white light profile' },
    { id: 'skyblue', name: 'Sky Blue Pastel', color: '#0ea5e9', type: 'light', desc: 'Calming sky-blue light profile' }
  ];

  const filteredThemes = themeList.filter(t => {
    if (themeFilter === 'all') return true;
    if (themeFilter === 'light') return t.type === 'light' || t.type === 'minimal';
    if (themeFilter === 'dark') return t.type === 'dark';
    if (themeFilter === 'minimal') return t.type === 'minimal';
    return true;
  });

  return (
    <div className="settings-page-wrapper container animate-fade-in">
      
      {/* Title Header Hero Block */}
      <div className="settings-header-card glass-card">
        <div className="settings-header-left">
          <div className="settings-badge-pill">
            <Sparkles size={13} />
            <span>WORKSPACE & AI ENGINE CONTROL CENTER</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.4rem' }}>
            <div className="settings-logo-box">
              <SettingsIcon size={24} className="settings-icon-spin" />
            </div>
            <div>
              <h2 className="settings-main-title">System Settings</h2>
              <p className="settings-sub-title">Configure workspace themes, typography preferences, AI engines, and hardware telemetry.</p>
            </div>
          </div>
        </div>

        {/* Quick System Status Chips */}
        <div className="settings-status-chips">
          <div className="status-chip-box">
            <span className="status-chip-label">ACTIVE THEME</span>
            <span className="status-chip-val" style={{ color: '#2563eb' }}>{themeList.find(t => t.id === theme)?.name || theme}</span>
          </div>
          <div className="status-chip-box">
            <span className="status-chip-label">AI MODEL</span>
            <span className="status-chip-val" style={{ color: '#10b981' }}>{copilotModel === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro' : 'Gemini 1.5 Flash'}</span>
          </div>
          <button 
            className="btn btn-secondary reset-btn" 
            onClick={resetToDefaults} 
            title="Restore all default settings"
          >
            <RotateCcw size={13} />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      <div className="settings-content-grid">
        
        {/* Left Settings Navigation Menu */}
        <div className="settings-sidebar glass-card">
          {[
            { id: 'common', label: 'Common Preferences', icon: Monitor, tag: 'UI & Layout' },
            { id: 'theme', label: 'Themes & Appearance', icon: Palette, tag: '12 Palettes' },
            { id: 'font', label: 'Font & Typography', icon: Type, tag: 'Live Preview' },
            { id: 'copilot', label: 'AI Copilot Options', icon: Cpu, tag: 'Gemini Engine' },
            { id: 'health', label: 'System Health & Logs', icon: Activity, tag: 'Telemetry' },
            { id: 'integrations', label: 'Integrations & Reminders', icon: Database, tag: '5 Connected' }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id}
                className={`settings-tab-btn ${isActive ? 'active' : ''}`} 
                onClick={() => setActiveTab(tab.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Icon size={16} className="tab-icon" />
                  <span>{tab.label}</span>
                </div>
                <span className="tab-tag-pill">{tab.tag}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Form Area */}
        <div className="settings-form-area glass-card">
          
          {/* TAB 1: Common Preferences */}
          {activeTab === 'common' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-section-header">
                <div>
                  <h3 className="section-title">Common Preferences</h3>
                  <p className="section-desc">Manage workspace backdrop styles, UI motion ergonomics, and layout parameters.</p>
                </div>
                <span className="section-badge">General</span>
              </div>
              
              {/* Visual Background Cards */}
              <div className="form-group-item">
                <label className="settings-label">Workspace Background Atmosphere</label>
                <p className="input-tip-text">Choose your preferred backdrop style for distraction-free coding.</p>
                
                <div className="bg-cards-grid">
                  {[
                    { id: 'dynamic', name: '🌈 Dynamic Glow', desc: 'Fluid subtle ambient gradients & glows' },
                    { id: 'flat', name: '⬛ Solid Minimalist', desc: 'Clean pure flat surface, zero distractions' },
                    { id: 'grid', name: '🕸️ Cyber Matrix Grid', desc: 'Retro blueprint developer layout grid' }
                  ].map(b => (
                    <div 
                      key={b.id}
                      className={`bg-style-card ${bgType === b.id ? 'active' : ''}`}
                      onClick={() => setBgType(b.id)}
                    >
                      <div className="bg-card-header">
                        <span className="bg-card-name">{b.name}</span>
                        {bgType === b.id && <Check size={14} className="bg-check-icon" />}
                      </div>
                      <p className="bg-card-desc">{b.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="divider-line" />

              {/* Interaction Toggles */}
              <div className="toggles-list-stack">
                <div className="toggle-row-item">
                  <div>
                    <span className="toggle-title">Fluid UI Micro-Animations</span>
                    <span className="toggle-desc">Enable smooth 60fps card hover transitions, glowing button effects, and modal fades.</span>
                  </div>
                  <button 
                    onClick={() => setUiAnimations(!uiAnimations)}
                    className="toggle-icon-btn"
                  >
                    {uiAnimations ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                <div className="toggle-row-item">
                  <div>
                    <span className="toggle-title">Interaction Sound FX</span>
                    <span className="toggle-desc">Play subtle audio chimes on successful code execution, audit completion, and AI responses.</span>
                  </div>
                  <button 
                    onClick={() => setSoundEffects(!soundEffects)}
                    className="toggle-icon-btn"
                  >
                    {soundEffects ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                <div className="toggle-row-item">
                  <div>
                    <span className="toggle-title">Compact Workspace Navigation</span>
                    <span className="toggle-desc">Automatically collapse the sidebar on smaller viewports to maximize editor real-estate.</span>
                  </div>
                  <button 
                    onClick={() => setCompactSidebar(!compactSidebar)}
                    className="toggle-icon-btn"
                  >
                    {compactSidebar ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Themes & Presets */}
          {activeTab === 'theme' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-section-header">
                <div>
                  <h3 className="section-title">Themes & Visual Appearance</h3>
                  <p className="section-desc">Choose from 12 handcrafted developer color schemes tailored for light and dark environments.</p>
                </div>
                <div className="theme-filter-pills">
                  {['all', 'light', 'dark', 'minimal'].map(f => (
                    <button
                      key={f}
                      className={`theme-filter-btn ${themeFilter === f ? 'active' : ''}`}
                      onClick={() => setThemeFilter(f)}
                    >
                      {f === 'all' ? 'All (12)' : f === 'light' ? 'Light & Pastel' : f === 'dark' ? 'Dark & Cyber' : 'Minimalist'}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="theme-grid-selector">
                {filteredThemes.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <div 
                      key={t.id} 
                      className={`theme-card-selection ${isActive ? 'active' : ''}`} 
                      onClick={() => setTheme(t.id)}
                    >
                      <div className="theme-color-indicator" style={{ background: t.color }}>
                        {isActive && <Check size={14} style={{ color: '#ffffff' }} />}
                      </div>
                      <div className="theme-text-info">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <h4 className="theme-card-title">{t.name}</h4>
                          {isActive && <span className="active-theme-tag">Active</span>}
                        </div>
                        <p className="theme-card-desc">{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: Font & Typography */}
          {activeTab === 'font' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-section-header">
                <div>
                  <h3 className="section-title">Font & Typography Engine</h3>
                  <p className="section-desc">Customize interface font families, sizing scale, and weight hierarchies in real time.</p>
                </div>
                <span className="section-badge">Typography</span>
              </div>

              <div className="form-group-item">
                <label className="settings-label">Primary Typeface</label>
                <div className="font-options-grid">
                  {[
                    { font: "'Plus Jakarta Sans', sans-serif", name: 'Plus Jakarta Sans', tag: 'Modern Sans' },
                    { font: "'JetBrains Mono', 'Fira Code', monospace", name: 'JetBrains Mono', tag: 'Code Monospace' },
                    { font: "Georgia, serif", name: 'Georgia', tag: 'Classic Editorial' },
                    { font: "'Roboto Slab', serif", name: 'Roboto Slab', tag: 'Technical Slab' }
                  ].map((f, i) => (
                    <div 
                      key={i}
                      className={`font-select-card ${fontFamily === f.font ? 'active' : ''}`}
                      onClick={() => setFontFamily(f.font)}
                      style={{ fontFamily: f.font }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.9rem' }}>{f.name}</span>
                        {fontFamily === f.font && <Check size={14} style={{ color: 'var(--primary)' }} />}
                      </div>
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{f.tag} • Aa Bb Cc 123</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-group-item" style={{ marginTop: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="settings-label" style={{ margin: 0 }}>Base Font Size Scale</label>
                  <span className="slider-val-badge">{fontSize}px</span>
                </div>
                <input 
                  type="range" 
                  min="13" 
                  max="20" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="settings-range-slider"
                />
              </div>

              <div className="font-weight-toggles-row">
                <label className={`font-weight-chip ${isBold ? 'active' : ''}`}>
                  <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} style={{ display: 'none' }} />
                  <span><b>Bold Emphasis (700)</b></span>
                </label>
                <label className={`font-weight-chip ${isItalic ? 'active' : ''}`}>
                  <input type="checkbox" checked={isItalic} onChange={(e) => setIsItalic(e.target.checked)} style={{ display: 'none' }} />
                  <span><i>Italic Accent (Slanted)</i></span>
                </label>
              </div>

              {/* Live Preview Panel */}
              <div className="live-preview-box">
                <span className="live-preview-tag">Live Typography Sandbox</span>
                <div style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal'
                }}>
                  <h4 style={{ margin: '0 0 0.4rem 0', color: 'var(--text-primary)', fontSize: '1.2em', fontWeight: 800 }}>
                    CareerPilot AI: Next-Gen Developer Workspace
                  </h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Real-time reactive rendering engine is active. Changes made here propagate throughout all code sandboxes, interview simulators, and roadmap builders instantly.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI Copilot Options */}
          {activeTab === 'copilot' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-section-header">
                <div>
                  <h3 className="section-title">AI Copilot & Synthesis Engine</h3>
                  <p className="section-desc">Tune multi-turn reasoning models, speech reader audio playback, and assistant personas.</p>
                </div>
                <span className="section-badge">AI Core</span>
              </div>

              {/* Model Cards */}
              <div className="form-group-item">
                <label className="settings-label">Underlying LLM Execution Engine</label>
                <div className="model-selection-grid">
                  <div 
                    className={`model-option-card ${copilotModel === 'gemini-3.6-flash' ? 'active' : ''}`}
                    onClick={() => setCopilotModel('gemini-3.6-flash')}
                  >
                    <div className="model-card-top">
                      <span className="model-name">🚀 Gemini 3.6 Flash</span>
                      <span className="model-tag-pill">2026 Live Neural Engine</span>
                    </div>
                    <p className="model-card-desc">Ultra-fast sub-second latency, live global intelligence across all technical concepts, and coding assistance.</p>
                  </div>

                  <div 
                    className={`model-option-card ${copilotModel === 'gemini-3.1-pro' ? 'active' : ''}`}
                    onClick={() => setCopilotModel('gemini-3.1-pro')}
                  >
                    <div className="model-card-top">
                      <span className="model-name">🧠 Gemini 3.1 Pro</span>
                      <span className="model-tag-pill pro">Deep Architecture</span>
                    </div>
                    <p className="model-card-desc">Advanced multi-hop algorithmic problem solving, full-stack architectural reviews, and comprehensive resume auditing.</p>
                  </div>
                </div>
              </div>

              <div className="divider-line" />

              {/* AI Persona Selector */}
              <div className="form-group-item">
                <label className="settings-label">AI Mentor Persona & Tone</label>
                <div className="persona-pills-row">
                  {[
                    { id: 'architect', name: '⚡ Senior Architect', desc: 'Direct, technical & rigorous feedback' },
                    { id: 'mentor', name: '🤝 Friendly Peer Mentor', desc: 'Encouraging with step-by-step guidance' },
                    { id: 'interviewer', name: '💼 Strict FAANG Interviewer', desc: 'High standards, time-bounded pressure' }
                  ].map(p => (
                    <button
                      key={p.id}
                      type="button"
                      className={`persona-pill ${copilotPersona === p.id ? 'active' : ''}`}
                      onClick={() => setCopilotPersona(p.id)}
                    >
                      <span style={{ fontWeight: 800 }}>{p.name}</span>
                      <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>{p.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="divider-line" />

              {/* Voice Speed with Test Button */}
              <div className="form-group-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="settings-label" style={{ margin: 0 }}>Voice Synthesis Playback Speed</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="slider-val-badge">{voiceSpeed.toFixed(1)}x</span>
                    <button 
                      type="button" 
                      onClick={handleTestVoice} 
                      className="btn-test-voice"
                      disabled={isPlayingTestAudio}
                    >
                      <Play size={12} />
                      <span>{isPlayingTestAudio ? 'Speaking...' : 'Test Audio'}</span>
                    </button>
                  </div>
                </div>
                <input 
                  type="range" 
                  min="0.8" 
                  max="1.8" 
                  step="0.1"
                  value={voiceSpeed} 
                  onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                  className="settings-range-slider"
                />
              </div>

              {/* Audio switches */}
              <div className="toggles-list-stack">
                <div className="toggle-row-item">
                  <div>
                    <span className="toggle-title">Auto-Play Interview Voice Readout</span>
                    <span className="toggle-desc">Automatically read questions and evaluation grades aloud in Mock Interviews.</span>
                  </div>
                  <button onClick={() => setAutoSpeech(!autoSpeech)} className="toggle-icon-btn">
                    {autoSpeech ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                <div className="toggle-row-item">
                  <div>
                    <span className="toggle-title">AI Welcome Audio Greeting</span>
                    <span className="toggle-desc">Greet the developer with personalized voice audio when logging in.</span>
                  </div>
                  <button onClick={() => setWelcomeSpeech(!welcomeSpeech)} className="toggle-icon-btn">
                    {welcomeSpeech ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: System Health & Logs */}
          {activeTab === 'health' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-section-header">
                <div>
                  <h3 className="section-title">System Health & Live Telemetry</h3>
                  <p className="section-desc">Monitor local client sandbox execution parameters, database connections, and cache metrics.</p>
                </div>
                <span className="section-badge" style={{ color: '#10b981', borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.1)' }}>● All Systems Operational</span>
              </div>

              <div className="telemetry-grid">
                {[
                  { label: 'API Gateway Endpoint', status: 'Healthy', val: 'https://api.careerpilot-ai.com/v1', ping: '24ms', color: '#10b981' },
                  { label: 'Primary MongoDB Database', status: 'Connected', val: 'Indexed (Local Cache Synchronized)', ping: '12ms', color: '#10b981' },
                  { label: 'Web Speech Synthesis Node', status: 'Active', val: 'Browser Native Neural Voice Engine', ping: '0ms', color: '#10b981' },
                  { label: 'Client Memory Allocated', status: 'Optimal', val: '42.8 MB V8 Heap Footprint', ping: 'Low', color: '#2563eb' }
                ].map((item, i) => (
                  <div key={i} className="telemetry-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="telemetry-label">{item.label}</span>
                      <span className="telemetry-badge" style={{ color: item.color, background: `${item.color}15`, borderColor: `${item.color}35` }}>
                        <span className="telemetry-dot" style={{ background: item.color }} />
                        {item.status} ({item.ping})
                      </span>
                    </div>
                    <span className="telemetry-val">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="divider-line" />

              <div className="cache-maintenance-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 className="cache-box-title">Storage & Local Cache Maintenance</h4>
                    <p className="cache-box-desc">Clear cached resources, portfolio audit logs, and search indexes to refresh state.</p>
                  </div>
                  <button 
                    onClick={clearCache}
                    className="btn btn-secondary clear-cache-btn" 
                  >
                    <Trash2 size={13} style={{ color: 'var(--accent-error)' }} />
                    <span>Clear Cache & Logs</span>
                  </button>
                </div>
                
                {cacheNotice && (
                  <div className="alert alert-success animate-fade-in" style={{ marginTop: '0.85rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', padding: '0.65rem 0.85rem', borderRadius: '6px', fontSize: '0.78rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <ShieldCheck size={14} />
                    <span>{cacheNotice}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Integrations & Reminders */}
          {activeTab === 'integrations' && (
            <div className="settings-tab-content animate-fade-in">
              <div className="tab-section-header">
                <div>
                  <h3 className="section-title">Integrations & External Channels</h3>
                  <p className="section-desc">Synchronize with developer platforms, calendar schedulers, and notification alerts.</p>
                </div>
                <span className="section-badge">5 Integrations</span>
              </div>

              <div className="integrations-list-stack">
                
                {/* 1: LinkedIn */}
                <div className="integration-item-card">
                  <div className="integration-left">
                    <div className="integration-icon-box" style={{ background: 'rgba(10, 102, 194, 0.1)', color: '#0a66c2' }}>in</div>
                    <div>
                      <span className="integration-name">LinkedIn Job Matching</span>
                      <span className="integration-desc">Query live roles matching your skills and sync interview applications.</span>
                    </div>
                  </div>
                  <button onClick={() => setLinkedInSync(!linkedInSync)} className="toggle-icon-btn">
                    {linkedInSync ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                {/* 2: GitHub */}
                <div className="integration-item-card">
                  <div className="integration-left">
                    <div className="integration-icon-box" style={{ background: 'rgba(36, 41, 46, 0.1)', color: 'var(--text-primary)' }}>🐙</div>
                    <div>
                      <span className="integration-name">GitHub Repository Indexing</span>
                      <span className="integration-desc">Allow AI scanning of public repos for automated portfolio review suggestions.</span>
                    </div>
                  </div>
                  <button onClick={() => setGithubSync(!githubSync)} className="toggle-icon-btn">
                    {githubSync ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                {/* 3: Google Calendar */}
                <div className="integration-item-card">
                  <div className="integration-left">
                    <div className="integration-icon-box" style={{ background: 'rgba(66, 133, 244, 0.1)', color: '#4285f4' }}>📅</div>
                    <div>
                      <span className="integration-name">Calendar Interview Scheduler</span>
                      <span className="integration-desc">Auto-sync mock interview dates and coding streak goals with Google Calendar.</span>
                    </div>
                  </div>
                  <button onClick={() => setCalendarSync(!calendarSync)} className="toggle-icon-btn">
                    {calendarSync ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                {/* 4: Discord */}
                <div className="integration-item-card">
                  <div className="integration-left">
                    <div className="integration-icon-box" style={{ background: 'rgba(88, 101, 242, 0.1)', color: '#5865f2' }}>💬</div>
                    <div>
                      <span className="integration-name">Discord Webhook Alerts</span>
                      <span className="integration-desc">Push daily challenge streak reminders and leaderboard updates to Discord.</span>
                    </div>
                  </div>
                  <button onClick={() => setDiscordSync(!discordSync)} className="toggle-icon-btn">
                    {discordSync ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

                {/* 5: Email Digest */}
                <div className="integration-item-card">
                  <div className="integration-left">
                    <div className="integration-icon-box" style={{ background: 'rgba(234, 67, 53, 0.1)', color: '#ea4335' }}>✉️</div>
                    <div>
                      <span className="integration-name">Weekly Roadmap Progress Email</span>
                      <span className="integration-desc">Receive curated weekly summary reports, ATS audits, and skill growth insights.</span>
                    </div>
                  </div>
                  <button onClick={() => setEmailAlerts(!emailAlerts)} className="toggle-icon-btn">
                    {emailAlerts ? <ToggleRight size={36} style={{ color: '#2563eb' }} /> : <ToggleLeft size={36} style={{ color: 'var(--text-muted)' }} />}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};

export default Settings;
