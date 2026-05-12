import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const { token, user } = useAuthStore();
  const [awsKey, setAwsKey] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [awsRegion, setAwsRegion] = useState('ap-south-1');
  
  // Notification Settings
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');
  
  const [status, setStatus] = useState('');
  const [notifStatus, setNotifStatus] = useState('');

  React.useEffect(() => {
    // Fetch current settings
    fetch('http://localhost:3000/api/v1/tenants/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.aws_access_key) setAwsKey(data.aws_access_key);
        if (data.aws_region) setAwsRegion(data.aws_region);
        if (data.email_alerts_enabled) setEmailEnabled(data.email_alerts_enabled);
        if (data.alert_email_address) setAlertEmail(data.alert_email_address);
      })
      .catch(err => console.error(err));
  }, [token]);

  const handleAwsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');
    try {
      const res = await fetch('http://localhost:3000/api/v1/integrations/aws', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          accessKeyId: awsKey,
          secretAccessKey: awsSecret,
          region: awsRegion
        })
      });
      if (!res.ok) throw new Error('Failed to save integration');
      setStatus('AWS Integration Saved Successfully!');
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleNotifSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus('Saving...');
    try {
      const res = await fetch('http://localhost:3000/api/v1/tenants/me/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email_alerts_enabled: emailEnabled,
          alert_email_address: alertEmail
        })
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setNotifStatus('Notification Settings Saved!');
      setTimeout(() => setNotifStatus(''), 3000);
    } catch (err: any) {
      setNotifStatus(`Error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>

      {/* Account Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Account Profile</h2>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
            <input 
              type="text" 
              disabled 
              value={user?.email || ''} 
              className="w-full bg-slate-800 border border-slate-700 text-slate-500 rounded-lg px-4 py-2 opacity-70 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Organization ID</label>
            <input 
              type="text" 
              disabled 
              value={user?.org_id || ''} 
              className="w-full bg-slate-800 border border-slate-700 text-slate-500 rounded-lg px-4 py-2 opacity-70 cursor-not-allowed font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Cloud Integrations */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">AWS Integration</h2>
            <p className="text-sm text-slate-500">Connect AWS CloudTrail for continuous monitoring</p>
          </div>
          <span className="text-4xl">☁️</span>
        </div>
        <div className="p-6">
          <form onSubmit={handleAwsSave} className="space-y-4">
            {status && (
              <div className={`p-3 rounded text-sm ${status.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {status}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Access Key ID</label>
              <input 
                type="text" 
                value={awsKey}
                onChange={e => setAwsKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="AKIAIOSFODNN7EXAMPLE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Secret Access Key</label>
              <input 
                type="password" 
                value={awsSecret}
                onChange={e => setAwsSecret(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="••••••••••••••••••••••••••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Region</label>
              <select 
                value={awsRegion}
                onChange={e => setAwsRegion(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              >
                <option value="ap-south-1">ap-south-1 (Mumbai)</option>
                <option value="us-east-1">US East (N. Virginia)</option>
                <option value="us-east-2">US East (Ohio)</option>
                <option value="us-west-2">US West (Oregon)</option>
                <option value="eu-west-1">Europe (Ireland)</option>
              </select>
            </div>
            <div className="pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Save & Connect
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-12">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white">Notification Preferences</h2>
            <p className="text-sm text-slate-500">Configure how you receive critical alerts</p>
          </div>
          <span className="text-4xl">📧</span>
        </div>
        <div className="p-6">
          <form onSubmit={handleNotifSave} className="space-y-4">
            {notifStatus && (
              <div className={`p-3 rounded text-sm ${notifStatus.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {notifStatus}
              </div>
            )}
            
            <div className="flex items-center gap-3">
              <input 
                type="checkbox" 
                id="emailToggle"
                checked={emailEnabled}
                onChange={e => setEmailEnabled(e.target.checked)}
                className="w-5 h-5 accent-blue-600 rounded bg-slate-800 border-slate-700"
              />
              <label htmlFor="emailToggle" className="text-sm font-medium text-slate-300 cursor-pointer">
                Enable Email Alerts for High/Critical Incidents
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 mt-4">Alert Email Address</label>
              <input 
                type="email" 
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                disabled={!emailEnabled}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="security-team@example.com"
              />
              <p className="text-xs text-slate-500 mt-1">Leave blank to use your account login email.</p>
            </div>
            
            <div className="pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Save Preferences
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
