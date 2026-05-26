import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await axios.post(`${API_URL}/admin/login`, { username, password });
      localStorage.setItem('adminToken', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      if (err?.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err?.code === 'ECONNABORTED' || err?.message?.includes('Network')) {
        setError(`Cannot reach API at ${API_URL}. The Render free-tier backend may be cold-starting — try again in 30s.`);
      } else {
        setError(err?.message || 'Login failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-surface-container flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-display font-bold text-primary mb-6 text-center">Admin Login</h2>
        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Username</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-on-surface mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 border border-outline-variant rounded-lg focus:outline-none focus:border-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Login to Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}
