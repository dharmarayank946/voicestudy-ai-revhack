import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from backend.services.voice_adapter import voice_adapter, VoiceInputPayload
from backend.agents.orchestrator import orchestrator_agent
from backend.agents.memory_agent import study_memory_agent
from backend.agents.assistant_agent import study_assistant_agent
from backend.agents.quiz_agent import quiz_agent
from backend.services.lyzr_agent_framework import lyzr_framework, LyzrAPIError, LyzrTimeoutError

from backend.agents.manager_agent import manager_agent

logger = logging.getLogger("voicestudy.study")

router = APIRouter(prefix="/api", tags=["Study"])

class StudyRequest(BaseModel):
    transcript: str
    source: Optional[str] = "web_speech"  # 'omi', 'web_speech', 'text_fallback'
    device_id: Optional[str] = "browser_mic"
    uid: Optional[str] = None
    subject_override: Optional[str] = None
    topic_override: Optional[str] = None
    history: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

from backend.memory.study_vault import study_vault
from backend.memory.qdrant_service import memory_service

class UploadMaterialRequest(BaseModel):
    filename: str
    content: str
    subject: Optional[str] = "General"
    topic: Optional[str] = "Uploaded Material"
    uid: Optional[str] = "default_student"

@router.post("/study/upload-material")
def upload_study_material(req: UploadMaterialRequest):
    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Uploaded file content cannot be empty.")
    
    # Check file size limit (2 MB = ~2,000,000 characters)
    if len(req.content) > 2_000_000:
        raise HTTPException(status_code=400, detail="Material exceeds maximum allowed file size of 2MB.")

    valid_exts = [".txt", ".md", ".json", ".csv", ".py", ".pdf"]
    has_valid_ext = any(req.filename.lower().endswith(ext) for ext in valid_exts)
    if not has_valid_ext:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{req.filename}'. Allowed types: {', '.join(valid_exts)}")

    # Chunk content into manageable memory pieces (up to ~1000 chars per note)
    lines = [p.strip() for p in req.content.split("\n\n") if p.strip()]
    if not lines:
        lines = [req.content[:1000]]

    saved_memories = []
    subject = req.subject or "Uploaded Material"
    topic = req.topic or req.filename

    # Save up to 5 key sections to Qdrant vector store
    for idx, chunk in enumerate(lines[:5]):
        if len(chunk) < 20:
            continue
        mem = memory_service.save_memory(
            text=chunk[:800],
            subject=subject,
            topic=f"{topic} (Section {idx + 1})",
            memory_type="uploaded_material",
            uid=req.uid or "default_student",
            metadata={"filename": req.filename, "chunk_index": idx}
        )
        saved_memories.append(mem)

    return {
        "status": "success",
        "filename": req.filename,
        "subject": subject,
        "topic": topic,
        "sections_indexed": len(saved_memories),
        "message": f"Successfully indexed {len(saved_memories)} key sections of '{req.filename}' into Qdrant vector memory."
    }

@router.post("/study")
@router.post("/chat")
def process_study_request(req: StudyRequest):
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Voice or text input transcript cannot be empty.")

    user_uid = req.uid or (req.metadata.get("uid") if req.metadata else None) or "default_student"

    # Enforce daily free tier usage limits on backend
    limit_err = study_vault.check_limit_exceeded(user_uid, is_quiz=False)
    if limit_err:
        raise HTTPException(status_code=429, detail=limit_err)

    voice_payload = VoiceInputPayload(
        source=req.source or "web_speech",
        transcript=req.transcript.strip(),
        device_id=req.device_id or "browser_mic",
        metadata=req.metadata
    )
    processed_voice = voice_adapter.process_incoming_voice(voice_payload)
    clean_transcript = processed_voice["transcript"]

    try:
        response_dict = manager_agent.execute_request(
            transcript=clean_transcript,
            user_uid=user_uid,
            history=req.history,
            subject_override=req.subject_override,
            topic_override=req.topic_override
        )
        response_dict["voice_meta"] = processed_voice
        # Increment daily usage record in persistent vault
        study_vault.increment_usage(user_uid, is_quiz=False)
    except (LyzrAPIError, LyzrTimeoutError) as err:
        logger.error(f"Lyzr Agent execution error: {err}")
        provider_status = lyzr_framework.get_framework_status()
        response_dict = {
            "intent": "ERROR",
            "orchestration": {"subject": "General", "topic": "Lyzr Execution"},
            "voice_meta": processed_voice,
            "ai_provider": provider_status,
            "agent_executed": "Lyzr Agent",
            "message": f"Lyzr Agent Error: {str(err)}",
            "response_type": "error",
            "retrieved_memories": [],
            "data": {
                "error": str(err),
                "memories_count": 0
            }
        }
    except Exception as e:
        logger.error(f"Unexpected error in study request execution: {e}")
        provider_status = lyzr_framework.get_framework_status()
        response_dict = {
            "intent": "ERROR",
            "orchestration": {"subject": "General", "topic": "General Execution"},
            "voice_meta": processed_voice,
            "ai_provider": provider_status,
            "agent_executed": "VoiceStudy Backend",
            "message": f"Internal execution error: {str(e)}",
            "response_type": "error",
            "retrieved_memories": [],
            "data": {"error": str(e)}
        }

    logger.info(f"[APP] Final response returned for intent={response_dict.get('intent')} | Agent: {response_dict.get('agent_executed')}")
    return response_dict

