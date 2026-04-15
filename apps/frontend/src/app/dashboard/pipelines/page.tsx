'use client';

import Link from 'next/link';
import { GitBranch, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const mockPipelines = [
  { id: 'p1', project: 'nextjs-blog', number: 42, status: 'SUCCESS', branch: 'main', commit: 'Fix responsive layout on mobile', duration: '1m 15s', time: '2 min ago' },
  { id: 'p2', project: 'api-gateway', number: 156, status: 'RUNNING', branch: 'main', commit: 'Add rate limiting middleware', duration: '...', time: '5 min ago' },
  { id: 'p3', project: 'mobile-app', number: 78, status: 'FAILED', branch: 'develop', commit: 'Update navigation stack', duration: '45s', time: '23 min ago' },
  { id: 'p4', project: 'landing-page', number: 31, status: 'SUCCESS', branch: 'main', commit: 'Add hero section animation', duration: '52s', time: '1 hr ago' },
  { id: 'p5', project: 'auth-service', number: 94, status: 'SUCCESS', branch: 'main', commit: 'Implement refresh token rotation', duration: '2m 3s', time: '2 hr ago' },
  { id: 'p6', project: 'nextjs-blog', number: 41, status: 'SUCCESS', branch: 'main', commit: 'Add dark mode toggle', duration: '1m 8s', time: '3 hr ago' },
  { id: 'p7', project: 'api-gateway', number: 155, status: 'SUCCESS', branch: 'feature/cache', commit: 'Add Redis caching layer', duration: '1m 42s', time: '5 hr ago' },
  { id: 'p8', project: 'data-pipeline', number: 17, status: 'SUCCESS', branch: 'main', commit: 'Initial ETL setup', duration: '3m 21s', time: '6 hr ago' },
];

const statusIcon = (s: string) => {
  if (s === 'SUCCESS') return <CheckCircle2 className="w-4 h-4 text-[#34D399]" />;
  if (s === 'RUNNING') return <Loader2 className="w-4 h-4 text-[#60A5FA] animate-spin" />;
  if (s === 'FAILED') return <XCircle className="w-4 h-4 text-[#F87171]" />;
  return <Clock className="w-4 h-4 text-[#FBBF24]" />;
};

const statusBadge = (s: string) => {
  const m: Record<string, string> = { SUCCESS: 'badge-success', RUNNING: 'badge-running', FAILED: 'badge-failed', PENDING: 'badge-pending' };
  return m[s] || 'badge-neutral';
};

export default function PipelinesListPage() {
  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Pipelines</h1>
        <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Recent pipeline runs across all projects</p>
      </div>

      <div className="space-y-1.5 stagger-children">
        {mockPipelines.map((p) => (
          <Link key={p.id} href={`/dashboard/pipelines/${p.id}`}
            className="glass-card rounded-lg p-3.5 flex items-center gap-3 group block">
            {statusIcon(p.status)}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[13px] font-medium group-hover:text-[#6C8EFF] transition-colors">
                  {p.project}
                </span>
                <span className="text-[12px] text-[hsl(220,10%,32%)] font-mono">#{p.number}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${statusBadge(p.status)}`}>{p.status}</span>
              </div>
              <p className="text-[11px] text-[hsl(220,10%,38%)] mt-0.5 truncate">
                {p.commit} — <span className="text-[hsl(220,10%,28%)]">{p.branch}</span>
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <span className="text-[12px] text-[hsl(220,10%,38%)] flex items-center gap-1 font-mono hidden sm:flex">
                <Clock className="w-3 h-3" /> {p.duration}
              </span>
              <span className="text-[11px] text-[hsl(220,10%,28%)]">{p.time}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
