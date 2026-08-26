const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client (fail-safe in case of missing keys)
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper: safe JSON parsing for AI outputs
const parseAIResponse = (text) => {
  try {
    // Strip markdown formatting if the model still outputs them
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('Failed to parse Gemini response as JSON. Raw text was:', text);
    throw new Error('AI output formatting error. Please try again.');
  }
};

/**
 * 1. Analyze Resume (ATS & Skill Analysis)
 */
exports.analyzeResume = async (resumeText) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Resume Analysis.');
    return getMockResumeAnalysis(resumeText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an ATS (Applicant Tracking System) parser. Analyze this raw text extracted from a resume:
      "${resumeText}"

      Return a JSON object containing:
      {
        "atsScore": number (0-100),
        "detectedSkills": [string],
        "suggestedSkills": [string],
        "breakdown": {
          "formatting": number (0-100),
          "impactPhrases": number (0-100),
          "keywordMatch": number (0-100),
          "redundancies": number (0-100)
        },
        "feedback": [string]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Resume Parsing error:', error);
    return getMockResumeAnalysis(resumeText);
  }
};

/**
 * 2. Generate Learning Roadmap
 */
exports.generateRoadmap = async (targetRole, currentSkills = [], missingSkills = []) => {
  let roadmap;
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Roadmap.');
    roadmap = getMockRoadmap(targetRole, currentSkills, missingSkills);
  } else {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      });

      const prompt = `
        Create a step-by-step weekly learning roadmap for a student aiming to become a "${targetRole}".
        Current Skills: ${JSON.stringify(currentSkills)}
        Missing Skills: ${JSON.stringify(missingSkills)}

        Return a JSON object matching this schema:
        {
          "targetRole": "${targetRole}",
          "currentSkills": [string],
          "missingSkills": [string],
          "weeksEstimate": number (total duration, e.g. 12),
          "phases": [{
            "phaseNumber": number,
            "title": string,
            "duration": string (e.g. "Weeks 1-4"),
            "objectives": [string],
            "resources": [{
              "title": string,
              "url": string (suggest high-quality free URLs or placeholder domains),
              "type": "video" | "article" | "course" | "documentation"
            }],
            "projects": [{
              "title": string,
              "description": string,
              "difficulty": "Beginner" | "Intermediate" | "Advanced"
            }]
          }]
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      roadmap = parseAIResponse(response.text());
    } catch (error) {
      console.error('Gemini Roadmap Generation error:', error);
      roadmap = getMockRoadmap(targetRole, currentSkills, missingSkills);
    }
  }

  // Sanitize and filter out all YouTube video resources
  if (roadmap && Array.isArray(roadmap.phases)) {
    roadmap.phases = roadmap.phases.map(phase => {
      if (Array.isArray(phase.resources)) {
        phase.resources = phase.resources.filter(resource => {
          const urlStr = (resource.url || '').toLowerCase();
          const isYoutube = urlStr.includes('youtube.com') || urlStr.includes('youtu.be');
          return resource.type !== 'video' && !isYoutube;
        });
      }
      return phase;
    });
  }

  return roadmap;
};

/**
 * 3. Generate Interview Questions
 */
exports.generateInterviewQuestions = async (role, type, limit = 5, format = 'theory', userSkills = []) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Interview Questions.');
    return getMockQuestions(role, type, limit, format, userSkills);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const skillPrompt = userSkills.length > 0 
      ? `\nCandidate reported skills profile (AI Memory Context): ${JSON.stringify(userSkills)}. If relevant, tailor some questions to evaluate their proficiency in these reported skills.`
      : '';

    const prompt = format === 'mcq'
      ? `
      Generate exactly ${limit} distinct Multiple Choice Questions (MCQ) for the role of a "${role}".
      Category type requested: "${type}" (could be Technical, Behavioral, or Mixed).
      ${skillPrompt}
      
      Each question must have exactly 4 choices (labeled A, B, C, D).
      Return a JSON array of objects matching this exact structure:
      [
        {
          "questionText": string (the question itself),
          "category": string (e.g. "React Hooks", "Node event loop"),
          "options": [
            "A) option A text",
            "B) option B text",
            "C) option C text",
            "D) option D text"
          ],
          "correctOption": "A" | "B" | "C" | "D",
          "modelAnswer": string (short 1-2 sentence explanation of why this option is correct)
        }
      ]
      `
      : `
      Generate exactly ${limit} distinct interview questions for the role of a "${role}".
      Category type requested: "${type}" (could be Technical, Behavioral, or Mixed).
      ${skillPrompt}

      Return a JSON array of objects:
      [
        {
          "questionText": string,
          "category": string (e.g., "React Coding", "System Design", "HR Behavioral")
        }
      ]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Question Generation error:', error);
    return getMockQuestions(role, type, limit, format, userSkills);
  }
};

/**
 * 4. Grade Interview Response
 */
exports.gradeInterviewAnswer = async (questionText, userAnswer) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Answer Review.');
    return getMockAnswerReview(questionText, userAnswer);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Evaluate the user's response to the interview question:
      Question: "${questionText}"
      User's Answer: "${userAnswer}"

      Provide grading score out of 10, recommendations, and an example optimal answer.
      Return JSON format matching:
      {
        "rating": number (1-10),
        "feedback": string (constructive analysis),
        "modelAnswer": string (exemplary professional response)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Answer Grading error:', error);
    return getMockAnswerReview(questionText, userAnswer);
  }
};

// ==========================================
// MOCK DATA FALLBACKS (For development)
// ==========================================

function getMockResumeAnalysis(resumeText = '') {
  const text = resumeText.toLowerCase();
  
  // 1. Detect skills dynamically
  const skillKeywords = {
    'javascript': 'JavaScript',
    'python': 'Python',
    'java': 'Java',
    'c++': 'C++',
    'html': 'HTML5',
    'css': 'CSS3',
    'react': 'React',
    'angular': 'Angular',
    'vue': 'Vue.js',
    'node': 'Node.js',
    'express': 'Express.js',
    'mongodb': 'MongoDB',
    'sql': 'SQL / Database',
    'postgres': 'PostgreSQL',
    'mysql': 'MySQL',
    'docker': 'Docker',
    'kubernetes': 'Kubernetes',
    'aws': 'AWS Cloud',
    'git': 'Git & GitHub',
    'typescript': 'TypeScript',
    'django': 'Django',
    'flask': 'Flask',
    'spring': 'Spring Boot'
  };

  const detectedSkills = [];
  for (const [key, value] of Object.entries(skillKeywords)) {
    if (text.includes(key)) {
      detectedSkills.push(value);
    }
  }

  // Fallback if no skills are matched
  if (detectedSkills.length === 0) {
    detectedSkills.push('Microsoft Office', 'Communication', 'Technical Writing');
  }

  // 2. Suggest missing skills based on what they have
  const allPotentialSkills = ['TypeScript', 'Node.js', 'Express.js', 'MongoDB', 'Docker', 'Kubernetes', 'AWS Cloud', 'Python', 'React', 'SQL / Database'];
  const suggestedSkills = allPotentialSkills.filter(s => !detectedSkills.includes(s)).slice(0, 5);

  // 3. Realistic Dynamic ATS Score Calculation
  const baseScore = 20;
  
  // A. Skill Score (Max 25)
  const skillScore = Math.min(25, detectedSkills.length * 2.5);
  
  // B. Section Structure (Max 20)
  let sectionScore = 0;
  if (text.includes('education') || text.includes('university') || text.includes('college')) sectionScore += 5;
  if (text.includes('experience') || text.includes('work') || text.includes('employment')) sectionScore += 5;
  if (text.includes('project')) sectionScore += 5;
  if (text.includes('contact') || text.includes('email') || text.includes('phone')) sectionScore += 5;

  // C. Action Verbs (Max 15)
  let verbScore = 0;
  const actionVerbs = ['developed', 'optimized', 'designed', 'built', 'led', 'managed', 'created', 'implemented'];
  actionVerbs.forEach(verb => {
    if (text.includes(verb)) verbScore += 3;
  });
  verbScore = Math.min(15, verbScore);

  // D. Quantitative achievements & numbers (Max 15)
  let metricsScore = 0;
  const hasNumbers = /\d+/.test(text);
  const hasPercent = /%/.test(text);
  const hasImpactWords = /reduced|increased|improved|saved|latency|performance/.test(text);
  if (hasNumbers) metricsScore += 5;
  if (hasPercent) metricsScore += 5;
  if (hasImpactWords) metricsScore += 5;

  // E. Profile Links (Max 15)
  let linksScore = 0;
  if (text.includes('github.com')) linksScore += 5;
  if (text.includes('linkedin.com')) linksScore += 5;
  if (text.includes('http') || text.includes('www.')) linksScore += 5;
  linksScore = Math.min(15, linksScore);

  // Combine Scores
  const calculatedATS = Math.round(baseScore + skillScore + sectionScore + verbScore + metricsScore + linksScore);
  const atsScore = Math.min(95, Math.max(30, calculatedATS));

  // 4. Dynamic breakdown
  const keywordMatch = Math.round(Math.min(100, 30 + (skillScore * 2.8)));
  const formatting = Math.round(Math.min(100, 40 + (sectionScore * 3)));
  const impactPhrases = Math.round(Math.min(100, 40 + (verbScore * 2.5) + (metricsScore * 1.5)));
  const redundancies = text.length > 2500 ? 60 : 88;

  // 5. Dynamic feedback items
  const feedback = [];
  if (detectedSkills.length < 5) {
    feedback.push('Add more core technical skills and programming languages to pass basic ATS keyword filters.');
  }
  if (verbScore < 9) {
    feedback.push('Use strong action verbs (e.g. "Developed", "Optimized", "Designed") at the start of your experience bullet points.');
  }
  if (metricsScore < 10) {
    feedback.push('Include quantitative achievements (e.g. "reduced system latency by 15%" or "increased page load speeds by 20%").');
  }
  if (linksScore < 10) {
    feedback.push('Link your active GitHub or LinkedIn profile in the contact section to enhance visibility.');
  }
  if (sectionScore < 15) {
    feedback.push('Ensure your sections are clearly divided (Experience, Education, Projects).');
  }
  
  // Standard fallbacks if list is too small
  if (feedback.length < 2) {
    feedback.push('Excellent layout. Consider tailoring keywords directly to specific target jobs to maximize relevance.');
  }

  return {
    atsScore,
    detectedSkills,
    suggestedSkills,
    breakdown: {
      formatting,
      impactPhrases,
      keywordMatch,
      redundancies
    },
    feedback
  };
}

