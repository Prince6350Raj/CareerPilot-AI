import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { 
  Send, Sparkles, BookOpen, Compass, Award, Terminal, Mic, 
  Volume2, VolumeX, Copy, Check, Trash2, Bot, User, Code, 
  HelpCircle, Lightbulb, Zap, ArrowRight, RefreshCw
} from 'lucide-react';
import './CareerChatbot.css';

// Subcomponent to render rich markdown and code blocks cleanly
const FormattedMessageContent = ({ content }) => {
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedCodeIdx(idx);
    setTimeout(() => setCopiedCodeIdx(null), 2000);
  };

  if (!content) return null;

  // Safe JSON unwrap if string contains JSON envelope
  let displayContent = content;
  if (typeof displayContent === 'string' && displayContent.trim().startsWith('{') && displayContent.includes('"answer"')) {
    try {
      const parsed = JSON.parse(displayContent.trim());
      if (parsed && typeof parsed.answer === 'string') {
        displayContent = parsed.answer;
      }
    } catch (e) {
      const match = displayContent.match(/"answer"\s*:\s*"([\s\S]*?)(?="\s*,\s*"(?:learningResources|projects|courses)"|\s*"}\s*$)/);
      if (match && match[1]) {
        displayContent = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
    }
  }

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  let blockIndex = 0;

  while ((match = codeBlockRegex.exec(displayContent)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: displayContent.substring(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'code',
      value: match[2].trim(),
      index: blockIndex++
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < displayContent.length) {
    parts.push({ type: 'text', value: displayContent.substring(lastIndex) });
  }

  const renderTextSegment = (text, segIdx) => {
    const lines = text.split('\n');
    return (
      <div key={segIdx} className="formatted-text-segment">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={lIdx} className="empty-spacer" />;

          // Heading Level 3 (###)
          if (trimmed.startsWith('### ')) {
            return (
              <h4 key={lIdx} className="markdown-h3">
                {renderInlineMarkdown(trimmed.replace('### ', ''))}
              </h4>
            );
          }
          // Heading Level 4 (####)
          if (trimmed.startsWith('#### ')) {
            return (
              <h5 key={lIdx} className="markdown-h4">
                {renderInlineMarkdown(trimmed.replace('#### ', ''))}
              </h5>
            );
          }
          // Horizontal divider
          if (trimmed === '---' || trimmed === '***') {
            return <hr key={lIdx} className="markdown-divider" />;
          }
          // Bullet point
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
            return (
              <div key={lIdx} className="markdown-bullet-row">
                <span className="bullet-dot">•</span>
                <span className="bullet-text">{renderInlineMarkdown(trimmed.replace(/^[-*•]\s+/, ''))}</span>
              </div>
            );
          }
          // Numbered list
          if (/^\d+\.\s+/.test(trimmed)) {
            const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
            return (
              <div key={lIdx} className="markdown-numbered-row">
                <span className="number-pill">{numMatch[1]}</span>
                <span className="number-text">{renderInlineMarkdown(numMatch[2])}</span>
              </div>
            );
          }

          return (
            <p key={lIdx} className="markdown-paragraph">
              {renderInlineMarkdown(line)}
            </p>
          );
        })}
      </div>
    );
  };

  const renderInlineMarkdown = (str) => {
    // Process **bold**, `inline code`, and *italic*
    const tokens = [];
    let remaining = str;
    let k = 0;

    while (remaining.length > 0) {
      // Bold **text**
      const boldMatch = remaining.match(/^(\*\*)(.*?)\1/);
      if (boldMatch) {
        tokens.push(<strong key={k++} className="markdown-bold">{boldMatch[2]}</strong>);
        remaining = remaining.substring(boldMatch[0].length);
        continue;
      }

      // Inline code `code`
      const codeMatch = remaining.match(/^(`)(.*?)\1/);
      if (codeMatch) {
        tokens.push(<code key={k++} className="markdown-inline-code">{codeMatch[2]}</code>);
        remaining = remaining.substring(codeMatch[0].length);
        continue;
      }

      // Normal text slice up to next token
      const nextSpecial = remaining.search(/(\*\*|`)/);
      if (nextSpecial === -1) {
        tokens.push(remaining);
        break;
      } else {
        tokens.push(remaining.substring(0, nextSpecial));
        remaining = remaining.substring(nextSpecial);
      }
    }

    return tokens;
  };

  return (
    <div className="formatted-message-wrapper">
      {parts.map((part, pIdx) => {
        if (part.type === 'text') {
          return renderTextSegment(part.value, pIdx);
        }
        if (part.type === 'code') {
          return (
            <div key={pIdx} className="markdown-code-card">
              <div className="code-card-topbar">
                <span className="code-lang-tag">
                  <Code size={12} />
                  <span>{part.lang.toUpperCase()}</span>
                </span>
                <button
                  type="button"
                  className="code-copy-btn"
                  onClick={() => handleCopyCode(part.value, part.index)}
                  title="Copy code to clipboard"
                >
                  {copiedCodeIdx === part.index ? (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="code-content-pre">
                <code>{part.value}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};

const CareerChatbot = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `### 👋 Welcome ${user?.name || 'Engineer'} to **CareerPilot AI Technical Copilot**!\n\nI am your conversational AI engineering mentor, coding advisor, and career strategist. Ask me about:\n- 🔄 **Core Programming & Logic** (*"What is a loop?", "Explain recursion with code", "Closures & Event Loop"*)\n- 🚀 **Placements & Roadmaps** (*"How to crack MAANG interviews?", "6-month DSA Roadmap"*)\n- ⚛️ **Full Stack & System Design** (*"REST vs GraphQL", "Database Indexing & Redis Caching"*)\n\nYou can ask in **English** or **Hinglish** (e.g. *"loop kya hota hai aur kitne type ka hota hai"*). Let's solve your tech queries!`,
      data: null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('programming');

  // Voice/Audio States
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const chatBottomRef = useRef(null);
  const inputFieldRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const autoSpeakRef = useRef(autoSpeak);

  // Keep auto-speak ref synchronized with latest toggle state
  useEffect(() => {
    autoSpeakRef.current = autoSpeak;
  }, [autoSpeak]);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Speech Recognition (Speech-to-Text) Initialization
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-US';

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        rec.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputVal(transcript);
          sendQuery(transcript);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      if (synthRef.current) synthRef.current.cancel();
      recognitionRef.current.start();
    }
  };

  // Speech Synthesis (Text-to-Speech) trigger
  const speakText = (text, messageId) => {
    if (!synthRef.current) return;

    if (activeSpeakingId === messageId) {
      synthRef.current.cancel();
      setActiveSpeakingId(null);
      return;
    }

    synthRef.current.cancel();

    const cleanText = text
      .replace(/[*#_`•]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code example provided on screen.')
      .replace(/\[.*\]\(.*\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = 1.0;
    
    utterance.onend = () => {
      setActiveSpeakingId(null);
    };
    utterance.onerror = () => {
      setActiveSpeakingId(null);
    };

    setActiveSpeakingId(messageId);
    synthRef.current.speak(utterance);
  };

  const handleCopyMessage = (text, messageId) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(messageId);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleClearHistory = () => {
    if (synthRef.current) synthRef.current.cancel();
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `### 🔄 Chat conversation reset!\nAsk me any technical coding concept (e.g. *Loops, Recursion, DSA, Closures*) or placement questions in **English** or **Hinglish**.`,
        data: null,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const sendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      data: null,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/career/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: queryText })
      });
      const data = await res.json();
      if (data.success && data.data) {
        const aiMsgId = (Date.now() + 1).toString();
        const aiResponseText = data.data.answer || 'Here is the detailed explanation for your query.';
        
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: aiResponseText,
            data: data.data,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        if (autoSpeakRef.current) {
          speakText(aiResponseText, aiMsgId);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: 'I encountered an issue processing that query. Please rephrase or try again.',
            data: null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'CareerPilot AI network timeout. The local brain knowledge engine is ready to assist.',
          data: null,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      sendQuery(inputVal);
    }
  };

  // Preset categories and query prompt chips
  const categoryPrompts = {
    programming: [
      { text: 'What is a loop in programming?', icon: '🔄' },
      { text: 'Explain for, while & do-while loops with code', icon: '💻' },
      { text: 'What is recursion vs iteration?', icon: '⚡' },
      { text: 'Explain JavaScript Closures and Lexical Scope', icon: '🔐' },
      { text: 'Differences between var, let, and const', icon: '📝' }
    ],
    career: [
      { text: 'How to crack MAANG software engineering placements?', icon: '🚀' },
      { text: '6-month DSA and Web Development roadmap', icon: '🗺️' },
      { text: 'How to optimize my resume for ATS parsers?', icon: '📄' },
      { text: 'Suggest 3 high-impact MERN stack portfolio projects', icon: '💡' }
    ],
    dsa: [
      { text: 'Explain Binary Search with code and Big-O', icon: '🔍' },
      { text: 'How to master Two Pointers & Sliding Window?', icon: '🎯' },
      { text: 'Top 5 dynamic programming patterns for interviews', icon: '🧠' },
      { text: 'Array vs Linked List time complexity comparison', icon: '📊' }
    ],
    web: [
      { text: 'How does the JavaScript Event Loop work?', icon: '⚙️' },
      { text: 'Difference between REST and GraphQL APIs', icon: '🌐' },
      { text: 'Explain React useState and useEffect lifecycle', icon: '⚛️' },
      { text: 'How to implement Database Indexing and Redis Caching?', icon: '🗄️' }
    ]
  };

  return (
    <div className="career-chatbot-view">
      {/* Top Header Hero Card */}
      <div className="chatbot-hero-card glass-card">
        <div className="chatbot-hero-left">
          <div className="chatbot-badge-pill">
            <Sparkles size={13} className="text-primary animate-pulse" />
            <span>NEURAL CAREER & TECHNICAL COPILOT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginTop: '0.5rem' }}>
            <div className="chatbot-bot-avatar-glow">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="chatbot-main-title">CareerPilot AI Advisor</h1>
              <p className="chatbot-sub-title">
                Ask deep technical programming questions, system design concepts, or placement roadmaps in English or Hinglish.
              </p>
            </div>
          </div>
        </div>

        {/* Live Status Controls */}
        <div className="chatbot-header-actions">
          <div className="chatbot-stat-chip">
            <span className="stat-label">AI ENGINE</span>
            <span className="stat-val">Gemini 1.5 Hybrid</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setAutoSpeak(!autoSpeak);
              if (synthRef.current) synthRef.current.cancel();
            }}
            className={`auto-speak-pill-btn ${autoSpeak ? 'active' : ''}`}
            title="Toggle automatic AI voice readout"
          >
            {autoSpeak ? (
              <>
                <Volume2 size={13} className="animate-pulse" />
                <span>🔊 Voice AI: ON</span>
              </>
            ) : (
              <>
                <VolumeX size={13} />
                <span>🔇 Voice AI: OFF</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleClearHistory}
            className="chatbot-clear-btn"
            title="Clear current conversation"
          >
            <Trash2 size={13} />
            <span>Reset Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="chat-interface-layout glass-card">
        {/* Messages list */}
        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender} animate-fade-in`}>
              <div className="chat-avatar-box">
                {msg.sender === 'ai' ? (
                  <div className="avatar-ai">
                    <Bot size={16} />
                  </div>
                ) : (
                  <div className="avatar-user">
                    <User size={16} />
                  </div>
                )}
              </div>

              <div className="chat-bubble-bubble">
                <div className="bubble-header-bar">
                  <span className="bubble-sender-name">
                    {msg.sender === 'ai' ? 'CareerPilot AI Copilot' : (user?.name || 'You')}
                  </span>
                  <div className="bubble-actions-row">
                    <span className="bubble-timestamp">{msg.timestamp}</span>

                    {/* Copy message button */}
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(msg.text, msg.id)}
                      className="bubble-action-icon-btn"
                      title="Copy message text"
                    >
                      {copiedMsgId === msg.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>

                    {/* Speak aloud button */}
                    {msg.sender === 'ai' && (
                      <button
                        type="button"
                        onClick={() => speakText(msg.text, msg.id)}
                        className={`bubble-action-icon-btn ${activeSpeakingId === msg.id ? 'speaking' : ''}`}
                        title={activeSpeakingId === msg.id ? 'Stop reading' : 'Read aloud'}
                      >
                        {activeSpeakingId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Formatted Message Markdown Body */}
                <div className="bubble-body-content">
                  <FormattedMessageContent content={msg.text} />
                </div>

                {/* Sub-structures of resources/projects if available */}
                {msg.data && (
                  <div className="chatbot-meta-blocks animate-fade-in">
                    {msg.data.learningResources?.length > 0 && (
                      <div className="meta-block">
                        <h5>
                          <Compass size={14} className="block-icon" />
                          <span>Curated Learning References</span>
                        </h5>
                        <div className="meta-links-list">
                          {msg.data.learningResources.map((item, i) => (
                            <span key={i} className="meta-tag-item blue">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.data.projects?.length > 0 && (
                      <div className="meta-block">
                        <h5>
                          <Award size={14} className="block-icon" />
                          <span>Recommended Practice Projects</span>
                        </h5>
                        <div className="meta-links-list">
                          {msg.data.projects.map((item, i) => (
                            <span key={i} className="meta-tag-item green">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {msg.data.courses?.length > 0 && (
                      <div className="meta-block">
                        <h5>
                          <BookOpen size={14} className="block-icon" />
                          <span>Interactive Video & Web Courses</span>
                        </h5>
                        <div className="meta-links-list">
                          {msg.data.courses.map((item, i) => (
                            <span key={i} className="meta-tag-item purple">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Smart Follow-ups */}
                    <div className="followup-prompts-row">
                      <span className="followup-label">
                        <Lightbulb size={12} />
                        <span>Quick Follow-up:</span>
                      </span>
                      <button
                        type="button"
                        className="followup-chip"
                        onClick={() => sendQuery(`Can you give me a runnable code example with step-by-step breakdown?`)}
                        disabled={loading}
                      >
                        💻 Show code example
                      </button>
                      <button
                        type="button"
                        className="followup-chip"
                        onClick={() => sendQuery(`Explain this in Hinglish with a simple real-world analogy.`)}
                        disabled={loading}
                      >
                        🇮🇳 Explain in Hinglish
                      </button>
                      <button
                        type="button"
                        className="followup-chip"
                        onClick={() => sendQuery(`What are common interview questions and mistakes on this topic?`)}
                        disabled={loading}
                      >
                        🎯 Common interview questions
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row ai loading animate-fade-in">
              <div className="chat-avatar-box">
                <div className="avatar-ai">
                  <Bot size={16} />
                </div>
              </div>
              <div className="chat-bubble-bubble">
                <div className="typing-loader-wrapper">
                  <span className="typing-text">AI is synthesizing technical breakdown...</span>
                  <div className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Prompt Discovery Category Hub */}
        <div className="chatbot-prompt-hub">
          <div className="category-tabs-bar">
            <button
              type="button"
              className={`cat-tab-btn ${activeCategoryTab === 'programming' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('programming')}
            >
              💡 Core Programming
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategoryTab === 'career' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('career')}
            >
              🚀 Career & Placements
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategoryTab === 'dsa' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('dsa')}
            >
              ⚡ DSA & Problem Solving
            </button>
            <button
              type="button"
              className={`cat-tab-btn ${activeCategoryTab === 'web' ? 'active' : ''}`}
              onClick={() => setActiveCategoryTab('web')}
            >
              🛠️ Web & System Design
            </button>
          </div>

          <div className="prompt-chips-carousel">
            {categoryPrompts[activeCategoryTab]?.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                className="prompt-starter-chip"
                onClick={() => sendQuery(prompt.text)}
                disabled={loading}
              >
                <span className="chip-icon">{prompt.icon}</span>
                <span className="chip-text">{prompt.text}</span>
                <ArrowRight size={11} className="chip-arrow" />
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Input Bar */}
        <form onSubmit={handleSend} className="chat-input-bar">
          <div className="input-field-container">
            <input
              ref={inputFieldRef}
              type="text"
              placeholder={isListening ? "🎙️ Listening... Speak your coding or career query now!" : "Ask anything (e.g. What is a loop?, Explain REST vs GraphQL, MAANG Roadmap)..."}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              disabled={loading || isListening}
              className="chat-text-input-field"
            />
            {inputVal && !loading && (
              <button
                type="button"
                className="input-clear-btn"
                onClick={() => setInputVal('')}
                title="Clear input"
              >
                ✕
              </button>
            )}
          </div>

          <div className="chat-actions-wrapper">
            <button
              type="button"
              onClick={toggleListen}
              className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Voice Input (Speech-to-Text)'}
              disabled={loading}
            >
              <Mic size={16} />
              {isListening && <span className="mic-pulse-wave" />}
            </button>
            <button
              type="submit"
              className="chat-send-btn"
              disabled={!inputVal.trim() || loading || isListening}
              title="Send query"
            >
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerChatbot;

