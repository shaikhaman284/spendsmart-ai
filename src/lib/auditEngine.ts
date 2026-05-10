import { ToolInput, AuditResult, FormData } from './types';
import { PRICING_DATA } from './pricingData';

export function calculateCurrentSpend(tool: ToolInput): number {
  const toolKey = tool.tool.toLowerCase().replace(/\s+/g, '_') as keyof typeof PRICING_DATA;
  const planKey = tool.plan.toLowerCase().replace(/\s+/g, '_');
  
  if (tool.plan === 'api' && tool.monthlySpend) {
    return tool.monthlySpend;
  }
  
  const pricing = PRICING_DATA[toolKey];
  if (!pricing) return 0;
  
  const plan = pricing[planKey as keyof typeof pricing] as { name: string; price: number; isPerSeat?: boolean } | undefined;
  if (!plan) return 0;
  
  const basePrice = plan.price;
  const seats = tool.seats || 1;
  
  return plan.isPerSeat ? basePrice * seats : basePrice;
}

export function auditEngine(formData: FormData): AuditResult[] {
  const results: AuditResult[] = [];
  const { tools, teamSize, primaryUseCase } = formData;
  
  // Track which tools are being used for redundancy detection
  const hasCursorPro = tools.some(t => t.tool === 'cursor' && t.plan === 'pro');
  const hasClaudePro = tools.some(t => t.tool === 'claude' && t.plan === 'pro');
  const hasChatGPTPlus = tools.some(t => t.tool === 'chatgpt' && t.plan === 'plus');
  
  tools.forEach(tool => {
    const currentSpend = calculateCurrentSpend(tool);
    let recommendedAction = 'Keep current plan';
    let savings = 0;
    let reason = 'Your current plan is optimal for your needs.';
    
    // Cursor rules
    if (tool.tool === 'cursor') {
      if (tool.plan === 'pro' && primaryUseCase === 'coding') {
        // Optimal
        reason = 'Cursor Pro is optimal for coding-focused individual use.';
      } else if (tool.plan === 'business' && (tool.seats || 1) < 3) {
        recommendedAction = 'Downgrade to Pro';
        const proPrice = PRICING_DATA.cursor.pro.price * (tool.seats || 1);
        savings = currentSpend - proPrice;
        reason = 'Business plan is overkill for fewer than 3 users. Pro offers the same features.';
      }
    }
    
    // GitHub Copilot rules
    if (tool.tool === 'github_copilot') {
      if (tool.plan === 'business' && (tool.seats || 1) < 5) {
        recommendedAction = 'Switch to Individual plans';
        const individualPrice = PRICING_DATA.github_copilot.individual.price * (tool.seats || 1);
        savings = currentSpend - individualPrice;
        reason = 'Individual plans are more cost-effective for teams under 5 users.';
      }
      
      // Redundancy check
      if (hasCursorPro && primaryUseCase === 'coding') {
        recommendedAction = 'Drop GitHub Copilot';
        savings = currentSpend;
        reason = 'Cursor Pro already includes AI coding assistance, making Copilot redundant.';
      }
    }
    
    // Claude rules
    if (tool.tool === 'claude') {
      if (tool.plan === 'team' && (tool.seats || 1) < 3) {
        recommendedAction = 'Downgrade to Pro';
        const proPrice = PRICING_DATA.claude.pro.price;
        savings = currentSpend - proPrice;
        reason = 'Team plan is not cost-effective for fewer than 3 users. Pro is sufficient.';
      } else if (tool.plan === 'api' && tool.monthlySpend && tool.monthlySpend > 50) {
        const proPrice = PRICING_DATA.claude.pro.price;
        if (tool.monthlySpend > proPrice * 2) {
          recommendedAction = 'Consider Pro plan';
          savings = tool.monthlySpend - proPrice;
          reason = 'API usage exceeds $50/mo. Pro plan offers unlimited usage for $20/mo.';
        }
      }
    }
    
    // ChatGPT rules
    if (tool.tool === 'chatgpt') {
      if (tool.plan === 'team' && (tool.seats || 1) < 3) {
        recommendedAction = 'Downgrade to Plus';
        const plusPrice = PRICING_DATA.chatgpt.plus.price;
        savings = currentSpend - plusPrice;
        reason = 'Team plan is not cost-effective for fewer than 3 users. Plus is sufficient.';
      } else if (tool.plan === 'enterprise' && (tool.seats || teamSize) < 10) {
        recommendedAction = 'Downgrade to Team';
        const teamPrice = PRICING_DATA.chatgpt.team.price * (tool.seats || teamSize);
        savings = currentSpend - teamPrice;
        reason = 'Enterprise is overkill for teams under 10. Team plan offers better value.';
      }
      
      // Redundancy check with Claude
      if (hasClaudePro && hasChatGPTPlus && primaryUseCase !== 'mixed') {
        recommendedAction = 'Pick one: Claude or ChatGPT';
        savings = Math.min(currentSpend, PRICING_DATA.claude.pro.price);
        reason = 'Having both Claude Pro and ChatGPT Plus is redundant for single-use cases.';
      }
    }
    
    // Gemini rules
    if (tool.tool === 'gemini') {
      if (tool.plan === 'ultra' && (primaryUseCase === 'writing' || primaryUseCase === 'research')) {
        recommendedAction = 'Downgrade to Pro';
        const proPrice = PRICING_DATA.gemini.pro.price;
        savings = currentSpend - proPrice;
        reason = 'Ultra is overkill for writing/research. Pro offers sufficient capabilities.';
      }
    }
    
    // Windsurf rules
    if (tool.tool === 'windsurf') {
      if (tool.plan === 'teams' && (tool.seats || 1) < 3) {
        recommendedAction = 'Downgrade to Pro';
        const proPrice = PRICING_DATA.windsurf.pro.price;
        savings = currentSpend - proPrice;
        reason = 'Teams plan is not cost-effective for fewer than 3 users. Pro is sufficient.';
      }
    }
    
    results.push({
      tool: tool.tool,
      currentSpend,
      recommendedAction,
      savings,
      reason,
    });
  });
  
  return results;
}

export function calculateTotalSavings(results: AuditResult[]): { monthly: number; annual: number } {
  const monthly = results.reduce((sum, result) => sum + result.savings, 0);
  return {
    monthly,
    annual: monthly * 12,
  };
}
