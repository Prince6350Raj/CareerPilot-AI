import React, { useState, useContext } from 'react';
import { Search, Video, Globe, BookOpen, ExternalLink, GraduationCap } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import './LearningResources.css';

const resourceData = [
  // DSA
  {
    id: 1,
    title: 'Supreme DSA Course by Love Babbar',
    category: 'dsa',
    provider: 'Love Babbar (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@CodeHelp',
    description: 'Highly structured complete DSA path in C++ with practice questions and conceptual explanations.',
    tags: ['DSA', 'C++', 'Placement Preparation']
  },
  {
    id: 2,
    title: 'Data Structures & Algorithms Self-Paced',
    category: 'dsa',
    provider: 'GeeksforGeeks (Website)',
    type: 'website',
    url: 'https://www.geeksforgeeks.org/data-structures/',
    description: 'Comprehensive written guide with optimal code implementations in Java, C++, and Python.',
    tags: ['DSA', 'Java', 'C++', 'Python']
  },
  {
    id: 3,
    title: 'Java + DSA Placement Course by Apna College',
    category: 'dsa',
    provider: 'Apna College (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@ApnaCollegeOfficial',
    description: 'Complete Java programming foundations combined with step-by-step DSA algorithms.',
    tags: ['DSA', 'Java', 'OOPs', 'Placement']
  },
  {
    id: 4,
    title: 'LeetCode Coding Practice Platform',
    category: 'dsa',
    provider: 'LeetCode (Website)',
    type: 'website',
    url: 'https://leetcode.com',
    description: 'Industry-standard coding challenges to practice software engineering interview questions.',
    tags: ['Practice', 'Coding Prep', 'DSA']
  },
  // Frontend
  {
    id: 5,
    title: 'ReactJS Masterclass for Beginners',
    category: 'frontend',
    provider: 'Hitesh Choudhary (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@ChaiaurCode',
    description: 'Vibrant, concept-heavy React course explaining hooks, state, routing, and real-world project builds.',
    tags: ['React', 'JavaScript', 'Hooks', 'Chai aur Code']
  },
  {
    id: 6,
    title: 'Modern JavaScript Course by Net Ninja',
    category: 'frontend',
    provider: 'The Net Ninja (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@NetNinja',
    description: 'In-depth frontend learning path explaining modern ES6+ JS features and DOM manipulation.',
    tags: ['JavaScript', 'ES6', 'DOM']
  },
  {
    id: 7,
    title: 'MDN Web Docs (Mozilla Developer Network)',
    category: 'frontend',
    provider: 'Mozilla (Website)',
    type: 'website',
    url: 'https://developer.mozilla.org',
    description: 'Official authoritative reference guides for modern HTML, CSS variables, and core JavaScript APIs.',
    tags: ['HTML', 'CSS', 'JavaScript', 'Documentation']
  },
  {
    id: 8,
    title: 'W3Schools Web Learning Portal',
    category: 'frontend',
    provider: 'W3Schools (Website)',
    type: 'website',
    url: 'https://www.w3schools.com',
    description: 'Easy-to-understand interactive web tutorials covering HTML, CSS, JavaScript, and SQL.',
    tags: ['HTML', 'CSS', 'W3Schools', 'Reference']
  },
  // Backend
  {
    id: 9,
    title: 'Node.js & Express.js Backend Course',
    category: 'backend',
    provider: 'CodeWithHarry (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@CodeWithHarry',
    description: 'Vibrant backend foundations in Hindi explaining servers, routes, MongoDB integration, and REST APIs.',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'Backend']
  },
  {
    id: 10,
    title: 'W3Schools Node.js Tutorial',
    category: 'backend',
    provider: 'W3Schools (Website)',
    type: 'website',
    url: 'https://www.w3schools.com/nodejs/',
    description: 'Clear, interactive Node.js tutorials covering modules, HTTP servers, file systems, and NPM.',
    tags: ['Node.js', 'NPM', 'W3Schools']
  },
  {
    id: 11,
    title: 'Backend Web Developer Masterclass',
    category: 'backend',
    provider: 'freeCodeCamp (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@freecodecamp',
    description: 'Full-length video courses covering databases, system designs, deployment, and security protocols.',
    tags: ['Docker', 'Database', 'Systems', 'freeCodeCamp']
  },
  {
    id: 12,
    title: 'Express.js Official Documentation Guide',
    category: 'backend',
    provider: 'ExpressJS team (Website)',
    type: 'website',
    url: 'https://expressjs.com',
    description: 'Fast, unopinionated, minimalist web framework reference guide for building backend APIs.',
    tags: ['Express.js', 'API Documentation', 'Node.js']
  },
  // Java
  {
    id: 13,
    title: 'Java Full Placement Course in Hindi',
    category: 'java',
    provider: 'Apna College (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@ApnaCollegeOfficial',
    description: 'In-depth Java language foundations including OOPs concepts, recursion, and core library APIs.',
    tags: ['Java', 'OOPs', 'Placement']
  },
  {
    id: 14,
    title: 'W3Schools Java Tutorial',
    category: 'java',
    provider: 'W3Schools (Website)',
    type: 'website',
    url: 'https://www.w3schools.com/java/',
    description: 'Highly interactive written reference for learning core Java syntax, classes, inheritance, and libraries.',
    tags: ['Java', 'OOPs', 'W3Schools']
  },
  {
    id: 15,
    title: 'GeeksforGeeks Java Tutorials',
    category: 'java',
    provider: 'GeeksforGeeks (Website)',
    type: 'website',
    url: 'https://www.geeksforgeeks.org/java/',
    description: 'Written tutorials, placement MCQs, and coding challenges focused on core Java engineering principles.',
    tags: ['Java', 'OOPs', 'GFG']
  },
  // Python / AI
  {
    id: 16,
    title: 'Python for Data Science & AI Essentials',
    category: 'python',
    provider: 'Hitesh Choudhary (YouTube)',
    type: 'youtube',
    url: 'https://www.youtube.com/@ChaiaurCode',
    description: 'Understand Python syntax, packages (NumPy, Pandas), and data processing filters.',
    tags: ['Python', 'Pandas', 'Data Science']
  },
  {
    id: 17,
    title: 'GeeksforGeeks Python Programming',
    category: 'python',
    provider: 'GeeksforGeeks (Website)',
    type: 'website',
    url: 'https://www.geeksforgeeks.org/python-programming-language/',
    description: 'Comprehensive guide covering Python variables, control flows, object-oriented concepts, and packages.',
    tags: ['Python', 'OOPs', 'GFG']
  },
  {
    id: 18,
    title: 'GeeksforGeeks Machine Learning Path',
    category: 'python',
    provider: 'GeeksforGeeks (Website)',
    type: 'website',
    url: 'https://www.geeksforgeeks.org/machine-learning/',
    description: 'Comprehensive tutorials covering regression, classification, clustering, and neural networks code.',
    tags: ['ML', 'AI', 'Scikit-Learn', 'GFG']
  }
];

