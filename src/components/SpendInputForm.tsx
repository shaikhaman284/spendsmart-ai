'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { ToolInput, FormData } from '@/lib/types';
import { PRICING_DATA } from '@/lib/pricingData';

interface SpendInputFormProps {
  onSubmit: (data: FormData) => void;
}

const TOOLS = [
  { value: 'cursor', label: 'Cursor' },
  { value: 'github_copilot', label: 'GitHub Copilot' },
  { value: 'claude', label: 'Claude' },
  { value: 'chatgpt', label: 'ChatGPT' },
  { value: 'anthropic_api', label: 'Anthropic API' },
  { value: 'openai_api', label: 'OpenAI API' },
  { value: 'gemini', label: 'Gemini' },
  { value: 'windsurf', label: 'Windsurf' },
];

const USE_CASES = [
  { value: 'coding', label: 'Coding' },
  { value: 'writing', label: 'Writing' },
  { value: 'data', label: 'Data Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed', label: 'Mixed Use' },
];

export default function SpendInputForm({ onSubmit }: SpendInputFormProps) {
  const [tools, setTools] = useState<ToolInput[]>([
    { tool: 'cursor', plan: 'pro', seats: 1 }
  ]);
  const [teamSize, setTeamSize] = useState(5);
  const [primaryUseCase, setPrimaryUseCase] = useState<'coding' | 'writing' | 'data' | 'research' | 'mixed'>('coding');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('spendsmartai_form');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setTools(data.tools || [{ tool: 'cursor', plan: 'pro', seats: 1 }]);
        setTeamSize(data.teamSize || 5);
        setPrimaryUseCase(data.primaryUseCase || 'coding');
      } catch (e) {
        console.error('Failed to load saved form data', e);
      }
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const data = { tools, teamSize, primaryUseCase };
    localStorage.setItem('spendsmartai_form', JSON.stringify(data));
  }, [tools, teamSize, primaryUseCase]);

  const addTool = () => {
    setTools([...tools, { tool: 'cursor', plan: 'pro', seats: 1 }]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, field: keyof ToolInput, value: string | number) => {
    const newTools = [...tools];
    newTools[index] = { ...newTools[index], [field]: value };
    setTools(newTools);
  };

  const getPlansForTool = (toolValue: string) => {
    const toolKey = toolValue as keyof typeof PRICING_DATA;
    const pricing = PRICING_DATA[toolKey];
    if (!pricing) return [];
    
    return Object.entries(pricing).map(([key, value]) => ({
      value: key,
      label: value.name,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ tools, teamSize, primaryUseCase });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span className="text-blue-400">💰</span>
          Your AI Tools
        </h2>
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <div key={index} className="glass rounded-xl p-5 space-y-3 card-hover border border-gray-700/50">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">Tool</label>
                    <select
                      value={tool.tool}
                      onChange={(e) => updateTool(index, 'tool', e.target.value)}
                      className="w-full glass border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {TOOLS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-300">Plan</label>
                    <select
                      value={tool.plan}
                      onChange={(e) => updateTool(index, 'plan', e.target.value)}
                      className="w-full glass border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {getPlansForTool(tool.tool).map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {tool.plan === 'api' ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Monthly Spend ($)</label>
                      <input
                        type="number"
                        value={tool.monthlySpend || ''}
                        onChange={(e) => updateTool(index, 'monthlySpend', parseFloat(e.target.value) || 0)}
                        className="w-full glass border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-300">Seats</label>
                      <input
                        type="number"
                        value={tool.seats || 1}
                        onChange={(e) => updateTool(index, 'seats', parseInt(e.target.value) || 1)}
                        className="w-full glass border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                        required
                      />
                    </div>
                  )}
                </div>
                
                {tools.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeTool(index)}
                    className="mt-8 p-2.5 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                    aria-label="Remove tool"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addTool}
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold px-4 py-2 rounded-lg hover:bg-blue-500/10 transition-all"
          >
            <Plus size={20} />
            Add Another Tool
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">Team Size</label>
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
            className="w-full glass border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-300">Primary Use Case</label>
          <select
            value={primaryUseCase}
            onChange={(e) => setPrimaryUseCase(e.target.value as FormData['primaryUseCase'])}
            className="w-full glass border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {USE_CASES.map(uc => (
              <option key={uc.value} value={uc.value}>{uc.label}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl glow btn-pulse text-lg"
      >
        🚀 Audit My Spend
      </button>
    </form>
  );
}
