'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GitBranch, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, formatDuration, getStatusColor, getStatusDot } from '@/lib/utils';

export default function PipelinesListPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects(1, 50).then((res) => {
      setProjects(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pipelines</h1>
        <p className="text-muted-foreground mt-1">View pipeline runs across all projects</p>
      </div>

      {projects.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <GitBranch className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No pipeline runs yet</p>
        </div>
      ) : (
        projects.filter(p => p.pipelines?.length > 0).map((project: any) => (
          <div key={project.id} className="space-y-3">
            <h2 className="text-lg font-semibold">{project.name}</h2>
            {project.pipelines.map((pipeline: any) => (
              <Link
                key={pipeline.id}
                href={`/dashboard/pipelines/${pipeline.id}`}
                className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-all group block"
              >
                <div className={`w-3 h-3 rounded-full ${getStatusDot(pipeline.status)}`} />
                <div className="flex-1">
                  <span className="font-medium group-hover:text-primary transition-colors">
                    Pipeline #{pipeline.number}
                  </span>
                  <span className={`ml-3 text-xs px-2 py-0.5 rounded-full border ${getStatusColor(pipeline.status)}`}>
                    {pipeline.status}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{formatDate(pipeline.createdAt)}</span>
              </Link>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
