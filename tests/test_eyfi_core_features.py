import unittest
import uuid
from fastapi.testclient import TestClient
from backend.main import app
from backend.memory.study_vault import study_vault

client = TestClient(app)

class TestEYFICoreFeatures(unittest.TestCase):
    def setUp(self):
        self.test_uid = "test_eyfi_student_01"

    def test_exam_setup_and_profile_retrieval(self):
        """Verify saving exam profile and retrieving countdown."""
        resp = client.post("/api/exam/setup", json={
            "target_subject": "Operating Systems",
            "exam_title": "End-Semester OS Finals",
            "exam_date": "2026-11-20T09:00:00Z",
            "daily_study_hours": 3.0,
            "confidence_level": 4,
            "uid": self.test_uid
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        profile = data["profile"]
        self.assertEqual(profile["target_subject"], "Operating Systems")
        self.assertEqual(profile["daily_study_hours"], 3.0)
        self.assertIn("days_remaining", profile)

        # Retrieve profile
        get_resp = client.get(f"/api/exam/profile?uid={self.test_uid}")
        self.assertEqual(get_resp.status_code, 200)
        self.assertTrue(get_resp.json()["has_profile"])
        self.assertEqual(get_resp.json()["profile"]["exam_title"], "End-Semester OS Finals")

    def test_quiz_backend_scoring_and_persistence(self):
        """Verify backend scoring, weak topic detection, and persistence in study vault."""
        sample_questions = [
            {
                "question": "What is the primary objective of Strict Two-Phase Locking?",
                "options": ["Prevent cascading aborts", "Speed up disk I/O", "Enable distributed routing", "Normalize tables"],
                "correct_answer": 0,
                "topic": "Strict 2PL Protocols"
            },
            {
                "question": "Which page replacement algorithm suffers from Belady's Anomaly?",
                "options": ["LRU", "FIFO", "Optimal", "LFU"],
                "correct_answer": 1,
                "topic": "Paging Anomalies"
            },
            {
                "question": "What layer does TCP operate at in the OSI model?",
                "options": ["Application", "Network", "Transport", "Data Link"],
                "correct_answer": 2,
                "topic": "Transport Layer"
            }
        ]

        # Submit answers: Question 0 is correct, Question 1 is wrong (answered 0 instead of 1), Question 2 is correct
        resp = client.post("/api/quiz/submit", json={
            "topic": "OS & Networks Test",
            "difficulty": "medium",
            "questions": sample_questions,
            "user_answers": {"0": 0, "1": 0, "2": 2},
            "uid": self.test_uid
        })
        self.assertEqual(resp.status_code, 200)
        result = resp.json()
        self.assertEqual(result["status"], "success")
        self.assertEqual(result["score"], 2)
        self.assertEqual(result["total_questions"], 3)
        self.assertEqual(result["percentage"], 66.7)
        # Verify weak topic extracted from incorrect answer
        self.assertTrue(len(result["weak_topics"]) > 0)
        self.assertIn("recommendation", result)

        # Verify it appears in quiz history
        hist_resp = client.get(f"/api/quiz/history?uid={self.test_uid}")
        self.assertEqual(hist_resp.status_code, 200)
        hist_data = hist_resp.json()
        self.assertTrue(hist_data["total_attempts"] >= 1)

    def test_revision_plan_generation_and_task_toggle(self):
        """Verify dynamic revision task scheduling and toggle completion."""
        gen_resp = client.post("/api/revision-plan/generate", json={
            "uid": self.test_uid,
            "subject": "Operating Systems"
        })
        self.assertEqual(gen_resp.status_code, 200)
        plan_data = gen_resp.json()
        self.assertEqual(plan_data["status"], "success")
        self.assertTrue(len(plan_data["tasks"]) > 0)

        # Retrieve tasks
        get_plan = client.get(f"/api/revision-plan?uid={self.test_uid}")
        self.assertEqual(get_plan.status_code, 200)
        tasks = get_plan.json()
        self.assertTrue(tasks["total_tasks"] > 0)

        first_task = tasks["today_tasks"][0] if tasks["today_tasks"] else tasks["upcoming_tasks"][0]
        task_id = first_task["id"]

        # Toggle task
        toggle_resp = client.post("/api/revision-plan/task/toggle", json={
            "task_id": task_id,
            "uid": self.test_uid
        })
        self.assertEqual(toggle_resp.status_code, 200)
        self.assertEqual(toggle_resp.json()["task"]["is_completed"], 1)

    def test_exam_readiness_calculation(self):
        """Verify transparent readiness calculation with insufficient and sufficient data states."""
        readiness_uid = f"uid_readiness_{uuid.uuid4().hex[:8]}"

        # 1. Zero attempts -> insufficient data
        resp_insufficient = client.get(f"/api/progress/readiness?uid={readiness_uid}")
        self.assertEqual(resp_insufficient.status_code, 200)
        self.assertFalse(resp_insufficient.json()["has_sufficient_data"])
        self.assertEqual(resp_insufficient.json()["status_label"], "Insufficient Data")

        # 2. Add 2 quiz attempts -> sufficient data
        for i in range(2):
            client.post("/api/quiz/submit", json={
                "topic": f"OS Topic {i+1}",
                "difficulty": "medium",
                "questions": [
                    {"question": "Q1", "options": ["A", "B"], "correct_answer": 0, "topic": "Concurrency"},
                    {"question": "Q2", "options": ["A", "B"], "correct_answer": 1, "topic": "Deadlocks"}
                ],
                "user_answers": {"0": 0, "1": 1},
                "uid": readiness_uid
            })

        resp_sufficient = client.get(f"/api/progress/readiness?uid={readiness_uid}")
        self.assertEqual(resp_sufficient.status_code, 200)
        data = resp_sufficient.json()
        self.assertTrue(data["has_sufficient_data"])
        self.assertGreaterEqual(data["readiness_score"], 0)
        self.assertIn("formula_explanation", data)
        self.assertIn("status_label", data)

    def test_usage_limits_and_upgrade_interest(self):
        """Verify usage tracking and student waitlist registration."""
        usage_resp = client.get(f"/api/usage/status?uid={self.test_uid}")
        self.assertEqual(usage_resp.status_code, 200)
        usage = usage_resp.json()
        self.assertEqual(usage["plan_tier"], "free")
        self.assertIn("limits", usage)

        # Register upgrade interest
        lead_resp = client.post("/api/usage/upgrade-interest", json={
            "email": "student@college.edu",
            "student_name": "Rohan Kumar",
            "college_name": "RV College of Engineering",
            "plan_requested": "student_plus",
            "uid": self.test_uid
        })
        self.assertEqual(lead_resp.status_code, 200)
        self.assertEqual(lead_resp.json()["status"], "success")

    def test_study_analyzer_endpoint(self):
        """Verify the Lecture & Meeting Intelligence Analyzer endpoint."""
        resp = client.post("/api/study/analyze", json={
            "transcript": "In today's Operating Systems lecture on Virtual Memory, we discussed Paging and Page Faults. Task 1: Complete assignment 3 by Friday. Task 2: Review LRU replacement algorithm before next lab.",
            "analysis_type": "all",
            "subject": "Operating Systems",
            "uid": self.test_uid
        })
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data["status"], "success")
        self.assertIn("summary", data)
        self.assertIn("action_items", data)
        self.assertIn("key_terms", data)
        self.assertGreater(len(data["summary"]), 0)

if __name__ == "__main__":
    unittest.main()
