'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DashboardData } from '@/types/dashboard';

const MapComponent = dynamic(() => import('./MapComponent'), { ssr: false });

function RiskBadge({ level, color, reasoning }: { level: string; color: string; reasoning: string }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="px-4 py-2 rounded-xl font-bold text-lg tracking-wider animate-pulse"
        style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}40` }}
      >
        {level}
      </div>
      <span className="text-slate-400 text-sm">{reasoning}</span>
    </div>
  );
}

function MarketCard({ label, price, change, direction }: { label: string; price: string; change: string; direction: string }) {
  const dirColor = direction === 'up' ? 'text-green-400' : direction === 'down' ? 'text-red-400' : 'text-slate-400';
  const arrow = direction === 'up' ? '\u25B2' : direction === 'down' ? '\u25BC' : '\u25CF';

  return (
    <div className="bg-slate-800/50 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/70 transition-all">
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-xl font-bold">{price}</p>
      {change && (
        <p className={`text-sm font-medium ${dirColor} mt-1`}>
          {arrow} {change}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Failed to fetch');
      const d = await res.json();
      setData(d);
    } catch (err) {
      setError('Failed to load dashboard data. Please refresh.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4 animate-pulse">
            <svg className="w-8 h-8 text-red-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm">Loading intelligence briefing...</p>
          <p className="text-slate-600 text-xs mt-2">Fetching latest data from multiple sources</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 flex items-center justify-center">
        <div className="text-center bg-red-500/10 border border-red-500/20 rounded-2xl p-8 max-w-md">
          <p className="text-red-400 mb-4">{error}</p>
          <button onClick={fetchData} className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-500 transition-all">
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const lastUpdated = new Date(data.lastUpdated);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-red-950">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Middle East Crisis Briefing</h1>
                <p className="text-slate-500 text-xs">C-Level Executive Dashboard</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-slate-400 text-xs">Last Updated</p>
                <p className="text-white text-sm font-medium">
                  {lastUpdated.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} | {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                </p>
              </div>
              <button
                onClick={fetchData}
                className="p-2 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
                title="Refresh data"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Risk Level + Executive Summary */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-4">
            <div>
              <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Risk Assessment</h2>
              <RiskBadge
                level={data.aiSummary.riskLevel.level}
                color={data.aiSummary.riskLevel.color}
                reasoning={data.aiSummary.riskLevel.reasoning}
              />
            </div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-5 mt-4">
            <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI Executive Summary
            </h3>
            <p className="text-white text-base leading-relaxed">{data.aiSummary.executiveSummary}</p>
          </div>
        </div>

        {/* India & Bosch Impact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21V3h18v18H3z" />
              </svg>
              Impact on India
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{data.aiSummary.indiaImpact}</p>
          </div>
          <div className="bg-slate-900/80 backdrop-blur-xl border border-blue-500/20 rounded-2xl p-6">
            <h3 className="text-sm font-medium text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Bosch India Impact
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{data.aiSummary.boschImpact}</p>
          </div>
        </div>

        {/* Markets */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Market & Energy Tracker
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <MarketCard label="Brent Crude" {...data.markets.brentCrude} />
            <MarketCard label="WTI Crude" {...data.markets.wtiCrude} />
            <MarketCard label="Natural Gas" {...data.markets.naturalGas} />
            <MarketCard label="Sensex" {...data.markets.sensex} />
            <MarketCard label="INR/USD" {...data.markets.inrUsd} />
            <MarketCard label="Gold" {...data.markets.gold} />
          </div>
        </div>

        {/* Strategic Map */}
        <MapComponent />

        {/* News + Shipping Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Overnight Developments */}
          <div className="lg:col-span-2 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              Overnight Developments
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {data.news.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-800/30 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-800/60 hover:border-slate-600/50 transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="text-white text-sm font-medium group-hover:text-amber-300 transition-colors leading-snug">
                        {item.title}
                      </h4>
                      {item.snippet && item.snippet !== item.title && (
                        <p className="text-slate-400 text-xs mt-1.5 line-clamp-2">{item.snippet}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-slate-500">{item.source}</span>
                        <span className="text-xs text-slate-600">{item.date}</span>
                        {item.indiaImpact && (
                          <span className="text-[10px] px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded-full border border-orange-500/20">
                            India Impact
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Shipping & Logistics */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6">
            <h2 className="text-sm font-medium text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
              Shipping & Red Sea
            </h2>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {data.shipping.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-slate-800/30 border border-slate-700/30 rounded-xl p-3 hover:bg-slate-800/60 hover:border-amber-500/20 transition-all group"
                >
                  <h4 className="text-white text-xs font-medium group-hover:text-amber-300 transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-slate-500">{item.source}</span>
                    <span className="text-[10px] text-slate-600">{item.date}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>Bosch India | Strategic Intelligence Unit</span>
            <span>Data refreshed automatically | Sources: SerpAPI, Claude AI Analysis</span>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
