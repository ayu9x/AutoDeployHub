'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Key, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ProjectSettingsPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [secrets, setSecrets] = useState<any[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.getSecrets(projectId).then((res) => {
      setSecrets(res.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [projectId]);

  const handleAddSecret = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createSecret(projectId, newKey, newValue);
      const res = await api.getSecrets(projectId);
      setSecrets(res.data || []);
      setNewKey('');
      setNewValue('');
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDeleteSecret = async (key: string) => {
    try {
      await api.deleteSecret(projectId, key);
      setSecrets(secrets.filter((s) => s.key !== key));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/projects/${projectId}`} className="p-2 rounded-lg hover:bg-accent text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage secrets and environment variables</p>
        </div>
      </div>

      {/* Secrets Management */}
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-amber-400" />
          Environment Variables & Secrets
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Secrets are encrypted with AES-256 at rest. Values are never exposed in the UI after creation.
        </p>

        {/* Add new secret */}
        <form onSubmit={handleAddSecret} className="flex gap-3 mb-6">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value.toUpperCase())}
            placeholder="KEY_NAME"
            required
            className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono"
          />
          <input
            type="password"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="secret value"
            required
            className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add
          </button>
        </form>

        {/* Secrets list */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : secrets.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No secrets configured</p>
        ) : (
          <div className="space-y-2">
            {secrets.map((secret) => (
              <div key={secret.id} className="flex items-center justify-between p-3 rounded-lg bg-card border border-border">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono text-sm">{secret.key}</span>
                  <span className="text-xs text-muted-foreground">••••••••</span>
                </div>
                <button
                  onClick={() => handleDeleteSecret(secret.key)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
