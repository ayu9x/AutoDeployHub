'use client';

import { TrendingUp, TrendingDown, BarChart3, Clock, Zap, ShieldAlert, ArrowUpRight, GitBranch, Upload, CheckCircle2, XCircle } from 'lucide-react';

// DORA Metrics mock data
const doraMetrics = [
  { label: 'Deployment Frequency', value: '4.2/day', trend: '+18%', good: true, icon: Zap, description: 'Elite (multiple deploys/day)', color: '#34D399' },
  { label: 'Lead Time for Changes', value: '47 min', trend: '-12%', good: true, icon: Clock, description: 'Elite (<1 hour)', color: '#60A5FA' },
  { label: 'Change Failure Rate', value: '3.8%', trend: '-2.1%', good: true, icon: ShieldAlert, description: 'Elite (<5%)', color: '#A78BFA' },
  { label: 'Mean Time to Recovery', value: '14 min', trend: '-8%', good: true, icon: TrendingDown, description: 'Elite (<1 hour)', color: '#FBBF24' },
];

const pipelineChart = [
  { day: 'Mon', success: 12, failed: 1 },
  { day: 'Tue', success: 18, failed: 2 },
  { day: 'Wed', success: 14, failed: 0 },
  { day: 'Thu', success: 22, failed: 3 },
  { day: 'Fri', success: 19, failed: 1 },
  { day: 'Sat', success: 6, failed: 0 },
  { day: 'Sun', success: 4, failed: 0 },
];

const maxPipelines = Math.max(...pipelineChart.map(d => d.success + d.failed));

const topProjects = [
  { name: 'api-gateway', pipelines: 156, successRate: 94.2 },
  { name: 'nextjs-blog', pipelines: 42, successRate: 97.6 },
  { name: 'auth-service', pipelines: 94, successRate: 98.9 },
  { name: 'mobile-app', pipelines: 78, successRate: 87.2 },
  { name: 'landing-page', pipelines: 31, successRate: 100 },
];

const buildTimesTrend = [47, 52, 44, 39, 42, 38, 41, 36, 34, 38, 32, 35];
const maxBuildTime = Math.max(...buildTimesTrend);

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">DORA metrics and pipeline performance</p>
        </div>
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map(p => (
            <button key={p} className={`text-[12px] px-3 py-1.5 rounded-md transition-colors ${
              p === '30d' ? 'bg-[hsl(225,73%,57%,0.1)] text-[hsl(225,73%,57%)] border border-[hsl(225,73%,57%,0.2)]' : 'btn-secondary'
            }`}>{p}</button>
          ))}
        </div>
      </div>

      {/* DORA Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 stagger-children">
        {doraMetrics.map((metric, i) => (
          <div key={i} className="glass-card rounded-xl p-4 stat-glow">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] uppercase tracking-wider text-[hsl(220,10%,42%)] font-medium">{metric.label}</span>
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: `${metric.color}10`, border: `1px solid ${metric.color}18` }}>
                <metric.icon className="w-3.5 h-3.5" style={{ color: metric.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold tracking-tight">{metric.value}</div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#34D399]" />
                <span className="text-[11px] text-[#34D399] font-medium">{metric.trend}</span>
              </span>
              <span className="text-[10px] text-[hsl(220,10%,30%)]">{metric.description}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pipeline Activity Chart */}
        <div className="lg:col-span-2 glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[14px] font-semibold flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-[#A78BFA]" /> Pipeline Activity
            </h2>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34D399]" /> Success</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#F87171]" /> Failed</span>
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-40">
            {pipelineChart.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '128px' }}>
                  <div className="w-full flex flex-col justify-end h-full gap-0.5">
                    {d.failed > 0 && (
                      <div className="w-full rounded-t bg-[#F87171]/60 transition-all" style={{ height: `${(d.failed / maxPipelines) * 100}%`, minHeight: '4px' }} />
                    )}
                    <div className="w-full rounded-t bg-[#34D399]/60 transition-all" style={{ height: `${(d.success / maxPipelines) * 100}%`, minHeight: '4px' }} />
                  </div>
                </div>
                <span className="text-[10px] text-[hsl(220,10%,32%)]">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Projects */}
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-[14px] font-semibold mb-4">Top Projects</h2>
          <div className="space-y-3">
            {topProjects.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-[12px] font-mono text-[hsl(220,10%,32%)] w-4">#{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium truncate">{p.name}</p>
                  <p className="text-[11px] text-[hsl(220,10%,32%)]">{p.pipelines} runs</p>
                </div>
                <div className="text-right">
                  <p className="text-[13px] font-semibold" style={{ color: p.successRate >= 95 ? '#34D399' : p.successRate >= 90 ? '#FBBF24' : '#F87171' }}>
                    {p.successRate}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Build Time Trend */}
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[14px] font-semibold flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#60A5FA]" /> Average Build Time (seconds)
          </h2>
          <span className="text-[12px] text-[#34D399] flex items-center gap-1">
            <TrendingDown className="w-3 h-3" /> 25% faster
          </span>
        </div>
        <div className="flex items-end gap-1.5 h-24">
          {buildTimesTrend.map((t, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full rounded-t transition-all hover:opacity-80"
                style={{
                  height: `${(t / maxBuildTime) * 100}%`,
                  background: `linear-gradient(180deg, hsla(225,73%,57%,0.6) 0%, hsla(225,73%,57%,0.2) 100%)`,
                  minHeight: '2px',
                }} />
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-[hsl(220,10%,28%)]">12 weeks ago</span>
          <span className="text-[10px] text-[hsl(220,10%,28%)]">This week</span>
        </div>
      </div>
    </div>
  );
}
