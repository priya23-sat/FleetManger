import React, { useState } from 'react';
import { UserRole, TestScenario, PromptMetrics } from '../types/fleetdesk';
import { BENCHMARK_TEST_SCENARIOS, FLEETDESK_SYSTEM_PROMPT, WEAK_SYSTEM_PROMPT } from '../data/knowledgeBase';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Code2,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  DollarSign,
  Scale
} from 'lucide-react';

interface ComparisonState {
  userPrompt: string;
  role: UserRole;
  isLoading: boolean;
  strong: {
    modelType: string;
    name: string;
    response: string;
    metrics?: PromptMetrics;
  } | null;
  weak: {
    modelType: string;
    name: string;
    response: string;
    metrics?: PromptMetrics;
  } | null;
  selectedScenario?: TestScenario | null;
  isSimulated?: boolean;
}

interface PromptComparisonViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSelectDoc?: (docCode: string) => void;
}

export const PromptComparisonView: React.FC<PromptComparisonViewProps> = ({
  currentRole,
  onRoleChange,
  onSelectDoc,
}) => {
  const [customPrompt, setCustomPrompt] = useState<string>(BENCHMARK_TEST_SCENARIOS[0].prompt);
  const [selectedScenario, setSelectedScenario] = useState<TestScenario | null>(BENCHMARK_TEST_SCENARIOS[0]);
  const [showSystemPrompts, setShowSystemPrompts] = useState<boolean>(false);
  const [comparisonState, setComparisonState] = useState<ComparisonState>({
    userPrompt: '',
    role: currentRole,
    isLoading: false,
    strong: null,
    weak: null,
    selectedScenario: BENCHMARK_TEST_SCENARIOS[0],
  });

  const handleSelectScenario = (scenario: TestScenario) => {
    setSelectedScenario(scenario);
    setCustomPrompt(scenario.prompt);
    onRoleChange(scenario.role);
  };

  const handleRunComparison = async (promptToRun?: string, scenarioToUse?: TestScenario | null) => {
    const textPrompt = promptToRun || customPrompt;
    if (!textPrompt.trim()) return;

    setComparisonState(prev => ({
      ...prev,
      isLoading: true,
      userPrompt: textPrompt,
      role: currentRole,
      selectedScenario: scenarioToUse !== undefined ? scenarioToUse : selectedScenario,
    }));

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textPrompt,
          role: currentRole,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error: ${response.statusText}`);
      }

      const data = await response.json();
      setComparisonState({
        userPrompt: textPrompt,
        role: currentRole,
        isLoading: false,
        strong: data.strong,
        weak: data.weak,
        selectedScenario: scenarioToUse !== undefined ? scenarioToUse : selectedScenario,
        isSimulated: data.isSimulated,
      });
    } catch (err: any) {
      console.error('Comparison error:', err);
      setComparisonState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  // Run initial comparison on mount if empty
  React.useEffect(() => {
    if (!comparisonState.strong && !comparisonState.isLoading) {
      handleRunComparison(BENCHMARK_TEST_SCENARIOS[0].prompt, BENCHMARK_TEST_SCENARIOS[0]);
    }
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Overview Intro Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold text-xs tracking-wider uppercase bg-amber-950/70 border border-amber-800/40 px-2 py-0.5 rounded">
                Live Enterprise Benchmark
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Weak System Prompt vs. Strong System Prompt
              </h2>
            </div>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Evaluating the crucial operational difference between an unconstrained assistant (<span className="text-rose-400 font-mono text-xs">“You are a helpful transport assistant”</span>) and <strong>FleetDesk AI</strong> enforced by 6 strict boundary rules (Knowledge grounding, zero rate hallucination, mandatory citations, refusal to approve invoices, and role-based permissions).
            </p>
          </div>

          <button
            onClick={() => setShowSystemPrompts(!showSystemPrompts)}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition self-start lg:self-auto shrink-0"
          >
            <Code2 className="w-4 h-4 text-blue-400" />
            <span>{showSystemPrompts ? 'Hide Raw System Prompts' : 'Inspect Raw System Prompts'}</span>
            {showSystemPrompts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Raw System Prompt Diff */}
        {showSystemPrompts && (
          <div className="mt-5 pt-5 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-rose-950/20 border border-rose-900/40 rounded-lg p-3.5 text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-rose-300">WEAK SYSTEM PROMPT (1 Line / 7 Words)</span>
                <span className="text-rose-400 text-[11px] font-sans">Zero Guardrails</span>
              </div>
              <pre className="text-rose-200 whitespace-pre-wrap bg-slate-950/80 p-3 rounded border border-rose-900/30">
                {WEAK_SYSTEM_PROMPT}
              </pre>
              <ul className="mt-2 text-[11px] text-rose-300/80 list-disc list-inside space-y-0.5">
                <li>No knowledge source bounding (relies on hallucination)</li>
                <li>Eager to please (approves invoices, overrides safety limits)</li>
                <li>No permissions or role awareness</li>
              </ul>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-lg p-3.5 text-xs font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-emerald-300">STRONG FLEETDESK SYSTEM PROMPT (6 Strict Rules)</span>
                <span className="text-emerald-400 text-[11px] font-sans">Strict RBAC + RAG Grounding</span>
              </div>
              <div className="bg-slate-950/80 p-3 rounded border border-emerald-900/30 max-h-48 overflow-y-auto text-emerald-200 whitespace-pre-wrap">
                {FLEETDESK_SYSTEM_PROMPT.replace('{USER_ROLE}', currentRole.toUpperCase()).replace('{KNOWLEDGE_CONTEXT}', '[Authorized Knowledge Base Documents Injected Here]')}
              </div>
              <ul className="mt-2 text-[11px] text-emerald-300/80 list-disc list-inside space-y-0.5">
                <li>Strict Rule 1-6 enforcement (Zero invention, No invoice approval)</li>
                <li>Audited source citation required for all factual claims</li>
                <li>Explicit refusal when information is unverified</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Benchmark Scenarios Picker */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Operational Stress-Test Scenario:
          </span>
          <span className="text-xs text-slate-500">
            5 Pre-Configured Enterprise Boundary Tests
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {BENCHMARK_TEST_SCENARIOS.map((scenario) => {
            const isSelected = selectedScenario?.id === scenario.id;
            return (
              <button
                key={scenario.id}
                onClick={() => {
                  handleSelectScenario(scenario);
                  handleRunComparison(scenario.prompt, scenario);
                }}
                className={`text-left p-3 rounded-lg border transition-all text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-900/30 border-blue-500/60 shadow-sm text-white ring-1 ring-blue-500/30'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div>
                  <div className="font-semibold mb-1 line-clamp-1 text-slate-100 flex items-center gap-1.5">
                    {scenario.category === 'Invoice Authorization' && <DollarSign className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                    {scenario.category === 'Rate Hallucination' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    {scenario.category === 'HOS Safety Rules' && <ShieldAlert className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    {scenario.category === 'Role Permissions' && <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />}
                    {scenario.category === 'Unverified Info' && <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                    <span>{scenario.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {scenario.prompt}
                  </p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Role: {scenario.role}</span>
                  <span className="text-blue-400 font-medium">Run Test →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Query Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Transport Prompt Input</span>
          </label>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Testing as:</span>
            <span className="font-semibold text-blue-300 capitalize">{currentRole.replace('_', ' ')}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            rows={2}
            className="flex-1 bg-slate-950 border border-slate-700/80 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none font-sans"
            placeholder="Type any transport operations question, rate inquiry, HOS override, or invoice approval request..."
          />
          <button
            onClick={() => handleRunComparison()}
            disabled={comparisonState.isLoading || !customPrompt.trim()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-xs rounded-lg flex flex-col items-center justify-center gap-1 transition shadow-sm shrink-0 min-w-[120px]"
          >
            {comparisonState.isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Benchmarking...</span>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Test</span>
                </div>
                <span className="text-[10px] text-blue-200">Both Models</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Selected Scenario Context Alert */}
      {selectedScenario && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-xs flex items-start gap-3 text-slate-300">
          <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-white">Scenario Evaluation Focus: {selectedScenario.title}</span>
            <p className="text-slate-400">{selectedScenario.explanation}</p>
          </div>
        </div>
      )}

      {/* Side-by-Side Dual Output Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Weak System Prompt Output */}
        <div className="bg-slate-900 border border-rose-900/30 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="bg-rose-950/30 border-b border-rose-900/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                <h3 className="font-bold text-sm text-white">
                  Model A: Generic Transport Assistant
                </h3>
              </div>
              <span className="text-[11px] font-mono text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/40">
                Weak Prompt
              </span>
            </div>
            <p className="text-xs text-rose-300/80 mt-1 font-mono">
              System: “You are a helpful transport assistant.”
            </p>
          </div>

          {/* Compliance & Risk Badges */}
          <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
            {comparisonState.weak?.metrics?.attemptedInvoiceApproval && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold text-[11px]">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                CRITICAL: Unlawfully Approved Invoice
              </span>
            )}
            {comparisonState.weak?.metrics?.hallucinatedRatesDetected && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800/60 font-semibold text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                HALLUCINATION: Fabricated Spot Rates
              </span>
            )}
            {!comparisonState.weak?.metrics?.hasCitation && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Zero Source Citations
              </span>
            )}
            {!comparisonState.weak?.metrics?.unverifiedInfoAbstained && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800/60 text-[11px]">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Fabricated Unknown Policies
              </span>
            )}
            {!comparisonState.weak?.metrics?.permissionHonored && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-950 text-rose-300 border border-rose-800/60 text-[11px]">
                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                Ignored Role Clearance
              </span>
            )}
          </div>

          {/* Response Text */}
          <div className="p-4 flex-1 text-sm text-slate-200 leading-relaxed font-sans min-h-[220px] whitespace-pre-wrap">
            {comparisonState.isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                <div className="w-4 h-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                <span>Querying unconstrained model...</span>
              </div>
            ) : comparisonState.weak?.response ? (
              comparisonState.weak.response
            ) : (
              <span className="text-slate-500 italic">No output generated yet. Click "Execute Test" above.</span>
            )}
          </div>

          {/* Audit Footer */}
          <div className="bg-slate-950/90 p-3 border-t border-slate-800 text-xs text-rose-400/90 flex items-center justify-between">
            <span className="font-medium">Operational Status: High Risk / Vulnerable</span>
            <span className="text-[11px] text-slate-400">Zero policy grounding</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Strong FleetDesk AI Output */}
        <div className="bg-slate-900 border border-emerald-900/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
          {/* Header */}
          <div className="bg-emerald-950/30 border-b border-emerald-900/40 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <h3 className="font-bold text-sm text-white">
                  Model B: FleetDesk AI (Strong System Prompt)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/50">
                6 Strict Rules
              </span>
            </div>
            <p className="text-xs text-emerald-300/80 mt-1 font-mono">
              Grounded in Approved SOPs · Role Aware · Zero-Hallucination
            </p>
          </div>

          {/* Compliance & Verification Badges */}
          <div className="bg-slate-950/60 p-3 border-b border-slate-800 flex flex-wrap gap-2 text-xs">
            {comparisonState.strong?.metrics?.hasCitation && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold text-[11px]">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified SOP Citations Included
              </span>
            )}
            {!comparisonState.strong?.metrics?.attemptedInvoiceApproval && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Invoice Approval Prohibited (KB-FIN-305)
              </span>
            )}
            {comparisonState.strong?.metrics?.permissionHonored && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Role Permissions Enforced
              </span>
            )}
            {comparisonState.strong?.metrics?.unverifiedInfoAbstained && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Zero Hallucination Guardrail Held
              </span>
            )}
          </div>

          {/* Response Text */}
          <div className="p-4 flex-1 text-sm text-slate-200 leading-relaxed font-sans min-h-[220px] whitespace-pre-wrap">
            {comparisonState.isLoading ? (
              <div className="flex items-center justify-center h-full text-slate-500 gap-2">
                <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Evaluating against approved knowledge base...</span>
              </div>
            ) : comparisonState.strong?.response ? (
              comparisonState.strong.response
            ) : (
              <span className="text-slate-500 italic">No output generated yet. Click "Execute Test" above.</span>
            )}
          </div>

          {/* Audit Footer */}
          <div className="bg-slate-950/90 p-3 border-t border-slate-800 text-xs text-emerald-400 flex items-center justify-between">
            <span className="font-medium">Operational Status: 100% Policy Grounded</span>
            <span className="text-[11px] text-slate-400 font-mono">
              Audited for Role: {currentRole.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Comparative Evaluation Audit Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-850 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-white">
              System Prompt Architecture Comparison Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">Why Prompt Engineering Matters in Transport Ops</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold text-[11px]">
                <th className="py-3 px-4">Core Boundary Rule</th>
                <th className="py-3 px-4 text-rose-300">Weak Prompt (“Helpful Assistant”)</th>
                <th className="py-3 px-4 text-emerald-300">Strong Prompt (FleetDesk AI)</th>
                <th className="py-3 px-4 text-slate-400">Operational & Legal Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr>
                <td className="py-3 px-4 font-semibold text-white">1. Knowledge Base Grounding</td>
                <td className="py-3 px-4 text-rose-400">
                  Hallucinates answers from internet training data; no company policy anchor.
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Answers ONLY using verified, approved FleetDesk operating standards.
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Eliminates catastrophic misdirection on DOT/FMCSA legal requirements.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">2. Rate & Policy Invention</td>
                <td className="py-3 px-4 text-rose-400">
                  Invents spot rates (e.g., "$2.85/mi") and unapproved detention multipliers.
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Strict prohibition: Never invents rates; directs linehaul quotes to Central Pricing TMS.
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Protects against accidental contractual commitments and broker rate disputes.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">3. Source Citations</td>
                <td className="py-3 px-4 text-rose-400">
                  Zero citations or vague statements like "according to standard rules".
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Mandatory citations: Cites Document Code (e.g., KB-RATE-204) and Section #.
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Provides dispatchers and carriers with an unimpeachable audit trail.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">4. Missing Info Handling</td>
                <td className="py-3 px-4 text-rose-400">
                  Fabricates procedures for unknown or uncovered domains (e.g. Arctic maritime).
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Explicitly states: "I do not have enough verified information."
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Prevents safety failures in unchartered operating territories.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">5. Invoice Approval Ban</td>
                <td className="py-3 px-4 text-rose-400">
                  Eagerly says "Approved for payment! Queued for disbursement."
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Strictly refuses: Defers to AP dual-signature controller workflow (ap-freight).
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Prevents unauthorized financial disbursements and invoice fraud.
                </td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-white">6. Role-Based Clearance</td>
                <td className="py-3 px-4 text-rose-400">
                  Ignores caller clearance; spills proprietary margins to anyone who asks.
                </td>
                <td className="py-3 px-4 text-emerald-400 font-medium">
                  Enforces Tier 1 (Driver) vs Tier 2 (Dispatch) vs Tier 3 (Manager/Auditor).
                </td>
                <td className="py-3 px-4 text-slate-400">
                  Protects sensitive margin spreads and executive audits from leakage.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
