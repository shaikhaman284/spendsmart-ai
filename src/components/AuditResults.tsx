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
      <div className="gradient-primary rounded-2xl p-10 text-center card-shadow-xl text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          {totalMonthlySavings > 0 ? (
            <>Save {formatCurrency(totalMonthlySavings)}/month</>
          ) : (
            <>You&apos;re Spending Well!</>
          )}
        </h1>
        {totalMonthlySavings > 0 && (
          <p className="text-2xl md:text-3xl opacity-90 font-semibold">
            {formatCurrency(totalAnnualSavings)} annually
          </p>
        )}
      </div>

      {/* Email Report Section */}
      <div className="bg-white rounded-2xl p-8 card-shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Mail className="text-blue-600" size={20} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Get Your Report via Email</h2>
        </div>
        
        {emailSent ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <CheckCircle className="mx-auto mb-3 text-green-600" size={48} />
            <p className="text-lg font-semibold text-green-800">Report sent successfully!</p>
            <p className="text-gray-600 mt-2">Check your inbox for the detailed audit report.</p>
          </div>
        ) : (
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-white border border-gray-300 rounded-xl px-5 py-3 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
              disabled={emailSending}
            />
            <button
              type="submit"
              disabled={emailSending}
              className="btn-primary text-white font-bold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {emailSending ? 'Sending...' : 'Send Report'}
            </button>
          </form>
        )}
      </div>

      {/* AI Summary */}
      {aiSummary && (
        <div className="bg-blue-50 rounded-2xl p-8 border border-blue-200 card-hover">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-gray-900">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="text-blue-600" size={20} />
            </div>
            AI Analysis
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">{aiSummary}</p>
        </div>
      )}

      {/* Per-Tool Results */}
      <div>
        <h2 className="text-3xl font-bold mb-6 text-gray-900">
          Tool-by-Tool Breakdown
        </h2>
        <div className="grid gap-5">
          {results.map((result, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 border border-gray-200 card-shadow card-hover"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold capitalize mb-3 text-gray-900">
                    {result.tool.replace(/_/g, ' ')}
                  </h3>
                  <p className="text-gray-600 mb-4 text-base leading-relaxed">{result.reason}</p>
                  <div className="flex flex-wrap gap-3">
                    <div className="badge badge-blue">
                      Current: <span className="font-bold ml-1">{formatCurrency(result.currentSpend)}/mo</span>
                    </div>
                    <div className="badge badge-pink">
                      Action: <span className="font-bold ml-1">{result.recommendedAction}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {result.savings > 0 ? (
                    <>
                      <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                        <TrendingDown className="text-green-600" size={28} />
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">
                          {formatCurrency(result.savings)}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">saved/mo</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="text-gray-500" size={28} />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-semibold text-gray-500">
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
        <div className="gradient-success rounded-2xl p-10 text-center card-shadow-xl text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get These Savings via Credex Credits</h2>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Credex helps startups optimize AI spend with flexible credits and expert guidance.
          </p>
          <a
            href="https://credex.rocks"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-green-700 font-bold py-4 px-10 rounded-xl hover:bg-gray-50 transition-all card-shadow-lg text-lg"
          >
            Learn More About Credex →
          </a>
        </div>
      ) : totalMonthlySavings < 100 ? (
        <div className="bg-green-50 rounded-2xl p-10 text-center border border-green-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="text-green-600" size={40} />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-900">You&apos;re Spending Well!</h2>
          <p className="text-gray-600 text-lg">
            Your AI tool stack is already optimized. We&apos;ll notify you if better options become available.
          </p>
        </div>
      ) : null}

      {/* Share + Re-run Section */}
      {auditId && (
        <div className="bg-white rounded-2xl p-8 border border-gray-200 card-shadow space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            Share Your Audit
          </h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={`${window.location.origin}/audit/${auditId}`}
              readOnly
              className="flex-1 bg-gray-50 border border-gray-300 rounded-xl px-5 py-3 text-gray-700"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all card-shadow flex items-center justify-center gap-2 whitespace-nowrap"
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

          {/* Round 2: Re-run link */}
          <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-blue-800">🔄 Pricing changed since your audit?</p>
              <p className="text-xs text-blue-600 mt-0.5">See what recommendations would look like today.</p>
            </div>
            <a
              href={`/audit/${auditId}/rerun`}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ml-4"
            >
              Check for Updates →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

