from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import httpx
import os
from dotenv import load_dotenv
import jwt
from sqlalchemy.orm import Session
from database import get_db
from models import User as UserModel

load_dotenv()

security = HTTPBearer()
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Verify Clerk JWT token and return user information"""
    try:
        token = credentials.credentials
        
        # Verify the JWT token with Clerk
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
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication token"
                )
            
            session_data = response.json()
            clerk_user_id = session_data.get("user_id")
            
            if not clerk_user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token payload"
                )
            
            # Get user from database
            user = db.query(UserModel).filter(UserModel.clerk_id == clerk_user_id).first()
            
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            return user
            
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not verify authentication token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

def require_role(required_roles: list):
    """Decorator to require specific user roles"""
    def role_checker(current_user: UserModel = Depends(verify_clerk_token)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

# Role-based dependencies
admin_required = require_role(["admin"])
analyst_required = require_role(["admin", "analyst"])
contributor_required = require_role(["admin", "analyst", "contributor"])