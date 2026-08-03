# CareerPilot AI - Fullstack Platform

CareerPilot AI is an AI-powered career counseling platform that evaluates resumes for ATS optimization, identifies skill gaps, designs weekly learning roadmaps, and conducts interactive mock interviews with grading scorecards.

---

## 📂 Repository Architecture

```text
careerPilot-AI/
├── client/                 # React Frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable layout and routing elements
│   │   ├── context/        # Auth states and backend API hooks
│   │   ├── pages/          # Screens: ATS Scans, Roadmaps, Terminal, Stats
│   │   ├── index.css       # Design tokens (dark HSL theme)
│   │   └── App.jsx         # Routes map
│   └── package.json
└── server/                 # Express Backend (NodeJS)
    ├── src/
    │   ├── config/         # MongoDB and Cloudinary initializations
    │   ├── controllers/    # API business logic
    │   ├── middleware/     # Multer file uploading & JWT checks
    │   ├── models/         # Mongoose Schemas (User, Resume, Interview, etc.)
    │   ├── routes/         # Express endpoint maps
    │   ├── services/       # Gemini AI prompting service
    │   ├── utils/          # Nodemailer and JWT token helpers
    │   └── server.js       # App entry listener
    ├── .env.example
    └── package.json
```

---

## ⚡ Quick Start (Developer Setup)

### Prerequisites
- Make sure [Node.js](https://nodejs.org) is installed on your local computer.
- MongoDB running locally (defaulting to `mongodb://localhost:27017/careerpilot`) or a MongoDB Atlas URI string.

---

### Step 1: Backend Setup
1. Open a terminal in the `server/` directory.
2. Install node dependencies:
   ```bash
   npm install
   ```
3. Update environment credentials in `server/.env` (Gemini, Cloudinary, Nodemailer, etc.).
4. Run the backend developer server:
   ```bash
   npm run dev
   ```
   *The server starts on: **http://localhost:5000***

> [!TIP]
> **No API Keys? No Problem!**
> If you start the server without setting up a `GEMINI_API_KEY`, `CLOUDINARY_CLOUD_NAME`, or SMTP email passwords, CareerPilot AI will automatically load high-quality mock data engines and console-logging simulated emails, allowing you to test all frontend features offline immediately.

---

### Step 2: Frontend Setup
1. Open a new terminal in the `client/` directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The client dashboard launches at: **http://localhost:5173***

---

## 🔧 Core Modules & Testing Guides

### 1. User Authentication & Profile
- Sign up with an email address.
- Open your **backend server console terminal** to copy the simulated validation link printed inside the logs (e.g. `http://localhost:5173/verify-email/<token>`).
- Paste that URL in your browser to verify the account, then sign in.
- Configure your targets and skills in the **Profile Setting** tab.

### 2. ATS Resume Scanner
- Go to the **Resume Analyzer** tab.
- Drag-and-drop or select any test PDF resume.
- Click **Scan Resume** to view real-time score breakdowns, green keyword tags, and red critical formatting recommendations.

### 3. Customized Timeline Roadmap
- Go to the **Learning Roadmap** tab.
- Fill in a career role (e.g. *Fullstack Web Developer*) and press **Generate Roadmap**.
- View your week-by-week visual trail containing objects, articles, video tutorials, and milestone projects.

### 4. Interactive Interview Console
- Open the **Mock Interview** tab.
- Set up a session role and press **Initiate Session**.
- Submit replies for each question in the console.
- Review immediate evaluation ratings (out of 10), constructive advice, and reference guides. Complete the session to view your average score.

### 5. Leaderboards & Streaks
- Visit the **Dashboard** to see active streaks and progress charts.
- Check off missions in the **Daily Missions** task checklist.
- Unlocked badges are showcase-mounted in your **Progress & Badges** cabinet!

---

## 🛡️ Admin Roles Setup
To test the admin features:
1. Register a standard account.
2. Open your MongoDB GUI tool (e.g. *Compass* or shell) and check the `users` collection.
3. Change your user document's `role` value from `"user"` to `"admin"`.
4. The dashboard sidebar will dynamically unlock the **Admin Control** tab, displaying registered platform accounts and average ATS scores!
