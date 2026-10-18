from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from backend.memory.study_vault import study_vault

router = APIRouter(prefix="/api/exam", tags=["Exam Setup"])

class ExamSetupRequest(BaseModel):
    target_subject: str
    exam_title: str
    exam_date: str  # ISO date or YYYY-MM-DD
    daily_study_hours: Optional[float] = 2.0
    confidence_level: Optional[int] = 3  # 1 to 5
    uid: Optional[str] = "default_student"

@router.post("/setup")
def setup_exam(req: ExamSetupRequest):
    if not req.target_subject or not req.target_subject.strip():
        raise HTTPException(status_code=400, detail="Target subject is required.")
    if not req.exam_date or not req.exam_date.strip():
        raise HTTPException(status_code=400, detail="Exam target date is required.")

    profile = study_vault.save_exam_profile(
        uid=req.uid or "default_student",
        target_subject=req.target_subject.strip(),
        exam_title=req.exam_title.strip() or f"{req.target_subject} Examination",
        exam_date_str=req.exam_date.strip(),
        daily_study_hours=max(0.5, min(12.0, float(req.daily_study_hours or 2.0))),
        confidence_level=max(1, min(5, int(req.confidence_level or 3)))
    )
    return {
        "status": "success",
        "message": f"Exam profile for '{profile['target_subject']}' saved successfully.",
        "profile": profile
    }

@router.get("/profile")
def get_exam_profile(uid: Optional[str] = Query(default="default_student")):
    profile = study_vault.get_exam_profile(uid=uid)
    if not profile:
        return {
            "has_profile": False,
            "profile": None,
            "notice": "No active exam setup yet. Configure your upcoming exam to generate a revision plan."
        }
    return {
        "has_profile": True,
        "profile": profile
    }
