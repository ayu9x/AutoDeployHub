'use client';

import Link from 'next/link';
import {
  FolderGit2, GitBranch, Upload, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, XCircle, Loader2, Plus, Activity,
} from 'lucide-react';
import { formatDate, formatDuration } from '@/lib/utils';

// Mock data so the dashboard looks populated even without backend
const mockStats = [
  { label: 'Projects', value: '12', change: '+3', icon: FolderGit2, color: '#60A5FA' },
  { label: 'Pipelines', value: '248', change: '+38', icon: GitBranch, color: '#A78BFA' },
  { label: 'Deployments', value: '89', change: '+12', icon: Upload, color: '#34D399' },
  { label: 'Success Rate', value: '96.2%', change: '+2.1%', icon: TrendingUp, color: '#FBBF24' },
];

const mockProjects = [
  { id: '1', name: 'nextjs-blog', repo: 'github.com/dev/nextjs-blog', framework: 'Next.js', lastStatus: 'SUCCESS', lastPipeline: 42, updated: '2 min ago' },
  { id: '2', name: 'api-gateway', repo: 'github.com/dev/api-gateway', framework: 'NestJS', lastStatus: 'RUNNING', lastPipeline: 156, updated: '5 min ago' },
  { id: '3', name: 'mobile-app', repo: 'github.com/dev/mobile-app', framework: 'React Native', lastStatus: 'FAILED', lastPipeline: 78, updated: '23 min ago' },
  { id: '4', name: 'landing-page', repo: 'github.com/dev/landing-page', framework: 'Vite', lastStatus: 'SUCCESS', lastPipeline: 31, updated: '1 hr ago' },
];

const mockActivity = [
  { action: 'Deployed', project: 'nextjs-blog', version: 'v2.4.1', status: 'success', time: '2m ago' },
  { action: 'Pipeline #156', project: 'api-gateway', version: 'build', status: 'running', time: '5m ago' },
  { action: 'Pipeline #78', project: 'mobile-app', version: 'test failed', status: 'failed', time: '23m ago' },
  { action: 'Deployed', project: 'landing-page', version: 'v1.8.0', status: 'success', time: '1h ago' },
  { action: 'Rollback', project: 'api-gateway', version: 'v3.1.0 → v3.0.9', status: 'success', time: '2h ago' },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: 'badge-success', DEPLOYED: 'badge-success', success: 'badge-success',
    RUNNING: 'badge-running', running: 'badge-running',
    FAILED: 'badge-failed', failed: 'badge-failed',
    PENDING: 'badge-pending',
  };
  return map[status] || 'badge-neutral';
};

const statusDot = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: 'bg-[#34D399]', DEPLOYED: 'bg-[#34D399]', success: 'bg-[#34D399]',
    RUNNING: 'bg-[#60A5FA] status-running', running: 'bg-[#60A5FA] status-running',
    FAILED: 'bg-[#F87171]', failed: 'bg-[#F87171]',
    PENDING: 'bg-[#FBBF24]',
  };
  return map[status] || 'bg-[#6B7280]';
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Overview of your CI/CD activity</p>
        </div>
        <Link href="/dashboard/projects/new"
          className="btn-primary text-[13px] px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> New Project
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {mockStats.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-4 stat-glow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] uppercase tracking-wider text-[hsl(220,10%,42%)] font-medium">{stat.label}</span>
              <div className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}18` }}>
                <stat.icon className="w-3.5 h-3.5" style={{ color: stat.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-[#34D399]" />
              <span className="text-[11px] text-[#34D399] font-medium">{stat.change}</span>
              <span className="text-[11px] text-[hsl(220,10%,30%)]">this week</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold">Recent Projects</h2>
            <Link href="/dashboard/projects" className="text-[12px] text-[hsl(225,73%,57%)] hover:text-[hsl(225,73%,65%)] transition-colors flex items-center gap-1">
              View all <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2 stagger-children">
            {mockProjects.map((project) => (
              <Link key={project.id} href={`/dashboard/projects/${project.id}`}
                className="glass-card rounded-lg p-3.5 flex items-center gap-3 group block">
                <div className="w-8 h-8 rounded-md bg-white/[0.03] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <FolderGit2 className="w-4 h-4 text-[hsl(220,10%,42%)] group-hover:text-[#6C8EFF] transition-colors" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-medium group-hover:text-[#6C8EFF] transition-colors">{project.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.03] text-[hsl(220,10%,38%)] border border-white/[0.04]">
                      {project.framework}
                    </span>
                  </div>
                  <span className="text-[11px] text-[hsl(220,10%,32%)]">{project.repo}</span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${statusBadge(project.lastStatus)}`}>
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${statusDot(project.lastStatus)}`} />
                      {project.lastStatus}
                    </span>
                  </span>
                  <span className="text-[11px] text-[hsl(220,10%,30%)] hidden sm:block">{project.updated}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity Feed */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold">Activity</h2>
            <Activity className="w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
          </div>

          <div className="glass-card rounded-xl p-3 space-y-0.5">
            {mockActivity.map((item, i) => (
              <div key={i} className="flex items-start gap-2.5 px-2 py-2 rounded-md hover:bg-white/[0.02] transition-colors">
                <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${statusDot(item.status)}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px]">
                    <span className="font-medium">{item.action}</span>
                    <span className="text-[hsl(220,10%,38%)]"> · {item.project}</span>
                  </p>
                  <p className="text-[11px] text-[hsl(220,10%,30%)]">{item.version}</p>
                </div>
                <span className="text-[10px] text-[hsl(220,10%,28%)] shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
