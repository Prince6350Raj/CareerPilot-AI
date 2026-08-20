import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Upload, Trash2, CheckCircle2, AlertTriangle, Clock, AlertCircle, FileText, Briefcase, FileSignature, Layers, ArrowRight, Download } from 'lucide-react';
import './ResumeAnalyzer.css';

const ResumeAnalyzer = () => {
  const { token, API_URL } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [error, setError] = useState('');
  
  // Tab states: 'ats', 'compare', 'coverletter', 'versions'
  const [activeTab, setActiveTab] = useState('ats');

  // AI Comparison states
  const [targetRole, setTargetRole] = useState('Fullstack Developer');
  const [comparing, setComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  // Cover Letter states
  const [jobDescription, setJobDescription] = useState('');
  const [generatingLetter, setGeneratingLetter] = useState(false);
  const [coverLetterResult, setCoverLetterResult] = useState('');

  // Version Comparison selection states
  const [vSelectedA, setVSelectedA] = useState('');
  const [vSelectedB, setVSelectedB] = useState('');
  const [versionDiff, setVersionDiff] = useState(null);

  // Resume Builder States
  const [personal, setPersonal] = useState({
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
    leetcode: '',
    summary: ''
  });

  const [experience, setExperience] = useState([
    { company: '', position: '', duration: '', description: '' }
  ]);

  const [education, setEducation] = useState([
    { institution: '', degree: '', duration: '', grade: '' }
  ]);

  const [projects, setProjects] = useState([
    { name: '', tech: '', description: '' }
  ]);

  const [skills, setSkills] = useState('');
  const [languages, setLanguages] = useState('');
  const [certificates, setCertificates] = useState([
    { title: '', organization: '', date: '' }
  ]);
  const [analyzingBuilt, setAnalyzingBuilt] = useState(false);

  const handleAddCertificate = () => {
    setCertificates([...certificates, { title: '', organization: '', date: '' }]);
  };
  const handleRemoveCertificate = (index) => {
    const list = [...certificates];
    list.splice(index, 1);
    setCertificates(list);
  };
  const handleCertificateChange = (index, field, value) => {
    const list = [...certificates];
    list[index][field] = value;
    setCertificates(list);
  };

  // Layout & Color Customization States
  const [selectedTemplate, setSelectedTemplate] = useState('classic');
  const [colorTheme, setColorTheme] = useState('charcoal');
  const [profileImage, setProfileImage] = useState(null);

  const colorThemesList = [
    { id: 'charcoal', name: 'Charcoal', primary: '#2d3748', secondary: '#4a5568', text: '#ffffff' },
    { id: 'navy', name: 'Navy Blue', primary: '#1e3a8a', secondary: '#3b82f6', text: '#ffffff' },
    { id: 'emerald', name: 'Emerald', primary: '#065f46', secondary: '#10b981', text: '#ffffff' },
    { id: 'violet', name: 'Violet', primary: '#4c1d95', secondary: '#8b5cf6', text: '#ffffff' },
    { id: 'bronze', name: 'Bronze', primary: '#78350f', secondary: '#d97706', text: '#ffffff' },
    { id: 'burgundy', name: 'Burgundy', primary: '#7f1d1d', secondary: '#ef4444', text: '#ffffff' }
  ];

  const currentTheme = colorThemesList.find(t => t.id === colorTheme) || colorThemesList[0];

  const canvasStyles = {
    '--theme-primary': currentTheme.primary,
    '--theme-secondary': currentTheme.secondary,
    '--theme-text-light': currentTheme.text
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image file is too large. Max size is 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const handleLoadDemoData = () => {
    setPersonal({
      fullName: 'PRINCE RAJ',
      title: 'FULLSTACK DEVELOPER',
      email: 'princerajceo@gmail.com',
      phone: '+91-6367279950, +91-9693205299',
      location: 'Panipat- 132145',
      linkedin: 'linkedin.com/in/princeraj123',
      github: 'github.com/prince6350raj',
      leetcode: 'leetcode.com/prince_rajx',
      summary: 'B.Tech Computer Science undergraduate proficient in C, C++, Python, and Java and hands-on experience in web development. Skilled in building responsive applications using HTML, CSS, Bootstrap, JavaScript, and React.js with backend knowledge in PHP and Next.js. Focused on applying problem-solving skills to develop efficient software solutions while expanding knowledge in cyber security and cloud technologies.'
    });

    setExperience([
      {
        company: 'Softsynth',
        position: 'Web Development Intern',
        duration: 'June,2026 -- July,2026',
        description: '• Developed and deployed responsive web pages using HTML, CSS, and JavaScript to enhance user experience.\n• Worked on an E-commerce & Job alert website project, integrating product listings, shopping cart, and checkout functionality.'
      },
      {
        company: 'Geeta University',
        position: 'Python Development Intern',
        duration: 'June,2025 - Aug,2025',
        description: '• Developed interactive data visualizations using Plotly to analyze global development and EV adoption trends.\n• Built a secure password manager application using Python and Tkinter for enhanced security and user-friendly access.'
      }
    ]);

    setEducation([
      {
        institution: 'Geeta University, Panipat',
        degree: 'B.Tech in Computer Science & Eng.',
        duration: '2023 - Present',
        grade: '8.84/10 CGPA'
      },
      {
        institution: 'Bihar School Examination Board',
        degree: 'Intermediate',
        duration: '2021',
        grade: '72.6 %'
      },
      {
        institution: 'Jesus & Mary Academy, Darbhanga',
        degree: 'Matriculation',
        duration: '2018',
        grade: '7 CGPA'
      }
    ]);

    setProjects([
      {
        name: 'Visualization of Electric Vehicle Adoption Trends (Individual)',
        tech: 'Python, Plotly, Pandas & Matplotlib',
        description: '• About: Developed interactive data visualizations to analyze global trends in electric vehicle adoption.\n• Role: Designed and implemented data visualizations using Python and Plotly.'
      },
      {
        name: 'Job Alert Website (Group 2 people)',
        tech: 'Next.js, NestJS, TypeScript, REST API',
        description: '• About: Built a online job portal platform delivering real-time updates on government jobs, results, admit cards, and recruitment notifications.\n• Role: Developed a scalable frontend with Next.js and backend services with NestJS, including API development.'
      }
    ]);

    setSkills('Technical Language: DSA (C++).\nFullstack Development : HTML, CSS, Bootstrap, JavaScript, React.js, Next.js, Firebase.\nOther: Cloud Computing & Cybersecurity.');
    
    setLanguages('Hindi, English');

    setCertificates([
      { title: 'Simplilearn Certification', organization: 'Google Cloud Platform', date: 'March 2026' },
      { title: 'Microsoft Certification', organization: 'Fullstack Development', date: 'June 2025' },
      { title: 'Cisco Certification', organization: 'Networking Basics', date: 'February 2024' },
      { title: 'Great Learning Certificate', organization: 'PYTHON Language', date: 'Jan 2024' },
      { title: 'Great Learning Certificate', organization: 'C Language', date: 'December 2023' }
    ]);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { company: '', position: '', duration: '', description: '' }]);
  };
  const handleRemoveExperience = (index) => {
    const list = [...experience];
    list.splice(index, 1);
    setExperience(list);
  };
  const handleExperienceChange = (index, field, value) => {
    const list = [...experience];
    list[index][field] = value;
    setExperience(list);
  };

  const handleAddEducation = () => {
    setEducation([...education, { institution: '', degree: '', duration: '' }]);
  };
  const handleRemoveEducation = (index) => {
    const list = [...education];
    list.splice(index, 1);
    setEducation(list);
  };
  const handleEducationChange = (index, field, value) => {
    const list = [...education];
    list[index][field] = value;
    setEducation(list);
  };

  const handleAddProject = () => {
    setProjects([...projects, { name: '', tech: '', description: '' }]);
  };
  const handleRemoveProject = (index) => {
    const list = [...projects];
    list.splice(index, 1);
    setProjects(list);
  };
  const handleProjectChange = (index, field, value) => {
    const list = [...projects];
    list[index][field] = value;
    setProjects(list);
  };

  const serializeResumeText = () => {
    let text = `${personal.fullName.toUpperCase()}\n`;
    if (personal.title) text += `${personal.title}\n`;
    text += `${personal.email} | ${personal.phone} | ${personal.location}\n`;
    if (personal.linkedin || personal.github || personal.leetcode) {
      text += `${personal.linkedin ? 'LinkedIn: ' + personal.linkedin : ''} ${personal.github ? 'GitHub: ' + personal.github : ''} ${personal.leetcode ? 'LeetCode: ' + personal.leetcode : ''}\n`;
    }
    text += `\n`;

    if (personal.summary) {
      text += `SUMMARY\n${personal.summary}\n\n`;
    }

    if (experience.length > 0 && experience[0].company) {
      text += `WORK EXPERIENCE\n`;
      experience.forEach(exp => {
        text += `${exp.company} - ${exp.position} (${exp.duration})\n${exp.description}\n\n`;
      });
    }

    if (education.length > 0 && education[0].institution) {
      text += `EDUCATION\n`;
      education.forEach(edu => {
        text += `${edu.institution} - ${edu.degree} (${edu.duration})${edu.grade ? ' | Grade: ' + edu.grade : ''}\n\n`;
      });
    }

    if (projects.length > 0 && projects[0].name) {
      text += `PROJECTS\n`;
      projects.forEach(p => {
        text += `${p.name} (${p.tech})\n${p.description}\n\n`;
      });
    }

    if (certificates.length > 0 && certificates[0].title) {
      text += `CERTIFICATES\n`;
      certificates.forEach(c => {
        text += `${c.title} - ${c.organization} (${c.date})\n`;
      });
      text += `\n`;
    }

    if (skills) {
      text += `SKILLS\n${skills}\n\n`;
    }

    if (languages) {
      text += `LANGUAGES\n${languages}\n`;
    }

    return text;
  };

  const handleAnalyzeBuiltResume = async () => {
    if (!personal.fullName) {
      setError('Please provide at least your full name before analyzing.');
      return;
    }

    setAnalyzingBuilt(true);
    setError('');
    const serializedText = serializeResumeText();

    try {
      const res = await fetch(`${API_URL}/resume/analyze-built`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeText: serializedText })
      });
      const data = await res.json();
      if (data.success) {
        setHistory([data.data, ...history]);
        setActiveResume(data.data);
        setActiveTab('ats');
      } else {
        setError(data.message || 'Failed to analyze built resume.');
      }
    } catch (err) {
      setError('Network communication timeout.');
    } finally {
      setAnalyzingBuilt(false);
    }
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById('resume-preview-container');
    if (!element) return;

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const originalStyle = element.style.cssText;
      element.style.width = '794px';
      element.style.background = '#ffffff';
      element.style.color = '#000000';
      element.style.padding = '30px';
      element.style.boxShadow = 'none';

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      element.style.cssText = originalStyle;

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${personal.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/resume/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHistory(data.data);
        if (data.data.length > 0 && !activeResume) {
          setActiveResume(data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching resume history:', err);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, API_URL]);

  const handleFileChange = (e) => {
    setError('');
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      setError('Please select a valid PDF document.');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError('');
    setStatusMessage('Extracting PDF text structures...');

    const formData = new FormData();
    formData.append('resume', file);

    const stage1 = setTimeout(() => setStatusMessage('Evaluating keyword matches via Gemini AI...'), 2000);
    const stage2 = setTimeout(() => setStatusMessage('Compiling feedback & scoring parameters...'), 4500);

    try {
      const res = await fetch(`${API_URL}/resume/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      clearTimeout(stage1);
      clearTimeout(stage2);

      if (data.success) {
        setActiveResume(data.data);
        setFile(null);
        fetchHistory();
      } else {
        setError(data.message || 'ATS Scanning failed.');
      }
    } catch (err) {
      clearTimeout(stage1);
      clearTimeout(stage2);
      setError('Server response timeout. Check connection.');
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Remove this scan from history?')) return;
    try {
      const res = await fetch(`${API_URL}/resume/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        if (activeResume?._id === id) {
          setActiveResume(history.find(r => r._id !== id) || null);
        }
        fetchHistory();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Trigger Role Comparison
  const handleCompareRole = async () => {
    if (!activeResume) return;
    setComparing(true);
    setComparisonResult(null);
    try {
      const res = await fetch(`${API_URL}/resume/compare-role`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: activeResume._id, jobRole: targetRole })
      });
      const data = await res.json();
      if (data.success) {
        setComparisonResult(data.data);
      } else {
        setError(data.message || 'Failed to compare resume.');
      }
    } catch (err) {
      setError('Comparison failed. Server error.');
    } finally {
      setComparing(false);
    }
  };

  // Generate Cover Letter
  const handleGenerateCoverLetter = async () => {
    if (!activeResume || !jobDescription.trim()) return;
    setGeneratingLetter(true);
    setCoverLetterResult('');
    try {
      const res = await fetch(`${API_URL}/resume/cover-letter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resumeId: activeResume._id, jobDescription: jobDescription.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setCoverLetterResult(data.data.coverLetterText);
      } else {
        setError(data.message || 'Failed to generate cover letter.');
      }
    } catch (err) {
      setError('Cover letter failed. Server error.');
    } finally {
      setGeneratingLetter(false);
    }
  };

  // Run Version History Comparison (Client-side Diff)
  const handleVersionCompare = () => {
    if (!vSelectedA || !vSelectedB) return;
    const resumeA = history.find(r => r._id === vSelectedA);
    const resumeB = history.find(r => r._id === vSelectedB);
    if (!resumeA || !resumeB) return;

    // Diff calculations: V_B (Newer) - V_A (Older)
    const scoreDiff = resumeB.atsScore - resumeA.atsScore;
    
    // Skills diff: in B but not in A
    const skillsAdded = resumeB.detectedSkills?.filter(s => !resumeA.detectedSkills?.includes(s)) || [];

    setVersionDiff({
      scoreA: resumeA.atsScore,
      scoreB: resumeB.atsScore,
      scoreDiff: scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff.toString(),
      skillsAdded,
      breakdownA: resumeA.breakdown,
      breakdownB: resumeB.breakdown
    });
  };

  const handlePrintCoverLetter = () => {
    window.print();
  };

  return (
    <div className="resume-analyzer-view">
      <h1 className="page-title">ATS Resume Hub</h1>
      <p className="page-subtitle">Manage resume versions and check job role suitability.</p>

      {/* Tab Select Header */}
      <div className="resume-tabs-row glass-card">
        {[
          { id: 'ats', label: 'ATS Audit Report', icon: FileText },
          { id: 'compare', label: 'AI Role Suitability', icon: Briefcase },
          { id: 'versions', label: 'Version Diff History', icon: Layers },
          { id: 'builder', label: 'Resume Builder', icon: FileSignature }
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`tab-btn-item ${activeTab === t.id ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      <div className="analyzer-split-layout">
        {/* Left side: Version List & Upload */}
        <div className="analyzer-sidebar">
          {/* File Upload Box */}
          <div className="upload-box-card glass-card">
            <h3 className="card-mini-title">Upload New Resume</h3>
            <form onSubmit={handleUpload} className="upload-form">
              <label className="drag-drop-label">
                <Upload size={32} className="upload-icon-style" />
                <span className="upload-primary-text">Select Resume PDF</span>
                <span className="upload-secondary-text">PDF format, max 5MB</span>
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden-file-input"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <div className="file-preview-indicator">
                  <CheckCircle2 size={16} className="green-tick" />
                  <span className="file-name-text">{file.name}</span>
                </div>
              )}

              {error && <p className="upload-error-lbl">{error}</p>}

              <button
                type="submit"
                className="btn btn-primary upload-submit"
                disabled={!file || loading}
              >
                {loading ? 'Analyzing...' : 'Scan Resume'}
              </button>
            </form>

            {loading && (
              <div className="scan-loader-overlay">
                <div className="spinner-loader"></div>
                <p className="loader-status-text">{statusMessage}</p>
              </div>
            )}
          </div>

          {/* History list */}
          <div className="scan-history-card glass-card">
            <h3 className="card-mini-title">Scan History</h3>
            <div className="history-list-items">
              {history.map((item, index) => (
                <div
                  key={item._id}
                  className={`history-item ${activeResume?._id === item._id ? 'active' : ''}`}
                  onClick={() => setActiveResume(item)}
                >
                  <div className="history-meta">
                    <span className="history-date">
                      V{history.length - index}: {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="history-score">{item.atsScore}% ATS</span>
                  </div>
                  <button className="delete-history-btn" onClick={(e) => handleDelete(item._id, e)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {history.length === 0 && (
                <p className="empty-text">No previous scans found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Tab Contents Panel */}
        <div className="analyzer-results-panel">
          {activeTab === 'builder' ? (
            <div className="resume-builder-workspace animate-fade-in">
              {/* Customization control bar (Canva style) */}
              <div className="builder-control-bar glass-card">
                <div className="control-section">
                  <span className="control-label">TEMPLATE STYLE</span>
                  <div className="template-selectors-row">
                    <button
                      type="button"
                      className={`control-btn ${selectedTemplate === 'classic' ? 'active' : ''}`}
                      onClick={() => setSelectedTemplate('classic')}
                    >
                      Classic Professional
                    </button>
                    <button
                      type="button"
                      className={`control-btn ${selectedTemplate === 'sidebar' ? 'active' : ''}`}
                      onClick={() => setSelectedTemplate('sidebar')}
                    >
                      Modern Sidebar
                    </button>
                    <button
                      type="button"
                      className={`control-btn ${selectedTemplate === 'banner' ? 'active' : ''}`}
                      onClick={() => setSelectedTemplate('banner')}
                    >
                      Executive Banner
                    </button>
                  </div>
                </div>

                <div className="control-section">
                  <span className="control-label">THEME COLOR</span>
                  <div className="color-swatches-row">
                    {colorThemesList.map(t => (
                      <button
                        key={t.id}
                        type="button"
                        className={`color-swatch-circle ${colorTheme === t.id ? 'active' : ''}`}
                        style={{ backgroundColor: t.primary }}
                        title={t.name}
                        onClick={() => setColorTheme(t.id)}
                      />
                    ))}
                  </div>
                </div>

                <div className="control-section load-demo-section">
                  <button
                    type="button"
                    onClick={handleLoadDemoData}
                    className="btn btn-secondary btn-sm load-demo-btn"
                  >
                    Load Canva Demo Data
                  </button>
                </div>
              </div>

              <div className="builder-split-editor">
                {/* Left: Input Form */}
                <div className="builder-form-panel glass-card">
                  <h3 className="section-title">Resume Information Editor</h3>
                  
                  <div className="builder-form-section">
                    <h4>1. Contact Details</h4>
                    <div className="form-grid-2">
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-fullname">Full Name</label>
                        <input
                          type="text"
                          id="b-fullname"
                          className="form-control"
                          placeholder="e.g. Ashutosh"
                          value={personal.fullName}
                          onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-title">Professional Title</label>
                        <input
                          type="text"
                          id="b-title"
                          className="form-control"
                          placeholder="e.g. Fullstack Developer"
                          value={personal.title}
                          onChange={(e) => setPersonal({ ...personal, title: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-email">Email Address</label>
                        <input
                          type="email"
                          id="b-email"
                          className="form-control"
                          placeholder="email@example.com"
                          value={personal.email}
                          onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-phone">Phone Number</label>
                        <input
                          type="text"
                          id="b-phone"
                          className="form-control"
                          placeholder="+91 XXXXX XXXXX"
                          value={personal.phone}
                          onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-location">Location</label>
                        <input
                          type="text"
                          id="b-location"
                          className="form-control"
                          placeholder="e.g. Delhi, India"
                          value={personal.location}
                          onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-linkedin">LinkedIn URL</label>
                        <input
                          type="text"
                          id="b-linkedin"
                          className="form-control"
                          placeholder="linkedin.com/in/username"
                          value={personal.linkedin}
                          onChange={(e) => setPersonal({ ...personal, linkedin: e.target.value })}
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-github">GitHub Profile</label>
                        <input
                          type="text"
                          id="b-github"
                          className="form-control"
                          placeholder="github.com/username"
                          value={personal.github}
                          onChange={(e) => setPersonal({ ...personal, github: e.target.value })}
                        />
                      </div>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="b-leetcode">LeetCode Profile (Optional)</label>
                        <input
                          type="text"
                          id="b-leetcode"
                          className="form-control"
                          placeholder="leetcode.com/username"
                          value={personal.leetcode}
                          onChange={(e) => setPersonal({ ...personal, leetcode: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Profile Photo (Optional)</label>
                        <div className="profile-photo-uploader-row">
                          {profileImage ? (
                            <div className="uploaded-photo-preview-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <img src={profileImage} alt="Profile preview" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }} />
                              <button type="button" onClick={handleRemoveImage} className="btn btn-secondary btn-xs" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
                                Remove Photo
                              </button>
                            </div>
                          ) : (
                            <div className="photo-upload-input-wrapper">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="photo-file-input"
                                id="photo-uploader-input"
                                style={{ display: 'none' }}
                              />
                              <label htmlFor="photo-uploader-input" className="photo-upload-label" style={{ display: 'inline-block', padding: '0.4rem 0.8rem', background: 'var(--bg-item)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.8-rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                Choose Photo (PNG/JPG)
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="builder-form-section">
                    <h4>2. Summary Statement</h4>
                    <div className="form-group">
                      <textarea
                        id="b-summary"
                        className="form-control textarea-field"
                        placeholder="Write a short summary about your professional background and goals..."
                        rows={3}
                        value={personal.summary}
                        onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="builder-form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0 }}>3. Work Experience</h4>
                      <button onClick={handleAddExperience} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>+ Add Job</button>
                    </div>
                    {experience.map((exp, idx) => (
                      <div key={idx} className="builder-repeater-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="repeater-index-lbl">Experience #{idx + 1}</span>
                          {experience.length > 1 && (
                            <button onClick={() => handleRemoveExperience(idx)} className="delete-repeater-btn" title="Remove Job">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
                          <div className="form-group">
                            <label className="form-label">Company Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Google"
                              value={exp.company}
                              onChange={(e) => handleExperienceChange(idx, 'company', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Position/Role</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Frontend Engineer"
                              value={exp.position}
                              onChange={(e) => handleExperienceChange(idx, 'position', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Duration (e.g. June 2021 - Present)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="June 2021 - Present"
                              value={exp.duration}
                              onChange={(e) => handleExperienceChange(idx, 'duration', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Key Achievements & Duties</label>
                            <textarea
                              className="form-control textarea-field"
                              placeholder="Describe your responsibilities, technologies used, and metrics (e.g. Optimized queries reducing load by 20%)..."
                              rows={2}
                              value={exp.description}
                              onChange={(e) => handleExperienceChange(idx, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="builder-form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0 }}>4. Education</h4>
                      <button onClick={handleAddEducation} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>+ Add School</button>
                    </div>
                    {education.map((edu, idx) => (
                      <div key={idx} className="builder-repeater-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="repeater-index-lbl">Education #{idx + 1}</span>
                          {education.length > 1 && (
                            <button onClick={() => handleRemoveEducation(idx)} className="delete-repeater-btn" title="Remove Education">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
                          <div className="form-group">
                            <label className="form-label">Institution Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Geeta University"
                              value={edu.institution}
                              onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Degree / Field of Study</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. B.Tech Computer Science"
                              value={edu.degree}
                              onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Duration (e.g. 2023 - Present)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="2023 - Present"
                              value={edu.duration}
                              onChange={(e) => handleEducationChange(idx, 'duration', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Grade / CGPA (e.g. 8.84/10 CGPA)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. 8.84/10 CGPA or 72.6 %"
                              value={edu.grade}
                              onChange={(e) => handleEducationChange(idx, 'grade', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="builder-form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0 }}>5. Projects</h4>
                      <button onClick={handleAddProject} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>+ Add Project</button>
                    </div>
                    {projects.map((p, idx) => (
                      <div key={idx} className="builder-repeater-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="repeater-index-lbl">Project #{idx + 1}</span>
                          {projects.length > 1 && (
                            <button onClick={() => handleRemoveProject(idx)} className="delete-repeater-btn" title="Remove Project">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
                          <div className="form-group">
                            <label className="form-label">Project Name</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. E-Commerce Portal"
                              value={p.name}
                              onChange={(e) => handleProjectChange(idx, 'name', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Technologies Used</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. React, Node.js, MongoDB"
                              value={p.tech}
                              onChange={(e) => handleProjectChange(idx, 'tech', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Project Description</label>
                            <textarea
                              className="form-control textarea-field"
                              placeholder="Describe the project features, architecture, and deployment status..."
                              rows={2}
                              value={p.description}
                              onChange={(e) => handleProjectChange(idx, 'description', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="builder-form-section">
                    <h4>6. Technical Skills</h4>
                    <div className="form-group">
                      <label className="form-label" htmlFor="b-skills">Skills & Categories (Multi-line or Comma-separated)</label>
                      <textarea
                        id="b-skills"
                        className="form-control textarea-field"
                        placeholder="e.g. Technical Language: DSA (C++).&#10;Fullstack Development: React, Node.js, etc."
                        rows={3}
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="builder-form-section">
                    <h4>7. Languages</h4>
                    <div className="form-group">
                      <label className="form-label" htmlFor="b-languages">Languages (Comma-separated)</label>
                      <input
                        type="text"
                        id="b-languages"
                        className="form-control"
                        placeholder="e.g. Hindi, English"
                        value={languages}
                        onChange={(e) => setLanguages(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="builder-form-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <h4 style={{ margin: 0 }}>8. Certificates</h4>
                      <button type="button" onClick={handleAddCertificate} className="btn btn-secondary btn-sm" style={{ padding: '0.4rem 0.8rem' }}>+ Add Certificate</button>
                    </div>
                    {certificates.map((cert, idx) => (
                      <div key={idx} className="builder-repeater-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="repeater-index-lbl">Certificate #{idx + 1}</span>
                          {certificates.length > 1 && (
                            <button type="button" onClick={() => handleRemoveCertificate(idx)} className="delete-repeater-btn" title="Remove Certificate">
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                        <div className="form-grid-2" style={{ marginTop: '0.5rem' }}>
                          <div className="form-group">
                            <label className="form-label">Certificate Title</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Simplilearn Certification"
                              value={cert.title}
                              onChange={(e) => handleCertificateChange(idx, 'title', e.target.value)}
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Organization / Authority</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="e.g. Google Cloud Platform"
                              value={cert.organization}
                              onChange={(e) => handleCertificateChange(idx, 'organization', e.target.value)}
                            />
                          </div>
                          <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label className="form-label">Issued Date (e.g. March 2026)</label>
                            <input
                              type="text"
                              className="form-control"
                              placeholder="March 2026"
                              value={cert.date}
                              onChange={(e) => handleCertificateChange(idx, 'date', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="builder-actions-row" style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                    <button
                      onClick={handleAnalyzeBuiltResume}
                      className="btn btn-primary"
                      style={{ flex: 1, justifyContent: 'center' }}
                      disabled={analyzingBuilt || !personal.fullName}
                    >
                      {analyzingBuilt ? 'Analyzing Built Resume...' : 'Analyze Built Resume'}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      className="btn btn-secondary"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
                      disabled={!personal.fullName}
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                </div>

                {/* Right: Live Preview Panel */}
                <div className="builder-preview-panel">
                  <div className="preview-header-bar">
                    <span>A4 LIVE RESUME PREVIEW</span>
                  </div>
                     <div className="preview-canvas-card" id="resume-preview-container" style={canvasStyles}>
                    {selectedTemplate === 'classic' && (
                      <div className="template-classic-root" style={{ textAlign: 'left', color: '#1a1a1a' }}>
                        <div className="preview-header-center" style={{ borderBottom: '2px solid var(--theme-primary)', paddingBottom: '0.75rem', textAlign: 'center', marginBottom: '1.25rem' }}>
                          {profileImage && (
                            <div className="p-photo-wrapper" style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'center' }}>
                              <img src={profileImage} alt="Profile" className="p-photo-classic" style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--theme-primary)' }} />
                            </div>
                          )}
                          <h1 className="p-fullname" style={{ color: 'var(--theme-primary)', fontSize: '1.75rem', fontWeight: 800, margin: 0 }}>{personal.fullName || 'YOUR NAME'}</h1>
                          {personal.title && <p className="p-title" style={{ color: 'var(--theme-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '4px 0 0 0' }}>{personal.title}</p>}
                          <div className="p-contact-row" style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', flexWrap: 'wrap', marginTop: '6px', color: '#4b5563' }}>
                            {personal.email && <span>{personal.email}</span>}
                            {personal.phone && <span> • {personal.phone}</span>}
                            {personal.location && <span> • {personal.location}</span>}
                          </div>
                          <div className="p-contact-row" style={{ display: 'flex', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', flexWrap: 'wrap', marginTop: '2px', color: '#4b5563' }}>
                            {personal.linkedin && <span>LinkedIn: {personal.linkedin}</span>}
                            {personal.github && <span> • GitHub: {personal.github}</span>}
                            {personal.leetcode && <span> • LeetCode: {personal.leetcode}</span>}
                          </div>
                        </div>

                        {personal.summary && (
                          <div className="preview-section" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PROFESSIONAL SUMMARY</h3>
                            <p className="p-text" style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#374151', margin: 0 }}>{personal.summary}</p>
                          </div>
                        )}

                        {experience.some(e => e.company) && (
                          <div className="preview-section" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>WORK EXPERIENCE</h3>
                            {experience.filter(e => e.company).map((exp, i) => (
                              <div key={i} className="p-item-node" style={{ marginBottom: '0.5rem' }}>
                                <div className="p-item-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#111111' }}>
                                  <span>{exp.company} — <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>{exp.position}</span></span>
                                  <span style={{ color: 'var(--theme-secondary)', fontWeight: 'normal' }}>{exp.duration}</span>
                                </div>
                                <p className="p-item-desc" style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#4b5563', margin: '2px 0 0 0', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {education.some(e => e.institution) && (
                          <div className="preview-section" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>EDUCATION</h3>
                            {education.filter(e => e.institution).map((edu, i) => (
                              <div key={i} className="p-item-node" style={{ marginBottom: '0.5rem' }}>
                                <div className="p-item-header" style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#111111' }}>
                                  <span>{edu.degree}</span>
                                  <span style={{ color: 'var(--theme-secondary)', fontWeight: 'normal' }}>{edu.duration}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#4b5563', marginTop: '2px' }}>
                                  <span>{edu.institution}</span>
                                  {edu.grade && <span style={{ fontWeight: 600 }}>{edu.grade}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {projects.some(p => p.name) && (
                          <div className="preview-section" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>PERSONAL PROJECTS</h3>
                            {projects.filter(p => p.name).map((proj, i) => (
                              <div key={i} className="p-item-node" style={{ marginBottom: '0.5rem' }}>
                                <div className="p-item-header" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111111' }}>
                                  <span>{proj.name} — <span style={{ fontWeight: 'normal', fontSize: '0.75rem', color: 'var(--theme-secondary)' }}>{proj.tech}</span></span>
                                </div>
                                <p className="p-item-desc" style={{ fontSize: '0.75rem', lineHeight: 1.4, color: '#4b5563', margin: '2px 0 0 0', whiteSpace: 'pre-wrap' }}>{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {certificates.some(c => c.title) && (
                          <div className="preview-section" style={{ borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>CERTIFICATES</h3>
                            {certificates.filter(c => c.title).map((cert, i) => (
                              <div key={i} style={{ fontSize: '0.75rem', color: '#374151', marginBottom: '3px', display: 'flex', justifyContent: 'space-between' }}>
                                <span>• <strong>{cert.title}</strong>: | {cert.organization}</span>
                                <span style={{ color: 'var(--theme-secondary)' }}>| {cert.date}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {skills && (
                          <div className="preview-section" style={{ borderBottom: 'none', paddingBottom: 0 }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>TECHNICAL SKILLS</h3>
                            <p className="p-text" style={{ fontSize: '0.8rem', lineHeight: 1.45, color: '#374151', margin: 0, whiteSpace: 'pre-wrap' }}>{skills}</p>
                          </div>
                        )}

                        {languages && (
                          <div className="preview-section" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: '0.75rem' }}>
                            <h3 className="p-section-title" style={{ color: 'var(--theme-primary)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>LANGUAGES</h3>
                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '1.2rem', fontSize: '0.8rem', color: '#374151' }}>
                              {languages.split(',').map((lang, idx) => (
                                <li key={idx} style={{ marginBottom: '2px' }}>{lang.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedTemplate === 'sidebar' && (
                      <div className="template-sidebar-root" style={{ display: 'grid', gridTemplateColumns: '3fr 7fr', minHeight: '297mm', margin: '-2.5rem -2rem', overflow: 'hidden' }}>
                        {/* Left Column (Gray/Light Blue Sidebar background) */}
                        <div className="template-sidebar-col" style={{ backgroundColor: '#f1f5f9', color: '#1e293b', padding: '2.5rem 1.25rem', borderRight: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '1.75rem', textAlign: 'left' }}>
                          <div style={{ textAlign: 'center' }}>
                            {profileImage ? (
                              <img src={profileImage} alt="Profile" style={{ width: '110px', height: '110px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--theme-primary)', display: 'inline-block', marginBottom: '0.5rem' }} />
                            ) : (
                              <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#cbd5e1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: '3px dashed #94a3b8', marginBottom: '0.5rem', fontSize: '0.8rem', color: '#64748b' }}>Photo</div>
                            )}
                          </div>

                          <div>
                            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.12em', borderBottom: '2px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--theme-primary)', textAlign: 'center' }}>C O N T A C T</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.72rem', color: '#334155' }}>
                              {personal.phone && (
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span>📞</span>
                                  <span>{personal.phone}</span>
                                </div>
                              )}
                              {personal.email && (
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span>✉</span>
                                  <span style={{ wordBreak: 'break-all' }}>{personal.email}</span>
                                </div>
                              )}
                              {personal.location && (
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span>📍</span>
                                  <span>{personal.location}</span>
                                </div>
                              )}
                              {personal.linkedin && (
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span>in</span>
                                  <span style={{ wordBreak: 'break-all' }}>{personal.linkedin}</span>
                                </div>
                              )}
                              {personal.github && (
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span>gh</span>
                                  <span style={{ wordBreak: 'break-all' }}>{personal.github}</span>
                                </div>
                              )}
                              {personal.leetcode && (
                                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                                  <span>lc</span>
                                  <span style={{ wordBreak: 'break-all' }}>{personal.leetcode}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {education.some(e => e.institution) && (
                            <div>
                              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.12em', borderBottom: '2px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--theme-primary)', textAlign: 'center' }}>E D U C A T I O N</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.72rem', color: '#334155' }}>
                                {education.filter(e => e.institution).map((edu, i) => (
                                  <div key={i} style={{ borderBottom: i < education.length - 1 ? '1px dashed #cbd5e1' : 'none', paddingBottom: '0.5rem' }}>
                                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>{edu.degree}</div>
                                    <div style={{ fontSize: '0.68rem', color: '#64748b', marginBottom: '4px' }}>{edu.institution}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 600 }}>
                                      <span>{edu.duration}</span>
                                      {edu.grade && <span style={{ color: 'var(--theme-secondary)' }}>{edu.grade}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {skills && (
                            <div>
                              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.12em', borderBottom: '2px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--theme-primary)', textAlign: 'center' }}>S K I L L S</h3>
                              <div style={{ fontSize: '0.72rem', color: '#334155', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                {skills}
                              </div>
                            </div>
                          )}

                          {languages && (
                            <div>
                              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.12em', borderBottom: '2px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase', color: 'var(--theme-primary)', textAlign: 'center' }}>L A N G U A G E S</h3>
                              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.75rem', color: '#334155' }}>
                                {languages.split(',').map((lang, idx) => (
                                  <li key={idx} style={{ marginBottom: '2px' }}>{lang.trim()}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Right Column (Timeline Thread) */}
                        <div className="template-sidebar-body" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem', backgroundColor: '#ffffff', color: '#1a1a1a', textAlign: 'left', position: 'relative' }}>
                          
                          {/* Vertical timeline line */}
                          <div className="vertical-timeline-line" style={{ position: 'absolute', left: '1.95rem', top: '10.5rem', bottom: '2.5rem', width: '2px', backgroundColor: '#cbd5e1', zIndex: 1 }}></div>

                          {/* Top Name Box Banner */}
                          <div style={{ backgroundColor: 'var(--theme-primary)', padding: '1.5rem', border: '3px double #ffffff', outline: '8px solid var(--theme-primary)', textAlign: 'center', marginBottom: '1rem', color: '#ffffff' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '0.15rem', margin: 0, color: '#ffffff' }}>{personal.fullName || 'YOUR NAME'}</h1>
                            {personal.title && <p style={{ fontSize: '0.85rem', letterSpacing: '0.1rem', textTransform: 'uppercase', opacity: 0.9, marginTop: '6px', margin: '6px 0 0 0', color: '#ffffff' }}>{personal.title}</p>}
                          </div>

                          {personal.summary && (
                            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                              {/* Bullet node on timeline */}
                              <div style={{ position: 'absolute', left: '-0.33rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--theme-primary)', border: '2px solid #ffffff', zIndex: 2 }}></div>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em', borderBottom: '1.5px solid #0f172a', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>S U M M A R Y</h3>
                              <p style={{ fontSize: '0.78rem', lineHeight: 1.5, color: '#374151', margin: 0 }}>{personal.summary}</p>
                            </div>
                          )}

                          {experience.some(e => e.company) && (
                            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                              {/* Bullet node on timeline */}
                              <div style={{ position: 'absolute', left: '-0.33rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--theme-primary)', border: '2px solid #ffffff', zIndex: 2 }}></div>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em', borderBottom: '1.5px solid #0f172a', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>I N T E R N S H I P   E X P E R I E N C E</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {experience.filter(e => e.company).map((exp, i) => (
                                  <div key={i} style={{ fontSize: '0.75rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, color: '#0f172a' }}>
                                      <span>• {exp.company} — <span style={{ fontWeight: 'normal', fontStyle: 'italic' }}>{exp.position}</span></span>
                                      <span style={{ fontWeight: 'normal', color: 'var(--theme-secondary)' }}>{exp.duration}</span>
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', lineHeight: 1.45, color: '#4b5563', whiteSpace: 'pre-wrap', paddingLeft: '0.8rem' }}>{exp.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {projects.some(p => p.name) && (
                            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                              {/* Bullet node on timeline */}
                              <div style={{ position: 'absolute', left: '-0.33rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--theme-primary)', border: '2px solid #ffffff', zIndex: 2 }}></div>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em', borderBottom: '1.5px solid #0f172a', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>P R O J E C T S</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                {projects.filter(p => p.name).map((proj, i) => (
                                  <div key={i} style={{ fontSize: '0.75rem' }}>
                                    <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '2px' }}>
                                      • {proj.name} <span style={{ fontWeight: 'normal', fontSize: '0.7rem', color: 'var(--theme-secondary)' }}>({proj.tech})</span>
                                    </div>
                                    <p style={{ margin: '4px 0 0 0', lineHeight: 1.45, color: '#4b5563', whiteSpace: 'pre-wrap', paddingLeft: '0.8rem' }}>{proj.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {certificates.some(c => c.title) && (
                            <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                              {/* Bullet node on timeline */}
                              <div style={{ position: 'absolute', left: '-0.33rem', top: '0.2rem', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--theme-primary)', border: '2px solid #ffffff', zIndex: 2 }}></div>
                              <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.1em', borderBottom: '1.5px solid #0f172a', paddingBottom: '3px', marginBottom: '0.75rem', textTransform: 'uppercase' }}>C E R T I F I C A T E S</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '0.5rem' }}>
                                {certificates.filter(c => c.title).map((cert, i) => (
                                  <div key={i} style={{ fontSize: '0.75rem', color: '#374151', display: 'flex', justifyContent: 'space-between' }}>
                                    <span>• <strong>{cert.title}</strong>: | {cert.organization}</span>
                                    <span style={{ color: 'var(--theme-secondary)' }}>| {cert.date}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedTemplate === 'banner' && (
                      <div className="template-banner-root" style={{ display: 'flex', flexDirection: 'column', minHeight: '297mm', margin: '-2.5rem -2rem', backgroundColor: '#ffffff', color: '#1a1a1a', textAlign: 'left' }}>
                        {/* Top banner */}
                        <div style={{ backgroundColor: 'var(--theme-primary)', color: 'var(--theme-text-light)', padding: '2.5rem 2rem 2rem 2rem', position: 'relative' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0', color: 'var(--theme-text-light)' }}>{personal.fullName || 'YOUR NAME'}</h1>
                              {personal.title && <p style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--theme-text-light)', margin: '4px 0 0 0' }}>{personal.title}</p>}
                            </div>
                            {profileImage && (
                              <img src={profileImage} alt="Profile" style={{ width: '90px', height: '90px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--theme-text-light)', display: 'inline-block' }} />
                            )}
                          </div>
                        </div>

                        {/* Split columns layout below */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', padding: '2rem', flex: 1 }}>
                          {/* Left Column: Summary, Exp, Projects */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {personal.summary && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Professional Summary</h3>
                                <p style={{ fontSize: '0.78rem', lineHeight: 1.45, color: '#374151', margin: 0 }}>{personal.summary}</p>
                              </div>
                            )}

                            {experience.some(e => e.company) && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Work Experience</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                  {experience.filter(e => e.company).map((exp, i) => (
                                    <div key={i} style={{ fontSize: '0.75rem' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: '#111111' }}>
                                        <span>{exp.company} — {exp.position}</span>
                                        <span style={{ fontWeight: 'normal', color: 'var(--theme-secondary)' }}>{exp.duration}</span>
                                      </div>
                                      <p style={{ margin: '3px 0 0 0', lineHeight: 1.4, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{exp.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {projects.some(p => p.name) && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Personal Projects</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {projects.filter(p => p.name).map((proj, i) => (
                                    <div key={i} style={{ fontSize: '0.75rem' }}>
                                      <div style={{ fontWeight: 700, color: '#111111' }}>{proj.name} <span style={{ fontWeight: 'normal', fontSize: '0.68rem', color: 'var(--theme-secondary)' }}>({proj.tech})</span></div>
                                      <p style={{ margin: '2px 0 0 0', lineHeight: 1.4, color: '#4b5563', whiteSpace: 'pre-wrap' }}>{proj.description}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right Column: Contact, Education, Skills */}
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', borderLeft: '1px solid #e5e7eb', paddingLeft: '1.5rem' }}>
                            <div>
                              <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Contact Info</h3>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.72rem', color: '#4b5563' }}>
                                {personal.email && <div>✉ {personal.email}</div>}
                                {personal.phone && <div>📞 {personal.phone}</div>}
                                {personal.location && <div>📍 {personal.location}</div>}
                                {personal.linkedin && <div>in: {personal.linkedin}</div>}
                                {personal.github && <div>gh: {personal.github}</div>}
                                {personal.leetcode && <div>lc: {personal.leetcode}</div>}
                              </div>
                            </div>

                            {education.some(e => e.institution) && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Education</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                  {education.filter(e => e.institution).map((edu, i) => (
                                    <div key={i} style={{ fontSize: '0.72rem' }}>
                                      <div style={{ fontWeight: 700, color: '#111111' }}>{edu.institution}</div>
                                      <div style={{ color: 'var(--theme-secondary)', margin: '1px 0' }}>{edu.duration}</div>
                                      <div style={{ color: '#4b5563' }}>{edu.degree} {edu.grade && <span style={{ fontWeight: 600 }}>({edu.grade})</span>}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {certificates.some(c => c.title) && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Certificates</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.72rem' }}>
                                  {certificates.filter(c => c.title).map((cert, i) => (
                                    <div key={i} style={{ color: '#374151' }}>
                                      • <strong>{cert.title}</strong>: {cert.organization} ({cert.date})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {skills && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Skills</h3>
                                <div style={{ fontSize: '0.72rem', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                  {skills}
                                </div>
                              </div>
                            )}

                            {languages && (
                              <div>
                                <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--theme-primary)', borderBottom: '1.5px solid var(--theme-primary)', paddingBottom: '3px', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Languages</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                                  {languages.split(',').map((s, i) => (
                                    <span key={i} style={{ fontSize: '0.68rem', padding: '0.15rem 0.4rem', background: '#f3f4f6', color: '#374151', borderRadius: '3px', border: '1px solid #e5e7eb' }}>
                                      {s.trim()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeResume ? (
            <>
              {/* TAB 1: ATS AUDIT */}
              {activeTab === 'ats' && (
                <div className="results-card glass-card animate-fade-in">
                  <div className="results-header-row">
                    <div>
                      <h2 className="results-panel-title">ATS Audit Report</h2>
                      <a href={activeResume.fileUrl} target="_blank" rel="noreferrer" className="resume-download-link">
                        View Scanned File Source
                      </a>
                    </div>
                    <div className="radial-score-box">
                      <div className="score-number-bubble">
                        <span className="score-val">{activeResume.atsScore}</span>
                        <span className="score-pct">%</span>
                      </div>
                      <span className="score-caption">ATS MATCH</span>
                    </div>
                  </div>

                  {/* Breakdown metrics */}
                  <div className="breakdown-grid">
                    {[
                      { name: 'Keyword Density', val: activeResume.breakdown?.keywordMatch || 0 },
                      { name: 'Formatting & Layout', val: activeResume.breakdown?.formatting || 0 },
                      { name: 'Impact & Action Verbs', val: activeResume.breakdown?.impactPhrases || 0 },
                      { name: 'Redundancy Filter', val: activeResume.breakdown?.redundancies || 0 }
                    ].map((metric, i) => (
                      <div key={i} className="breakdown-metric">
                        <div className="metric-header">
                          <span>{metric.name}</span>
                          <span>{metric.val}%</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${metric.val}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills Cloud */}
                  <div className="skills-cloud-section">
                    <h3 className="subsection-title">Skills Detected</h3>
                    <div className="tags-container">
                      {activeResume.detectedSkills?.map((skill, i) => (
                        <span key={i} className="skill-tag detected-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="skills-cloud-section">
                    <h3 className="subsection-title">Suggested High-Impact Skills</h3>
                    <div className="tags-container">
                      {activeResume.suggestedSkills?.map((skill, i) => (
                        <span key={i} className="skill-tag suggested-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  {/* Suggestions bullets */}
                  <div className="improvement-section">
                    <h3 className="subsection-title">Priority Fixes</h3>
                    <div className="feedback-bullets">
                      {activeResume.feedback?.map((tip, i) => (
                        <div key={i} className="feedback-bullet-item">
                          <AlertCircle className="bullet-icon-alert" size={16} />
                          <p>{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ROLE COMPARISON */}
              {activeTab === 'compare' && (
                <div className="results-card glass-card animate-fade-in">
                  <h2 className="results-panel-title" style={{ marginBottom: '0.5rem' }}>AI Resume Suitability</h2>
                  <p className="subsection-desc">Analyze how your active resume matches the requirements of a specific career role.</p>

                  <div className="compare-config-row">
                    <div className="form-group flex-1">
                      <label className="form-label" htmlFor="role-select">Target Career Role</label>
                      <select
                        id="role-select"
                        className="form-control"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                      >
                        <option value="Frontend Developer">Frontend Developer</option>
                        <option value="Backend Developer">Backend Developer</option>
                        <option value="Fullstack Developer">Fullstack Developer</option>
                        <option value="Python Engineer">Python Engineer</option>
                        <option value="DevOps & Cloud Engineer">DevOps & Cloud Engineer</option>
                        <option value="Data Structures Specialist">Data Structures Specialist</option>
                      </select>
                    </div>
                    <button onClick={handleCompareRole} className="btn btn-primary compare-btn" disabled={comparing}>
                      {comparing ? 'Comparing...' : 'Analyze Suitability'}
                    </button>
                  </div>

                  {comparisonResult && (
                    <div className="comparison-results-block animate-fade-in" style={{ marginTop: '2rem' }}>
                      <div className="results-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Match Suitability Analysis</h3>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role: {targetRole}</span>
                        </div>
                        <div className="radial-score-box">
                          <div className="score-number-bubble">
                            <span className="score-val">{comparisonResult.matchScore}</span>
                            <span className="score-pct">%</span>
                          </div>
                          <span className="score-caption">ROLE MATCH</span>
                        </div>
                      </div>

                      {/* Missing Keywords & Skills */}
                      <div className="comparison-details-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div className="comparative-block">
                          <h4 className="subsection-title" style={{ color: '#ef4444' }}>Missing Keywords</h4>
                          <div className="tags-container">
                            {comparisonResult.missingKeywords?.map((kw, i) => (
                              <span key={i} className="skill-tag detected-tag" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' }}>
                                ✕ {kw}
                              </span>
                            ))}
                            {(!comparisonResult.missingKeywords || comparisonResult.missingKeywords.length === 0) && (
                              <span className="empty-tag">No missing keywords found!</span>
                            )}
                          </div>
                        </div>

                        <div className="comparative-block">
                          <h4 className="subsection-title" style={{ color: '#ec4899' }}>Missing Skills</h4>
                          <div className="tags-container">
                            {comparisonResult.missingSkills?.map((skill, i) => (
                              <span key={i} className="skill-tag suggested-tag" style={{ border: '1px solid rgba(236, 72, 153, 0.3)', color: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.05)' }}>
                                ✕ {skill}
                              </span>
                            ))}
                            {(!comparisonResult.missingSkills || comparisonResult.missingSkills.length === 0) && (
                              <span className="empty-tag">No missing skills found!</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Suggestions advice */}
                      <div className="improvement-section" style={{ marginTop: '1.5rem' }}>
                        <h4 className="subsection-title">AI Optimization Recommendations</h4>
                        <div className="feedback-bullets">
                          {comparisonResult.recommendations?.map((tip, i) => (
                            <div key={i} className="feedback-bullet-item">
                              <AlertCircle className="bullet-icon-alert" size={16} />
                              <p>{tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: COVER LETTER REMOVED */}

              {/* TAB 4: VERSION HISTORY DIFF */}
              {activeTab === 'versions' && (
                <div className="results-card glass-card animate-fade-in">
                  <h2 className="results-panel-title" style={{ marginBottom: '0.5rem' }}>Version Diff Comparison</h2>
                  <p className="subsection-desc">Select any two scanned resumes to audit differences in scores and identified skills.</p>

                  <div className="version-selector-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1.5rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="version-a">Base Version (Older)</label>
                      <select
                        id="version-a"
                        className="form-control"
                        value={vSelectedA}
                        onChange={(e) => setVSelectedA(e.target.value)}
                      >
                        <option value="">Select version...</option>
                        {history.map((h, i) => (
                          <option key={h._id} value={h._id}>
                            V{history.length - i} ({new Date(h.createdAt).toLocaleDateString()}) - {h.atsScore}%
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="version-b">Comparison Version (Newer)</label>
                      <select
                        id="version-b"
                        className="form-control"
                        value={vSelectedB}
                        onChange={(e) => setVSelectedB(e.target.value)}
                      >
                        <option value="">Select version...</option>
                        {history.map((h, i) => (
                          <option key={h._id} value={h._id}>
                            V{history.length - i} ({new Date(h.createdAt).toLocaleDateString()}) - {h.atsScore}%
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleVersionCompare}
                    className="btn btn-primary"
                    disabled={!vSelectedA || !vSelectedB}
                    style={{ marginTop: '1rem', width: '100%', justifyContent: 'center' }}
                  >
                    Compare Selected Versions
                  </button>

                  {versionDiff && (
                    <div className="version-comparison-report animate-fade-in" style={{ marginTop: '2rem' }}>
                      <div className="results-header-row" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>Performance Improvement Report</h3>
                        </div>
                        <div className="radial-score-box">
                          <div className="score-number-bubble" style={{ borderColor: versionDiff.scoreDiff.startsWith('+') ? 'var(--accent-success)' : 'var(--primary)' }}>
                            <span className="score-val" style={{ color: versionDiff.scoreDiff.startsWith('+') ? 'var(--accent-success)' : 'var(--primary)' }}>
                              {versionDiff.scoreDiff}
                            </span>
                          </div>
                          <span className="score-caption">SCORE CHANGE</span>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="breakdown-grid" style={{ marginTop: '1.5rem' }}>
                        <div className="breakdown-metric">
                          <div className="metric-header">
                            <span>Base ATS Score (V_A)</span>
                            <span>{versionDiff.scoreA}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${versionDiff.scoreA}%` }}></div>
                          </div>
                        </div>

                        <div className="breakdown-metric">
                          <div className="metric-header">
                            <span>Comparison ATS Score (V_B)</span>
                            <span>{versionDiff.scoreB}%</span>
                          </div>
                          <div className="bar-track">
                            <div className="bar-fill" style={{ width: `${versionDiff.scoreB}%` }}></div>
                          </div>
                        </div>
                      </div>

                      {/* Added Skills block */}
                      <div className="skills-cloud-section" style={{ marginTop: '1.5rem' }}>
                        <h4 className="subsection-title" style={{ color: 'var(--accent-success)' }}>+ Skills Added in Version B</h4>
                        <div className="tags-container" style={{ marginTop: '0.75rem' }}>
                          {versionDiff.skillsAdded?.map((skill, i) => (
                            <span key={i} className="skill-tag detected-tag" style={{ borderColor: 'var(--accent-success)', color: 'var(--accent-success)', backgroundColor: 'rgba(16, 185, 129, 0.05)' }}>
                              ✓ {skill}
                            </span>
                          ))}
                          {(!versionDiff.skillsAdded || versionDiff.skillsAdded.length === 0) && (
                            <span className="empty-tag">No new skills added in this revision.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="empty-results glass-card">
              <Upload size={48} className="empty-results-icon" />
              <h3>No Resume Audited</h3>
              <p>Upload a PDF resume on the left sidebar to generate your first ATS keywords report.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
