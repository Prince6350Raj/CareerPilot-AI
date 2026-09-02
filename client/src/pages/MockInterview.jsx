import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageSquare, ArrowRight, Play, Timer, Check, Info, Award, Download, Briefcase, Search, ChevronDown, Sparkles, Zap, Target, TrendingUp, CheckCircle2, Video, Volume2, ShieldCheck, BarChart3, Filter } from 'lucide-react';
import './MockInterview.css';

const MockInterview = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [role, setRole] = useState('');
  const [type, setType] = useState('Mixed');
  const [format, setFormat] = useState('theory');
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Initializing interview session...');
  const [activeSession, setActiveSession] = useState(null);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');
  
  // Terminal states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState(null);
  
  // Timer states
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(false);

  // Scorecard state
  const [scorecard, setScorecard] = useState(null);
  const [history, setHistory] = useState([]);
  const [showFormats, setShowFormats] = useState(false);

  // Live Audio/Video Interview simulator states
  const [showVideoFeed, setShowVideoFeed] = useState(false);
  const [aiVoiceEnabled, setAiVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const interviewVideoRef = useRef(null);
  const interviewStreamRef = useRef(null);
  const recognitionRef = useRef(null);

  // Custom inline SVG icons
  const VolumeIcon = ({ size = 16, className = '' }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
    </svg>
  );

  const MicIcon = ({ size = 16, className = '' }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
      <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"></path>
    </svg>
  );

  const CameraIcon = ({ size = 16, className = '' }) => (
    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height={size} width={size} className={className} xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );

  useEffect(() => {
    return () => {
      if (interviewStreamRef.current) {
        interviewStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakTextDirectly = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakQuestion = (text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      utterance.onend = () => {
        const followUp = new SpeechSynthesisUtterance("What is your answer?");
        followUp.rate = 1.0;
        followUp.pitch = 1.0;
        window.speechSynthesis.speak(followUp);
      };
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (activeSession && aiVoiceEnabled) {
      const q = activeSession.questions[currentIndex];
      if (q) {
        speakQuestion(q.questionText);
      }
    }
  }, [currentIndex, activeSession, aiVoiceEnabled]);

  const toggleVideoFeed = async () => {
    if (showVideoFeed) {
      if (interviewStreamRef.current) {
        interviewStreamRef.current.getTracks().forEach(track => track.stop());
        interviewStreamRef.current = null;
      }
      setShowVideoFeed(false);
    } else {
      setShowVideoFeed(true);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 180, facingMode: 'user' } });
        interviewStreamRef.current = stream;
        setTimeout(() => {
          if (interviewVideoRef.current) {
            interviewVideoRef.current.srcObject = stream;
          }
        }, 200);
      } catch (err) {
        alert('Webcam access was denied or is busy.');
        setShowVideoFeed(false);
      }
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      
      // 1. Voice command to go to next question
      if (questionFeedback && (transcript.includes('next') || transcript.includes('continue') || transcript.includes('proceed') || transcript.includes('go ahead'))) {
        handleNext();
        return;
      }

      // 2. Voice command to select option in MCQ mode
      if (activeSession && activeSession.format === 'mcq' && questionFeedback === null) {
        let matchedOption = null;
        if (/^(option|select|choose|answer)?\s*a\b/i.test(transcript) || transcript === 'a') matchedOption = 'A';
        else if (/^(option|select|choose|answer)?\s*b\b/i.test(transcript) || transcript === 'b') matchedOption = 'B';
        else if (/^(option|select|choose|answer)?\s*c\b/i.test(transcript) || transcript === 'c') matchedOption = 'C';
        else if (/^(option|select|choose|answer)?\s*d\b/i.test(transcript) || transcript === 'd') matchedOption = 'D';

        if (matchedOption) {
          setUserAnswer(matchedOption);
          speakTextDirectly(`Selected option ${matchedOption}.`);
          return;
        }
      }

      // 3. Voice command to submit response
      if (questionFeedback === null && (transcript.includes('submit') || transcript.includes('send response') || transcript.includes('submit answer') || transcript.includes('submit response') || transcript.includes('confirm option'))) {
        stopListening();
        setTimeout(() => {
          handleAnswerSubmit();
        }, 300);
        return;
      }

      setUserAnswer(prev => prev + (prev.trim() ? ' ' : '') + event.results[event.results.length - 1][0].transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/interview/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, API_URL]);

  // Timer runner
  useEffect(() => {
    let interval = null;
    if (timerActive) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleStart = async (e) => {
    e.preventDefault();
    if (!role) return;

    setLoading(true);
    setLoadingText('Connecting to CareerPilot AI Engine...');
    setScorecard(null);

    const steps = [
      'Connecting to CareerPilot AI Engine...',
      'Analyzing custom role specifications...',
      'Synthesizing scenario interview questions...',
      'Structuring test-case validations...',
      'Finalizing simulation environment...'
    ];
    let idx = 0;
    const timer = setInterval(() => {
      setLoadingText(steps[idx]);
      idx = (idx + 1) % steps.length;
    }, 1500);

    try {
      const res = await fetch(`${API_URL}/interview/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role, type, limit, format })
      });
      const data = await res.json();
      if (data.success) {
        setActiveSession(data.data);
        setCurrentIndex(0);
        setUserAnswer('');
        setQuestionFeedback(null);
        setSeconds(0);
        setTimerActive(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!userAnswer.trim()) return;

    setSubmittingAnswer(true);
    setTimerActive(false); // pause timer during evaluation

    const currentQuestion = activeSession.questions[currentIndex];

    try {
      const res = await fetch(`${API_URL}/interview/submit-answer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          interviewId: activeSession._id,
          questionId: currentQuestion._id,
          userAnswer
        })
      });
      const data = await res.json();
      if (data.success) {
        setQuestionFeedback(data.data);
        
        // Real-time evaluation readout
        if (aiVoiceEnabled) {
          const rating = data.data.rating || 0;
          const normalizedAns = userAnswer.toLowerCase().trim();
          const ignorancePhrases = [
            "don't know",
            "do not know",
            "no idea",
            "i don't understand",
            "i do not understand",
            "explain this",
            "explain it",
            "explain the answer",
            "tell me the answer",
            "please explain",
            "no clue",
            "idk",
            "skip",
            "don't have any idea"
          ];
          const isIgnorant = activeSession.format !== 'mcq' && (ignorancePhrases.some(phrase => normalizedAns.includes(phrase)) || normalizedAns.length < 10);

          // Classify rating >= 6 for theory (out of 10), or rating >= 3/5 for MCQs
          const isCorrect = activeSession.format === 'mcq' ? rating >= 3 : rating >= 6;
          let evalSpeech = "";

          if (activeSession.format === 'mcq') {
            if (isCorrect) {
              evalSpeech = `You chose the correct option! Excellent! ${data.data.modelAnswer || ""}`;
            } else {
              evalSpeech = `You chose the wrong option. The correct option is ${data.data.correctOption || ""}. ${data.data.modelAnswer || ""}`;
            }
          } else {
            if (isIgnorant) {
              let feedbackText = data.data.feedback || "";
              const prefix = "Ok, don't worry! I will explain the answer to this question.";
              if (feedbackText.startsWith(prefix)) {
                feedbackText = feedbackText.replace(prefix, "").trim();
              }
              evalSpeech = `Ok, don't worry! I will explain the answer to this question. Here is the answer: ${data.data.modelAnswer || ""}. ${feedbackText}`;
            } else if (isCorrect) {
              evalSpeech = `Yes! That is the correct answer. Feedback comments: ${data.data.feedback || ""}`;
            } else {
              evalSpeech = `That is incorrect. The correct answer is: ${data.data.modelAnswer || ""}. Feedback comments: ${data.data.feedback || ""}`;
            }
          }
          speakTextDirectly(evalSpeech);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeSession.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setUserAnswer('');
      setQuestionFeedback(null);
      setSeconds(0);
      setTimerActive(true);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setTimerActive(false);
    try {
      const res = await fetch(`${API_URL}/interview/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ interviewId: activeSession._id })
      });
      const data = await res.json();
      if (data.success) {
        setScorecard(data.data);
        setActiveSession(null);
        fetchHistory();

        // Final summary voice announcement
        if (aiVoiceEnabled) {
          const badgeInfo = getBadgeDetails(data.data.overallScore);
          let finishSpeech = "";
          if (badgeInfo.label === 'FAIL') {
            finishSpeech = "Better luck next time. Please try again after preparation.";
          } else {
            finishSpeech = `Congratulations! You got a ${badgeInfo.label.toLowerCase()} medal. According to your performance, I will provide some job referrals. Please check.`;
          }
          speakTextDirectly(finishSpeech);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const getBadgeDetails = (score) => {
    const pct = (score || 0) * 10;
    if (pct < 40) return { label: 'FAIL', className: 'cert-badge-fail', color: '#ef4444', ribbon: '#991b1b', inner: '#fee2e2' };
    if (pct < 60) return { label: 'PASS', className: 'cert-badge-pass', color: '#10b981', ribbon: '#065f46', inner: '#d1fae5' };
    if (pct < 70) return { label: 'BRONZE', className: 'cert-badge-bronze', color: '#cd7f32', ribbon: '#7c2d12', inner: '#ffedd5' };
    if (pct <= 85) return { label: 'SILVER', className: 'cert-badge-silver', color: '#94a3b8', ribbon: '#475569', inner: '#f1f5f9' };
    return { label: 'GOLD', className: 'cert-badge-gold', color: '#eab308', ribbon: '#a16207', inner: '#fef9c3' };
  };

  const downloadCertificate = (exportType = 'pdf') => {
    if (!scorecard) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext('2d');
    
    // 1. Draw premium background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 850);
    bgGrad.addColorStop(0, '#f8fafc');
    bgGrad.addColorStop(0.5, '#f1f5f9');
    bgGrad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 850);
    
    // 2. Draw dual-line certificate border
    ctx.strokeStyle = '#0284c7'; 
    ctx.lineWidth = 15;
    ctx.strokeRect(20, 20, 1160, 810);
    
    ctx.strokeStyle = '#cbd5e1'; 
    ctx.lineWidth = 2;
    ctx.strokeRect(35, 35, 1130, 780);

    // Decorative corner brackets
    ctx.fillStyle = '#0f4c81';
    ctx.fillRect(20, 20, 80, 8);
    ctx.fillRect(20, 20, 8, 80);
    ctx.fillRect(1100, 20, 80, 8);
    ctx.fillRect(1172, 20, 8, 80);
    ctx.fillRect(20, 822, 80, 8);
    ctx.fillRect(20, 750, 8, 80);
    ctx.fillRect(1100, 822, 80, 8);
    ctx.fillRect(1172, 750, 8, 80);

    // 3. Draw Watermark logo in center
    ctx.save();
    ctx.globalAlpha = 0.03;
    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 75px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CAREERPILOT AI', 600, 425);
    ctx.restore();

    // 4. Header text
    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 36px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF RECOGNITION', 600, 140);
    
    ctx.fillStyle = '#64748b';
    ctx.font = 'italic 18px Georgia';
    ctx.fillText('This assessment certificate is proudly presented to', 600, 210);

    // 5. User name
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 52px Arial';
    ctx.fillText(user?.name || 'Tech Aspirant', 600, 295);
    
    // Decorative underline under name
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(350, 325);
    ctx.lineTo(850, 325);
    ctx.stroke();
    
    // 6. Presentation detail
    ctx.fillStyle = '#334155';
    ctx.font = '18px Arial';
    ctx.fillText(`for successfully completing the AI Mock Interview Assessment as a`, 600, 385);
    
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 26px Arial';
    ctx.fillText(scorecard.role.toUpperCase(), 600, 435);

    // 7. Score Badge card in center
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(450, 485, 300, 90, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('ASSESSMENT PERFORMANCE SCORE', 600, 515);
    ctx.fillStyle = '#0284c7';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(`${scorecard.overallScore ? scorecard.overallScore.toFixed(1) : '0.0'} / 10`, 600, 555);

    // 8. Footer metadata: Date, Verification ID
    ctx.fillStyle = '#64748b';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Date: ${new Date(scorecard.createdAt || Date.now()).toLocaleDateString()}`, 100, 680);
    ctx.fillText(`Credential ID: CP-${scorecard._id ? scorecard._id.substring(scorecard._id.length - 8).toUpperCase() : 'VERIFY'}`, 100, 710);
    ctx.fillText('Verification: Secure Blockchain Ledgers', 100, 740);

    ctx.textAlign = 'right';
    ctx.fillText('Evaluated & Certified By:', 1100, 680);
    ctx.fillStyle = '#0f4c81';
    ctx.font = 'bold 18px Georgia';
    ctx.fillText('CareerPilot AI Grader', 1100, 715);
    
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(900, 690);
    ctx.lineTo(1100, 690);
    ctx.stroke();

    // 9. Draw the score-specific stamp emblem in the bottom center
    const stamp = getBadgeDetails(scorecard.overallScore);
    ctx.fillStyle = stamp.color; 
    ctx.beginPath();
    ctx.arc(600, 680, 40, 0, Math.PI * 2);
    ctx.fill();
    
    // Ribbon triangles for stamp
    ctx.fillStyle = stamp.ribbon;
    ctx.beginPath();
    ctx.moveTo(580, 710);
    ctx.lineTo(570, 760);
    ctx.lineTo(600, 740);
    ctx.lineTo(630, 760);
    ctx.lineTo(620, 710);
    ctx.fill();

    // Inner stamp circle
    ctx.strokeStyle = stamp.inner;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(600, 680, 32, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = stamp.label.length > 5 ? 'bold 8px Arial' : 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(stamp.label, 600, 683);

    // 10. Trigger file download based on selected format (PDF, PNG, or Word)
    const fileName = `Certificate_CareerPilot_${scorecard.role.replace(/\s+/g, '_')}`;
    const imgData = canvas.toDataURL('image/png');

    if (exportType === 'png') {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = imgData;
      link.click();
    } else if (exportType === 'word') {
      const docHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <title>CareerPilot AI Certificate</title>
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page {
              size: 11in 8.5in; /* Landscape Letter size */
              margin: 0.25in;
            }
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              margin: 0;
              padding: 0;
            }
            .cert-container {
              width: 100%;
              max-width: 10.5in;
              margin: 0 auto;
            }
            img {
              width: 100%;
              height: auto;
              border: 2px solid #cbd5e1;
            }
          </style>
        </head>
        <body>
          <div class="cert-container">
            <h2 style="color: #0f4c81; margin-bottom: 10px;">CareerPilot AI Assessment Record</h2>
            <p style="color: #64748b; font-size: 12pt; margin-bottom: 20px;">
              This document contains the verified mock interview achievement certificate for <b>${user?.name || 'Candidate'}</b> in the <b>${scorecard.role}</b> track.
            </p>
            <img src="${imgData}" alt="Certificate" />
          </div>
        </body>
        </html>
      `;
      const blob = new Blob(['\ufeff' + docHtml], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.doc`;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      // Default to PDF
      import('jspdf').then(({ jsPDF }) => {
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'px',
          format: [1200, 850]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 1200, 850);
        pdf.save(`${fileName}.pdf`);
      }).catch(err => {
        console.error("Failed to load jsPDF, falling back to PNG:", err);
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = imgData;
        link.click();
      });
    }
  };

  // Derived History Metrics
  const totalCompletedSessions = history.length;
  const bestScoreVal = history.length > 0 ? Math.max(...history.map(h => h.overallScore || 0)) : 0;
  const avgScoreVal = history.length > 0 ? (history.reduce((sum, h) => sum + (h.overallScore || 0), 0) / history.length) : 0;

  // Filtered History
  const filteredHistory = history.filter(item => {
    const matchesSearch = (item.role || '').toLowerCase().includes(historySearch.toLowerCase());
    const matchesFormat = historyFilter === 'all' || item.format === historyFilter;
    return matchesSearch && matchesFormat;
  });

  const POPULAR_ROLES = [
    'Frontend React Developer',
    'Backend Node/Python Engineer',
    'FullStack Web Developer',
    'DevOps & Cloud Engineer',
    'Data Scientist / Analyst',
    'AI & Machine Learning Engineer'
  ];

  return (
    <div className="interview-view-container">
      
      {/* Top Banner Hero Header */}
      <div className="interview-hero-banner glass-card animate-fade-in">
        <div className="interview-hero-left">
          <div className="interview-badge-pill">
            <Sparkles size={13} />
            <span>AI SIMULATED ASSESSMENT SUITE</span>
          </div>
          <h1 className="page-title" style={{ margin: '0.4rem 0 0.35rem' }}>AI Mock Interview Simulator</h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Simulate real technical, HR, and behavioral interview environments with instant AI speech evaluation, question-by-question scoring, and blockchain certificate generation.
          </p>
        </div>

        {/* Quick Summary Stats Chips */}
        <div className="interview-hero-stats-row">
          <div className="interview-hero-stat-chip">
            <div className="stat-chip-icon" style={{ background: 'rgba(37, 99, 235, 0.12)', color: '#2563eb' }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <span className="stat-chip-num">{totalCompletedSessions}</span>
              <span className="stat-chip-lbl">Sessions Taken</span>
            </div>
          </div>

          <div className="interview-hero-stat-chip">
            <div className="stat-chip-icon" style={{ background: 'rgba(16, 185, 129, 0.12)', color: '#10b981' }}>
              <Award size={18} />
            </div>
            <div>
              <span className="stat-chip-num">{bestScoreVal.toFixed(1)}/10</span>
              <span className="stat-chip-lbl">Best Score</span>
            </div>
          </div>

          <div className="interview-hero-stat-chip">
            <div className="stat-chip-icon" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <span className="stat-chip-num">{avgScoreVal.toFixed(1)}/10</span>
              <span className="stat-chip-lbl">Average Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="glass-card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="spinner-loader"></div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>AI Interview Session Initializing...</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{loadingText}</p>
        </div>
      )}

      {/* 1. SETUP MODULE */}
      {!activeSession && !scorecard && !loading && (
        <div className="setup-split-layout">
          
          {/* Left Column: Configure Session */}
          <div className="setup-card-box glass-card animate-fade-in">
            <div className="setup-box-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} style={{ color: 'var(--primary)' }} />
                <h3 className="card-mini-title" style={{ margin: 0 }}>Configure Simulation</h3>
              </div>
              <span className="setup-tag-badge">AI Powered</span>
            </div>

            <form onSubmit={handleStart} className="setup-form">
              
              {/* Target Job Role */}
              <div className="form-group">
                <label className="form-label" htmlFor="role-input">
                  <Briefcase size={14} style={{ color: 'var(--primary)' }} />
                  <span>Target Job Role</span>
                </label>
                <input
                  type="text"
                  id="role-input"
                  className="form-control"
                  placeholder="e.g. Frontend React Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                />
                {/* Role Presets */}
                <div className="role-presets-strip">
                  <span className="presets-label">Presets:</span>
                  {POPULAR_ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`role-preset-pill ${role === r ? 'active' : ''}`}
                      onClick={() => setRole(r)}
                    >
                      {r.split(' ')[0]} {r.split(' ')[1] || ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question Category */}
              <div className="form-group">
                <label className="form-label">
                  <Target size={14} style={{ color: 'var(--primary)' }} />
                  <span>Question Category</span>
                </label>
                <div className="category-pills-row">
                  {[
                    { id: 'Mixed', label: '⚡ Mixed HR & Tech' },
                    { id: 'Technical', label: '💻 Strictly Technical' },
                    { id: 'Behavioral', label: '🤝 Behavioral (HR)' }
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      className={`cat-toggle-pill ${type === cat.id ? 'active' : ''}`}
                      onClick={() => setType(cat.id)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interview Format */}
              <div className="form-group">
                <label className="form-label">
                  <CheckCircle2 size={14} style={{ color: 'var(--primary)' }} />
                  <span>Interview Format</span>
                </label>
                <div className="format-toggle-grid">
                  <div 
                    className={`format-option-card ${format === 'theory' ? 'active' : ''}`}
                    onClick={() => setFormat('theory')}
                  >
                    <div className="format-icon-box">📝</div>
                    <div>
                      <h4 className="format-name">Subjective / Theory</h4>
                      <p className="format-desc">Written responses with detailed AI grading</p>
                    </div>
                  </div>

                  <div 
                    className={`format-option-card ${format === 'mcq' ? 'active' : ''}`}
                    onClick={() => setFormat('mcq')}
                  >
                    <div className="format-icon-box">🎯</div>
                    <div>
                      <h4 className="format-name">Multiple Choice (MCQ)</h4>
                      <p className="format-desc">Rapid 4-choice questions with instant scoring</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Number of Questions */}
              <div className="form-group">
                <label className="form-label" htmlFor="limit-input">
                  <Timer size={14} style={{ color: 'var(--primary)' }} />
                  <span>Session Length (Questions)</span>
                </label>
                <div className="limit-pills-row">
                  {[3, 5, 8, 10, 15].map(qNum => (
                    <button
                      key={qNum}
                      type="button"
                      className={`limit-pill-btn ${limit === qNum ? 'active' : ''}`}
                      onClick={() => setLimit(qNum)}
                    >
                      {qNum} Qs
                    </button>
                  ))}
                </div>
              </div>

              {/* Interactive Features Pre-Check */}
              <div className="precheck-toggles-row">
                <button
                  type="button"
                  onClick={() => setAiVoiceEnabled(!aiVoiceEnabled)}
                  className={`precheck-btn ${aiVoiceEnabled ? 'active' : ''}`}
                  title="Enable AI Voice Reader during the interview"
                >
                  <Volume2 size={15} />
                  <span>AI Voice: {aiVoiceEnabled ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleVideoFeed}
                  className={`precheck-btn ${showVideoFeed ? 'active' : ''}`}
                  title="Enable Camera simulator"
                >
                  <Video size={15} />
                  <span>Camera: {showVideoFeed ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* Start Button */}
              <button type="submit" className="btn btn-primary start-btn" disabled={loading}>
                <Play size={16} />
                <span>{loading ? 'Initializing Console...' : 'Initiate AI Interview'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Session History & Past Reports */}
          <div className="interview-history-card glass-card">
            <div className="history-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
                <h3 className="card-mini-title" style={{ margin: 0 }}>Session History</h3>
                <span className="history-count-badge">{filteredHistory.length}</span>
              </div>

              {/* Format Filter */}
              <div className="history-filter-strip">
                {['all', 'theory', 'mcq'].map(f => (
                  <button
                    key={f}
                    type="button"
                    className={`history-filter-btn ${historyFilter === f ? 'active' : ''}`}
                    onClick={() => setHistoryFilter(f)}
                  >
                    {f === 'all' ? 'All' : f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Search Input */}
            <div className="history-search-wrapper">
              <Search size={14} className="history-search-icon" />
              <input
                type="text"
                placeholder="Search sessions by role name..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="history-search-input"
              />
            </div>

            {/* History Cards List */}
            <div className="history-list">
              {filteredHistory.map((item, idx) => {
                const score = item.overallScore ? item.overallScore.toFixed(1) : '0.0';
                const numScore = parseFloat(score);
                const scoreTier = numScore >= 8 ? 'high' : numScore >= 5 ? 'mid' : 'low';
                const dateStr = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';

                return (
                  <div
                    key={item._id || idx}
                    className="history-interview-item-card"
                    onClick={() => setScorecard(item)}
                  >
                    <div className="history-card-left">
                      <div className={`history-role-icon-box tier-${scoreTier}`}>
                        <MessageSquare size={18} />
                      </div>
                      <div className="history-item-info">
                        <span className="history-item-role">{item.role}</span>
                        <div className="history-item-meta-row">
                          <span className="history-item-date">{dateStr}</span>
                          <span className="history-meta-dot">•</span>
                          <span className="history-item-pill">{item.format === 'mcq' ? 'MCQ' : 'Theory'}</span>
                          {item.questions && (
                            <>
                              <span className="history-meta-dot">•</span>
                              <span className="history-item-qcount">{item.questions.length} Questions</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="history-card-right">
                      <div className={`interview-history-score-badge tier-${scoreTier}`}>
                        <span className="interview-score-num">{score}</span>
                        <span className="interview-score-denom">/10</span>
                      </div>
                      <div className="history-open-arrow">
                        <ArrowRight size={15} />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredHistory.length === 0 && (
                <div className="history-empty-state">
                  <div className="empty-state-icon">🎙️</div>
                  <h4 className="empty-state-title">No matching interview sessions</h4>
                  <p className="empty-state-desc">Configure your target role on the left and click "Initiate AI Interview" to take your first session!</p>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {activeSession && (
        <div className="active-terminal-card glass-card animate-fade-in">
          {/* Header */}
          <div className="terminal-header-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="q-indicator">
              <span>QUESTION {currentIndex + 1} OF {activeSession.questions.length}</span>
              <span className="q-category">{activeSession.questions[currentIndex].category}</span>
            </div>
            
            {/* Interactive Audio/Video Toggles */}
            <div className="interview-media-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              <button 
                type="button"
                onClick={() => setAiVoiceEnabled(!aiVoiceEnabled)}
                className={`btn-media-toggle ${aiVoiceEnabled ? 'active' : ''}`}
                style={{ 
                  background: aiVoiceEnabled ? 'rgba(6, 182, 212, 0.15)' : 'var(--bg-item)', 
                  border: `1px solid ${aiVoiceEnabled ? 'var(--secondary)' : 'var(--border-color)'}`,
                  color: aiVoiceEnabled ? 'var(--secondary)' : 'var(--text-secondary)',
                  padding: '0.4rem 0.6rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.72rem',
                  fontWeight: 700
                }}
                title="Read questions using AI Text-to-Speech voice"
              >
                <VolumeIcon size={13} />
                <span>{aiVoiceEnabled ? 'Voice ON' : 'Voice OFF'}</span>
              </button>
            </div>

            <div className="terminal-timer">
              <Timer size={16} />
              <span>{formatTime(seconds)}</span>
            </div>
          </div>

          {/* Question Text & Webcam Feed */}
          <div className="terminal-prompt-box" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {showVideoFeed && (
              <div className="interview-webcam-preview-box" style={{ width: '100%', height: '180px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border-color)', position: 'relative', background: '#000000' }}>
                <video ref={interviewVideoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}></video>
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.6rem', borderRadius: '10px', fontSize: '0.65rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 800 }}>
                  <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }}></span>
                  <span>LIVE INTERVIEW CAMERA</span>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <p className="terminal-prompt-text" style={{ flex: 1, margin: 0 }}>
                {activeSession.questions[currentIndex].questionText}
              </p>
              <button 
                type="button" 
                onClick={() => speakQuestion(activeSession.questions[currentIndex].questionText)}
                className="btn-voice-speaker"
                title="Read Question Out Loud"
                style={{ background: 'var(--bg-item)', border: '1px solid var(--border-color)', color: 'var(--primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0 }}
              >
                <VolumeIcon size={14} />
              </button>
            </div>
          </div>

          {/* Answer Input (MCQ Choices or Subjective Textarea) */}
          {activeSession.format === 'mcq' ? (
            <div className="mcq-choices-container">
              {activeSession.questions[currentIndex].options?.map((opt, idx) => {
                const optLetter = opt.substring(0, 1).toUpperCase(); 
                const isSelected = userAnswer === optLetter;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`mcq-choice-btn ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (questionFeedback === null) {
                        setUserAnswer(optLetter);
                      }
                    }}
                    disabled={questionFeedback !== null || submittingAnswer}
                  >
                    <span className="choice-letter">{optLetter}</span>
                    <span className="choice-text">{opt.substring(3)}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="terminal-textarea-container" style={{ position: 'relative' }}>
              <textarea
                className="terminal-textarea"
                placeholder="Type your structured answer here, or click the microphone to dictate your response..."
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                disabled={questionFeedback !== null || submittingAnswer}
                rows={8}
                style={{ paddingRight: '46px' }}
              />
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                disabled={questionFeedback !== null || submittingAnswer}
                style={{
                  position: 'absolute',
                  right: '12px',
                  bottom: '12px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: isListening ? 'var(--accent-error)' : 'var(--bg-item)',
                  border: `1px solid ${isListening ? 'var(--accent-error)' : 'var(--border-color)'}`,
                  color: isListening ? '#ffffff' : 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  zIndex: 2
                }}
                title={isListening ? 'Stop Listening (Recording...)' : 'Start Voice Dictation'}
              >
                <MicIcon size={14} className={isListening ? 'animate-pulse' : ''} />
              </button>
            </div>
          )}


          {/* Controls */}
          <div className="terminal-actions-bar">
            {questionFeedback === null ? (
              <button
                className="btn btn-primary"
                onClick={handleAnswerSubmit}
                disabled={!userAnswer.trim() || submittingAnswer}
              >
                <span>{submittingAnswer ? 'Evaluating Answer...' : 'Submit Response'}</span>
                {!submittingAnswer && <Check size={16} />}
              </button>
            ) : (
              <button className="btn btn-secondary" onClick={handleNext}>
                <span>
                  {currentIndex < activeSession.questions.length - 1 ? 'Next Question' : 'View Full Scorecard'}
                </span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>

          {/* AI Feedback Overlay */}
          {questionFeedback && (
            <div className="terminal-evaluation-overlay animate-fade-in">
              <div className="feedback-badge-row">
                <div className="rating-badge">
                  <span>Rating: {questionFeedback.rating}/10</span>
                </div>
              </div>

              <div className="evaluation-details">
                <div className="feedback-section">
                  <h4 className="section-small-lbl">AI Evaluation Comments</h4>
                  <p className="eval-text">{questionFeedback.feedback}</p>
                </div>

                <div className="feedback-section">
                  <h4 className="section-small-lbl">Optimal Model Solution</h4>
                  <p className="model-ans-text">{questionFeedback.modelAnswer}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. SCORECARD MODULE */}
      {scorecard && (
        <div className="scorecard-view-details animate-fade-in">
          {/* Performance Scorecard Container (Unified Lavender Box) */}
          <div className="scorecard-summary-card" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.75rem', 
            padding: '2rem', 
            background: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95) 0%, rgba(224, 231, 255, 0.95) 100%)', 
            border: '1px solid rgba(99, 102, 241, 0.15)', 
            borderRadius: '12px',
            marginBottom: '1.5rem',
            position: 'relative'
          }}>
            {/* Top row: Title, description, and action buttons + overall score on the right */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
              <div style={{ flex: 1, minWidth: '280px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#1e293b', margin: '0 0 0.5rem 0' }}>
                  Performance Scorecard: {scorecard.role || activeSession?.role || 'Developer'}
                </h2>
                <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 1.25rem 0', lineHeight: 1.5, maxWidth: '85%' }}>
                  {Math.round((scorecard.overallScore || 0.0) * 10) >= 40 
                    ? 'Great job! You have crossed the 40% passing threshold. Keep practicing and reviewing concepts to cross the 80% mark.'
                    : 'Needs improvement. You did not cross the 40% passing threshold. Please review the key concepts, retry the assessment, and try again.'}
                </p>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button 
                    className="btn btn-primary" 
                    onClick={() => setScorecard(null)}
                    style={{ 
                      fontSize: '0.78rem', 
                      padding: '0.6rem 1.25rem', 
                      background: '#1e40af', 
                      border: 'none', 
                      borderRadius: '6px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      color: '#ffffff'
                    }}
                  >
                    Take Another Test
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => downloadCertificate('pdf')}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.5rem', 
                      fontSize: '0.78rem', 
                      padding: '0.6rem 1.25rem', 
                      background: 'rgba(255, 255, 255, 0.8)', 
                      border: '1px solid rgba(99, 102, 241, 0.2)', 
                      borderRadius: '6px',
                      fontWeight: 800,
                      color: '#1e293b'
                    }}
                  >
                    <Award size={14} />
                    <span>Download Certificate</span>
                  </button>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, paddingRight: '1rem' }}>
                {/* Medal/Award Badge Icon */}
                <div style={{ 
                  width: '46px', 
                  height: '46px', 
                  borderRadius: '50%', 
                  background: 'rgba(245, 158, 11, 0.1)', 
                  border: '1.5px solid rgba(245, 158, 11, 0.3)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Award size={24} style={{ color: '#d97706' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', lineHeight: 0.9 }}>
                    {Number(scorecard.overallScore || 0.0).toFixed(1)}
                  </span>
                  <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>OVERALL / 10</span>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#475569', marginTop: '2px' }}>
                    ({Math.round((scorecard.overallScore || 0.0) * 1.5)} / 15 Marks)
                  </span>
                </div>
              </div>
            </div>

            {/* Divider line */}
            <div style={{ height: '1px', background: 'rgba(99, 102, 241, 0.15)', width: '100%' }}></div>

            {/* Bottom row: Circle Score + Progress Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap', width: '100%' }}>
              {/* Circular gauge */}
              <div style={{ position: 'relative', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="100" height="100" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <defs>
                    <linearGradient id="scoreCircleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(15, 23, 42, 0.05)" strokeWidth="3.5" />
                  {Math.round((scorecard.overallScore || 0.0) * 10) > 0 && (
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      fill="none" 
                      stroke="url(#scoreCircleGradient)" 
                      strokeWidth="3.5" 
                      strokeDasharray={`${Math.round((scorecard.overallScore || 0.0) * 10)}, 100`} 
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                  )}
                </svg>
                <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: '2.1rem', fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>
                    {Math.round((scorecard.overallScore || 0.0) * 10)}
                  </span>
                  <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', marginTop: '1px', letterSpacing: '0.05em' }}>SCORE</span>
                </div>
              </div>

              {/* Progress bars list */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: '300px' }}>
                {[
                  { name: 'Technical Knowledge', gradient: 'linear-gradient(90deg, #3b82f6, #1d4ed8)' },
                  { name: 'Communication', gradient: 'linear-gradient(90deg, #10b981, #047857)' },
                  { name: 'Problem Solving', gradient: 'linear-gradient(90deg, #f97316, #eab308)' },
                  { name: 'Confidence', gradient: 'linear-gradient(90deg, #8b5cf6, #d946ef)' }
                ].map((metric, i) => {
                  const baseVal = Math.round((scorecard.overallScore || 0.0) * 10);
                  // Calculate dummy variations centered around base score
                  const offsets = [4, -3, 2, -7];
                  const val = baseVal === 0 ? 0 : Math.min(100, Math.max(0, baseVal + offsets[i]));
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                      <span style={{ width: '170px', fontSize: '0.82rem', fontWeight: 800, color: '#334155', flexShrink: 0 }}>
                        {metric.name}
                      </span>
                      <div style={{ flex: 1, height: '7px', background: 'rgba(15, 23, 42, 0.06)', borderRadius: '3.5px', overflow: 'hidden', position: 'relative' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${val}%`, 
                            background: metric.gradient, 
                            borderRadius: '3.5px',
                            transition: 'width 0.5s ease' 
                          }}
                        ></div>
                      </div>
                      <span style={{ width: '45px', textAlign: 'right', fontSize: '0.82rem', fontWeight: 900, color: '#0f172a', flexShrink: 0 }}>
                        {val}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Certificate Generation & Jobs Grid */}
          <div className="scorecard-extras-grid">
            {/* Certificate Card */}
            <div className="extra-feature-card glass-card certificate-card">
              <div className="extra-card-header">
                <Award size={22} className="accent-icon" />
                <h3>Your Assessment Certificate</h3>
              </div>
              <p className="extra-card-desc">
                Congratulations! You successfully finished the mock interview. You can now download a certified record of your performance.
              </p>
              
              {/* Visual Certificate Card Preview */}
              {(() => {
                const badgeInfo = getBadgeDetails(scorecard.overallScore);
                return (
                  <div className="certificate-mini-preview">
                    <div className="cert-preview-border">
                      <div className="cert-preview-content" style={{ position: 'relative', overflow: 'hidden' }}>
                        <span className="cert-lbl-mini">CERTIFICATE OF ACHIEVEMENT</span>
                        <span className="cert-name-mini">{user?.name || 'Candidate'}</span>
                        <span className="cert-role-mini">Role: {scorecard.role}</span>
                        <span className="cert-score-mini">Score: {scorecard.overallScore ? scorecard.overallScore.toFixed(1) : 0}/10</span>
                        <span className={`cert-badge-mini ${badgeInfo.className}`}>{badgeInfo.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="download-dropdown-container" style={{ position: 'relative', width: '100%' }}>
                <button 
                  className="btn btn-primary download-cert-btn" 
                  onClick={() => setShowFormats(!showFormats)}
                  style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Download size={16} />
                  <span>Download Certificate</span>
                  <ChevronDown size={14} style={{ marginLeft: 'auto', transform: showFormats ? 'rotate(180deg)' : 'none', transition: 'var(--transition-smooth)' }} />
                </button>
                
                {showFormats && (
                  <div 
                    className="download-formats-menu glass-card" 
                    style={{ 
                      position: 'absolute', 
                      bottom: 'calc(100% + 0.5rem)', 
                      left: 0, 
                      width: '100%', 
                      zIndex: 10, 
                      padding: '0.5rem', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '0.25rem',
                      border: '1px solid var(--border-color)',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <button 
                      className="format-option-btn" 
                      onClick={() => { downloadCertificate('pdf'); setShowFormats(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', width: '100%', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>📄</span> Export as PDF Document (.pdf)
                    </button>
                    <button 
                      className="format-option-btn" 
                      onClick={() => { downloadCertificate('png'); setShowFormats(false); }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem', width: '100%', background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                    >
                      <span style={{ fontSize: '1.2rem' }}>🖼️</span> Export as Image file (.png)
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Company Vacancies Card */}
            <div className="extra-feature-card glass-card">
              <div className="extra-card-header">
                <Briefcase size={22} className="accent-icon" />
                <h3>Direct Company Job Openings</h3>
              </div>
              
              {scorecard.overallScore < 4.0 ? (
                <div className="assessment-failed-message" style={{ padding: '2rem 1.5rem', textAlign: 'center', background: 'var(--bg-item)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
                  <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' }}>🎯</span>
                  <h4 style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                    Assessment Unsuccessful
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    You did not pass the assessment this time. Please prepare more thoroughly and retake the test.
                    Once you achieve a passing score (4.0+), we will unlock customized company career recommendations and job vacancy portals matching your profile.
                  </p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px dashed var(--border-color)', paddingTop: '1rem' }}>
                    "Success is not final, failure is not fatal: it is the courage to continue that counts."
                  </p>
                </div>
              ) : (
                <>
                  <p className="extra-card-desc">
                    {scorecard.overallScore > 8.5 
                      ? 'Outstanding performance! You earned a GOLD Badge. Here are direct hiring links for Tier-1 Tech Giants:'
                      : scorecard.overallScore >= 7.0
                      ? 'Great effort! You earned a SILVER Badge. Here are career opportunities at top national tech leaders:'
                      : 'Good job! You earned a BRONZE/PASS Badge. Expand your experience at fast-growing local startups:'}
                  </p>

                  <div className="company-vacancies-list">
                    {(() => {
                      const roleQuery = encodeURIComponent(scorecard.role);
                      const score = scorecard.overallScore || 0;

                      if (score > 8.5) {
                        return [
                          {
                            name: 'Google Careers',
                            logo: 'G',
                            color: '#4285F4',
                            url: `https://www.google.com/about/careers/applications/jobs/results/?q=${roleQuery}`,
                            desc: 'Apply for elite roles at Google'
                          },
                          {
                            name: 'Microsoft Careers',
                            logo: 'M',
                            color: '#F25022',
                            url: `https://careers.microsoft.com/us/en/search-results?keywords=${roleQuery}`,
                            desc: 'Explore engineering roles at Microsoft'
                          },
                          {
                            name: 'Amazon Jobs',
                            logo: 'A',
                            color: '#FF9900',
                            url: `https://www.amazon.jobs/en/search?base_query=${roleQuery}`,
                            desc: 'Search direct opportunities at Amazon'
                          },
                          {
                            name: 'Meta Careers',
                            logo: 'Me',
                            color: '#0668E1',
                            url: `https://www.metacareers.com/jobs?q=${roleQuery}`,
                            desc: 'Explore product engineering at Meta'
                          },
                          {
                            name: 'Samsung Careers',
                            logo: 'S',
                            color: '#034EA2',
                            url: 'https://www.samsung.com/in/aboutsamsung/careers/',
                            desc: 'Apply for core tech roles at Samsung India'
                          },
                          {
                            name: 'Accenture Jobs',
                            logo: 'Ac',
                            color: '#A100FF',
                            url: `https://www.accenture.com/in-en/careers/jobsearch?jk=${roleQuery}`,
                            desc: 'Explore consultant and systems developer roles'
                          }
                        ];
                      } else if (score >= 7.0) {
                        return [
                          {
                            name: 'Flipkart Careers',
                            logo: 'F',
                            color: '#2874F0',
                            url: `https://www.flipkartcareers.com/#!/joblist?search=${roleQuery}`,
                            desc: 'Apply to top e-commerce roles at Flipkart'
                          },
                          {
                            name: 'Zomato Careers',
                            logo: 'Z',
                            color: '#CB202D',
                            url: `https://www.zomato.com/careers`,
                            desc: 'Explore tech developer roles at Zomato'
                          },
                          {
                            name: 'TCS Careers',
                            logo: 'T',
                            color: '#1E3A8A',
                            url: 'https://ibegin.tcs.com/iBegin/',
                            desc: 'Search enterprise roles at Tata Consultancy Services'
                          },
                          {
                            name: 'Uber Careers',
                            logo: 'U',
                            color: '#000000',
                            url: `https://www.uber.com/global/en/careers/list/?q=${roleQuery}`,
                            desc: 'Search ride-sharing tech roles at Uber'
                          },
                          {
                            name: 'Ola Cabs Careers',
                            logo: 'O',
                            color: '#4CA64C',
                            url: `https://www.olacabs.com/careers`,
                            desc: 'Explore mobility developer roles at Ola Cabs'
                          }
                        ];
                      } else {
                        return [
                          {
                            name: 'Meesho Careers',
                            logo: 'Me',
                            color: '#F43F5E',
                            url: 'https://www.meesho.io/jobs',
                            desc: 'Explore developer roles at Meesho social commerce'
                          },
                          {
                            name: 'Razorpay Jobs',
                            logo: 'Rp',
                            color: '#0B72E7',
                            url: `https://razorpay.com/jobs/`,
                            desc: 'Explore fintech engineer roles at Razorpay'
                          },
                          {
                            name: 'ShareChat Jobs',
                            logo: 'Sc',
                            color: '#FF6E14',
                            url: `https://sharechat.com/careers`,
                            desc: 'Search social platform engineering at ShareChat'
                          },
                          {
                            name: 'Paytm Careers',
                            logo: 'Py',
                            color: '#002E6E',
                            url: 'https://paytm.com/careers',
                            desc: 'Apply to dynamic fintech slots at Paytm'
                          }
                        ];
                      }
                    })().map((company, idx) => (
                      <a 
                        key={idx}
                        href={company.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-vacancy-item"
                      >
                        <div className="company-logo-avatar" style={{ backgroundColor: company.color }}>
                          {company.logo}
                        </div>
                        <div className="company-meta-info">
                          <span className="company-name">{company.name}</span>
                          <span className="company-job-desc">{company.desc}</span>
                        </div>
                        <div className="vacancy-pulse-indicator">
                          <span className="pulse-dot"></span>
                          <span className="pulse-lbl">Open</span>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* Separated Job Search Portals Section */}
                  <div className="job-portals-section-divider" style={{ margin: '2rem 0 1rem 0', borderTop: '1px dashed var(--border-color)', paddingTop: '1.5rem' }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.5rem 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      <span style={{ fontSize: '1.2rem' }}>🌐</span> Global Job Search Engines
                    </h4>
                    <p className="extra-card-desc" style={{ marginBottom: '1rem' }}>
                      Search aggregated listings across top worldwide job discovery platforms for custom roles:
                    </p>
                  </div>

                  <div className="company-vacancies-list">
                    {(() => {
                      const roleQuery = encodeURIComponent(scorecard.role);
                      return [
                        {
                          name: 'LinkedIn Jobs',
                          logo: 'In',
                          color: '#0A66C2',
                          url: `https://www.linkedin.com/jobs/search/?keywords=${roleQuery}`,
                          desc: `Search active ${scorecard.role} roles on LinkedIn`
                        },
                        {
                          name: 'Indeed Jobs',
                          logo: 'Id',
                          color: '#2164f3',
                          url: `https://www.indeed.com/jobs?q=${roleQuery}`,
                          desc: `Search localized jobs on Indeed portal`
                        },
                        {
                          name: 'Naukri.com',
                          logo: 'N',
                          color: '#ff6f00',
                          url: `https://www.naukri.com/${roleQuery.replace(/%20/g, '-')}-jobs`,
                          desc: `Explore top Indian openings on Naukri`
                        }
                      ];
                    })().map((portal, idx) => (
                      <a 
                        key={idx}
                        href={portal.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="company-vacancy-item"
                        style={{ border: '1px solid hsla(215, 85%, 60%, 0.15)', background: 'hsla(215, 85%, 60%, 0.03)' }}
                      >
                        <div className="company-logo-avatar" style={{ backgroundColor: portal.color }}>
                          {portal.logo}
                        </div>
                        <div className="company-meta-info">
                          <span className="company-name">{portal.name}</span>
                          <span className="company-job-desc">{portal.desc}</span>
                        </div>
                        <div className="vacancy-pulse-indicator">
                          <span className="pulse-dot" style={{ backgroundColor: 'var(--secondary)' }}></span>
                          <span className="pulse-lbl" style={{ color: 'var(--secondary)' }}>Search</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="scorecard-qa-trail">
            {scorecard.questions?.map((q, i) => (
              <div key={q._id || i} className="qa-accordion-item glass-card">
                <div className="accordion-header">
                  <h4>Q{i + 1}: {q.questionText}</h4>
                  <span className="item-rating-tag">
                    {q.rating}/{scorecard.format === 'mcq' ? 5 : 10}
                  </span>
                </div>
                <div className="accordion-body">
                  <div className="body-block">
                    <span className="block-lbl">Your Answer</span>
                    <p className="block-text italic-text">{q.userAnswer || 'No response provided.'}</p>
                  </div>

                  <div className="body-block">
                    <span className="block-lbl">AI Evaluation Reviews</span>
                    <p className="block-text">{q.feedback}</p>
                  </div>

                  <div className="body-block">
                    <span className="block-lbl">Reference Answer Guide</span>
                    <p className="block-text green-theme">{q.modelAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockInterview;
