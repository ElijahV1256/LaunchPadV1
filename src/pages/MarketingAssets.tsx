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
  { key: 'instagram', label: 'Instagram', emoji: '\uD83D\uDCF1' },
  { key: 'meta_ads', label: 'Meta Ads', emoji: '\uD83D\uDCD8' },
  { key: 'tiktok', label: 'TikTok', emoji: '\uD83C\uDFB5' },
  { key: 'mass_text', label: 'Mass Text', emoji: '\uD83D\uDCAC' },
  { key: 'email', label: 'Email', emoji: '\uD83D\uDCE7' },
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
        >
          <Home size={16} />
          Dashboard
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Marketing Playbook</h1>
            <p className="text-gray-400">
              Pick a platform, get your strategy and content. Come back anytime for fresh ideas.
            </p>
          </div>

          <div className="flex-shrink-0">
            <AnimatePresence mode="wait">
              {generatingAllComplete ? (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#06D6A0]/20 border border-[#06D6A0]/30 text-[#06D6A0] rounded-xl font-semibold text-sm"
                >
                  <CheckCircle2 size={16} />
                  All platforms ready
                </motion.div>
              ) : generatingAll ? (
                <motion.div
                  key="generating"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-5 py-3 bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-xl font-semibold text-sm"
                >
                  <Loader2 size={16} className="animate-spin" />
                  Generating {PLATFORMS[generatingAllIndex]?.label}... ({generatingAllIndex + 1}/{PLATFORMS.length})
                </motion.div>
              ) : (
                <motion.button
                  key="button"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={generateAllPlatforms}
                  className="flex items-center gap-2 px-5 py-3 bg-[#2979FF] text-white rounded-xl font-semibold text-sm hover:bg-[#2979FF]/90 transition-all"
                >
                  <Zap size={16} />
                  Generate All Platforms
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {PLATFORMS.map((platform, i) => {
            const entry = entries[platform.key];
            const isReady = !!entry?.strategy;
            const isGenerating = generating === platform.key;

            return (
              <motion.div
                key={platform.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`bg-white/5 backdrop-blur-sm border rounded-xl p-5 transition-all hover:bg-white/[0.07] ${
                  isReady ? 'border-[#06D6A0]/30' : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{platform.emoji}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{platform.label}</h3>
                      {entry?.generated_at && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          Generated {formatDate(entry.generated_at)}
                        </p>
                      )}
                    </div>
                  </div>
                  {isReady ? (
                    <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#06D6A0]/15 text-[#06D6A0] rounded-full text-xs font-semibold">
                      <CheckCircle2 size={12} />
                      Ready
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-white/5 text-gray-500 rounded-full text-xs font-medium">
                      Not Generated
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  {isReady ? (
                    <>
                      <button
                        onClick={() => setSelectedPlatform(platform.key)}
                        className="flex-1 py-2.5 bg-[#2979FF] text-white rounded-lg font-semibold text-sm hover:bg-[#2979FF]/90 transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => generatePlatform(platform.key)}
                        disabled={isGenerating || generatingAll}
                        className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                      >
                        {isGenerating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {isGenerating ? 'Regenerating...' : 'Regenerate'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => generatePlatform(platform.key)}
                      disabled={isGenerating || generatingAll}
                      className="flex-1 py-2.5 bg-[#2979FF]/15 border border-[#2979FF]/30 text-[#2979FF] rounded-lg font-semibold text-sm hover:bg-[#2979FF]/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isGenerating ? (
                        <><Loader2 size={14} className="animate-spin" /> Building your {platform.label} playbook...</>
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#2979FF]/15 rounded-xl flex items-center justify-center flex-shrink-0">
              <Globe className="text-[#2979FF]" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Your Website</h3>
              <p className="text-gray-400 text-sm mb-4">
                Book a free 30-minute discovery call. We'll build your custom website and have it live within 24 hours.
              </p>
              <button
                onClick={() => navigate(`/website${ideaKey ? `?ideaKey=${ideaKey}` : ''}`)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2979FF] text-white rounded-lg font-semibold text-sm hover:bg-[#2979FF]/90 transition-all"
              >
                Book Your Discovery Call
                <ArrowRight size={16} />
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
