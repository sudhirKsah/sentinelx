import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Rules() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', rule_type: 'regex', rule_config: { pattern: '' } });

  const fetchRules = () => {
    fetch(`${API_URL}/api/v1/detection/rules`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRules(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/v1/detection/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newRule)
      });
      setShowModal(false);
      setNewRule({ name: '', rule_type: 'regex', rule_config: { pattern: '' } });
      fetchRules();
    } catch (err) {
      console.error('Error creating rule', err);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`${API_URL}/api/v1/detection/rules/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ enabled: !currentStatus })
      });
      fetchRules();
    } catch (err) {
      console.error('Error toggling rule status', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Detection Rules</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          + Create Rule
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
              <th className="px-6 py-4 font-medium">Rule Name</th>
              <th className="px-6 py-4 font-medium">Type</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {loading ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">Loading rules...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">No custom rules configured.</td></tr>
            ) : (
              rules.map(rule => (
                <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-slate-200 font-medium">
                    {rule.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-full text-xs font-mono">
                      {rule.rule_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 ${rule.enabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${rule.enabled ? 'bg-emerald-400' : 'bg-slate-500'}`}></span>
                      {rule.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => handleToggleStatus(rule.id, rule.enabled)}
                      className={`${rule.enabled ? 'text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20' : 'text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20'} px-3 py-1.5 rounded transition-colors text-xs font-medium`}
                    >
                      {rule.enabled ? 'Disable' : 'Enable'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Rule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Detection Rule</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreateRule} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rule Name</label>
                <input 
                  required
                  type="text" 
                  value={newRule.name}
                  onChange={e => setNewRule({...newRule, name: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                  placeholder="e.g. Suspicious SSH Login"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rule Type</label>
                <select 
                  value={newRule.rule_type}
                  onChange={e => setNewRule({...newRule, rule_type: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                >
                  <option value="regex">Regex Match</option>
                  <option value="threshold">Threshold Check</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Pattern / Config</label>
                <input 
                  required
                  type="text" 
                  value={newRule.rule_config.pattern}
                  onChange={e => setNewRule({...newRule, rule_config: { pattern: e.target.value }})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                  placeholder="e.g. .*Failed password for root.*"
                />
              </div>
              
              <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
