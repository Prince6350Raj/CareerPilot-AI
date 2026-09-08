import React, { useState, useEffect } from 'react';
import { Compass, Sparkles, Cpu, Zap, Activity } from 'lucide-react';
import './TechPreloader.css';

const TECH_STEPS = [
  { threshold: 20, message: '⚡ Initializing AI Neural Synapse Engine...' },
  { threshold: 50, message: '🔮 Booting Gemini 3.6 Flash Copilot...' },
  { threshold: 80, message: '🚀 Calibrating AST Sandbox & ATS Scorer...' },
  { threshold: 100, message: '✨ Welcome to CareerPilot AI' }
];

const TechPreloader = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState(TECH_STEPS[0].message);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1400; // 1.4 seconds total animation duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.floor((elapsed / duration) * 100));

      setProgress(currentProgress);

      const matchedStep = TECH_STEPS.find(s => currentProgress <= s.threshold) || TECH_STEPS[TECH_STEPS.length - 1];
      setStatusMsg(matchedStep.message);

      if (currentProgress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            setIsDone(true);
            if (onFinish) onFinish();
          }, 600);
        }, 300);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish]);

  if (isDone) return null;

  return (
    <div className={`tech-preloader-backdrop ${isFadingOut ? 'fade-out' : ''}`}>
      {/* Background Animated Tech Mesh & Glow Orbs */}
      <div className="tp-grid-bg" />
      <div className="tp-glow-orb-1" />
      <div className="tp-glow-orb-2" />
      <div className="tp-scan-laser" />

      {/* Central Glass Card */}
      <div className="tp-center-box">
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
      </div>
    </div>
  );
};

export default TechPreloader;
