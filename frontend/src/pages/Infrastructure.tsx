import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Infrastructure() {
  const { token, user } = useAuthStore();
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/agents', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setAgents(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Infrastructure</h1>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
        >
          + Deploy Agent
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            Connected Agents
          </h2>
          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md border border-slate-700">Total: {agents.length}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {loading ? (
            <div className="col-span-full text-center text-slate-500 py-10">Loading infrastructure...</div>
          ) : agents.length === 0 ? (
            <div className="col-span-full text-center py-10 border-2 border-dashed border-slate-700 rounded-xl">
              <span className="text-4xl block mb-2 opacity-50">🖥️</span>
              <p className="text-slate-400 font-medium">No agents connected</p>
              <p className="text-slate-500 text-sm mt-1">Deploy the Python agent to your endpoints to see them here.</p>
            </div>
          ) : (
            agents.map(agent => (
              <div key={agent.id} className="bg-slate-800 rounded-xl p-5 border border-slate-700 relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-xl border border-slate-700 shadow-inner">
                      {agent.os_type.toLowerCase().includes('linux') ? '🐧' : agent.os_type.toLowerCase().includes('win') ? '🪟' : '🖥️'}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-sm">{agent.hostname}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">{agent.id.substring(0,8)}</p>
                    </div>
                  </div>
                  <span className={`flex h-2.5 w-2.5 relative`}>
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${agent.status === 'online' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
                    <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${agent.status === 'online' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-slate-400 border-t border-slate-700 pt-4">
                  <div className="flex justify-between">
                    <span>OS Version</span>
                    <span className="text-slate-200">{agent.os_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agent Version</span>
                    <span className="text-slate-200 font-mono text-xs">{agent.agent_version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Heartbeat</span>
                    <span className="text-slate-200 text-xs">{agent.last_heartbeat ? new Date(agent.last_heartbeat).toLocaleTimeString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Deploy Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Deploy Python Agent</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-300 mb-2">1. Download the agent to your Linux host:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                  git clone https://github.com/your-username/SentinelX.git<br/>
                  cd SentinelX/agent
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">2. Install python dependencies:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400">
                  pip install -r requirements.txt
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-300 mb-2">3. Export your organization token:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                  export SENTINELX_TOKEN="{token}"<br/>
                  export SENTINELX_API_URL="http://localhost:3000"
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">4. Run the agent:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400">
                  python -m sentinelx_agent.main
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={() => setShowModal(false)} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
