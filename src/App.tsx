import React, { useState } from 'react';
import { UserRole } from './types/fleetdesk';
import { Header } from './components/Header';
import { PromptComparisonView } from './components/PromptComparisonView';
import { OperationsDeskView } from './components/OperationsDeskView';
import { KnowledgeBaseExplorer } from './components/KnowledgeBaseExplorer';
import { RuleMatrixInspector } from './components/RuleMatrixInspector';
import { Truck, ShieldCheck, Scale, ExternalLink } from 'lucide-react';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('dispatcher');
  const [activeTab, setActiveTab] = useState<'compare' | 'desk' | 'knowledge' | 'rules'>('compare');

  const handleRunRuleTest = (prompt: string, role: UserRole) => {
    setCurrentRole(role);
    setActiveTab('compare');
  };

  const handleOpenKnowledgeDoc = (_docCode: string) => {
    setActiveTab('knowledge');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header with Navigation and Role Switcher */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'compare' && (
          <PromptComparisonView
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            onSelectDoc={handleOpenKnowledgeDoc}
          />
        )}

        {activeTab === 'desk' && (
          <OperationsDeskView
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
            onOpenKnowledgeDoc={handleOpenKnowledgeDoc}
          />
        )}

        {activeTab === 'knowledge' && (
          <KnowledgeBaseExplorer
            currentRole={currentRole}
            onRoleChange={setCurrentRole}
          />
        )}

        {activeTab === 'rules' && (
          <RuleMatrixInspector onRunTest={handleRunRuleTest} />
        )}
      </main>

      {/* Enterprise Operational Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 text-xs text-slate-500 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="font-semibold text-slate-400">FleetDesk AI Transport Operations Engine</span>
            <span>·</span>
            <span>FMCSA 49 CFR Part 395 Verified</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Grounding: Strict RAG</span>
            <span>·</span>
            <span>Invoice Authority: AP Controller Workflow</span>
            <span>·</span>
            <span>Role RBAC: Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
