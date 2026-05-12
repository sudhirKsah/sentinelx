import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Events() {
  const { token } = useAuthStore();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [sourceFilter, setSourceFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  useEffect(() => {
    fetch('http://localhost:3000/api/v1/events', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setEvents(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, [token]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">All Events</h1>
        <div className="flex space-x-4">
          <select 
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="all">All Sources</option>
            <option value="AWS CloudTrail">AWS CloudTrail</option>
            <option value="Linux Agent">Linux Agent</option>
          </select>
          <select 
            className="bg-slate-800 text-white px-3 py-2 rounded-lg border border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="info">Info</option>
          </select>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 transition-all">
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider border-b border-slate-800">
                <th className="p-4 font-medium">Timestamp</th>
                <th className="p-4 font-medium">Severity</th>
                <th className="p-4 font-medium">Source</th>
                <th className="p-4 font-medium">Title & Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    Loading events...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No events found.
                  </td>
                </tr>
              ) : (
                events
                  .filter((e: any) => sourceFilter === 'all' || e.source === sourceFilter || (sourceFilter === 'Linux Agent' && e.source !== 'AWS CloudTrail'))
                  .filter((e: any) => severityFilter === 'all' || e.severity === severityFilter)
                  .map((event: any) => (
                  <tr key={event.id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 text-sm text-slate-400 whitespace-nowrap">
                      {new Date(event.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border
                        ${event.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                          event.severity === 'high' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 
                          event.severity === 'medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}
                      >
                        {event.severity.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-300">
                      <span className="bg-slate-800 px-2 py-1 rounded text-xs font-mono border border-slate-700">
                        {event.source}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-slate-200">{event.title}</div>
                      <div className="text-sm text-slate-500 mt-1 truncate max-w-xl">{event.description}</div>
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
