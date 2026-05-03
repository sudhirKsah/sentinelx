import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { io } from 'socket.io-client';

export default function Overview() {
  const { user, token } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalEvents: 0, activeAlerts: 0, openIncidents: 0, activeAgents: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch stats
    fetch('http://localhost:3000/api/v1/analytics/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(err => console.error(err));

    // Fetch initial events
    fetch('http://localhost:3000/api/v1/events?limit=20', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching events:', err));

    // Connect WebSocket
    const socket = io('http://localhost:3000', {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to real-time stream');
    });

    socket.on('real-time:event', (newEvent: any) => {
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
      setStats(prev => ({ ...prev, totalEvents: prev.totalEvents + 1 }));
    });

    socket.on('real-time:alert', (newAlert: any) => {
      setAlerts(prev => [newAlert, ...prev].slice(0, 10));
      setStats(prev => ({ ...prev, activeAlerts: prev.activeAlerts + 1 }));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const handleGenerateReport = () => {
    // Generate CSV string
    const headers = ['ID', 'Title', 'Severity', 'Status', 'Timestamp'];
    const eventRows = events.map(e => 
      [e.id, `"${e.title}"`, e.severity, e.status || 'N/A', new Date(e.timestamp).toISOString()].join(',')
    );
    const csvContent = [headers.join(','), ...eventRows].join('\n');
    
    // Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `sentinelx_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
        <div className="flex gap-2">
          <button 
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Active Alerts" value={stats.activeAlerts} icon="🚨" color="text-red-500" />
        <StatCard title="Open Incidents" value={stats.openIncidents} icon="🛡️" color="text-orange-500" />
        <StatCard title="Active Agents" value={stats.activeAgents} icon="🖥️" color="text-emerald-500" />
        <StatCard title="Total Events (24h)" value={stats.totalEvents} icon="📊" color="text-blue-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Feed */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Event Stream
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="flex items-center justify-center h-full text-slate-500">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                <span className="text-4xl opacity-50">📡</span>
                <p>Waiting for incoming events...</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {events.map(event => (
                  <li key={event.id} className="bg-slate-800/50 hover:bg-slate-800 p-4 rounded-xl transition-all border border-transparent hover:border-slate-700 flex items-start gap-4 group">
                    <div className={`mt-1 w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] flex-shrink-0 ${event.severity === 'critical' ? 'bg-red-500 shadow-red-500/50' : event.severity === 'high' ? 'bg-orange-500 shadow-orange-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-semibold text-slate-200 truncate pr-4">{event.title}</p>
                        <span className="text-xs text-slate-500 whitespace-nowrap font-mono bg-slate-900 px-2 py-1 rounded-md">
                          {new Date(event.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 truncate group-hover:whitespace-normal group-hover:text-clip transition-all">{event.description}</p>
                      <div className="mt-3 flex gap-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 border border-slate-700 text-slate-300">
                          {event.source}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 border border-slate-700 text-slate-300">
                          {event.event_type}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-slate-800 bg-slate-800/50">
            <h2 className="text-lg font-bold text-white">Recent Alerts</h2>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
            {alerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                <span className="text-4xl opacity-50">✅</span>
                <p>No active alerts</p>
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                  <h3 className="font-bold text-red-400 text-sm mb-1">{alert.title}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2">{alert.description}</p>
                  <span className="text-[10px] text-slate-500 font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: string, color: string }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
        </div>
        <div className="text-2xl opacity-80 bg-slate-800 w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      {/* Decorative gradient blob */}
      <div className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-2xl opacity-10 bg-current ${color}`}></div>
    </div>
  );
}
