'use client';

import { useState } from 'react';
import SpendInputForm from '@/components/SpendInputForm';
import AuditResults from '@/components/AuditResults';
import { FormData, AuditSummary } from '@/lib/types';
import { Sparkles, TrendingDown, Zap, Shield } from 'lucide-react';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [auditResults, setAuditResults] = useState<AuditSummary | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);

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
      setAuditId(data.auditId || null);
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
    setAuditId(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 max-w-6xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">SpendSmart AI</span>
          </div>
          <a 
            href="https://credex.rocks" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-gray-600 hover:text-blue-600"
          >
            by Credex
          </a>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 md:py-20 max-w-6xl">
        {/* Hero Section */}
        {!auditResults && (
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">Free AI Spend Audit</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 text-gray-900 leading-tight">
              Stop Overpaying for
              <br />
              <span className="gradient-text">AI Tools</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
              Get a personalized audit of your AI tool spend in <span className="text-blue-600 font-semibold">60 seconds</span>
            </p>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500 mt-8">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-600" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-green-600" />
                <span>Find $100s-$1000s in savings</span>
              </div>
            </div>
          </div>
        )}

        {/* Show Results or Form */}
        {auditResults ? (
          <div className="animate-slide-up">
            <button
              onClick={handleReset}
              className="mb-8 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold text-lg group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              Run Another Audit
            </button>
            <AuditResults audit={auditResults} auditId={auditId ?? undefined} />
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 md:p-12 card-shadow-xl border border-gray-200 animate-slide-up">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block relative mb-6">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-100 border-t-blue-600"></div>
                  <Sparkles className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-gray-700 text-lg font-semibold">Analyzing your spend...</p>
                <p className="text-gray-500 text-sm mt-2">This will only take a moment</p>
              </div>
            ) : (
              <SpendInputForm onSubmit={handleSubmit} />
            )}
          </div>
        )}

        {/* Features Section */}
        {!auditResults && (
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in">
            <div className="bg-white rounded-xl p-8 text-center card-shadow border border-gray-100 card-hover">
              <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Instant Analysis</h3>
              <p className="text-gray-600 leading-relaxed">Get results in 60 seconds with no signup or credit card required</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center card-shadow border border-gray-100 card-hover">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">Smart recommendations tailored to your tech stack and team size</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 text-center card-shadow border border-gray-100 card-hover">
              <div className="w-14 h-14 gradient-success rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Real Savings</h3>
              <p className="text-gray-600 leading-relaxed">Discover hundreds to thousands in monthly cost optimizations</p>
            </div>
          </div>
        )}

        {/* Social Proof */}
        {!auditResults && (
          <div className="mt-16 text-center">
            <p className="text-gray-500 text-sm">
              Trusted by engineering teams at fast-growing startups across India
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white mt-20">
        <div className="container mx-auto px-4 py-8 max-w-6xl text-center text-gray-600 text-sm">
          <p>© 2026 SpendSmart AI. Built by <a href="https://credex.rocks" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-semibold">Credex</a> for startups</p>
        </div>
      </footer>
    </main>
  );
}


