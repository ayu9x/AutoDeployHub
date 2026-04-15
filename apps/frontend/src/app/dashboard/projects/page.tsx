'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FolderGit2, Plus, Search } from 'lucide-react';

// Mock projects for demo display
const mockProjects = [
  { id: '1', name: 'nextjs-blog', repoUrl: 'github.com/dev/nextjs-blog', framework: 'Next.js', repoBranch: 'main', status: 'SUCCESS', updatedAt: '2 min ago', pipelines: 42 },
  { id: '2', name: 'api-gateway', repoUrl: 'github.com/dev/api-gateway', framework: 'NestJS', repoBranch: 'main', status: 'RUNNING', updatedAt: '5 min ago', pipelines: 156 },
  { id: '3', name: 'mobile-app', repoUrl: 'github.com/dev/mobile-app', framework: 'React Native', repoBranch: 'develop', status: 'FAILED', updatedAt: '23 min ago', pipelines: 78 },
  { id: '4', name: 'landing-page', repoUrl: 'github.com/dev/landing-page', framework: 'Vite', repoBranch: 'main', status: 'SUCCESS', updatedAt: '1 hr ago', pipelines: 31 },
  { id: '5', name: 'auth-service', repoUrl: 'github.com/dev/auth-service', framework: 'Express', repoBranch: 'main', status: 'SUCCESS', updatedAt: '3 hr ago', pipelines: 94 },
  { id: '6', name: 'data-pipeline', repoUrl: 'github.com/dev/data-pipeline', framework: 'Python', repoBranch: 'main', status: 'PENDING', updatedAt: '5 hr ago', pipelines: 17 },
];

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: 'badge-success', RUNNING: 'badge-running', FAILED: 'badge-failed', PENDING: 'badge-pending',
  };
  return map[status] || 'badge-neutral';
};

const statusDot = (status: string) => {
  const map: Record<string, string> = {
    SUCCESS: 'bg-[#34D399]', RUNNING: 'bg-[#60A5FA] status-running', FAILED: 'bg-[#F87171]', PENDING: 'bg-[#FBBF24]',
  };
  return map[status] || 'bg-[#6B7280]';
};

export default function ProjectsPage() {
  const [search, setSearch] = useState('');

  const filtered = mockProjects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Manage your connected repositories</p>
        </div>
        <Link href="/dashboard/projects/new"
          className="btn-primary text-[13px] px-4 py-2 rounded-lg inline-flex items-center gap-2 shrink-0">
          <Plus className="w-3.5 h-3.5" /> New Project
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(220,10%,28%)]" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg input-field text-[13px]"
        />
      </div>

      {/* Projects Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <FolderGit2 className="w-10 h-10 text-[hsl(220,10%,28%)] mx-auto mb-3" />
          <p className="font-medium text-[14px]">No projects found</p>
          <p className="text-[12px] text-[hsl(220,10%,38%)] mt-1">
            {search ? 'Try a different search term' : 'Create your first project to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 stagger-children">
          {filtered.map((project) => (
            <Link key={project.id} href={`/dashboard/projects/${project.id}`}
              className="glass-card rounded-xl p-4 group block">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4 text-[hsl(220,10%,42%)] group-hover:text-[#6C8EFF] transition-colors" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge(project.status)}`}>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot(project.status)}`} />
                    {project.status}
                  </span>
                </span>
              </div>

              <h3 className="text-[14px] font-semibold group-hover:text-[#6C8EFF] transition-colors tracking-tight">
                {project.name}
              </h3>
              <p className="text-[11px] text-[hsl(220,10%,32%)] mt-0.5 truncate">{project.repoUrl}</p>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/[0.04]">
                <span className="text-[11px] text-[hsl(220,10%,38%)]">
                  <span className="text-[hsl(220,10%,52%)] font-medium">{project.framework}</span>
                </span>
                <span className="text-[11px] text-[hsl(220,10%,32%)]">
                  {project.pipelines} runs
                </span>
                <span className="text-[11px] text-[hsl(220,10%,28%)] ml-auto">{project.updatedAt}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
