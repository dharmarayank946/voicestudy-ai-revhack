from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List
from backend.memory.study_vault import study_vault
from backend.memory.qdrant_service import memory_service

router = APIRouter(prefix="/api/revision-plan", tags=["Revision Plan"])

class GenerateRevisionPlanRequest(BaseModel):
    uid: Optional[str] = "default_student"
    subject: Optional[str] = None

class ToggleTaskRequest(BaseModel):
    task_id: int
    uid: Optional[str] = "default_student"

@router.post("/generate")
def generate_revision_plan(req: GenerateRevisionPlanRequest):
    uid = req.uid or "default_student"
    profile = study_vault.get_exam_profile(uid)

    target_subject = req.subject or (profile["target_subject"] if profile else "General Computer Science")
    exam_date = profile["exam_date"] if profile else "2026-11-15"
    daily_hours = profile["daily_study_hours"] if profile else 2.0

    # Retrieve real weak topics from student's past quizzes
    quiz_history = study_vault.get_quiz_history(uid, limit=10)
    weak_topics = []
    for q in quiz_history:
        weak_topics.extend(q.get("weak_topics", []))
    unique_weaks = list(dict.fromkeys(weak_topics))

    # Retrieve topics covered in Qdrant memories
    stats = memory_service.get_stats(uid_filter=uid)
    studied_topics = stats.get("topics_list", [])

    tasks = study_vault.generate_revision_plan(
        uid=uid,
        target_subject=target_subject,
        exam_date_str=exam_date,
        daily_hours=daily_hours,
        weak_topics=unique_weaks,
        studied_topics=studied_topics
    )

    return {
        "status": "success",
        "subject": target_subject,
        "total_tasks_scheduled": len(tasks),
        "weak_topics_targeted": unique_weaks,
        "tasks": tasks
    }

@router.get("")
def get_revision_plan(uid: Optional[str] = Query(default="default_student")):
    tasks_summary = study_vault.get_revision_tasks(uid=uid)
    profile = study_vault.get_exam_profile(uid=uid)

    return {
        "has_exam_profile": bool(profile),
        "exam_profile": profile,
        **tasks_summary
    }

@router.post("/task/toggle")
def toggle_revision_task(req: ToggleTaskRequest):
    updated = study_vault.toggle_task_completion(uid=req.uid or "default_student", task_id=req.task_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Task with ID {req.task_id} not found.")
    return {
        "status": "success",
        "task": updated
    }
