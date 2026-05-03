import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Incidents() {
  const { token } = useAuthStore();
  const [incidents, setIncidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newIncident, setNewIncident] = useState({ title: '', description: '', severity: 'high' });

  const fetchIncidents = () => {
    fetch('http://localhost:3000/api/v1/incidents', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setIncidents(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchIncidents();
  }, [token]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:3000/api/v1/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newIncident)
      });
      setShowModal(false);
      setNewIncident({ title: '', description: '', severity: 'high' });
      fetchIncidents();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Incidents</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-all"
        >
          + Create Manual Incident
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {['open', 'investigating', 'resolved'].map(status => (
          <div key={status} className="flex flex-col bg-slate-900/50 rounded-2xl p-4 border border-slate-800 min-h-[500px]">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2 capitalize">
              {status} <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full ml-2 text-xs">{incidents.filter(i => i.status === status).length}</span>
            </h3>
            
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar px-1">
              {loading ? (
                <p className="text-slate-600 text-center text-sm mt-10">Loading...</p>
              ) : (
                incidents.filter(i => i.status === status).map(incident => (
                  <div key={incident.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-500 cursor-pointer shadow-lg transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-slate-900 border ${
                        incident.severity === 'critical' ? 'text-red-400 border-red-500/30' : 'text-orange-400 border-orange-500/30'
                      }`}>
                        {incident.severity}
                      </span>
                      <span className="text-slate-500 text-xs font-mono group-hover:text-slate-300 transition-colors">#{incident.id.substring(0,6)}</span>
                    </div>
                    <h4 className="text-slate-200 font-semibold text-sm mb-2">{incident.title}</h4>
                    <p className="text-slate-500 text-xs line-clamp-2 mb-4">{incident.description}</p>
                    
                    <div className="flex justify-between items-center border-t border-slate-700 pt-3 mt-auto">
                      <div className="flex -space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold border border-slate-800">S</div>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(incident.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Incident Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create Incident</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input 
                  required
                  type="text" 
                  value={newIncident.title}
                  onChange={e => setNewIncident({...newIncident, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                <textarea 
                  required
                  rows={3}
                  value={newIncident.description}
                  onChange={e => setNewIncident({...newIncident, description: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Severity</label>
                <select 
                  value={newIncident.severity}
                  onChange={e => setNewIncident({...newIncident, severity: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:border-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
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
