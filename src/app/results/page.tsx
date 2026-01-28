'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Minus, BookOpen, ExternalLink } from 'lucide-react';

// This page displays pre-generated results that are updated 1-2x daily
// The live analysis tool is available at app.polybius.world

interface StoredResults {
  generatedAt: string;
  country: string;
  aciScore: number;
  riskLevel: string;
  scores: Record<string, number>;
  summary: string;
  factorResults: Record<string, { score: number; evidence: string; trend: string }>;
  historicalComparison?: {
    averageScore: number;
    mostSimilarCases: { country: string; period: string; outcome: string }[];
    interpretation: string[];
  };
}

// Default placeholder - will be replaced with actual results
const DEFAULT_RESULTS: StoredResults = {
  generatedAt: new Date().toISOString(),
  country: 'United States',
  aciScore: 0,
  riskLevel: 'Loading...',
  scores: {},
  summary: 'Results are generated daily using Claude AI with real-time web search. Check back for the latest analysis.',
  factorResults: {},
};

export default function ResultsPage() {
  const [results, setResults] = useState<StoredResults>(DEFAULT_RESULTS);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Fetch from the static JSON file
    fetch('/results.json')
      .then(res => res.json())
      .then(data => {
        setResults(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch results:', err);
        setLoading(false);
      });
  }, []);

  const getRiskColor = (score: number) => {
    if (score < 25) return { bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-50' };
    if (score < 40) return { bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-50' };
    if (score < 50) return { bg: 'bg-orange-400', text: 'text-orange-700', light: 'bg-orange-50' };
    if (score < 65) return { bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-50' };
    return { bg: 'bg-red-700', text: 'text-red-800', light: 'bg-red-100' };
  };

  const getTrendIcon = (trend: string) => {
    if (trend === 'worsening') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'improving') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-slate-400" />;
  };

  const colors = getRiskColor(results.aciScore);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading results...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Polybius</h1>
          <p className="text-lg text-slate-600 mb-4">Authoritarian Consolidation Index</p>
          <p className="text-sm text-slate-500">
            Last updated: {new Date(results.generatedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </header>

        {/* Main Score */}
        <div className={`${colors.light} rounded-2xl p-8 mb-8 border-2 ${colors.bg.replace('bg-', 'border-')}`}>
          <div className="text-center">
            <div className={`text-7xl font-bold ${colors.text} mb-2`}>
              {results.aciScore.toFixed(1)}
            </div>
            <div className={`text-xl font-semibold ${colors.text} mb-4`}>
              {results.riskLevel}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${colors.bg}`}
                style={{ width: `${results.aciScore}%` }}
              />
            </div>
            <p className="text-slate-600 text-sm">
              {results.country} | Scale: 0 (Stable Democracy) to 100 (Consolidated Authoritarianism)
            </p>
          </div>
        </div>

        {/* Summary */}
        {results.summary && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Analysis Summary</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{results.summary}</p>
          </div>
        )}

        {/* Factor Breakdown */}
        {Object.keys(results.factorResults).length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Factor Scores</h2>
            <div className="space-y-4">
              {Object.entries(results.factorResults).map(([factorId, data]) => (
                <div key={factorId} className="border-b border-slate-100 pb-4 last:border-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-700 capitalize">
                        {factorId.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      {getTrendIcon(data.trend)}
                    </div>
                    <span className={`font-bold ${
                      data.score >= 60 ? 'text-red-600' :
                      data.score >= 40 ? 'text-amber-600' :
                      'text-green-600'
                    }`}>
                      {data.score}/100
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-full rounded-full ${
                        data.score >= 60 ? 'bg-red-500' :
                        data.score >= 40 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  {data.evidence && (
                    <p className="text-sm text-slate-600">{data.evidence}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Historical Comparison */}
        {results.historicalComparison && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-700" />
              <h2 className="text-xl font-bold text-slate-800">Historical Comparison</h2>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              Based on V-Dem data, Polity Project scores, and comparative historiography.
            </p>
            <div className="space-y-2 mb-4">
              {results.historicalComparison.mostSimilarCases.slice(0, 3).map((c, i) => (
                <div key={i} className={`p-3 rounded-lg flex justify-between items-center ${
                  c.outcome === 'consolidated' ? 'bg-red-50 border border-red-200' :
                  c.outcome === 'resisted' ? 'bg-green-50 border border-green-200' :
                  'bg-blue-50 border border-blue-200'
                }`}>
                  <span className="font-medium text-slate-800">{c.country} ({c.period})</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    c.outcome === 'consolidated' ? 'bg-red-200 text-red-800' :
                    c.outcome === 'resisted' ? 'bg-green-200 text-green-800' :
                    'bg-blue-200 text-blue-800'
                  }`}>
                    {c.outcome}
                  </span>
                </div>
              ))}
            </div>
            {results.historicalComparison.interpretation.map((line, i) => (
              <p key={i} className="text-sm text-slate-700 mb-1">{line}</p>
            ))}
          </div>
        )}

        {/* Methodology */}
        <div className="bg-white rounded-xl p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Methodology</h2>
          <div className="text-sm text-slate-600 space-y-3">
            <p>
              <strong>Theoretical Framework:</strong> Polybius synthesizes multiple theories of democratic backsliding including
              Levitsky & Ziblatt (institutional erosion), Berman & Riley (civil society destruction), Linz (presidentialism),
              Svolik (elite coordination), and Gramscian hegemony theory.
            </p>
            <p>
              <strong>Data Sources:</strong> Real-time analysis uses Claude AI with web search to gather current news,
              polling data, and expert assessments. Historical comparisons draw from V-Dem, Polity Project, and academic literature.
            </p>
            <p>
              <strong>Factor Weights:</strong> Different theoretical models weight factors differently. Marxian analysis
              emphasizes corporate compliance; institutionalists focus on judicial capture; Berman-Riley tracks mobilizational balance.
            </p>
          </div>
        </div>

        {/* CTA to Live Tool */}
        <div className="text-center mb-8">
          <a
            href="https://app.polybius.world"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Run Live Analysis
            <ExternalLink className="w-4 h-4" />
          </a>
          <p className="text-sm text-slate-500 mt-2">
            Use your own API key to run real-time analysis with the latest data
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
          <p className="mb-2">
            Built with theoretical frameworks from Linz, Levitsky & Ziblatt, Gramsci, Paxton, Svolik, Berman, Riley, and others.
          </p>
          <p>
            Historical data from <a href="https://v-dem.net/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">V-Dem</a> and
            the <a href="https://www.systemicpeace.org/polityproject.html" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Polity Project</a>.
            Analysis powered by Claude AI.
          </p>
        </footer>
      </div>
    </div>
  );
}
