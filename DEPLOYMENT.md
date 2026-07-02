# Sourav-AI-Blog — Complete Deployment & Project Documentation

> **Last updated:** July 2026  
> **Author:** Sourav Kumar Jha  
> **Repo:** [Souravjha69/Sourav-AI-Blog](https://github.com/Souravjha69/Sourav-AI-Blog)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Repository Structure](#3-repository-structure)
4. [Tech Stack](#4-tech-stack)
5. [Environment Variables](#5-environment-variables)
6. [Local Development Setup](#6-local-development-setup)
7. [Vercel Deployment — Step by Step](#7-vercel-deployment--step-by-step)
8. [Files Created for Vercel](#8-files-created-for-vercel)
9. [How Frontend and Backend Work Together](#9-how-frontend-and-backend-work-together)
10. [Publishing New Blog Posts](#10-publishing-new-blog-posts)
11. [Common Issues & Fixes](#11-common-issues--fixes)
12. [Future Maintenance](#12-future-maintenance)

---

## 1. Project Overview

**sourav.log** is a full-stack personal tech and AI blog. It features:

- A public-facing React site with a 3D animated hero, article archive, likes, comments, and author profile
- A private Admin CMS (reachable at `/login` and `/admin`) for writing and managing blog posts
- A FastAPI + MongoDB backend that powers the CMS locally
- A Vercel-hosted static frontend that reads from pre-exported JSON snapshots in production

The key design decision: **the backend runs locally only**. When you want to publish posts, you write them through the local admin, export a static JSON snapshot, and push it. Vercel then rebuilds the frontend with the new data baked in — no live database needed in production.

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────┐
│                  LOCAL MACHINE                      │
│                                                     │
│  ┌─────────────┐     ┌──────────────┐              │
│  │  React Dev  │────▶│  FastAPI     │              │
│  │  Server     │     │  :8000       │              │
│  │  :3000      │     │  (server.py) │              │
│  └─────────────┘     └──────┬───────┘              │
│                             │                       │
│                      ┌──────▼───────┐              │
│                      │   MongoDB    │              │
│                      │  (local)     │              │
│                      └──────────────┘              │
└─────────────────────────────────────────────────────┘
         │
                  │  python scripts/export_static_data.py
                           │  (exports blogs.json, authors.json, categories.json)
                                    │
                                             ▼  git push
                                             ┌─────────────────────────────────────────────────────┐
                                             │                    VERCEL (Production)               │
                                             │                                                     │
                                             │  ┌──────────────────────────────────────────────┐  │
                                             │  │  React Static Build  (frontend/build/)       │  │
                                             │  │  Reads from: frontend/src/data/*.json        │  │
                                             │  │  Routes: /api/* → backend/api/index.py       │  │
                                             │  │           /*   → /index.html (SPA fallback)  │  │
                                             │  └──────────────────────────────────────────────┘  │
                                             │                                                     │
                                             │  ┌──────────────────────────────────────────────┐  │
                                             │  │  Python Serverless Function                  │  │
                                             │  │  backend/api/index.py  (FastAPI app)         │  │
                                             │  │  Runtime: python3.12                         │  │
                                             │  └──────────────────────────────────────────────┘  │
                                             └─────────────────────────────────────────────────────┘
                                             ```

                                             ---

                                             ## 3. Repository Structure

                                             ```
                                             Sourav-AI-Blog/
                                             │
                                             ├── vercel.json                  ← Root Vercel config (build + routing)
                                             ├── requirements.txt             ← Python deps for Vercel serverless function
                                             ├── DEPLOYMENT.md                ← This document
                                             ├── README.md                    ← Project overview
                                             ├── render.yaml                  ← (Legacy) Render.com config — not used
                                             │
                                             ├── frontend/                    ← React application
                                             │   ├── src/
                                             │   │   ├── data/                ← Static JSON snapshots (blogs, authors, categories)
                                             │   │   ├── lib/
                                             │   │   │   └── config.js        ← Toggles features on/off based on NODE_ENV
                                             │   │   └── ...
                                             │   ├── public/
                                             │   ├── vercel.json              ← Frontend-specific SPA rewrite rule
                                             │   ├── craco.config.js          ← CRACO webpack config (aliases, eslint, devserver)
                                             │   ├── package.json             ← Build: "craco build", Start: "craco start"
                                             │   ├── .env.example             ← Frontend env var template
                                             │   └── .env                     ← (gitignored) Real frontend env vars
                                             │
                                             ├── backend/                     ← FastAPI application
                                             │   ├── api/
                                             │   │   └── index.py             ← Vercel serverless entry point (imports app from server.py)
                                             │   ├── scripts/
                                             │   │   └── export_static_data.py ← Exports MongoDB data → frontend/src/data/*.json
                                             │   ├── __pycache__/
                                             │   ├── server.py                ← Main FastAPI app (all routes, models, auth)
                                             │   ├── requirements.txt         ← Python deps (FastAPI, Motor, PyJWT, etc.)
                                             │   ├── .env.example             ← Backend env var template
                                             │   ├── .env                     ← (gitignored) Real backend env vars
                                             │   └── pytest.ini
                                             │
                                             ├── memory/                      ← (Internal) Dev notes / memory files
                                             ├── test_reports/                ← Test output reports
                                             └── tests/                       ← Project tests
                                             ```

                                             ---

                                             ## 4. Tech Stack

                                             | Layer | Technology | Version | Purpose |
                                             |-------|-----------|---------|---------|
                                             | Frontend Framework | React | 19.0.0 | UI |
                                             | Routing | React Router | 7.15.0 | SPA routing |
                                             | Styling | Tailwind CSS | 3.4.17 | Utility CSS |
                                             | UI Components | Radix UI + shadcn | various | Admin CMS components |
                                             | 3D Graphics | React Three Fiber + Three.js | 9.x / 0.169 | Hero animation |
                                             | Scroll Animation | Framer Motion + Lenis | 11.x / 1.1.x | Page animations |
                                             | Build Tool | CRACO | 7.1.0 | CRA config override |
                                             | HTTP Client | Axios + SWR | 1.16 / 2.3.8 | API calls |
                                             | Backend Framework | FastAPI | 0.110.1 | REST API |
                                             | ASGI Server | Uvicorn | 0.25.0 | Local dev server |
                                             | Database Driver | Motor (async) | 3.3.1 | MongoDB async driver |
                                             | Database | MongoDB | local / Atlas | Data storage |
                                             | Auth | PyJWT + bcrypt | 2.13 / 4.1.3 | JWT cookie auth |
                                             | Validation | Pydantic | 2.13.4 | Request/response models |
                                             | Deployment | Vercel | — | Hosting |

                                             ---

                                             ## 5. Environment Variables

                                             ### Backend — `backend/.env`

                                             Copy `backend/.env.example` and fill in real values.

                                             | Variable | Required | Description | Example |
                                             |----------|----------|-------------|---------|
                                             | `MONGO_URL` | ✅ | MongoDB connection string | `mongodb://localhost:27017` or Atlas URI |
                                             | `DB_NAME` | ✅ | Database name | `blog_cms_db` |
                                             | `JWT_SECRET` | ✅ | Long random secret for JWT signing | `a-very-long-random-string-here` |
                                             | `CORS_ORIGINS` | ✅ | Allowed frontend origins (comma-separated) | `http://localhost:3000` |
                                             | `ADMIN_EMAIL` | ✅ | Email for the seeded admin account | `you@example.com` |
                                             | `ADMIN_PASSWORD` | ✅ | Password for the seeded admin account | `StrongPassword123!` |

                                             ### Frontend — `frontend/.env`

                                             Copy `frontend/.env.example` and fill in real values.

                                             | Variable | Required | Description | Example |
                                             |----------|----------|-------------|---------|
                                             | `REACT_APP_BACKEND_URL` | Local only | URL of the FastAPI backend | `http://localhost:8000` |
                                             | `ENABLE_HEALTH_CHECK` | Optional | Enable health-check pings | `false` |

                                             > **Note:** `REACT_APP_BACKEND_URL` is **not needed in production** (Vercel). In production (`NODE_ENV=production`), the frontend reads static JSON files instead of hitting the API.

                                             ### Vercel Environment Variables (Production)

                                             When deploying on Vercel, add these in the Vercel dashboard → Project Settings → Environment Variables:

                                             | Variable | Value |
                                             |----------|-------|
                                             | `MONGO_URL` | Your MongoDB Atlas connection string |
                                             | `DB_NAME` | `blog_cms_db` (or your DB name) |
                                             | `JWT_SECRET` | A long random secret |
                                             | `CORS_ORIGINS` | `https://your-project.vercel.app` |
                                             | `ADMIN_EMAIL` | Your admin email |
                                             | `ADMIN_PASSWORD` | Your admin password |

                                             ---

                                             ## 6. Local Development Setup

                                             ### Prerequisites

                                             - Node.js 18+ and Yarn
                                             - Python 3.11+
                                             - MongoDB running locally

                                             ### Step 1 — Start MongoDB

                                             ```bash
                                             # macOS (Homebrew)
                                             brew services start mongodb-community

                                             # Linux
                                             sudo systemctl start mongod

                                             # Windows
                                             net start MongoDB
                                             ```

                                             ### Step 2 — Start the Backend

                                             ```bash
                                             cd backend

                                             # Create and activate virtualenv
                                             python3 -m venv venv
                                             source venv/bin/activate        # macOS/Linux
                                             # venv\Scripts\activate         # Windows

                                             # Install dependencies
                                             pip install -r requirements.txt

                                             # Copy and fill in env vars
                                             cp .env.example .env
                                             # Edit .env with your MONGO_URL, DB_NAME, JWT_SECRET, CORS_ORIGINS, ADMIN_EMAIL, ADMIN_PASSWORD

                                             # Start the dev server
                                             uvicorn server:app --host 0.0.0.0 --port 8000 --reload
                                             ```

                                             The API will be at `http://localhost:8000`. On first boot it seeds sample blogs and creates your admin user.

                                             ### Step 3 — Start the Frontend

                                             ```bash
                                             cd frontend

                                             # Install dependencies
                                             yarn install

                                             # Copy and fill in env vars
                                             cp .env.example .env
                                             # Set REACT_APP_BACKEND_URL=http://localhost:8000

                                             # Start dev server
                                             yarn start
                                             ```

                                             The app runs at `http://localhost:3000`.

                                             ### Step 4 — Access the Admin CMS

                                             Go to `http://localhost:3000/login` and log in with the `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `backend/.env`.

                                             ---

                                             ## 7. Vercel Deployment — Step by Step

                                             ### Prerequisites

                                             - A Vercel account (free Hobby plan works)
                                             - The GitHub repo connected to Vercel
                                             - A MongoDB Atlas account (free M0 cluster works)

                                             ### Step 1 — Get a MongoDB Atlas URI

                                             1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create a free M0 cluster
                                             2. Under **Database Access**, create a user with read/write permissions
                                             3. Under **Network Access**, add `0.0.0.0/0` (allow all IPs, needed for Vercel serverless)
                                             4. Click **Connect → Drivers** and copy the connection string (looks like `mongodb+srv://user:pass@cluster.mongodb.net/`)

                                             ### Step 2 — Import the Project on Vercel

                                             1. Go to [vercel.com/new](https://vercel.com/new)
                                             2. Import `Souravjha69/Sourav-AI-Blog` from GitHub
                                             3. Vercel will auto-detect **FastAPI** as the preset (from `vercel.json`)
                                             4. Build settings will be auto-filled:
                                                - **Build Command:** `cd frontend && npm install && npm run build`
                                                   - **Output Directory:** `frontend/build`

                                                   ### Step 3 — Add Environment Variables

                                                   In the Vercel import screen, expand **Environment Variables** and add:

                                                   ```
                                                   MONGO_URL        = mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/
                                                   DB_NAME          = blog_cms_db
                                                   JWT_SECRET       = <generate a long random string>
                                                   CORS_ORIGINS     = https://<your-project>.vercel.app
                                                   ADMIN_EMAIL      = you@example.com
                                                   ADMIN_PASSWORD   = YourStrongPassword
                                                   ```

                                                   > **Tip:** Generate a JWT secret with: `python3 -c "import secrets; print(secrets.token_hex(32))"`

                                                   ### Step 4 — Deploy

                                                   Click **Deploy**. Vercel will:
                                                   1. Run `cd frontend && npm install && npm run build`
                                                   2. Output the static build to `frontend/build/`
                                                   3. Register `backend/api/index.py` as a Python 3.12 serverless function
                                                   4. Apply the routing rules from `vercel.json`

                                                   ### Step 5 — Update CORS_ORIGINS

                                                   After deploy, you'll get a URL like `https://sourav-ai-blog.vercel.app`. Go to:

                                                   **Vercel Dashboard → Project → Settings → Environment Variables**

                                                   Update `CORS_ORIGINS` to your real Vercel URL and redeploy.

                                                   ---

                                                   ## 8. Files Created for Vercel

                                                   The following files were created/modified specifically to make this project deployable on Vercel:

                                                   ### `vercel.json` (root) — NEW

                                                   ```json
                                                   {
                                                     "buildCommand": "cd frontend && npm install && npm run build",
                                                       "outputDirectory": "frontend/build",
                                                         "installCommand": "cd frontend && npm install",
                                                           "functions": {
                                                               "backend/api/index.py": {
                                                                     "runtime": "python3.12"
                                                                         }
                                                                           },
                                                                             "rewrites": [
                                                                                 {
                                                                                       "source": "/api/(.*)",
                                                                                             "destination": "/backend/api/index.py"
                                                                                                 },
                                                                                                     {
                                                                                                           "source": "/(.*)",
                                                                                                                 "destination": "/index.html"
                                                                                                                     }
                                                                                                                       ]
                                                                                                                       }
                                                                                                                       ```
                                                                                                                       
                                                                                                                       **What it does:**
                                                                                                                       - Tells Vercel to build the React frontend from the `frontend/` folder
                                                                                                                       - Registers the FastAPI app as a Python 3.12 serverless function
                                                                                                                       - Routes all `/api/*` traffic to the serverless FastAPI function
                                                                                                                       - Routes everything else to `index.html` (SPA fallback for React Router)
                                                                                                                       
                                                                                                                       ### `backend/api/index.py` — NEW
                                                                                                                       
                                                                                                                       ```python
                                                                                                                       import sys
                                                                                                                       import os
                                                                                                                       
                                                                                                                       # Add the backend directory to the path so we can import server
                                                                                                                       sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
                                                                                                                       
                                                                                                                       from server import app
                                                                                                                       ```
                                                                                                                       
                                                                                                                       **What it does:**
                                                                                                                       - Vercel looks for Python serverless functions in the `api/` directory
                                                                                                                       - This file adds the `backend/` directory to `sys.path` so Python can find `server.py`
                                                                                                                       - Imports the FastAPI `app` object — Vercel serves this as a serverless ASGI function
                                                                                                                       
                                                                                                                       ### `requirements.txt` (root) — NEW
                                                                                                                       
                                                                                                                       ```
                                                                                                                       fastapi==0.110.1
                                                                                                                       uvicorn[standard]==0.25.0
                                                                                                                       motor==3.3.1
                                                                                                                       pymongo==4.6.3
                                                                                                                       pydantic==2.13.4
                                                                                                                       email-validator==2.3.0
                                                                                                                       bcrypt==4.1.3
                                                                                                                       PyJWT==2.13.0
                                                                                                                       python-slugify==8.0.4
                                                                                                                       python-dotenv==1.2.2
                                                                                                                       python-multipart==0.0.32
                                                                                                                       ```
                                                                                                                       
                                                                                                                       **What it does:**
                                                                                                                       - Vercel uses this to install Python dependencies for the serverless function
                                                                                                                       - Mirrors `backend/requirements.txt` exactly
                                                                                                                       
                                                                                                                       ### `frontend/vercel.json` — ALREADY EXISTS
                                                                                                                       
                                                                                                                       ```json
                                                                                                                       {
                                                                                                                         "rewrites": [
                                                                                                                             { "source": "/(.*)", "destination": "/index.html" }
                                                                                                                               ]
                                                                                                                               }
                                                                                                                               ```
                                                                                                                               
                                                                                                                               This was already in the repo — it handles the SPA routing fallback for the frontend.
                                                                                                                               
                                                                                                                               ---
                                                                                                                               
                                                                                                                               ## 9. How Frontend and Backend Work Together
                                                                                                                               
                                                                                                                               ### In Local Development
                                                                                                                               
                                                                                                                               ```
                                                                                                                               Browser → React Dev Server (:3000) → Axios/SWR → FastAPI (:8000) → MongoDB
                                                                                                                               ```
                                                                                                                               
                                                                                                                               - `REACT_APP_BACKEND_URL=http://localhost:8000` tells the frontend where to call
                                                                                                                               - All API routes are prefixed with `/api` in FastAPI (e.g., `GET /api/blogs`)
                                                                                                                               - CORS is enabled on the backend to allow `http://localhost:3000`
                                                                                                                               - JWT tokens are stored as HTTP-only cookies for auth
                                                                                                                               
                                                                                                                               ### In Production (Vercel)
                                                                                                                               
                                                                                                                               ```
                                                                                                                               Browser → Vercel Edge
                                                                                                                                 ├── /api/* → Python Serverless Function (FastAPI + MongoDB Atlas)
                                                                                                                                   └── /*    → Static React Build (reads from src/data/*.json)
                                                                                                                                   ```
                                                                                                                                   
                                                                                                                                   - In production (`NODE_ENV=production`), `frontend/src/lib/config.js` switches the app to read from static JSON files
                                                                                                                                   - The `/login`, `/admin`, like button, comments, and newsletter form are **disabled/hidden** in production
                                                                                                                                   - The serverless FastAPI is available but the frontend doesn't actively call it in production unless you re-enable it
                                                                                                                                   
                                                                                                                                   ### Static Data Flow (for Publishing Posts)
                                                                                                                                   
                                                                                                                                   ```
                                                                                                                                   MongoDB (local) → export_static_data.py → frontend/src/data/*.json → git push → Vercel rebuild
                                                                                                                                   ```
                                                                                                                                   
                                                                                                                                   The three exported files are:
                                                                                                                                   - `frontend/src/data/blogs.json` — all published blog posts
                                                                                                                                   - `frontend/src/data/authors.json` — author profiles
                                                                                                                                   - `frontend/src/data/categories.json` — post categories
                                                                                                                                   
                                                                                                                                   ---
                                                                                                                                   
                                                                                                                                   ## 10. Publishing New Blog Posts
                                                                                                                                   
                                                                                                                                   This is the day-to-day workflow for adding new content:
                                                                                                                                   
                                                                                                                                   ```bash
                                                                                                                                   # 1. Make sure MongoDB is running locally
                                                                                                                                   brew services start mongodb-community   # macOS
                                                                                                                                   
                                                                                                                                   # 2. Start the backend
                                                                                                                                   cd backend
                                                                                                                                   source venv/bin/activate
                                                                                                                                   uvicorn server:app --port 8000 --reload
                                                                                                                                   
                                                                                                                                   # 3. Start the frontend
                                                                                                                                   cd frontend
                                                                                                                                   yarn start
                                                                                                                                   
                                                                                                                                   # 4. Go to http://localhost:3000/login
                                                                                                                                   #    Log in with ADMIN_EMAIL / ADMIN_PASSWORD from backend/.env
                                                                                                                                   
                                                                                                                                   # 5. Write/edit posts through the /admin CMS
                                                                                                                                   
                                                                                                                                   # 6. Export data to static JSON
                                                                                                                                   cd backend
                                                                                                                                   source venv/bin/activate
                                                                                                                                   python scripts/export_static_data.py
                                                                                                                                   
                                                                                                                                   # 7. Commit and push — Vercel auto-rebuilds
                                                                                                                                   git add frontend/src/data/
                                                                                                                                   git commit -m "Publish new post: <post title>"
                                                                                                                                   git push origin main
                                                                                                                                   ```
                                                                                                                                   
                                                                                                                                   ---
                                                                                                                                   
                                                                                                                                   ## 11. Common Issues & Fixes
                                                                                                                                   
                                                                                                                                   ### "vercel.json required to deploy projects with multiple services"
                                                                                                                                   
                                                                                                                                   **Cause:** Vercel detected multiple folders (frontend + backend) and needed a config file to understand the structure.
                                                                                                                                   
                                                                                                                                   **Fix:** The root `vercel.json` was created with `buildCommand`, `outputDirectory`, `functions`, and `rewrites` to properly configure the deployment.
                                                                                                                                   
                                                                                                                                   ### Backend API returns 500 errors on Vercel
                                                                                                                                   
                                                                                                                                   **Cause:** Missing environment variables (`MONGO_URL`, `DB_NAME`, `JWT_SECRET`).
                                                                                                                                   
                                                                                                                                   **Fix:** Go to Vercel Dashboard → Project → Settings → Environment Variables and add all required vars. Redeploy.
                                                                                                                                   
                                                                                                                                   ### MongoDB connection refused on Vercel
                                                                                                                                   
                                                                                                                                   **Cause:** MongoDB Atlas Network Access not configured to allow Vercel's IPs.
                                                                                                                                   
                                                                                                                                   **Fix:** In MongoDB Atlas → Network Access → Add IP Address → use `0.0.0.0/0` (allow from anywhere). Vercel uses dynamic IPs so you must allow all.
                                                                                                                                   
                                                                                                                                   ### React app shows blank page or 404 on refresh
                                                                                                                                   
                                                                                                                                   **Cause:** React Router routes (e.g., `/blog/my-post`) not falling back to `index.html`.
                                                                                                                                   
                                                                                                                                   **Fix:** The `vercel.json` rewrite rule `"source": "/(.*)"` → `"/index.html"` handles this. The `frontend/vercel.json` also has this as a backup.
                                                                                                                                   
                                                                                                                                   ### Build fails: "craco: command not found"
                                                                                                                                   
                                                                                                                                   **Cause:** `craco` is a local dev dependency, not a global package.
                                                                                                                                   
                                                                                                                                   **Fix:** The build command `cd frontend && npm install && npm run build` installs craco locally first, so it will always be found.
                                                                                                                                   
                                                                                                                                   ### CORS errors in production
                                                                                                                                   
                                                                                                                                   **Cause:** `CORS_ORIGINS` env var doesn't include your Vercel deployment URL.
                                                                                                                                   
                                                                                                                                   **Fix:** Update `CORS_ORIGINS` in Vercel environment variables to `https://your-project.vercel.app`. Remember to redeploy after changing env vars.
                                                                                                                                   
                                                                                                                                   ---
                                                                                                                                   
                                                                                                                                   ## 12. Future Maintenance
                                                                                                                                   
                                                                                                                                   ### Adding a New Environment Variable
                                                                                                                                   
                                                                                                                                   1. Add it to `backend/.env.example` or `frontend/.env.example` (for documentation)
                                                                                                                                   2. Add the actual value in **Vercel Dashboard → Settings → Environment Variables**
                                                                                                                                   3. Trigger a redeploy (or push a new commit)
                                                                                                                                   
                                                                                                                                   ### Updating Python Dependencies
                                                                                                                                   
                                                                                                                                   1. Update `backend/requirements.txt`
                                                                                                                                   2. Also update the root `requirements.txt` (they should always be identical)
                                                                                                                                   3. Push the change — Vercel will install the new dependencies on next deploy
                                                                                                                                   
                                                                                                                                   ### Updating the Vercel Python Runtime
                                                                                                                                   
                                                                                                                                   In `vercel.json`, change the `runtime` field:
                                                                                                                                   
                                                                                                                                   ```json
                                                                                                                                   "functions": {
                                                                                                                                     "backend/api/index.py": {
                                                                                                                                         "runtime": "python3.12"
                                                                                                                                           }
                                                                                                                                           }
                                                                                                                                           ```
                                                                                                                                           
                                                                                                                                           Supported runtimes: `python3.9`, `python3.10`, `python3.11`, `python3.12`.
                                                                                                                                           
                                                                                                                                           ### Switching to a Live Backend in Production
                                                                                                                                           
                                                                                                                                           If you want the full CMS to be live in production (not just static JSON):
                                                                                                                                           
                                                                                                                                           1. Set `REACT_APP_BACKEND_URL` in Vercel env vars to your Vercel deployment URL
                                                                                                                                           2. Update `frontend/src/lib/config.js` to enable CMS features in production
                                                                                                                                           3. Make sure `CORS_ORIGINS` includes your frontend URL
                                                                                                                                           4. Ensure MongoDB Atlas is accessible (Network Access → `0.0.0.0/0`)
                                                                                                                                           
                                                                                                                                           ### Custom Domain
                                                                                                                                           
                                                                                                                                           1. Go to **Vercel Dashboard → Project → Settings → Domains**
                                                                                                                                           2. Add your domain and follow the DNS instructions
                                                                                                                                           3. Update `CORS_ORIGINS` env var to include your new domain
                                                                                                                                           4. Redeploy
                                                                                                                                           
                                                                                                                                           ---
                                                                                                                                           
                                                                                                                                           *Documentation written and maintained by Sourav Kumar Jha.*  
                                                                                                                                           *Questions? Open an issue at [github.com/Souravjha69/Sourav-AI-Blog/issues](https://github.com/Souravjha69/Sourav-AI-Blog/issues)*
