import json
import unittest
from app import app
from db import db

class PrabhaApiTestCase(unittest.TestCase):
    def setUp(self):
        """Set up test client before each test."""
        # Enable Flask testing configuration
        app.config['TESTING'] = True
        self.app = app.test_client()
        
    def test_health_check(self):
        """Test the home health check route."""
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data.decode(), 'Prabha Signs & Stickers API is running...')

    def test_get_settings(self):
        """Test getting settings returns JSON object."""
        response = self.app.get('/api/settings')
        self.assertEqual(response.status_code, 200)
        # Ensure the response is valid JSON
        data = json.loads(response.data.decode())
        self.assertIsInstance(data, dict)

    def test_get_stickers(self):
        """Test getting stickers returns JSON list."""
        response = self.app.get('/api/stickers')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data.decode())
        self.assertIsInstance(data, list)

    def test_admin_login_invalid_credentials(self):
        """Test that invalid login credentials return 401."""
        login_data = {
            'username': 'non_existent_admin_user_123',
            'password': 'wrongpassword'
        }
        response = self.app.post(
            '/api/admin/login',
            data=json.dumps(login_data),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 401)
        data = json.loads(response.data.decode())
        self.assertIn('message', data)
        self.assertEqual(data['message'], 'Invalid username or password')

    def test_admin_register_missing_fields(self):
        """Test that register with missing parameters returns 400."""
        # Send empty request body
        response = self.app.post(
            '/api/admin/register',
            data=json.dumps({}),
            content_type='application/json'
        )
        self.assertEqual(response.status_code, 400)
        data = json.loads(response.data.decode())
        self.assertIn('message', data)

if __name__ == '__main__':
    unittest.main()
