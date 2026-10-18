"""
Unit tests for VoiceStudy AI Subject Library & Student Dashboard Integration.
Verifies subject override routing, multi-discipline memory tagging, and dashboard statistics.
"""

import unittest
from fastapi.testclient import TestClient
from backend.main import app

class TestSubjectLibraryAndDashboard(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_dashboard_health_and_subject_categories(self):
        """Verify health check returns active services and correct status."""
        response = self.client.get("/api/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("vector_memory", data)
        self.assertIn("agents", data)

    def test_study_request_with_subject_library_tag(self):
        """Verify study request accepts a subject category tag and routes cleanly."""
        payload = {
            "transcript": "Explain the difference between microeconomics and macroeconomics.",
            "source": "text_fallback",
            "subject_override": "Micro and Macroeconomics",
            "uid": "test_subject_student_101"
        }
        response = self.client.post("/api/study", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("message", data)
        self.assertIn("intent", data)
        # Verify subject is preserved in orchestration
        self.assertEqual(data.get("orchestration", {}).get("subject"), "Micro and Macroeconomics")

    def test_save_and_retrieve_subject_memory(self):
        """Verify saving notes under different subject library disciplines and filtering."""
        save_payload = {
            "text": "Pharmacokinetics involves absorption, distribution, metabolism, and excretion (ADME) of drugs.",
            "subject": "Pharmacology",
            "topic": "ADME Principles",
            "category": "study_note",
            "uid": "test_subject_student_101"
        }
        save_res = self.client.post("/api/memory/save", json=save_payload)
        self.assertEqual(save_res.status_code, 200)
        saved_id = save_res.json().get("id")

        # Query recent memories filtered by Pharmacology
        recent_res = self.client.get("/api/memory/recent?uid_filter=test_subject_student_101&subject_filter=Pharmacology")
        self.assertEqual(recent_res.status_code, 200)
        recent_data = recent_res.json()
        self.assertTrue(len(recent_data["memories"]) >= 1)
        self.assertEqual(recent_data["memories"][0]["subject"], "Pharmacology")

        # Clean up
        if saved_id:
            del_res = self.client.delete(f"/api/memory/{saved_id}")
            self.assertEqual(del_res.status_code, 200)

    def test_empty_input_validation(self):
        """Verify empty study inputs are rejected with 400 Bad Request."""
        response = self.client.post("/api/study", json={"transcript": "   ", "source": "text_fallback"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("cannot be empty", response.json()["detail"])

if __name__ == "__main__":
    unittest.main()
