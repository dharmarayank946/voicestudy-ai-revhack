from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.agents.quiz_agent import quiz_agent
from backend.agents.memory_agent import study_memory_agent
from backend.memory.study_vault import study_vault

router = APIRouter(prefix="/api/quiz", tags=["Quiz"])

class GenerateQuizRequest(BaseModel):
    topic: Optional[str] = "Recent Studies"
    num_questions: Optional[int] = 5
    difficulty: Optional[str] = "medium"
    uid: Optional[str] = "default_student"
    lecture_notes: Optional[str] = None
    subject: Optional[str] = None

class SubmitQuizRequest(BaseModel):
    topic: str
    difficulty: Optional[str] = "medium"
    questions: List[Dict[str, Any]]
    user_answers: Dict[str, int]  # maps stringified question index to selected option index
    uid: Optional[str] = "default_student"

@router.post("")
@router.post("/generate")
def generate_quiz(req: GenerateQuizRequest):
    uid = req.uid or "default_student"

    # Enforce daily quiz limit on free tier
    limit_err = study_vault.check_limit_exceeded(uid, is_quiz=True)
    if limit_err:
        raise HTTPException(status_code=429, detail=limit_err)

    topic = req.topic if req.topic and req.topic.strip() else "Recent Studies"
    
    try:
        raw_q = int(req.num_questions) if req.num_questions is not None else 5
    except (ValueError, TypeError):
        raw_q = 5

    num_q = max(3, min(10, raw_q))
    diff = req.difficulty if req.difficulty in ["easy", "medium", "hard"] else "medium"

    # Retrieve relevant study memories to build questions from
    retrieved = study_memory_agent.retrieve_relevant_memories(
        query=topic,
        limit=6,
        subject_filter=req.subject,
        uid_filter=req.uid
    )

    # If explicit lecture notes were provided, inject them as top grounding context
    content_notice = None
    if req.lecture_notes and req.lecture_notes.strip():
        words = req.lecture_notes.strip().split()
        if len(words) < 6:
            content_notice = "Supplied lecture text is brief. Questions are supplemented with core subject fundamentals."
        lecture_memory = {
            "subject": req.subject or topic,
            "topic": topic,
            "text": req.lecture_notes.strip(),
            "source": "lecture_input"
        }
        retrieved = [lecture_memory] + [m for m in (retrieved or []) if m.get("text") != lecture_memory["text"]]
    elif not retrieved:
        content_notice = f"No personal saved notes found for '{topic}'. Questions generated from core subject syllabus."
    
    quiz_result = quiz_agent.generate_quiz(
        topic_or_subject=topic,
        num_questions=num_q,
        difficulty=diff,
        retrieved_memories=retrieved
    )
    if content_notice:
        quiz_result["notice"] = content_notice
    return quiz_result

@router.post("/submit")
def submit_quiz_attempt(req: SubmitQuizRequest):
    if not req.questions:
        raise HTTPException(status_code=400, detail="Cannot submit quiz without questions.")

    total_q = len(req.questions)
    score = 0
    detailed_results = []
    weak_topics = []

    for idx, q in enumerate(req.questions):
        # Index can be passed as string or int
        selected_opt = req.user_answers.get(str(idx), req.user_answers.get(idx))
        correct_answer = q.get("correct_answer", 0)
        is_correct = selected_opt == correct_answer

        if is_correct:
            score += 1
        else:
            # Extract concept keyword from question for weak topic categorization
            q_text = q.get("question", "")
            concept = q.get("topic") or (q_text.split("?")[0][:45] if "?" in q_text else q_text[:45])
            if concept and concept not in weak_topics:
                weak_topics.append(concept)

        detailed_results.append({
            "question_index": idx,
            "question": q.get("question"),
            "selected_option": selected_opt,
            "correct_option": correct_answer,
            "is_correct": is_correct,
            "explanation": q.get("explanation", "")
        })

    uid = req.uid or "default_student"
    percentage = round((score / max(1, total_q)) * 100, 1)

    # Persist attempt record into SQLite study vault
    saved_record = study_vault.record_quiz_attempt(
        uid=uid,
        topic=req.topic,
        difficulty=req.difficulty or "medium",
        score=score,
        total_questions=total_q,
        weak_topics=weak_topics,
        answers_dict=req.user_answers
    )

    # Generate actionable recommendation
    if percentage >= 80:
        recommendation = f"Mastery achieved in '{req.topic}' ({percentage}%). Proceed to practice active recall or explore related advanced concepts."
    elif percentage >= 50:
        weak_str = ", ".join(weak_topics[:2]) if weak_topics else req.topic
        recommendation = f"Good progress ({percentage}%). Recommend reviewing weak areas ({weak_str}) in Study Workspace before retrying."
    else:
        weak_str = ", ".join(weak_topics[:2]) if weak_topics else req.topic
        recommendation = f"Foundation review recommended ({percentage}%). Check the flashcards and study notes for {weak_str}."

    return {
        "status": "success",
        "attempt_id": saved_record.get("attempt_id"),
        "topic": req.topic,
        "difficulty": req.difficulty,
        "score": score,
        "total_questions": total_q,
        "percentage": percentage,
        "weak_topics": weak_topics,
        "recommendation": recommendation,
        "results": detailed_results,
        "created_at": saved_record.get("created_at")
    }

@router.get("/history")
def get_quiz_history(
    uid: Optional[str] = Query(default="default_student"),
    limit: int = Query(default=15, le=50)
):
    history = study_vault.get_quiz_history(uid=uid, limit=limit)
    total_attempts = len(history)
    avg_score = round(sum(h["percentage"] for h in history) / total_attempts, 1) if total_attempts > 0 else 0.0

    return {
        "total_attempts": total_attempts,
        "average_accuracy": avg_score,
        "history": history
    }
