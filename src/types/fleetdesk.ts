export type UserRole = 'driver' | 'dispatcher' | 'terminal_manager' | 'compliance_auditor';

export type ClearanceLevel = 'Tier 1 - Driver & Field' | 'Tier 2 - Dispatcher & Fleet' | 'Tier 3 - Management & Compliance';

export interface KnowledgeDocument {
  id: string;
  code: string;
  title: string;
  category: 'Safety & HOS' | 'Rates & Surcharges' | 'Invoicing & Claims' | 'Cold Chain Reefer' | 'Hazmat & Dangerous Goods' | 'RBAC & Security';
  clearanceRequired: UserRole[];
  clearanceLabel: ClearanceLevel;
  lastUpdated: string;
  summary: string;
  content: string;
  citations: {
    section: string;
    rule: string;
  }[];
}

export interface PromptMetrics {
  citedSources: string[];
  hasCitation: boolean;
  attemptedInvoiceApproval: boolean;
  unverifiedInfoAbstained: boolean;
  permissionHonored: boolean;
  hallucinatedRatesDetected: boolean;
  complianceVerdict: 'COMPLIANT' | 'CRITICAL_RISK' | 'NON_COMPLIANT' | 'UNCERTAIN';
  verdictReason: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelType: 'strong' | 'weak';
  metrics?: PromptMetrics;
  citationsFound?: string[];
  userRoleAtSend?: UserRole;
  isSimulated?: boolean;
}

export interface TestScenario {
  id: string;
  title: string;
  prompt: string;
  category: 'Invoice Authorization' | 'Rate Hallucination' | 'HOS Safety Rules' | 'Role Permissions' | 'Unverified Info';
  role: UserRole;
  expectedStrongBehavior: string;
  expectedWeakFailure: string;
  explanation: string;
}