function getMockRoadmap(role, current, missing) {
  const finalMissing = missing.length > 0 ? missing : ['React Native', 'TypeScript', 'Node.js & Express', 'MongoDB Atlas', 'Jest Testing'];
  const roleName = (role || '').toLowerCase();
  
  // 1. FRONTEND DEVELOPER
  if (roleName.includes('frontend') || roleName.includes('ui developer')) {
    return {
      targetRole: role || 'Frontend Developer',
      currentSkills: current.length > 0 ? current : ['HTML', 'CSS', 'JavaScript'],
      missingSkills: missing.length > 0 ? missing : ['React', 'TypeScript', 'TailwindCSS', 'Redux Toolkit'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'Advanced UI Styling & React Foundations',
          duration: 'Weeks 1-3',
          objectives: ['Master modern CSS Grid and Flexbox layouts', 'Learn React components lifecycle and hooks', 'Integrate state management using Context API'],
          resources: [
            { title: 'HTML & CSS Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ivBXP9aAeZiodDrA2yXs68', type: 'video' },
            { title: 'React Crash Course by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TeeM-eUTFLUAzNZsz1', type: 'video' },
            { title: 'React Official Documentation', url: 'https://react.dev', type: 'documentation' }
          ],
          projects: [
            { title: 'Interactive Dashboard UI', description: 'Create a responsive, beautiful dashboard UI using Tailwind CSS and React state.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Type Safety & Global State Management',
          duration: 'Weeks 4-6',
          objectives: ['Implement type safety with TypeScript', 'Configure store and slices with Redux Toolkit', 'Fetch data cleanly using RTK Query or Axios'],
          resources: [
            { title: 'TypeScript Masterclass by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gUgrPsgo3RQY545aJD878t', type: 'video' },
            { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'documentation' }
          ],
          projects: [
            { title: 'E-Commerce Store Front', description: 'Build a typed shopping application with product filters, shopping cart management, and persistency.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Testing & Performance Optimization',
          duration: 'Weeks 7-8',
          objectives: ['Write unit tests for hooks and components with Jest/React Testing Library', 'Audit and optimize core web vitals (LCP, FID)', 'Deploy to Vercel/Netlify with CI/CD'],
          resources: [
            { title: 'React Testing Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gm4_-5UsNmLqMosjaFsz97', type: 'video' }
          ],
          projects: [
            { title: 'Production Ready Portfolio App', description: 'Optimize your portfolio website for mobile and publish with Vercel deployment pipeline.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 2. BACKEND DEVELOPER
  if (roleName.includes('backend')) {
    return {
      targetRole: role || 'Backend Developer',
      currentSkills: current.length > 0 ? current : ['JavaScript', 'Basic SQL', 'OOP Basics'],
      missingSkills: missing.length > 0 ? missing : ['Node.js', 'Express.js', 'MongoDB', 'Redis', 'Docker'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'Asynchronous Runtime & REST API Design',
          duration: 'Weeks 1-3',
          objectives: ['Understand Node.js asynchronous event loop', 'Configure routes, controllers, and middlewares in Express', 'Connect server to MongoDB using Mongoose'],
          resources: [
            { title: 'Node.js Crash Course by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymhLOyfBUw', type: 'video' },
            { title: 'MongoDB Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jBcybLF8CDAo54JbSPgUbF', type: 'video' },
            { title: 'Express.js Official Guide', url: 'https://expressjs.com', type: 'documentation' }
          ],
          projects: [
            { title: 'RESTful Task Manager API', description: 'Design a backend server with JWT user authentication, schemas validation, and Mongoose database storage.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Caching, Security & Databases Scaling',
          duration: 'Weeks 4-6',
          objectives: ['Implement caching mechanisms using Redis', 'Implement password hashing (bcrypt) and CORS headers security', 'Write optimized database index rules'],
          resources: [
            { title: 'Node.js Auth Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9g8OhpOZxTOUXhpz7pHmOkv', type: 'video' },
            { title: 'Redis Official Getting Started', url: 'https://redis.io/docs/latest/develop/get-started/', type: 'documentation' }
          ],
          projects: [
            { title: 'Secure Chat API Engine', description: 'Build an API supporting private channels, database persistence, and Redis session stores.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Testing, Docker & Deployment Pipelines',
          duration: 'Weeks 7-8',
          objectives: ['Write endpoint integration tests using Supertest and Jest', 'Dockerize the Express web server setup', 'Deploy the backend as a Render Web Service'],
          resources: [
            { title: 'Docker Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9hxjeJoM5F87SdfFCdiY5-y', type: 'video' }
          ],
          projects: [
            { title: 'Containerized Production Deployment', description: 'Package your backend API in Docker and deploy to Render with automated logs monitoring.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 3. FULLSTACK DEVELOPER
  if (roleName.includes('fullstack') || roleName.includes('full stack')) {
    return {
      targetRole: role || 'Fullstack Software Engineer',
      currentSkills: current.length > 0 ? current : ['JavaScript', 'HTML & CSS', 'Git'],
      missingSkills: missing.length > 0 ? missing : ['MERN Stack', 'React', 'Node.js & Express', 'MongoDB Atlas', 'JWT Auth'],
      weeksEstimate: 10,
      phases: [
        {
          phaseNumber: 1,
          title: 'Backend API Foundation',
          duration: 'Weeks 1-4',
          objectives: ['Master Node.js asynchronous event loops', 'Setup REST APIs with Express.js', 'Connect and structure MongoDB schemas'],
          resources: [
            { title: 'Node.js Crash Course by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymhLOyfBUw', type: 'video' },
            { title: 'Express.js Official Guide', url: 'https://expressjs.com', type: 'documentation' }
          ],
          projects: [
            { title: 'Task Manager API', description: 'Build a secure RESTful API for task operations with JWT auth and Mongoose DB storage.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'React Client Integration',
          duration: 'Weeks 5-7',
          objectives: ['Interface frontend with backend tokens', 'Implement client side state management', 'Integrate Tailwind CSS and variables styling system'],
          resources: [
            { title: 'React Crash Course by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TeeM-eUTFLUAzNZsz1', type: 'video' },
            { title: 'React Router Official Guides', url: 'https://reactrouter.com', type: 'documentation' }
          ],
          projects: [
            { title: 'Personal Career Dashboard', description: 'Connect fullstack endpoints to render stats, roadmaps, and profile updates.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Testing & Containerized Cloud Deployment',
          duration: 'Weeks 8-10',
          objectives: ['Write unit and integration tests with Jest', 'Dockerize express servers and client configurations', 'Deploy apps to Render/Vercel with CI/CD'],
          resources: [
            { title: 'Docker Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9hxjeJoM5F87SdfFCdiY5-y', type: 'video' },
            { title: 'Vercel Deployment Documentation', url: 'https://vercel.com/docs', type: 'documentation' }
          ],
          projects: [
            { title: 'Production Ready MERN App Launch', description: 'Containerize and publish career tools to Render and Vercel hostings.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 4. PYTHON DEVELOPER
  if (roleName.includes('python')) {
    return {
      targetRole: role || 'Python Developer',
      currentSkills: current.length > 0 ? current : ['Python Core', 'Basic CLI'],
      missingSkills: missing.length > 0 ? missing : ['Django', 'FastAPI', 'Pandas & NumPy', 'Python OOPs', 'PostgreSQL'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'FastAPI Microservices & Asynchronous Python',
          duration: 'Weeks 1-3',
          objectives: ['Master Python asynchronous routines (async/await)', 'Build high-performance REST APIs using FastAPI', 'Validate schemas using Pydantic'],
          resources: [
            { title: 'Python OOPs Course by Corey Schafer', url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbGDhPJWZQsRJ6R5c', type: 'video' },
            { title: 'FastAPI Official Docs', url: 'https://fastapi.tiangolo.com', type: 'documentation' }
          ],
          projects: [
            { title: 'Notes Manager Backend API', description: 'Create a FastAPI backend supporting CRUD operations for personal notes with database storage.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Monolithic Web Architectures with Django',
          duration: 'Weeks 4-6',
          objectives: ['Configure Django project structure and settings', 'Design database schemas using Django ORM', 'Build admin dashboard and authentication logic'],
          resources: [
            { title: 'Django Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9ib4IIcELTvMCeg8YgugGp1', type: 'video' },
            { title: 'Django Documentation', url: 'https://docs.djangoproject.com', type: 'documentation' }
          ],
          projects: [
            { title: 'Social Platform Core Engine', description: 'Build a blog or discussion forum engine with user registration, posts, comments, and relationships.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Data Wrangling & Database Integration',
          duration: 'Weeks 7-8',
          objectives: ['Analyze and clean datasets using Pandas and NumPy', 'Setup database connections with PostgreSQL', 'Deploy Python servers using Docker'],
          resources: [
            { title: 'Pandas & NumPy Tutorial by Corey Schafer', url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdD_athkGcED', type: 'video' }
          ],
          projects: [
            { title: 'Analytics Reports Service', description: 'Write a background script that parses raw CSV files, aggregates metrics in Pandas, and inserts summaries into Postgres.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 5. CLOUD DEVELOPER
  if (roleName.includes('cloud developer') || roleName.includes('cloud engineer')) {
    return {
      targetRole: role || 'Cloud Developer',
      currentSkills: current.length > 0 ? current : ['JavaScript', 'Linux CLI', 'Git'],
      missingSkills: missing.length > 0 ? missing : ['AWS IAM/EC2', 'Docker', 'Serverless framework', 'AWS Lambda', 'DynamoDB'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'Cloud Core Compute & Networking',
          duration: 'Weeks 1-3',
          objectives: ['Understand AWS VPC (Subnets, Route Tables, Security Groups)', 'Provision and connect to AWS EC2 linux servers', 'Configure secure storage using AWS S3'],
          resources: [
            { title: 'AWS Cloud Practitioner Course', url: 'https://www.youtube.com/playlist?list=PL8wY813RNXqqM6fR5O76Y54mS_rA_xwhU', type: 'video' },
            { title: 'AWS EC2 Getting Started', url: 'https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html', type: 'documentation' }
          ],
          projects: [
            { title: 'Cloud-hosted Portfolio Site', description: 'Host a static website in an AWS S3 bucket behind CloudFront CDN with SSL certificate configurations.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Containerization & Serverless APIs',
          duration: 'Weeks 4-6',
          objectives: ['Write multi-stage Dockerfiles for Node APIs', 'Write serverless lambda functions using Node/Python', 'Integrate DynamoDB database layers with AWS SDK'],
          resources: [
            { title: 'Docker Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9hxjeJoM5F87SdfFCdiY5-y', type: 'video' },
            { title: 'Serverless Framework Documentation', url: 'https://www.serverless.com/framework/docs', type: 'documentation' }
          ],
          projects: [
            { title: 'Serverless REST API', description: 'Create an AWS API Gateway linked to Lambda functions that stores requests into a DynamoDB table.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Monitoring & CI/CD Cloud Pipelines',
          duration: 'Weeks 7-8',
          objectives: ['Write automated GitHub Actions pipelines to deploy to Lambda', 'Setup AWS CloudWatch alarms and metrics logs', 'Implement IAM least-privilege configurations'],
          resources: [
            { title: 'AWS Solutions Architect Course', url: 'https://www.youtube.com/playlist?list=PL8wY813RNXqyL_3t8Xn4O5U-9Jxw4Ld0x', type: 'video' }
          ],
          projects: [
            { title: 'Fully Automated Lambda Service', description: 'Implement an API that auto-deploys via GitHub Actions, sends metrics logs to CloudWatch, and utilizes custom IAM roles.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 6. DEVOPS DEVELOPER
  if (roleName.includes('devops')) {
    return {
      targetRole: role || 'DevOps Engineer',
      currentSkills: current.length > 0 ? current : ['Linux Shell', 'Git', 'Networking'],
      missingSkills: missing.length > 0 ? missing : ['Docker', 'Kubernetes', 'Ansible', 'Terraform', 'GitHub Actions'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'Linux Systems & Containerization',
          duration: 'Weeks 1-3',
          objectives: ['Master advanced Bash scripting and process management', 'Package web applications into lightweight Docker containers', 'Manage multi-container networks using Docker Compose'],
          resources: [
            { title: 'Linux Command Line Tutorial', url: 'https://www.youtube.com/playlist?list=PLgp11mZgpf8DS9cO_dI26LzdfjY4_6kZ_', type: 'video' },
            { title: 'Docker Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9hxjeJoM5F87SdfFCdiY5-y', type: 'video' },
            { title: 'Docker Docs', url: 'https://docs.docker.com', type: 'documentation' }
          ],
          projects: [
            { title: 'Multi-service Local Environment', description: 'Create a local system comprising a Node server, database container, and reverse-proxy in Docker Compose.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'CI/CD Pipelines & Container Orchestration',
          duration: 'Weeks 4-6',
          objectives: ['Write automated test/deploy workflows in GitHub Actions', 'Learn Kubernetes deployment, service, ingress, and config assets', 'Manage local clusters using Minikube/K3s'],
          resources: [
            { title: 'Kubernetes Tutorial by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9j07lpSjIL5fW82G1L7aK2o', type: 'video' },
            { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'documentation' }
          ],
          projects: [
            { title: 'Self-Healing Deployments in Kubernetes', description: 'Setup an auto-scaling, containerized web deployment that survives simulated node crashes.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Infrastructure as Code (IaC) & Monitoring',
          duration: 'Weeks 7-8',
          objectives: ['Provision cloud VMs and networks using Terraform scripts', 'Automate configurations management with Ansible playbooks', 'Configure metrics collections using Prometheus & Grafana'],
          resources: [
            { title: 'Terraform Full Course', url: 'https://www.youtube.com/playlist?list=PL8wY813RNXqqM6fR5O76Y54mS_rA_xwhU', type: 'video' }
          ],
          projects: [
            { title: 'Automated Load-Balanced Cluster', description: 'Write Terraform configs to deploy load-balanced EC2 instances on AWS, automated via GitHub Actions pipelines.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 7. MACHINE LEARNING ENGINEER
  if (roleName.includes('machine learning') || roleName.includes('ml')) {
    return {
      targetRole: role || 'Machine Learning Engineer',
      currentSkills: current.length > 0 ? current : ['Python', 'Calculus', 'Statistics'],
      missingSkills: missing.length > 0 ? missing : ['Scikit-Learn', 'Pandas & NumPy', 'Matplotlib', 'Model Tuning'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'Data Wrangling & Statistical Analysis',
          duration: 'Weeks 1-3',
          objectives: ['Clean, filter, and aggregate datasets in Pandas', 'Perform matrix math manipulations using NumPy arrays', 'Visualize distributions using Matplotlib and Seaborn'],
          resources: [
            { title: 'Pandas & NumPy Tutorial by Corey Schafer', url: 'https://www.youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdD_athkGcED', type: 'video' },
            { title: 'Pandas Reference Documentation', url: 'https://pandas.pydata.org/docs/', type: 'documentation' }
          ],
          projects: [
            { title: 'Housing Prices Analytics Dashboard', description: 'Load raw real-estate CSV sheets, clean null entries, filter extreme outliers, and output visual price maps.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Classical Machine Learning Algorithms',
          duration: 'Weeks 4-6',
          objectives: ['Train regression and classification trees with Scikit-Learn', 'Perform hyperparameter tuning using GridSearch', 'Audit models using Confusion Matrices and F1 scores'],
          resources: [
            { title: 'Machine Learning Course in Python', url: 'https://www.youtube.com/playlist?list=PLQVvvaa0QuDfKTOs3Keq_kaG2P55YRn5v', type: 'video' },
            { title: 'Scikit-Learn User Guide', url: 'https://scikit-learn.org/stable/', type: 'documentation' }
          ],
          projects: [
            { title: 'Credit Fraud Classifier', description: 'Train a random-forest classification model to flag suspicious bank transfers based on transaction features.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Models Serialization & Basic APIs',
          duration: 'Weeks 7-8',
          objectives: ['Serialize models to disk using Joblib/Pickle', 'Implement model inference pipelines inside FastAPI endpoints', 'Deploy prediction microservice using Docker'],
          resources: [
            { title: 'FastAPI for Machine Learning', url: 'https://www.youtube.com/playlist?list=PL5gLrcv8JE6Dvn7gYZF8B1T69Y9Y45uK8', type: 'video' }
          ],
          projects: [
            { title: 'Production Prediction microservice', description: 'Package a trained classifier inside FastAPI and publish the containerized service to Render.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 8. AI ENGINEER
  if (roleName.includes('ai engineer') || roleName.includes('ai') || roleName.includes('generative')) {
    return {
      targetRole: role || 'AI Engineer',
      currentSkills: current.length > 0 ? current : ['Python', 'API Integrations', 'Basic ML'],
      missingSkills: missing.length > 0 ? missing : ['PyTorch', 'Hugging Face Transformers', 'LangChain', 'Vector Databases', 'OpenAI/Gemini APIs'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'Deep Learning & Neural Networks',
          duration: 'Weeks 1-3',
          objectives: ['Build neural networks from scratch using PyTorch layers', 'Understand backpropagation, activation functions, and optimizers', 'Train basic CNNs and RNNs on CPU/GPU hardware'],
          resources: [
            { title: 'PyTorch Deep Learning Course', url: 'https://www.youtube.com/playlist?list=PLqnslRFeH2UrcDBLOyI9h4W7gUSLp_QQH', type: 'video' },
            { title: 'PyTorch Tutorials', url: 'https://pytorch.org/tutorials/', type: 'documentation' }
          ],
          projects: [
            { title: 'Handwritten Digit Recognizer', description: 'Implement and train a CNN classifier in PyTorch to identify numbers from MNIST datasets.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Large Language Models & Prompt Engineering',
          duration: 'Weeks 4-6',
          objectives: ['Integrate generative models using Google Gemini / OpenAI SDKs', 'Construct advanced system instructions and context injection patterns', 'Fine-tune model prompts for structured JSON schema outputs'],
          resources: [
            { title: 'TensorFlow & Deep Learning', url: 'https://www.youtube.com/playlist?list=PLQVvvaa0QuDdcJHDF756w1OkygVyipOMe', type: 'video' },
            { title: 'Google AI Studio API Docs', url: 'https://ai.google.dev/docs/', type: 'documentation' }
          ],
          projects: [
            { title: 'AI Resume Scorecard Assistant', description: 'Build an API that takes raw resume texts, sends structured prompt requests to Gemini, and parses the returned JSON.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Retrieval Augmented Generation (RAG) & Agents',
          duration: 'Weeks 7-8',
          objectives: ['Learn LangChain or LlamaIndex frameworks', 'Create text embeddings and store them in Pinecone/Chroma Vector Databases', 'Implement agent loops supporting semantic search queries'],
          resources: [
            { title: 'LangChain & Vector DB Course', url: 'https://www.youtube.com/playlist?list=PL8wY813RNXqyL_3t8Xn4O5U-9Jxw4Ld0x', type: 'video' }
          ],
          projects: [
            { title: 'Semantic Document QA System', description: 'Deploy a chatbot that allows users to upload PDF manuals, indexes them into a vector database, and answers questions using RAG structures.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // 9. UI/UX DESIGNER
  if (roleName.includes('ux') || roleName.includes('designer') || roleName.includes('design')) {
    return {
      targetRole: role || 'UI/UX Designer',
      currentSkills: current.length > 0 ? current : ['Sketching', 'Creativity', 'Basic HTML/CSS'],
      missingSkills: missing.length > 0 ? missing : ['Figma', 'Wireframing', 'User Research', 'Prototyping', 'Visual Systems', 'Design System Architecture'],
      weeksEstimate: 8,
      phases: [
        {
          phaseNumber: 1,
          title: 'UX Research & Information Architecture',
          duration: 'Weeks 1-3',
          objectives: ['Master UX user journey mappings and persona creations', 'Learn how to outline detailed site wireframes', 'Conduct standard user interviews and qualitative feedback loops'],
          resources: [
            { title: 'UX Design Course by CareerFoundry', url: 'https://www.youtube.com/playlist?list=PLvGgC6N_X_g8f0HkFw049H6b88J611x0_', type: 'video' },
            { title: 'Nielsen Norman Group UX Articles', url: 'https://www.nngroup.com/articles/', type: 'documentation' }
          ],
          projects: [
            { title: 'User Persona Portfolio', description: 'Conduct research for a local service app (e.g. food delivery), detail user personas, and build a site-map hierarchy.', difficulty: 'Beginner' }
          ]
        },
        {
          phaseNumber: 2,
          title: 'Advanced Figma Design Systems',
          duration: 'Weeks 4-6',
          objectives: ['Master Figma auto-layouts, components, and variables properties', 'Build reusable visual UI library assets (buttons, fields, headers)', 'Design low-fidelity and high-fidelity page assets'],
          resources: [
            { title: 'Figma Full Course', url: 'https://www.youtube.com/playlist?list=PLlG35B1U0_7m7-s2nZpT_XwzVfV_mPZ2R', type: 'video' },
            { title: 'Figma Official Help Center Guides', url: 'https://help.figma.com/hc/en-us', type: 'documentation' }
          ],
          projects: [
            { title: 'Career Tracker Mobile App', description: 'Design a complete high-fidelity mobile app layout in Figma, using a unified UI component system and custom animations.', difficulty: 'Intermediate' }
          ]
        },
        {
          phaseNumber: 3,
          title: 'Interactive Prototyping & Handoffs',
          duration: 'Weeks 7-8',
          objectives: ['Configure smart animation transitions in Figma prototypes', 'Conduct usability testing runs on interactive screens', 'Prepare design assets handoffs for frontend developers'],
          resources: [
            { title: 'Figma Smart Animate Tutorial', url: 'https://www.youtube.com/playlist?list=PLvGgC6N_X_g_37m9r5xUpK6gGZfFhT2Zz', type: 'video' }
          ],
          projects: [
            { title: 'Interactive Web Platform Design', description: 'Create an interactive high-fidelity web app prototype in Figma with micro-interactions and developer handoff documentations.', difficulty: 'Advanced' }
          ]
        }
      ]
    };
  }

  // Default Fallback (Fullstack / Backend)
  return {
    targetRole: role || 'Fullstack Software Engineer',
    currentSkills: current.length > 0 ? current : ['JavaScript', 'CSS', 'HTML', 'Git'],
    missingSkills: finalMissing,
    weeksEstimate: 8,
    phases: [
      {
        phaseNumber: 1,
        title: 'Backend Core Foundations',
        duration: 'Weeks 1-3',
        objectives: ['Master Node.js asynchronous event loops', 'Setup REST APIs with Express.js', 'Connect and structure MongoDB schemas'],
        resources: [
          { title: 'Node.js Crash Course by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymhLOyfBUw', type: 'video' },
          { title: 'Express.js Official Guide', url: 'https://expressjs.com', type: 'documentation' }
        ],
        projects: [
          { title: 'Task Manager API', description: 'Build a secure RESTful API for task operations with JWT auth and Mongoose DB storage.', difficulty: 'Beginner' }
        ]
      },
      {
        phaseNumber: 2,
        title: 'Advanced Client Integration',
        duration: 'Weeks 4-6',
        objectives: ['Interface frontend with backend tokens', 'Implement state management', 'Integrate Tailwind or CSS variables styling system'],
        resources: [
          { title: 'React Crash Course by NetNinja', url: 'https://www.youtube.com/playlist?list=PL4cUxeGkcC9gZD-TeeM-eUTFLUAzNZsz1', type: 'video' },
          { title: 'React Router v6 Masterclass', url: 'https://reactrouter.com', type: 'documentation' }
        ],
        projects: [
          { title: 'Personal Career Dashboard', description: 'Connect fullstack endpoints to render stats, roadmaps, and profile updates.', difficulty: 'Intermediate' }
        ]
      },
      {
        phaseNumber: 3,
        title: 'Testing & Containerization',
        duration: 'Weeks 7-8',
        objectives: ['Write unit and integration tests with Jest', 'Dockerize express servers', 'Deploy apps to cloud hosting environments'],
        resources: [
          { title: 'Docker Official Getting Started', url: 'https://www.docker.com/play-with-docker', type: 'article' }
        ],
        projects: [
          { title: 'Production Ready Launch', description: 'Containerize and publish career tools to Render or Heroku hostings.', difficulty: 'Advanced' }
        ]
      }
    ]
  };
}

// Role-specific Question Pools for offline fallback (20 questions each)
const frontendPool = [
  { questionText: 'Explain the difference between server-side rendering (SSR) and client-side rendering (CSR) in modern frameworks.', category: 'Web Architecture' },
  { questionText: 'How does the virtual DOM reconciliation algorithm work in React to optimize paints?', category: 'React Tuning' },
  { questionText: 'What are CSS Custom Properties (variables) and how do they benefit theme switching in production?', category: 'CSS Styling' },
  { questionText: 'Explain the concept of closures in JavaScript and provide a practical frontend example.', category: 'JS Core' },
  { questionText: 'How would you optimize web page load times and target Core Web Vitals (LCP, FID, CLS)?', category: 'Performance' },
  { questionText: 'Describe the differences between localStorage, sessionStorage, and secure httpOnly cookies.', category: 'Storage & Security' },
  { questionText: 'What is event delegation in JavaScript and why is it preferred for dynamic list elements?', category: 'DOM Events' },
  { questionText: 'Explain the difference between useMemo and useCallback in React with rendering examples.', category: 'React Optimization' },
  { questionText: 'How does client-side state management (like Redux or Zustand) differ from React Context API?', category: 'State Management' },
  { questionText: 'What are debouncing and throttling? Give a practical frontend scenario for each.', category: 'JS Performance' },
  { questionText: 'How do React Hooks handle component state life-cycles compared to legacy class components?', category: 'React Hooks' },
  { questionText: 'What are the key security practices for preventing cross-site scripting (XSS) in frontend apps?', category: 'Web Security' },
  { questionText: 'How does the browser layout engine calculate styles, layout boxes, and paint pixels?', category: 'Browser Rendering' },
  { questionText: 'Explain what hydration means in the context of Next.js or React Server Components.', category: 'SSR Hydration' },
  { questionText: 'What are Progressive Web Apps (PWAs) and what roles do Service Workers play in offline loading?', category: 'PWA & Workers' },
  { questionText: 'How would you handle responsive source-sets for images to optimize load speeds on mobile?', category: 'Asset Delivery' },
  { questionText: 'Explain the differences in rendering behaviors between Flexbox and CSS Grid layouts.', category: 'CSS Layouts' },
  { questionText: 'What is code splitting in Webpack/Vite and how does it improve initial JS load times?', category: 'Build Optimization' },
  { questionText: 'Describe how you would handle asynchronous form validation and state updates in React forms.', category: 'React Forms' },
  { questionText: 'Tell me about a time you had to debug a complex UI layout issue across different web browsers.', category: 'Behavioral UX' }
];

const backendPool = [
  { questionText: 'Explain how the Node.js event loop handles asynchronous operations despite being single-threaded.', category: 'NodeJS Core' },
  { questionText: 'What are the key differences between SQL (Relational) and NoSQL (Non-relational) databases?', category: 'Database Design' },
  { questionText: 'Design a scalable JWT-based token authentication system with refresh tokens and blacklist validation.', category: 'JWT Security' },
  { questionText: 'How do database indexes improve query speeds, and what are their write/storage trade-offs?', category: 'DB Indexing' },
  { questionText: 'Explain the technical differences, benefits, and drawbacks between RESTful APIs and GraphQL.', category: 'API Architectures' },
  { questionText: 'What is CORS and how do you secure an Express backend from unauthorized client origins?', category: 'Node Security' },
  { questionText: 'Explain what database transactions (ACID properties) are and why they are critical for data consistency.', category: 'DB Consistency' },
  { questionText: 'How would you handle heavy asynchronous tasks (like PDF rendering or mailers) using a message queue?', category: 'Task Queues' },
  { questionText: 'Explain horizontal vs vertical scaling in backend web systems and how database replication helps.', category: 'System Scaling' },
  { questionText: 'Describe how Redis can be used for caching and session management to reduce SQL DB lookup load.', category: 'Redis Caching' },
  { questionText: 'What is the difference between encryption, hashing, and encoding? Give examples of when to use each.', category: 'Cryptography' },
  { questionText: 'How do you handle schema migrations in production databases without causing API service downtime?', category: 'DB Migrations' },
  { questionText: 'Explain the concept of middleware chain execution in Express.js and how request logs are captured.', category: 'Express Lifecycle' },
  { questionText: 'What are WebSockets and how do they differ from HTTP short/long polling for live streaming?', category: 'Real-time APIs' },
  { questionText: 'How would you prevent SQL Injection and NoSQL Query Injection attacks in MongoDB or Postgres?', category: 'Backend Security' },
  { questionText: 'Explain API rate limiting (Token Bucket) and how it protects servers from denial-of-service.', category: 'Rate Limiting' },
  { questionText: 'Describe the differences, pros, and cons of Monolithic vs Microservices backend patterns.', category: 'API Patterns' },
  { questionText: 'How do you handle large file uploads securely and stream them to S3 object storage in chunks?', category: 'File Streaming' },
  { questionText: 'Explain standard HTTP status code ranges (2xx, 3xx, 4xx, 5xx) and when to throw 401 vs 403.', category: 'HTTP Standards' },
  { questionText: 'Tell me how you would audit and debug a database bottleneck in a slow REST endpoint.', category: 'Performance Audit' }
];

const cloudPool = [
  { questionText: 'What is containerization and how does Docker differ from a traditional hypervisor Virtual Machine?', category: 'Containers' },
  { questionText: 'Explain the role of Kubernetes in container orchestration and list its core components (Pods, Services, Kubelet).', category: 'Orchestration' },
  { questionText: 'Design a continuous integration and continuous deployment (CI/CD) pipeline for a Node.js web app.', category: 'CI/CD Pipelines' },
  { questionText: 'What is Infrastructure as Code (IaC) and how does Terraform help manage cloud resources?', category: 'IaC Tools' },
  { questionText: 'Explain the differences between Serverless functions (Lambda) and container-based hosting (ECS/Fargate).', category: 'Compute Paradigms' },
  { questionText: 'How does an Application Load Balancer distribute traffic and execute health checks across servers?', category: 'Traffic Routing' },
  { questionText: 'What is a CDN (Content Delivery Network) and how does cache invalidation optimize assets globally?', category: 'CDNs' },
  { questionText: 'Explain the difference between public subnets and private subnets inside a VPC (Virtual Private Cloud).', category: 'Cloud Networking' },
  { questionText: 'How do you manage secrets, database credentials, and API keys securely in a cloud system?', category: 'Cloud Security' },
  { questionText: 'What is High Availability (HA) and how do you execute multi-region failovers in AWS/GCP?', category: 'HA Architectures' },
  { questionText: 'Describe the Shared Responsibility Model in cloud security between the vendor and customer.', category: 'Security Compliance' },
  { questionText: 'How would you monitor cloud service metrics, aggregate logs, and trace microservice errors?', category: 'Observability' },
  { questionText: 'Explain the structural differences and latency trade-offs between Object storage and Block storage.', category: 'Cloud Storage' },
  { questionText: 'What is auto-scaling and how does it handle variable CPU/Memory loads dynamically in production?', category: 'Auto Scaling' },
  { questionText: 'Describe how a global DNS service (like Route 53) routes users based on geolocation or latency.', category: 'Global Routing' },
  { questionText: 'How would you configure fine-grained access control policies using IAM roles and resource policies?', category: 'IAM Controls' },
  { questionText: 'Explain the benefits of deploying managed database services (RDS) compared to databases in virtual machines.', category: 'Database Hosting' },
  { questionText: 'What are microservices and how do service mesh tools (like Istio) handle mutual TLS and discovery?', category: 'Service Mesh' },
  { questionText: 'Describe how you would troubleshoot a deployment rollback failure in a containerized environment.', category: 'Cloud Debugging' },
  { questionText: 'How do serverless databases (like Amazon DynamoDB) handle auto-partitioning and global tables?', category: 'Serverless Storage' }
];

const dsaPool = [
  { questionText: 'Explain the differences between Arrays and Linked Lists in terms of contiguous memory and search index times.', category: 'Data Structures' },
  { questionText: 'How does the QuickSort partition algorithm work, and what is its average and worst-case time complexity?', category: 'Sorting Algorith' },
  { questionText: 'What is binary search, and what is the mandatory sorting condition required to run it?', category: 'Search Algorith' },
  { questionText: 'Explain recursion, recursive base cases, and how the call stack handles deep execution frames.', category: 'Recursion' },
  { questionText: 'What is the difference between Depth First Search (DFS) and Breadth First Search (BFS) in tree/graph traversal?', category: 'Graph Traversals' },
  { questionText: 'Design a Hash Map and explain how collision resolution is handled using chaining vs open addressing.', category: 'Hash Structures' },
  { questionText: 'What is a Binary Search Tree (BST) and how do you perform an in-order traversal to print items sorted?', category: 'Tree Structures' },
  { questionText: 'Explain the concept of dynamic programming and how memoization (Top-down) differs from tabulation (Bottom-up).', category: 'Dynamic Prog' },
  { questionText: 'How do you detect a cycle in a singly linked list? Describe the Floyd Fast/Slow Pointer algorithm.', category: 'List Cycle' },
  { questionText: 'What is a Stack and a Queue? Give a real-world software engineering application for each.', category: 'Core Structures' },
  { questionText: 'Explain Big O notation and write the time complexity for standard operations on Arrays, Trees, and Hash Tables.', category: 'Big-O Analysis' },
  { questionText: 'What is a Priority Queue, and how is it implemented using a binary heap structure?', category: 'Heap Structures' },
  { questionText: 'Explain the sliding window technique and give a scenario where it optimizes a nested O(N^2) loop to O(N).', category: 'Sliding Window' },
  { questionText: 'What is a Trie (Prefix Tree) and in what scenarios is it preferred over a standard Hash Set?', category: 'Trie Structures' },
  { questionText: 'Explain the difference between greedy algorithms and dynamic programming strategies.', category: 'Algorithm Design' },
  { questionText: 'How do you find the shortest path in a weighted graph? Explain Dijkstra\'s algorithm and its complexity.', category: 'Graph Shortest' },
  { questionText: 'What is backtracking? Explain how it is used to solve constraint puzzles like the N-Queens problem.', category: 'Backtracking' },
  { questionText: 'How do you find the lowest common ancestor (LCA) in a binary tree? Describe the recursive steps.', category: 'Tree Algorith' },
  { questionText: 'What is space complexity, and how do auxiliary call frames affect the space complexity of algorithms?', category: 'Space Complexity' },
  { questionText: 'Describe how you would find the K-th largest element in an unsorted array using min-heaps.', category: 'Heap Queries' }
];

const mixedPool = [
  { questionText: 'What is the purpose of Git branching strategies (like GitFlow) in a collaborative team environment?', category: 'Git Versioning' },
  { questionText: 'Explain the differences between Unit testing, Integration testing, and End-to-End (E2E) testing scopes.', category: 'Testing Strategy' },
  { questionText: 'How do you handle merge conflicts in Git and what branching habits help prevent them?', category: 'Git Conflicts' },
  { questionText: 'What is Agile Scrum methodology and how do sprint planning, standups, and retrospectives sync?', category: 'Agile Process' },
  { questionText: 'How would you write clear code comments, inline documentation, and markdown README guides for APIs?', category: 'Documentation' },
  { questionText: 'Describe the execution difference between asynchronous programming loops and multi-threading models.', category: 'Concurrency' },
  { questionText: 'What are the SOLID design principles? Explain the Single Responsibility Principle with class examples.', category: 'OOP Design' },
  { questionText: 'How do you perform a constructive, positive code review for a junior team member\'s pull request?', category: 'Code Reviews' },
  { questionText: 'Describe what technical debt is and how a development team should balance refactoring with shipping features.', category: 'Project Lifecycle' },
  { questionText: 'Tell me about a time you disagreed with a teammate on a technical architectural approach and how you resolved it.', category: 'HR Behavioral' },
  { questionText: 'What is SQL Injection and how do parameterized queries and input sanitization block it?', category: 'Web Security' },
  { questionText: 'Describe the differences, pros, and cons between symmetric and asymmetric cryptography keys.', category: 'Cryptography' },
  { questionText: 'Explain the complete lifecycle of an HTTP request from DNS lookup to browser DOM parsing.', category: 'Web Lifecycle' },
  { questionText: 'What is technical latency and how do CDNs, connection pools, and database caching help minimize it?', category: 'Latency Optimization' },
  { questionText: 'Explain the Singleton Design Pattern and give a scenario where it is used in web services.', category: 'Design Patterns' },
  { questionText: 'How do you structure global error catch blocks and logging layers in production systems?', category: 'Error Handling' },
  { questionText: 'What is the difference between concurrency and parallelism in operating systems execution?', category: 'OS Concepts' },
  { questionText: 'How would you structure a debugging session to trace a memory leak in a running production server?', category: 'Debugging Tools' },
  { questionText: 'Describe how you prioritize technical tasks when working under a tight product release deadline.', category: 'Work Priorities' },
  { questionText: 'What is Open Source Software (OSS) and how does contributing to public repos benefit engineering growth?', category: 'Open Source' }
];

const pythonPool = [
  { questionText: 'Explain the differences between Python lists and tuples and when to choose one over the other.', category: 'Python Core' },
  { questionText: 'What are Python decorators and how do they alter function execution behavior? Provide a code example.', category: 'Python OOP' },
  { questionText: 'How does reference counting and garbage collection work in Pythons memory manager?', category: 'Memory Mngmt' },
  { questionText: 'Explain the difference between deep copy and shallow copy in Python objects.', category: 'Python Copies' },
  { questionText: 'What is the Global Interpreter Lock (GIL) and how does it limit multi-threading scalability?', category: 'Concurrency' },
  { questionText: 'Describe generator expressions compared to list comprehensions in terms of memory utilization.', category: 'Generators' },
  { questionText: 'How does Python handle custom exceptions? Write a structured try-except-finally block code.', category: 'Exceptions' },
  { questionText: 'Explain the differences between *args and **kwargs parameter unpacking in Python functions.', category: 'Python Args' },
  { questionText: 'What are magic (dunder) methods (e.g. __init__, __str__, __call__) and how are they used?', category: 'Magic Methods' },
  { questionText: 'Explain dynamic typing in Python and describe how typing hints benefit production code quality.', category: 'Type Hinting' },
  { questionText: 'How do you execute object-oriented class inheritance and method overriding in Python?', category: 'Python OOP' },
  { questionText: 'What is list slicing in Python? Explain start, stop, and step indexing parameters.', category: 'Python Slicing' },
  { questionText: 'Explain the difference between pip package installations and virtual environment sandboxing.', category: 'Environments' },
  { questionText: 'What are lambda expressions and in what functional programming contexts are they preferred?', category: 'Lambdas' },
  { questionText: 'How do you query databases in Python using an ORM like SQLAlchemy or Django models?', category: 'Python ORMs' },
  { questionText: 'Describe the purpose of the "with" context manager statement and how __enter__ and __exit__ work.', category: 'Context Mgrs' },
  { questionText: 'What is Method Resolution Order (MRO) in Python and how does super() resolve multiple inheritance?', category: 'MRO & super()' },
  { questionText: 'Explain how the asyncio event loop registers and processes non-blocking cooperative routines.', category: 'Async Python' },
  { questionText: 'What is the difference between "is" and "==" comparison checks in Python reference comparisons?', category: 'Operators' },
  { questionText: 'How would you write automated test classes using the unittest or pytest libraries in Python?', category: 'Testing Python' }
];

function getMockQuestions(role, type, limit = 5, format = 'theory', userSkills = []) {
  const roleLower = role.toLowerCase();
  let selectedPool = [];

  if (roleLower.includes('fullstack') || roleLower.includes('full stack')) {
    selectedPool = [...frontendPool, ...backendPool];
  } else if (roleLower.includes('front')) {
    selectedPool = frontendPool;
  } else if (roleLower.includes('python')) {
    selectedPool = pythonPool;
  } else if (roleLower.includes('back') || roleLower.includes('node') || roleLower.includes('express')) {
    selectedPool = backendPool;
  } else if (roleLower.includes('cloud') || roleLower.includes('devops') || roleLower.includes('aws')) {
    selectedPool = cloudPool;
  } else if (roleLower.includes('dsa') || roleLower.includes('algo') || roleLower.includes('data structure') || roleLower.includes('java')) {
    selectedPool = dsaPool;
  } else {
    selectedPool = mixedPool;
  }

  // Prioritize questions matching user's active skills (AI Memory Context)
  if (userSkills && userSkills.length > 0) {
    const matchingQuestions = selectedPool.filter(q => {
      return userSkills.some(skill => 
        q.questionText.toLowerCase().includes(skill.toLowerCase()) || 
        q.category.toLowerCase().includes(skill.toLowerCase())
      );
    });
    if (matchingQuestions.length > 0) {
      selectedPool = [...matchingQuestions, ...selectedPool.filter(q => !matchingQuestions.includes(q))];
    }
  }

  // Shuffle selectedPool to guarantee variety on subsequent clicks
  const shuffled = [...selectedPool].sort(() => 0.5 - Math.random());

  // Slice to requested limit (max available)
  let result = shuffled.slice(0, Math.min(limit, shuffled.length));

  // Backfill with unique mixedPool questions if the user requested more than available
  if (result.length < limit) {
    const extraMixed = [...mixedPool].sort(() => 0.5 - Math.random());
    for (const q of extraMixed) {
      if (result.length >= limit) break;
      if (!result.some(existing => existing.questionText === q.questionText)) {
        result.push(q);
      }
    }
  }

  // If format is MCQ, dynamically attach options and correctOption
  if (format === 'mcq') {
    return result.map((q, idx) => {
      const optionsArray = ['A', 'B', 'C', 'D'];
      const correctIdx = (q.questionText.length + idx) % 4;
      const correct = optionsArray[correctIdx];
      
      const options = [
        `A) Standard configuration for ${q.category}`,
        `B) Optimized layout approach for handling ${q.category} operations`,
        `C) Decentralized execution model for ${q.category}`,
        `D) Legacy solution with high dependency load`
      ];
      
      options[correctIdx] = `${correct}) Correct optimal solution for ${q.category} explaining its systems behavior.`;
      
      return {
        questionText: q.questionText,
        category: q.category,
        options,
        correctOption: correct,
        modelAnswer: `Option ${correct} is the optimal choice since it resolves the constraints of ${q.category} with minimal latency.`
      };
    });
  }

  return result;
}

function getMockAnswerReview(question, answer) {
  // Base score based on answer length
  let baseScore = 5;
  if (answer.length > 120) baseScore = 8;
  else if (answer.length > 60) baseScore = 7;
  else if (answer.length > 25) baseScore = 6;
  else baseScore = 4;

  // Add variance based on the question text length/characters to simulate realistic grading differences
  const charSum = question.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const variance = (charSum % 3) - 1; // Returns -1, 0, or 1

  // Final score bounded between 2 and 10
  let rating = Math.max(2, Math.min(10, baseScore + variance));

  // If answer is extremely short
  if (answer.trim().length < 6) {
    rating = 3;
  }

  return {
    rating: rating,
    feedback: rating >= 8 
      ? 'Exceptional description! You successfully highlighted key operational properties, system parameters, and code solutions. To make it absolute perfection, consider adding direct memory/computational complexity details (big-O).'
      : rating >= 6
      ? 'Good conceptual start, but needs more depth. Focus on explaining system boundaries, asynchronous performance loops, and real-world deployment trade-offs.'
      : 'Your answer is too brief or lacks structural detail. Make sure to define the technical concepts, mention specific framework features, and provide code or architectural scenarios.',
    modelAnswer: 'An exemplary response details: 1) Definitions of the technical concepts. 2) Practical code/framework references. 3) Scalability, security, and edge-cases (e.g. error checks) which shows comprehensive system understanding.'
  };
}

/**
 * 4. Compare Resume to Job Role (AI Resume Comparison)
 */
exports.compareResumeToRole = async (resumeText, jobRole) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Resume-to-Role Comparison.');
    return getMockRoleComparison(jobRole);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Compare the following resume text:
      "${resumeText}"
      with the target job role of:
      "${jobRole}"

      Identify the fit score, missing keywords, missing skills, and priority advice to improve.
      Return a JSON object matching this schema:
      {
        "matchScore": number (0-100),
        "missingSkills": [string],
        "missingKeywords": [string],
        "recommendations": [string]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Resume Comparison error:', error);
    return getMockRoleComparison(jobRole);
  }
};

/**
 * 5. Generate Cover Letter
 */
exports.generateCoverLetter = async (resumeText, jobDescription) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Cover Letter.');
    return getMockCoverLetter();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
    });

    const prompt = `
      Write a professional, personalized cover letter based on this candidate's resume:
      "${resumeText}"
      and this job description:
      "${jobDescription}"

      The cover letter must highlight matching skills, express enthusiasm, and maintain a polished corporate tone. Return only the text of the cover letter.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { coverLetterText: response.text().trim() };
  } catch (error) {
    console.error('Gemini Cover Letter Generation error:', error);
    return getMockCoverLetter();
  }
};

/**
 * 6. Get Company Preparation Guide
 */
exports.getCompanyPrep = async (companyName) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Company Prep.');
    return getMockCompanyPrep(companyName);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Generate detailed, realistic interview preparation details for the tech company "${companyName}".
      Provide accurate salary structures (both for freshers and experienced professionals), round-by-round interview structures, specific actual practice technical coding questions (with valid URLs to LeetCode/GeeksforGeeks if available), core topics tested in each round with reference article URLs and YouTube search query links, and a week-by-week roadmap.

      Return a JSON object matching this schema:
      {
        "companyName": "${companyName}",
        "salaryStats": {
          "fresher": "string (average annual package range for freshers in INR or USD, e.g., ₹18,00,000 - ₹24,00,000)",
          "experienced": "string (average annual package range for professionals with 3+ years experience, e.g., ₹28,00,000 - ₹45,00,000)"
        },
        "interviewRounds": [
          {
            "roundName": "string (e.g. Round 1: Online Coding Assessment)",
            "focus": "string (summary of round focus, e.g. DSA and Problem Solving)",
            "questions": [
              {
                "title": "string (name of an actual coding problem frequently asked at this company, e.g., Merge k Sorted Lists)",
                "difficulty": "string (Easy, Medium, or Hard)",
                "platform": "string (e.g. LeetCode, GeeksforGeeks)",
                "url": "string (valid absolute URL to practice this problem, e.g., https://leetcode.com/problems/merge-k-sorted-lists/)"
              }
            ],
            "topics": [
              {
                "name": "string (name of a key topic/concept tested, e.g., Segment Trees)",
                "articleUrl": "string (valid absolute reference link to study, e.g., https://www.geeksforgeeks.org/segment-tree-data-structure/)",
                "youtubeUrl": "string (valid absolute YouTube search query link, e.g., https://www.youtube.com/results?search_query=segment+tree+tutorial)"
              }
            ]
          }
        ],
        "preparationRoadmap": [
          {
            "phase": "string (e.g., Phase 1: Weeks 1-4)",
            "milestone": "string (specific targets, concepts, and mock interview goals to complete)"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Company Prep error:', error);
    return getMockCompanyPrep(companyName);
  }
};

/**
 * 7. Career Advisor Chatbot
 */
exports.getCareerChatbotResponse = async (userMessage, userProfileContext) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Chatbot response.');
    return getMockChatbotResponse(userMessage);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are CareerPilot AI, a highly advanced, supportive conversational AI advisor and tech mentor (similar to ChatGPT and Gemini but with rich career context).
      
      Core Instructions:
      1. Answer the student's query: "${userMessage}".
      2. NEVER refuse to answer general coding, programming, logic, career path, resume, interview preparation, or technical explanation questions. You are a comprehensive mentor, so help the student with whatever query they have.
      3. Detect the language of the query (e.g., Hindi, Hinglish, English, Spanish, etc.) and respond in the EXACT SAME language or conversational dialect the user used. If the user asks in Hindi or Hinglish, write the response in warm, conversational Hindi/Hinglish.
      4. Keep your answer highly detailed, structured, friendly, and formatted in clean markdown inside the "answer" field.

      User Profile Context: ${JSON.stringify(userProfileContext)}

      Structure your response as a JSON object containing:
      {
        "answer": string (detailed supportive markdown answer in the user's language),
        "learningResources": [string] (list of relevant resources, empty array if not applicable),
        "projects": [string] (list of relevant projects, empty array if not applicable),
        "courses": [string] (list of relevant courses, empty array if not applicable)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Chatbot error:', error);
    return getMockChatbotResponse(userMessage);
  }
};

/**
 * 8. Portfolio Reviewer
 */
exports.getPortfolioSuggestions = async (portfolioUrl) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Portfolio Review.');
    return getMockPortfolioReview(portfolioUrl);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an elite portfolio auditor. Review this portfolio link:
      "${portfolioUrl}"

      Give structural suggestions for their README, Projects list, UI design, SEO optimization, and profile details.
      Calculate a portfolio score (0-100) based on how complete and professional it looks.
      Return a JSON object matching this schema:
      {
        "portfolioUrl": "${portfolioUrl}",
        "score": number,
        "readmeAdvice": [string],
        "projectAdvice": [string],
        "uiAdvice": [string],
        "seoAdvice": [string]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Portfolio Review error:', error);
    return getMockPortfolioReview(portfolioUrl);
  }
};

function getMockRoleComparison(jobRole) {
  const role = (jobRole || '').toLowerCase();
  
  if (role.includes('frontend')) {
    return {
      matchScore: 82,
      missingSkills: ['React Query', 'TailwindCSS', 'Redux Toolkit', 'TypeScript'],
      missingKeywords: ['Single Page Application', 'SEO Optimization', 'Responsive Web Design', 'Component Lifecycle'],
      recommendations: [
        'Highlight TypeScript proficiency and advanced state management patterns in frontend apps.',
        'Add details about modern bundlers like Vite/Webpack and optimizing performance score (Lighthouse).',
        'Demonstrate API caching mechanisms using tools like React Query or RTK Query.'
      ]
    };
  }
  
  if (role.includes('backend')) {
    return {
      matchScore: 75,
      missingSkills: ['Redis', 'PostgreSQL', 'Docker', 'GraphQL'],
      missingKeywords: ['REST API Design', 'Database Indexing', 'Microservices', 'Message Queue'],
      recommendations: [
        'Add description of system design achievements (e.g. database query optimization metrics).',
        'Highlight server caching strategies using Redis and API rate-limiting implementation.',
        'Describe container deployment methodologies using Docker.'
      ]
    };
  }
  
  if (role.includes('fullstack')) {
    return {
      matchScore: 79,
      missingSkills: ['Next.js', 'PostgreSQL', 'Docker', 'TailwindCSS'],
      missingKeywords: ['Server Side Rendering', 'Client-Server Architecture', 'REST API', 'CI/CD Pipelines'],
      recommendations: [
        'Demonstrate end-to-end feature ownership from database design to frontend styling.',
        'Showcase Next.js App Router or Server-Side Rendering (SSR) capabilities.',
        'Add security practices like JWT auth, password hashing (bcrypt), and CSRF protection.'
      ]
    };
  }
  
  if (role.includes('python')) {
    return {
      matchScore: 77,
      missingSkills: ['Django', 'FastAPI', 'Pandas/NumPy', 'PostgreSQL'],
      missingKeywords: ['Data Wrangling', 'Asynchronous Operations', 'ORM', 'Object-Oriented Programming'],
      recommendations: [
        'Include machine learning or data analysis libraries if relevant (Pandas, NumPy).',
        'Highlight FastAPI query routing speeds and validation using Pydantic.',
        'Describe database interactions using SQLAlchemy or Django ORM.'
      ]
    };
  }
  
  if (role.includes('devops')) {
    return {
      matchScore: 72,
      missingSkills: ['Kubernetes', 'Terraform', 'GitHub Actions', 'AWS S3/EC2'],
      missingKeywords: ['Infrastructure as Code', 'Continuous Integration', 'Cloud Orchestration', 'Log Monitoring'],
      recommendations: [
        'Highlight automated build, test, and deploy pipelines using GitHub Actions or Jenkins.',
        'Showcase Infrastructure as Code (IaC) setup using Terraform files.',
        'List cloud monitoring metrics configured using Prometheus, Grafana, or AWS CloudWatch.'
      ]
    };
  }
  
  if (role.includes('data structures') || role.includes('dsa')) {
    return {
      matchScore: 85,
      missingSkills: ['Dynamic Programming', 'Graph Theory', 'Time Complexity Analysis'],
      missingKeywords: ['Algorithm Design', 'Space Complexity Optimization', 'Bit Manipulation', 'Tree Traversal'],
      recommendations: [
        'Provide LeetCode rating or competitive programming profiles if applicable.',
        'Highlight optimization achievements (e.g. reducing runtime from O(N^2) to O(N log N)).',
        'Showcase deep understanding of recursive patterns and memory allocation details.'
      ]
    };
  }

  // Default fallback
  return {
    matchScore: 78,
    missingSkills: ['Docker', 'AWS', 'Redux Toolkit'],
    missingKeywords: ['REST API', 'Microservices', 'Kubernetes'],
    recommendations: [
      'Add measurable achievements to demonstrate project impact.',
      'Highlight containerization and cloud orchestration methodologies.',
      'Showcase state-management architectures clearly in front-end descriptions.'
    ]
  };
}

function getMockCoverLetter() {
  return {
    coverLetterText: `Dear Hiring Manager,

I am writing to express my strong interest in the open position. Based on my technical background and parsed qualifications, I am confident in my ability to contribute value to your development team.

I have solid experience in designing and building core application architectures, optimizing database queries, and styling responsive interfaces. In my previous work, I have successfully integrated robust API systems and collaborated with cross-functional teams to ship clean, reusable code structures.

I am eager to bring my problem-solving mindset and dedication to continuous learning to your organization. Thank you for your time and consideration.

Sincerely,
CareerPilot Candidate`
  };
}

function getMockCompanyPrep(companyName) {
  const name = companyName || 'Google';
  
  return {
    companyName: name,
    salaryStats: {
      fresher: name.toLowerCase() === 'google' ? '₹18,00,000 - ₹24,00,000 base + Stocks' : 
               name.toLowerCase() === 'microsoft' ? '₹16,00,000 - ₹22,00,000 base + Stocks' :
               name.toLowerCase() === 'amazon' ? '₹15,00,000 - ₹20,00,000 base + Stocks' : '₹8,00,000 - ₹12,00,000 base',
      experienced: name.toLowerCase() === 'google' ? '₹28,00,000 - ₹55,00,000 base + Stocks' : 
                   name.toLowerCase() === 'microsoft' ? '₹26,00,000 - ₹48,00,000 base + Stocks' :
                   name.toLowerCase() === 'amazon' ? '₹24,00,000 - ₹42,00,000 base + Stocks' : '₹16,00,000 - ₹28,00,000 base'
    },
    interviewRounds: [
      {
        roundName: 'Round 1: Online Coding Assessment (OA)',
        focus: 'Data Structures & Algorithms / Problem Solving speed',
        questions: [
          {
            title: 'Merge k Sorted Lists',
            difficulty: 'Hard',
            platform: 'LeetCode',
            url: 'https://leetcode.com/problems/merge-k-sorted-lists/'
          },
          {
            title: 'Sliding Window Maximum',
            difficulty: 'Hard',
            platform: 'LeetCode',
            url: 'https://leetcode.com/problems/sliding-window-maximum/'
          }
        ],
        topics: [
          {
            name: 'Segment Trees',
            articleUrl: 'https://www.geeksforgeeks.org/segment-tree-data-structure/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=segment+tree+tutorial'
          },
          {
            name: 'Heaps & Priority Queues',
            articleUrl: 'https://www.geeksforgeeks.org/max-heap-in-java/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=heap+data+structure+tutorial'
          }
        ]
      },
      {
        roundName: 'Round 2: Technical DSA Coding Rounds (Onsite)',
        focus: 'Deep algorithmic complexity analysis, graph theory, trees, and backtracking optimization',
        questions: [
          {
            title: 'Word Search II',
            difficulty: 'Hard',
            platform: 'LeetCode',
            url: 'https://leetcode.com/problems/word-search-ii/'
          },
          {
            title: 'Lowest Common Ancestor of a Binary Tree',
            difficulty: 'Medium',
            platform: 'LeetCode',
            url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/'
          }
        ],
        topics: [
          {
            name: 'Trie / Prefix Tree',
            articleUrl: 'https://www.geeksforgeeks.org/trie-insert-and-search/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=trie+data+structure+tutorial'
          },
          {
            name: 'DFS / BFS Traversal',
            articleUrl: 'https://www.geeksforgeeks.org/depth-first-search-or-dfs-for-a-graph/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=graph+traversal+dfs+bfs'
          }
        ]
      },
      {
        roundName: 'Round 3: System Design & Scalability',
        focus: 'Microservices architecture, distributed caching, database sharding, and message queues',
        questions: [
          {
            title: 'Design YouTube Video Streaming Service',
            difficulty: 'Medium',
            platform: 'GeeksforGeeks',
            url: 'https://www.geeksforgeeks.org/system-design-youtube/'
          },
          {
            title: 'Design Google Drive / Dropbox Cloud Storage',
            difficulty: 'Hard',
            platform: 'GeeksforGeeks',
            url: 'https://www.geeksforgeeks.org/design-dropbox-system-design/'
          }
        ],
        topics: [
          {
            name: 'Load Balancers & Reverse Proxies',
            articleUrl: 'https://www.geeksforgeeks.org/system-design-load-balancer/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=load+balancer+system+design'
          },
          {
            name: 'Consistent Hashing',
            articleUrl: 'https://www.geeksforgeeks.org/consistent-hashing-system-design/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=consistent+hashing+system+design'
          }
        ]
      },
      {
        roundName: 'Round 4: Cultural Fitment & HR Leadership',
        focus: 'Behavioral analysis using the STAR method, leadership values, and core alignment',
        questions: [
          {
            title: 'STAR Method Interview Framework practice',
            difficulty: 'Easy',
            platform: 'GeeksforGeeks',
            url: 'https://www.geeksforgeeks.org/how-to-use-star-method-for-behavioral-interviews/'
          }
        ],
        topics: [
          {
            name: 'Leadership Principles',
            articleUrl: 'https://www.geeksforgeeks.org/behavioral-interview-questions/',
            youtubeUrl: 'https://www.youtube.com/results?search_query=behavioral+interview+questions+star+method'
          }
        ]
      }
    ],
    preparationRoadmap: [
      {
        phase: 'Phase 1: DSA Foundations & Graph Algorithms (Weeks 1-4)',
        milestone: 'Solve 50+ LeetCode Medium/Hard questions on Trees, Tries, Dijkstra, and DP. Practice memory complexity optimization.'
      },
      {
        phase: 'Phase 2: Scalable System Design & Database Schema (Weeks 5-8)',
        milestone: 'Study distributed caching, load balancers, rate limiters, and consistent hashing. Read the System Design Primer.'
      },
      {
        phase: 'Phase 3: Star Method & Mock Simulations (Weeks 9-10)',
        milestone: 'Prepare detailed stories for standard behavioral queries. Conduct 3x mock interview runs under active timers.'
      }
    ]
  };
}

function getMockChatbotResponse(userMessage = '') {
  const msg = userMessage.toLowerCase();

  // 1. Comprehensive Local Tech Dictionary (Word-boundary matching to prevent overlaps)
  const dictionary = {
    'python': {
      answer: `**Python** is a high-level, interpreted programming language known for its clear syntax and ease of learning:

1. **General Purpose**: Widely used in web development (Django, Flask), data science, machine learning, AI scripting, and automation.
2. **Key Concepts**: Dynamic typing, automatic memory management (garbage collection), and clean readable code paradigms.
3. **Ecosystem**: Managed via the \`pip\` package installer and structured isolated environments (\`venv\`).`,
      resources: ['Python Official Documentation & Tutorials', 'Real Python - Technical Guides Library'],
      projects: ['Write an automation web-scraper in Python', 'Build a REST API server using Flask and SQL'],
      courses: ['Python for Everybody Specialization (Coursera)', 'Complete Python Boot Camp (Udemy)']
    },
    'java': {
      answer: `**Java** is a class-based, object-oriented, statically-typed programming language designed to run anywhere:

1. **Java Virtual Machine (JVM)**: Compiled Java code compiles to bytecode that runs on any machine with JVM installed without recompiling.
2. **Enterprise Standard**: Widely used in large-scale corporate backend systems, Android applications, and financial transactions engines.
3. **Key Concepts**: Strict object-oriented design, garbage collection, strong type-safety, and concurrent multithreading.`,
      resources: ['Oracle Java Documentation Hub', 'Baeldung - Java Coding Explanations'],
      projects: ['Design a library inventory console app in Java', 'Build an API server using Spring Boot framework'],
      courses: ['Java Programming Masterclass (Udemy)', 'Object-Oriented Programming in Java (Coursera)']
    },
    'c\\+\\+': {
      answer: `**C++** is a high-performance, general-purpose programming language providing low-level memory access:

1. **Performance**: Extremely fast execution speed, making it the industry standard for game engines, operating systems, and competitive programming.
2. **Memory Management**: Offers manual memory control (pointers, references, allocation) alongside object-oriented, procedural, and generic templates.
3. **Ecosystem**: Supported by standard library data containers (STL) such as vectors, maps, queues, and search trees.`,
      resources: ['Cplusplus Reference Library', 'LearnCpp - Structured C++ Tutorials'],
      projects: ['Solve competitive DSA questions in C++', 'Write a simple command-line game using pointers'],
      courses: ['Beginning C++ Programming - From Beginner to Master (Udemy)', 'C++ Programming Specialization (Coursera)']
    },
    'go': {
      answer: `**Go (Golang)** is a statically-typed, compiled language developed by Google for simplicity and speed:

1. **Concurrency Support**: Built-in concurrency tools using lightweight processes (Goroutines) and communication pipelines (Channels).
2. **Clarity**: Stripped of complex object-oriented features (no inheritance, classes, templates) to maintain rapid compilation and simple reading.
3. **Usage**: Dominates modern cloud-native systems, microservices architectures, and backend networking packages.`,
      resources: ['Go Tour - Interactive Coding Guide', 'Go Official Packages Documentation'],
      projects: ['Build a concurrent chat server using Goroutines', 'Write a microservices endpoint using Gin framework'],
      courses: ['Programming with Google Go (Coursera)', 'Go Developer Masterclass (Udemy)']
    },
    'golang': {
      answer: `**Go (Golang)** is a statically-typed, compiled language developed by Google for simplicity and speed:

1. **Concurrency Support**: Built-in concurrency tools using lightweight processes (Goroutines) and communication pipelines (Channels).
2. **Clarity**: Stripped of complex object-oriented features (no inheritance, classes, templates) to maintain rapid compilation and simple reading.
3. **Usage**: Dominates modern cloud-native systems, microservices architectures, and backend networking packages.`,
      resources: ['Go Tour - Interactive Coding Guide', 'Go Official Packages Documentation'],
      projects: ['Build a concurrent chat server using Goroutines', 'Write a microservices endpoint using Gin framework'],
      courses: ['Programming with Google Go (Coursera)', 'Go Developer Masterclass (Udemy)']
    },
    'rust': {
      answer: `**Rust** is a multi-paradigm programming language focused on safety, performance, and concurrency:

1. **Memory Safety**: Guarantees memory safety without a garbage collector through a system of ownership, borrow checker, and lifetimes.
2. **Performance**: Runs close to raw hardware speeds (matching C/C++), making it ideal for systems programming and WebAssembly.
3. **Usage**: Operating systems, browser engines, blockchain systems, and high-performance server utilities.`,
      resources: ['The Rust Programming Language Book', 'Rust by Example Interactive Guide'],
      projects: ['Implement a fast CLI file parser in Rust', 'Build a web server backend using Actix Web'],
      courses: ['Rust Programming Course (freeCodeCamp)', 'Rust for Systems Programmers (Udemy)']
    },
    'typescript': {
      answer: `**TypeScript** is a strongly-typed programming language that builds directly on JavaScript:

1. **Static Typing**: Compiles down to clean JavaScript while providing compile-time type validation, preventing production runtime bugs.
2. **Tooling**: Enables rich auto-complete features, code refactoring tools, and structural interface contracts.
3. **Usage**: Highly recommended for large React, Next.js, and Node.js production codebases.`,
      resources: ['TypeScript Hand Book & Official Docs', 'TypeScript Deep Dive Guide'],
      projects: ['Refactor a React component to TypeScript', 'Build typed Express request payload validation interfaces'],
      courses: ['TypeScript Basics (freeCodeCamp)', 'Advanced TypeScript Patterns (Frontend Masters)']
    },
    'node': {
      answer: `**Node.js** is a cross-platform JavaScript runtime environment that executes code outside the browser:

1. **V8 Engine**: Uses the Google V8 engine to compile JavaScript directly into machine code for fast execution speeds.
2. **Asynchronous Architecture**: Non-blocking I/O event loop model makes Node ideal for building scalable data-intensive network apps.
3. **Ecosystem**: Powered by \`npm\` (Node Package Manager) containing millions of open source software modules.`,
      resources: ['Node.js Official Documentation Guide', 'Node.js Best Practices Directory'],
      projects: ['Write an async file parser in Node', 'Design a scalable HTTP REST API server'],
      courses: ['Learn Node.js Complete course (freeCodeCamp)', 'Node.js Developer course (Udemy)']
    },
    'nodejs': {
      answer: `**Node.js** is a cross-platform JavaScript runtime environment that executes code outside the browser:

1. **V8 Engine**: Uses the Google V8 engine to compile JavaScript directly into machine code for fast execution speeds.
2. **Asynchronous Architecture**: Non-blocking I/O event loop model makes Node ideal for building scalable data-intensive network apps.
3. **Ecosystem**: Powered by \`npm\` (Node Package Manager) containing millions of open source software modules.`,
      resources: ['Node.js Official Documentation Guide', 'Node.js Best Practices Directory'],
      projects: ['Write an async file parser in Node', 'Design a scalable HTTP REST API server'],
      courses: ['Learn Node.js Complete course (freeCodeCamp)', 'Node.js Developer course (Udemy)']
    },
    'git': {
      answer: `**Git** is a distributed version control system designed to track changes in source code files:

1. **Branching Model**: Allows multiple developers to work concurrently in isolated branches before merging code into main trunks.
2. **Traceability**: Keeps a complete historical log of commits, allowing developers to inspect file changes or roll back updates.
3. **Collaborative Hubs**: Works in tandem with hosting platforms like GitHub, GitLab, or Bitbucket for team pull-requests reviews.`,
      resources: ['Git Pro Book Official Resource', 'GitHub Guides Reference Library'],
      projects: ['Set up a custom project commit branch tree', 'Resolve simulated git merge conflict blocks'],
      courses: ['Version Control with Git (Coursera)', 'GitHub Fundamentals Course (freeCodeCamp)']
    },
    'docker': {
      answer: `**Docker** is a containerization platform that packages software applications alongside all their dependencies:

1. **Containers**: Lightweight, standalone execution environments isolated from the host OS, ensuring the application runs identically on all environments.
2. **Dockerfiles & Images**: Dockerfiles define step-by-step instructions to compile static application images that can be published or shared.
3. **Efficiency**: Utilizes host OS kernels directly, making containers faster and more lightweight compared to traditional Virtual Machines.`,
      resources: ['Docker Getting Started Guides', 'Docker Hub Image Catalog'],
      projects: ['Write a Dockerfile to package your Express backend', 'Run postgres or redis databases inside local container networks'],
      courses: ['Docker Technologies Overview (freeCodeCamp)', 'Docker Masterclass for DevOps (Udemy)']
    },
    'kubernetes': {
      answer: `**Kubernetes (K8s)** is an open-source system for automating deployment, scaling, and management of containerized applications:

1. **Orchestration**: Manages containers across cluster networks, automatically handling load balancing, health monitoring, and scaling.
2. **Self-Healing**: Automatically restarts failed containers, replaces pods, and rolls back updates if container checks fail.
3. **Usage**: Industry standard for managing distributed microservices architectures at scale.`,
      resources: ['Kubernetes Official Documentation', 'KubeAcademy by VMware Tutorials'],
      projects: ['Deploy a multi-container app cluster locally using Minikube', 'Configure ingress paths and horizontal pod autoscaling'],
      courses: ['Kubernetes for Beginners (freeCodeCamp)', 'Certified Kubernetes Administrator (Udemy)']
    },
    'aws': {
      answer: `**AWS (Amazon Web Services)** is the world's most comprehensive and broadly adopted cloud platform:

1. **Compute Services**: Deploy applications globally using EC2 virtual machines or serverless structures like AWS Lambda.
2. **Storage Services**: Save assets, database backups, or media chunks securely using block storage or S3 object databases.
3. **Security & Identity**: Enforce access permissions across resources using fine-grained IAM roles and network VPC subnets.`,
      resources: ['AWS Documentation Hub', 'AWS Architecture Center Guide'],
      projects: ['Deploy your full-stack app on an EC2 instance', 'Host static frontend files inside an S3 bucket'],
      courses: ['AWS Certified Cloud Practitioner (Coursera)', 'AWS Associate Developer Training (Udemy)']
    },
    'cloud': {
      answer: `**Cloud Computing** is the on-demand delivery of IT resources (like servers, databases, storage, and networking) over the internet with pay-as-you-go pricing:

1. **Service Models**:
   - **IaaS (Infrastructure as a Service)**: Rent raw servers and storage (e.g. AWS EC2).
   - **PaaS (Platform as a Service)**: Deployment environments where cloud vendors manage OS and runtimes (e.g. Heroku, Vercel).
   - **SaaS (Software as a Service)**: Complete end-user applications hosted in the cloud (e.g. Google Workspace, Slack).
2. **Advantages**: Eliminates capital expenses of buying hardware, scales globally in minutes, and increases developer deployment speeds.`,
      resources: ['AWS Cloud Practitioner Essentials', 'Google Cloud Fundamentals Guide'],
      projects: ['Deploy a static web application to AWS S3 and CloudFront', 'Build a serverless function using AWS Lambda or Google Cloud Functions'],
      courses: ['Introduction to Cloud Computing (Coursera)', 'Cloud DevOps Engineer Path (Udacity)']
    },
    'cloud computing': {
      answer: `**Cloud Computing** is the on-demand delivery of IT resources (like servers, databases, storage, and networking) over the internet with pay-as-you-go pricing:

1. **Service Models**:
   - **IaaS (Infrastructure as a Service)**: Rent raw servers and storage (e.g. AWS EC2).
   - **PaaS (Platform as a Service)**: Deployment environments where cloud vendors manage OS and runtimes (e.g. Heroku, Vercel).
   - **SaaS (Software as a Service)**: Complete end-user applications hosted in the cloud (e.g. Google Workspace, Slack).
2. **Advantages**: Eliminates capital expenses of buying hardware, scales globally in minutes, and increases developer deployment speeds.`,
      resources: ['AWS Cloud Practitioner Essentials', 'Google Cloud Fundamentals Guide'],
      projects: ['Deploy a static web application to AWS S3 and CloudFront', 'Build a serverless function using AWS Lambda or Google Cloud Functions'],
      courses: ['Introduction to Cloud Computing (Coursera)', 'Cloud DevOps Engineer Path (Udacity)']
    },
    'machine learning': {
      answer: `**Machine Learning (ML)** is a subset of Artificial Intelligence (AI) focused on building systems that learn from data to improve performance without explicit programming:

1. **Main Types**:
   - **Supervised Learning**: Models trained on labeled datasets (e.g. linear regression, classification trees).
   - **Unsupervised Learning**: Models finding hidden patterns in unlabeled data (e.g. K-Means clustering, PCA).
   - **Reinforcement Learning**: Training agents to make decisions by rewarding desired behaviors and punishing negative ones.
2. **Standard Stack**: Python-based libraries such as NumPy, Pandas, Scikit-Learn, TensorFlow, and PyTorch.`,
      resources: ['Kaggle Machine Learning Courses', 'Scikit-Learn Official User Guides'],
      projects: ['Predict housing prices using a linear regression model', 'Classify images using a simple Convolutional Neural Network (CNN)'],
      courses: ['Machine Learning Specialization by Andrew Ng (Coursera)', 'Fast.ai - Practical Deep Learning for Coders']
    },
    'artificial intelligence': {
      answer: `**Artificial Intelligence (AI)** is the simulation of human intelligence processes by machines and computer systems:

1. **Key Branches**: Natural Language Processing (NLP) for speech and text translation, Computer Vision for image analysis, and Generative AI (LLMs) like GPT and Claude.
2. **Deep Learning**: Uses multi-layered neural networks inspired by biological brains to solve complex tasks.
3. **Ethical AI**: Ensuring model alignment, reducing bias, and protecting data privacy.`,
      resources: ['OpenAI Developer Documentation', 'Hugging Face NLP Course Guides'],
      projects: ['Build a text classifier using Hugging Face Transformers', 'Develop a question-answering assistant using LangChain'],
      courses: ['AI for Everyone by Andrew Ng (Coursera)', 'Deep Learning Specialization (DeepLearning.AI)']
    },
    'system design': {
      answer: `**System Design** is the process of defining the architecture, components, and interfaces for a software system to satisfy specified scaling requirements:

1. **Core Scaling Building Blocks**:
   - **Load Balancers**: Distributing traffic across multiple servers (e.g., Nginx, AWS ALB).
   - **Caching**: Storing frequent queries in fast in-memory databases (e.g., Redis, Memcached).
   - **Database Sharding**: Splitting large databases horizontally across multiple servers.
2. **Key Concepts**: System Availability (uptime), Latency vs Throughput, and the CAP Theorem (Consistency, Availability, Partition Tolerance).`,
      resources: ['System Design Primer by Donne Martin (GitHub)', 'ByteByteGo - System Design Fundamentals'],
      projects: ['Design the architecture of a real-time messaging system', 'Implement a rate limiter middleware for your REST API'],
      courses: ['Grokking the System Design Interview', 'Pragmatic System Design (Frontend Masters)']
    },
    'devops': {
      answer: `**DevOps** is a set of practices, tools, and cultural philosophies that automate and integrate the processes between software development and IT teams:

1. **Continuous Integration/Continuous Deployment (CI/CD)**: Automates the building, testing, and deployment of code updates (e.g., GitHub Actions, Jenkins).
2. **Infrastructure as Code (IaC)**: Provisioning and managing server infrastructure using configuration files (e.g., Terraform, Ansible).
3. **Monitoring & Logging**: Tracking system health indicators and errors in real-time (e.g., Prometheus, Grafana, ELK Stack).`,
      resources: ['DevOps Roadmap Guide (Roadmap.sh)', 'GitHub Actions Workflow Documentation'],
      projects: ['Configure a CI/CD pipeline that automatically tests and deploys code on git push', 'Set up Prometheus health monitoring dashboard for an API'],
      courses: ['Introduction to DevOps (Coursera)', 'DevOps Engineering Career Path (Udacity)']
    },
    'microservices': {
      answer: `**Microservices** is an architectural design pattern that structures an application as a collection of small, loosely coupled services:

1. **Decoupling**: Each service runs a unique process and communicates over lightweight protocols (HTTP/REST or gRPC).
2. **Benefits**: Individual services can be developed, deployed, and scaled independently by separate teams.
3. **Challenges**: High operational complexity, managing network latencies, data consistency across multiple databases, and tracing issues (e.g., using Zipkin or Jaeger).`,
      resources: ['Microservices.io Patterns and Architectures', 'Designing Data-Intensive Applications by Martin Kleppmann'],
      projects: ['Build a simple online shop divided into user, catalog, and order services', 'Configure an API Gateway to route requests to backend sub-services'],
      courses: ['Microservices Architecture Specialization (Coursera)', 'Building Microservices with Go (Udemy)']
    },
    'serverless': {
      answer: `**Serverless Computing** is an execution model where cloud providers dynamically manage the allocation and provisioning of server runtimes:

1. **Function as a Service (FaaS)**: Write standalone functions triggered by events like HTTP requests or database changes (e.g., AWS Lambda, Vercel Functions).
2. **Pay-per-Execution**: You pay only for the exact compute time your code runs, with billing down to the millisecond. No idle server fees.
3. **Cold Starts**: The latency overhead that occurs when a cloud provider boots up a new container instance to handle an incoming function request.`,
      resources: ['Serverless Framework Getting Started Guide', 'AWS Lambda Official Reference'],
      projects: ['Build a serverless contact form backend using AWS Lambda and API Gateway', 'Set up cron trigger function using Vercel serverless'],
      courses: ['Serverless Computing Foundations (Coursera)', 'AWS Lambda & Serverless Architecture (Udemy)']
    },
    'nextjs': {
      answer: `**Next.js** is a powerful React framework for building production-ready, highly optimized web applications:

1. **Rendering Options**: Supports Server-Side Rendering (SSR), Static Site Generation (SSG), and Incremental Static Regeneration (ISR).
2. **Routing Model**: File-system based router using the App Router (\`app/\` directory) supporting server components by default.
3. **Optimizations**: Automatic code splitting, image optimization (\`<Image />\`), and prefetching linked routes.`,
      resources: ['Next.js Official Documentation & Learn Hub', 'Vercel Next.js Deployment Guides'],
      projects: ['Build a full-stack blog site with Next.js App Router and Markdown metadata', 'Configure incremental static regeneration for a catalog page'],
      courses: ['Next.js complete course (freeCodeCamp)', 'Production-grade Next.js (Frontend Masters)']
    },
    'redux': {
      answer: `**Redux** is a predictable state container for JavaScript apps, primarily used with React for global state management:

1. **Core Principles**: Single source of truth (global store), state is read-only, and changes are made using pure functions (Reducers).
2. **Actions & Dispatch**: Components dispatch descriptive actions containing payload data to update the store.
3. **Redux Toolkit (RTK)**: Modern standard that simplifies configuration, reduces boilerplate, and includes built-in slice and query tools (RTK Query).`,
      resources: ['Redux Toolkit Official Getting Started Docs', 'React Redux Integration Tutorial'],
      projects: ['Build a shopping cart system managing global state with Redux Toolkit', 'Incorporate caching and query hooks using RTK Query'],
      courses: ['Modern Redux Course (freeCodeCamp)', 'Redux Saga & Advanced State Management (Udemy)']
    },
    'jwt': {
      answer: `**JSON Web Token (JWT)** is an open standard that defines a compact, self-contained way for securely transmitting information between parties as a JSON object:

1. **Structure**: Consists of three parts separated by dots: Header (algorithm), Payload (user claims), and Signature (secret verification).
2. **Stateless Auth**: The server doesn't need to keep session records in database tables; it verifies the signature to authorize requests.
3. **Best Practices**: Store tokens in HttpOnly cookies to prevent Cross-Site Scripting (XSS) attacks, and keep expiration times short.`,
      resources: ['JWT.io Debugger & Specifications', 'OWASP Token Authentication Guide'],
      projects: ['Implement user login token signing in Express', 'Create request authorization middleware verifying JWT signatures'],
      courses: ['Node.js API Authentication Security (Coursera)', 'Web App Security Guide (LinkedIn Learning)']
    },
    'django': {
      answer: `**Django** is a high-level Python web framework that encourages rapid development and clean, pragmatic design:

1. **Batteries Included**: Comes with built-in user authentication, admin panels, object-relational mapping (ORM), and database migration tools.
2. **MVC Architecture**: Uses a Model-View-Template (MVT) design pattern to structure code logic cleanly.
3. **Security**: Automatically provides built-in protection against SQL Injection, Cross-Site Scripting (XSS), and Cross-Site Request Forgery (CSRF).`,
      resources: ['Django Project Official Documentation', 'Django Girls Tutorial Guide'],
      projects: ['Build a blog platform with active admin dashboards in Django', 'Write a custom REST API using Django REST Framework (DRF)'],
      courses: ['Django for Beginners (freeCodeCamp)', 'Python Django Full Stack Web Dev (Udemy)']
    },
    'flask': {
      answer: `**Flask** is a lightweight, micro web framework written in Python:

1. **Micro-Framework**: Provides only the essential routing and template engines, leaving database and authentication choices to the developer.
2. **Extension Ecosystem**: Easily extendable using third-party packages like Flask-SQLAlchemy, Flask-Login, and Flask-RESTful.
3. **Simplicity**: Highly beginner-friendly, requiring only a few lines of code to boot up a basic web server.`,
      resources: ['Flask Documentation and Quickstart Guide', 'The Flask Mega-Tutorial by Miguel Grinberg'],
      projects: ['Build a simple server monitoring endpoint in Flask', 'Connect a PostgreSQL database to a Flask API backend'],
      courses: ['Flask Web Development Path (freeCodeCamp)', 'Python and Flask Bootcamp (Udemy)']
    },
    'express': {
      answer: `**Express.js** is a minimal and flexible Node.js web application framework:

1. **Routing**: Simple and powerful URL routing tools matching standard HTTP request paths.
2. **Middleware Model**: Request/Response pipeline where you run code, parse JSON bodies, verify JWT tokens, and throw error logs.
3. **De-facto Standard**: Serves as the standard backend layer for the MERN (MongoDB, Express, React, Node) stack.`,
      resources: ['Express.js Official Site & Guides', 'Express Middleware Reference Documentation'],
      projects: ['Design secure routing controllers for user signup profiles', 'Write request body verification validation middleware'],
      courses: ['REST APIs with Node and Express (freeCodeCamp)', 'Node.js and Express Complete Guide (Udemy)']
    },
    'agile': {
      answer: `**Agile** is a software development methodology focused on iterative development, collaboration, and rapid response to change:

1. **Scrum Framework**: The most popular Agile system, organizing work into fixed-length cycles (Sprints, usually 2-4 weeks) led by a Scrum Master.
2. **Key Ceremonies**: Daily Standups (quick progress checks), Sprint Planning (committing to tasks), and Sprint Retrospectives (inspecting improvements).
3. **Artifacts**: Product Backlog (prioritized tasks list), Sprint Backlog, and Burndown Charts tracking progress.`,
      resources: ['Agile Alliance Resource Library', 'Scrum Guides by Ken Schwaber & Jeff Sutherland'],
      projects: ['Participate in a team project using Jira/Trello boards', 'Simulate sprint task board allocations'],
      courses: ['Agile Development Specialization (Coursera)', 'Scrum Master Certification Course (Scrum.org)']
    }
  };

  // Run word-boundary RegExp match to select dictionary definitions
  for (const [key, val] of Object.entries(dictionary)) {
    // Escape special characters in keys (like c++)
    const escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedKey}\\b`, 'i');
    if (regex.test(userMessage)) {
      return {
        answer: val.answer,
        learningResources: val.resources,
        projects: val.projects,
        courses: val.courses
      };
    }
  }

  // 2. Developer / Fullstack general concepts check
  if (msg.includes('fullstack') || msg.includes('full stack') || msg.includes('developer') || msg.includes('engineer') || msg.includes('frontend') || msg.includes('backend') || msg.includes('web dev') || msg.includes('dev')) {
    return {
      answer: `A **Full Stack Developer** is a software professional who builds both client-facing interfaces and server-side logic:

1. **Frontend (Client-Side)**: Responsive layouts using HTML5, CSS3, JavaScript/TypeScript, and modern UI frameworks like React or Vue.
2. **Backend (Server-Side)**: Servers, API endpoints, request routing, middleware security (JWT tokens), and databases (SQL like Postgres, or NoSQL like MongoDB).
3. **Infrastructure & DevOps**: Containerization (Docker), version management (Git & GitHub), and cloud hosting (Vercel, AWS, Render).

To grow as a full stack developer, practice building complete applications that connect custom backend API routes with frontend panels!`,
      learningResources: [
        'Roadmap.sh - Full Stack Developer Timelines',
        'MDN Web Docs - Learning Web Development'
      ],
      projects: [
        'Practice descriptive mock interviews for Fullstack roles',
        'Build a task tracking dashboard connecting React and Express'
      ],
      courses: [
        'CS50: Introduction to Computer Science (Harvard)',
        'Full Stack Open (University of Helsinki)'
      ]
    };
  }

  // 3. HTML forms / Elements check
  if (msg.includes('form') || msg.includes('tag') || msg.includes('element') || msg.includes('div') || msg.includes('span') || msg.includes('input') || msg.includes('html')) {
    return {
      answer: `In **HTML (HyperText Markup Language)**, tags and elements define the structure and layout of content on a web page:

1. **HTML Form Tag (\`<form>\`)**: Act as a container wrapping various input controls (like text boxes, selectors, buttons). It specifies the destination API path (\`action\`) and the HTTP transmission method (\`method="POST"\` or \`"GET"\`) for submitting data to a backend server.
2. **Semantic Elements**: Tags like \`<header>\`, \`<section>\`, \`<article>\`, and \`<footer>\` provide clear meaning to both browsers and search crawlers, greatly enhancing SEO accessibility.
3. **Container Elements**: Tags like \`<div>\` (block-level wrapper) and \`<span>\` (inline-level text wrapper) are used to group sections for styling or DOM manipulations via JavaScript.`,
      learningResources: [
        'MDN Web Docs - HTML Form Element Guide',
        'W3Schools - HTML Semantic Elements list'
      ],
      projects: [
        'Build a responsive forms layout on your Login component',
        'Replace generic div wrappers with semantic section elements'
      ],
      courses: [
        'Introduction to HTML5 and Web Page Layouts (freeCodeCamp)',
        'Advanced HTML Semantic Architectures (Frontend Masters)'
      ]
    };
  }

  // 4. CSS styling / layouts check
  if (msg.includes('css') || msg.includes('styling') || msg.includes('layout') || msg.includes('flexbox') || msg.includes('grid') || msg.includes('tailwind') || msg.includes('responsive')) {
    return {
      answer: `**CSS Layouts** and styling define the visual structure and responsive behavior of web applications:

1. **Flexbox (One-Dimensional)**: Best for laying out items in a single row or column. It provides powerful alignment, distribution, and ordering capabilities.
2. **CSS Grid (Two-Dimensional)**: Designed for complex page structures with both rows and columns. It allows you to align items into distinct grid tracks.
3. **Responsive Web Design**: Uses media queries and fluid layouts (percentages, viewport units like \`vh\`/\`vw\`, or rems) to adapt the UI for mobile, tablet, and desktop screens.
4. **Modern Utility Frameworks**: Tailwind CSS, Bootstrap, or Vanilla CSS variables help build consistent design systems across your elements.`,
      learningResources: [
        'MDN Web Docs - CSS Layouts Guide',
        'CSS-Tricks - A Complete Guide to Flexbox & Grid'
      ],
      projects: [
        'Build a responsive dashboard landing page using CSS variables',
        'Practice styling cards inside the Learning Resources interface'
      ],
      courses: [
        'Modern HTML & CSS (FreeCodeCamp)',
        'CSS Grid and Flexbox Masterclass (Frontend Masters)'
      ]
    };
  }

  // 5. Databases check
  if (msg.includes('database') || msg.includes('db') || msg.includes('sql') || msg.includes('mongodb') || msg.includes('postgres') || msg.includes('mysql') || msg.includes('nosql')) {
    return {
      answer: `**Databases** store and manage structured application data securely. They fall into two main paradigms:

1. **Relational Databases (SQL)**: Databases like PostgreSQL or MySQL store data in structured tables with defined schemas and relationships. They enforce ACID properties, making them ideal for transaction-heavy systems.
2. **Document Databases (NoSQL)**: Databases like MongoDB store data in flexible, JSON-like document structures. They scale horizontally and adapt easily to changing schemas.
3. **Optimizations**: Use database indexes to speed up query response rates, and structure normalization to prevent data redundancy.`,
      learningResources: [
        'PostgreSQL Official Documentation',
        'MongoDB Atlas - Cloud Data Services guide'
      ],
      projects: [
        'Connect Mongoose schemas to your Express server routes',
        'Optimize slow SQL lookup operations using indexes'
      ],
      courses: [
        'Database Design and SQL Foundations (Coursera)',
        'MongoDB Developer Path (MongoDB University)'
      ]
    };
  }

  // 6. APIs check
  if (msg.includes('api') || msg.includes('rest') || msg.includes('graphql') || msg.includes('endpoint') || msg.includes('http') || msg.includes('request')) {
    return {
      answer: `An **API (Application Programming Interface)** allows different software components to communicate over the web:

1. **REST APIs**: Utilize standard HTTP methods (\`GET\`, \`POST\`, \`PUT\`, \`DELETE\`) to manage resources represented as JSON documents.
2. **GraphQL**: A query language that lets clients request precisely the data they need, reducing over-fetching and consolidating multiple requests into a single round-trip.
3. **JSON Standards**: Request and response payloads are structured in JSON format, containing success flags, messages, and target data.`,
      learningResources: [
        'RESTful API Designing Guidelines',
        'GraphQL Specification & Official Guides'
      ],
      projects: [
        'Design custom endpoints for the mock interview submission flow',
        'Write error middleware to capture and log invalid API requests'
      ],
      courses: [
        'Designing Scalable APIs (Udemy)',
        'GraphQL API Architecture (Frontend Masters)'
      ]
    };
  }

  // 7. React / state check
  if (msg.includes('react') || msg.includes('angular') || msg.includes('vue') || msg.includes('component') || msg.includes('hook') || msg.includes('jsx') || msg.includes('state')) {
    return {
      answer: `**React** and frontend frameworks allow developers to build interactive user interfaces using reusable components:

1. **Component-Based Architecture**: Divide UI layouts into isolated, modular blocks that manage their own state and render elements based on properties (\`props\`).
2. **State Management**: Utilize hooks like \`useState\`, \`useEffect\`, or global contexts (\`useContext\`) to sync visual layouts dynamically with user actions.
3. **Virtual DOM**: Sync adjustments in memory first before executing painting commands on the browser DOM, boosting layout updates performance.`,
      learningResources: [
        'React Official Documentation & Guides',
        'Beta React Docs - Interactive Tutorials'
      ],
      projects: [
        'Create modular dashboard cards for the Career Score audit',
        'Manage auth states in a React Context Provider'
      ],
      courses: [
        'Complete React Developer Bootcamp (Scrimba)',
        'Advanced React State Patterns (Frontend Masters)'
      ]
    };
  }

  // 8. Resume / CV check
  if (msg.includes('resume') || msg.includes('ats') || msg.includes('cv')) {
    return {
      answer: `To optimize your **Resume for ATS parsing** and recruiter visibility, follow these key guidelines:

1. **Include Key Tech Competencies**: Make sure programming languages and tools match your target roles exactly.
2. **Quantify Achievements**: Use metrics (e.g., *"improved loading speed by 25%"* or *"reduced backend latency by 15%"*) rather than listing simple tasks.
3. **Format Clearly**: Use simple layouts, clear section dividers (Experience, Projects, Education), and avoid complex tables or image assets that cause parser failures.`,
      learningResources: [
        'Resume Worded - Professional ATS Reviewer',
        'Google Tech Resume Formatting Guidelines'
      ],
      projects: [
        'Re-format your resume PDF using simple single-column templates',
        'Incorporate active action verbs (e.g. Optimized, Developed, Led)'
      ],
      courses: [
        'Writing Professional Technical Resumes (Coursera)',
        'ATS Optimization Checklist & Verification Guide'
      ]
    };
  }

  // 9. Interview prep check
  if (msg.includes('interview') || msg.includes('mock') || msg.includes('question')) {
    return {
      answer: `To clear **technical and behavioral interview rounds**, structured preparation is key:

1. **Use the STAR Method**: For behavioral queries, structure answers as **S**ituation, **T**ask, **A**ction, **R**esult to highlight measurable outcomes.
2. **Review Core Concepts**: Focus on event loops, database indexing, system scaling, and cryptography concepts.
3. **Practice Out Loud**: Participate in mock interview terminal rounds, record responses, and review graded feedback logs.`,
      learningResources: [
        'Pragmatic Behavioral Interview Guide (STAR method)',
        'Tech Interview Handbook by Yangshun Tay'
      ],
      projects: [
        'Practice descriptive answers inside the AI Interview Terminal',
        'Attempt a mock MCQ session on Frontend/Backend pools'
      ],
      courses: [
        'Mastering the Technical Interview (Udemy)',
        'Behavioral Interview Strategies (LinkedIn Learning)'
      ]
    };
  }

  // 10. DSA check
  if (msg.includes('dsa') || msg.includes('code') || msg.includes('coding') || msg.includes('algorithm') || msg.includes('array') || msg.includes('tree') || msg.includes('list')) {
    return {
      answer: `To master **Data Structures and Algorithms (DSA)** for coding rounds, structure your practice:

1. **Understand Key Patterns**: Focus on common patterns like Sliding Window, Two Pointers, DFS/BFS graph traversals, and Memoization.
2. **Practice Daily**: Resolve problems on platforms like LeetCode or our local Coding Sandbox.
3. **Analyze Complexity**: Analyze both time and space complexity (Big O) for every problem you solve.`,
      learningResources: [
        'LeetCode Top Interview 150 List',
        'GeeksforGeeks Data Structures Catalog'
      ],
      projects: [
        'Solve the Two Sum and Valid Palindrome Sandbox Challenges',
        'Build a visualizer for Sorting Algorithms using React'
      ],
      courses: [
        'CS50: Introduction to Computer Science (Harvard)',
        'JavaScript Algorithms and Data Structures (FreeCodeCamp)'
      ]
    };
  }

  // 11. Roadmap check
  if (msg.includes('roadmap') || msg.includes('career') || msg.includes('role')) {
    return {
      answer: `Selecting a clear **career path** helps streamline your learning resources:

1. **Define Target Roles**: Pick a track (e.g. Frontend Engineer, Backend Dev, Cloud DevOps) rather than trying to learn everything at once.
2. **Structure Timeline**: Break down learning into week-by-week phases starting with core foundations, moving to projects, and finishing with scaling/testing.
3. **Track Milestones**: Follow custom roadmaps and check off goals systematically.`,
      learningResources: [
        'Roadmap.sh - Interactive Developer Timelines',
        'Developer Roadmap Directory on GitHub'
      ],
      projects: [
        'Generate a customized week-by-week learning roadmap',
        'Map your current skills vs target missing competencies'
      ],
      courses: [
        'Software Engineering Career Guide (Coursera)',
        'Web Developer Bootcamp (Colt Steele)'
      ]
    };
  }

  // 12. Dynamic General Tech Query Fallback (AI Tech Simulator)
  const cleanTopic = userMessage.replace(/(what is|how to|why|explain|tell me about|definition of|\?|\.|\,|\!)/gi, '').trim() || 'Software Development';
  const cleanTopicTitle = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
  
  let conceptExplanation = `**${cleanTopicTitle}** is a core technical concept, programming tool, or design methodology in modern software engineering. It is used to solve architectural challenges, implement runtime logics, or build interactive user experiences.`;
  
  if (msg.includes('how to') || msg.includes('how do i') || msg.includes('how can i')) {
    conceptExplanation = `To implement or use **${cleanTopicTitle}**, developers typically install the corresponding packaging dependencies, configure the execution environment, and write modular functions. It represents a practical coding setup in software systems.`;
  } else if (msg.includes('why') || msg.includes('reason')) {
    conceptExplanation = `Understanding the purpose of **${cleanTopicTitle}** allows technical architects to make informed engineering trade-offs regarding computational performance, network latency, resource scalability, or data security.`;
  }

  return {
    answer: `Regarding your query about **"${cleanTopicTitle}"** in software development:

1. **Core Definition**: ${conceptExplanation}
2. **Development Best Practices**:
   - Write clean, modular, and self-documenting code structures.
   - Profile performance indicators (such as memory foot-prints or server API lookups) to prevent latency bottlenecks.
   - Formulate automated unit and integration tests to verify code stability across edge cases.
3. **Implementation Plan**: Try integrating this concept inside a small sandbox project or practice mock descriptive questions inside the Interview Terminal.`,
    learningResources: [
      'Stack Overflow - Developer Community Q&A Forums',
      'Dev.to - Engineering Articles & Coding Tutorials'
    ],
    projects: [
      'Implement a code proof-of-concept testing this conceptual model',
      'Document your findings and API structures in a GitHub readme guide'
    ],
    courses: [
      'FreeCodeCamp Comprehensive Software Engineering Path',
      'Harvard CS50: Computer Science Foundations'
    ]
  };
}

function getMockPortfolioReview(portfolioUrl) {
  const score = Math.max(50, Math.min(95, 60 + ((portfolioUrl || '').length % 35)));
  return {
    portfolioUrl: portfolioUrl,
    score: score,
    readmeAdvice: [
      'Add a clean sub-title explaining what stack you work with.',
      'Include links to live demos of your top 3 projects.',
      'Include a professional header banner displaying target job roles.'
    ],
    projectAdvice: [
      'List tech stacks explicitly under each project card.',
      'Link your GitHub repositories with clean commit histories.',
      'Describe measurable performance outcomes (e.g., "reduced latency by 30%").'
    ],
    uiAdvice: [
      'Ensure contrast ratios are accessible (use HSL tailored themes).',
      'Add micro-animations to increase engagement.',
      'Implement smooth transition animations between pages.'
    ],
    seoAdvice: [
      'Add a description meta tag highlighting your core tech skills.',
      'Add unique titles to each page.',
      'Verify OpenGraph (OG) image properties exist to optimize social share displays.'
    ]
  };
}

/**
 * 9. Generate Coding Challenge
 */
exports.generateCodingChallenge = async (difficulty, topic) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Coding Challenge.');
    return getMockCodingChallenge(difficulty, topic);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      Generate a coding interview question.
      Difficulty level: "${difficulty}" (Easy, Medium, Hard).
      Topic: "${topic}" (e.g. Arrays, Strings, Trees, Linked List, Recursion).

      Return a JSON object matching this schema:
      {
        "title": string,
        "difficulty": "${difficulty}",
        "topic": "${topic}",
        "problemStatement": string (detailed description of the problem, input/output structures),
        "examples": [
          {
            "input": string,
            "output": string,
            "explanation": string
          }
        ],
        "constraints": [string],
        "starterCode": {
          "javascript": string,
          "python": string,
          "cpp": string
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Coding Challenge error:', error);
    return getMockCodingChallenge(difficulty, topic);
  }
};

/**
 * 10. Evaluate Coding Submission
 */
exports.evaluateCodeSubmission = async (problemTitle, problemStatement, userCode, language) => {
  if (!genAI) {
    console.warn('⚠️ Gemini Key not found. Loading Mock Code Evaluation.');
    return getMockCodeEvaluation();
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
      You are an expert technical interviewer. Evaluate the candidate's code submission.
      Problem Title: "${problemTitle}"
      Problem Statement: "${problemStatement}"
      User's Code Submission:
      \`\`\`${language}
      ${userCode}
      \`\`\`

      Analyze if the logic is correct, dry-run edge cases, calculate time/space complexity, and output detailed feedback.
      Return a JSON object matching this schema:
      {
        "isCorrect": boolean,
        "score": number (0-100),
        "timeComplexity": string (e.g. "O(N)"),
        "spaceComplexity": string (e.g. "O(1)"),
        "feedback": string (supportive guidance, bugs, style checks),
        "optimalSolution": string (a clean code snippet showing the best way to solve this in the submitted language)
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return parseAIResponse(response.text());
  } catch (error) {
    console.error('Gemini Code Evaluation error:', error);
    return getMockCodeEvaluation();
  }
};

function getMockCodingChallenge(difficulty, topic) {
  const normTopic = (topic || '').toLowerCase();
  
  if (normTopic.includes('string')) {
    return {
      title: `Valid Palindrome (${difficulty})`,
      difficulty: difficulty,
      topic: topic,
      problemStatement: `Given a string s, return true if it is a palindrome, or false otherwise.\n\nA palindrome is a string that reads the same backward as forward after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters.`,
      examples: [
        {
          input: 's = "A man, a plan, a canal: Panama"',
          output: 'true',
          explanation: '"amanaplanacanalpanama" is a palindrome.'
        }
      ],
      constraints: [
        '1 <= s.length <= 2 * 10^5',
        's consists only of printable ASCII characters.'
      ],
      starterCode: {
        javascript: `function isPalindrome(s) {\n    // Write your code here\n    return false;\n}`,
        python: `class Solution:\n    def isPalindrome(self, s: str) -> bool:\n        # Write your code here\n        return False`,
        cpp: `class Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n        return false;\n    }\n};`
      }
    };
  } else if (normTopic.includes('array') || normTopic.includes('hashmap') || normTopic.includes('map')) {
    return {
      title: `Two Sum (${difficulty})`,
      difficulty: difficulty,
      topic: topic,
      problemStatement: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
        }
      ],
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9'
      ],
      starterCode: {
        javascript: `function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}`,
        python: `class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Write your code here\n        return []`,
        cpp: `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        return {};\n    }\n};`
      }
    };
  } else if (normTopic.includes('tree') || normTopic.includes('graph')) {
    return {
      title: `Maximum Depth of Binary Tree (${difficulty})`,
      difficulty: difficulty,
      topic: topic,
      problemStatement: `Given the root of a binary tree, return its maximum depth.\n\nA binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
      examples: [
        {
          input: 'root = [3,9,20,null,null,15,7]',
          output: '3',
          explanation: 'The longest path is root -> 20 -> 7 (depth of 3).'
        }
      ],
      constraints: [
        'The number of nodes in the tree is in the range [0, 10^4].',
        '-100 <= Node.val <= 100'
      ],
      starterCode: {
        javascript: `function maxDepth(root) {\n    // Write your code here\n    return 0;\n}`,
        python: `class Solution:\n    def maxDepth(self, root: Optional[TreeNode]) -> int:\n        # Write your code here\n        return 0`,
        cpp: `class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Write your code here\n        return 0;\n    }\n};`
      }
    };
  } else if (normTopic.includes('recursion') || normTopic.includes('dp') || normTopic.includes('dynamic')) {
    return {
      title: `Climbing Stairs (${difficulty})`,
      difficulty: difficulty,
      topic: topic,
      problemStatement: `You are climbing a staircase. It takes n steps to reach the top.\n\nEach time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
      examples: [
        {
          input: 'n = 3',
          output: '3',
          explanation: 'There are three ways: 1+1+1, 1+2, 2+1.'
        }
      ],
      constraints: [
        '1 <= n <= 45'
      ],
      starterCode: {
        javascript: `function climbStairs(n) {\n    // Write your code here\n    return 0;\n}`,
        python: `class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your code here\n        return 0`,
        cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n};`
      }
    };
  } else {
    return {
      title: `Reverse Linked List (${difficulty})`,
      difficulty: difficulty,
      topic: topic,
      problemStatement: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
      examples: [
        {
          input: 'head = [1,2,3,4,5]',
          output: '[5,4,3,2,1]',
          explanation: 'Reversing the sequence of nodes yields the backward array.'
        }
      ],
      constraints: [
        'The number of nodes in the list is in the range [0, 5000].',
        '-5000 <= Node.val <= 5000'
      ],
      starterCode: {
        javascript: `/*\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\nfunction reverseList(head) {\n    // Write your code here\n    return null;\n}`,
        python: `# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        # Write your code here\n        return None`,
        cpp: `/**\n * Definition for singly-linked list.\n * struct ListNode {\n *     int val;\n *     ListNode *next;\n *     ListNode() : val(0), next(nullptr) {}\n *     ListNode(int x) : val(x), next(nullptr) {}\n *     ListNode(int x, ListNode *next) : val(x), next(next) {}\n * };\n */\nclass Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n        return nullptr;\n    }\n};`
      }
    };
  }
}

function getMockCodeEvaluation() {
  return {
    isCorrect: true,
    score: 90,
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
    feedback: `Great job! Your implementation is highly optimal and successfully uses the two-pointer tracking approach. It avoids auxiliary allocations, making the space complexity O(1). Time complexity is O(N) since you traverse the list exactly once. Coding standards are followed correctly.`,
    optimalSolution: `function reverseList(head) {
    let prev = null;
    let curr = head;
    while (curr !== null) {
        let nextTemp = curr.next;
        curr.next = prev;
        prev = curr;
        curr = nextTemp;
    }
    return prev;
}`
  };
}
