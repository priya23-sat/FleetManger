import React from 'react';
import { UserRole } from '../types/fleetdesk';
import { Truck, ShieldCheck, Scale, FileText, BookOpen, User, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'compare' | 'desk' | 'knowledge' | 'rules';
  onTabChange: (tab: 'compare' | 'desk' | 'knowledge' | 'rules') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  onTabChange,
}) => {
  const roleDisplayNames: Record<UserRole, { title: string; tier: string; badge: string }> = {
    driver: { title: 'Field Driver', tier: 'Tier 1 Clearance', badge: 'bg-zinc-800 text-zinc-300' },
    dispatcher: { title: 'Fleet Dispatcher', tier: 'Tier 2 Clearance', badge: 'bg-blue-950 text-blue-300 border border-blue-800/40' },
    terminal_manager: { title: 'Terminal Manager', tier: 'Tier 3 Clearance', badge: 'bg-amber-950 text-amber-300 border border-amber-800/40' },
    compliance_auditor: { title: 'Compliance Auditor', tier: 'Tier 3 Clearance', badge: 'bg-emerald-950 text-emerald-300 border border-emerald-800/40' },
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm ring-1 ring-white/10">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-white">FleetDesk AI</span>
              <span className="text-xs uppercase tracking-wider font-semibold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/50">
                Transport Knowledge Assistant
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Approved Knowledge Grounding · Zero-Invention Guarantee · Dual-Prompt Benchmark
            </p>
          </div>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 px-2 text-slate-400">
            <User className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-slate-300">Active Role:</span>
          </div>
          <div className="flex items-center gap-1">
            {(['driver', 'dispatcher', 'terminal_manager', 'compliance_auditor'] as UserRole[]).map((role) => (
              <button
                key={role}
                onClick={() => onRoleChange(role)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  currentRole === role
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={`Switch clearance to ${roleDisplayNames[role].title}`}
              >
                {role === 'driver' && 'Driver'}
                {role === 'dispatcher' && 'Dispatcher'}
                {role === 'terminal_manager' && 'Terminal Mgr'}
                {role === 'compliance_auditor' && 'Auditor'}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 pl-1 border-l border-slate-800 hidden lg:inline">
            {roleDisplayNames[currentRole].tier}
          </span>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 flex items-center justify-between overflow-x-auto scrollbar-none">
        <nav className="flex space-x-1 sm:space-x-4 py-2 text-xs font-medium">
          <button
            onClick={() => onTabChange('compare')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'compare'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Weak vs. Strong Prompt Lab</span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-semibold px-1.5 py-0.5 rounded">
              Core Demo
            </span>
          </button>

          <button
            onClick={() => onTabChange('desk')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'desk'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Truck className="w-4 h-4 text-blue-400" />
            <span>FleetDesk Operations Desk</span>
          </button>

          <button
            onClick={() => onTabChange('knowledge')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'knowledge'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Approved Knowledge Base (6 Docs)</span>
          </button>

          <button
            onClick={() => onTabChange('rules')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
              activeTab === 'rules'
                ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>The 6 Prompt Rules Analysis</span>
          </button>
        </nav>

        {/* Quick Indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 py-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Strict Guardrails Active</span>
        </div>
      </div>
    </header>
  );
};
