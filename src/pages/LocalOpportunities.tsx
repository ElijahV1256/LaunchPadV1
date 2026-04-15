import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Loader2, TrendingUp, Rocket, Search, BarChart3, ArrowRight } from 'lucide-react';
import { supabase } from '../config/supabase';

export default function LocalOpportunities() {
  const navigate = useNavigate();
  const [isPro, setIsPro] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [zip, setZip] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    checkPlanStatus();
  }, []);

  useEffect(() => {
    if (!analyzing) return;
    const steps = [
      'Analyzing local market data...',
      'Identifying growth trends...',
      'Evaluating business performance...',
      'Generating recommendations...',
    ];
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % steps.length;
      setAnimationStep(i);
    }, 2500);
    return () => clearInterval(interval);
  }, [analyzing]);

  const checkPlanStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/user-plan`;
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const isProUser = data.plan === 'pro' || (data.trial_end && new Date(data.trial_end) > new Date());
        setIsPro(isProUser);
        if (!isProUser) setShowPaywall(true);
      } else {
        setIsPro(false);
        setShowPaywall(true);
      }
    } catch {
      setIsPro(false);
      setShowPaywall(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    const trimmed = zip.trim();
    if (!trimmed || !/^\d{5}$/.test(trimmed)) {
      alert('Please enter a valid 5-digit ZIP code');
      return;
    }

    setAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/local-opportunities`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ zip: trimmed }),
      });

      const data = await response.json();

      if (response.status === 402) {
        setShowPaywall(true);
        setAnalyzing(false);
        return;
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze opportunities');
      }

      navigate('/local/results', { state: { results: data, zip: trimmed } });
    } catch (error: any) {
      alert(error.message || 'Failed to analyze opportunities');
    } finally {
      setAnalyzing(false);
    }
  };

  const loadingMessages = [
    'Analyzing local market data...',
    'Identifying growth trends...',
    'Evaluating business performance...',
    'Generating recommendations...',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
      </div>
    );
  }

  if (showPaywall || !isPro) {
    return (
      <div className="min-h-screen bg-[#0A192F] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#112240] rounded-2xl border border-slate-700/50 shadow-2xl p-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 mb-8 mx-auto hover:opacity-80 transition-opacity"
            >
              <Rocket className="text-[#2979FF]" size={36} />
              <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
            </button>
            <div className="flex items-center justify-center w-16 h-16 bg-blue-500/10 rounded-2xl mx-auto mb-6">
              <BarChart3 className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-center mb-3 text-white">
              Unlock Local Market Reports
            </h1>
            <p className="text-lg text-slate-400 text-center mb-8">
              Get AI-powered insights on business growth trends in your area
            </p>
            <div className="space-y-4 mb-8">
              {[
                { title: 'Winning businesses in your area', desc: 'See which industries are thriving and growing fast' },
                { title: 'Declining businesses to avoid', desc: 'Know which sectors are losing ground locally' },
                { title: 'Personalized recommendations', desc: 'AI-generated action plan tailored to your zip code' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-[#2979FF] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#2468DB] transition-colors"
            >
              Start 7-day trial
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (analyzing) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-4 border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-blue-400 border-t-transparent animate-spin" />
            <div className="absolute inset-3 rounded-full border-4 border-cyan-400/30 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            <BarChart3 className="absolute inset-0 m-auto w-8 h-8 text-blue-400" />
          </div>
          <p className="text-xl font-semibold text-white mb-2">
            {loadingMessages[animationStep]}
          </p>
          <p className="text-slate-400">
            Building your local market report for <span className="text-blue-400 font-medium">{zip}</span>
          </p>
          <div className="flex justify-center gap-2 mt-6">
            {loadingMessages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i <= animationStep ? 'w-8 bg-blue-400' : 'w-4 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A192F]">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mb-12 mx-auto hover:opacity-80 transition-opacity"
        >
          <Rocket className="text-[#2979FF]" size={36} />
          <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
        </button>

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-500/20">
            <BarChart3 className="w-4 h-4" />
            Local Market Intelligence
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            What's winning in<br />your neighborhood?
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mx-auto">
            Enter your zip code to get an AI-powered report on business growth trends,
            top performers, and untapped opportunities near you.
          </p>
        </div>

        <div className="bg-[#112240] rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
          <div className="relative mb-6">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter your ZIP code"
              className="w-full pl-12 pr-4 py-4 bg-[#0A192F] border border-slate-700 rounded-xl text-white placeholder-slate-500 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!zip || zip.length < 5}
            className="w-full bg-[#2979FF] text-white py-4 rounded-xl font-semibold text-lg hover:bg-[#2468DB] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 group"
          >
            <Search className="w-5 h-5" />
            Run Market Report
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[
            { icon: TrendingUp, title: 'Growth Trends', desc: 'Which industries are booming' },
            { icon: BarChart3, title: 'Market Gaps', desc: 'Underserved areas with demand' },
            { icon: Search, title: 'Action Plan', desc: 'What to start and why' },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-[#112240]/60 border border-slate-700/30 rounded-xl p-5 text-center"
            >
              <item.icon className="w-6 h-6 text-blue-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">{item.title}</p>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
