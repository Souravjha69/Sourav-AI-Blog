<div align="center">

# sourav.log

**A full-stack tech & AI journal** — long-form articles, a custom CMS, and a from-scratch design system with a 3D hero, scroll-triggered animation, and buttery smooth scrolling.

<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
<img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" />
<img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white" />
<img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge" />

Built and written by **[Sourav Kumar Jha](https://souravdev-ochre.vercel.app/)** — Full Stack & AI Developer

<a href="https://github.com/Souravjha69" target="_blank"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" /></a>
<a href="https://www.linkedin.com/in/souravitachi/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white" /></a>
<a href="https://souravdev-ochre.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Portfolio-38BDF8?style=flat-square&logo=vercel&logoColor=white" /></a>

</div>

<br/>

## 📚 Table of Contents

- [Stack](#-stack)
- [Features](#-features)
- [Local Development](#-local-development)
- [Deployment](#-deployment)
- [Environment Variables](#-environment-variables)

<br/>

## 🧱 Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, React Router, Tailwind CSS, Framer Motion, React Three Fiber (3D hero), Lenis (smooth scroll), Radix UI / shadcn (admin CMS) |
| **Backend** | FastAPI, Motor (async MongoDB driver), PyJWT (auth), bcrypt (password hashing) |
| **Database** | MongoDB |

<br/>

## ✨ Features

**Public site**
- 🏠 Home page with animated 3D hero
- 🗂️ Article archive with search & filter
- 📰 Article detail pages with likes & comments
- 👤 Author profile

**Admin CMS**
- 🔐 JWT cookie-auth login
- 📊 Dashboard stats
- ✍️ Full article CRUD

**Design**
- 📱 Fully responsive
- 🌗 Dark / light theme
- 🎬 3D animated hero (React Three Fiber)
- 🪄 Scroll-reveal animations throughout, smooth-scrolled with Lenis

<br/>

## 💻 Local Development

### Prerequisites

- Node.js + Yarn
- Python 3.11+ *(a virtualenv is recommended)*
- MongoDB running locally (`brew services start mongodb-community` on macOS)

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # then fill in real values
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend

```bash
cd frontend
yarn install
cp .env.example .env   # REACT_APP_BACKEND_URL should point at your backend
yarn start
```

The app runs at `http://localhost:3000`, the API at `http://localhost:8000`.

> On first boot, the backend seeds a few sample articles and an admin user using the `ADMIN_EMAIL` / `ADMIN_PASSWORD` set in `backend/.env`.

<br/>

## ☁️ Deployment

The deployed site is a **static, frontend-only** build on Vercel — there is no live backend or database in production, and the admin CMS is only reachable locally.

| Component | Where it runs | Notes |
|---|---|---|
| **Frontend** | [Vercel](https://vercel.com) | Set root directory to `frontend`. No `REACT_APP_BACKEND_URL` needed in production. |
| **Backend + MongoDB** | Local machine only | Used to write/edit posts through the admin CMS (`/login`, `/admin`). Never deployed. |

In a production build (`yarn build`, which is what Vercel runs — `NODE_ENV=production`), the app reads a static JSON snapshot (`frontend/src/data/*.json`) instead of calling a live API, and the `/login` and `/admin` routes, the like button, comments, and the newsletter form are all disabled/hidden (see `frontend/src/lib/config.js`). Running `yarn start` locally still uses the live backend and full admin CMS as before.

### Publishing a new or edited post

1. Run the backend + frontend locally as described above, and write/edit posts through `/admin`.
2. Export the current published posts to static JSON:
   ```bash
   cd backend && source venv/bin/activate
   python scripts/export_static_data.py
   ```
   This overwrites `frontend/src/data/blogs.json`, `authors.json`, and `categories.json`.
3. Commit and push those files. Vercel rebuilds the frontend with the new snapshot baked in.

<br/>

## 🔑 Environment Variables

See `backend/.env.example` and `frontend/.env.example` for the full list.
Neither `.env` file is committed — secrets stay local / host-configured only.

<br/>

<div align="center">

---

**[Sourav Kumar Jha](https://souravdev-ochre.vercel.app/)** · [GitHub](https://github.com/Souravjha69) · [LinkedIn](https://www.linkedin.com/in/souravitachi/)

</div>