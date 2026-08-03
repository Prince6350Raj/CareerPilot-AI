import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Send, Sparkles, BookOpen, Compass, Award, Terminal } from 'lucide-react';
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
  const chatBottomRef = useRef(null);

  const scrollToBottom = () => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

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
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: 'ai',
            text: data.data.answer,
            data: data.data
          }
        ]);
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
      <p className="page-subtitle">Interact with our generative advisor chatbot to clear up roadmap confusion, outline coding projects, and discover online training courses.</p>

      <div className="chat-interface-layout glass-card">
        {/* Messages list */}
        <div className="chat-messages-container">
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-bubble-row ${msg.sender}`}>
              <div className="chat-avatar">
                {msg.sender === 'ai' ? 'AI' : 'U'}
              </div>
              <div className="chat-bubble-bubble">
                <p className="bubble-text">{msg.text}</p>

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
        <form onSubmit={handleSend} className="chat-input-bar">
          <input
            type="text"
            placeholder="Type your career query (e.g. How to prepare for System Design, explain REST APIs)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={loading}
            className="chat-text-input-field"
          />
          <button type="submit" className="chat-send-btn" disabled={!inputVal.trim() || loading}>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default CareerChatbot;
