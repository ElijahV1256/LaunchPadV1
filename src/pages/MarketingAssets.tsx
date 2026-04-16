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
  TrendingUp,
  RefreshCw,
  Eye,
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
  { key: 'instagram', label: 'Instagram', icon: '\uD83D\uDCF8', color: '#E1306C', gradient: 'from-rose-500/20 to-orange-500/10' },
  { key: 'meta_ads', label: 'Meta Ads', icon: '\uD83C\uDFAF', color: '#1877F2', gradient: 'from-blue-500/20 to-cyan-500/10' },
  { key: 'tiktok', label: 'TikTok', icon: '\uD83C\uDFAC', color: '#00F2EA', gradient: 'from-teal-400/20 to-cyan-400/10' },
  { key: 'mass_text', label: 'Mass Text', icon: '\uD83D\uDCF1', color: '#06D6A0', gradient: 'from-emerald-500/20 to-teal-500/10' },
  { key: 'email', label: 'Email', icon: '\u2709\uFE0F', color: '#FF6B35', gradient: 'from-orange-500/20 to-amber-500/10' },
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
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#060d19] flex items-center justify-center p-8">
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
    <div className="min-h-screen bg-[#060d19]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8 pb-20">

        <nav className="flex items-center gap-1.5 text-sm mb-10">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <Home size={14} />
            Dashboard
          </button>
          <ChevronRight size={13} className="text-gray-700" />
          <span className="text-gray-300 font-medium">Marketing</span>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
                Marketing Playbook
              </h1>
              <p className="text-gray-500 text-[15px] leading-relaxed max-w-md">
                Generate AI-powered strategies and ready-to-post content for each channel.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {generatingAllComplete ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium"
                >
                  <CheckCircle2 size={15} />
                  All done
                </motion.div>
              ) : generatingAll ? (
                <motion.div
                  key="progress"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.04] border border-white/[0.08] rounded-lg text-sm"
                >
                  <Loader2 size={14} className="text-[#2979FF] animate-spin" />
                  <span className="text-gray-300">{PLATFORMS[generatingAllIndex]?.label}</span>
                  <span className="text-gray-600">{generatingAllIndex + 1}/{PLATFORMS.length}</span>
                </motion.div>
              ) : (
                <motion.button
                  key="cta"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onClick={generateAllPlatforms}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#3d88ff] transition-colors"
                >
                  <Zap size={14} />
                  Generate All ({readyCount}/{PLATFORMS.length})
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="space-y-3 mb-12">
          {PLATFORMS.map((platform, i) => {
            const entry = entries[platform.key];
            const isReady = !!entry?.strategy;
            const isGenerating = generating === platform.key;
            const isCurrentlyGeneratingAll = generatingAll && generatingAllIndex === i;
            const busy = isGenerating || isCurrentlyGeneratingAll;

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
                className="group"
              >
                <div className={`relative flex items-center gap-4 sm:gap-5 px-4 sm:px-5 py-4 rounded-xl border transition-all duration-200 ${
                  isReady
                    ? 'bg-white/[0.03] border-white/[0.07] hover:border-white/[0.14]'
                    : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
                }`}>

                  <div
                    className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${platform.color}15` }}
                  >
                    {platform.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-white font-semibold text-[15px]">{platform.label}</h3>
                      {isReady && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[10px] font-semibold uppercase tracking-wider">
                          <CheckCircle2 size={10} />
                          Ready
                        </span>
                      )}
                      {busy && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-[#2979FF]/10 text-[#2979FF] rounded text-[10px] font-semibold uppercase tracking-wider">
                          <Loader2 size={10} className="animate-spin" />
                          Building
                        </span>
                      )}
                    </div>
                    {entry?.generated_at && (
                      <p className="text-gray-600 text-xs mt-0.5">
                        Last updated {formatDate(entry.generated_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isReady ? (
                      <>
                        <button
                          onClick={() => setSelectedPlatform(platform.key)}
                          className="flex items-center gap-1.5 px-3.5 py-2 bg-white/[0.07] text-white rounded-lg text-sm font-medium hover:bg-white/[0.12] transition-colors"
                        >
                          <Eye size={14} />
                          <span className="hidden sm:inline">View</span>
                        </button>
                        <button
                          onClick={() => generatePlatform(platform.key)}
                          disabled={isGenerating || generatingAll}
                          className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.07] rounded-lg transition-all disabled:opacity-30"
                          title="Regenerate"
                        >
                          {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => generatePlatform(platform.key)}
                        disabled={busy || generatingAll}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40"
                        style={{
                          backgroundColor: `${platform.color}18`,
                          color: platform.color,
                        }}
                      >
                        {busy ? (
                          <><Loader2 size={13} className="animate-spin" /> Generating...</>
                        ) : (
                          <><Sparkles size={13} /> Generate</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.35 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 px-5 py-5 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-[#2979FF]/15 transition-colors">
            <div className="w-11 h-11 bg-[#2979FF]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Globe className="text-[#2979FF]" size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-[15px] mb-0.5">Your Website</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Book a free 30-minute discovery call. Custom website live within 24 hours.
              </p>
            </div>
            <button
              onClick={() => navigate(`/website${ideaKey ? `?ideaKey=${ideaKey}` : ''}`)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#3d88ff] transition-colors whitespace-nowrap group/btn"
            >
              Book Discovery Call
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
