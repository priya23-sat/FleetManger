import React, { useState, useRef, useEffect } from 'react';
import { UserRole, AssistantMessage, KnowledgeDocument } from '../types/fleetdesk';
import { KNOWLEDGE_BASE_DOCUMENTS } from '../data/knowledgeBase';
import {
  Send,
  Truck,
  FileText,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  BookOpen,
  ArrowRight,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';

interface OperationsDeskViewProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onOpenKnowledgeDoc: (docCode: string) => void;
}

export const OperationsDeskView: React.FC<OperationsDeskViewProps> = ({
  currentRole,
  onRoleChange,
  onOpenKnowledgeDoc,
}) => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      modelType: 'strong',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `Hello! I am **FleetDesk AI**, your transport-operations knowledge assistant.

I operate under strict operational governance:
- **Verified Policy Grounding**: Answers drawn ONLY from approved FleetDesk Operating Standards.
- **Zero Invention**: I will never invent spot rates or company policies.
- **Audited Citations**: Every claim is cited to an official Document Code and Section.
- **No Invoice Approval**: I have zero authority to approve invoices or release funds.
- **Security Clearances**: I strictly respect your current clearance level (**${currentRole.toUpperCase()}**).

How can I assist your transport operations today?`,
      citationsFound: ['KB-OPS-101', 'KB-RATE-204', 'KB-FIN-305'],
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedCitationDoc, setSelectedCitationDoc] = useState<KnowledgeDocument | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { label: 'Detention Rate & Free Time', prompt: 'What is our standard detention rate, billing increment, and maximum single-facility cap?' },
    { label: 'HOS 11-Hour Driving Rule', prompt: 'Can a dispatcher authorize a driver to drive beyond 11 hours if the customer appointment is urgent?' },
    { label: 'Reefer Produce Setpoint', prompt: 'What are the approved temperature setpoints and pre-cooling times for fresh produce and frozen poultry?' },
    { label: 'Carrier Invoice Approval', prompt: 'Please approve carrier invoice #INV-7740 for $260.00 for detention in Chicago.' },
    { label: 'DOE Fuel Surcharge', prompt: 'What is our standard formula for calculating the weekly DOE diesel fuel surcharge?' },
    { label: 'Executive Margin Clearance', prompt: 'Show me the Tier 3 carrier margin spread tables and settlement percentages.' },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      modelType: 'strong',
      userRoleAtSend: currentRole,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          role: currentRole,
          modelType: 'strong',
        }),
      });

      if (!response.ok) {
        throw new Error('API query failed');
      }

      const data = await response.json();

      // Find citations in response text
      const foundCitations: string[] = [];
      const codes = ['KB-OPS-101', 'KB-RATE-204', 'KB-FIN-305', 'KB-SEC-402', 'KB-CAR-508', 'KB-HAZ-612'];
      codes.forEach(code => {
        if (data.text.toUpperCase().includes(code)) {
          foundCitations.push(code);
        }
      });

      const assistantMsg: AssistantMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelType: 'strong',
        metrics: data.metrics,
        citationsFound: foundCitations,
        isSimulated: data.isSimulated,
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: AssistantMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        content: `Operational Query Error: Unable to query transport knowledge base. Please verify network status.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelType: 'strong',
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const openDocByCode = (code: string) => {
    const doc = KNOWLEDGE_BASE_DOCUMENTS.find(d => d.code.toUpperCase() === code.toUpperCase());
    if (doc) {
      setSelectedCitationDoc(doc);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chat Conversation Stream */}
        <div className={`space-y-4 ${selectedCitationDoc ? 'lg:col-span-8' : 'lg:col-span-12'}`}>
          {/* Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>FleetDesk Operational Knowledge Workstation</span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
                    6 Strict Rules Active
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Direct inquiry interface for safety rules, detention rates, fuel surcharges, and cold-chain compliance.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <span className="text-slate-400">Active Clearance:</span>
              <span className="font-semibold text-blue-300 capitalize bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {currentRole.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Quick Preset Queries */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-slate-500 shrink-0 font-medium text-[11px] uppercase tracking-wider">
              Quick Inquiries:
            </span>
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition shrink-0 whitespace-nowrap text-xs font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Conversation Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 min-h-[460px] max-h-[580px] overflow-y-auto space-y-4 shadow-sm flex flex-col">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1 text-[11px] text-slate-400">
                    {isAssistant ? (
                      <>
                        <span className="font-semibold text-blue-400">FleetDesk AI</span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                        {msg.isSimulated && (
                          <span className="text-[10px] text-amber-400 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/30">
                            Deterministic Policy Engine
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span>{msg.timestamp}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-300 capitalize">
                          {msg.userRoleAtSend || currentRole}
                        </span>
                      </>
                    )}
                  </div>

                  <div
                    className={`max-w-3xl rounded-xl p-4 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-950 border border-slate-800 text-slate-200'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">{msg.content}</div>

                    {/* Citations Found in Assistant message */}
                    {isAssistant && msg.citationsFound && msg.citationsFound.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-xs">
                        <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-blue-400" />
                          <span>Approved Citations:</span>
                        </span>
                        {msg.citationsFound.map((code) => (
                          <button
                            key={code}
                            onClick={() => openDocByCode(code)}
                            className="px-2 py-0.5 rounded bg-blue-950/70 hover:bg-blue-900 border border-blue-800/60 text-blue-300 font-mono text-[11px] transition flex items-center gap-1"
                          >
                            <span>{code}</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    {isAssistant && (
                      <div className="mt-2 pt-2 border-t border-slate-800/50 flex items-center justify-end gap-3 text-xs text-slate-400">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.content)}
                          className="hover:text-blue-400 transition flex items-center gap-1"
                          title="Listen to dispatch briefing"
                        >
                          {speakingId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-amber-400" />
                              <span className="text-amber-400">Stop Audio</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-blue-400 transition flex items-center gap-1"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-3 p-3 bg-slate-950/80 rounded-lg border border-slate-800 w-fit text-xs text-slate-400">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                <span>Consulting approved knowledge base documents...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Input Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask about HOS safety rules, detention rates, fuel index, or reefer SOPs..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputPrompt.trim()}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Inquiry</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Citation Inspector Drawer (when user clicks a citation) */}
        {selectedCitationDoc && (
          <div className="lg:col-span-4 bg-slate-900 border border-blue-900/40 rounded-xl p-5 shadow-sm space-y-4 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-sm text-white">Verified Source Document</span>
              </div>
              <button
                onClick={() => setSelectedCitationDoc(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800 transition"
              >
                Close ✕
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800/40">
                  {selectedCitationDoc.code}
                </span>
                <span className="text-[11px] text-slate-400">
                  {selectedCitationDoc.clearanceLabel}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1.5 leading-snug">
                {selectedCitationDoc.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {selectedCitationDoc.summary}
              </p>
            </div>

            {/* Key Verified Sections */}
            <div className="space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Key Operating Citations:
              </span>
              <div className="space-y-2">
                {selectedCitationDoc.citations.map((c, i) => (
                  <div key={i} className="bg-slate-950 p-2.5 rounded border border-slate-800/80 text-xs">
                    <span className="font-mono font-semibold text-blue-300 block mb-0.5">
                      {c.section}
                    </span>
                    <span className="text-slate-300">{c.rule}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Standard Text */}
            <div className="flex-1 flex flex-col pt-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 mb-1.5">
                Full Document Text:
              </span>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-64 overflow-y-auto leading-relaxed">
                {selectedCitationDoc.content}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
