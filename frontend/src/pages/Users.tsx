import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Users() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token, user } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');

  const fetchUsers = () => {
    fetch(`${API_URL}/api/v1/tenants/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/v1/tenants/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: newEmail })
      });
      setShowModal(false);
      setNewEmail('');
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">User Management</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          + Invite User
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Last Login</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading users...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No users found.</td></tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shadow-lg">
                        {u.email?.[0].toUpperCase()}
                      </div>
                      <span className="text-slate-200 font-medium">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs">
                      {user?.id === u.id ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 text-emerald-400`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400`}></span>
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-xs">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="text-slate-400 hover:text-white transition-colors">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Invite User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Invite User</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input 
                  required
                  type="email" 
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                  placeholder="analyst@yourdomain.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                <select className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none">
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">The user will receive an email to set their password.</p>
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
