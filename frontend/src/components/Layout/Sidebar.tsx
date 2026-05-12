import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/overview', name: 'Overview', icon: '📊' },
  { path: '/events', name: 'Events', icon: '📜' },
  { path: '/alerts', name: 'Alerts', icon: '🚨' },
  { path: '/incidents', name: 'Incidents', icon: '🛡️' },
  { path: '/rules', name: 'Rules', icon: '📝' },
  { path: '/infrastructure', name: 'Infrastructure', icon: '🖥️' },
  { path: '/containers', name: 'Containers', icon: '🐳' },
  { path: '/users', name: 'Users', icon: '👥' },
  { path: '/analytics', name: 'AI Analytics', icon: '🧠' },
  { path: '/compliance', name: 'Compliance', icon: '📋' },
  { path: '/settings', name: 'Settings', icon: '⚙️' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen fixed top-0 left-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
          SentinelX
        </h1>
        <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Security SaaS</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto mt-2 custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-semibold'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-400 mb-2">Agent Status</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-sm font-medium text-slate-200">System Healthy</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
