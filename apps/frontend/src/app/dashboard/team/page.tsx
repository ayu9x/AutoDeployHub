'use client';

import { useState } from 'react';
import { Users, Mail, Shield, Crown, UserMinus, Plus, Copy, Check } from 'lucide-react';

const mockMembers = [
  { id: '1', name: 'Rajay (You)', email: 'rajay@autodeployhub.com', role: 'OWNER', avatar: 'R', joinedAt: 'Jan 2024' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@company.com', role: 'ADMIN', avatar: 'S', joinedAt: 'Feb 2024' },
  { id: '3', name: 'Alex Kumar', email: 'alex@company.com', role: 'MEMBER', avatar: 'A', joinedAt: 'Mar 2024' },
  { id: '4', name: 'Jordan Lee', email: 'jordan@company.com', role: 'VIEWER', avatar: 'J', joinedAt: 'Apr 2024' },
];

const mockInvites = [
  { id: 'i1', email: 'mike@company.com', role: 'MEMBER', status: 'PENDING', sentAt: '2 days ago' },
];

const roleBadge = (role: string) => {
  const m: Record<string, string> = {
    OWNER: 'bg-[rgba(251,191,36,0.08)] text-[#FBBF24] border-[rgba(251,191,36,0.15)]',
    ADMIN: 'bg-[rgba(167,139,250,0.08)] text-[#A78BFA] border-[rgba(167,139,250,0.15)]',
    MEMBER: 'bg-[rgba(96,165,250,0.08)] text-[#60A5FA] border-[rgba(96,165,250,0.15)]',
    VIEWER: 'bg-[rgba(156,163,175,0.08)] text-[#9CA3AF] border-[rgba(156,163,175,0.15)]',
  };
  return m[role] || '';
};

export default function TeamPage() {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [showInvite, setShowInvite] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText('https://app.autodeployhub.com/invite/abc123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team</h1>
          <p className="text-[13px] text-[hsl(220,10%,42%)] mt-0.5">Manage your team members and permissions</p>
        </div>
        <button onClick={() => setShowInvite(!showInvite)}
          className="btn-primary text-[13px] px-4 py-2 rounded-lg inline-flex items-center gap-2">
          <Plus className="w-3.5 h-3.5" /> Invite
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <div className="glass-card rounded-xl p-5 animate-fade-up">
          <h3 className="text-[14px] font-semibold mb-3">Invite team member</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[hsl(220,10%,32%)]" />
              <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@company.com" className="w-full pl-9 pr-3 py-2.5 rounded-lg input-field text-[13px]" />
            </div>
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2.5 rounded-lg input-field text-[13px] min-w-[130px]">
              <option value="ADMIN">Admin</option>
              <option value="MEMBER">Member</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button className="btn-primary text-[13px] px-5 py-2.5 rounded-lg shrink-0">Send Invite</button>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[0.04]">
            <span className="text-[11px] text-[hsl(220,10%,32%)]">Or share invite link:</span>
            <button onClick={copyInviteLink} className="btn-secondary text-[11px] px-2.5 py-1 rounded-md flex items-center gap-1.5">
              {copied ? <Check className="w-3 h-3 text-[#34D399]" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-[#60A5FA]" /> Members ({mockMembers.length})
        </h2>
        <div className="space-y-0.5">
          {mockMembers.map(member => (
            <div key={member.id} className="flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C8EFF] to-[#B175FF] flex items-center justify-center text-[12px] font-bold text-white shrink-0">
                {member.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{member.name}</p>
                <p className="text-[11px] text-[hsl(220,10%,32%)]">{member.email}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${roleBadge(member.role)}`}>
                {member.role === 'OWNER' && <Crown className="w-2.5 h-2.5 inline mr-1" />}
                {member.role}
              </span>
              <span className="text-[10px] text-[hsl(220,10%,28%)] hidden sm:block">{member.joinedAt}</span>
              {member.role !== 'OWNER' && (
                <button className="p-1.5 rounded-md hover:bg-white/[0.03] text-[hsl(220,10%,28%)] hover:text-[#F87171] transition-colors" title="Remove">
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Pending Invites */}
      {mockInvites.length > 0 && (
        <div className="glass-card rounded-xl p-5">
          <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-[#FBBF24]" /> Pending Invites
          </h2>
          <div className="space-y-2">
            {mockInvites.map(invite => (
              <div key={invite.id} className="flex items-center gap-3 px-2 py-2.5 rounded-md bg-white/[0.01]">
                <Mail className="w-4 h-4 text-[hsl(220,10%,32%)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px]">{invite.email}</p>
                  <p className="text-[11px] text-[hsl(220,10%,28%)]">Sent {invite.sentAt}</p>
                </div>
                <span className="badge-pending text-[10px] px-2 py-0.5 rounded-full font-medium">{invite.status}</span>
                <button className="text-[11px] text-[#F87171] hover:underline">Revoke</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Permissions Reference */}
      <div className="glass-card rounded-xl p-5">
        <h2 className="text-[14px] font-semibold flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-[#34D399]" /> Role Permissions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[hsl(220,10%,38%)] border-b border-white/[0.04]">
                <th className="py-2 pr-4 font-medium">Permission</th>
                <th className="py-2 px-3 font-medium text-center">Owner</th>
                <th className="py-2 px-3 font-medium text-center">Admin</th>
                <th className="py-2 px-3 font-medium text-center">Member</th>
                <th className="py-2 px-3 font-medium text-center">Viewer</th>
              </tr>
            </thead>
            <tbody>
              {[
                { perm: 'View projects', owner: true, admin: true, member: true, viewer: true },
                { perm: 'Run pipelines', owner: true, admin: true, member: true, viewer: false },
                { perm: 'Create projects', owner: true, admin: true, member: false, viewer: false },
                { perm: 'Manage secrets', owner: true, admin: true, member: false, viewer: false },
                { perm: 'Manage team', owner: true, admin: false, member: false, viewer: false },
                { perm: 'Billing & delete', owner: true, admin: false, member: false, viewer: false },
              ].map((r, i) => (
                <tr key={i} className="border-b border-white/[0.02]">
                  <td className="py-2 pr-4 text-[hsl(220,10%,52%)]">{r.perm}</td>
                  {[r.owner, r.admin, r.member, r.viewer].map((v, j) => (
                    <td key={j} className="py-2 px-3 text-center">{v ? '✓' : '—'}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
