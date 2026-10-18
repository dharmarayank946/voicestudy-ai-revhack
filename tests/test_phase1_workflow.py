import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.memory.qdrant_service import memory_service

client = TestClient(app)

class TestPhase1Workflow(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        memory_service._ensure_active_client()

    def test_01_study_empty_input_validation(self):
        """Verify empty and whitespace study input returns 400 error."""
        for empty_val in ["", "   ", "\n\t"]:
            res = client.post("/api/study", json={"transcript": empty_val})
            self.assertEqual(res.status_code, 400)
            self.assertIn("cannot be empty", res.json().get("detail", ""))

    def test_02_study_valid_input_and_history(self):
        """Verify valid study request with conversation history returns proper response."""
        history = [
            {"role": "user", "content": "What is Strict 2PL?"},
            {"role": "assistant", "content": "Strict 2PL is a concurrency control protocol."}
        ]
        res = client.post("/api/study", json={
            "transcript": "Why is it important in DBMS?",
            "source": "text_fallback",
            "subject_override": "DBMS",
            "topic_override": "Concurrency Control",
            "history": history,
            "uid": "test_phase1_user"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("intent", data)
        self.assertIn("message", data)
        self.assertTrue(len(data["message"]) > 0)
        self.assertEqual(data.get("orchestration", {}).get("subject"), "DBMS")

    def test_03_memory_save_and_retrieval_workflow(self):
        """Verify lecture-to-notes workflow: saving note, searching, and deleting."""
        user_uid = "phase1_test_student_101"
        test_text = "Phase 1 Lecture on ACID transactions: Atomicity, Consistency, Isolation, Durability."
        
        # 1. Save memory
        save_res = client.post("/api/memory/save", json={
            "text": test_text,
            "subject": "DBMS",
            "topic": "ACID Properties",
            "memory_type": "lecture_note",
            "uid": user_uid
        })
        self.assertEqual(save_res.status_code, 200)
        saved_id = save_res.json().get("id")
        self.assertIsNotNone(saved_id)

        try:
            # 2. Search memory with semantic query and UID filter
            search_res = client.post("/api/memory/search", json={
                "query": "ACID properties",
                "uid_filter": user_uid,
                "limit": 5
            })
            self.assertEqual(search_res.status_code, 200)
            results = search_res.json().get("results", [])
            self.assertTrue(len(results) > 0)
            self.assertEqual(results[0]["id"], saved_id)
            self.assertEqual(results[0]["uid"], user_uid)

            # 3. Retrieve recent memories with subject filter
            recent_res = client.get(f"/api/memory/recent?uid_filter={user_uid}&subject_filter=DBMS")
            self.assertEqual(recent_res.status_code, 200)
            recent_list = recent_res.json().get("memories", [])
            self.assertTrue(any(m["id"] == saved_id for m in recent_list))
        finally:
            # 4. Clean up / delete memory
            del_res = client.delete(f"/api/memory/{saved_id}")
            self.assertEqual(del_res.status_code, 200)

    def test_04_memory_empty_text_validation(self):
        """Verify memory save validates non-empty text."""
        res = client.post("/api/memory/save", json={
            "text": "   ",
            "subject": "General"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("cannot be empty", res.json().get("detail", ""))

    def test_05_quiz_generation_with_lecture_notes_and_uid(self):
        """Verify quiz generation properly supports uid and lecture_notes grounding."""
        lecture_notes = "Virtual memory uses page tables to map virtual addresses to physical frames. Page faults happen when a page is not in RAM."
        res = client.post("/api/quiz", json={
            "topic": "Virtual Memory and Paging",
            "num_questions": 3,
            "difficulty": "medium",
            "uid": "phase1_test_student_101",
            "lecture_notes": lecture_notes,
            "subject": "Operating Systems"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "success")
        self.assertEqual(len(data.get("questions", [])), 3)
        for q in data["questions"]:
            self.assertIn("question", q)
            self.assertIn("options", q)
            self.assertIn("correct_answer", q)
            self.assertIn("explanation", q)
            self.assertEqual(len(q["options"]), 4)

    def test_06_quiz_count_clamping(self):
        """Verify quiz question counts clamp to valid boundaries [3, 10]."""
        # Under minimum 3 -> clamps to 3
        res_low = client.post("/api/quiz", json={"topic": "Paging", "num_questions": 1})
        self.assertEqual(res_low.status_code, 200)
        self.assertEqual(len(res_low.json().get("questions", [])), 3)

        # Over maximum 10 -> clamps to 10
        res_high = client.post("/api/quiz", json={"topic": "Paging", "num_questions": 20})
        self.assertEqual(res_high.status_code, 200)
        self.assertEqual(len(res_high.json().get("questions", [])), 10)

    def test_07_health_endpoint_intact(self):
        """Verify health check endpoint reports status and dependencies."""
        res = client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data.get("status"), "healthy")
        self.assertIn("vector_memory", data)
        self.assertIn("agents", data)
        self.assertIn("voice", data)

if __name__ == "__main__":
    unittest.main()
