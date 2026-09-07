import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

const RULE_TYPES = [
  { value: 'regex', label: 'Regex Match' },
  { value: 'exact_match', label: 'Exact Match' },
  { value: 'threshold', label: 'Threshold Check' },
  { value: 'severity', label: 'Severity Match' },
];

const OPERATORS = [
  { value: 'gt', label: '>' },
  { value: 'gte', label: '>=' },
  { value: 'lt', label: '<' },
  { value: 'lte', label: '<=' },
  { value: 'eq', label: '=' },
];

const SEVERITY_OPTIONS = ['info', 'medium', 'high', 'critical'];

const emptyConfig = (type: string) => {
  switch (type) {
    case 'regex':       return { field: 'description', pattern: '', flags: 'i' };
    case 'exact_match': return { field: 'event_type', value: '' };
    case 'threshold':   return { field: 'raw_data.bytes', operator: 'gt', value: 0 };
    case 'severity':    return { value: 'high' };
    default:            return {};
  }
};

export default function Rules() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const { token } = useAuthStore();
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRule, setNewRule] = useState<{ name: string; rule_type: string; rule_config: any }>({
    name: '',
    rule_type: 'regex',
    rule_config: emptyConfig('regex'),
  });

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

  const handleTypeChange = (type: string) => {
    setNewRule({ ...newRule, rule_type: type, rule_config: emptyConfig(type) });
  };

  const updateConfig = (patch: any) => {
    setNewRule({ ...newRule, rule_config: { ...newRule.rule_config, ...patch } });
  };

  const handleCreateRule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/api/v1/detection/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(newRule)
      });
      setShowModal(false);
      setNewRule({ name: '', rule_type: 'regex', rule_config: emptyConfig('regex') });
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

  const renderConfigSummary = (rule: any) => {
    const c = rule.rule_config || {};
    switch (rule.rule_type) {
      case 'regex':       return <span className="font-mono text-xs text-slate-400">{c.field || 'description'} ~= /{c.pattern}/{c.flags || ''}</span>;
      case 'exact_match': return <span className="font-mono text-xs text-slate-400">{c.field} == "{c.value}"</span>;
      case 'threshold':   return <span className="font-mono text-xs text-slate-400">{c.field} {c.operator} {c.value}</span>;
      case 'severity':    return <span className="font-mono text-xs text-slate-400">severity == "{c.value}"</span>;
      default:            return <span className="font-mono text-xs text-slate-500">{JSON.stringify(c)}</span>;
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
              <th className="px-6 py-4 font-medium">Configuration</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50 text-sm">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading rules...</td></tr>
            ) : rules.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No custom rules configured.</td></tr>
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
                  <td className="px-6 py-4">
                    {renderConfigSummary(rule)}
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
                  onChange={e => setNewRule({ ...newRule, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                  placeholder="e.g. Suspicious SSH Login"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Rule Type</label>
                <select
                  value={newRule.rule_type}
                  onChange={e => handleTypeChange(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                >
                  {RULE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Dynamic config fields per rule type */}
              {newRule.rule_type === 'regex' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Field to match</label>
                    <input
                      type="text"
                      value={newRule.rule_config.field}
                      onChange={e => updateConfig({ field: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="description | title | event_type | raw_data.x"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Regex Pattern</label>
                    <input
                      required
                      type="text"
                      value={newRule.rule_config.pattern}
                      onChange={e => updateConfig({ pattern: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="e.g. .*Failed password for root.*"
                    />
                  </div>
                </>
              )}

              {newRule.rule_type === 'exact_match' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Field</label>
                    <input
                      required
                      type="text"
                      value={newRule.rule_config.field}
                      onChange={e => updateConfig({ field: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="event_type | source | raw_data.x"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Value</label>
                    <input
                      required
                      type="text"
                      value={newRule.rule_config.value}
                      onChange={e => updateConfig({ value: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="e.g. aws:cloudtrail:DeleteBucket"
                    />
                  </div>
                </>
              )}

              {newRule.rule_type === 'threshold' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Field (numeric)</label>
                    <input
                      required
                      type="text"
                      value={newRule.rule_config.field}
                      onChange={e => updateConfig({ field: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                      placeholder="e.g. raw_data.bytes"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Operator</label>
                      <select
                        value={newRule.rule_config.operator}
                        onChange={e => updateConfig({ operator: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                      >
                        {OPERATORS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">Value</label>
                      <input
                        required
                        type="number"
                        value={newRule.rule_config.value}
                        onChange={e => updateConfig({ value: Number(e.target.value) })}
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none font-mono text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {newRule.rule_type === 'severity' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                  <select
                    value={newRule.rule_config.value}
                    onChange={e => updateConfig({ value: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                  >
                    {SEVERITY_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

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
