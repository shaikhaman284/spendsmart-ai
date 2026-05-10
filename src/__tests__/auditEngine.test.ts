import { auditEngine, calculateTotalSavings } from '../lib/auditEngine';
import { FormData } from '../lib/types';

describe('Audit Engine', () => {
  test('Cursor Business for 2 users recommends Pro', () => {
    const formData: FormData = {
      tools: [
        { tool: 'cursor', plan: 'business', seats: 2 },
      ],
      teamSize: 2,
      primaryUseCase: 'coding',
    };

    const results = auditEngine(formData);
    const cursorResult = results.find(r => r.tool === 'cursor');

    expect(cursorResult).toBeDefined();
    expect(cursorResult?.recommendedAction).toBe('Downgrade to Pro');
    expect(cursorResult?.savings).toBeGreaterThan(0);
  });

  test('Claude Team for 2 users recommends Pro', () => {
    const formData: FormData = {
      tools: [
        { tool: 'claude', plan: 'team', seats: 2 },
      ],
      teamSize: 2,
      primaryUseCase: 'writing',
    };

    const results = auditEngine(formData);
    const claudeResult = results.find(r => r.tool === 'claude');

    expect(claudeResult).toBeDefined();
    expect(claudeResult?.recommendedAction).toBe('Downgrade to Pro');
    expect(claudeResult?.savings).toBeGreaterThan(0);
  });

  test('Redundant Copilot + Cursor detection', () => {
    const formData: FormData = {
      tools: [
        { tool: 'cursor', plan: 'pro', seats: 1 },
        { tool: 'github_copilot', plan: 'individual', seats: 1 },
      ],
      teamSize: 1,
      primaryUseCase: 'coding',
    };

    const results = auditEngine(formData);
    const copilotResult = results.find(r => r.tool === 'github_copilot');

    expect(copilotResult).toBeDefined();
    expect(copilotResult?.recommendedAction).toBe('Drop GitHub Copilot');
    expect(copilotResult?.savings).toBe(10); // Individual plan cost
  });

  test('Zero savings case returns spending well', () => {
    const formData: FormData = {
      tools: [
        { tool: 'cursor', plan: 'pro', seats: 1 },
      ],
      teamSize: 1,
      primaryUseCase: 'coding',
    };

    const results = auditEngine(formData);
    const totalSavings = calculateTotalSavings(results);

    expect(totalSavings.monthly).toBe(0);
    expect(results[0].recommendedAction).toBe('Keep current plan');
  });

  test('Annual savings equals monthly times 12', () => {
    const formData: FormData = {
      tools: [
        { tool: 'cursor', plan: 'business', seats: 2 },
      ],
      teamSize: 2,
      primaryUseCase: 'coding',
    };

    const results = auditEngine(formData);
    const totalSavings = calculateTotalSavings(results);

    expect(totalSavings.annual).toBe(totalSavings.monthly * 12);
  });

  test('GitHub Copilot Business for 4 users recommends Individual', () => {
    const formData: FormData = {
      tools: [
        { tool: 'github_copilot', plan: 'business', seats: 4 },
      ],
      teamSize: 4,
      primaryUseCase: 'coding',
    };

    const results = auditEngine(formData);
    const copilotResult = results.find(r => r.tool === 'github_copilot');

    expect(copilotResult).toBeDefined();
    expect(copilotResult?.recommendedAction).toBe('Switch to Individual plans');
    expect(copilotResult?.savings).toBe(36); // (19-10) * 4
  });

  test('ChatGPT Team for 2 users recommends Plus', () => {
    const formData: FormData = {
      tools: [
        { tool: 'chatgpt', plan: 'team', seats: 2 },
      ],
      teamSize: 2,
      primaryUseCase: 'writing',
    };

    const results = auditEngine(formData);
    const chatgptResult = results.find(r => r.tool === 'chatgpt');

    expect(chatgptResult).toBeDefined();
    expect(chatgptResult?.recommendedAction).toBe('Downgrade to Plus');
    expect(chatgptResult?.savings).toBeGreaterThan(0);
  });

  test('Gemini Ultra for writing recommends Pro', () => {
    const formData: FormData = {
      tools: [
        { tool: 'gemini', plan: 'ultra', seats: 1 },
      ],
      teamSize: 1,
      primaryUseCase: 'writing',
    };

    const results = auditEngine(formData);
    const geminiResult = results.find(r => r.tool === 'gemini');

    expect(geminiResult).toBeDefined();
    expect(geminiResult?.recommendedAction).toBe('Downgrade to Pro');
    expect(geminiResult?.savings).toBe(280); // 300 - 20
  });
});
