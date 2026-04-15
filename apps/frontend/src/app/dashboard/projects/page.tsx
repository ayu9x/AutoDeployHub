'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, FolderGit2, GitBranch, Clock, ArrowUpRight, Loader2, Search
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate, getStatusColor, getStatusDot } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getProjects(1, 50).then((res) => {
      setProjects(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.repoUrl.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage your connected repositories</p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search projects..."
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <FolderGit2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? 'No projects match your search' : 'No projects yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((project: any) => {
            const lastPipeline = project.pipelines?.[0];
            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="glass-card rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-primary/20 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-border shrink-0">
                  <FolderGit2 className="w-6 h-6 text-primary" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    {project.framework && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground">
                        {project.framework}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">{project.repoUrl}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground mt-1 hidden sm:block">{project.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  {lastPipeline && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${getStatusColor(lastPipeline.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${getStatusDot(lastPipeline.status)}`} />
                      {lastPipeline.status}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1" title="Pipelines">
                      <GitBranch className="w-3 h-3" />
                      {project._count?.pipelines || 0}
                    </span>
                    <span className="flex items-center gap-1 hidden sm:flex" title="Last updated">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.updatedAt)}
                    </span>
                  </div>

                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
