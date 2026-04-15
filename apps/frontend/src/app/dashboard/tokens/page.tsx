'use client';

import { useState } from 'react';
import { Key, Plus, Trash2, Copy, Check, Clock, Shield, AlertTriangle } from 'lucide-react';

const mockTokens = [
  { id: 't1', name: 'CI Bot', prefix: 'adh_a3f7bc2e', scopes: ['read:projects', 'write:pipelines'], lastUsed: '2 min ago', created: 'Jan 15, 2024', expires: 'Jul 15, 2024' },
  { id: 't2', name: 'GitHub Actions', prefix: 'adh_8e4d1f9c', scopes: ['read:projects', 'write:pipelines', 'write:deployments'], lastUsed: '1 hr ago', created: 'Feb 20, 2024', expires: 'Never' },
  { id: 't3', name: 'Monitoring Script', prefix: 'adh_2b5c7a1d', scopes: ['read:projects', 'read:pipelines'], lastUsed: '3 days ago', created: 'Mar 5, 2024', expires: 'Sep 5, 2024' },
];

const availableScopes = [
  { value: 'read:projects', label: 'Read projects', desc: 'View project details' },
  { value: 'write:projects', label: 'Write projects', desc: 'Create and modify projects' },
  { value: 'read:pipelines', label: 'Read pipelines', desc: 'View pipeline runs and logs' },
  { value: 'write:pipelines', label: 'Write pipelines', desc: 'Trigger and cancel pipelines' },
  { value: 'write:deployments', label: 'Write deployments', desc: 'Create deployments and rollbacks' },
  { value: 'read:secrets', label: 'Read secrets', desc: 'View secret names (not values)' },
  { value: 'write:secrets', label: 'Write secrets', desc: 'Create and delete secrets' },
];

export default function TokensPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [newTokenName, setNewTokenName] = useState('');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresIn, setExpiresIn] = useState('90d');
  const [newToken, setNewToken] = useState('');
  const [copied, setCopied] = useState(false);

  const toggleScope = (scope: string) => {
    setSelectedScopes(prev => prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]);
  };

  const handleCreate = () => {
    setNewToken('adh_' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join(''));
    setShowCreate(false);
  };

  const copyToken = () => {
    navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Tokens</h1>
          <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Manage personal access tokens for API access</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)}
          className="btn-primary text-[13px] px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> New Token
        </button>
      </div>

      {/* Newly Created Token Warning */}
      {newToken && (
        <div className="glass-card rounded-xl p-4 animate-fade-up" style={{ borderColor: 'rgba(251,191,36,0.2)' }}>
          <div className="flex items-start gap-2.5 mb-3">
            <AlertTriangle className="w-4 h-4 text-[#FBBF24] shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-medium text-[#FBBF24]">Copy your token now</p>
              <p className="text-[11px] text-[hsl(220,10%,38%)]">This is the only time it will be shown. Store it securely.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 rounded-lg bg-[hsla(228,16%,6%,0.8)] border border-white/[0.06] text-[12px] font-mono text-foreground truncate">
              {newToken}
            </code>
            <button onClick={copyToken} className="btn-primary text-[12px] px-3 py-2 rounded-lg flex items-center gap-1.5 shrink-0">
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card rounded-xl p-5 space-y-4 animate-fade-up">
          <div>
            <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">Token Name</label>
            <input type="text" value={newTokenName} onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="e.g. CI Bot, GitHub Actions" className="w-full px-3 py-2.5 rounded-lg input-field text-[13px]" />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-2 uppercase tracking-wider">Scopes</label>
            <div className="space-y-1.5">
              {availableScopes.map(scope => (
                <label key={scope.value}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                    selectedScopes.includes(scope.value) ? 'bg-[hsl(225,73%,57%,0.06)] border border-[hsl(225,73%,57%,0.15)]' : 'bg-white/[0.01] border border-white/[0.04] hover:border-white/[0.08]'
                  }`}>
                  <input type="checkbox" checked={selectedScopes.includes(scope.value)} onChange={() => toggleScope(scope.value)}
                    className="w-3.5 h-3.5 rounded border-white/20 accent-[hsl(225,73%,57%)]" />
                  <div>
                    <p className="text-[12px] font-medium">{scope.label}</p>
                    <p className="text-[10px] text-[hsl(220,10%,32%)]">{scope.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[hsl(220,10%,52%)] mb-1.5 uppercase tracking-wider">Expiration</label>
            <div className="flex gap-2">
              {['30d', '90d', '180d', '365d', 'never'].map(e => (
                <button key={e} onClick={() => setExpiresIn(e)}
                  className={`text-[12px] px-3 py-1.5 rounded-md transition-colors ${
                    expiresIn === e ? 'bg-[hsl(225,73%,57%,0.1)] text-[hsl(225,73%,57%)] border border-[hsl(225,73%,57%,0.2)]' : 'btn-secondary'
                  }`}>{e === 'never' ? 'Never' : e}</button>
              ))}
            </div>
          </div>

          <button onClick={handleCreate} disabled={!newTokenName || selectedScopes.length === 0}
            className="btn-primary text-[13px] px-5 py-2.5 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed">
            Generate Token
          </button>
        </div>
      )}

      {/* Existing Tokens */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
          <Key className="w-4 h-4 text-[#A78BFA]" /> Active Tokens ({mockTokens.length})
        </h2>
        <div className="space-y-2">
          {mockTokens.map(token => (
            <div key={token.id} className="flex items-center gap-3 px-3 py-3 rounded-lg bg-white/[0.01] border border-white/[0.03]">
              <Shield className="w-4 h-4 text-[hsl(220,10%,32%)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-[13px] font-medium">{token.name}</p>
                  <code className="text-[10px] font-mono text-[hsl(220,10%,32%)] bg-white/[0.02] px-1.5 py-0.5 rounded">{token.prefix}...</code>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-[10px] text-[hsl(220,10%,28%)]">{token.scopes.length} scopes</span>
                  <span className="text-[10px] text-[hsl(220,10%,28%)]">Last used: {token.lastUsed}</span>
                  <span className="text-[10px] text-[hsl(220,10%,28%)] flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" /> Expires: {token.expires}
                  </span>
                </div>
              </div>
              <button className="p-1.5 rounded-md hover:bg-white/[0.03] text-[hsl(220,10%,32%)] hover:text-[#F87171] transition-colors" title="Revoke">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
