from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn
import os
from dotenv import load_dotenv

from database import get_db, engine
from models import Base
from routers import repositories, merge_requests, users, files, search, upload_file, webhooks, commit_graph, chatbot, dashboard, demo_seed, legal
from auth import verify_clerk_token

load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="OSINT Collaboration Platform API",
    description="Backend API for collaborative OSINT investigations",
    version="1.0.0"
)

# CORS middleware
allowed = os.getenv("ALLOWED_ORIGINS","https://osinthub-delta.vercel.app,http://localhost:5173,http://localhost:3000")
allow_origins = [o.strip() for o in allowed.split(",") if o.strip()]

# Also support a single FRONTEND_URL / FE_URL env var for convenience
frontend_url = os.getenv("FE_URL") or os.getenv("FRONTEND_URL") or os.getenv("FE_URLS")
if frontend_url:
    # allow FE_URL to contain comma-separated list as well
    for u in str(frontend_url).split(","):
        u = u.strip()
        if u and u not in allow_origins:
            allow_origins.append(u)

print(f"CORS allow_origins: {allow_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# Include routers
app.include_router(repositories.router, prefix="/api/repositories", tags=["repositories"])
app.include_router(merge_requests.router, prefix="/api/merge-requests", tags=["merge-requests"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(files.router, prefix="/api/files", tags=["files"])
app.include_router(search.router, prefix="/api", tags=["search"])
app.include_router(upload_file.router, prefix="/api", tags=["upload"])
app.include_router(webhooks.router, tags=["webhooks"])
app.include_router(commit_graph.router, prefix="/api", tags=["commit-graph"])
app.include_router(chatbot.router, prefix="/api", tags=["chatbot"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(demo_seed.router, prefix="/api/demo", tags=["demo"])
app.include_router(legal.router, prefix="/api/legal", tags=["legal"])
@app.get("/")
async def root():
    return {"message": "OSINT Collaboration Platform API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("DEBUG") == "True" else False
    )