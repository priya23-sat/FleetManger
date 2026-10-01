import React, { useState } from 'react';
import { UserRole, KnowledgeDocument } from '../types/fleetdesk';
import { KNOWLEDGE_BASE_DOCUMENTS } from '../data/knowledgeBase';
import {
  BookOpen,
  Search,
  Lock,
  Unlock,
  CheckCircle,
  FileText,
  Copy,
  Check,
  Tag,
  Filter
} from 'lucide-react';

interface KnowledgeBaseExplorerProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onAskAboutDoc?: (prompt: string) => void;
}

export const KnowledgeBaseExplorer: React.FC<KnowledgeBaseExplorerProps> = ({
  currentRole,
  onRoleChange,
  onAskAboutDoc,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDocId, setSelectedDocId] = useState<string>(KNOWLEDGE_BASE_DOCUMENTS[0].id);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const categories = ['All', 'Safety & HOS', 'Rates & Surcharges', 'Invoicing & Claims', 'Cold Chain Reefer', 'Hazmat & Dangerous Goods', 'RBAC & Security'];

  const filteredDocs = KNOWLEDGE_BASE_DOCUMENTS.filter(doc => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeDoc = KNOWLEDGE_BASE_DOCUMENTS.find(d => d.id === selectedDocId) || filteredDocs[0];
  const userHasAccess = activeDoc ? activeDoc.clearanceRequired.includes(currentRole) : false;

  const handleCopyCitation = (citation: string, key: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Intro Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold text-xs tracking-wider uppercase bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded">
                Verified Knowledge Repository
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Approved Transport Operating Standards (SOPs)
              </h2>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              FleetDesk AI grounds 100% of its outputs strictly within these 6 approved operational documents.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded-lg border border-slate-800 self-start md:self-auto">
            <span className="text-slate-400">Current Clearance:</span>
            <span className="font-semibold text-blue-300 capitalize">{currentRole.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by code, title, policy rule, or keyword..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg transition shrink-0 font-medium ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Document List on Left, Document Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Document Cards List */}
        <div className="lg:col-span-4 space-y-2.5">
          {filteredDocs.map((doc) => {
            const isSelected = doc.id === activeDoc?.id;
            const hasAccess = doc.clearanceRequired.includes(currentRole);

            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId(doc.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col gap-2 ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500/70 shadow-sm ring-1 ring-blue-500/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                    {doc.code}
                  </span>
                  <div className="flex items-center gap-1 text-[11px]">
                    {hasAccess ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        <span>Authorized</span>
                      </span>
                    ) : (
                      <span className="text-amber-400 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        <span>Restricted</span>
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="font-bold text-xs text-white line-clamp-2 leading-snug">
                  {doc.title}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {doc.summary}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                  <span>{doc.clearanceLabel}</span>
                  <span>Rev: {doc.lastUpdated}</span>
                </div>
              </button>
            );
          })}

          {filteredDocs.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-400">
              No matching documents found.
            </div>
          )}
        </div>

        {/* Active Document Reader */}
        {activeDoc && (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm space-y-6">
            {/* Header */}
            <div className="pb-4 border-b border-slate-800 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-blue-400 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/50">
                    {activeDoc.code}
                  </span>
                  <span className="text-xs text-slate-400 font-medium bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                    {activeDoc.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Security Clearance:</span>
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                      userHasAccess
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                    }`}
                  >
                    {activeDoc.clearanceLabel}
                  </span>
                </div>
              </div>

              <h2 className="text-lg font-bold text-white tracking-tight">
                {activeDoc.title}
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeDoc.summary}
              </p>
            </div>

            {/* Clearance Notice Banner if restricted */}
            {!userHasAccess && (
              <div className="bg-amber-950/30 border border-amber-800/50 rounded-lg p-3.5 text-xs flex items-start gap-3 text-amber-200">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-amber-300">
                    Access Boundary: Elevation Clearance Required
                  </span>
                  <p className="text-amber-200/80">
                    Your current role is <strong>{currentRole.toUpperCase()}</strong>. This standard requires <strong>{activeDoc.clearanceLabel}</strong>. In accordance with Rule #6 ("Respect user permissions"), FleetDesk AI will refuse requests for this data until clearance is verified.
                  </p>
                </div>
              </div>
            )}

            {/* Key Verified Citations Matrix */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Approved Regulatory Articles & Citation Invariants:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeDoc.citations.map((c, i) => (
                  <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-blue-400">{c.section}</span>
                        <button
                          onClick={() => handleCopyCitation(`${activeDoc.code} ${c.section}: ${c.rule}`, `${activeDoc.code}-${i}`)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                        >
                          {copiedSection === `${activeDoc.code}-${i}` ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Citation</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{c.rule}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Standard Text */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Official Document Content:
              </span>
              <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
                {activeDoc.content}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
