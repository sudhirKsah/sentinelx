import React from 'react';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-slate-900 border-b border-slate-800 h-16 flex items-center justify-between px-8 sticky top-0 z-10 w-full">
      <div className="flex items-center">
        {/* Search bar placeholder */}
        <div className="relative hidden md:block">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            🔍
          </span>
          <input 
            type="text" 
            placeholder="Search alerts, agents, IP addresses..." 
            className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg pl-10 px-4 py-2 w-96 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="text-slate-400 hover:text-white transition-colors relative">
          🔔
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-800">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white">{user?.email}</p>
            <p className="text-xs text-slate-500">{user?.org_id ? 'Admin' : 'User'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold cursor-pointer shadow-lg hover:shadow-blue-500/20 transition-all">
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <button 
            onClick={logout} 
            className="ml-2 text-xs bg-slate-800 hover:bg-red-500/20 hover:text-red-400 text-slate-400 border border-slate-700 hover:border-red-500/30 px-3 py-1.5 rounded transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
