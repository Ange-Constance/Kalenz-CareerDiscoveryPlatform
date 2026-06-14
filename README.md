# Kalenz-CareerDiscoveryPlatform

## Quick Links

| Resource | Link |
|----------|------|
| **GitHub Repository** | [github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform](https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform) |
| **Figma Designs** | [KareerLenz Figma Mockups](https://www.figma.com/design/5zh8BMM8EJrjMFZkrFb6m9/KareerLenz?node-id=0-1&p=f&t=vdmkUyDzJdDBzmJh-0) |
| **Demo Video** | [Project Demo](https://www.bugufi.link/XXDSBd) |

---

## Description

**KarrerLenz** is my final-year capstone project at ALU. It is a career discovery platform for young tech graduates in Rwanda, helping them find realistic career paths based on what they have actually built — not assumptions.

The platform accepts evidence such as CVs, certificates, and GitHub activity, analyzes competency signals, and recommends career matches across five tech paths: Software Development, Data & AI, Cybersecurity & Networking, Product & Project Management, and UI/UX & Digital Design. Users receive a personalized roadmap and can chat with a career assistant for guidance.

---

## Repository

**GitHub:** [https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform](https://github.com/Ange-Constance/Kalenz-CareerDiscoveryPlatform)

Clone the repository and open the project folder to get started locally.

---

## Problem Statement

Rwanda's tech sector is growing quickly, but many graduates still struggle to find roles that match their skills. Youth unemployment remains higher than the national average, and a large share of graduates are underutilized in the labor market. Most career decisions are made without clear evidence of what a person can actually do.

KarrerLenz addresses this by turning real work — projects, certifications, and CV content — into structured career insights and actionable next steps.

---

## How to Set Up the Environment and the Project

### Prerequisites

- Node.js 18 or later
- Python 3.10 or later
- PostgreSQL 15 or later (or Docker)
- Optional: Ollama for local chat responses, or a Groq API key as a fallback

### Project Structure

The application has four main parts:

| Service | Technology | Port |
|---------|------------|------|
| Frontend | React, Vite, Tailwind CSS | 5173 |
| Backend | Node.js, Express, PostgreSQL | 3000 |
| ML Service | Python, Flask, scikit-learn | 5000 |
| Database | PostgreSQL | 5432 |

### Local Setup

1. Run the setup script from the project root to install dependencies, configure environment files, and run database migrations.
2. Start the ML service from the `ml-service` folder.
3. Start the backend from the `backend` folder.
4. Start the frontend from the `frontend` folder.
5. Open the app in your browser at http://localhost:5173

Alternatively, you can run the full stack with Docker Compose after copying and editing the environment file.

### User Flow

Sign up → Upload a CV (PDF or DOCX) → View career match results → Explore a personalized roadmap → Chat with the career assistant

---

## Designs

| Asset | Link |
|-------|------|
| **Figma mockups** | [KareerLenz on Figma](https://www.figma.com/design/5zh8BMM8EJrjMFZkrFb6m9/KareerLenz?node-id=0-1&p=f&t=vdmkUyDzJdDBzmJh-0) |
| **Demo video** | [Project walkthrough](https://www.bugufi.link/XXDSBd) |
| **App screenshots** | Available in the demo video and Figma mockups |

The Figma file includes the main interface layouts for the landing page, dashboard, upload flow, results view, roadmap, and chat assistant.

---

## Deployment Plan

| Component | Target Platform | Notes |
|-----------|-----------------|-------|
| Frontend | Vercel or Netlify | Deploy the React build and point it to the production API |
| Backend API | Railway or Render | Host the Node.js server with PostgreSQL |
| ML Service | Railway, Render, or Docker | Deploy the Flask service with the trained model files |
| Database | Supabase or Railway PostgreSQL | Run migrations before the first production deploy |
| Full stack (staging) | Docker Compose | Useful for testing all services together locally |

Before going live, set secure secrets for authentication, configure the API and frontend URLs correctly, and run database migrations on the production database.

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| Frontend | React, Tailwind CSS, React Router, Recharts |
| Backend | Node.js, Express, JWT authentication, PostgreSQL |
| Machine Learning | scikit-learn, TF-IDF, logistic regression |
| Chat | Ollama (local) with optional Groq fallback |
| Deployment | Docker, Vercel, Railway |

---

## Team

Final-year project at African Leadership University (ALU).
