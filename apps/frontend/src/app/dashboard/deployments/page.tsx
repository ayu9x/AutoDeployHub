'use client';

import { useState, useEffect } from 'react';
import { Upload, Loader2, ExternalLink, RotateCcw, ArrowUpCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, getStatusColor, getStatusDot } from '@/lib/utils';

export default function DeploymentsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects(1, 50).then(async (res) => {
      const projectsWithDeploys = await Promise.all(
        (res.data || []).map(async (project: any) => {
          try {
            const deploys = await api.getDeployments(project.id);
            return { ...project, deployments: deploys.data || [] };
          } catch {
            return { ...project, deployments: [] };
          }
        })
      );
      setProjects(projectsWithDeploys.filter(p => p.deployments.length > 0));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleRollback = async (id: string) => {
    await api.rollbackDeployment(id);
    window.location.reload();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deployments</h1>
        <p className="text-muted-foreground mt-1">Track deployment history and manage rollbacks</p>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No deployments yet</p>
        </div>
      ) : (
        projects.map((project: any) => (
          <div key={project.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            {project.deployments.map((deploy: any) => (
              <div key={deploy.id} className="glass-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-3 h-3 rounded-full shrink-0 ${getStatusDot(deploy.status)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{deploy.version}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(deploy.status)}`}>
                      {deploy.status}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                      {deploy.environment}
                    </span>
                    <span className="text-xs text-muted-foreground">{deploy.target}</span>
                    {deploy.canary && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400 border border-amber-400/20">
                        Canary {deploy.canaryWeight}%
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pipeline #{deploy.pipeline?.number} • {deploy.pipeline?.branch}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {deploy.targetUrl && (
                    <a href={deploy.targetUrl} target="_blank" rel="noopener"
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-primary transition-colors" title="Visit">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {deploy.status === 'DEPLOYED' && (
                    <button onClick={() => handleRollback(deploy.id)}
                      className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-amber-400 transition-colors" title="Rollback">
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-sm text-muted-foreground">{formatDate(deploy.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
