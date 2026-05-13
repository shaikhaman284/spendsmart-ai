'use client';

import { useState } from 'react';
import { AuditSummary } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';
import { TrendingDown, CheckCircle, AlertCircle, Mail, Copy, Check } from 'lucide-react';

interface AuditResultsProps {
  audit: AuditSummary;
  auditId?: string;
}

export default function AuditResults({ audit, auditId }: AuditResultsProps) {
  const { results, totalMonthlySavings, totalAnnualSavings, aiSummary } = audit;
  const hasSignificantSavings = totalMonthlySavings >= 500;
  
  const [email, setEmail] = useState('');
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSending(true);

    try {
      const response = await fetch('/api/send-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          audit: {
            results,
            totalMonthlySavings,
            totalAnnualSavings,
            aiSummary,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setEmailSent(true);
      setEmail('');
    } catch (err) {
      console.error('Email send error:', err);
      alert('Failed to send email. Please try again.');
    } finally {
      setEmailSending(false);
    }
  };

  const handleCopy = () => {
    if (auditId) {
      navigator.clipboard.writeText(`${window.location.origin}/audit/${auditId}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-10 text-center shadow-2xl glow">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4">
          {totalMonthlySavings > 0 ? (
            <>💰 Save {formatCurrency(totalMonthlySavings)}/month</>
          ) : (
            <>✨ You&apos;re Spending Well!</>
          )}
        </h1>
        {totalMonthlySavings > 0 && (
          <p className="text-3xl md:text-4xl opacity-90 font-bold">
            {formatCurrency(totalAnnualSavings)} annually
          </p>
        )}
      </div>

      {/* Email Report Section */}
      <div className="glass rounded-2xl p-8 border border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="text-blue-400" size={28} />
          <h2 className="text-2xl font-bold">Get Your Report via Email</h2>
        </div>
        
        {emailSent ? (
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 text-center">
            <CheckCircle className="mx-auto mb-3 text-green-400" size={48} />
            <p className="text-lg font-semibold text-green-300">Report sent successfully!</p>
            <p className="text-gray-400 mt-2">Check your inbox for the detailed audit report.</p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 glass border border-gray-600 rounded-xl px-5 py-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={emailSending}
            />
            <button
              type="submit"
              disabled={emailSending}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {emailSending ? 'Sending...' : '📧 Send Report'}
            </button>
          </form>
        )}
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="glass rounded-2xl p-8 border border-blue-500/30 card-hover">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="text-blue-400" size={24} />
            </div>
            AI Analysis
          </h2>
          <p className="text-gray-300 leading-relaxed text-lg">{aiSummary}</p>
        </div>
      )}

      {/* Per-Tool Results */}
      <div>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
          <span>📊</span>
          Tool-by-Tool Breakdown
        </h2>
        <div className="grid gap-5">
          {results.map((result, index) => (
            <div
              key={index}
              className="glass rounded-2xl p-6 border border-gray-700/50 card-hover"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold capitalize mb-3">
                    {result.tool.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-gray-300 mb-4 text-lg">{result.reason}</p>
                  <div className="flex flex-wrap gap-6 text-sm">
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                      <span className="text-gray-400">Current: </span>
                      <span className="font-bold text-white">{formatCurrency(result.currentSpend)}/mo</span>
                    </div>
                    <div className="bg-gray-800/50 px-4 py-2 rounded-lg">
                      <span className="text-gray-400">Action: </span>
                      <span className="font-bold text-blue-300">{result.recommendedAction}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {result.savings > 0 ? (
                    <>
                      <div className="w-14 h-14 bg-green-500/20 rounded-full flex items-center justify-center">
                        <TrendingDown className="text-green-400" size={32} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-400">
                          {formatCurrency(result.savings)}
                        </div>
                        <div className="text-sm text-gray-400">saved/mo</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-gray-700/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="text-gray-400" size={32} />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-gray-400">
                          Optimized
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {hasSignificantSavings ? (
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-10 text-center shadow-2xl glow">
          <h2 className="text-4xl font-bold mb-4">🎯 Get These Savings via Credex Credits</h2>
          <p className="text-xl mb-8 opacity-90">
            Credex helps startups optimize AI spend with flexible credits and expert guidance.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-green-700 font-bold py-4 px-10 rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            Learn More About Credex →
          </a>
        </div>
      ) : totalMonthlySavings < 100 ? (
        <div className="glass rounded-2xl p-10 text-center border border-green-500/30">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-400" size={48} />
          </div>
          <h2 className="text-3xl font-bold mb-4">You&apos;re Spending Well!</h2>
          <p className="text-gray-300 text-lg">
            Your AI tool stack is already optimized. We&apos;ll notify you if better options become available.
          </p>
        </div>
      ) : null}

      {/* Share Section */}
      {auditId && (
        <div className="glass rounded-2xl p-8 border border-gray-700/50">
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
            <span>🔗</span>
            Share Your Audit
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={`${window.location.origin}/audit/${auditId}`}
              readOnly
              className="flex-1 glass border border-gray-600 rounded-xl px-5 py-3 text-white"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check size={20} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={20} />
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

