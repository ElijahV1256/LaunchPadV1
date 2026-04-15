import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  MapPin,
  Rocket,
  ChevronDown,
  ChevronUp,
  BarChart3,
  Target,
  AlertTriangle,
  DollarSign,
  RefreshCw,
} from 'lucide-react';

interface BusinessEntry {
  name: string;
  trend: string;
  growthRate: string;
  demandLevel: string;
  saturation: string;
  insight: string;
}

interface Recommendation {
  title: string;
  why: string;
  estimatedStartupCost: string;
  difficultyLevel: string;
  firstStep: string;
}

interface MarketReport {
  zipCode: string;
  areaName: string;
  marketSummary: string;
  winningBusinesses: BusinessEntry[];
  decliningBusinesses: BusinessEntry[];
  recommendations: Recommendation[];
  marketStats: {
    populationTrend: string;
    medianIncome: string;
    topIndustry: string;
    marketHealth: string;
  };
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#112240] rounded-2xl border border-slate-700/50 p-6 md:p-8 ${className}`}>
      {children}
    </div>
  );
}

function BusinessCard({ biz, type }: { biz: BusinessEntry; type: 'winning' | 'declining' }) {
  const [expanded, setExpanded] = useState(false);
  const isWinning = type === 'winning';

  return (
    <div
      className={`border rounded-xl p-5 transition-all cursor-pointer hover:shadow-lg ${
        isWinning
          ? 'border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/40'
          : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40'
      }`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {isWinning ? (
              <TrendingUp className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            <h4 className="font-semibold text-white text-lg">{biz.name}</h4>
          </div>
          <div className="flex flex-wrap gap-2 ml-8">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isWinning ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              {biz.growthRate}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-medium">
              Demand: {biz.demandLevel}
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-500/10 text-slate-400 font-medium">
              Saturation: {biz.saturation}
            </span>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 ml-8 pt-4 border-t border-slate-700/50">
          <p className="text-slate-300 leading-relaxed">{biz.insight}</p>
          <p className="text-xs text-slate-500 mt-2">Trend: {biz.trend}</p>
        </div>
      )}
    </div>
  );
}

function RecommendationCard({ rec, index }: { rec: Recommendation; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  return (
    <div
      className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-5 hover:border-blue-500/40 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-8 h-8 rounded-lg bg-[#2979FF] flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            {index + 1}
          </div>
          <div>
            <h4 className="font-semibold text-white text-lg">{rec.title}</h4>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {rec.estimatedStartupCost}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                {rec.difficultyLevel}
              </span>
            </div>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
        ) : (
          <ChevronDown className="w-5 h-5 text-slate-500 flex-shrink-0 mt-1" />
        )}
      </div>

      {expanded && (
        <div className="mt-4 ml-11 pt-4 border-t border-slate-700/50 space-y-3">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Why this works here</p>
            <p className="text-slate-300 leading-relaxed">{rec.why}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Your first step</p>
            <p className="text-blue-300 leading-relaxed font-medium">{rec.firstStep}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LocalResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results as MarketReport | undefined;
  const zip = location.state?.zip;

  useEffect(() => {
    if (!results) {
      navigate('/local');
    }
  }, [results, navigate]);

  if (!results) return null;

  const healthColor = (() => {
    const h = results.marketStats.marketHealth.toLowerCase();
    if (h.includes('strong') || h.includes('growing') || h.includes('healthy')) return 'text-emerald-400';
    if (h.includes('declining') || h.includes('weak')) return 'text-red-400';
    return 'text-amber-400';
  })();

  return (
    <div className="min-h-screen bg-[#0A192F]">
      <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mb-8 mx-auto hover:opacity-80 transition-opacity"
        >
          <Rocket className="text-[#2979FF]" size={36} />
          <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
        </button>

        <button
          onClick={() => navigate('/local')}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          New search
        </button>

        <SectionCard className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">{results.areaName} -- {zip}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Local Market Report
              </h1>
            </div>
            <button
              onClick={() => navigate('/local')}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-blue-400 transition-colors border border-slate-700 rounded-lg px-4 py-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try another ZIP
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed mb-6">{results.marketSummary}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Population Trend', value: results.marketStats.populationTrend, icon: TrendingUp },
              { label: 'Median Income', value: results.marketStats.medianIncome, icon: DollarSign },
              { label: 'Top Industry', value: results.marketStats.topIndustry, icon: BarChart3 },
              { label: 'Market Health', value: results.marketStats.marketHealth, icon: Target, colorClass: healthColor },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0A192F] rounded-xl p-4 border border-slate-700/30">
                <stat.icon className="w-4 h-4 text-slate-500 mb-2" />
                <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
                <p className={`text-sm font-semibold ${stat.colorClass || 'text-white'}`}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Winning Businesses</h2>
              <p className="text-sm text-slate-400">Industries growing and thriving in your area</p>
            </div>
          </div>
          <div className="space-y-3">
            {results.winningBusinesses.map((biz, i) => (
              <BusinessCard key={i} biz={biz} type="winning" />
            ))}
          </div>
        </SectionCard>

        <SectionCard className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Declining Businesses</h2>
              <p className="text-sm text-slate-400">Sectors losing ground -- approach with caution</p>
            </div>
          </div>
          <div className="space-y-3">
            {results.decliningBusinesses.map((biz, i) => (
              <BusinessCard key={i} biz={biz} type="declining" />
            ))}
          </div>
        </SectionCard>

        <SectionCard className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Our Recommendations</h2>
              <p className="text-sm text-slate-400">Based on market gaps and growth signals in {zip}</p>
            </div>
          </div>
          <div className="space-y-3">
            {results.recommendations.map((rec, i) => (
              <RecommendationCard key={i} rec={rec} index={i} />
            ))}
          </div>
        </SectionCard>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 text-center">
          <p className="text-sm text-slate-400 mb-4">
            This report is generated using AI analysis of market trends, demographics, and business data for your area.
            Use it as a starting point for your own research.
          </p>
          <button
            onClick={() => navigate('/ideas')}
            className="bg-[#2979FF] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#2468DB] transition-colors"
          >
            Generate Business Ideas
          </button>
        </div>
      </div>
    </div>
  );
}
