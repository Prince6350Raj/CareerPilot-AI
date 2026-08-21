import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
    setIsHovered(false);
  };

  const showSidebar = isSidebarOpen || isHovered;

  return (
    <div className="app-container">
      {/* Mobile Top Header Bar */}
      <div className="mobile-header glass-card">
        <button className="mobile-menu-btn" onClick={toggleSidebar} aria-label="Toggle Navigation">
          <Menu size={24} />
        </button>
        <div className="mobile-logo">
          <span className="logo-text" style={{ fontSize: '1.2rem' }}>CareerPilot <span className="logo-highlight">AI</span></span>
        </div>
        <div style={{ width: '40px' }}></div> {/* Spacer to help balance the layout */}
      </div>

      {/* Translucent overlay backdrop on mobile */}
      {isSidebarOpen && <div className="sidebar-backdrop" onClick={closeSidebar}></div>}

      {/* Invisible corner/edge hover trigger at the left of the screen for desktop */}
      <div 
        className="sidebar-hover-trigger" 
        onMouseEnter={() => setIsHovered(true)}
      />

      {/* Floating Toggle Menu Button for Desktop */}
      {!showSidebar && (
        <button 
          className="desktop-menu-toggle-btn glass-card" 
          onClick={toggleSidebar}
          title="Open Navigation Menu"
        >
          <Menu size={20} />
        </button>
      )}

      {/* Responsive Sidebar Drawer Wrapper */}
      <div 
        className={`sidebar-wrapper ${showSidebar ? 'open' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => {
          // Close sidebar when clicking links or buttons inside it
          if (e.target.closest('a') || e.target.closest('button')) {
            closeSidebar();
          }
        }}
      >
        <Sidebar />
      </div>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
