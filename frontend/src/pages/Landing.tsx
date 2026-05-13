import { useNavigate } from 'react-router-dom';
import { Shield, Brain, Cloud, Terminal, Zap, ArrowRight, Activity, Lock } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 border-b border-slate-800/50 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              SentinelX
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/login')}
              className="text-sm font-medium bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Abstract Background Elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700 mb-8 backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300 tracking-wide uppercase">SentinelX Agent 0.1.0 is live</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8">
            The Future of <br/>
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Multi-Cloud Security
            </span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            SentinelX leverages Google Gemini 2.5 AI to eliminate alert fatigue, detect zero-day threats, and protect your infrastructure across AWS and Linux endpoints in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] hover:-translate-y-0.5"
            >
              Start Securing Now <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => window.open('https://github.com/sudhirksah/sentinelx', '_blank')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-800/50 hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl font-medium border border-slate-700 backdrop-blur-md transition-all hover:border-slate-600"
            >
              View Documentation
            </button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Enterprise-Grade Architecture</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">Built to bridge the gap between Cloud Security Posture Management and Endpoint Detection.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">AI-Powered Triaging</h3>
            <p className="text-slate-400 leading-relaxed">
              Feeds high-severity logs directly to Google Gemini Flash. The AI analyzes context and assigns a confidence score, eliminating false positives.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Cloud className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Cloud Native Auditing</h3>
            <p className="text-slate-400 leading-relaxed">
              Agentless background polling daemon natively integrates with AWS CloudTrail to detect IAM privilege escalation and S3 manipulation.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Terminal className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Lightweight Linux Agent</h3>
            <p className="text-slate-400 leading-relaxed">
              A highly optimized 30MB Python agent deployed to your Linux hosts actively monitors File Integrity (FIM) and Process Anomalies.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Sub-second Streaming</h3>
            <p className="text-slate-400 leading-relaxed">
              Our WebSockets-powered architecture ensures alerts and AI insights stream directly to your React dashboard with zero latency.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Persistent Vault</h3>
            <p className="text-slate-400 leading-relaxed">
              Multi-tenant PostgreSQL architecture securely isolates organizations and encrypts your AWS access keys persistently.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-rose-400" />
            </div>
            <h3 className="text-xl font-bold mb-3">Intelligent Alerting</h3>
            <p className="text-slate-400 leading-relaxed">
              Integrated with the Resend API to automatically dispatch beautifully formatted HTML emails for Critical and High severity incidents.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Flow Section */}
      <div className="border-y border-slate-800/50 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">From Chaos to Clarity.</h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                SentinelX doesn't just forward logs. It utilizes an advanced Event Correlation Engine to group isolated alerts into singular, actionable Incidents. Stop chasing ghosts and start hunting threats.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">1</div>
                  Continuous ingestion from Cloud APIs & Agents
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">2</div>
                  Real-time pattern matching against custom rules
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">3</div>
                  Gemini AI contextual analysis & verification
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
               <div className="absolute -top-4 -left-4 w-20 h-20 bg-blue-500/20 blur-2xl rounded-full"></div>
               {/* Mock UI snippet */}
               <div className="space-y-4">
                 <div className="h-8 w-1/3 bg-slate-700/50 rounded animate-pulse"></div>
                 <div className="h-24 w-full bg-slate-700/30 rounded border border-slate-700/50"></div>
                 <div className="h-24 w-full bg-slate-700/30 rounded border border-slate-700/50"></div>
                 <div className="h-24 w-full bg-red-900/20 rounded border border-red-500/30 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                    <div className="p-4 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-red-400" />
                      </div>
                      <div>
                        <div className="text-red-400 font-bold text-sm">INCIDENT DETECTED</div>
                        <div className="text-slate-300 text-xs mt-1">AI Confidence: 98%</div>
                      </div>
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-4xl mx-auto px-6 py-32 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to secure your infrastructure?</h2>
        <p className="text-slate-400 mb-10 text-lg">Deploy SentinelX today and get enterprise-grade multi-cloud visibility in minutes.</p>
        <button 
          onClick={() => navigate('/login')}
          className="bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:shadow-[0_0_40px_rgba(37,99,235,0.6)] hover:-translate-y-1"
        >
          Create Free Organization
        </button>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-[#020617] py-8 text-center text-slate-500 text-sm">
        <p>© {new Date().getFullYear()} SentinelX Security. Built for modern infrastructure.</p>
      </footer>
    </div>
  );
}
