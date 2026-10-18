import os
import sqlite3
import json
import logging
from datetime import datetime, timezone, date
from typing import Dict, Any, List, Optional

logger = logging.getLogger("voicestudy.vault")

from contextlib import contextmanager

class StudyVaultService:
    """
    Zero-dependency, persistent SQLite relational database service for VoiceStudy AI.
    Stores structured records alongside Qdrant vector memory:
    - Exam profiles & countdowns
    - Quiz attempts, scores, and detected weak topics
    - Revision tasks & daily study schedule
    - Daily API usage limits & estimated AI costs
    - Student upgrade interest / waitlist registrations
    """

    def __init__(self, db_path: Optional[str] = None):
        if not db_path:
            storage_dir = os.getenv("QDRANT_STORAGE_PATH", "./qdrant_data")
            os.makedirs(storage_dir, exist_ok=True)
            db_path = os.path.join(storage_dir, "study_vault.db")
        self.db_path = db_path
        self._init_db()

    @contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path, timeout=10.0)
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        """Create database tables if they do not exist."""
        try:
            with self._get_connection() as conn:
                cursor = conn.cursor()

                # 1. Exam Setup Profile
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS exam_profiles (
                    uid TEXT PRIMARY KEY,
                    target_subject TEXT NOT NULL,
                    exam_title TEXT NOT NULL,
                    exam_date TEXT NOT NULL,
                    daily_study_hours REAL DEFAULT 2.0,
                    confidence_level INTEGER DEFAULT 3,
                    updated_at TEXT NOT NULL
                )
                """)

                # 2. Quiz Attempts History
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS quiz_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uid TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    total_questions INTEGER NOT NULL,
                    percentage REAL NOT NULL,
                    weak_topics TEXT DEFAULT '[]',
                    answers_json TEXT DEFAULT '{}',
                    created_at TEXT NOT NULL
                )
                """)

                # 3. Revision Schedule Tasks
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS revision_tasks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uid TEXT NOT NULL,
                    title TEXT NOT NULL,
                    subject TEXT NOT NULL,
                    topic TEXT NOT NULL,
                    task_type TEXT NOT NULL, -- 'concept_review', 'active_recall', 'quiz_practice', 'flashcards'
                    due_date TEXT NOT NULL,
                    estimated_minutes INTEGER DEFAULT 25,
                    is_completed INTEGER DEFAULT 0,
                    completed_at TEXT,
                    created_at TEXT NOT NULL
                )
                """)

                # 4. Daily Usage and AI Cost Tracker
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS usage_records (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uid TEXT NOT NULL,
                    usage_date TEXT NOT NULL,
                    study_queries_count INTEGER DEFAULT 0,
                    quiz_generations_count INTEGER DEFAULT 0,
                    estimated_cost_usd REAL DEFAULT 0.0,
                    plan_tier TEXT DEFAULT 'free',
                    UNIQUE(uid, usage_date)
                )
                """)

                # 5. Upgrade Interest / Student Lead Registrations
                cursor.execute("""
                CREATE TABLE IF NOT EXISTS upgrade_interest (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    uid TEXT NOT NULL,
                    email TEXT NOT NULL,
                    student_name TEXT,
                    college_name TEXT,
                    plan_requested TEXT NOT NULL, -- 'student_plus', 'exam_sprint'
                    notes TEXT,
                    created_at TEXT NOT NULL
                )
                """)

                conn.commit()
                logger.info(f"[VAULT] Persistent Study Vault initialized at '{self.db_path}'")
        except Exception as e:
            logger.error(f"[VAULT] Failed to initialize Study Vault database: {e}")

    # ==========================================
    # EXAM PROFILE METHODS
    # ==========================================
    def save_exam_profile(
        self,
        uid: str,
        target_subject: str,
        exam_title: str,
        exam_date_str: str,
        daily_study_hours: float = 2.0,
        confidence_level: int = 3
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO exam_profiles (uid, target_subject, exam_title, exam_date, daily_study_hours, confidence_level, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(uid) DO UPDATE SET
                target_subject = excluded.target_subject,
                exam_title = excluded.exam_title,
                exam_date = excluded.exam_date,
                daily_study_hours = excluded.daily_study_hours,
                confidence_level = excluded.confidence_level,
                updated_at = excluded.updated_at
            """, (uid, target_subject, exam_title, exam_date_str, daily_study_hours, confidence_level, now_iso))
            conn.commit()

        return self.get_exam_profile(uid)

    def get_exam_profile(self, uid: str) -> Optional[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM exam_profiles WHERE uid = ?", (uid,))
            row = cursor.fetchone()
            if not row:
                return None

            profile = dict(row)
            # Calculate countdown days
            try:
                target_dt = datetime.fromisoformat(profile["exam_date"].replace("Z", "+00:00"))
                now_dt = datetime.now(target_dt.tzinfo or timezone.utc)
                delta = target_dt - now_dt
                days_left = max(0, delta.days)
                hours_left = max(0, int(delta.seconds // 3600))
                is_expired = delta.total_seconds() <= 0
            except Exception:
                days_left = 0
                hours_left = 0
                is_expired = False

            profile["days_remaining"] = days_left
            profile["hours_remaining"] = hours_left
            profile["is_expired"] = is_expired
            return profile

    # ==========================================
    # QUIZ ATTEMPT METHODS
    # ==========================================
    def record_quiz_attempt(
        self,
        uid: str,
        topic: str,
        difficulty: str,
        score: int,
        total_questions: int,
        weak_topics: List[str],
        answers_dict: Dict[str, Any]
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        percentage = round((score / max(1, total_questions)) * 100, 1)

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO quiz_attempts (uid, topic, difficulty, score, total_questions, percentage, weak_topics, answers_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                uid,
                topic,
                difficulty,
                score,
                total_questions,
                percentage,
                json.dumps(weak_topics),
                json.dumps(answers_dict),
                now_iso
            ))
            attempt_id = cursor.lastrowid
            conn.commit()

        # Update daily usage for quiz
        self.increment_usage(uid=uid, is_quiz=True)

        return {
            "attempt_id": attempt_id,
            "uid": uid,
            "topic": topic,
            "difficulty": difficulty,
            "score": score,
            "total_questions": total_questions,
            "percentage": percentage,
            "weak_topics": weak_topics,
            "created_at": now_iso
        }

    def get_quiz_history(self, uid: str, limit: int = 15) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM quiz_attempts
            WHERE uid = ?
            ORDER BY created_at DESC
            LIMIT ?
            """, (uid, limit))
            rows = cursor.fetchall()
            results = []
            for r in rows:
                item = dict(r)
                try:
                    item["weak_topics"] = json.loads(item["weak_topics"])
                except Exception:
                    item["weak_topics"] = []
                try:
                    item["answers_json"] = json.loads(item["answers_json"])
                except Exception:
                    item["answers_json"] = {}
                results.append(item)
            return results

    # ==========================================
    # REVISION PLAN METHODS
    # ==========================================
    def generate_revision_plan(
        self,
        uid: str,
        target_subject: str,
        exam_date_str: str,
        daily_hours: float,
        weak_topics: List[str],
        studied_topics: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Creates personalized revision tasks across the remaining days before exam.
        Prioritizes weak topics identified from actual quizzes, followed by
        core syllabus topics from stored memories.
        """
        now_iso = datetime.now(timezone.utc).isoformat()
        today = date.today()

        # Clear existing uncompleted auto-generated tasks for clean schedule
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM revision_tasks WHERE uid = ? AND is_completed = 0", (uid,))
            conn.commit()

        tasks_to_create = []

        # 1. High priority tasks: Weak topics from quiz attempts
        for idx, weak_top in enumerate(weak_topics[:4]):
            day_offset = idx % 3
            due = today.isoformat() if day_offset == 0 else f"{today.year}-{today.month:02d}-{min(28, today.day + day_offset):02d}"
            tasks_to_create.append({
                "title": f"Targeted Review: {weak_top}",
                "subject": target_subject,
                "topic": weak_top,
                "task_type": "active_recall",
                "due_date": due,
                "estimated_minutes": 30
            })

        # 2. Medium priority: Core subject topics from stored memories
        available_topics = [t for t in studied_topics if t not in weak_topics]
        if not available_topics:
            available_topics = ["Core Principles", "Important Formulas & Proofs", "Practice Mock Exam"]

        for idx, top in enumerate(available_topics[:5]):
            day_offset = (idx + 1) % 5
            due = f"{today.year}-{today.month:02d}-{min(28, today.day + day_offset):02d}"
            t_type = "quiz_practice" if idx % 2 == 0 else "concept_review"
            tasks_to_create.append({
                "title": f"Revise & Test: {top}",
                "subject": target_subject,
                "topic": top,
                "task_type": t_type,
                "due_date": due,
                "estimated_minutes": int(daily_hours * 25)
            })

        # Insert tasks into SQLite
        created_records = []
        with self._get_connection() as conn:
            cursor = conn.cursor()
            for t in tasks_to_create:
                cursor.execute("""
                INSERT INTO revision_tasks (uid, title, subject, topic, task_type, due_date, estimated_minutes, is_completed, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)
                """, (uid, t["title"], t["subject"], t["topic"], t["task_type"], t["due_date"], t["estimated_minutes"], now_iso))
                t_copy = dict(t)
                t_copy["id"] = cursor.lastrowid
                t_copy["is_completed"] = False
                created_records.append(t_copy)
            conn.commit()

        return created_records

    def get_revision_tasks(self, uid: str) -> Dict[str, Any]:
        today_str = date.today().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT * FROM revision_tasks
            WHERE uid = ?
            ORDER BY is_completed ASC, due_date ASC, id ASC
            """, (uid,))
            rows = [dict(r) for r in cursor.fetchall()]

        today_tasks = [t for t in rows if t["due_date"] <= today_str and not t["is_completed"]]
        upcoming_tasks = [t for t in rows if t["due_date"] > today_str and not t["is_completed"]]
        completed_tasks = [t for t in rows if t["is_completed"]]

        return {
            "total_tasks": len(rows),
            "completed_count": len(completed_tasks),
            "pending_count": len(today_tasks) + len(upcoming_tasks),
            "completion_rate": round((len(completed_tasks) / max(1, len(rows))) * 100, 1) if rows else 0,
            "today_tasks": today_tasks,
            "upcoming_tasks": upcoming_tasks,
            "completed_tasks": completed_tasks
        }

    def toggle_task_completion(self, uid: str, task_id: int) -> Optional[Dict[str, Any]]:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT is_completed FROM revision_tasks WHERE id = ? AND uid = ?", (task_id, uid))
            row = cursor.fetchone()
            if not row:
                return None

            new_status = 0 if row["is_completed"] == 1 else 1
            completed_time = now_iso if new_status == 1 else None
            cursor.execute("""
            UPDATE revision_tasks
            SET is_completed = ?, completed_at = ?
            WHERE id = ? AND uid = ?
            """, (new_status, completed_time, task_id, uid))
            conn.commit()

            cursor.execute("SELECT * FROM revision_tasks WHERE id = ?", (task_id,))
            updated_row = cursor.fetchone()
            return dict(updated_row) if updated_row else None

    # ==========================================
    # USAGE & LIMIT ENFORCEMENT
    # ==========================================
    def get_usage(self, uid: str) -> Dict[str, Any]:
        today_str = date.today().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM usage_records WHERE uid = ? AND usage_date = ?", (uid, today_str))
            row = cursor.fetchone()
            if not row:
                return {
                    "uid": uid,
                    "date": today_str,
                    "study_queries_count": 0,
                    "quiz_generations_count": 0,
                    "estimated_cost_usd": 0.0,
                    "plan_tier": "free",
                    "limits": {
                        "max_daily_study_queries": 15,
                        "max_daily_quizzes": 5,
                        "study_queries_remaining": 15,
                        "quizzes_remaining": 5
                    }
                }
            data = dict(row)

        plan = data.get("plan_tier", "free")
        max_queries = 200 if plan == "student_plus" else 50
        max_quizzes = 50 if plan == "student_plus" else 20

        queries_used = data.get("study_queries_count", 0)
        quizzes_used = data.get("quiz_generations_count", 0)

        data["limits"] = {
            "max_daily_study_queries": max_queries,
            "max_daily_quizzes": max_quizzes,
            "study_queries_remaining": max(0, max_queries - queries_used),
            "quizzes_remaining": max(0, max_quizzes - quizzes_used)
        }
        return data

    def increment_usage(self, uid: str, is_quiz: bool = False, estimated_tokens: int = 500) -> Dict[str, Any]:
        today_str = date.today().isoformat()
        # Approx $0.15 per 1M tokens for gpt-4o-mini / Lyzr lightweight inference
        cost_inc = (estimated_tokens / 1_000_000.0) * 0.15

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO usage_records (uid, usage_date, study_queries_count, quiz_generations_count, estimated_cost_usd, plan_tier)
            VALUES (?, ?, ?, ?, ?, 'free')
            ON CONFLICT(uid, usage_date) DO UPDATE SET
                study_queries_count = study_queries_count + ?,
                quiz_generations_count = quiz_generations_count + ?,
                estimated_cost_usd = estimated_cost_usd + excluded.estimated_cost_usd
            """, (
                uid,
                today_str,
                0 if is_quiz else 1,
                1 if is_quiz else 0,
                cost_inc,
                0 if is_quiz else 1,
                1 if is_quiz else 0
            ))
            conn.commit()

        return self.get_usage(uid)

    def check_limit_exceeded(self, uid: str, is_quiz: bool = False) -> Optional[str]:
        if os.getenv("TESTING_SKIP_USAGE_LIMITS") == "true":
            return None
        usage = self.get_usage(uid)
        limits = usage["limits"]
        if is_quiz:
            if limits["quizzes_remaining"] <= 0:
                return f"Daily quiz limit reached ({limits['max_daily_quizzes']} quizzes/day on Free plan). Upgrade to Student Plus for unlimited quizzes!"
        else:
            if limits["study_queries_remaining"] <= 0:
                tier_label = "Student Plus" if limits.get("max_daily_study_queries", 50) > 50 else "Free plan"
                return f"Daily study question limit reached ({limits['max_daily_study_queries']} questions/day on {tier_label}). Upgrade to Student Plus or reset quota for extended study sessions!"
        return None

    def reset_usage(self, uid: str) -> Dict[str, Any]:
        today_str = date.today().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO usage_records (uid, usage_date, study_queries_count, quiz_generations_count, estimated_cost_usd, plan_tier)
            VALUES (?, ?, 0, 0, 0.0, 'free')
            ON CONFLICT(uid, usage_date) DO UPDATE SET
                study_queries_count = 0,
                quiz_generations_count = 0
            ''', (uid, today_str))
            conn.commit()
        return self.get_usage(uid)

    def set_plan_tier(self, uid: str, plan_tier: str = "student_plus") -> Dict[str, Any]:
        today_str = date.today().isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
            INSERT INTO usage_records (uid, usage_date, study_queries_count, quiz_generations_count, estimated_cost_usd, plan_tier)
            VALUES (?, ?, 0, 0, 0.0, ?)
            ON CONFLICT(uid, usage_date) DO UPDATE SET
                plan_tier = excluded.plan_tier
            ''', (uid, today_str, plan_tier))
            conn.commit()
        return self.get_usage(uid)

    # ==========================================
    # UPGRADE INTEREST REGISTRATION
    # ==========================================
    def register_upgrade_interest(
        self,
        uid: str,
        email: str,
        student_name: Optional[str] = None,
        college_name: Optional[str] = None,
        plan_requested: str = "student_plus",
        notes: Optional[str] = None
    ) -> Dict[str, Any]:
        now_iso = datetime.now(timezone.utc).isoformat()
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO upgrade_interest (uid, email, student_name, college_name, plan_requested, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (uid, email.strip().lower(), student_name, college_name, plan_requested, notes, now_iso))
            lead_id = cursor.lastrowid
            conn.commit()

        logger.info(f"[VAULT] New upgrade interest lead registered: email={email}, plan={plan_requested}")
        return {
            "status": "success",
            "lead_id": lead_id,
            "message": "Thank you! You've been priority-listed for VoiceStudy AI Student Plus. We will notify you once billing activates."
        }

    # ==========================================
    # REAL EXAM READINESS CALCULATION
    # ==========================================
    def calculate_exam_readiness(self, uid: str, total_memories: int) -> Dict[str, Any]:
        """
        Computes a transparent, documented Exam Readiness Score (0-100%):
        - Quiz Accuracy (40% weight): Average score across all completed quiz attempts
        - Syllabus Coverage (30% weight): Stored study memories & topics reviewed
        - Revision Plan Completion (30% weight): Percentage of scheduled tasks checked off
        """
        history = self.get_quiz_history(uid, limit=20)
        tasks_data = self.get_revision_tasks(uid)
        profile = self.get_exam_profile(uid)

        if len(history) < 2:
            needed_quizzes = 2 - len(history)
            actionable_steps = []
            if not profile:
                actionable_steps.append({
                    "step": 1,
                    "action_key": "exam_date",
                    "title": "Set Target Exam Date",
                    "description": "Configure your upcoming exam date and subject to calculate scheduled timeline pacing."
                })
            actionable_steps.append({
                "step": 2 if not profile else 1,
                "action_key": "practice_quiz",
                "title": f"Complete {needed_quizzes} Practice Quiz" + ("zes" if needed_quizzes > 1 else ""),
                "description": f"You need at least 2 completed quizzes to measure genuine recall accuracy ({len(history)}/2 completed)."
            })
            if total_memories < 3:
                actionable_steps.append({
                    "step": len(actionable_steps) + 1,
                    "action_key": "add_notes",
                    "title": "Index Lecture Notes into Vector Memory",
                    "description": f"Currently {total_memories} notes indexed in Qdrant. Add notes to gauge syllabus coverage."
                })

            return {
                "has_sufficient_data": False,
                "readiness_score": None,
                "status_label": "Insufficient Data",
                "notice": f"Authentic readiness score requires at least 2 completed practice quizzes (currently {len(history)}/2) and target exam setup.",
                "missing_data": {
                    "has_exam_target": bool(profile),
                    "quiz_attempts_count": len(history),
                    "quiz_attempts_required": 2,
                    "memories_count": total_memories,
                    "memories_recommended": 3
                },
                "actionable_steps": actionable_steps,
                "components": {
                    "quiz_accuracy": round(sum(h["percentage"] for h in history) / len(history), 1) if history else 0,
                    "syllabus_coverage": min(100.0, (total_memories / 10.0) * 100.0),
                    "task_completion": tasks_data.get("completion_rate", 0.0)
                },
                "total_attempts": len(history),
                "total_memories": total_memories,
                "exam_profile": profile
            }

        # 1. Average accuracy across all quiz attempts (0-100)
        avg_accuracy = sum(h["percentage"] for h in history) / len(history)

        # 2. Syllabus coverage benchmarked against target 10 core topics/memories
        syllabus_score = min(100.0, (total_memories / 10.0) * 100.0)

        # 3. Revision task completion rate (0-100)
        task_completion = tasks_data.get("completion_rate", 0.0)
        if tasks_data["total_tasks"] == 0:
            # If no tasks created yet, use 50% neutral baseline
            task_completion = 50.0

        # Weighted calculation
        readiness = (avg_accuracy * 0.40) + (syllabus_score * 0.30) + (task_completion * 0.30)
        readiness = round(max(0.0, min(100.0, readiness)), 1)

        # Collect unique weak topics across recent attempts
        all_weaks = []
        for h in history:
            all_weaks.extend(h.get("weak_topics", []))
        unique_weaks = list(dict.fromkeys(all_weaks))[:5]

        if readiness >= 80:
            status_label = "Exam Ready"
        elif readiness >= 60:
            status_label = "On Track"
        elif readiness >= 40:
            status_label = "Needs Revision"
        else:
            status_label = "Critical Focus Needed"

        return {
            "has_sufficient_data": True,
            "readiness_score": readiness,
            "status_label": status_label,
            "components": {
                "quiz_accuracy": round(avg_accuracy, 1),
                "syllabus_coverage": round(syllabus_score, 1),
                "task_completion": round(task_completion, 1)
            },
            "formula_explanation": "Readiness = (Quiz Accuracy × 40%) + (Syllabus Coverage × 30%) + (Task Completion × 30%)",
            "total_attempts": len(history),
            "average_quiz_score": round(avg_accuracy, 1),
            "weak_topics": unique_weaks,
            "exam_profile": profile,
            "total_memories": total_memories
        }

# Global singleton instance
study_vault = StudyVaultService()
