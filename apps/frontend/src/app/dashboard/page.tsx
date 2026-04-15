'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderGit2, GitBranch, Upload, Activity,
  ArrowUpRight, TrendingUp, Clock, CheckCircle2, XCircle, Loader2,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, formatDuration, getStatusColor, getStatusDot } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getMyStats().catch(() => ({ data: { projectCount: 0, pipelineCount: 0, deploymentCount: 0 } })),
      api.getProjects(1, 5).catch(() => ({ data: [] })),
    ]).then(([statsRes, projectsRes]) => {
      setStats(statsRes.data);
      setProjects(projectsRes.data || []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Projects',
      value: stats?.projectCount || 0,
      icon: FolderGit2,
      gradient: 'from-blue-500 to-cyan-500',
      change: '+2 this week',
    },
    {
      label: 'Pipeline Runs',
      value: stats?.pipelineCount || 0,
      icon: GitBranch,
      gradient: 'from-purple-500 to-pink-500',
      change: '+12 this week',
    },
    {
      label: 'Deployments',
      value: stats?.deploymentCount || 0,
      icon: Upload,
      gradient: 'from-emerald-500 to-teal-500',
      change: '+5 this week',
    },
    {
      label: 'Success Rate',
      value: '94%',
      icon: TrendingUp,
      gradient: 'from-amber-500 to-orange-500',
      change: '+3% vs last week',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your CI/CD pipelines and deployments</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <div key={i} className="glass-card rounded-xl p-5 hover:border-primary/20 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
                <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </p>
              </div>
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Link
            href="/dashboard/projects"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            View all <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <FolderGit2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-4">Connect a repository to get started</p>
            <Link
              href="/dashboard/projects/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {projects.map((project: any) => {
              const lastPipeline = project.pipelines?.[0];
              return (
                <Link
                  key={project.id}
                  href={`/dashboard/projects/${project.id}`}
                  className="glass-card rounded-xl p-5 flex items-center gap-4 hover:border-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-border">
                    <FolderGit2 className="w-5 h-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate">
                      {project.repoUrl}
                    </p>
                  </div>

                  {lastPipeline && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className={`flex items-center gap-2 px-2.5 py-1 rounded-full border ${getStatusColor(lastPipeline.status)}`}>
                        <div className={`w-2 h-2 rounded-full ${getStatusDot(lastPipeline.status)}`} />
                        {lastPipeline.status}
                      </div>
                      <span className="text-muted-foreground hidden sm:block">
                        #{lastPipeline.number}
                      </span>
                    </div>
                  )}

                  <div className="text-sm text-muted-foreground hidden md:flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(project.updatedAt || project.createdAt)}
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/dashboard/projects/new"
            className="glass-card rounded-xl p-5 text-center hover:border-primary/20 transition-all group"
          >
            <FolderGit2 className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium">New Project</h3>
            <p className="text-sm text-muted-foreground mt-1">Connect a repository</p>
          </Link>

          <Link
            href="/dashboard/pipelines"
            className="glass-card rounded-xl p-5 text-center hover:border-primary/20 transition-all group"
          >
            <GitBranch className="w-8 h-8 text-purple-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium">View Pipelines</h3>
            <p className="text-sm text-muted-foreground mt-1">Monitor build status</p>
          </Link>

          <Link
            href="/dashboard/deployments"
            className="glass-card rounded-xl p-5 text-center hover:border-primary/20 transition-all group"
          >
            <Upload className="w-8 h-8 text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-medium">Deployments</h3>
            <p className="text-sm text-muted-foreground mt-1">Deployment history</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
