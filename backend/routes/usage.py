from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from backend.memory.study_vault import study_vault
from backend.memory.qdrant_service import memory_service

router = APIRouter(prefix="/api", tags=["Usage & Revenue"])

class UpgradeInterestRequest(BaseModel):
    email: str
    student_name: Optional[str] = None
    college_name: Optional[str] = None
    plan_requested: Optional[str] = "student_plus"
    notes: Optional[str] = None
    uid: Optional[str] = "default_student"

class ResetUsageRequest(BaseModel):
    uid: Optional[str] = "default_student"

class SetPlanTierRequest(BaseModel):
    uid: Optional[str] = "default_student"
    plan_tier: Optional[str] = "student_plus"

@router.get("/usage/status")
def get_usage_status(uid: Optional[str] = Query(default="default_student")):
    return study_vault.get_usage(uid=uid)

@router.post("/usage/upgrade-interest")
def register_upgrade_interest(req: UpgradeInterestRequest):
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Please enter a valid student email address.")
    
    result = study_vault.register_upgrade_interest(
        uid=req.uid or "default_student",
        email=req.email,
        student_name=req.student_name,
        college_name=req.college_name,
        plan_requested=req.plan_requested or "student_plus",
        notes=req.notes
    )
    return result

@router.get("/progress/readiness")
def get_exam_readiness(uid: Optional[str] = Query(default="default_student")):
    stats = memory_service.get_stats(uid_filter=uid)
    total_memories = stats.get("total_memories", 0)
    if total_memories == 0:
        all_stats = memory_service.get_stats(uid_filter=None)
        total_memories = all_stats.get("total_memories", 0)
    return study_vault.calculate_exam_readiness(uid=uid, total_memories=total_memories)

@router.post("/usage/reset")
def reset_daily_usage(req: Optional[ResetUsageRequest] = None):
    uid = (req.uid if req and req.uid else "default_student")
    updated = study_vault.reset_usage(uid=uid)
    return {
        "status": "success",
        "message": f"Daily usage quota reset successfully for {uid}.",
        "usage": updated
    }

@router.post("/usage/plan")
def set_plan_tier_route(req: SetPlanTierRequest):
    uid = req.uid or "default_student"
    tier = req.plan_tier or "student_plus"
    updated = study_vault.set_plan_tier(uid=uid, plan_tier=tier)
    return {
        "status": "success",
        "message": f"Plan tier updated to {tier} for {uid}.",
        "usage": updated
    }
