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
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          Your AI Tools
        </h2>
        <div className="space-y-4">
          {tools.map((tool, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-5 space-y-3 border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="flex items-start gap-3">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Tool</label>
                    <select
                      value={tool.tool}
                      onChange={(e) => updateTool(index, 'tool', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {TOOLS.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-2 text-gray-700">Plan</label>
                    <select
                      value={tool.plan}
                      onChange={(e) => updateTool(index, 'plan', e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      {getPlansForTool(tool.tool).map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  {tool.plan === 'api' ? (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Monthly Spend ($)</label>
                      <input
                        type="number"
                        value={tool.monthlySpend || ''}
                        onChange={(e) => updateTool(index, 'monthlySpend', parseFloat(e.target.value) || 0)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-gray-700">Seats</label>
                      <input
                        type="number"
                        value={tool.seats || 1}
                        onChange={(e) => updateTool(index, 'seats', parseInt(e.target.value) || 1)}
                        className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="mt-8 p-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
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
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all"
          >
            <Plus size={20} />
            Add Another Tool
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Team Size</label>
          <input
            type="number"
            value={teamSize}
            onChange={(e) => setTeamSize(parseInt(e.target.value) || 1)}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">Primary Use Case</label>
          <select
            value={primaryUseCase}
            onChange={(e) => setPrimaryUseCase(e.target.value as FormData['primaryUseCase'])}
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
        className="w-full btn-primary text-white font-bold py-4 px-6 rounded-xl transition-all text-lg"
      >
        Audit My Spend →
      </button>
    </form>
  );
}
