'use client';

import { useState } from 'react';
import { ScrollText, Filter, User, GitBranch, Upload, Key, Users, LogIn } from 'lucide-react';

const mockAuditLogs = [
  { id: '1', user: 'Rajay', action: 'DEPLOYMENT_CREATE', resource: 'nextjs-blog', detail: 'Deployed v2.4.1 to production', time: '2 min ago', icon: Upload, color: '#34D399' },
  { id: '2', user: 'Sarah', action: 'PIPELINE_RUN', resource: 'api-gateway', detail: 'Triggered pipeline #156 on main', time: '5 min ago', icon: GitBranch, color: '#60A5FA' },
  { id: '3', user: 'Rajay', action: 'SECRET_CREATE', resource: 'api-gateway', detail: 'Added secret DATABASE_URL', time: '12 min ago', icon: Key, color: '#FBBF24' },
  { id: '4', user: 'Alex', action: 'PIPELINE_CANCEL', resource: 'mobile-app', detail: 'Cancelled pipeline #77', time: '23 min ago', icon: GitBranch, color: '#F87171' },
  { id: '5', user: 'Rajay', action: 'PROJECT_CREATE', resource: 'data-pipeline', detail: 'Created new project', time: '1 hr ago', icon: GitBranch, color: '#A78BFA' },
  { id: '6', user: 'Jordan', action: 'LOGIN', resource: 'auth', detail: 'Logged in via GitHub OAuth', time: '2 hr ago', icon: LogIn, color: '#34D399' },
  { id: '7', user: 'Sarah', action: 'TEAM_INVITE', resource: 'team', detail: 'Invited mike@company.com as Member', time: '3 hr ago', icon: Users, color: '#60A5FA' },
  { id: '8', user: 'Rajay', action: 'DEPLOYMENT_ROLLBACK', resource: 'api-gateway', detail: 'Rolled back v3.1.0 → v3.0.9', time: '5 hr ago', icon: Upload, color: '#FBBF24' },
  { id: '9', user: 'Alex', action: 'PIPELINE_RUN', resource: 'auth-service', detail: 'Triggered pipeline #94 on main', time: '6 hr ago', icon: GitBranch, color: '#60A5FA' },
  { id: '10', user: 'Rajay', action: 'TOKEN_CREATE', resource: 'tokens', detail: 'Created API token "CI Bot"', time: '1 day ago', icon: Key, color: '#A78BFA' },
];

const actionFilters = ['All', 'PIPELINE', 'DEPLOYMENT', 'SECRET', 'TEAM', 'TOKEN', 'LOGIN'];

export default function AuditPage() {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All'
    ? mockAuditLogs
    : mockAuditLogs.filter(l => l.action.startsWith(filter));

  return (
    <div className="space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Track all actions across your organization</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
        {actionFilters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
              filter === f
                ? 'bg-[hsl(225,73%,57%,0.1)] text-[hsl(225,73%,57%)] border border-[hsl(225,73%,57%,0.2)]'
                : 'btn-secondary'
            }`}>
            {f}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <div className="glass-card rounded-xl overflow-hidden">
        <div className="divide-y divide-white/[0.03]">
          {filtered.map(log => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3 hover:bg-white/[0.01] transition-colors">
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${log.color}10`, border: `1px solid ${log.color}18` }}>
                <log.icon className="w-3.5 h-3.5" style={{ color: log.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px]">
                  <span className="font-medium">{log.user}</span>
                  <span className="text-[hsl(220,10%,38%)]"> · </span>
                  <span className="text-[hsl(220,10%,42%)]">{log.detail}</span>
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/[0.04] text-[hsl(220,10%,38%)]">
                    {log.action}
                  </span>
                  <span className="text-[10px] text-[hsl(220,10%,32%)]">{log.resource}</span>
                </div>
              </div>
              <span className="text-[11px] text-[hsl(220,10%,28%)] shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
