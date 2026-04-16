import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Loader2,
  Sparkles,
  CheckCircle2,
  Zap,
  Globe,
  ArrowRight,
  ChevronRight,
  RefreshCw,
  Eye,
  Target,
  BarChart3,
  Clock,
  Shield,
} from 'lucide-react';
import PlatformPanel from '../components/playbook/PlatformPanel';

interface PlaybookEntry {
  id: string;
  platform: string;
  strategy: {
    thisWeek: string[];
    whoToTarget: string;
    whatWorks: string[];
    thirtyDayGoal: string;
  } | null;
  content: { title: string; body: string }[];
  generated_at: string;
}

interface BrandData {
  selected_name: string;
  offer_description: string;
  target_audience: string;
}

const PLATFORMS = [
  {
    key: 'instagram',
    label: 'Instagram',
    tagline: 'Visual storytelling & reels',
    taglineWithBrand: (name: string) => `Grow ${name} with reels & stories`,
    icon: '\uD83D\uDCF8',
    color: '#E1306C',
    bgGradient: 'linear-gradient(135deg, rgba(225,48,108,0.12) 0%, rgba(252,175,69,0.08) 100%)',
    borderHover: 'rgba(225,48,108,0.35)',
  },
  {
    key: 'meta_ads',
    label: 'Meta Ads',
    tagline: 'Paid reach & conversions',
    taglineWithBrand: (name: string) => `Run targeted ads for ${name}`,
    icon: '\uD83C\uDFAF',
    color: '#1877F2',
    bgGradient: 'linear-gradient(135deg, rgba(24,119,242,0.12) 0%, rgba(66,183,245,0.06) 100%)',
    borderHover: 'rgba(24,119,242,0.35)',
  },
  {
    key: 'tiktok',
    label: 'TikTok',
    tagline: 'Short-form viral content',
    taglineWithBrand: (name: string) => `Get ${name} trending on TikTok`,
    icon: '\uD83C\uDFAC',
    color: '#00F2EA',
    bgGradient: 'linear-gradient(135deg, rgba(0,242,234,0.10) 0%, rgba(255,0,80,0.06) 100%)',
    borderHover: 'rgba(0,242,234,0.35)',
  },
  {
    key: 'mass_text',
    label: 'Mass Text',
    tagline: 'Direct SMS campaigns',
    taglineWithBrand: (name: string) => `Text campaigns for ${name}`,
    icon: '\uD83D\uDCF1',
    color: '#06D6A0',
    bgGradient: 'linear-gradient(135deg, rgba(6,214,160,0.12) 0%, rgba(6,214,160,0.04) 100%)',
    borderHover: 'rgba(6,214,160,0.35)',
  },
  {
    key: 'email',
    label: 'Email',
    tagline: 'Nurture & convert leads',
    taglineWithBrand: (name: string) => `Build ${name}'s email list`,
    icon: '\u2709\uFE0F',
    color: '#FF6B35',
    bgGradient: 'linear-gradient(135deg, rgba(255,107,53,0.12) 0%, rgba(255,190,11,0.06) 100%)',
    borderHover: 'rgba(255,107,53,0.35)',
  },
];

