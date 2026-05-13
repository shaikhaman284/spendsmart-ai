'use client';

import { useState } from 'react';
import SpendInputForm from '@/components/SpendInputForm';
import AuditResults from '@/components/AuditResults';
import { FormData, AuditSummary } from '@/lib/types';
import { Sparkles, TrendingDown, Zap } from 'lucide-react';

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
    <main className="min-h-screen gradient-bg">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <Sparkles className="w-64 h-64 text-blue-500 float" />
          </div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300 font-medium">AI Spend Optimization Tool</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 gradient-text leading-tight">
              Stop Guessing.<br />See Where Your AI Budget Leaks.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-3 max-w-3xl mx-auto">
              Get a personalized audit of your AI tool spend in <span className="text-blue-400 font-semibold">60 seconds</span>.
            </p>
            
            <p className="text-lg text-gray-400 flex items-center justify-center gap-2">
              <TrendingDown className="w-5 h-5 text-green-400" />
              Built by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-semibold underline decoration-2 underline-offset-4">Credex</a> for startups serious about efficiency
            </p>
          </div>
        </div>

        {/* Show Results or Form */}
        {auditResults ? (
          <div className="animate-in fade-in duration-500">
            <button
              onClick={handleReset}
              className="mb-8 flex items-center gap-2 text-blue-400 hover:text-blue-300 font-semibold text-lg group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Run Another Audit
            </button>
            <AuditResults audit={auditResults} />
          </div>
        ) : (
          <div className="glass rounded-3xl p-8 md:p-12 shadow-2xl glow-hover">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500/20 border-t-blue-500 mb-6"></div>
                  <Sparkles className="w-6 h-6 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-300 text-lg font-medium">Analyzing your spend...</p>
                <p className="text-gray-500 text-sm mt-2">This will only take a moment</p>
              </div>
            ) : (
              <SpendInputForm onSubmit={handleSubmit} />
            )}
          </div>
        )}

        {/* Features Section */}
        {!auditResults && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Instant Analysis</h3>
              <p className="text-gray-400 text-sm">Get results in 60 seconds, no signup required</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Smart Recommendations</h3>
              <p className="text-gray-400 text-sm">AI-powered insights tailored to your stack</p>
            </div>
            
            <div className="glass rounded-2xl p-6 text-center card-hover">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-green-400" />
              </div>
              <h3 className="text-lg font-bold mb-2">Real Savings</h3>
              <p className="text-gray-400 text-sm">Find $100s-$1000s in monthly savings</p>
            </div>
          </div>
        )}

        {/* Social Proof */}
        {!auditResults && (
          <div className="mt-12 text-center">
            <p className="text-gray-500 text-sm">
              Trusted by engineering teams at fast-growing startups across India
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

