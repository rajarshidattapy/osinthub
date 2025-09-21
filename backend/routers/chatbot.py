from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional, AsyncGenerator
import json
import asyncio

from database import get_db
from models import Repository as RepositoryModel, User as UserModel, Commit, RepositoryFile
from auth import verify_clerk_token, contributor_required
from ai_service import EnhancedAIService
from repository_analysis_service import RepositoryAnalysisService

router = APIRouter()

async def get_current_user_optional(
    request: Request,
    db: Session = Depends(get_db)
) -> Optional[UserModel]:
    """Get current user if authenticated, otherwise return None"""
    try:
        # Try to get the authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None
        
        token = auth_header.split(" ")[1]
        
        # Verify the JWT token with Clerk
        import httpx
        import os
        from dotenv import load_dotenv
        
        load_dotenv()
        CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.clerk.dev/v1/sessions/verify",
                headers={
                    "Authorization": f"Bearer {CLERK_SECRET_KEY}",
                    "Content-Type": "application/json"
                },
                params={"token": token}
            )
            
            if response.status_code != 200:
                return None
            
            session_data = response.json()
            clerk_user_id = session_data.get("user_id")
            
            if not clerk_user_id:
                return None
            
            # Get user from database
            user = db.query(UserModel).filter(UserModel.clerk_id == clerk_user_id).first()
            return user
            
    except Exception:
        return None

@router.post("/chatbot/query")
async def query_repository_chatbot(
    query_data: Dict[str, Any],
    request: Request,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Handle chatbot queries about repository content"""
    try:
        question = query_data.get("question", "")
        repository_data = query_data.get("repository", {})
        commits_data = query_data.get("commits", [])
        files_data = query_data.get("files", [])
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question is required"
            )
        
        # Verify user has access to the repository (if authenticated)
        repo_id = repository_data.get("id")
        if repo_id and current_user:
            repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
            if not repo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Repository not found"
                )
            
            # Check permissions for authenticated users
            if repo.owner_id != current_user.id:
                from models import RepositoryCollaborator
                is_collaborator = db.query(RepositoryCollaborator).filter(
                    RepositoryCollaborator.repository_id == repo_id,
                    RepositoryCollaborator.user_id == current_user.id
                ).first()
                if not is_collaborator:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions to access this repository"
                    )
        elif repo_id and not current_user:
            # For unauthenticated users, only allow access to public repositories
            repo = db.query(RepositoryModel).filter(RepositoryModel.id == repo_id).first()
            if not repo or repo.is_private:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required to access this repository"
                )
        
        # Get comprehensive repository data if repository ID is provided
        if repo_id:
            analysis_service = RepositoryAnalysisService(db)
            comprehensive_data = analysis_service.get_comprehensive_repository_data(repo_id)
            
            # Use comprehensive data if available, otherwise fall back to provided data
            if comprehensive_data:
                repository_data = comprehensive_data.get("repository", repository_data)
                commits_data = comprehensive_data.get("commits", commits_data)
                files_data = comprehensive_data.get("files", files_data)
        
        # Initialize AI service
        ai_service = EnhancedAIService()
        
        # Generate response using Gemini
        answer = await ai_service.generate_repository_chatbot_response(
            question=question,
            repository_data=repository_data,
            commits_data=commits_data,
            files_data=files_data
        )
        
        return {"answer": answer}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chatbot query: {str(e)}"
        )

@router.post("/chatbot/query-simple")
async def query_repository_chatbot_simple(
    query_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Handle chatbot queries without authentication (for testing)"""
    try:
        question = query_data.get("question", "")
        repository_data = query_data.get("repository", {})
        commits_data = query_data.get("commits", [])
        files_data = query_data.get("files", [])
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question is required"
            )
        
        # Initialize AI service
        ai_service = EnhancedAIService()
        
        # Generate response using Gemini
        answer = await ai_service.generate_repository_chatbot_response(
            question=question,
            repository_data=repository_data,
            commits_data=commits_data,
            files_data=files_data
        )
        
        return {"answer": answer}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chatbot query: {str(e)}"
        )

@router.post("/chatbot/query-stream")
async def query_repository_chatbot_stream(
    query_data: Dict[str, Any],
    request: Request,
    current_user: Optional[UserModel] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Handle chatbot queries with streaming response"""
    try:
        question = query_data.get("question", "")
        repository_data = query_data.get("repository", {})
        commits_data = query_data.get("commits", [])
        files_data = query_data.get("files", [])
        
        if not question:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Question is required"
            )
        
        # Initialize AI service
        ai_service = EnhancedAIService()
        
        # Create streaming response
        async def generate_stream() -> AsyncGenerator[str, None]:
            try:
                # Generate streaming response using Gemini
                async for chunk in ai_service.generate_repository_chatbot_response_stream(
                    question=question,
                    repository_data=repository_data,
                    commits_data=commits_data,
                    files_data=files_data
                ):
                    yield f"data: {json.dumps({'content': chunk, 'done': False})}\n\n"
                    await asyncio.sleep(0.01)  # Small delay for smooth streaming
                
                # Send completion signal
                yield f"data: {json.dumps({'content': '', 'done': True})}\n\n"
                
            except Exception as e:
                error_message = f"Error: {str(e)}"
                yield f"data: {json.dumps({'content': error_message, 'done': True, 'error': True})}\n\n"
        
        return StreamingResponse(
            generate_stream(),
            media_type="text/plain",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Content-Type": "text/event-stream",
            }
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing chatbot query: {str(e)}"
        )