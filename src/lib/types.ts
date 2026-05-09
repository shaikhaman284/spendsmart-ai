export type PlanType = 'free' | 'hobby' | 'pro' | 'business' | 'team' | 'enterprise' | 'max' | 'ultra' | 'individual' | 'api' | 'plus' | 'teams';

export interface ToolPlan {
  name: string;
  price: number;
  isPerSeat?: boolean;
}

export interface ToolInput {
  tool: string;
  plan: string;
  monthlySpend?: number;
  seats?: number;
}

export interface AuditResult {
  tool: string;
  currentSpend: number;
  recommendedAction: string;
  savings: number;
  reason: string;
}

export interface AuditSummary {
  results: AuditResult[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  aiSummary?: string;
}

export interface FormData {
  tools: ToolInput[];
  teamSize: number;
  primaryUseCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed';
}

export interface Lead {
  email: string;
  company?: string;
  role?: string;
  auditId: string;
  totalSavings: number;
}
