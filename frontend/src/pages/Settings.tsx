import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Settings() {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const { token, user } = useAuthStore();
  const [awsKey, setAwsKey] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [awsRegion, setAwsRegion] = useState('ap-south-1');
  const [awsConfigured, setAwsConfigured] = useState(false);

  // GCP Integration
  const [gcpProjectId, setGcpProjectId] = useState('');
  const [gcpServiceKey, setGcpServiceKey] = useState('');
  const [gcpStatus, setGcpStatus] = useState('');
  const [gcpConfigured, setGcpConfigured] = useState(false);

  // Notification Settings
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [alertEmail, setAlertEmail] = useState('');

  const [status, setStatus] = useState('');
  const [notifStatus, setNotifStatus] = useState('');

  React.useEffect(() => {
    // Fetch current settings (sensitive fields are masked server-side)
    fetch(`${API_URL}/api/v1/tenants/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.aws_configured) setAwsConfigured(true);
        if (data.aws_region) setAwsRegion(data.aws_region);
        if (data.gcp_configured) setGcpConfigured(true);
        if (data.gcp_project_id) setGcpProjectId(data.gcp_project_id);
        if (data.email_alerts_enabled) setEmailEnabled(data.email_alerts_enabled);
        if (data.alert_email_address) setAlertEmail(data.alert_email_address);
      })
      .catch(err => console.error(err));
  }, [token]);

  const handleAwsSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');

    // If already configured and the user didn't enter new key/secret values,
    // only persist the region via the tenant settings endpoint (don't wipe keys).
    if (awsConfigured && !awsKey && !awsSecret) {
      try {
        const res = await fetch(`${API_URL}/api/v1/tenants/me/settings`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ aws_region: awsRegion })
        });
        if (!res.ok) throw new Error('Failed to save region');
        setStatus('AWS region updated.');
        setTimeout(() => setStatus(''), 3000);
      } catch (err: any) {
        setStatus(`Error: ${err.message}`);
      }
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/v1/integrations/aws`, {
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
      setAwsConfigured(true);
      setAwsKey('');
      setAwsSecret('');
      setTimeout(() => setStatus(''), 3000);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleGcpSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setGcpStatus('Saving...');
    try {
      // Validate JSON before sending
      JSON.parse(gcpServiceKey);
      const res = await fetch(`${API_URL}/api/v1/integrations/gcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceAccountKey: gcpServiceKey,
          projectId: gcpProjectId
        })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || 'Failed to save GCP integration');
      }
      setGcpStatus('GCP Integration Saved Successfully!');
      setGcpConfigured(true);
      setGcpServiceKey('');
      setTimeout(() => setGcpStatus(''), 3000);
    } catch (err: any) {
      setGcpStatus(`Error: ${err.message}`);
    }
  };

  const handleNotifSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifStatus('Saving...');
    try {
      const res = await fetch(`${API_URL}/api/v1/tenants/me/settings`, {
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
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              AWS Integration
              {awsConfigured && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Configured
                </span>
              )}
            </h2>
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
            {awsConfigured && (
              <p className="text-xs text-slate-500 bg-slate-800/50 border border-slate-700/50 rounded p-2">
                AWS credentials are on file and encrypted at rest. Leave the fields blank to keep the current key, or enter new values to rotate.
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Access Key ID</label>
              <input
                type="text"
                value={awsKey}
                onChange={e => setAwsKey(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={awsConfigured ? '•••••••• (enter new key to rotate)' : 'AKIAIOSFODNN7EXAMPLE'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Secret Access Key</label>
              <input
                type="password"
                value={awsSecret}
                onChange={e => setAwsSecret(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder={awsConfigured ? '•••••••• (enter new key to rotate)' : '••••••••••••••••••••••••••••••••'}
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

      {/* GCP Integration */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-3">
              GCP Integration
              {gcpConfigured && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Configured
                </span>
              )}
            </h2>
            <p className="text-sm text-slate-500">Connect Google Cloud Audit Logs (Admin Activity &amp; Data Access) for continuous monitoring</p>
          </div>
          <span className="text-4xl">☁️</span>
        </div>
        <div className="p-6">
          <form onSubmit={handleGcpSave} className="space-y-4">
            {gcpStatus && (
              <div className={`p-3 rounded text-sm ${gcpStatus.includes('Error') ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                {gcpStatus}
              </div>
            )}
            {gcpConfigured && (
              <p className="text-xs text-slate-500 bg-slate-800/50 border border-slate-700/50 rounded p-2">
                GCP credentials are on file and encrypted at rest. Paste a new service account key to rotate.
              </p>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">GCP Project ID</label>
              <input
                type="text"
                value={gcpProjectId}
                onChange={e => setGcpProjectId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="my-gcp-project-123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Service Account Key (JSON)</label>
              <textarea
                required
                value={gcpServiceKey}
                onChange={e => setGcpServiceKey(e.target.value)}
                rows={8}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-lg px-4 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-mono text-xs"
                placeholder={gcpConfigured ? '{ ...paste new service account key to rotate... }' : '{ "type": "service_account", "project_id": "...", "private_key": "...", "client_email": "..." }'}
              />
              <p className="text-xs text-slate-500 mt-1">
                Paste the full contents of the service account JSON key file. Required role: <span className="font-mono">roles/logging.viewer</span> (or <span className="font-mono">roles/logging.privateLogViewer</span> for Data Access logs).
              </p>
            </div>
            <div className="pt-2">
              <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                Save &amp; Connect
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
