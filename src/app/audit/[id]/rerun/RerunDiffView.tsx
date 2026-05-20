'use client';

import { useState } from 'react';
import { AuditResult } from '@/lib/types';
import { PricingDiff } from '@/lib/pricingChangeDetector';

interface DiffViewProps {
  auditId: string;
  oldResults: AuditResult[];
  newResults: AuditResult[];
  diff: PricingDiff;
  email?: string;
}

function formatCurrency(amount: number): string {
  return `$${Math.abs(amount).toFixed(0)}`;
}

function formatToolName(tool: string): string {
  return tool.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function Badge({ children, variant }: { children: React.ReactNode; variant: 'changed' | 'same' | 'better' | 'worse' }) {
  const styles = {
    changed: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    same: 'bg-slate-700/60 text-slate-400 border border-slate-600/40',
    better: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
    worse: 'bg-red-500/20 text-red-300 border border-red-500/40',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  );
}

interface DiffRowProps {
  oldResult: AuditResult;
  newResult: AuditResult;
  changed: boolean;
  collapsed: boolean;
  onToggle: () => void;
}

function DiffRow({ oldResult, newResult, changed, collapsed, onToggle }: DiffRowProps) {
  const savingsDelta = newResult.savings - oldResult.savings;
  const deltaPositive = savingsDelta > 0;
  const deltaNeutral = savingsDelta === 0;

  if (!changed && collapsed) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800/40 border border-slate-700/30 opacity-60">
        <span className="text-sm text-slate-400">{formatToolName(oldResult.tool)}</span>
        <div className="flex items-center gap-2">
          <Badge variant="same">No change</Badge>
          <button
            onClick={onToggle}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Show
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        changed
          ? 'border-amber-500/40 bg-amber-950/20 shadow-lg shadow-amber-900/10'
          : 'border-slate-700/30 bg-slate-800/30 opacity-80'
      }`}
    >
      {/* Tool header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-white text-base">{formatToolName(oldResult.tool)}</span>
          {changed ? (
            <Badge variant="changed">⚡ Updated</Badge>
          ) : (
            <Badge variant="same">No change</Badge>
          )}
        </div>
        {!changed && (
          <button
            onClick={onToggle}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            Collapse
          </button>
        )}
      </div>

      {/* Diff columns */}
      <div className="grid grid-cols-2 divide-x divide-white/5">
        {/* Old recommendation */}
        <div className="px-5 py-4">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-medium">Before</p>
          <p className="text-sm text-slate-300 font-medium mb-1">{oldResult.recommendedAction}</p>
          <p className="text-xs text-slate-500 leading-relaxed">{oldResult.reason}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-slate-500">Spend:</span>
            <span className="text-sm font-semibold text-slate-300">{formatCurrency(oldResult.currentSpend)}/mo</span>
            {oldResult.savings > 0 && (
              <>
                <span className="text-xs text-slate-500">Savings:</span>
                <span className="text-sm font-semibold text-slate-300 line-through">{formatCurrency(oldResult.savings)}/mo</span>
              </>
            )}
          </div>
        </div>

        {/* New recommendation */}
        <div className={`px-5 py-4 ${changed ? 'bg-amber-900/10' : ''}`}>
          <p className={`text-xs uppercase tracking-widest mb-2 font-medium ${changed ? 'text-amber-400/80' : 'text-slate-500'}`}>
            Now
          </p>
          <p className={`text-sm font-medium mb-1 ${changed ? 'text-amber-200' : 'text-slate-300'}`}>
            {newResult.recommendedAction}
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">{newResult.reason}</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-slate-500">Spend:</span>
            <span className="text-sm font-semibold text-slate-300">{formatCurrency(newResult.currentSpend)}/mo</span>
            {newResult.savings > 0 && (
              <>
                <span className="text-xs text-slate-500">Savings:</span>
                <span className={`text-sm font-semibold ${
                  deltaPositive ? 'text-emerald-400' : deltaNeutral ? 'text-slate-300' : 'text-red-400'
                }`}>
                  {formatCurrency(newResult.savings)}/mo
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Savings delta banner (only when changed) */}
      {changed && (
        <div className={`px-5 py-2.5 border-t border-white/5 flex items-center justify-end gap-2 ${
          deltaPositive ? 'bg-emerald-950/30' : deltaNeutral ? 'bg-slate-800/30' : 'bg-red-950/30'
        }`}>
          <span className="text-xs text-slate-400">Savings impact:</span>
          <span className={`text-sm font-bold ${
            deltaPositive ? 'text-emerald-400' : deltaNeutral ? 'text-slate-400' : 'text-red-400'
          }`}>
            {savingsDelta === 0
              ? 'No change in savings'
              : `${deltaPositive ? '+' : ''}${formatCurrency(savingsDelta)}/mo`}
          </span>
        </div>
      )}
    </div>
  );
}

export default function RerunDiffView({ auditId, oldResults, newResults, diff, email }: DiffViewProps) {
  // Track collapsed state for unchanged rows
  const [collapsedSame, setCollapsedSame] = useState(true);
  const [collapsedTools, setCollapsedTools] = useState<Record<string, boolean>>({});

  const changedTools = new Set(diff.recommendationChanges.map((c) => c.tool));

  const savingsDelta = diff.newTotalSavings - diff.oldTotalSavings;
  const deltaPositive = savingsDelta > 0;

  // Pair old and new results by tool
  const pairedResults = oldResults.map((oldR) => ({
    oldResult: oldR,
    newResult: newResults.find((n) => n.tool === oldR.tool) ?? oldR,
    changed: changedTools.has(oldR.tool),
  }));

  const changedCount = pairedResults.filter((p) => p.changed).length;
  const sameCount = pairedResults.length - changedCount;

  return (
    <div className="space-y-6">
      {/* Hero headline */}
      <div className="rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="px-8 py-8">
          <p className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-3">
            Re-Audit Diff · {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <h1 className="text-4xl font-black text-white mb-2 leading-tight">
            Your savings changed from{' '}
            <span className="text-slate-400 line-through decoration-2">{formatCurrency(diff.oldTotalSavings)}/mo</span>
            {' '}to{' '}
            <span className={deltaPositive ? 'text-emerald-400' : savingsDelta < 0 ? 'text-red-400' : 'text-slate-300'}>
              {formatCurrency(diff.newTotalSavings)}/mo
            </span>
          </h1>
          {savingsDelta !== 0 && (
            <p className={`text-xl font-bold ${deltaPositive ? 'text-emerald-400' : 'text-red-400'}`}>
              {deltaPositive ? '↑' : '↓'} {deltaPositive ? '+' : ''}{formatCurrency(savingsDelta)}/mo delta
              <span className="text-slate-400 font-normal text-base ml-3">
                ({deltaPositive ? '+' : ''}{formatCurrency(savingsDelta * 12)}/year)
              </span>
            </p>
          )}
          {savingsDelta === 0 && (
            <p className="text-slate-400 text-lg">Your savings potential is unchanged.</p>
          )}
        </div>

        {/* Stats bar */}
        <div className="border-t border-white/5 px-8 py-4 flex items-center gap-6 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-400"></div>
            <span className="text-sm text-slate-300">{changedCount} tool{changedCount !== 1 ? 's' : ''} changed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
            <span className="text-sm text-slate-500">{sameCount} unchanged</span>
          </div>
          {diff.priceChanges.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <span className="text-sm text-slate-300">{diff.priceChanges.length} price{diff.priceChanges.length !== 1 ? 's' : ''} updated</span>
            </div>
          )}
        </div>
      </div>

      {/* Price change summary pills */}
      {diff.priceChanges.length > 0 && (
        <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 px-5 py-4">
          <p className="text-sm font-semibold text-blue-300 mb-3">Pricing Updates Detected</p>
          <div className="flex flex-wrap gap-2">
            {diff.priceChanges.map((change) => (
              <div
                key={`${change.tool}-${change.plan}`}
                className="flex items-center gap-2 bg-slate-800/80 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm"
              >
                <span className="text-slate-300">{formatToolName(change.tool)} {formatToolName(change.plan)}</span>
                <span className="text-slate-500 line-through text-xs">{formatCurrency(change.oldPrice)}</span>
                <span className="text-emerald-400 font-semibold text-xs">→ {formatCurrency(change.newPrice)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Column labels */}
      <div className="grid grid-cols-2 gap-0 px-5">
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">← Old Recommendation</p>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium">New Recommendation →</p>
      </div>

      {/* Diff rows */}
      <div className="space-y-3">
        {/* Changed rows first */}
        {pairedResults
          .filter((p) => p.changed)
          .map((p) => (
            <DiffRow
              key={p.oldResult.tool}
              oldResult={p.oldResult}
              newResult={p.newResult}
              changed={true}
              collapsed={false}
              onToggle={() => {}}
            />
          ))}

        {/* Unchanged rows — collapsible group */}
        {sameCount > 0 && (
          <div>
            {collapsedSame ? (
              <button
                onClick={() => setCollapsedSame(false)}
                className="w-full text-left px-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700/30 text-sm text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-all"
              >
                ▼ Show {sameCount} unchanged tool{sameCount !== 1 ? 's' : ''}
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setCollapsedSame(true)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
                >
                  ▲ Collapse unchanged
                </button>
                {pairedResults
                  .filter((p) => !p.changed)
                  .map((p) => (
                    <DiffRow
                      key={p.oldResult.tool}
                      oldResult={p.oldResult}
                      newResult={p.newResult}
                      changed={false}
                      collapsed={collapsedTools[p.oldResult.tool] ?? false}
                      onToggle={() =>
                        setCollapsedTools((prev) => ({
                          ...prev,
                          [p.oldResult.tool]: !prev[p.oldResult.tool],
                        }))
                      }
                    />
                  ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="rounded-xl border border-white/10 bg-slate-800/50 px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-semibold text-white">Want to re-run a fresh audit?</p>
          <p className="text-sm text-slate-400">Submit new inputs to get an up-to-date analysis.</p>
        </div>
        <a
          href="/"
          className="shrink-0 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-all"
        >
          New Audit →
        </a>
      </div>
    </div>
  );
}
