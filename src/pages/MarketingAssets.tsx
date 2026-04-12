import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import {
  Home,
  Loader2,
  CheckCircle2,
  Circle,
  Globe,
  Instagram,
  MessageSquare,
  Target,
  Copy,
  Mail,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { generateMarketingContent } from '../services/openai';

interface MarketingAssetsData {
  id: string;
  social_posts: any[];
  message_templates: any[];
  ad_strategy: any;
  completed_steps: string[];
}

interface BrandData {
  selected_name: string;
  selected_tagline: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo_data: {
    selected: any;
  };
  logo_url: string | null;
  business_type: string;
  offer_description: string;
  target_audience: string;
  brand_voice: string;
}

export default function MarketingAssets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketingAssetsData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [storyBrandData, setStoryBrandData] = useState<any>(null);
  const [generatingSocial, setGeneratingSocial] = useState(false);
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [generatingAds, setGeneratingAds] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const websiteRef = useRef<HTMLDivElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const adStrategyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ideaKey) {
      setError('No idea key provided');
      setLoading(false);
      return;
    }
    loadData();
  }, [ideaKey]);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: brandIdentity, error: brandError } = await supabase
        .from('brand_identity')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (brandError) throw brandError;
      if (!brandIdentity) {
        setError('Please complete Brand Identity first');
        setLoading(false);
        return;
      }

      setBrandData(brandIdentity);

      // Fetch StoryBrand data
      const { data: storyBrand } = await supabase
        .from('storybrand_roadmap')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey!)
        .maybeSingle();

      setStoryBrandData(storyBrand);

      // Load marketing assets data
      let { data: marketingData, error: marketingError } = await supabase
        .from('marketing_assets')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey!)
        .maybeSingle();

      if (marketingError) throw marketingError;

      if (!marketingData) {
        const { data: newData, error: insertError } = await supabase
          .from('marketing_assets')
          .insert({
            user_id: user.id,
            idea_key: ideaKey!,
            social_posts: [],
            message_templates: [],
            ad_strategy: null,
            completed_steps: [],
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            const { data: existingData } = await supabase
              .from('marketing_assets')
              .select('*')
              .eq('user_id', user.id)
              .eq('idea_key', ideaKey!)
              .maybeSingle();
            marketingData = existingData;
          } else {
            throw insertError;
          }
        } else {
          marketingData = newData;
        }
      }

      setData(marketingData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateSocialPosts = async () => {
    if (!brandData || !data) return;

    setGeneratingSocial(true);
    setProgress(0);
    setGeneratingStep('Crafting engaging social media content...');

    try {
      setProgress(20);
      const posts = await generateMarketingContent({
        type: 'social_posts',
        businessName: brandData.selected_name,
        brandColors: brandData.brand_colors,
        businessDescription: (brandData as any).offer_description,
        targetAudience: (brandData as any).target_audience,
        brandVoice: (brandData as any).brand_voice,
        storyBrandData: storyBrandData?.step_answers || null
      });

      if (!posts || posts.length === 0) {
        throw new Error('No social posts were generated');
      }

      setProgress(80);
      setGeneratingStep('Saving your posts...');

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('social_posts')) {
        newCompletedSteps.push('social_posts');
      }

      await supabase
        .from('marketing_assets')
        .update({
          social_posts: posts,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setProgress(100);
      setGeneratingStep('Complete!');
      setData({ ...data, social_posts: posts, completed_steps: newCompletedSteps });
    } catch (err: any) {
      console.error('Error generating social posts:', err);
      alert(`Failed to generate social posts: ${err.message || 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setGeneratingSocial(false);
        setProgress(0);
        setGeneratingStep('');
      }, 1000);
    }
  };

  const generateMessageTemplates = async () => {
    if (!brandData || !data) return;

    setGeneratingMessages(true);
    setProgress(0);
    setGeneratingStep('Creating personalized message templates...');

    try {
      setProgress(20);
      const templates = await generateMarketingContent({
        type: 'message_templates',
        businessName: brandData.selected_name,
        brandColors: brandData.brand_colors,
      });

      if (!templates || templates.length === 0) {
        throw new Error('No message templates were generated');
      }

      setProgress(80);
      setGeneratingStep('Saving your templates...');

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('message_templates')) {
        newCompletedSteps.push('message_templates');
      }

      await supabase
        .from('marketing_assets')
        .update({
          message_templates: templates,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setProgress(100);
      setGeneratingStep('Complete!');
      setData({ ...data, message_templates: templates, completed_steps: newCompletedSteps });
    } catch (err: any) {
      console.error('Error generating message templates:', err);
      alert(`Failed to generate message templates: ${err.message || 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setGeneratingMessages(false);
        setProgress(0);
        setGeneratingStep('');
      }, 1000);
    }
  };

  const generateAdStrategy = async () => {
    if (!brandData || !data) return;

    setGeneratingAds(true);
    try {
      const strategy = await generateMarketingContent({
        type: 'ad_strategy',
        businessName: brandData.selected_name,
        brandColors: brandData.brand_colors,
        businessDescription: (brandData as any).offer_description,
        targetAudience: (brandData as any).target_audience,
        brandVoice: (brandData as any).brand_voice,
        tagline: (brandData as any).selected_tagline,
        storyBrandData: storyBrandData?.step_answers || null
      });

      if (!strategy) {
        throw new Error('No ad strategy was generated');
      }

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('ad_strategy')) {
        newCompletedSteps.push('ad_strategy');
      }

      await supabase
        .from('marketing_assets')
        .update({
          ad_strategy: strategy,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, ad_strategy: strategy, completed_steps: newCompletedSteps });
    } catch (err: any) {
      console.error('Error generating ad strategy:', err);
      alert(`Failed to generate ad strategy: ${err.message || 'Unknown error'}`);
    } finally {
      setGeneratingAds(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const sendViaEmail = (text: string) => {
    const subject = encodeURIComponent(`Check out ${brandData?.selected_name}!`);
    const body = encodeURIComponent(text);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const sendViaSMS = (text: string) => {
    window.open(`sms:?body=${encodeURIComponent(text)}`);
  };

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

  if (!data || !brandData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="text-[#2979FF] animate-spin" size={48} />
      </div>
    );
  }

  const sections = [
    { name: 'Website', ref: websiteRef, step: 'website', icon: <Globe size={20} /> },
    { name: 'Instagram Posts', ref: socialRef, step: 'social_posts', icon: <Instagram size={20} /> },
    { name: 'Message Pack', ref: messagesRef, step: 'message_templates', icon: <MessageSquare size={20} /> },
    { name: 'Ad Strategy', ref: adStrategyRef, step: 'ad_strategy', icon: <Target size={20} /> },
  ];

  const completedCount = sections.filter(s => {
    if (s.step === 'website') return false;
    return data?.completed_steps?.includes(s.step);
  }).length;
  const progressPct = Math.round((completedCount / sections.length) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="flex">
        <div className="hidden lg:block w-64 fixed left-0 top-0 h-screen bg-[#0A192F]/80 backdrop-blur-sm border-r border-white/10 p-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-8 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span>Dashboard</span>
          </button>

          <div className="mb-6">
            <h2 className="text-white font-bold text-lg mb-2">Marketing Assets</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] h-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                ></div>
              </div>
              <span className="text-gray-400 text-sm">{progressPct}%</span>
            </div>
          </div>

          <div className="space-y-2">
            {sections.map((section) => {
              const isCompleted = section.step === 'website'
                ? false
                : data?.completed_steps?.includes(section.step);

              return (
                <button
                  key={section.step}
                  onClick={() => section.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5 group"
                >
                  <div className="text-gray-400 group-hover:text-[#2979FF] transition-colors">
                    {section.icon}
                  </div>
                  <span className="text-gray-300 text-sm flex-1">{section.name}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="text-[#06D6A0]" size={18} />
                  ) : (
                    <Circle className="text-gray-600" size={18} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 lg:ml-64">
          <div className="max-w-5xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Marketing Assets</h1>
              <p className="text-gray-400">Create professional marketing materials for {brandData.selected_name}</p>
            </div>

            <div className="space-y-8">
              <div ref={websiteRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    <Globe className="text-[#2979FF]" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">1. Website</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Book a free discovery call and we'll build a custom website for {brandData.selected_name}.
                    </p>
                    <button
                      onClick={() => navigate(`/website?ideaKey=${ideaKey}`)}
                      className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors flex items-center gap-2"
                    >
                      <Globe size={18} />
                      Book a Discovery Call
                    </button>
                  </div>
                </div>
              </div>

              <div ref={socialRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data?.completed_steps?.includes('social_posts') ? (
                      <CheckCircle2 className="text-[#06D6A0]" size={24} />
                    ) : (
                      <Circle className="text-gray-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">2. Instagram Post Kit</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      3 starter posts with captions and hashtags ready to share.
                    </p>

                    {data?.social_posts?.length === 0 ? (
                      <div className="space-y-3">
                        <button
                          onClick={generateSocialPosts}
                          disabled={generatingSocial}
                          className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {generatingSocial ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Generate Posts
                            </>
                          )}
                        </button>

                        {generatingSocial && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{generatingStep}</span>
                              <span className="text-[#2979FF] font-semibold">{progress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-gray-400 text-xs">Feel free to explore other sections while this generates.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data?.social_posts?.map((post: any, idx: number) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-2">Post {idx + 1}</h4>
                            <p className="text-gray-300 text-sm mb-2 whitespace-pre-line">{post.caption}</p>
                            <p className="text-[#2979FF] text-sm mb-3">{post.hashtags}</p>
                            <button
                              onClick={() => copyToClipboard(`${post.caption}\n\n${post.hashtags}`, idx + 100)}
                              className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                            >
                              <Copy size={16} />
                              {copiedIndex === idx + 100 ? 'Copied!' : 'Copy Post'}
                            </button>
                          </div>
                        ))}

                        <button
                          onClick={generateSocialPosts}
                          disabled={generatingSocial}
                          className="w-full px-4 py-2 bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/30 rounded-lg text-sm font-semibold hover:bg-[#2979FF]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {generatingSocial ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={16} />
                              Regenerate New Posts
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div ref={messagesRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data?.completed_steps?.includes('message_templates') ? (
                      <CheckCircle2 className="text-[#06D6A0]" size={24} />
                    ) : (
                      <Circle className="text-gray-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">3. Intro Message Pack</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Mass-text, email, and DM templates with send buttons.
                    </p>

                    {data?.message_templates?.length === 0 ? (
                      <div className="space-y-3">
                        <button
                          onClick={generateMessageTemplates}
                          disabled={generatingMessages}
                          className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {generatingMessages ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Generate Templates
                            </>
                          )}
                        </button>

                        {generatingMessages && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-300">{generatingStep}</span>
                              <span className="text-[#2979FF] font-semibold">{progress}%</span>
                            </div>
                            <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] h-full transition-all duration-300"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <p className="text-gray-400 text-xs">Feel free to explore other sections while this generates.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {data?.message_templates?.map((template: any, idx: number) => {
                          const channel = template.channel || template.type;
                          const content = template.body || template.content;
                          const title = template.title;
                          const subject = template.subject;

                          return (
                            <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                {channel === 'sms' && <MessageCircle size={18} className="text-[#06D6A0]" />}
                                {channel === 'email' && <Mail size={18} className="text-[#2979FF]" />}
                                {(channel === 'linkedin' || channel === 'dm') && <MessageSquare size={18} className="text-[#EF476F]" />}
                                {(channel === 'voicemail' || channel === 'thankyou') && <MessageCircle size={18} className="text-gray-400" />}
                                <h4 className="text-white font-semibold">{title}</h4>
                              </div>
                              {subject && (
                                <p className="text-[#2979FF] text-sm font-medium mb-2">Subject: {subject}</p>
                              )}
                              <p className="text-gray-300 text-sm mb-3 whitespace-pre-line">{content}</p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => copyToClipboard(content, idx + 200)}
                                  className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                  <Copy size={16} />
                                  {copiedIndex === idx + 200 ? 'Copied!' : 'Copy'}
                                </button>
                                {channel === 'sms' && (
                                  <button
                                    onClick={() => sendViaSMS(content)}
                                    className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg text-sm font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2"
                                  >
                                    <MessageCircle size={16} />
                                    Send via SMS
                                  </button>
                                )}
                                {channel === 'email' && (
                                  <button
                                    onClick={() => sendViaEmail(content)}
                                    className="px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#2979FF]/90 transition-colors flex items-center gap-2"
                                  >
                                    <Mail size={16} />
                                    Send via Email
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div ref={adStrategyRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data?.completed_steps?.includes('ad_strategy') ? (
                      <CheckCircle2 className="text-[#06D6A0]" size={24} />
                    ) : (
                      <Circle className="text-gray-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">4. Advertising Strategy Wizard</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      AI-built ad plan with target audience, budget, and content calendar.
                    </p>

                    {!data?.ad_strategy ? (
                      <button
                        onClick={generateAdStrategy}
                        disabled={generatingAds}
                        className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {generatingAds ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={18} />
                            Generate Strategy
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-6">
                        {/* Core Messaging */}
                        {data?.ad_strategy?.coreMessaging && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">1. Core Messaging</h4>
                            <div className="space-y-3">
                              {data.ad_strategy.coreMessaging.headline && (
                                <div>
                                  <span className="text-[#2979FF] text-xs font-semibold uppercase">Headline</span>
                                  <p className="text-white text-lg font-bold mt-1">{data.ad_strategy.coreMessaging.headline}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <p className="text-gray-300 text-sm">Your complete advertising strategy has been generated. This includes target audience analysis, recommended channels, ad concepts, and a 30-day action plan.</p>
                        </div>

                        <button
                          onClick={generateAdStrategy}
                          disabled={generatingAds}
                          className="w-full px-4 py-2 bg-[#2979FF]/20 text-[#2979FF] border border-[#2979FF]/30 rounded-lg text-sm font-semibold hover:bg-[#2979FF]/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {generatingAds ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              Regenerating...
                            </>
                          ) : (
                            <>
                              <RefreshCw size={16} />
                              Regenerate Strategy
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {completedCount === 4 && (
                <div className="bg-gradient-to-r from-[#2979FF]/20 to-[#2979FF]/10 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-8">
                  <h2 className="text-3xl font-bold text-white mb-4 text-center">
                    Marketing Assets Complete!
                  </h2>
                  <p className="text-gray-300 mb-6 text-center">
                    Your marketing materials are ready. Next step: Build your website to go live!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-8 py-3 bg-[#06D6A0] text-white rounded-lg font-bold text-lg hover:bg-[#06D6A0]/90 transition-all duration-300"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

