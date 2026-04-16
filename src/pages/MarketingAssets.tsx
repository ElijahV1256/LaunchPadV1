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
  BarChart3,
  TrendingUp,
  RefreshCw,
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
  { key: 'instagram', label: 'Instagram', emoji: '\uD83D\uDCF1', color: '#E1306C', colorLight: 'rgba(225, 48, 108, 0.12)' },
  { key: 'meta_ads', label: 'Meta Ads', emoji: '\uD83D\uDCD8', color: '#1877F2', colorLight: 'rgba(24, 119, 242, 0.12)' },
  { key: 'tiktok', label: 'TikTok', emoji: '\uD83C\uDFB5', color: '#00F2EA', colorLight: 'rgba(0, 242, 234, 0.10)' },
  { key: 'mass_text', label: 'Mass Text', emoji: '\uD83D\uDCAC', color: '#06D6A0', colorLight: 'rgba(6, 214, 160, 0.12)' },
  { key: 'email', label: 'Email', emoji: '\uD83D\uDCE7', color: '#FF6B35', colorLight: 'rgba(255, 107, 53, 0.12)' },
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
      if (!user) {
        navigate('/auth');
        return;
      }

      if (ideaKey) {
        const { data: brand } = await supabase
          .from('brand_identity')
          .select('selected_name, offer_description, target_audience')
          .eq('user_id', user.id)
          .eq('idea_key', ideaKey)
          .maybeSingle();

        if (brand) setBrandData(brand);
      }

      const { data: playbook } = await supabase
        .from('marketing_playbook')
        .select('*')
        .eq('user_id', user.id);

      if (playbook) {
        const map: Record<string, PlaybookEntry> = {};
        playbook.forEach((entry: PlaybookEntry) => {
          map[entry.platform] = entry;
        });
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
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="text-red-400 text-xl mb-4">Failed to load data</div>
          <div className="text-gray-400 mb-6">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors text-sm group"
        >
          <Home size={15} />
          <span>Dashboard</span>
          <ChevronRight size={14} className="text-gray-600" />
          <span className="text-gray-400">Marketing Playbook</span>
        </button>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
                Your Marketing Playbook
              </h1>
              <p className="text-gray-400 text-lg max-w-xl leading-relaxed">
                Pick a platform, get your strategy and content. Come back anytime for fresh ideas.
              </p>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex items-center gap-3 flex-shrink-0"
          >
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl">
              <BarChart3 size={15} className="text-gray-500" />
              <span className="text-sm text-gray-400">
                <span className="text-white font-semibold">{readyCount}</span>/{PLATFORMS.length} ready
              </span>
            </div>

            <AnimatePresence mode="wait">
              {generatingAllComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 rounded-xl font-semibold text-sm"
                >
                  <CheckCircle2 size={16} />
                  All platforms ready
                </motion.div>
              ) : generatingAll ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2.5 px-5 py-2.5 bg-[#2979FF]/10 border border-[#2979FF]/25 text-[#2979FF] rounded-xl font-semibold text-sm"
                >
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating {PLATFORMS[generatingAllIndex]?.label}...</span>
                  <span className="text-[#2979FF]/60 text-xs">({generatingAllIndex + 1}/{PLATFORMS.length})</span>
                </motion.div>
              ) : (
                <motion.button
                  key="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={generateAllPlatforms}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#2979FF] to-[#2979FF]/80 text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#2979FF]/20 hover:shadow-[#2979FF]/30 transition-shadow"
                >
                  <Zap size={15} />
                  Generate All Platforms
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {PLATFORMS.map((platform, i) => {
            const entry = entries[platform.key];
            const isReady = !!entry?.strategy;
            const isGenerating = generating === platform.key;
            const isCurrentlyGeneratingAll = generatingAll && generatingAllIndex === i;

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  isReady
                    ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                    : 'bg-white/[0.03] hover:bg-white/[0.05]'
                }`}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${platform.colorLight}, transparent 70%)`,
                  }}
                />

                <div className={`relative border rounded-2xl p-5 transition-colors duration-300 ${
                  isReady
                    ? 'border-white/[0.08] group-hover:border-white/[0.15]'
                    : 'border-white/[0.06] group-hover:border-white/[0.12]'
                }`}>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110"
                        style={{ backgroundColor: platform.colorLight }}
                      >
                        {platform.emoji}
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-[17px] leading-tight">{platform.label}</h3>
                        {entry?.generated_at && (
                          <p className="text-gray-500 text-xs mt-1">
                            Updated {formatDate(entry.generated_at)}
                          </p>
                        )}
                      </div>
                    </div>
                    {isReady ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[11px] font-semibold tracking-wide uppercase">
                        <CheckCircle2 size={11} />
                        Ready
                      </span>
                    ) : isGenerating || isCurrentlyGeneratingAll ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 bg-[#2979FF]/10 text-[#2979FF] rounded-lg text-[11px] font-semibold tracking-wide uppercase">
                        <Loader2 size={11} className="animate-spin" />
                        Building
                      </span>
                    ) : null}
                  </div>

                  {isReady ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedPlatform(platform.key)}
                        className="flex-1 py-2.5 bg-white/[0.08] border border-white/[0.1] text-white rounded-xl font-semibold text-sm hover:bg-white/[0.14] transition-all flex items-center justify-center gap-2"
                      >
                        <TrendingUp size={14} />
                        View Strategy
                      </button>
                      <button
                        onClick={() => generatePlatform(platform.key)}
                        disabled={isGenerating || generatingAll}
                        className="px-3.5 py-2.5 bg-white/[0.04] border border-white/[0.08] text-gray-400 rounded-xl text-sm hover:bg-white/[0.08] hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Regenerate"
                      >
                        {isGenerating ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : (
                          <RefreshCw size={15} />
                        )}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => generatePlatform(platform.key)}
                      disabled={isGenerating || generatingAll}
                      className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: platform.colorLight,
                        color: platform.color,
                        borderWidth: 1,
                        borderColor: `${platform.color}25`,
                      }}
                    >
                      {isGenerating || isCurrentlyGeneratingAll ? (
                        <><Loader2 size={14} className="animate-spin" /> Building playbook...</>
                      ) : (
                        <><Sparkles size={14} /> Generate Strategy</>
                      )}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="group relative rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#2979FF]/[0.06] via-transparent to-[#2979FF]/[0.04]" />
          <div className="relative border border-white/[0.08] rounded-2xl p-6 md:p-8 hover:border-[#2979FF]/20 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-14 h-14 bg-[#2979FF]/10 border border-[#2979FF]/20 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <Globe className="text-[#2979FF]" size={26} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white mb-1">Your Website</h3>
                <p className="text-gray-400 text-[15px] leading-relaxed">
                  Book a free 30-minute discovery call. We'll build your custom website and have it live within 24 hours.
                </p>
              </div>
              <button
                onClick={() => navigate(`/website${ideaKey ? `?ideaKey=${ideaKey}` : ''}`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-xl font-semibold text-sm hover:bg-[#2979FF]/90 transition-all shadow-lg shadow-[#2979FF]/15 hover:shadow-[#2979FF]/25 whitespace-nowrap group/btn"
              >
                Book Your Discovery Call
                <ArrowRight size={16} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {selectedPlatformData && (
        <PlatformPanel
          isOpen={!!selectedPlatform}
          onClose={() => setSelectedPlatform(null)}
          platformKey={selectedPlatformData.key}
          platformLabel={selectedPlatformData.label}
          platformEmoji={selectedPlatformData.emoji}
          strategy={selectedEntry?.strategy || null}
          content={selectedEntry?.content || []}
          onGenerateMore={generateMoreContent}
          generatingMore={generatingMore}
        />
      )}
    </div>
  );
}