const LearningResources = () => {
  const { user } = useContext(AuthContext);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const filteredResources = resourceData.filter(res => {
    const matchesSearch = 
      res.title.toLowerCase().includes(search.toLowerCase()) ||
      res.provider.toLowerCase().includes(search.toLowerCase()) ||
      res.tags.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
      res.description.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = activeCategory === 'all' || res.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="resources-page-container animate-fade-in">
      <div className="resources-header">
        <h1 className="page-title">Learning Resources & References</h1>
        <p className="page-subtitle">Handpicked top YouTube playlists and documentation sites for career growth.</p>
      </div>

      {/* Search and Filters */}
      <div className="resources-controls glass-card">
        <div className="search-bar-wrap">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="form-control resource-search-input"
            placeholder="Search resources, topics, or teachers (e.g. Love Babbar, React, JavaTpoint)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="category-pills">
          {[
            { id: 'all', label: 'All Resources' },
            { id: 'dsa', label: 'DSA & Algorithms' },
            { id: 'frontend', label: 'Frontend Web' },
            { id: 'backend', label: 'Backend Dev' },
            { id: 'java', label: 'Java & OOPs' },
            { id: 'python', label: 'Python & AI' }
          ].map(cat => (
            <button
              key={cat.id}
              className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.id === 'all' && <BookOpen size={14} />}
              {cat.id === 'dsa' && <GraduationCap size={14} />}
              {cat.id === 'frontend' && <Video size={14} />}
              {cat.id === 'backend' && <Globe size={14} />}
              {cat.id === 'java' && <BookOpen size={14} />}
              {cat.id === 'python' && <Globe size={14} />}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid displaying the resources */}
      {filteredResources.length > 0 ? (
        <div className="resources-grid-layout">
          {filteredResources.map(res => (
            <a
              key={res.id}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="resource-card glass-card"
              onClick={() => {
                try {
                  const userSuffix = user ? `_${user._id || user.email || user.name}` : '';
                  const stored = localStorage.getItem(`clickedResources${userSuffix}`);
                  let list = stored ? JSON.parse(stored) : [];
                  list = list.filter(item => item.url !== res.url);
                  list.unshift({
                    title: res.title,
                    provider: res.provider,
                    type: res.type,
                    url: res.url,
                    timestamp: Date.now()
                  });
                  list = list.slice(0, 3);
                  localStorage.setItem(`clickedResources${userSuffix}`, JSON.stringify(list));
                } catch (e) {
                  console.error('Error saving clicked resource:', e);
                }
              }}
            >
              <div className="resource-card-header">
                <span className={`provider-badge ${res.type}`}>
                  {res.type === 'youtube' ? <Video size={14} /> : <Globe size={14} />}
                  {res.provider}
                </span>
                <ExternalLink size={16} className="card-external-icon" />
              </div>

              <h3 className="resource-card-title">{res.title}</h3>
              <p className="resource-card-desc">{res.description}</p>

              <div className="resource-card-tags">
                {res.tags.map((tag, idx) => (
                  <span key={idx} className="resource-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="resources-empty glass-card">
          <BookOpen size={48} className="empty-icon" />
          <h3>No Resources Found</h3>
          <p>Try searching for a different keyword or category.</p>
        </div>
      )}
    </div>
  );
};

export default LearningResources;