export default function MarketingAssets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');

  const [loading, setLoading] = useState(true);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [entries, setEntries] = useState<Record<string, PlaybookEntry>>({});
  const [error, setError] = useState<string | null>(null);

  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);
  const [generatingMore, setGeneratingMore] = useState(false);

  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingAllIndex, setGeneratingAllIndex] = useState(0);
  const [generatingAllComplete, setGeneratingAllComplete] = useState(false);

  useEffect(() => {
    loadData();
  }, [ideaKey]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate('/auth'); return; }

      let brandQuery = supabase
        .from('brand_identity')
        .select('selected_name, offer_description, target_audience')
        .eq('user_id', user.id);

      if (ideaKey) {
        brandQuery = brandQuery.eq('idea_key', ideaKey);
      } else {
        brandQuery = brandQuery.order('created_at', { ascending: false }).limit(1);
      }

      const { data: brand } = await brandQuery.maybeSingle();
      if (brand) setBrandData(brand);

      const { data: playbook } = await supabase
        .from('marketing_playbook')
        .select('*')
        .eq('user_id', user.id);

      if (playbook) {
        const map: Record<string, PlaybookEntry> = {};
        playbook.forEach((entry: PlaybookEntry) => { map[entry.platform] = entry; });
        setEntries(map);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAuthHeaders = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'Content-Type': 'application/json',
    };
  };

  const generatePlatform = useCallback(async (platformKey: string) => {
    setGenerating(platformKey);
    try {
      const headers = await getAuthHeaders();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-playbook`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          platform: platformKey,
          businessName: brandData?.selected_name || '',
          offer: brandData?.offer_description || '',
          targetCustomer: brandData?.target_audience || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setEntries(prev => ({
        ...prev,
        [platformKey]: {
          ...(prev[platformKey] || {}),
          id: prev[platformKey]?.id || '',
          platform: platformKey,
          strategy: data.strategy,
          content: data.content,
          generated_at: new Date().toISOString(),
        },
      }));
    } catch (err: any) {
      console.error(`Failed to generate ${platformKey}:`, err);
      alert(`Failed to generate: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  }, [brandData]);

  const generateAllPlatforms = async () => {
    setGeneratingAll(true);
    setGeneratingAllComplete(false);

    for (let i = 0; i < PLATFORMS.length; i++) {
      setGeneratingAllIndex(i);
      try {
        const headers = await getAuthHeaders();
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-playbook`;
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            platform: PLATFORMS[i].key,
            businessName: brandData?.selected_name || '',
            offer: brandData?.offer_description || '',
            targetCustomer: brandData?.target_audience || '',
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setEntries(prev => ({
            ...prev,
            [PLATFORMS[i].key]: {
              ...(prev[PLATFORMS[i].key] || {}),
              id: prev[PLATFORMS[i].key]?.id || '',
              platform: PLATFORMS[i].key,
              strategy: data.strategy,
              content: data.content,
              generated_at: new Date().toISOString(),
            },
          }));
        }
      } catch (err) {
        console.error(`Failed to generate ${PLATFORMS[i].key}:`, err);
      }
    }

    setGeneratingAll(false);
    setGeneratingAllComplete(true);
    setTimeout(() => setGeneratingAllComplete(false), 4000);
  };

  const generateMoreContent = async () => {
    if (!selectedPlatform) return;
    setGeneratingMore(true);
    try {
      const headers = await getAuthHeaders();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-playbook`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'more_content',
          platform: selectedPlatform,
          businessName: brandData?.selected_name || '',
          offer: brandData?.offer_description || '',
          targetCustomer: brandData?.target_audience || '',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Generation failed');

      setEntries(prev => {
        const existing = prev[selectedPlatform];
        if (!existing) return prev;
        return {
          ...prev,
          [selectedPlatform]: {
            ...existing,
            content: [...existing.content, ...data.content],
          },
        };
      });
    } catch (err: any) {
      console.error('Failed to generate more:', err);
    } finally {
      setGeneratingMore(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const readyCount = PLATFORMS.filter(p => !!entries[p.key]?.strategy).length;
  const selectedEntry = selectedPlatform ? entries[selectedPlatform] : null;
  const selectedPlatformData = PLATFORMS.find(p => p.key === selectedPlatform);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-[#2979FF]/10 flex items-center justify-center">
              <Loader2 className="text-[#2979FF] animate-spin" size={32} />
            </div>
            <div className="absolute -inset-3 rounded-3xl bg-[#2979FF]/5 animate-pulse" />
          </div>
          <p className="text-gray-500 text-sm">Loading your playbook...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-red-400 text-xl mb-4">Failed to load data</div>
          <div className="text-gray-400 mb-6">{error}</div>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060d19]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 pb-20">

        <nav className="flex items-center gap-1.5 text-sm mb-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors">
            <Home size={14} />
            Dashboard
          </button>
          <ChevronRight size={13} className="text-gray-700" />
          <span className="text-gray-300 font-medium">Marketing</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2979FF]/20 to-[#2979FF]/5 flex items-center justify-center">
                  <Target className="text-[#2979FF]" size={20} />
                </div>
                <div>
                  {brandData?.selected_name && (
                    <p className="text-[#2979FF] text-xs font-semibold tracking-wider uppercase mb-0.5">
                      {brandData.selected_name}
                    </p>
                  )}
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Marketing Playbook
                  </h1>
                </div>
              </div>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-lg pl-[52px]">
                {brandData?.selected_name
                  ? `Ready-to-post content and channel strategies tailored for ${brandData.selected_name}.`
                  : 'AI-powered strategies and ready-to-post content for every channel. Pick one or generate them all.'}
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <BarChart3 size={14} className="text-gray-500" />
                <div className="flex gap-0.5">
                  {PLATFORMS.map((p) => (
                    <div
                      key={p.key}
                      className="w-2 h-5 rounded-sm transition-all duration-500"
                      style={{
                        backgroundColor: entries[p.key]?.strategy ? p.color : 'rgba(255,255,255,0.06)',
                        opacity: entries[p.key]?.strategy ? 0.8 : 1,
                      }}
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-xs font-medium ml-1">{readyCount}/{PLATFORMS.length}</span>
              </div>

              <AnimatePresence mode="wait">
                {generatingAllComplete ? (
                  <motion.div
                    key="done"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm font-semibold"
                  >
                    <CheckCircle2 size={15} />
                    All done!
                  </motion.div>
                ) : generatingAll ? (
                  <motion.div
                    key="progress"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-2.5 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-sm"
                  >
                    <Loader2 size={14} className="text-[#2979FF] animate-spin" />
                    <span className="text-gray-300 font-medium">{PLATFORMS[generatingAllIndex]?.label}</span>
                    <span className="text-gray-600 text-xs">{generatingAllIndex + 1}/{PLATFORMS.length}</span>
                  </motion.div>
                ) : (
                  <motion.button
                    key="cta"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={generateAllPlatforms}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative flex items-center gap-2 px-5 py-2.5 bg-[#2979FF] text-white rounded-xl text-sm font-semibold shadow-lg shadow-[#2979FF]/20 hover:shadow-[#2979FF]/30 transition-shadow overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    <Zap size={14} />
                    Generate All
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {PLATFORMS.map((platform, i) => {
            const entry = entries[platform.key];
            const isReady = !!entry?.strategy;
            const isGenerating = generating === platform.key;
            const isCurrentlyGeneratingAll = generatingAll && generatingAllIndex === i;
            const busy = isGenerating || isCurrentlyGeneratingAll;
            const pastInGenerateAll = generatingAll && i < generatingAllIndex;

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <motion.div
                  whileHover={{ y: -2, transition: { duration: 0.2 } }}
                  className="group relative rounded-2xl border overflow-hidden transition-all duration-300 cursor-pointer h-full"
                  style={{
                    background: isReady ? platform.bgGradient : 'rgba(255,255,255,0.015)',
                    borderColor: isReady ? `${platform.color}20` : 'rgba(255,255,255,0.06)',
                  }}
                  onClick={() => {
                    if (isReady) setSelectedPlatform(platform.key);
                    else if (!busy && !generatingAll) generatePlatform(platform.key);
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = platform.borderHover;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = isReady ? `${platform.color}20` : 'rgba(255,255,255,0.06)';
                  }}
                >
                  {busy && (
                    <motion.div
                      className="absolute bottom-0 left-0 h-[2px]"
                      style={{ backgroundColor: platform.color }}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 12, ease: 'linear' }}
                    />
                  )}

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${platform.color}12` }}
                      >
                        {platform.icon}
                      </div>

                      {isReady && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400 }}
                        >
                          <CheckCircle2 size={18} style={{ color: platform.color }} />
                        </motion.div>
                      )}

                      {busy && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-semibold" style={{ backgroundColor: `${platform.color}15`, color: platform.color }}>
                          <Loader2 size={10} className="animate-spin" />
                          Building
                        </div>
                      )}
                    </div>

                    <h3 className="text-white font-bold text-base mb-1">{platform.label}</h3>
                    <p className="text-gray-500 text-[13px] leading-relaxed mb-5">
                      {brandData?.selected_name ? platform.taglineWithBrand(brandData.selected_name) : platform.tagline}
                    </p>

                    {isReady ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedPlatform(platform.key); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                          style={{ backgroundColor: `${platform.color}15`, color: platform.color }}
                        >
                          <Eye size={14} />
                          View Strategy
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); generatePlatform(platform.key); }}
                          disabled={isGenerating || generatingAll}
                          className="p-2.5 rounded-xl text-gray-500 hover:text-white transition-all disabled:opacity-30"
                          style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                          title="Regenerate"
                        >
                          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); if (!busy && !generatingAll) generatePlatform(platform.key); }}
                        disabled={busy || generatingAll}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                        style={{
                          backgroundColor: busy ? `${platform.color}10` : `${platform.color}12`,
                          color: platform.color,
                        }}
                      >
                        {busy ? (
                          <><Loader2 size={14} className="animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles size={14} /> Generate Strategy</>
                        )}
                      </button>
                    )}

                    {entry?.generated_at && (
                      <div className="flex items-center gap-1 mt-3 text-gray-600 text-[11px]">
                        <Clock size={10} />
                        Updated {formatDate(entry.generated_at)}
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <div className="relative overflow-hidden flex flex-col sm:flex-row sm:items-center gap-5 px-6 py-6 rounded-2xl border border-[#06D6A0]/10 bg-gradient-to-r from-[#06D6A0]/[0.06] to-transparent hover:border-[#06D6A0]/20 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#06D6A0]/[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="w-12 h-12 bg-[#06D6A0]/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Shield className="text-[#06D6A0]" size={24} />
            </div>
            <div className="flex-1 min-w-0 relative">
              <h3 className="text-white font-bold text-base mb-1">
                {brandData?.selected_name ? `Make ${brandData.selected_name} Legal` : 'Make Your Business Legal'}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                {brandData?.selected_name
                  ? `Form your LLC, get an EIN, and set up ${brandData.selected_name} the right way — step by step.`
                  : 'Form your LLC, get an EIN, and legally set up your business — without the headaches.'}
              </p>
            </div>
            <button
              onClick={() => navigate('/legal')}
              className="relative flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-[#060d19] rounded-xl text-sm font-semibold hover:bg-[#05c490] transition-all shadow-lg shadow-[#06D6A0]/15 whitespace-nowrap group/btn"
            >
              Start Legal Setup
              <ArrowRight size={15} className="group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </motion.div>
      </div>

      {selectedPlatformData && (
        <PlatformPanel
          isOpen={!!selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
          platformKey={selectedPlatformData.key}
          platformLabel={selectedPlatformData.label}
          platformEmoji={selectedPlatformData.icon}
          strategy={selectedEntry?.strategy || null}
          content={selectedEntry?.content || []}
          onGenerateMore={generateMoreContent}
          generatingMore={generatingMore}
        />
      )}
    </div>
  );
}
