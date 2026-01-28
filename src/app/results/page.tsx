'use client';

import { useState, useEffect } from 'react';
import { Activity, TrendingUp, TrendingDown, Minus, BookOpen, ExternalLink, AlertCircle, Search, Users, Shield, Radio, ChevronDown, ChevronUp } from 'lucide-react';

// Social Signals Interfaces
interface TrendCategory {
  category: string;
  averageInterest: number;
  peakInterest: number;
  trend: string;
  topQueries: string[];
}

interface TrendsData {
  country: string;
  categoryAggregates: TrendCategory[];
  overallTemperature: number;
  interpretation: string[];
}

interface OpEdArticle {
  title: string;
  description: string;
  source: { name: string };
  sentiment: 'negative' | 'neutral' | 'positive';
  outletClass: string;
  outletAffinity: string;
  isNixonToChina: boolean;
  nixonType?: string;
}

interface OpEdData {
  country: string;
  totalArticles: number;
  articles: OpEdArticle[];
  nixonMoments: OpEdArticle[];
  interpretation: string[];
}

interface DefectionArticle {
  title: string;
  description: string;
  source: { name: string };
  figure: string;
  figureRole: string;
  severity: number;
}

interface EliteSignalsData {
  defections: {
    articles: DefectionArticle[];
    totalFound: number;
    coordinationScore: number;
  };
  propaganda: {
    effectivenessScore: number;
  };
  interpretation: string[];
}

interface BlueskyPost {
  text: string;
  author: string;
  likeCount: number;
  sentiment: string;
}

interface BlueskyData {
  country: string;
  totalPosts: number;
  posts: BlueskyPost[];
  sentimentBreakdown: { negative: number; neutral: number; positive: number };
  temperature: number;
  interpretation: string[];
}

interface MarketSignalsData {
  marketConditions: {
    sp500: { level: number; weekChange: number; trend: string };
    treasury10y: { yield: number; trend: string };
    vix: { level: number; interpretation: string };
  };
  tacoPatternAnalysis: {
    instancesLast90Days: number;
    patternHolding: boolean;
    summary: string;
  };
  businessSentiment: {
    overall: string;
    keyHeadlines: string[];
    eliteAlignment: string;
  };
  overallAssessment: {
    marketConstraintLevel: string;
    consolidationImplication: string;
    summary: string;
  };
}

interface ModelUsed {
  id: string;
  name: string;
  author: string;
  cluster: string;
  shortDesc: string;
  fullDesc: string;
  keyWorks: string;
  weights: Record<string, number>;
}

interface FactorResult {
  score: number;
  evidence: string;
  trend: string;
}

interface StoredResults {
  generatedAt: string;
  country: string;
  aciScore: number;
  riskLevel: string;
  scores: Record<string, number>;
  summary: string;
  factorResults: Record<string, FactorResult>;
  historicalComparison?: {
    averageScore: number;
    mostSimilarCases: { country: string; period: string; outcome: string }[];
    interpretation: string[];
  };
  socialSignals?: {
    trends: TrendsData | null;
    opEds: OpEdData | null;
    eliteSignals: EliteSignalsData | null;
    bluesky: BlueskyData | null;
    marketSignals: MarketSignalsData | null;
  };
  modelsUsed?: ModelUsed[];
}

const factors = [
  { id: 'judicial', name: 'Judicial Independence', dangerThreshold: 40 },
  { id: 'federalism', name: 'Federalism/Regional Resistance', dangerThreshold: 50 },
  { id: 'political', name: 'Political Competition', dangerThreshold: 55 },
  { id: 'media', name: 'Media Capture', dangerThreshold: 70 },
  { id: 'civil', name: 'Civil Society', dangerThreshold: 65 },
  { id: 'publicOpinion', name: 'Public Opinion', dangerThreshold: 55 },
  { id: 'mobilizationalBalance', name: 'Mobilizational Balance', dangerThreshold: 60 },
  { id: 'stateCapacity', name: 'State Capacity', dangerThreshold: 60 },
  { id: 'corporateCompliance', name: 'Corporate Compliance', dangerThreshold: 70 },
  { id: 'electionInterference', name: 'Election Interference', dangerThreshold: 40 }
];

