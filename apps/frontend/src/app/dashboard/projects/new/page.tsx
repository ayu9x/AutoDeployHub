'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, FolderGit2, GitBranch, Globe, Loader2 } from 'lucide-react';

const frameworks = [
  { value: 'nextjs', label: 'Next.js', color: '#60A5FA' },
  { value: 'react', label: 'React', color: '#60A5FA' },
  { value: 'vue', label: 'Vue.js', color: '#34D399' },
  { value: 'nestjs', label: 'NestJS', color: '#F87171' },
  { value: 'express', label: 'Express', color: '#FBBF24' },
  { value: 'go', label: 'Go', color: '#60A5FA' },
  { value: 'python', label: 'Python', color: '#FBBF24' },
  { value: 'static', label: 'Static Site', color: '#A78BFA' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [framework, setFramework] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Demo: simulate creation
    await new Promise(r => setTimeout(r, 1500));
    router.push('/dashboard/projects');
  };

  return (
    <div className="max-w-lg mx-auto animate-fade-up">
      <div className="flex items-center gap-2.5 mb-6">
        <Link href="/dashboard/projects" className="p-1.5 rounded-md hover:bg-white/[0.03] text-[hsl(220,10%,42%)] transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">New Project</h1>
          <p className="text-[12px] text-[hsl(220,10%,42%)]">Connect a Git repository</p>
        </div>
      </div>

      <form onSubmit={handleCreate} className="space-y-4">
        <div className="glass-card rounded-xl p-5 space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">
              Project Name
            </label>
            <div className="relative">
              <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="my-awesome-app" required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg input-field text-[13px]" />
            </div>
          </div>

          {/* Repo URL */}
          <div>
            <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">
              Repository URL
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
              <input type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/user/repo" required
                className="w-full pl-9 pr-3 py-2.5 rounded-lg input-field text-[13px]" />
            </div>
          </div>

          {/* Branch */}
          <div>
            <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">
              Branch
            </label>
            <div className="relative">
              <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
              <input type="text" value={branch} onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full pl-9 pr-3 py-2.5 rounded-lg input-field text-[13px]" />
            </div>
          </div>
        </div>

        {/* Framework Selection */}
        <div className="glass-card rounded-xl p-5">
          <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-3 uppercase tracking-wider">
            Framework
          </label>
          <div className="grid grid-cols-2 gap-2">
            {frameworks.map(f => (
              <button key={f.value} type="button" onClick={() => setFramework(f.value)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                  framework === f.value
                    ? 'bg-[hsl(225,73%,57%,0.1)] border border-[hsl(225,73%,57%,0.25)] text-foreground'
                    : 'bg-white/[0.02] border border-white/[0.04] text-[hsl(220,10%,42%)] hover:border-white/[0.08] hover:text-foreground'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ background: f.color }} />
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading || !name || !repoUrl}
          className="w-full py-2.5 rounded-lg btn-primary text-[13px] font-medium disabled:opacity-40 disabled:cursor-not-allowed">
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating Project...
            </span>
          ) : 'Create Project'}
        </button>
      </form>
    </div>
  );
}
