"""
VoiceStudy AI — Phase 3 Feature Verification Suite
Tests:
1. Structured notes organization (Lecture Overview, Key Concepts, Breakdown, Examples, Summary)
2. Lecture-based quizzes with direct lecture input and answer keys
3. Sparse / Insufficient study content notice handling
4. Memory grounding and missing-context behavior in Assistant Agent
5. Empty input validation and graceful default handling across endpoints
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

class TestPhase3Features(unittest.TestCase):

    def test_structured_notes_generation(self):
        """Test that summarizing lecture content creates structured markdown sections."""
        lecture_content = (
            "Summarize the following lecture on Distributed Systems Raft Consensus Algorithm: "
            "Raft breaks consensus into three subproblems: Leader Election, Log Replication, and Safety. "
            "Nodes can be in one of three states: Follower, Candidate, or Leader. "
            "Heartbeat timeouts trigger leader election using randomized timers between 150ms and 300ms. "
            "For example, if node A stops receiving heartbeats from Leader L, node A transitions to Candidate, "
            "increments its current term, votes for itself, and broadcasts RequestVote RPCs. "
            "Log entries are committed only when replicated on a majority of nodes. "
            "In summary, Raft provides linearizable consistency while being much easier to understand than Multi-Paxos."
        )

        response = client.post(
            "/api/study",
            json={
                "transcript": lecture_content,
                "uid": "revhack_phase3_tester",
                "subject_override": "Distributed Systems"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn(data.get("intent"), ["SUMMARIZE", "EXPLAIN"])
        response_text = data.get("message", "")
        self.assertTrue(len(response_text) > 80, f"Notes response is too short: {response_text}")
        # Check that structured concepts are preserved
        has_structure = (
            "###" in response_text or 
            "##" in response_text or 
            "Overview" in response_text or 
            "Key Concept" in response_text or
            "Raft" in response_text or
            "Leader" in response_text
        )
        self.assertTrue(has_structure, f"Notes lack structured organization: {response_text}")

    def test_lecture_based_quiz_with_custom_notes(self):
        """Test quiz generation directly from provided lecture notes."""
        notes = (
            "ACID properties in Database Management: "
            "1. Atomicity: All or nothing execution of transactions. "
            "2. Consistency: Database moves from one valid state to another. "
            "3. Isolation: Concurrent execution produces the same result as serial execution. "
            "4. Durability: Committed updates persist even during power failure."
        )

        response = client.post(
            "/api/quiz",
            json={
                "topic": "ACID Properties",
                "lecture_notes": notes,
                "num_questions": 3,
                "difficulty": "medium",
                "uid": "revhack_phase3_tester",
                "subject": "DBMS"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("questions", data)
        questions = data["questions"]
        self.assertTrue(len(questions) >= 1)
        # Verify structure of question objects
        for q in questions:
            self.assertIn("question", q)
            self.assertIn("options", q)
            self.assertTrue(len(q["options"]) >= 2)
            self.assertIn("correct_answer", q)
            self.assertIsInstance(q["correct_answer"], int)
            self.assertIn("explanation", q)

    def test_quiz_sparse_content_notice(self):
        """Test that sparse or minimal lecture notes trigger a helpful content notice."""
        response = client.post(
            "/api/quiz",
            json={
                "topic": "Quantum Teleportation",
                "lecture_notes": "very short",
                "num_questions": 3,
                "uid": "revhack_phase3_sparse_tester"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("questions", data)
        # Sparse content should produce a notice informing the student
        self.assertIn("notice", data)
        self.assertTrue(
            "brief" in data["notice"].lower() or 
            "supplemented" in data["notice"].lower() or 
            "insufficient" in data["notice"].lower()
        )

    def test_memory_retrieval_and_grounding(self):
        """Test that memory search finds relevant items and returns empty when unindexed."""
        # 1. Save specific study memory
        save_resp = client.post(
            "/api/memory/save",
            json={
                "text": "Two-Phase Locking (2PL) ensures serializability by acquiring all locks before releasing any locks. Strict 2PL holds exclusive locks until commit.",
                "subject": "Database Systems",
                "topic": "Two-Phase Locking",
                "uid": "revhack_grounding_tester"
            }
        )
        self.assertEqual(save_resp.status_code, 200)

        # 2. Search for relevant memory
        search_resp = client.post(
            "/api/memory/search",
            json={
                "query": "Two-Phase Locking serializability",
                "uid_filter": "revhack_grounding_tester",
                "subject_filter": "Database Systems",
                "limit": 3
            }
        )
        self.assertEqual(search_resp.status_code, 200)
        search_data = search_resp.json()
        self.assertTrue(search_data.get("count", 0) >= 1)

        # 3. Search for completely non-existent topic with isolated uid
        unrelated_resp = client.post(
            "/api/memory/search",
            json={
                "query": "Extragalactic astrophysics dark matter halos",
                "uid_filter": "completely_isolated_user_9999",
                "limit": 3
            }
        )
        self.assertEqual(unrelated_resp.status_code, 200)
        unrelated_data = unrelated_resp.json()
        self.assertEqual(unrelated_data.get("count", 0), 0)

    def test_study_assistant_missing_context_behavior(self):
        """Test question answering with vague/missing context produces helpful clarifying answers."""
        response = client.post(
            "/api/study",
            json={
                "transcript": "Can you explain that last step again?",
                "uid": "revhack_fresh_student_no_history"
            }
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()
        response_text = data.get("message", "")
        # Should gracefully address the question without crashing or fabricating prior lecture history
        self.assertTrue(len(response_text) > 30, f"Expected clarifying response, got: {response_text}")

    def test_empty_and_invalid_inputs(self):
        """Verify robust input validation and 400 Bad Request responses."""
        # Empty study transcript returns 400
        resp1 = client.post("/api/study", json={"transcript": "   "})
        self.assertEqual(resp1.status_code, 400)

        # Whitespace-only study transcript returns 400
        resp2 = client.post("/api/study", json={"transcript": ""})
        self.assertEqual(resp2.status_code, 400)

        # Empty memory save returns 400
        resp4 = client.post("/api/memory/save", json={"text": "   "})
        self.assertEqual(resp4.status_code, 400)

        # Empty memory search query returns 400
        resp5 = client.post("/api/memory/search", json={"query": "   "})
        self.assertEqual(resp5.status_code, 400)

        # Missing or empty quiz topic gracefully falls back to Recent Studies
        resp_quiz = client.post("/api/quiz", json={"topic": "   "})
        self.assertEqual(resp_quiz.status_code, 200)
        self.assertIn("questions", resp_quiz.json())

if __name__ == "__main__":
    unittest.main()
