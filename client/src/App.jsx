import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Roadmap from './pages/Roadmap';
import MockInterview from './pages/MockInterview';
import Progress from './pages/Progress';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import LearningResources from './pages/LearningResources';
import CompanyPrep from './pages/CompanyPrep';
import PortfolioReview from './pages/PortfolioReview';
import CareerChatbot from './pages/CareerChatbot';
import CodingChallenge from './pages/CodingChallenge';
import Settings from './pages/Settings';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  useEffect(() => {
    // Apply local storage custom user style configurations on boot
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', theme);

    const font = localStorage.getItem('app-font-family') || "'Plus Jakarta Sans', sans-serif";
    const size = localStorage.getItem('app-font-size') || "15px";
    const weight = localStorage.getItem('app-font-weight') || "normal";
    const style = localStorage.getItem('app-font-style') || "normal";
    const bgType = localStorage.getItem('app-bg-type') || "dynamic";

    document.documentElement.style.setProperty('--app-font-body', font);
    document.documentElement.style.setProperty('--app-font-size', size);
    document.documentElement.style.setProperty('--app-font-weight', weight);
    document.documentElement.style.setProperty('--app-font-style', style);
    
    document.documentElement.classList.toggle('flat-bg', bgType === 'flat');
    document.documentElement.classList.toggle('grid-bg', bgType === 'grid');
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Protected Routes inside Layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Redirect root to dashboard */}
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="mock-interview" element={<MockInterview />} />
            <Route path="resources" element={<LearningResources />} />
            <Route path="company-prep" element={<CompanyPrep />} />
            <Route path="portfolio-reviewer" element={<PortfolioReview />} />
            <Route path="chatbot" element={<CareerChatbot />} />
            <Route path="coding-challenge" element={<CodingChallenge />} />
            <Route path="progress" element={<Progress />} />
            <Route path="profile" element={<Profile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
          </Route>

          {/* Wildcard Route redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
