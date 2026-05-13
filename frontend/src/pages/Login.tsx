import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        const response = await fetch(`${API_URL}/api/v1/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, orgName }),
        });
        if (!response.ok) throw new Error('Registration failed');
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        useAuthStore.getState().setUser(data.user);
        navigate('/overview');
      } else {
        await login(email, password);
        navigate('/overview');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">SentinelX</h1>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
            {isRegistering ? 'Create your organization' : 'Sign in to your account'}
          </p>
          
          {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegistering && (
              <input
                type="text"
                placeholder="Organization Name"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
              />
            )}
            
            <input
              type="email"
              placeholder="Email address"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors">
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-500 hover:text-blue-400 font-semibold">
              {isRegistering ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
