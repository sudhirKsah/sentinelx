import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Alerts() {
  const API_URL = import.meta.env.VITE_API_URL;
  const { token } = useAuthStore();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, [token]);

  const fetchAlerts = () => {
    fetch(`${API_URL}/api/v1/alerts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAlerts(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    try {
      await fetch(`${API_URL}/api/v1/alerts/${alertId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchAlerts();
    } catch (err) {
      console.error('Error updating alert:', err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-tight">Security Alerts</h1>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-xs uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4 font-medium">Severity</th>
                <th className="px-6 py-4 font-medium">Alert Details</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Time</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">Loading alerts...</td></tr>
              ) : alerts.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No alerts found.</td></tr>
              ) : (
                alerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        alert.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                        alert.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {alert.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200 font-medium">{alert.title}</p>
                      <p className="text-slate-500 text-xs mt-1 line-clamp-1 max-w-md">{alert.description}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 ${
                        alert.status === 'new' ? 'text-blue-400' : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${alert.status === 'new' ? 'bg-blue-400' : 'bg-slate-500'}`}></span>
                        <span className="capitalize">{alert.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-slate-400 font-mono text-xs">
                      {new Date(alert.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {alert.status === 'new' ? (
                        <button 
                          onClick={() => handleUpdateStatus(alert.id, 'acknowledged')}
                          className="text-orange-400 hover:text-orange-300 text-xs font-medium bg-orange-500/10 hover:bg-orange-500/20 px-3 py-1.5 rounded transition-colors"
                        >
                          Acknowledge
                        </button>
                      ) : alert.status === 'acknowledged' ? (
                        <button 
                          onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                          className="text-emerald-400 hover:text-emerald-300 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded transition-colors"
                        >
                          Resolve
                        </button>
                      ) : (
                        <span className="text-slate-500 text-xs">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
