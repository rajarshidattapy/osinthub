from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import uvicorn
import os
from dotenv import load_dotenv

from database import get_db, engine
from models import Base
from routers import repositories, merge_requests, users, files
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
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