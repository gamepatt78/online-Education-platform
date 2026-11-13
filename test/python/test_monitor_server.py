import importlib.util
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[2]
MONITOR_SERVER = ROOT / "design" / "monitor_server.py"
TEST_TOKEN = "test-monitor-token-" + ("x" * 32)


class MonitorServerAuthorizationTests(unittest.TestCase):
    def setUp(self):
        self.working_directory = os.getcwd()
        self.temporary_directory = tempfile.TemporaryDirectory()
        os.chdir(self.temporary_directory.name)
        self.token_environment = patch.dict(os.environ, {"MONITOR_SERVER_TOKEN": TEST_TOKEN})
        self.token_environment.start()

        spec = importlib.util.spec_from_file_location("monitor_server_under_test", MONITOR_SERVER)
        self.monitor_server = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.monitor_server)
        self.client = self.monitor_server.app.test_client()

    def tearDown(self):
        self.token_environment.stop()
        self.monitor_server.db.close()
        os.chdir(self.working_directory)
        self.temporary_directory.cleanup()

    def test_log_endpoints_require_a_valid_bearer_token(self):
        self.assertEqual(self.client.get("/api/logs").status_code, 401)
        self.assertEqual(
            self.client.post("/api/log", json={"event": "test"}).status_code,
            401,
        )
        self.assertEqual(
            self.client.get(
                "/api/logs",
                headers={"Authorization": "Bearer invalid-token"},
            ).status_code,
            401,
        )

    def test_valid_token_can_write_and_read_logs(self):
        headers = {"Authorization": f"Bearer {TEST_TOKEN}"}
        response = self.client.post(
            "/api/log",
            json={"student": "test@example.com", "event": "practice"},
            headers=headers,
        )
        self.assertEqual(response.status_code, 200)

        logs = self.client.get("/api/logs", headers=headers)
        self.assertEqual(logs.status_code, 200)
        self.assertEqual(logs.get_json()[0]["event"], "practice")

    def test_unconfigured_or_short_token_disables_endpoints(self):
        for configured_token in ("", "too-short"):
            with self.subTest(configured_token=configured_token):
                with patch.dict(os.environ, {"MONITOR_SERVER_TOKEN": configured_token}):
                    response = self.client.get(
                        "/api/logs",
                        headers={"Authorization": f"Bearer {TEST_TOKEN}"},
                    )
                self.assertEqual(response.status_code, 503)


if __name__ == "__main__":
    unittest.main()
