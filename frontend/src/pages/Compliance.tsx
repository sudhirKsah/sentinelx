import { useState } from 'react';

export default function Compliance() {
  const [selectedResource, setSelectedResource] = useState<{title: string, desc: string} | null>(null);

  const frameworks = [
    { name: 'SOC 2 Type II', score: 94, status: 'Passing', color: 'bg-emerald-500' },
    { name: 'ISO 27001', score: 82, status: 'Warning', color: 'bg-orange-500' },
    { name: 'GDPR / CCPA', score: 98, status: 'Passing', color: 'bg-emerald-500' },
    { name: 'HIPAA', score: 45, status: 'Failing', color: 'bg-red-500' },
  ];

  const handleDownloadPDF = () => {
    const text = "SOC2: Passing (94%)\nGDPR: Passing (98%)\nHIPAA: Failing (45%)\nFailing Control: HIPAA-104 (S3 Encryption)";
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = "compliance_report.txt";
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white tracking-tight">Compliance Posture</h1>
        <button onClick={handleDownloadPDF} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
          Download PDF Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {frameworks.map(f => (
          <div key={f.name} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
            <h3 className="text-slate-400 text-sm font-bold tracking-wider mb-4">{f.name}</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-bold text-white">{f.score}</span>
              <span className="text-slate-500 mb-1">/ 100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
              <div className={`h-full ${f.color} rounded-full transition-all duration-1000`} style={{ width: `${f.score}%` }}></div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${f.color}`}></span>
              <span className="text-xs font-medium text-slate-300">{f.status}</span>
            </div>
            
            {/* Background decorative circle */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 ${f.color}`}></div>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Failing Controls</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
              <div>
                <h4 className="text-red-400 font-bold text-sm mb-1">HIPAA-104: Data Encryption at Rest</h4>
                <p className="text-slate-400 text-xs">S3 Bucket `patient-records-backup` is not utilizing KMS encryption.</p>
              </div>
              <button 
                onClick={() => setSelectedResource({title: 'HIPAA-104: Data Encryption at Rest', desc: 'S3 Bucket `patient-records-backup` is not utilizing KMS encryption. Please navigate to AWS Console > S3 > Properties and enable Default Encryption using an AWS KMS key.'})}
                className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
              >
                View Resource
              </button>
            </div>
            <div className="flex justify-between items-center p-4 bg-orange-500/5 border border-orange-500/20 rounded-xl">
              <div>
                <h4 className="text-orange-400 font-bold text-sm mb-1">ISO-A.9.2: User Access Provisioning</h4>
                <p className="text-slate-400 text-xs">3 AWS IAM Users have active access keys older than 90 days.</p>
              </div>
              <button 
                onClick={() => setSelectedResource({title: 'ISO-A.9.2: User Access Provisioning', desc: 'The following IAM Users have non-compliant access keys: "dev-admin", "ci-cd-bot", "backup-user". Please rotate these keys immediately via AWS IAM.'})}
                className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded hover:bg-slate-700 transition-colors"
              >
                View Resource
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Resource Modal */}
      {selectedResource && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Resource Details</h2>
              <button onClick={() => setSelectedResource(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-slate-300 text-sm font-bold mb-2">Failed Control</h4>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 text-red-400 text-sm font-mono">
                  {selectedResource.title}
                </div>
              </div>
              
              <div>
                <h4 className="text-slate-300 text-sm font-bold mb-2">Remediation Steps</h4>
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 text-slate-300 text-sm leading-relaxed">
                  {selectedResource.desc}
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button onClick={() => setSelectedResource(null)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-500">Acknowledge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
