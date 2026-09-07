import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { io } from 'socket.io-client';

export default function Dashboard() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const { user, token, logout } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch initial events
    fetch(`${API_URL}/api/v1/events?limit=20`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => console.error('Error fetching events:', err));

    // Connect WebSocket
    const socket = io(`${API_URL}/`, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Connected to real-time event stream');
    });

    socket.on('real-time:event', (newEvent: any) => {
      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    });

    socket.on('real-time:alert', (newAlert: any) => {
      setAlerts(prev => [newAlert, ...prev].slice(0, 10));
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-blue-400">SentinelX</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">User: {user?.email}</span>
          <button onClick={logout} className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Critical Alerts</p>
            <p className="text-3xl font-bold text-red-500 mt-2">{alerts.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Events (Live)</p>
            <p className="text-3xl font-bold text-blue-500 mt-2">{events.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-6 shadow-lg border border-slate-700">
            <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Organization ID</p>
            <p className="text-sm font-mono text-gray-300 mt-2 truncate">{user?.org_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alerts Panel */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-bold text-white mb-4">Active Alerts</h2>
            {alerts.length === 0 ? (
              <div className="bg-slate-800 rounded-lg p-6 text-center text-gray-400 border border-slate-700">
                No active alerts.
              </div>
            ) : (
              alerts.map((alert, idx) => (
                <div key={idx} className="bg-red-900/20 border-l-4 border-red-500 rounded p-4 shadow">
                  <h3 className="font-bold text-red-400">{alert.title}</h3>
                  <p className="text-sm text-gray-300 mt-1">{alert.description}</p>
                  <span className="text-xs text-gray-500 mt-2 block">{new Date(alert.timestamp).toLocaleString()}</span>
                </div>
              ))
            )}
          </div>

          {/* Events Feed */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-white mb-4">Live Event Feed</h2>
            <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 overflow-hidden">
              {loading ? (
                <div className="p-8 text-center text-gray-400">Loading events...</div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center text-gray-400">No events found. Start by sending events from the Agent or AWS integration.</div>
              ) : (
                <ul className="divide-y divide-slate-700 max-h-[600px] overflow-y-auto">
                  {events.map(event => (
                    <li key={event.id} className="p-4 hover:bg-slate-750 transition-colors flex items-start gap-4">
                      <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${event.severity === 'critical' ? 'bg-red-500' : event.severity === 'high' ? 'bg-orange-500' : 'bg-blue-500'}`}></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-medium text-white truncate">{event.title}</p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 truncate">{event.description}</p>
                        <div className="mt-2 flex gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-gray-300">
                            {event.source}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-700 text-gray-300">
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
        </div>
      </div>
    </div>
  );
}
