import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

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

      {/* Responsive Sidebar Drawer Wrapper */}
      <div className={`sidebar-wrapper ${isSidebarOpen ? 'open' : ''}`} onClick={closeSidebar}>
        <Sidebar />
      </div>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
