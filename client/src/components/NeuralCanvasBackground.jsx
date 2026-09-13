import React, { useEffect, useRef } from 'react';
import './NeuralCanvasBackground.css';

const THEME_PRESETS = {
  'blue-mobile': { 
    isDark: true,
    nodeRGB: '56, 189, 248', 
    lineRGB: '37, 99, 235', 
    mouseRGB: '249, 115, 22',
    baseAlpha: 0.85,
    lineAlpha: 0.55,
    glowAlpha: 0.95
  },
  'white-bg': { 
    isDark: false,
    nodeRGB: '37, 99, 235', 
    lineRGB: '96, 165, 250', 
    mouseRGB: '2, 132, 199',
    baseAlpha: 0.65,
    lineAlpha: 0.50,
    glowAlpha: 0.85
  },
  'blue-orange': { 
    isDark: true,
    nodeRGB: '249, 115, 22', 
    lineRGB: '249, 115, 22', 
    mouseRGB: '56, 189, 248',
    baseAlpha: 0.8,
    lineAlpha: 0.5,
    glowAlpha: 0.95
  },
  whiteblue: { 
    isDark: false,
    nodeRGB: '2, 132, 199', 
    lineRGB: '2, 132, 199', 
    mouseRGB: '37, 99, 235',
    baseAlpha: 0.65,
    lineAlpha: 0.55,
    glowAlpha: 0.85
  },
  dark: { 
    isDark: true,
    nodeRGB: '168, 85, 247', 
    lineRGB: '129, 140, 248', 
    mouseRGB: '192, 132, 252',
    baseAlpha: 0.7,
    lineAlpha: 0.45,
    glowAlpha: 0.9
  },
  light: { 
    isDark: false,
    nodeRGB: '99, 102, 241', 
    lineRGB: '79, 70, 229', 
    mouseRGB: '99, 102, 241',
    baseAlpha: 0.65,
    lineAlpha: 0.55,
    glowAlpha: 0.85
  },
  cyberpunk: { 
    isDark: true,
    nodeRGB: '234, 179, 8', 
    lineRGB: '234, 179, 8', 
    mouseRGB: '250, 204, 21',
    baseAlpha: 0.8,
    lineAlpha: 0.5,
    glowAlpha: 0.95
  },
  emerald: { 
    isDark: true,
    nodeRGB: '16, 185, 129', 
    lineRGB: '52, 211, 153', 
    mouseRGB: '16, 185, 129',
    baseAlpha: 0.75,
    lineAlpha: 0.45,
    glowAlpha: 0.9
  },
  sakura: { 
    isDark: false,
    nodeRGB: '219, 39, 119', 
    lineRGB: '236, 72, 153', 
    mouseRGB: '190, 24, 93',
    baseAlpha: 0.65,
    lineAlpha: 0.55,
    glowAlpha: 0.85
  },
  ocean: { 
    isDark: false,
    nodeRGB: '2, 132, 199', 
    lineRGB: '14, 165, 233', 
    mouseRGB: '3, 105, 161',
    baseAlpha: 0.65,
    lineAlpha: 0.55,
    glowAlpha: 0.85
  },
  goldlight: { 
    isDark: false,
    nodeRGB: '217, 119, 6', 
    lineRGB: '180, 83, 9', 
    mouseRGB: '217, 119, 6',
    baseAlpha: 0.7,
    lineAlpha: 0.55,
    glowAlpha: 0.9
  },
  redlight: { 
    isDark: false,
    nodeRGB: '220, 38, 38', 
    lineRGB: '239, 68, 68', 
    mouseRGB: '185, 28, 28',
    baseAlpha: 0.7,
    lineAlpha: 0.55,
    glowAlpha: 0.9
  },
  orangelight: { 
    isDark: false,
    nodeRGB: '234, 88, 12', 
    lineRGB: '249, 115, 22', 
    mouseRGB: '194, 65, 12',
    baseAlpha: 0.7,
    lineAlpha: 0.55,
    glowAlpha: 0.9
  },
  greenlight: { 
    isDark: false,
    nodeRGB: '22, 163, 74', 
    lineRGB: '34, 197, 94', 
    mouseRGB: '21, 128, 61',
    baseAlpha: 0.7,
    lineAlpha: 0.55,
    glowAlpha: 0.9
  },
  skyblue: { 
    isDark: false,
    nodeRGB: '2, 132, 199', 
    lineRGB: '14, 165, 233', 
    mouseRGB: '3, 105, 161',
    baseAlpha: 0.65,
    lineAlpha: 0.55,
    glowAlpha: 0.85
  }
};

const NeuralCanvasBackground = ({ theme = 'whiteblue' }) => {
  const canvasRef = useRef(null);

  const preset = THEME_PRESETS[theme] || THEME_PRESETS.whiteblue;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Mouse interactive coordinates
    const mouse = { x: null, y: null, radius: 170 };
    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    // Generates crisp, well-distributed tech particles
    const particleCount = Math.min(Math.floor((width * height) / 22000), 55);
    const particles = [];

    class SynapseParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.55;
        this.vy = (Math.random() - 0.5) * 0.55;
        this.radius = Math.random() * 2.2 + 1.6;
        this.pulse = Math.random() * Math.PI;
        this.pulseSpeed = 0.02 + Math.random() * 0.02;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulse += this.pulseSpeed;

        // Bounce gently from edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse attraction / deflection interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const force = (mouse.radius - dist) / mouse.radius;
            this.x -= (dx / dist) * force * 1.5;
            this.y -= (dy / dist) * force * 1.5;
          }
        }
      }

      draw() {
        const pulseFactor = (Math.sin(this.pulse) + 1) / 2; // 0 to 1
        const alpha = preset.baseAlpha + pulseFactor * 0.25;

        // Outer ambient halo
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${preset.nodeRGB}, ${alpha * 0.25})`;
        ctx.fill();

        // Vibrant solid inner core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${preset.nodeRGB}, ${alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new SynapseParticle());
    }

    const connectParticles = () => {
      const maxDistance = 165;
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const proximity = 1 - dist / maxDistance;
            const lineOpacity = proximity * preset.lineAlpha;

            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.strokeStyle = `rgba(${preset.lineRGB}, ${lineOpacity})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }

        // Active connection lasers to mouse cursor
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particles[a].x - mouse.x;
          const dy = particles[a].y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            const proximity = 1 - dist / mouse.radius;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${preset.mouseRGB}, ${proximity * 0.75})`;
            ctx.lineWidth = 1.4;
            ctx.stroke();
          }
        }
      }

      // Draw subtle glowing mouse cursor focus ring
      if (mouse.x !== null && mouse.y !== null) {
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${preset.mouseRGB}, 0.6)`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${preset.mouseRGB}, 0.8)`;
        ctx.fill();
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      connectParticles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <div className="auth-background-neural-wrapper">
      <canvas ref={canvasRef} className="neural-canvas-layer" />
      <div className="grid-blueprint-overlay" />
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>
    </div>
  );
};

export default NeuralCanvasBackground;
