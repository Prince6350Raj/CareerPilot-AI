import React, { useState, useEffect, useRef } from 'react';
import { Compass, Sparkles, Cpu, Zap, Activity, X, ArrowRight, Play, Pause, RotateCcw } from 'lucide-react';
import './TechPreloader.css';

const TECH_STEPS = [
  { threshold: 20, message: '⚡ Initializing AI Neural Synapse Engine...' },
  { threshold: 50, message: '🔮 Booting Gemini 3.6 Flash Copilot...' },
  { threshold: 80, message: '🚀 Calibrating AST Sandbox & ATS Scorer...' },
  { threshold: 100, message: '✨ System Ready • CareerPilot AI' }
];

const TechPreloader = ({ onFinish }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState(TECH_STEPS[0].message);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [theme, setTheme] = useState(
    () => document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'whiteblue'
  );
  const isPausedRef = useRef(false);

  // Sync theme in real-time with document attribute or storage
  useEffect(() => {
    const updateCurrentTheme = () => {
      const current = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'whiteblue';
      setTheme(current);
    };

    updateCurrentTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateCurrentTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    const handleStorage = () => updateCurrentTheme();
    window.addEventListener('storage', handleStorage);

    return () => {
      observer.disconnect();
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Function to start or restart preloader diagnostics
  const startDiagnostics = () => {
    // Refresh theme on launch
    const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'whiteblue';
    setTheme(currentTheme);

    setIsOpen(true);
    setIsFadingOut(false);
    setProgress(0);
    setStatusMsg(TECH_STEPS[0].message);

    const startTime = Date.now();
    const duration = 1800; // 1.8s smooth diagnostic sweep

    const interval = setInterval(() => {
      if (isPausedRef.current) return;

      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(currentProgress);

      const matchedStep = TECH_STEPS.find(s => currentProgress <= s.threshold) || TECH_STEPS[TECH_STEPS.length - 1];
      setStatusMsg(matchedStep.message);

      if (currentProgress >= 100) {
        clearInterval(interval);
      }
    }, 25);
  };

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    startDiagnostics();

    // Listen for global trigger events anywhere in the app (e.g., from mentor demo button)
    const handleTrigger = () => {
      setIsPaused(false);
      startDiagnostics();
    };

    window.addEventListener('show-tech-preloader', handleTrigger);
    return () => window.removeEventListener('show-tech-preloader', handleTrigger);
  }, []);

  const handleDismiss = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      setIsOpen(false);
      if (onFinish) onFinish();
    }, 500);
  };

  const handleTogglePause = () => {
    setIsPaused(!isPaused);
  };

  const handleReplay = () => {
    setIsPaused(false);
    startDiagnostics();
  };

  if (!isOpen) return null;

  return (
    <div className={`tech-preloader-backdrop ${isFadingOut ? 'fade-out' : ''}`} data-theme={theme}>
      {/* Background Animated Tech Mesh & Glow Orbs */}
      <div className="tp-grid-bg" />
      <div className="tp-glow-orb-1" />
      <div className="tp-glow-orb-2" />

      {/* Central Glass Card */}
      <div className="tp-center-box">
        {/* Top Controls for Mentor Inspection */}
        <div className="tp-top-controls">
          <span className="tp-mentor-tag">Mentor Demo Mode</span>
          <button 
            type="button" 
            className="tp-btn-close" 
            onClick={handleDismiss} 
            title="Dismiss Diagnostics"
          >
            <X size={16} />
          </button>
        </div>

        {/* HUD 4-Corner Targeting Brackets */}
        <div className="tp-corners">
          <span />
          <span />
          <span />
          <span />
        </div>

        {/* Orbit Rings & Glowing Center Logo */}
        <div className="tp-orbit-wrapper">
          <div className="tp-ring-outer" />
          <div className="tp-ring-inner" />
          <div className="tp-logo-center">
            <Compass size={28} style={{ transform: 'rotate(45deg)' }} />
          </div>
        </div>

        {/* Brand Name Title */}
        <div className="tp-title-row">
          <span className="tp-brand-name">CareerPilot</span>
          <span className="tp-brand-ai">AI</span>
        </div>

        {/* Dynamic Status message */}
        <p className="tp-status-msg">{statusMsg}</p>

        {/* Progress bar */}
        <div className="tp-progress-box">
          <div className="tp-progress-bar-track">
            <div 
              className="tp-progress-bar-fill" 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <div className="tp-percent-row">
            <span>System Diagnostics</span>
            <span className="tp-percent-num">{progress}%</span>
          </div>
        </div>

        {/* Tech status pills */}
        <div className="tp-pills-row">
          <div className="tp-pill">
            <span className="tp-pill-dot" />
            <span>Gemini 3.6 Flash</span>
          </div>
          <div className="tp-pill">
            <span className="tp-pill-dot" style={{ background: '#38bdf8', boxShadow: '0 0 8px #38bdf8' }} />
            <span>0ms AST Sandbox</span>
          </div>
          <div className="tp-pill">
            <span className="tp-pill-dot" style={{ background: '#f97316', boxShadow: '0 0 8px #f97316' }} />
            <span>96% ATS Matrix</span>
          </div>
        </div>

        {/* Interactive Actions for User / Mentor */}
        <div className="tp-actions-row">
          <button 
            type="button" 
            className="tp-btn-primary"
            onClick={handleDismiss}
          >
            <span>Explore Workspace</span>
            <ArrowRight size={15} />
          </button>
          <button 
            type="button" 
            className="tp-btn-secondary"
            onClick={handleReplay}
            title="Replay Animation"
          >
            <RotateCcw size={14} />
            <span>Replay</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TechPreloader;