@router.post("/voice/omi-webhook")
def omi_webhook(payload: Dict[str, Any]):
    transcript = payload.get("transcript") or payload.get("text") or payload.get("body", "")
    if not transcript:
        return {"status": "ignored", "reason": "empty_transcript"}

    study_req = StudyRequest(
        transcript=transcript,
        source="omi",
        device_id=payload.get("device_id", "omi_wearable_01"),
        metadata=payload
    )
    return process_study_request(study_req)

class AnalyzeRequest(BaseModel):
    transcript: str
    analysis_type: Optional[str] = "all"  # 'all', 'summary', 'action_items', 'exam_pitfalls'
    subject: Optional[str] = "General"
    uid: Optional[str] = "default_student"

@router.post("/study/analyze")
def analyze_transcript(req: AnalyzeRequest):
    """
    Lecture & Meeting Intelligence Analyzer.
    Coordinates SummarizerAgent and ActionItemExtractorAgent to generate
    structured lecture digest, action items, deadlines, and key revision takeaways.
    """
    if not req.transcript or not req.transcript.strip():
        raise HTTPException(status_code=400, detail="Transcript text cannot be empty.")

    uid = req.uid or "default_student"
    # Check usage quota
    usage = study_vault.get_usage(uid)
    limits = usage.get("limits", {})
    if limits.get("study_queries_remaining", 1) <= 0:
        raise HTTPException(
            status_code=429,
            detail=f"Daily AI study query limit ({limits.get('max_daily_study_queries')}) reached on your {usage.get('plan_tier', 'free').upper()} plan. Upgrade to Student Plus for 100 queries/day."
        )

    from backend.agents.summarizer_agent import summarizer_agent
    from backend.agents.action_item_agent import action_item_agent

    results: Dict[str, Any] = {
        "status": "success",
        "analysis_type": req.analysis_type,
        "subject": req.subject or "General",
        "transcript_length": len(req.transcript)
    }

    try:
        if req.analysis_type in ["all", "summary", "comprehensive"]:
            sum_res = summarizer_agent.summarize_transcript(req.transcript)
            results["summary"] = sum_res.get("summary", "")

        if req.analysis_type in ["all", "action_items", "comprehensive"]:
            act_res = action_item_agent.extract_action_items(req.transcript)
            results["action_items"] = act_res.get("action_items", "")

        # Key concepts extractor (simple rule-based highlight extractor from text)
        words = [w.strip(".,;:()[]{}") for w in req.transcript.split() if len(w) > 4]
        # Common technical term filter
        tech_terms = list(dict.fromkeys([w for w in words if w.istitle() or w.isupper()]))[:8]
        results["key_terms"] = tech_terms

        # Increment quota record
        study_vault.increment_usage(uid, is_quiz=False, estimated_tokens=600)
        provider_status = lyzr_framework.get_framework_status()
        results["ai_provider"] = provider_status
        results["agent_executed"] = "Lyzr Lecture Analyzer"

    except Exception as e:
        logger.error(f"Error in transcript analysis: {e}")
        raise HTTPException(status_code=500, detail=f"Analyzer error: {str(e)}")

    return results
