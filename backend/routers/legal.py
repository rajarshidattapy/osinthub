from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Any
from auth import verify_clerk_token
from sqlalchemy.orm import Session
from database import get_db
from ai_service import EnhancedAIService

router = APIRouter()
ai_service = EnhancedAIService()


# ===== Request / Response Schemas (kept minimal for prototype) =====
class TextInput(BaseModel):
    text: str

class SmartReviewInput(BaseModel):
    original: str
    proposed: str
    context: Optional[str] = None

class ExtractClausesResponse(BaseModel):
    clauses: List[dict]

class SummarizeResponse(BaseModel):
    summary: str
    reading_grade: int

class RiskScoreResponse(BaseModel):
    risk_alerts: List[dict]

class SmartReviewResponse(BaseModel):
    decision: str
    fidelity_score: int
    clarity_score: int
    completeness_score: int
    risk_alignment_score: int
    overall_score: int
    omitted_risk_items: List[str]
    concerns: List[str]
    suggestions: List[str]
    reasoning: str


@router.post("/extract-clauses", response_model=ExtractClausesResponse)
async def extract_clauses(payload: TextInput, current_user=Depends(verify_clerk_token)):
    """Return structured key points (mock for now)."""
    clauses = await ai_service.extract_clauses(payload.text)
    return {"clauses": clauses}


@router.post("/summarize", response_model=SummarizeResponse)
async def summarize_document(payload: TextInput, current_user=Depends(verify_clerk_token)):
    data = await ai_service.summarize_document(payload.text)
    return data


@router.post("/risk-score", response_model=RiskScoreResponse)
async def risk_score(payload: TextInput, current_user=Depends(verify_clerk_token)):
    # For prototype we call extract first then score risks (could be client-driven later)
    clauses = await ai_service.extract_clauses(payload.text)
    data = await ai_service.score_risk(clauses)
    return data


@router.post("/smart-review", response_model=SmartReviewResponse)
async def smart_review(payload: SmartReviewInput, current_user=Depends(verify_clerk_token)):
    result = await ai_service.smart_review_change(
        original=payload.original,
        proposed=payload.proposed,
        context=payload.context or ""
    )
    return result
