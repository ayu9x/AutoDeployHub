'use client';

import { Upload, ExternalLink, RotateCcw, CheckCircle2, Clock } from 'lucide-react';

const mockDeployments = [
  { id: 'd1', project: 'nextjs-blog', version: 'v2.4.1', environment: 'production', status: 'DEPLOYED', url: 'https://blog.example.com', time: '2 min ago', pipeline: 42 },
  { id: 'd2', project: 'landing-page', version: 'v1.8.0', environment: 'production', status: 'DEPLOYED', url: 'https://example.com', time: '1 hr ago', pipeline: 31 },
  { id: 'd3', project: 'api-gateway', version: 'v3.0.9', environment: 'production', status: 'DEPLOYED', url: null, time: '2 hr ago', pipeline: 154, canary: true, canaryWeight: 25 },
  { id: 'd4', project: 'auth-service', version: 'v2.1.0', environment: 'staging', status: 'DEPLOYED', url: null, time: '4 hr ago', pipeline: 93 },
  { id: 'd5', project: 'nextjs-blog', version: 'v2.4.0', environment: 'production', status: 'ROLLED_BACK', url: null, time: '1 day ago', pipeline: 40 },
  { id: 'd6', project: 'api-gateway', version: 'v3.1.0', environment: 'production', status: 'ROLLED_BACK', url: null, time: '1 day ago', pipeline: 152 },
];

const statusBadge = (status: string) => {
  const m: Record<string, string> = {
    DEPLOYED: 'badge-success', ROLLING: 'badge-running', ROLLED_BACK: 'badge-pending', FAILED: 'badge-failed',
  };
  return m[status] || 'badge-neutral';
};

const envBadge = (env: string) => {
  if (env === 'production') return 'bg-[rgba(52,211,153,0.06)] text-[#34D399] border border-[rgba(52,211,153,0.12)]';
  return 'bg-[rgba(251,191,36,0.06)] text-[#FBBF24] border border-[rgba(251,191,36,0.12)]';
};

export default function DeploymentsPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deployments</h1>
        <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Track deployment history and manage rollbacks</p>
      </div>

      <div className="space-y-1.5 stagger-children">
        {mockDeployments.map((d) => (
          <div key={d.id} className="glass-card rounded-lg p-3.5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-[hsl(220,10%,42%)]" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium">{d.project}</span>
                <span className="text-[12px] font-mono text-[hsl(220,10%,52%)]">{d.version}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge(d.status)}`}>
                  {d.status}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${envBadge(d.environment)}`}>
                  {d.environment}
                </span>
                {d.canary && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[rgba(251,191,36,0.06)] text-[#FBBF24] border border-[rgba(251,191,36,0.12)]">
                    Canary {d.canaryWeight}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[hsl(220,10%,32%)] mt-0.5">
                Pipeline #{d.pipeline}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {d.url && (
                <a href={d.url} target="_blank" rel="noopener"
                  className="p-1.5 rounded-md hover:bg-white/[0.03] text-[hsl(220,10%,32%)] hover:text-[#60A5FA] transition-colors" title="Visit">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {d.status === 'DEPLOYED' && (
                <button className="p-1.5 rounded-md hover:bg-white/[0.03] text-[hsl(220,10%,32%)] hover:text-[#FBBF24] transition-colors" title="Rollback">
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[11px] text-[hsl(220,10%,28%)] ml-1">{d.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
