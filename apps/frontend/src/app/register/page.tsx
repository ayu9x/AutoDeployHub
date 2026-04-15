'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Rocket, Github, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await api.register(email, password, name);
      api.setToken(response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-mesh noise-overlay relative flex items-center justify-center px-4">
      <Link href="/" className="fixed top-5 left-5 z-20 flex items-center gap-1.5 text-[13px] text-[hsl(220,10%,42%)] hover:text-foreground transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" /> Home
      </Link>

      <div className="w-full max-w-[380px] relative z-10 animate-fade-up">
        <div className="text-center mb-7">
          <Link href="/" className="inline-flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#6C8EFF] to-[#B175FF] flex items-center justify-center">
              <Rocket className="w-4 h-4 text-white" />
            </div>
          </Link>
          <h1 className="text-xl font-bold tracking-tight">Create your account</h1>
          <p className="text-[13px] text-[hsl(220,10%,42%)] mt-1">Start deploying in minutes</p>
        </div>

        <div className="glass-card rounded-xl p-5 space-y-5">
          <button onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 rounded-lg btn-secondary text-[13px]">
            <Github className="w-4 h-4" /> Sign up with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center">
              <span className="px-3 text-[11px] text-[hsl(220,10%,32%)] bg-[hsl(228,16%,10%)] uppercase tracking-wider">or</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            {error && (
              <div className="px-3 py-2 rounded-lg bg-[rgba(248,113,113,0.06)] border border-[rgba(248,113,113,0.12)] text-[#F87171] text-[12px]">{error}</div>
            )}

            <div>
              <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg input-field text-[13px]" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg input-field text-[13px]" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters" required minLength={8}
                  className="w-full pl-9 pr-10 py-2.5 rounded-lg input-field text-[13px]" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(220,10%,32%)] hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg btn-primary text-[13px] font-medium disabled:opacity-50 mt-1">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-[12px] text-[hsl(220,10%,38%)] mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-[hsl(225,73%,57%)] hover:text-[hsl(225,73%,65%)] transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
