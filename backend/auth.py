from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import get_db
from models import User as UserModel

security = HTTPBearer()

async def verify_clerk_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Ultra-simple auth for testing - bypasses Clerk verification"""
    try:
        token = credentials.credentials
        
        print(f"🔍 Token received: {token[:20]}..." if token else "❌ No token")
        print(f"🔍 Token length: {len(token) if token else 0}")
        
        # For testing: Accept any token that's longer than 10 characters
        if not token or len(token) < 10:
            print("❌ Token too short or missing")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Create or get a test user
        test_user_id = "test_user_123"
        user = db.query(UserModel).filter(UserModel.clerk_id == test_user_id).first()
        
        if not user:
            print("👤 Creating test user")
            user = UserModel(
                clerk_id=test_user_id,
                username="testuser",  # Add required username
                email="test@example.com",
                role="admin"
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        print(f"✅ Auth successful for test user: {user.email}")
        return user
        
    except Exception as e:
        print(f"💥 Auth error: {e}")
        print(f"💥 Error type: {type(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}"
        )

def require_role(required_roles: list):
    def role_checker(current_user: UserModel = Depends(verify_clerk_token)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return current_user
    return role_checker

admin_required = require_role(["admin"])
analyst_required = require_role(["admin", "analyst"])
contributor_required = require_role(["admin", "analyst", "contributor"])