const DEFAULT_RESULTS: StoredResults = {
  generatedAt: new Date().toISOString(),
  country: 'United States',
  aciScore: 0,
  riskLevel: 'Awaiting Analysis',
  scores: {},
  summary: 'No results have been published yet. Results are generated using Claude AI with real-time web search and published from the live analysis tool at app.polybius.world.',
  factorResults: {},
};

export default function ResultsPage() {
  const [results, setResults] = useState<StoredResults | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedModels, setExpandedModels] = useState<Record<string, boolean>>({});
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Fetch directly from blob storage to avoid server-side fetch issues
    const BLOB_URL = 'https://iube3munpbzbmeja.public.blob.vercel-storage.com/results.json';
    fetch(BLOB_URL, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        // Only update if we got valid data with an ACI score
        if (!data.error && typeof data.aciScore === 'number' && data.aciScore > 0) {
          setResults(data);
        } else {
          setFetchError(true);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch results:', err);
        setFetchError(true);
        setLoading(false);
      });
  }, []);

  // Use fetched results or show defaults only after fetch completes
  const displayResults = results || DEFAULT_RESULTS;

  const getRiskLevel = (score: number) => {
    if (score < 25) return { level: 'Stable Democracy', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' };
    if (score < 40) return { level: 'Democratic Stress', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' };
    if (score < 50) return { level: 'Competitive Authoritarian Risk', color: 'bg-orange-400', textColor: 'text-orange-700', bgLight: 'bg-orange-50' };
    if (score < 65) return { level: 'DANGER ZONE', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' };
    if (score < 80) return { level: 'Consolidating Authoritarianism', color: 'bg-red-700', textColor: 'text-red-800', bgLight: 'bg-red-100' };
    return { level: 'Authoritarian Regime', color: 'bg-red-900', textColor: 'text-red-900', bgLight: 'bg-red-200' };
  };

  const getProbability = (score: number) => {
    if (score < 25) return '0-5%';
    if (score < 40) return '5-15%';
    if (score < 50) return '15-35%';
    if (score < 65) return '35-60%';
    if (score < 80) return '60-85%';
    return '85%+';
  };

  const hasScores = Object.keys(displayResults.scores).length > 0 && Object.values(displayResults.scores).some(s => s > 0);
  const risk = getRiskLevel(displayResults.aciScore);
  const { trends, opEds, eliteSignals, bluesky, marketSignals } = displayResults.socialSignals || {};
  const hasSocialSignals = trends || opEds || eliteSignals || bluesky || marketSignals;

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse text-slate-600">Loading results...</div>
      </div>
    );
  }

  // If fetch failed and no results, show error state
  if (fetchError && !results) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-600 mb-4">Unable to load results. Please try again later.</div>
          <a href="https://app.polybius.world" className="text-blue-600 underline">Run live analysis</a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-slate-50 min-h-screen">
      <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">Polybius</h1>
            <p className="text-slate-600 text-lg">Authoritarian Consolidation Index</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <div>Last updated:</div>
            <div className="font-medium">
              {new Date(displayResults.generatedAt).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Overall ACI Score</h2>
              <p className="text-slate-600">
                {displayResults.country} | Estimated consolidation probability: <span className="font-semibold">{getProbability(displayResults.aciScore)}</span>
              </p>
            </div>
            <span className="text-6xl font-bold text-slate-800">{displayResults.aciScore.toFixed(1)}</span>
          </div>

          <div className="w-full bg-slate-200 rounded-full h-12 mb-4 overflow-hidden">
            <div
              className={`h-full ${risk.color} rounded-full flex items-center justify-end pr-4 transition-all duration-700`}
              style={{ width: `${Math.max(Math.min(displayResults.aciScore, 100), 3)}%` }}
            >
              {displayResults.aciScore > 15 && <span className="text-white font-bold text-lg">{displayResults.aciScore.toFixed(1)}</span>}
            </div>
          </div>

          <div className={`${risk.bgLight} rounded-xl p-5 text-center border-2 ${risk.color.replace('bg-', 'border-')}`}>
            <AlertCircle className={`inline-block w-8 h-8 ${risk.textColor} mb-2`} />
            <div className={`font-bold text-2xl ${risk.textColor}`}>{displayResults.riskLevel}</div>
          </div>
        </div>

        {/* Summary */}
        {displayResults.summary && (
          <div className="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Analysis Summary</h2>
            <p className="text-slate-700 leading-relaxed whitespace-pre-line">{displayResults.summary}</p>
          </div>
        )}

        {/* Vital Signs Dashboard */}
        {hasScores && (
          <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-5">
              <Activity className="w-6 h-6 text-green-400" />
              <h3 className="text-xl font-bold text-white">Democratic Vital Signs</h3>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                <span className={`inline-block w-3 h-3 rounded-full ${displayResults.aciScore < 40 ? 'bg-green-500' : displayResults.aciScore < 60 ? 'bg-yellow-500' : 'bg-red-500'} ${displayResults.aciScore >= 50 ? 'animate-pulse' : ''}`} />
                <span className="text-slate-400 text-sm font-mono">
                  {displayResults.aciScore < 40 ? 'STABLE' : displayResults.aciScore < 60 ? 'ELEVATED' : 'CRITICAL'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {factors.map(factor => {
                const score = displayResults.scores[factor.id] || 0;
                const factorData = displayResults.factorResults?.[factor.id];
                const trend = factorData?.trend;
                const isCritical = score >= factor.dangerThreshold;
                const isWarning = score >= factor.dangerThreshold - 15 && score < factor.dangerThreshold;

                return (
                  <div
                    key={factor.id}
                    className={`relative rounded-lg p-3 ${
                      isCritical ? 'bg-red-950 border border-red-500' :
                      isWarning ? 'bg-yellow-950 border border-yellow-600' :
                      'bg-slate-800 border border-slate-600'
                    }`}
                  >
                    {isCritical && <div className="absolute inset-0 rounded-lg bg-red-500 opacity-20 animate-pulse" />}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-400 truncate pr-1">
                          {factor.name.replace('/', '/ ').split(' ').slice(0, 2).join(' ')}
                        </span>
                        {isCritical && <span className="text-red-400 text-xs">!</span>}
                      </div>
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-700" />
                          <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round"
                            strokeDasharray={`${score * 1.76} 176`}
                            className={`${isCritical ? 'text-red-500' : isWarning ? 'text-yellow-500' : score < 30 ? 'text-green-500' : 'text-blue-500'} transition-all duration-700`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className={`text-lg font-bold font-mono ${isCritical ? 'text-red-400' : isWarning ? 'text-yellow-400' : 'text-white'}`}>{score}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-1 h-4">
                        {trend && (
                          <>
                            {trend.toLowerCase().includes('improv') && <><TrendingDown className="w-3 h-3 text-green-400" /><span className="text-xs text-green-400">improving</span></>}
                            {(trend.toLowerCase().includes('deter') || trend.toLowerCase().includes('worsen')) && <><TrendingUp className="w-3 h-3 text-red-400" /><span className="text-xs text-red-400">worsening</span></>}
                            {trend.toLowerCase().includes('stable') && <><Minus className="w-3 h-3 text-slate-400" /><span className="text-xs text-slate-400">stable</span></>}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Social Signals Dashboard */}
        {hasSocialSignals && (
          <div className="bg-purple-50 rounded-xl p-6 mb-8 border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="text-xl font-bold text-slate-800">Social Signals</h3>
            </div>

            <div className="space-y-4">
              {/* Trends */}
              {trends && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Search className="w-4 h-4 text-purple-600" />
                      Google Trends: {trends.country}
                    </h4>
                    <span className={`px-2 py-1 rounded font-bold text-sm ${
                      trends.overallTemperature < 40 ? 'bg-green-100 text-green-700' :
                      trends.overallTemperature < 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {trends.overallTemperature}/100
                    </span>
                  </div>
                  <div className="space-y-1">
                    {trends.interpretation.map((line, i) => (
                      <p key={i} className="text-sm text-slate-600">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Op-Eds / Hegemonic Analysis */}
              {opEds && (
                <div className="bg-white rounded-lg p-4 border border-rose-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Users className="w-4 h-4 text-rose-600" />
                      Hegemonic Analysis
                    </h4>
                    <span className="text-sm text-slate-500">{opEds.totalArticles} articles</span>
                  </div>
                  {opEds.nixonMoments && opEds.nixonMoments.length > 0 && (
                    <div className="mb-3 p-3 bg-amber-50 rounded border border-amber-200">
                      <div className="text-sm font-medium text-amber-800 mb-2">Nixon-to-China Moments (High Signal)</div>
                      {opEds.nixonMoments.slice(0, 3).map((article, i) => (
                        <div key={i} className="text-sm text-amber-700 mb-1">
                          <span className="font-medium">{article.source.name}:</span> {article.title}
                          {article.nixonType && <span className="text-xs ml-2 text-amber-600">({article.nixonType})</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1">
                    {opEds.interpretation.map((line, i) => (
                      <p key={i} className="text-sm text-slate-600">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Elite Signals */}
              {eliteSignals && (
                <div className="bg-white rounded-lg p-4 border border-amber-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-amber-600" />
                      Elite Signals (GOP Coordination)
                    </h4>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        eliteSignals.defections.coordinationScore > 70 ? 'bg-red-100 text-red-700' :
                        eliteSignals.defections.coordinationScore > 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Coordination: {eliteSignals.defections.coordinationScore}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        eliteSignals.propaganda.effectivenessScore > 70 ? 'bg-red-100 text-red-700' :
                        eliteSignals.propaganda.effectivenessScore > 40 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        Propaganda: {eliteSignals.propaganda.effectivenessScore}
                      </span>
                    </div>
                  </div>
                  {eliteSignals.defections.articles.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-slate-600 mb-2">Notable Defections:</div>
                      {eliteSignals.defections.articles.slice(0, 3).map((article, i) => (
                        <div key={i} className="text-sm text-slate-700 mb-1 p-2 bg-slate-50 rounded">
                          <span className="font-medium">{article.figure}</span> ({article.figureRole}): {article.description}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="space-y-1">
                    {eliteSignals.interpretation.map((line, i) => (
                      <p key={i} className="text-sm text-slate-600">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Bluesky */}
              {bluesky && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Radio className="w-4 h-4 text-blue-600" />
                      Bluesky Discourse
                    </h4>
                    <span className={`px-2 py-1 rounded font-bold text-sm ${
                      bluesky.temperature < 40 ? 'bg-green-100 text-green-700' :
                      bluesky.temperature < 70 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {bluesky.temperature}/100
                    </span>
                  </div>
                  <div className="flex gap-4 mb-3 text-sm">
                    <span className="text-red-600">Negative: {bluesky.sentimentBreakdown.negative}</span>
                    <span className="text-gray-600">Neutral: {bluesky.sentimentBreakdown.neutral}</span>
                    <span className="text-green-600">Positive: {bluesky.sentimentBreakdown.positive}</span>
                  </div>
                  <div className="space-y-1">
                    {bluesky.interpretation.map((line, i) => (
                      <p key={i} className="text-sm text-slate-600">{line}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Market Signals */}
              {marketSignals && (
                <div className="bg-white rounded-lg p-4 border border-emerald-200">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="font-bold text-slate-800">Market Signals</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      marketSignals.overallAssessment.consolidationImplication === 'markets_constraining' ? 'bg-green-100 text-green-700' :
                      marketSignals.overallAssessment.consolidationImplication === 'markets_enabling' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {marketSignals.overallAssessment.marketConstraintLevel}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="text-slate-500">S&P 500</div>
                      <div className="font-bold">{marketSignals.marketConditions.sp500.level.toLocaleString()}</div>
                      <div className={marketSignals.marketConditions.sp500.weekChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {marketSignals.marketConditions.sp500.weekChange >= 0 ? '+' : ''}{marketSignals.marketConditions.sp500.weekChange.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="text-slate-500">10Y Treasury</div>
                      <div className="font-bold">{marketSignals.marketConditions.treasury10y.yield.toFixed(2)}%</div>
                      <div className="text-slate-600">{marketSignals.marketConditions.treasury10y.trend}</div>
                    </div>
                    <div className="p-2 bg-slate-50 rounded">
                      <div className="text-slate-500">VIX</div>
                      <div className="font-bold">{marketSignals.marketConditions.vix.level}</div>
                      <div className="text-slate-600">{marketSignals.marketConditions.vix.interpretation}</div>
                    </div>
                  </div>
                  {marketSignals.tacoPatternAnalysis && (
                    <div className={`p-3 rounded mb-3 ${marketSignals.tacoPatternAnalysis.patternHolding ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                      <div className="text-sm font-medium mb-1">
                        TACO Pattern (Tariff Announced, Chaos Observed): {marketSignals.tacoPatternAnalysis.instancesLast90Days} instances
                      </div>
                      <div className="text-sm text-slate-600">{marketSignals.tacoPatternAnalysis.summary}</div>
                    </div>
                  )}
                  <p className="text-sm text-slate-700">{marketSignals.overallAssessment.summary}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Theoretical Models Used */}
        {displayResults.modelsUsed && displayResults.modelsUsed.length > 0 && (
          <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-blue-700" />
              <h2 className="text-xl font-bold text-slate-800">Theoretical Models Applied</h2>
              <span className="text-sm text-slate-500">({displayResults.modelsUsed.length} models)</span>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              This analysis synthesizes multiple theoretical frameworks from political science to assess authoritarian consolidation risk.
              Each model weights the factors differently based on its theoretical assumptions.
            </p>
            <div className="space-y-3">
              {displayResults.modelsUsed.map(model => (
                <div key={model.id} className="bg-white rounded-lg border border-blue-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedModels(prev => ({ ...prev, [model.id]: !prev[model.id] }))}
                    className="w-full p-4 text-left flex items-center justify-between hover:bg-blue-50 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{model.name}</span>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded">{model.cluster}</span>
                      </div>
                      <p className="text-sm text-slate-500">{model.author}</p>
                      <p className="text-sm text-slate-600 mt-1">{model.shortDesc}</p>
                    </div>
                    {expandedModels[model.id] ? (
                      <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {expandedModels[model.id] && (
                    <div className="px-4 pb-4 border-t border-blue-100">
                      <div className="mt-3 text-sm text-slate-700 whitespace-pre-line">
                        {model.fullDesc}
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-500 mb-2">Key Works:</div>
                        <div className="text-sm text-slate-600 italic">{model.keyWorks}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="text-xs font-medium text-slate-500 mb-2">Factor Weights:</div>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(model.weights)
                            .filter(([, w]) => w > 0)
                            .sort(([, a], [, b]) => b - a)
                            .map(([factorId, weight]) => {
                              const factor = factors.find(f => f.id === factorId);
                              return (
                                <span key={factorId} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                                  {factor?.name.split('/')[0] || factorId}: {(weight * 100).toFixed(0)}%
                                </span>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Factor Breakdown with Evidence */}
        {Object.keys(displayResults.factorResults).length > 0 && (
          <div className="bg-white rounded-xl p-6 mb-8 border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Factor Analysis</h2>
            <div className="space-y-4">
              {factors.map(factor => {
                const data = displayResults.factorResults[factor.id];
                if (!data) return null;
                return (
                  <div key={factor.id} className="border-b border-slate-100 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-700">{factor.name}</span>
                        {data.trend && (
                          <>
                            {data.trend.toLowerCase().includes('improv') && <TrendingDown className="w-4 h-4 text-green-600" />}
                            {(data.trend.toLowerCase().includes('deter') || data.trend.toLowerCase().includes('worsen')) && <TrendingUp className="w-4 h-4 text-red-600" />}
                            {data.trend.toLowerCase().includes('stable') && <Minus className="w-4 h-4 text-slate-400" />}
                          </>
                        )}
                      </div>
                      <span className={`font-bold ${data.score >= 60 ? 'text-red-600' : data.score >= 40 ? 'text-amber-600' : 'text-green-600'}`}>
                        {data.score}/100
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                      <div className={`h-full rounded-full ${data.score >= 60 ? 'bg-red-500' : data.score >= 40 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${data.score}%` }} />
                    </div>
                    {data.evidence && <p className="text-sm text-slate-600">{data.evidence}</p>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Historical Comparison */}
        {displayResults.historicalComparison && (
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 mb-8 border border-amber-200">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-amber-700" />
              <h2 className="text-xl font-bold text-slate-800">Historical Comparison</h2>
            </div>
            <details className="mb-4 bg-white/60 rounded-lg border border-amber-100">
              <summary className="p-3 text-sm font-medium text-slate-700 cursor-pointer hover:text-slate-900">How does this comparison work?</summary>
              <div className="px-3 pb-3 text-sm text-slate-600 space-y-2">
                <p><strong>Data Sources:</strong> V-Dem, Polity Project, and country-specific historiography.</p>
                <p><strong>Cases:</strong> 25+ regime transitions including Weimar Germany, Fascist Italy, Chile, Hungary, Turkey, Venezuela, plus resistance cases.</p>
              </div>
            </details>
            <div className={`p-4 rounded-lg mb-4 ${displayResults.historicalComparison.averageScore >= 60 ? 'bg-red-100 border border-red-300' : displayResults.historicalComparison.averageScore >= 40 ? 'bg-amber-100 border border-amber-300' : 'bg-green-100 border border-green-300'}`}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Comparative Prediction</span>
                <span className={`text-2xl font-bold ${displayResults.historicalComparison.averageScore >= 60 ? 'text-red-700' : displayResults.historicalComparison.averageScore >= 40 ? 'text-amber-700' : 'text-green-700'}`}>
                  {displayResults.historicalComparison.averageScore}/100
                </span>
              </div>
            </div>
            <div className="mb-4">
              <h5 className="text-sm font-semibold text-slate-700 mb-2">Most Similar Historical Cases</h5>
              <div className="space-y-2">
                {displayResults.historicalComparison.mostSimilarCases.slice(0, 3).map((c, i) => (
                  <div key={i} className={`p-3 rounded-lg flex items-center justify-between ${c.outcome === 'consolidated' ? 'bg-red-50 border border-red-200' : c.outcome === 'resisted' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div>
                      <span className="font-medium text-slate-800">{c.country}</span>
                      <span className="text-slate-500 text-sm ml-2">{c.period}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${c.outcome === 'consolidated' ? 'bg-red-200 text-red-800' : c.outcome === 'resisted' ? 'bg-green-200 text-green-800' : 'bg-blue-200 text-blue-800'}`}>
                      {c.outcome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {displayResults.historicalComparison.interpretation.map((line, i) => (
                <p key={i} className={`text-sm ${line.toLowerCase().includes('warning') ? 'text-red-700 font-medium' : line.toLowerCase().includes('hopeful') ? 'text-green-700 font-medium' : 'text-slate-700'}`}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* CTA to Live Tool */}
        <div className="text-center mb-8">
          <div className="flex flex-wrap justify-center gap-4 mb-3">
            <a href="https://app.polybius.world" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Run Live Analysis
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="/methodology" className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
              <BookOpen className="w-4 h-4" />
              Methodology & Source Code
            </a>
          </div>
          <p className="text-sm text-slate-500">Use your own API key to run real-time analysis with the latest data</p>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-slate-500 border-t border-slate-200 pt-6">
          <p className="mb-2">Built with theoretical frameworks from Linz, Levitsky & Ziblatt, Gramsci, Paxton, Svolik, Berman, Riley, and others.</p>
          <p>Historical data from <a href="https://v-dem.net/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">V-Dem</a> and the <a href="https://www.systemicpeace.org/polityproject.html" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Polity Project</a>. Analysis powered by Claude AI.</p>
        </footer>
      </div>
    </div>
  );
}
