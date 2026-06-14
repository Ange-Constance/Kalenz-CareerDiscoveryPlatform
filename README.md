# Kalenz-CareerDiscoveryPlatform

## Quick Links

| Resource | Link |
|----------|------|
| **GitHub Repository** | [github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform](https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform) |
| **Figma Designs** | [KareerLenz Figma Mockups](https://www.figma.com/design/5zh8BMM8EJrjMFZkrFb6m9/KareerLenz?node-id=0-1&p=f&t=vdmkUyDzJdDBzmJh-0) |
| **Demo Video** | [Project Demo](https://www.bugufi.link/XXDSBd) |

---

## Description

**KarrerLenz** (Kalenz) is a final-year capstone project at ALU — an AI-powered career discovery platform for Rwandan tech graduates. It reads evidence from CVs and other inputs, predicts career matches across five tech paths, and delivers personalized roadmaps and an AI career assistant.

**Goal:** Help tech graduates discover their real career path based on evidence (GitHub, certificates, CVs) and provide concrete, personalized roadmaps.

---

## Repository

**GitHub:** [https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform](https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform)

```bash
git clone https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform.git
cd Kalenz-CareerDiscoveryPlatform
```

---

## How to Set Up the Environment and the Project

### Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- **PostgreSQL** 15+ (or Docker)
- Optional: **Ollama** (local LLM for chat) and **GROQ_API_KEY** (cloud fallback)

### Architecture

| Service | Stack | Port |
|---------|-------|------|
| Frontend | React + Vite + Tailwind | 5173 |
| Backend | Node.js + Express + PostgreSQL | 3000 |
| ML Service | Python Flask + scikit-learn | 5000 |
| Database | PostgreSQL | 5432 |

### Option A — Automated setup (recommended)

```bash
./scripts/setup.sh
```

Then start each service in a separate terminal:

```bash
# Terminal 1 — ML service
cd ml-service && source .venv/bin/activate && python app.py

# Terminal 2 — Backend
cd backend && npm run dev

# Terminal 3 — Frontend
cd frontend && npm run dev
```

Open **http://localhost:5173**

### Option B — Docker Compose

```bash
cp .env.example .env   # edit secrets as needed
docker compose up --build
```

### Environment variables

Copy the example env files and adjust as needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Key variables: `DATABASE_URL`, `JWT_SECRET`, `ML_SERVICE_URL`, `VITE_API_URL`, `GROQ_API_KEY` (optional).

### User flow

Sign up → Upload CV (`.pdf` / `.docx`) → View results → Explore roadmap → Chat with career assistant

---

## Designs

| Asset | Link |
|-------|------|
| **Figma mockups** | [KareerLenz on Figma](https://www.figma.com/design/5zh8BMM8EJrjMFZkrFb6m9/KareerLenz?node-id=0-1&p=f&t=vdmkUyDzJdDBzmJh-0) |
| **Demo video** | [Project walkthrough](https://www.bugufi.link/XXDSBd) |
| **App screenshots** | See demo video and Figma mockups; add screenshots to `docs/screenshots/` as the UI evolves |
| **System architecture** | See [Product Architecture](#2-product-architecture) below |

---

## Deployment Plan

| Component | Target | Notes |
|-----------|--------|-------|
| **Frontend** | Vercel / Netlify | Static React build; set `VITE_API_URL` to production API |
| **Backend API** | Railway / Render | Node.js + PostgreSQL; expose port 3000 |
| **ML Service** | Railway / Render / Docker | Flask app on port 5000; bundle trained model (`ml-service/models/`) |
| **Database** | Supabase / Railway PostgreSQL | Run `backend/src/db/migrate.js` on deploy |
| **Full stack (dev/staging)** | Docker Compose | `docker compose up` — Postgres, ML, backend, frontend |

**Production checklist**

1. Set strong `JWT_SECRET` and production `DATABASE_URL`
2. Configure `ML_SERVICE_URL` and `FRONTEND_URL` on the backend
3. Set `VITE_API_URL` on the frontend build to the deployed API URL
4. Optional: `GROQ_API_KEY` for chat when Ollama is unavailable
5. Run database migrations before first deploy

---

# KarrerLenz - Complete Product Development Prompt

## PROJECT OVERVIEW

You are building **KarrerLenz**, an AI-powered career discovery platform for Rwandan tech graduates. This is a full-stack web application with ML components, real-time chat assistance, and a comprehensive dashboard.

**Goal:** Build a working MVP that helps tech graduates discover their real career path based on evidence (GitHub, certificates, CVs) and provides personalized roadmaps.

---

## 1. PROBLEM STATEMENT

**Problem:**

- Rwanda's tech sector grows 15% annually, but 30% of employers report skills shortages
- Youth unemployment (15.4%) vs. adults (12.1%) - NISR 2025
- 57.2% labor underutilization among graduates
- Graduates make career decisions based on assumptions, not evidence
- No evidence-based career guidance tools exist for Rwanda

**Solution:**
KarrerLenz reads what graduates have actually built (GitHub, certificates, CVs) to extract genuine competency signals, generates personalized career narratives, and provides concrete gap-to-bridge roadmaps.

---

## 2. PRODUCT ARCHITECTURE

### 2.1 FRONTEND (Web Application)

**Tech Stack:**

- React.js (functional components, hooks)
- Tailwind CSS + custom CSS
- React Router for navigation
- Axios for API calls
- Local state management (useState, useContext)

**Pages/Sections:**

#### A. **Homepage** (`/`)

- Hero section with value proposition
- Features showcase (3 key benefits)
- About section explaining the problem
- Call-to-action buttons
- Footer with links
- Responsive design (mobile-first)

#### B. **Authentication** (`/login`, `/signup`)

- Email/password authentication
- Google OAuth option
- Form validation
- Error handling
- Redirect to dashboard on success

#### C. **Main Dashboard** (`/dashboard`)

- **Layout:** Left side dashboard + right side chat
- **Split-screen design:**
  - Left (70%): Interactive results dashboard
  - Right (30%): AI chat assistant

#### D. **Step 1: Upload Evidence** (`/dashboard/upload`)

- 3 upload cards: GitHub (OAuth), Certificate (PDF), CV (text/PDF)
- Upload progress visualization
- File parsing feedback
- Error handling for invalid files
- Visual confirmation of successful uploads

#### E. **Step 2: Talent Profile** (`/dashboard/profile`)

- AI-generated narrative (from Ollama)
- 6 competency cards with:
  - Skill name
  - Percentage score (0-100%)
  - Progress bar visualization
  - Source of signal (GitHub/cert/CV)
- Animated reveal on page load
- Scroll-triggered animations

#### F. **Step 3: Career Matches** (`/dashboard/careers`)

- 5 career cards ranked by probability
- For each career:
  - Career name
  - Match percentage (45%, 35%, 12%, 5%, 3%)
  - Description
  - Progress bar
  - Tags (remote-friendly, high-growth, etc.)
- Top match highlighted with special styling
- Click to select a career (triggers chat)

#### G. **Step 4: Roadmap** (`/dashboard/roadmap`)

- Progress overview: Current fit, Target fit, Timeline, Gap
- Progress bar showing 40% completion
- 4 timeline items (weeks 1-2, 3-4, 5-6, 7-8):
  - Week label
  - Action title
  - Description
  - Impact percentage
  - Clickable for details
- Opportunities section:
  - 3-5 real programs (Google UX cert, Andela, kLab)
  - Descriptions and links
  - Call-to-action buttons
- Download roadmap as PDF button

#### H. **Chat Sidebar** (Right side, `/dashboard`)

- Header: "🤖 Career Assistant"
- Message area (scrollable)
  - User messages: right-aligned, purple gradient
  - Assistant messages: left-aligned, light gray
  - Smooth message animations
- Input field: "Ask anything..."
- Send button with icon (↑)
- Auto-scroll to latest message
- Toast notifications for actions

#### I. **Settings** (`/dashboard/settings`)

- Profile information
- Connected accounts (GitHub, etc.)
- Preferences (theme, language)
- Data management (download/delete)
- Account deletion option

---

### 2.2 BACKEND (Node.js + Express)

**Tech Stack:**

- Node.js runtime
- Express.js framework
- PostgreSQL (Supabase) for database
- Passport.js for authentication
- Multer for file uploads
- nodemon for development
- Docker for deployment

**API Endpoints:**

#### Authentication

```
POST /api/auth/register
  - Body: { email, password }
  - Returns: { token, user }

POST /api/auth/login
  - Body: { email, password }
  - Returns: { token, user }

POST /api/auth/github-callback
  - Body: { code }
  - Returns: { token, user, githubProfile }

POST /api/auth/logout
  - Returns: { success: true }
```

#### Evidence Ingestion

```
POST /api/evidence/github
  - Headers: { Authorization: Bearer token }
  - Body: { githubUsername }
  - Action: Call GitHub API, extract repos, analyze
  - Returns: { repos, languages, signals }

POST /api/evidence/certificate
  - Headers: { Authorization: Bearer token }
  - Body: FormData { file }
  - Action: Parse PDF, extract text
  - Returns: { extracted_text, skills }

POST /api/evidence/cv
  - Headers: { Authorization: Bearer token }
  - Body: FormData { file } or { text }
  - Action: Parse CV, extract experience
  - Returns: { extracted_text, experience }

GET /api/evidence/:userId
  - Headers: { Authorization: Bearer token }
  - Returns: { github_data, certificate_data, cv_data }
```

#### Analysis

```
POST /api/analysis/run
  - Headers: { Authorization: Bearer token }
  - Body: {}
  - Action: Call ML pipeline for inference
  - Returns: {
      competencies: { skill: score },
      narrative: "AI-generated text",
      career_matches: [{ career, probability, description }],
      created_at: timestamp
    }

GET /api/analysis/:analysisId
  - Headers: { Authorization: Bearer token }
  - Returns: Full analysis result with all data

GET /api/analysis/history
  - Headers: { Authorization: Bearer token }
  - Returns: List of all user's analyses
```

#### Roadmap

```
GET /api/roadmap/:careerName
  - Headers: { Authorization: Bearer token }
  - Returns: {
      current_fit: 45,
      target_fit: 85,
      timeline: [
        { week: "1-2", title, description, impact },
        { week: "3-4", title, description, impact },
        ...
      ],
      opportunities: [
        { name, description, link, deadline }
      ]
    }

POST /api/roadmap/download
  - Headers: { Authorization: Bearer token }
  - Body: { careerName }
  - Returns: PDF file binary
```

#### Chat

```
POST /api/chat/message
  - Headers: { Authorization: Bearer token }
  - Body: { message, context: { analysisId, step } }
  - Action: Send to Ollama, get response
  - Returns: { response, timestamp }

GET /api/chat/history
  - Headers: { Authorization: Bearer token }
  - Returns: List of chat messages
```

**Middleware:**

- JWT authentication on protected routes
- Error handling (try-catch, validation)
- CORS configuration
- Rate limiting for chat/API
- Request logging

---

### 2.3 MACHINE LEARNING PIPELINE

**Tech Stack:**

- Python 3.9+
- scikit-learn (TF-IDF, Logistic Regression)
- pandas for data handling
- joblib for model serialization
- Ollama for local LLM
- Flask for Python microservice

**ML Components:**

#### A. Data Preparation

**Training Dataset:**

- 50 real CVs (10 per career) - labeled
- 15 O\*NET synthetic vectors (3 per career) - reference profiles
- 95 Kaggle job postings (15-20 per career)
- Total: 160 training samples

**Data Sources:**

```
1. Your 50 CVs
   ├─ 10 UX Researchers
   ├─ 10 Health Data professionals
   ├─ 10 Policy Analysts
   ├─ 10 Backend Developers
   └─ 10 DevOps Engineers

2. O*NET Database (onet.org)
   └─ Competency profiles for each career

3. Kaggle Datasets
   └─ Job postings for skill validation
```

#### B. Feature Engineering

**TF-IDF Vectorizer:**

```python
- Input: User's combined text (GitHub READMEs + CV + cert)
- Output: 20-dimensional vector
- Keywords per dimension:
  • Systems Thinking: architecture, scalability, design patterns
  • Communication: documented, explained, clear, README
  • Empathy for Users: user, stakeholder, feedback, designed
  • Data Analysis: data, analysis, SQL, insight
  • Analytical Depth: detailed, comprehensive, thorough
  • Collaboration: team, collaborated, contributed
  • (14 more dimensions)
- Preprocessing: lowercase, stopword removal, tokenization
- Normalization: Scale to [0, 1]
```

#### C. ML Model

**Logistic Regression Classifier:**

```python
- Model: sklearn.linear_model.LogisticRegression
- Input: 20-dimensional TF-IDF vector
- Output: Probability distribution across 5 careers
- Multi-class: multinomial
- Max iterations: 1000
- Random state: 42 (for reproducibility)

Training:
- Input shape: (160, 20)
- Output shape: (160,) - career labels (0-4)
- Train/test split: 80/20 stratified

Expected Performance:
- Accuracy: 82-86%
- Per-class precision: 78-85%
- Per-class recall: 78-85%
- F1-score: 0.80+
```

**Serialization:**

```python
# Save trained models
import joblib

joblib.dump(tfidf_vectorizer, 'models/tfidf_vectorizer.pkl')
joblib.dump(scaler, 'models/scaler.pkl')
joblib.dump(logistic_model, 'models/logistic_regression.pkl')

# Load at runtime
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')
scaler = joblib.load('models/scaler.pkl')
model = joblib.load('models/logistic_regression.pkl')
```

#### D. Inference Pipeline

```python
def analyze_user_evidence(github_text, cv_text, cert_text):
    # 1. Combine all text
    combined_text = github_text + " " + cv_text + " " + cert_text

    # 2. TF-IDF vectorize
    vector = vectorizer.transform([combined_text])

    # 3. Scale
    vector_scaled = scaler.transform(vector)

    # 4. Get probabilities
    probabilities = model.predict_proba(vector_scaled)[0]

    # 5. Rank careers
    career_names = ["UX Research", "Health Data", "Policy", "Backend", "DevOps"]
    results = list(zip(career_names, probabilities))
    results.sort(key=lambda x: x[1], reverse=True)

    # 6. Return ranked list
    return {
        "careers": [
            {"name": name, "probability": float(prob)}
            for name, prob in results
        ]
    }
```

#### E. Narrative Generation (Ollama)

```python
def generate_narrative(top_career, competencies):
    prompt = f"""
    A person has these competencies:
    - Systems thinking: {competencies['systems']:.0%}
    - Communication: {competencies['communication']:.0%}
    - Empathy: {competencies['empathy']:.0%}

    Their best-fit career is {top_career}.

    Write a 2-3 sentence narrative explaining why this is a good fit.
    Be specific about how their competencies match this career.
    """

    response = requests.post(
        'http://localhost:11434/api/generate',
        json={
            'model': 'llama2',  # or mistral
            'prompt': prompt,
            'stream': False
        }
    )

    return response.json()['response']
```

#### F. Model Training Notebook

**Jupyter Notebook structure:**

```
1. Data Loading
   - Load your 50 CVs
   - Load O*NET reference data
   - Load Kaggle job postings

2. Data Preprocessing
   - Extract text from PDFs
   - Clean and tokenize
   - Remove duplicates

3. Feature Engineering
   - Initialize TF-IDF vectorizer
   - Fit on training data
   - Transform all samples

4. Model Training
   - Initialize logistic regression
   - Train on 80% of data
   - Evaluate on 20% test set

5. Performance Metrics
   - Accuracy: 0.82-0.86
   - Precision per class
   - Recall per class
   - F1-score per class
   - Confusion matrix visualization

6. Model Serialization
   - Save vectorizer
   - Save scaler
   - Save trained model
   - Test loading and inference

7. Visualizations
   - Feature importance
   - Confusion matrix
   - Class distribution
   - ROC curves
```

---

### 2.4 DATABASE (PostgreSQL)

**Schema:**

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    github_id VARCHAR(255) UNIQUE,
    github_username VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    location VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evidence table
CREATE TABLE evidence (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50), -- 'github', 'certificate', 'cv'
    content_type VARCHAR(50), -- 'pdf', 'text', 'json'
    raw_text TEXT,
    extracted_data JSONB,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analysis table
CREATE TABLE analyses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    competencies JSONB, -- { skill: score }
    narrative TEXT,
    top_career VARCHAR(100),
    career_matches JSONB, -- [{ career, probability }]
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat table
CREATE TABLE chat_messages (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    analysis_id INT REFERENCES analyses(id) ON DELETE CASCADE,
    role VARCHAR(20), -- 'user' or 'assistant'
    content TEXT,
    context_step VARCHAR(50), -- 'upload', 'profile', 'careers', 'roadmap'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_evidence_user_id ON evidence(user_id);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_chat_user_id ON chat_messages(user_id);
```

---

### 2.5 DEPLOYMENT OPTIONS

#### A. Web Interface (Already Built)

- React app deployed on Vercel
- Domain: karrerLenz.io (or equivalent)
- Environment: production, staging, development

**Files Provided:**

- `karrerLenz_dashboard_with_chat.html` - Main interface
- Responsive design (mobile, tablet, desktop)

#### B. REST API (Swagger UI)

**Deployment:**

- Node.js backend on Railway/Render
- Swagger documentation at `/api/docs`

**Swagger Configuration:**

```javascript
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "KarrerLenz API",
      version: "1.0.0",
      description: "Career discovery platform API",
    },
    servers: [
      { url: "http://localhost:5000/api", description: "Development" },
      { url: "https://api.karrerLenz.io/api", description: "Production" },
    ],
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs));
```

#### C. Mobile App Interface (Mockup)

**Design Mockup Specifications:**

**React Native / Flutter Implementation:**

```
Mobile Layout:
├─ Top: Header with logo + menu
├─ Main: Dashboard (full-width, vertical scrolling)
│  ├─ Progress tracker (horizontal scroll)
│  ├─ Current step content
│  └─ Action buttons
└─ Bottom: Chat (minimized or full-screen toggle)

Screen Sizes:
- Mobile: 375px - 667px
- Tablet: 768px - 1024px
- Desktop: 1200px+

Touch Interactions:
- Swipe to navigate steps
- Long-press for more options
- Double-tap to expand cards
- Pull-to-refresh for updates
```

**File Structure:**

```
mobile-app/
├─ screens/
│  ├─ LoginScreen.js
│  ├─ DashboardScreen.js
│  ├─ UploadScreen.js
│  ├─ ProfileScreen.js
│  ├─ CareersScreen.js
│  └─ RoadmapScreen.js
├─ components/
│  ├─ UploadCard.js
│  ├─ CompetencyBar.js
│  ├─ CareerCard.js
│  ├─ ChatBubble.js
│  └─ ProgressTracker.js
├─ services/
│  ├─ api.js
│  ├─ auth.js
│  └─ storage.js
└─ App.js
```

---

## 3. COMPLETE FEATURE CHECKLIST

### Frontend Features

- [ ] Homepage with problem/solution
- [ ] User authentication (email + Google OAuth)
- [ ] GitHub OAuth integration
- [ ] File upload (CV, certificate)
- [ ] Progress tracker (interactive steps)
- [ ] Talent profile display
- [ ] Competency visualization
- [ ] Career matches ranking
- [ ] Roadmap with timeline
- [ ] AI chat sidebar
- [ ] Download roadmap as PDF
- [ ] Responsive design
- [ ] Toast notifications
- [ ] Loading states
- [ ] Error handling
- [ ] Settings page

### Backend Features

- [ ] User authentication & JWT
- [ ] GitHub API integration
- [ ] File parsing (PDF, text)
- [ ] ML model inference endpoint
- [ ] Chat message handling
- [ ] Database queries
- [ ] Error handling
- [ ] Rate limiting
- [ ] Logging
- [ ] API documentation (Swagger)

### ML Features

- [ ] TF-IDF vectorizer training
- [ ] Logistic regression classifier
- [ ] Model serialization
- [ ] Inference pipeline
- [ ] Ollama integration
- [ ] Narrative generation
- [ ] Performance metrics
- [ ] Model notebook/documentation

### Data Management

- [ ] PostgreSQL schema
- [ ] Data validation
- [ ] Data privacy (deletion)
- [ ] Backup strategy
- [ ] Query optimization

---

## 4. TECHNICAL SPECIFICATIONS

### Performance Requirements

- Page load time: < 2 seconds
- Chat response time: < 1 second
- ML inference: < 2 seconds
- API response: < 500ms
- Support 100+ concurrent users

### Security

- HTTPS everywhere
- JWT token expiration: 24 hours
- Password hashing: bcrypt
- No permanent file storage
- CORS configuration
- Input validation on all endpoints
- SQL injection prevention

### Compatibility

- Browsers: Chrome, Firefox, Safari, Edge (latest 2 versions)
- Mobile: iOS 12+, Android 8+
- Screen sizes: 320px - 2560px

---

## 5. TIMELINE & DELIVERABLES

### Week 1: Setup & ML

- [ ] Initialize Node.js + React project
- [ ] Set up PostgreSQL database
- [ ] Create ML pipeline notebook
- [ ] Train and serialize models
- [ ] Deploy ML models to server

### Week 2: Backend Development

- [ ] Build authentication (JWT + OAuth)
- [ ] Create API endpoints
- [ ] Integrate ML inference
- [ ] Set up Ollama for chat
- [ ] Database schema & queries

### Week 3: Frontend Development

- [ ] Build all React components
- [ ] Implement dashboard steps
- [ ] Create chat interface
- [ ] Connect to backend APIs
- [ ] Add animations & polish

### Week 4: Integration & Testing

- [ ] End-to-end testing
- [ ] User testing (8-10 real users)
- [ ] Bug fixes & optimization
- [ ] Documentation
- [ ] Final deployment

---

## 6. DELIVERABLES CHECKLIST

**Code:**

- [ ] Frontend repository (React)
- [ ] Backend repository (Node.js)
- [ ] ML notebook (Jupyter)
- [ ] ML models (serialized .pkl files)
- [ ] Database migration scripts
- [ ] Docker configuration
- [ ] Environment configuration (.env.example)

**Documentation:**

- [ ] README.md
- [ ] API documentation (Swagger)
- [ ] ML model documentation
- [ ] Deployment guide
- [ ] User guide
- [ ] Architecture diagram
- [ ] Database schema diagram

**Testing:**

- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] User testing results
- [ ] Performance metrics

**Deployment:**

- [ ] Web app (Vercel)
- [ ] Backend (Railway/Render)
- [ ] Database (Supabase)
- [ ] ML models (Server)
- [ ] Swagger UI
- [ ] Mobile mockup

---

## 7. TECH STACK SUMMARY

| Component      | Technology                       |
| -------------- | -------------------------------- |
| Frontend       | React.js, Tailwind CSS, Axios    |
| Backend        | Node.js, Express.js, Passport.js |
| Database       | PostgreSQL (Supabase)            |
| ML             | scikit-learn, Python, Ollama     |
| Deployment     | Vercel, Railway, Docker          |
| API Docs       | Swagger/OpenAPI                  |
| Chat LLM       | Ollama (Llama 2 / Mistral)       |
| Authentication | JWT, GitHub OAuth                |

---

## 8. SUCCESS METRICS

**Product Success:**

- [ ] 8-10 users complete full analysis
- [ ] Average session duration: > 5 minutes
- [ ] 80%+ user satisfaction
- [ ] ML accuracy: 82%+ on test set
- [ ] Zero critical bugs in production

**Technical Success:**

- [ ] All endpoints tested and documented
- [ ] 90%+ code coverage
- [ ] Zero security vulnerabilities
- [ ] Sub-2-second page loads
- [ ] 99.9% API uptime

---

## IMPORTANT NOTES

1. **Data Privacy:** Never store uploaded files permanently. Extract signals and delete immediately.

2. **ML Model Accuracy:** Target 82-86% accuracy is realistic with 160 training samples. Better accuracy requires more training data.

3. **Chat Context:** Ollama should be local or self-hosted to maintain user privacy. Don't use cloud LLM APIs.

4. **Rwanda Focus:** Include local organizations in opportunities:
   - Google UX Certificate (free, online)
   - Andela (remote, competitive)
   - kLab Kigali (in-person, local)
   - Ministry programs (if available)

5. **Iterative Development:** Start with MVP (upload → profile → careers). Add chat and refinements in subsequent iterations.

---

## HOW TO USE THIS PROMPT

Give this entire document to:

- An AI coding agent (Claude, GPT-4, etc.)
- A development team
- A full-stack developer
- An engineering manager

The agent will have all context needed to build the complete product without asking for clarification.

---

**End of Prompt**
