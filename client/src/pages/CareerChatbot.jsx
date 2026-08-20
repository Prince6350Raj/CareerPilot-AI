import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Sparkles, BookOpen, Compass, Award, Terminal, Mic, Volume2, VolumeX } from 'lucide-react';
import './CareerChatbot.css';

const CareerChatbot = () => {
  const { token, API_URL, user } = useContext(AuthContext);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello ${user?.name || 'Candidate'}! I am CareerPilot AI, your conversational career advisor. Ask me anything about engineering roles, projects recommendations, or framework roadmaps!`,
      data: null
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Voice/Audio States
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);

  const chatBottomRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
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

    const cleanText = text.replace(/[*#_`•]/g, '').replace(/\[.*\]\(.*\)/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    
    utterance.onend = () => {
      setActiveSpeakingId(null);
    };
    utterance.onerror = () => {
      setActiveSpeakingId(null);
    };

    setActiveSpeakingId(messageId);
    synthRef.current.speak(utterance);
  };

  const sendQuery = async (queryText) => {
    if (!queryText.trim()) return;

    // Append user message
    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: queryText,
      data: null
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
      if (data.success) {
        const aiMsgId = (Date.now() + 1).toString();
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: data.data.answer,
            data: data.data
          }
        ]);
        if (autoSpeakRef.current) {
          speakText(data.data.answer, aiMsgId);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: 'I encountered an error parsing that request. Please try again.',
            data: null
          }
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'Network timeout. CareerPilot AI service is currently overloaded.',
          data: null
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

  return (
    <div className="career-chatbot-view">
      <h1 className="page-title">CareerPilot AI Advisor</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <p className="page-subtitle" style={{ margin: 0, flex: 1, minWidth: '280px' }}>Interact with our generative advisor chatbot to clear up roadmap confusion, outline coding projects, and discover online training courses.</p>
        <button
          type="button"
          onClick={() => {
            setAutoSpeak(!autoSpeak);
            if (window.speechSynthesis) window.speechSynthesis.cancel();
          }}
          className={`auto-speak-toggle-btn ${autoSpeak ? 'active' : ''}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: '20px', border: '1px solid var(--border-color)', background: autoSpeak ? 'var(--primary)' : 'var(--bg-item)', color: autoSpeak ? '#ffffff' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'var(--transition-smooth)' }}
        >
          {autoSpeak ? (
            <>
              <Volume2 size={13} className="animate-pulse" />
              <span>🔊 Auto-Speak AI: ON</span>
            </>
          ) : (
            <>
              <VolumeX size={13} />
              <span>🔇 Auto-Speak AI: OFF</span>
            </>
          )}
        </button>
      </div>

      <div className="chat-interface-layout glass-card">
        {/* Messages list */}
        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === 'ai' ? 'AI' : 'U'}
              </div>
              <div className="chat-bubble-bubble" style={{ position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.25rem' }}>
                  <p className="bubble-text" style={{ margin: 0, flex: 1 }}>{msg.text}</p>
                  {msg.sender === 'ai' && (
                    <button
                      type="button"
                      onClick={() => speakText(msg.text, msg.id)}
                      className={`bubble-speak-btn ${activeSpeakingId === msg.id ? 'speaking' : ''}`}
                      title={activeSpeakingId === msg.id ? 'Stop speaking' : 'Read aloud'}
                      style={{ background: 'transparent', border: 'none', color: activeSpeakingId === msg.id ? 'var(--accent-error)' : 'var(--text-muted)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', transition: 'color 0.2s ease', marginTop: '2px' }}
                    >
                      {activeSpeakingId === msg.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    </button>
                  )}
                </div>

                {/* Sub-structures of resources/projects if available */}
                {msg.data && (
                  <div className="chatbot-meta-blocks animate-fade-in">
                    {msg.data.learningResources?.length > 0 && (
                      <div className="meta-block">
                        <h5>
                          <Compass size={14} className="block-icon" />
                          <span>Suggested Reference Guides</span>
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
                          <span>Recommended Coding Projects</span>
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
                          <span>Interactive Learning Courses</span>
                        </h5>
                        <div className="meta-links-list">
                          {msg.data.courses.map((item, i) => (
                            <span key={i} className="meta-tag-item purple">{item}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="chat-bubble-row ai loading">
              <div className="chat-avatar">AI</div>
              <div className="chat-bubble-bubble">
                <div className="typing-loader">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Preset query helpers */}
        <div className="chatbot-preset-queries">
          {[
            'How to become Full Stack Developer?',
            'List DSA roadmap for MAANG placements',
            'Suggest Node/React portfolio projects'
          ].map((prompt, idx) => (
            <button
              key={idx}
              className="preset-prompt-btn"
              onClick={() => sendQuery(prompt)}
              disabled={loading}
            >
              <Sparkles size={12} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Text submit box */}
        <form onSubmit={handleSend} className="chat-input-bar" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder={isListening ? "Listening... Speak your career query now!" : "Type your career query (e.g. How to prepare for System Design, explain REST APIs)..."}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading || isListening}
            className="chat-text-input-field"
            style={{ flex: 1 }}
          />
          <div className="chat-actions-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
            <button
              type="button"
              onClick={toggleListen}
              className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Stop listening' : 'Talk to AI (Voice Input)'}
              disabled={loading}
            >
              <Mic size={16} />
            </button>
            <button type="submit" className="chat-send-btn" disabled={!inputVal.trim() || loading || isListening}>
              <Send size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CareerChatbot;
