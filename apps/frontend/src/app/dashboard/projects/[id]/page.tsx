'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, GitBranch, Play, Clock, Settings, Upload, Loader2,
  ExternalLink, RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, formatDuration, getStatusColor, getStatusDot } from '@/lib/utils';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const projectId = params.id as string;

  useEffect(() => {
    api.getProject(projectId).then((res) => {
      setProject(res.data);
      setLoading(false);
    }).catch(() => router.push('/dashboard/projects'));
  }, [projectId, router]);

  const handleRunPipeline = async () => {
    setRunning(true);
    try {
      await api.runPipeline(projectId);
      const res = await api.getProject(projectId);
      setProject(res.data);
    } catch (err) {
      console.error(err);
    }
    setRunning(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/projects" className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project?.name}</h1>
            <p className="text-sm text-muted-foreground mt-1">{project?.repoUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${projectId}/settings`}
            className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-accent transition-colors flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
          <button
            onClick={handleRunPipeline}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            Run Pipeline
          </button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Branch</p>
          <p className="font-medium flex items-center gap-2 mt-1">
            <GitBranch className="w-4 h-4 text-primary" />
            {project?.repoBranch || 'main'}
          </p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Framework</p>
          <p className="font-medium mt-1">{project?.framework || 'Auto-detect'}</p>
        </div>
        <div className="glass-card rounded-xl p-4">
          <p className="text-sm text-muted-foreground">Total Pipelines</p>
          <p className="font-medium mt-1">{project?._count?.pipelines || 0}</p>
        </div>
      </div>

      {/* Recent Pipelines */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Pipelines</h2>
        {(!project?.pipelines || project.pipelines.length === 0) ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <GitBranch className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No pipelines yet. Run your first pipeline!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.pipelines.map((pipeline: any) => (
              <Link
                key={pipeline.id}
                href={`/dashboard/pipelines/${pipeline.id}`}
                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all group"
              >
                <div className={`w-3 h-3 rounded-full ${getStatusDot(pipeline.status)}`} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Pipeline #{pipeline.number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {pipeline.commitMsg || pipeline.trigger} • {pipeline.branch}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {pipeline.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(pipeline.duration)}
                    </span>
                  )}
                  <span>{formatDate(pipeline.createdAt)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Deployments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Deployments</h2>
        {(!project?.deployments || project.deployments.length === 0) ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No deployments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {project.deployments.map((deploy: any) => (
              <div key={deploy.id} className="glass-card rounded-xl p-4 flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${getStatusDot(deploy.status)}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{deploy.version}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(deploy.status)}`}>
                      {deploy.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{deploy.environment}</span>
                  </div>
                </div>
                {deploy.targetUrl && (
                  <a href={deploy.targetUrl} target="_blank" rel="noopener" className="text-primary hover:underline text-sm flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                )}
                <span className="text-sm text-muted-foreground">{formatDate(deploy.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
