from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models import User as UserModel
from schemas import User, UserCreate, UserUpdate
from auth import verify_clerk_token, admin_required

router = APIRouter()

@router.post("/", response_model=User)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user (typically called by Clerk webhook)"""
    # Check if user already exists
    existing_user = db.query(UserModel).filter(UserModel.clerk_id == user_data.clerk_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already exists"
        )
    
    # Check if username is taken
    username_taken = db.query(UserModel).filter(UserModel.username == user_data.username).first()
    if username_taken:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    db_user = UserModel(**user_data.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.get("/me", response_model=User)
async def get_current_user(
    current_user: UserModel = Depends(verify_clerk_token)
):
    """Get current authenticated user"""
    return current_user

@router.put("/me", response_model=User)
async def update_current_user(
    user_update: UserUpdate,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    update_data = user_update.dict(exclude_unset=True)
    
    # Check if username is being changed and if it's available
    if "username" in update_data:
        existing_user = db.query(UserModel).filter(
            UserModel.username == update_data["username"],
            UserModel.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.get("/", response_model=List[User])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    current_user: UserModel = Depends(admin_required),
    db: Session = Depends(get_db)
):
    """List all users (admin only)"""
    users = db.query(UserModel).offset(skip).limit(limit).all()
    return users

@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: UserModel = Depends(verify_clerk_token),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user