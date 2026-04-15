'use client';

import { useState } from 'react';
import { Bell, GitBranch, Database, Shield, Trash2 } from 'lucide-react';

const ToggleSwitch = ({ defaultChecked = true }: { defaultChecked?: boolean }) => {
  const [on, setOn] = useState(defaultChecked);
  return (
    <button onClick={() => setOn(!on)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 ${
        on ? 'bg-[hsl(225,73%,57%)]' : 'bg-[hsl(228,14%,16%)]'
      }`}>
      <span className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full bg-white shadow transition-transform duration-200 ${
        on ? 'translate-x-[18px]' : ''
      }`} style={{ width: 18, height: 18 }} />
    </button>
  );
};

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Account and platform configuration</p>
      </div>

      {/* Notifications */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-[#60A5FA]" />
          Notifications
        </h2>
        <div className="space-y-0">
          {[
            { label: 'Pipeline Failures', desc: 'Get notified when a pipeline fails', default: true },
            { label: 'Deployment Success', desc: 'Notify on successful deployments', default: true },
            { label: 'Security Alerts', desc: 'Vulnerability and dependency alerts', default: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="text-[13px] font-medium">{item.label}</p>
                <p className="text-[11px] text-[hsl(220,10%,38%)]">{item.desc}</p>
              </div>
              <ToggleSwitch defaultChecked={item.default} />
            </div>
          ))}
        </div>
      </div>

      {/* Build Configuration */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
          <Database className="w-4 h-4 text-[#A78BFA]" />
          Build Configuration
        </h2>
        <div className="space-y-0">
          {[
            { label: 'Auto-deploy on push', desc: 'Deploy automatically when pushing to main', default: true },
            { label: 'Build Cache', desc: 'Cache dependencies between builds for speed', default: true },
            { label: 'Parallel Steps', desc: 'Execute independent steps in parallel', default: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
              <div>
                <p className="text-[13px] font-medium">{item.label}</p>
                <p className="text-[11px] text-[hsl(220,10%,38%)]">{item.desc}</p>
              </div>
              <ToggleSwitch defaultChecked={item.default} />
            </div>
          ))}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#FBBF24]" />
          Security
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-medium">Two-Factor Authentication</p>
              <p className="text-[11px] text-[hsl(220,10%,38%)]">Add extra security to your account</p>
            </div>
            <button className="btn-secondary text-[12px] px-3 py-1.5 rounded-md">Enable</button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.04]">
            <div>
              <p className="text-[13px] font-medium">API Token</p>
              <p className="text-[11px] text-[hsl(220,10%,38%)]">Manage personal access tokens</p>
            </div>
            <button className="btn-secondary text-[12px] px-3 py-1.5 rounded-md">Generate</button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card rounded-xl p-5" style={{ borderColor: 'rgba(248,113,113,0.12)' }}>
        <h2 className="text-[14px] font-semibold text-[#F87171] mb-4">Danger Zone</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium">Delete Account</p>
            <p className="text-[11px] text-[hsl(220,10%,38%)]">Permanently remove your account and all data</p>
          </div>
          <button className="text-[12px] px-3 py-1.5 rounded-md border border-[rgba(248,113,113,0.2)] text-[#F87171] hover:bg-[rgba(248,113,113,0.06)] transition-colors flex items-center gap-1.5">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
