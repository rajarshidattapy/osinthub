# OSINT Hub

## What this project is
OSINT Hub is a collaborative investigation platform (React + Vite frontend, FastAPI backend) focused on case repositories, file upload/processing, AI-assisted review, and versioned audit trails.

Backend (deployed): https://osinthub-tny5.onrender.com/

## Quick start (dev)

Frontend (from project root):

1. Install and run dev server

```bash
npm install
npm run dev
```

The frontend runs at http://localhost:5173 by default.

Backend (from the `backend/` folder):

1. Install Python deps and run

```bash
cd backend
pip install -r requirements.txt
cp env.example .env
# edit .env values (DATABASE_URL, CLERK_SECRET_KEY, etc.)
alembic upgrade head  # optional: run migrations
python main.py
```

The backend runs at http://localhost:8000 by default.

## Essential environment variables (high level)

- `DATABASE_URL` — Postgres connection string
- `CLERK_SECRET_KEY` — Clerk auth secret
- `GOOGLE_API_KEY` — for AI features
- `VITE_API_URL` — (frontend build) base URL for API (e.g. https://osinthub-tny5.onrender.com)
- `ALLOWED_ORIGINS` or `FE_URL` — (backend) include your frontend origin to avoid CORS issues (e.g. https://osinthub-delta.vercel.app)

Tip: For deployed frontend (Vercel), set `VITE_API_URL` in the Vercel project settings before building. For Render (backend), set `ALLOWED_ORIGINS` or `FE_URL` to include the frontend origin.

## Deploy notes

- Frontend: Vercel works well (build with `npm run build`). Ensure `VITE_API_URL` is set in Vercel env before deploying.
- Backend: Render can run either via Docker (there is a `backend/Dockerfile`) or as a Python service. Set the production env vars (DATABASE_URL, ALLOWED_ORIGINS/FE_URL, CLERK/GOOGLE keys) in Render's dashboard.

## Useful endpoints

- Health: `/api/health`
- Example API base path: `/api/*`

## Contributing

1. Create a branch, implement changes, open a PR. Keep changes small and add tests where applicable.

---
This README keeps only the essentials. For deeper docs, see `STRUCTURE.md` and the `backend/` and `src/` folders.



