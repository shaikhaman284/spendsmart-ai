'use client';

import { useState } from 'react';
import SpendInputForm from '@/components/SpendInputForm';
import AuditResults from '@/components/AuditResults';
import { FormData, AuditSummary } from '@/lib/types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditSummary | null>(null);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate audit');
      }
      
      // Show results directly on the page
      setAuditResults({
        results: data.results,
        totalMonthlySavings: data.totalMonthlySavings,
        totalAnnualSavings: data.totalAnnualSavings,
        aiSummary: data.aiSummary,
      });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setAuditResults(null);
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Stop Guessing. See Exactly Where Your AI Budget Leaks.
          </h1>
          <p className="text-xl text-gray-400 mb-2">
            Get a personalized audit of your AI tool spend in 60 seconds.
          </p>
          <p className="text-lg text-gray-500">
            Built by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Credex</a> for startups serious about efficiency.
          </p>
        </div>

        {/* Show Results or Form */}
        {auditResults ? (
          <div>
            <button
              onClick={handleReset}
              className="mb-6 text-blue-400 hover:text-blue-300 font-medium"
            >
              ← Run Another Audit
            </button>
            <AuditResults audit={auditResults} />
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-400">Analyzing your spend...</p>
              </div>
            ) : (
              <SpendInputForm onSubmit={handleSubmit} />
            )}
          </div>
        )}

        {/* Social Proof */}
        {!auditResults && (
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Trusted by engineering teams at fast-growing startups</p>
          </div>
        )}
      </div>
    </main>
  );
}
