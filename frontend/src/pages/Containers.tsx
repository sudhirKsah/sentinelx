import { useState } from 'react';
import { useAuthStore } from '../store/authStore';

export default function Containers() {
  const { token } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Container Security</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Kubernetes Clusters</h2>
            <button onClick={() => setShowModal(true)} className="text-blue-400 text-sm hover:underline">Connect Cluster</button>
          </div>
          <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-slate-800 rounded-xl">
            <span className="text-5xl opacity-30 mb-4">☸️</span>
            <p className="text-slate-400 font-medium">No clusters connected</p>
            <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">Deploy the SentinelX DaemonSet to your Kubernetes cluster to start monitoring container runtime security.</p>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Vulnerability Scans</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                <span className="text-slate-300 text-sm font-mono">nginx:latest</span>
                <span className="bg-red-500/10 text-red-400 px-2 py-0.5 rounded text-xs border border-red-500/20">3 Critical</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-800 rounded-lg border border-slate-700">
                <span className="text-slate-300 text-sm font-mono">node:18-alpine</span>
                <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-xs border border-emerald-500/20">0 Vulns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Cluster Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Connect Kubernetes Cluster</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-300 mb-2">1. Create a namespace for SentinelX:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400">
                  kubectl create namespace sentinelx-system
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-300 mb-2">2. Create the connection secret using your token:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400 overflow-x-auto">
                  kubectl create secret generic sentinelx-auth \<br/>
                  &nbsp;&nbsp;--from-literal=token="{token}" \<br/>
                  &nbsp;&nbsp;--namespace=sentinelx-system
                </div>
              </div>

              <div>
                <p className="text-sm text-slate-300 mb-2">3. Apply the SentinelX DaemonSet:</p>
                <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-400">
                  kubectl apply -f https://raw.githubusercontent.com/your-username/SentinelX/main/k8s/daemonset.yaml
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
