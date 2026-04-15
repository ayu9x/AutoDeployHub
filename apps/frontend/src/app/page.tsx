'use client';

import Link from 'next/link';
import { ArrowRight, GitBranch, Zap, Shield, BarChart3, Rocket, Container, Play, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: GitBranch,
    title: 'Git-Native Workflows',
    description: 'Push to any branch and trigger builds automatically. Deep GitHub integration with webhook management.',
    color: '#60A5FA',
    bg: 'rgba(96, 165, 250, 0.08)',
    border: 'rgba(96, 165, 250, 0.12)',
  },
  {
    icon: Zap,
    title: 'Pipeline Automation',
    description: 'Define multi-step pipelines in YAML. Parallel execution, caching, retries — all built in.',
    color: '#FBBF24',
    bg: 'rgba(251, 191, 36, 0.08)',
    border: 'rgba(251, 191, 36, 0.12)',
  },
  {
    icon: Container,
    title: 'Container-First Deploys',
    description: 'Deploy to Kubernetes clusters, Docker registries, or static CDN hosting in seconds.',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.08)',
    border: 'rgba(167, 139, 250, 0.12)',
  },
  {
    icon: BarChart3,
    title: 'Live Monitoring',
    description: 'Stream build logs in real-time via WebSocket. Track every step with millisecond precision.',
    color: '#34D399',
    bg: 'rgba(52, 211, 153, 0.08)',
    border: 'rgba(52, 211, 153, 0.12)',
  },
  {
    icon: Shield,
    title: 'Encrypted Secrets',
    description: 'AES-256 encrypted environment variables. Zero-knowledge architecture — values never leave your cluster.',
    color: '#F87171',
    bg: 'rgba(248, 113, 113, 0.08)',
    border: 'rgba(248, 113, 113, 0.12)',
  },
  {
    icon: Rocket,
    title: 'Canary & Rollback',
    description: 'Progressive traffic shifting with canary deployments. One-click rollback to any previous version.',
    color: '#C084FC',
    bg: 'rgba(192, 132, 252, 0.08)',
    border: 'rgba(192, 132, 252, 0.12)',
  },
];

const pipelineSteps = [
  { name: 'Install', status: 'success', duration: '12s' },
  { name: 'Lint', status: 'success', duration: '8s' },
  { name: 'Build', status: 'success', duration: '34s' },
  { name: 'Test', status: 'success', duration: '21s' },
  { name: 'Deploy', status: 'running', duration: '...' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-mesh noise-overlay relative">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/[0.04] bg-[hsla(228,14%,7%,0.85)] backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-[#6C8EFF] to-[#B175FF] flex items-center justify-center">
              <Rocket className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-[15px] font-semibold tracking-tight">AutoDeployHub</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[13px] text-[hsl(220,10%,52%)] hover:text-foreground transition-colors px-3 py-1.5">
              Sign In
            </Link>
            <Link href="/register" className="btn-primary text-[13px] px-4 py-1.5 rounded-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-28 pb-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-[12px] text-[hsl(220,10%,52%)] mb-8 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
            Now in Public Beta
          </div>

          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-0.035em] mb-6">
            <span className="gradient-text">Ship faster</span>
            <br />
            <span className="text-foreground">with zero config CI/CD</span>
          </h1>

          <p className="text-[17px] leading-relaxed text-[hsl(220,10%,48%)] max-w-xl mx-auto mb-10">
            Connect your repo, push your code, and deploy to production.
            AutoDeployHub handles the rest — pipelines, containers, monitoring, and rollbacks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/register" className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px]">
              Start Deploying Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/login" className="btn-secondary inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px]">
              <Play className="w-3.5 h-3.5" />
              Live Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── Live Pipeline Preview ── */}
      <section className="px-6 pb-24 relative z-10">
        <div className="max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="glass-card rounded-xl overflow-hidden">
            {/* Terminal header */}
            <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/[0.04]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
              </div>
              <span className="text-[11px] text-[hsl(220,10%,38%)] font-mono">Pipeline #42 — next-app / main</span>
              <div className="ml-auto flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#60A5FA] status-running" />
                <span className="text-[11px] text-[#60A5FA]">Running</span>
              </div>
            </div>

            {/* Pipeline steps */}
            <div className="p-4 space-y-1">
              {pipelineSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/[0.02] transition-colors">
                  {step.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-[#60A5FA] border-t-transparent animate-spin shrink-0" />
                  )}
                  <span className="text-[13px] font-medium flex-1">{step.name}</span>
                  <span className="text-[12px] font-mono text-[hsl(220,10%,38%)]">{step.duration}</span>
                </div>
              ))}
            </div>

            {/* Simulated log output */}
            <div className="border-t border-white/[0.04] p-4 bg-[hsla(228,16%,6%,0.5)]">
              <div className="log-viewer space-y-0.5 text-[hsl(220,10%,42%)]">
                <div><span className="text-[#34D399]">✓</span> All tests passed (47 specs, 0 failures)</div>
                <div><span className="text-[#60A5FA]">→</span> Building Docker image...</div>
                <div><span className="text-[#60A5FA]">→</span> Pushing to ECR registry <span className="text-[hsl(220,10%,30%)]">autodeployhub/next-app:ab3f7c2</span></div>
                <div className="flex items-center gap-2">
                  <span className="text-[#FBBF24]">⏳</span>
                  <span>Deploying to production cluster...</span>
                  <span className="inline-block w-3 h-3 border border-[#60A5FA] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="px-6 pb-28 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] uppercase tracking-widest text-[hsl(225,73%,57%)] font-medium mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-[2.5rem] font-bold tracking-tight">Everything you need to ship</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
            {features.map((f, i) => (
              <div
                key={i}
                className="glass-card rounded-xl p-5 group cursor-default"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-105"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <f.icon className="w-[18px] h-[18px]" style={{ color: f.color }} />
                </div>
                <h3 className="text-[15px] font-semibold mb-1.5 tracking-tight">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-[hsl(220,10%,45%)]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="px-6 pb-24 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '99.9%', label: 'Uptime SLA' },
              { value: '<2s', label: 'Deploy Latency' },
              { value: '10K+', label: 'Pipelines/day' },
              { value: '256-bit', label: 'Encryption' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold gradient-text-subtle">{stat.value}</div>
                <div className="text-[12px] text-[hsl(220,10%,42%)] mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-20 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">Ready to automate your deployments?</h2>
          <p className="text-[hsl(220,10%,45%)] mb-8">
            Start building pipelines in under 2 minutes. No credit card required.
          </p>
          <Link href="/register" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-lg text-[15px]">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.04] py-6 px-6 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#6C8EFF] to-[#B175FF] flex items-center justify-center">
              <Rocket className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-[13px] font-medium">AutoDeployHub</span>
          </div>
          <div className="flex items-center gap-6 text-[12px] text-[hsl(220,10%,38%)]">
            <span>Documentation</span>
            <span>Changelog</span>
            <span>Status</span>
            <span>GitHub</span>
          </div>
          <span className="text-[12px] text-[hsl(220,10%,30%)]">© 2024 AutoDeployHub</span>
        </div>
      </footer>
    </div>
  );
}
