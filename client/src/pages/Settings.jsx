import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Type, Palette, Monitor, HelpCircle, Save, RotateCcw } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  // Read initial states from localStorage
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [fontFamily, setFontFamily] = useState(localStorage.getItem('app-font-family') || "'Plus Jakarta Sans', sans-serif");
  const [fontSize, setFontSize] = useState(parseInt(localStorage.getItem('app-font-size') || '15'));
  const [isBold, setIsBold] = useState(localStorage.getItem('app-font-weight') === 'bold');
  const [isItalic, setIsItalic] = useState(localStorage.getItem('app-font-style') === 'italic');
  const [bgType, setBgType] = useState(localStorage.getItem('app-bg-type') || 'dynamic'); // dynamic, flat, grid
  const [activeTab, setActiveTab] = useState('common'); // common, theme, font

  // Real-time styles apply
  useEffect(() => {
    // Sync theme
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    // Sync typography
    document.documentElement.style.setProperty('--app-font-body', fontFamily);
    localStorage.setItem('app-font-family', fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    // Sync size
    document.documentElement.style.setProperty('--app-font-size', `${fontSize}px`);
    localStorage.setItem('app-font-size', `${fontSize}px`);
  }, [fontSize]);

  useEffect(() => {
    // Sync weight
    const val = isBold ? 'bold' : 'normal';
    document.documentElement.style.setProperty('--app-font-weight', val);
    localStorage.setItem('app-font-weight', val);
  }, [isBold]);

  useEffect(() => {
    // Sync italic
    const val = isItalic ? 'italic' : 'normal';
    document.documentElement.style.setProperty('--app-font-style', val);
    localStorage.setItem('app-font-style', val);
  }, [isItalic]);

  useEffect(() => {
    // Sync background overlays
    document.documentElement.classList.toggle('flat-bg', bgType === 'flat');
    document.documentElement.classList.toggle('grid-bg', bgType === 'grid');
    localStorage.setItem('app-bg-type', bgType);
  }, [bgType]);

  const resetToDefaults = () => {
    setTheme('light');
    setFontFamily("'Plus Jakarta Sans', sans-serif");
    setFontSize(15);
    setIsBold(false);
    setIsItalic(false);
    setBgType('dynamic');
  };

  const themeList = [
    { id: 'dark', name: 'Space Blue', color: '#4f46e5', desc: 'Deep galactic space blue interface' },
    { id: 'light', name: 'Frosted Glass', color: '#94a3b8', desc: 'Vibrant clean white-blue frosted view' },
    { id: 'cyberpunk', name: 'Cyberpunk Gold', color: '#eab308', desc: 'Neon yellow-gold developer terminal theme' },
    { id: 'emerald', name: 'Emerald Forest', color: '#10b981', desc: 'Dark emerald green palette' },
    { id: 'sakura', name: 'Frosted Slate', color: '#ec4899', desc: 'Soft pastel slate-pink backdrop' },
    { id: 'ocean', name: 'Ocean Blue', color: '#0891b2', desc: 'Turquoise ocean blue theme' },
    { id: 'goldlight', name: 'Golden Pastel', color: '#f59e0b', desc: 'Bright gold & cream pastel scheme' }
  ];

  return (
    <div className="settings-page-wrapper container animate-fade-in">
      <div className="settings-header-card glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="settings-logo-box">
            <SettingsIcon size={24} className="settings-icon-spin" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>System Settings Control</h2>
            <p style={{ margin: '0.15rem 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>Configure your workspace themes, typography preferences, and backdrop styles.</p>
          </div>
        </div>
        <button className="btn btn-secondary reset-btn" onClick={resetToDefaults} style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', gap: '0.25rem', height: 'auto', minHeight: 'auto' }}>
          <RotateCcw size={12} /> Reset System
        </button>
      </div>

      <div className="settings-content-grid" style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Left Settings Navigation */}
        <div className="settings-sidebar glass-card" style={{ flex: 0.35, display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.5rem', alignSelf: 'flex-start' }}>
          <button className={`settings-tab-btn ${activeTab === 'common' ? 'active' : ''}`} onClick={() => setActiveTab('common')}>
            <Monitor size={16} /> Common Preferences
          </button>
          <button className={`settings-tab-btn ${activeTab === 'theme' ? 'active' : ''}`} onClick={() => setActiveTab('theme')}>
            <Palette size={16} /> Themes & Appearance
          </button>
          <button className={`settings-tab-btn ${activeTab === 'font' ? 'active' : ''}`} onClick={() => setActiveTab('font')}>
            <Type size={16} /> Font & Typography
          </button>
        </div>

        {/* Right Settings Form Area */}
        <div className="settings-form-area glass-card" style={{ flex: 0.65, padding: '1.5rem 2rem' }}>
          {activeTab === 'common' && (
            <div className="settings-tab-content animate-fade-in">
              <h3 className="section-title">Common Preferences</h3>
              <p className="section-desc">Manage core app characteristics and background overrides.</p>
              
              <div className="form-group-item">
                <label className="settings-label">Background Style Option</label>
                <p className="input-tip-text">Set distraction-free solid color or modern cyber mesh grid overlays.</p>
                <select value={bgType} onChange={(e) => setBgType(e.target.value)} className="settings-form-control">
                  <option value="dynamic">🌈 Dynamic Gradient (Default)</option>
                  <option value="flat">⬛ Flat Contrast (Solid color, no gradient glows)</option>
                  <option value="grid">🕸️ Blueprint Cyber Grid (Retro layout grid)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'theme' && (
            <div className="settings-tab-content animate-fade-in">
              <h3 className="section-title">Themes & Presets</h3>
              <p className="section-desc">Select a preset to customize the look and feel of the dashboard.</p>
              
              <div className="theme-grid-selector" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginTop: '1.25rem' }}>
                {themeList.map((t) => {
                  const isActive = theme === t.id;
                  return (
                    <div 
                      key={t.id} 
                      className={`theme-card-selection ${isActive ? 'active' : ''}`} 
                      onClick={() => setTheme(t.id)}
                      style={{
                        padding: '1rem',
                        background: 'var(--bg-item)',
                        border: `1.5px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        transition: 'var(--transition-smooth)'
                      }}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: t.color, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }}></div>
                      <div>
                        <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.88rem', fontWeight: 800, color: 'var(--text-primary)' }}>{t.name}</h4>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{t.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'font' && (
            <div className="settings-tab-content animate-fade-in">
              <h3 className="section-title">Font & Typography</h3>
              <p className="section-desc">Configure dashboard font weights, sizing parameters, and styles.</p>

              <div className="form-group-item">
                <label className="settings-label">Font Family</label>
                <select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)} className="settings-form-control">
                  <option value="'Plus Jakarta Sans', sans-serif">Plus Jakarta Sans (Sans-Serif Modern)</option>
                  <option value="'JetBrains Mono', 'Fira Code', monospace">JetBrains Mono (Monospace Developer)</option>
                  <option value="Georgia, serif">Georgia (Classic Serif)</option>
                  <option value="'Roboto Slab', serif">Roboto Slab (Clean Slab-Serif)</option>
                </select>
              </div>

              <div className="form-group-item">
                <label className="settings-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Font Size</span>
                  <span style={{ color: 'var(--primary)', fontWeight: 800 }}>{fontSize}px</span>
                </label>
                <input 
                  type="range" 
                  min="12" 
                  max="22" 
                  value={fontSize} 
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className="settings-range-slider"
                />
              </div>

              <div className="checkbox-options-row" style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
                <label className="settings-checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={isBold} onChange={(e) => setIsBold(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span><b>Bold Weight</b></span>
                </label>
                <label className="settings-checkbox-container" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                  <input type="checkbox" checked={isItalic} onChange={(e) => setIsItalic(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer' }} />
                  <span><i>Italic Style</i></span>
                </label>
              </div>

              {/* Live Preview Panel */}
              <div className="live-preview-box" style={{
                marginTop: '2rem',
                border: '1px dashed var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                background: 'rgba(0,0,0,0.1)'
              }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>Live Typography Preview</span>
                <div style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  fontWeight: isBold ? 'bold' : 'normal',
                  fontStyle: isItalic ? 'italic' : 'normal'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.25em' }}>CareerPilot AI Sandbox</h4>
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Welcome to your customized AI workspace! The typography styles you select in this settings dashboard will be rendered instantly in real-time across all components.</p>
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
