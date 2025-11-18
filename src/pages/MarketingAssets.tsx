import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import {
  Home,
  Loader2,
  CheckCircle2,
  Circle,
  FileText,
  Instagram,
  MessageSquare,
  Target,
  Copy,
  Mail,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { generateMarketingContent } from '../services/openai';

interface MarketingAssetsData {
  id: string;
  flyers: any[];
  social_posts: any[];
  message_templates: any[];
  ad_strategy: any;
  completed_steps: string[];
}

interface BrandData {
  selected_name: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo_data: {
    selected: any;
  };
}

export default function MarketingAssets() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MarketingAssetsData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const flyersRef = useRef<HTMLDivElement>(null);
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
            flyers: [],
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

  const generateFlyers = async () => {
    if (!brandData || !data) return;

    setGenerating(true);
    setProgress(0);
    setGeneratingStep('Preparing your brand assets...');

    try {
      const logoDescription = brandData.logo_data?.selected?.description || 'modern professional logo';
      const logoUrl = brandData.logo_data?.selected?.imageUrl || brandData.logo_data?.uploaded_logo_url;
      const businessDescription = (brandData as any).offer_description || brandData.selected_name;

      setProgress(10);
      setGeneratingStep('Creating flyer 1 of 3 with AI...');

      const progressUpdates = [
        { step: 15, message: 'Generating Grand Opening flyer...' },
        { step: 45, message: 'Creating flyer 2 of 3...' },
        { step: 50, message: 'Generating Service Showcase flyer...' },
        { step: 75, message: 'Creating flyer 3 of 3...' },
        { step: 80, message: 'Generating Social Media Story template...' },
      ];

      let updateIndex = 0;
      const progressInterval = setInterval(() => {
        if (updateIndex < progressUpdates.length) {
          setProgress(progressUpdates[updateIndex].step);
          setGeneratingStep(progressUpdates[updateIndex].message);
          updateIndex++;
        }
      }, 8000);

      const flyers = await generateMarketingContent({
        type: 'flyers',
        businessName: brandData.selected_name,
        brandColors: brandData.brand_colors,
        logoDescription,
        businessDescription,
        logoUrl,
        targetAudience: (brandData as any).target_audience,
        brandVoice: (brandData as any).brand_voice,
        tagline: (brandData as any).selected_tagline,
        contactInfo: undefined
      });

      clearInterval(progressInterval);

      if (!flyers || flyers.length === 0) {
        throw new Error('No flyers were generated');
      }

      setProgress(90);
      setGeneratingStep('Saving your flyers...');

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('flyers')) {
        newCompletedSteps.push('flyers');
      }

      await supabase
        .from('marketing_assets')
        .update({
          flyers,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setProgress(100);
      setGeneratingStep('Complete!');
      setData({ ...data, flyers, completed_steps: newCompletedSteps });
    } catch (err: any) {
      console.error('Error generating flyers:', err);
      alert(`Failed to generate flyers: ${err.message || 'Unknown error'}`);
    } finally {
      setTimeout(() => {
        setGenerating(false);
        setProgress(0);
        setGeneratingStep('');
      }, 1000);
    }
  };

  const generateSocialPosts = async () => {
    if (!brandData || !data) return;

    setGenerating(true);
    setProgress(0);
    setGeneratingStep('Crafting engaging social media content...');

    try {
      setProgress(20);
      const posts = await generateMarketingContent({
        type: 'social_posts',
        businessName: brandData.selected_name,
        brandColors: brandData.brand_colors,
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
        setGenerating(false);
        setProgress(0);
        setGeneratingStep('');
      }, 1000);
    }
  };

  const generateMessageTemplates = async () => {
    if (!brandData || !data) return;

    setGenerating(true);
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
        setGenerating(false);
        setProgress(0);
        setGeneratingStep('');
      }, 1000);
    }
  };

  const generateAdStrategy = async () => {
    if (!brandData || !data) return;

    setGenerating(true);
    try {
      const strategy = await generateMarketingContent({
        type: 'ad_strategy',
        businessName: brandData.selected_name,
        brandColors: brandData.brand_colors,
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
      setGenerating(false);
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
    { name: 'Flyers & Templates', ref: flyersRef, step: 'flyers', icon: <FileText size={20} /> },
    { name: 'Instagram Posts', ref: socialRef, step: 'social_posts', icon: <Instagram size={20} /> },
    { name: 'Message Pack', ref: messagesRef, step: 'message_templates', icon: <MessageSquare size={20} /> },
    { name: 'Ad Strategy', ref: adStrategyRef, step: 'ad_strategy', icon: <Target size={20} /> },
  ];

  const completedCount = sections.filter(s => data.completed_steps.includes(s.step)).length;
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
            {sections.map((section) => (
              <button
                key={section.step}
                onClick={() => section.ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors hover:bg-white/5 group"
              >
                <div className="text-gray-400 group-hover:text-[#2979FF] transition-colors">
                  {section.icon}
                </div>
                <span className="text-gray-300 text-sm flex-1">{section.name}</span>
                {data.completed_steps.includes(section.step) ? (
                  <CheckCircle2 className="text-[#06D6A0]" size={18} />
                ) : (
                  <Circle className="text-gray-600" size={18} />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 lg:ml-64">
          <div className="max-w-5xl mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">Marketing Assets</h1>
              <p className="text-gray-400">Create professional marketing materials for {brandData.selected_name}</p>
            </div>

            <div className="space-y-8">
              <div ref={flyersRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data.completed_steps.includes('flyers') ? (
                      <CheckCircle2 className="text-[#06D6A0]" size={24} />
                    ) : (
                      <Circle className="text-gray-500" size={24} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-3">1. Flyer & Post Templates</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      AI-generated flyer designs with your brand colors, logo, and business info.
                    </p>

                    {data.flyers.length === 0 ? (
                      <div className="space-y-3">
                        <button
                          onClick={generateFlyers}
                          disabled={generating}
                          className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {generating ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
                              Generate Flyers
                            </>
                          )}
                        </button>

                        {generating && (
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
                      <div className="space-y-6">
                        {data.flyers.map((flyer: any, idx: number) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <h4 className="text-white font-semibold text-lg mb-1">{flyer.title}</h4>
                                <p className="text-gray-400 text-sm">{flyer.description}</p>
                                {flyer.size && <p className="text-gray-500 text-xs mt-1">Size: {flyer.size}</p>}
                              </div>
                            </div>

                            {flyer.template ? (
                              <div className="space-y-6">
                                {/* Brand Colors & Logo Section */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-3 block">Brand Assets</label>
                                  <div className="flex items-center gap-4 flex-wrap">
                                    {/* Logo */}
                                    {brandData?.logo_data?.selected?.imageUrl && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Logo:</span>
                                        <div className="bg-white p-2 rounded-lg">
                                          <img
                                            src={brandData.logo_data.selected.imageUrl}
                                            alt="Brand Logo"
                                            className="h-12 w-auto"
                                          />
                                        </div>
                                      </div>
                                    )}

                                    {/* Color Palette */}
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-500">Colors:</span>
                                      <div className="flex gap-2">
                                        <div className="flex flex-col items-center gap-1">
                                          <div
                                            className="w-12 h-12 rounded-lg border-2 border-white/20"
                                            style={{ backgroundColor: brandData?.brand_colors?.primary }}
                                          ></div>
                                          <span className="text-xs text-gray-500">Primary</span>
                                        </div>
                                        {brandData?.brand_colors?.secondary && (
                                          <div className="flex flex-col items-center gap-1">
                                            <div
                                              className="w-12 h-12 rounded-lg border-2 border-white/20"
                                              style={{ backgroundColor: brandData.brand_colors.secondary }}
                                            ></div>
                                            <span className="text-xs text-gray-500">Secondary</span>
                                          </div>
                                        )}
                                        {brandData?.brand_colors?.accent && (
                                          <div className="flex flex-col items-center gap-1">
                                            <div
                                              className="w-12 h-12 rounded-lg border-2 border-white/20"
                                              style={{ backgroundColor: brandData.brand_colors.accent }}
                                            ></div>
                                            <span className="text-xs text-gray-500">Accent</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Template Content */}
                                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                                  {/* Business Name with Logo */}
                                  <div className="pb-4 border-b border-white/10">
                                    <div className="flex items-center gap-3">
                                      {brandData?.logo_data?.selected?.imageUrl && (
                                        <div className="bg-white p-2 rounded-lg">
                                          <img
                                            src={brandData.logo_data.selected.imageUrl}
                                            alt="Logo"
                                            className="h-10 w-auto"
                                          />
                                        </div>
                                      )}
                                      <div>
                                        <h3
                                          className="text-3xl font-bold"
                                          style={{ color: brandData?.brand_colors?.primary || '#fff' }}
                                        >
                                          {brandData?.selected_name}
                                        </h3>
                                        {(brandData as any)?.selected_tagline && (
                                          <p className="text-sm text-gray-400 mt-1">
                                            {(brandData as any).selected_tagline}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Headline */}
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Headline</label>
                                    <div
                                      className="text-2xl font-bold"
                                      style={{ color: brandData?.brand_colors?.primary || '#fff' }}
                                    >
                                      {flyer.template.headline}
                                    </div>
                                  </div>

                                {/* Subheadline */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Subheadline</label>
                                  <div className="text-gray-200 text-lg">{flyer.template.subheadline}</div>
                                </div>

                                {/* Body Content */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Body Content</label>
                                  <div className="text-gray-300 text-sm leading-relaxed">{flyer.template.bodyContent}</div>
                                </div>

                                {/* Features */}
                                {flyer.template.features && flyer.template.features.length > 0 && (
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Features & Benefits</label>
                                    <ul className="space-y-2">
                                      {flyer.template.features.map((feature: string, fIdx: number) => (
                                        <li key={fIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                          <span
                                            className="mt-0.5 font-bold"
                                            style={{ color: brandData?.brand_colors?.accent || '#06D6A0' }}
                                          >
                                            ✓
                                          </span>
                                          {feature}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Call to Action */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Call to Action</label>
                                  <div
                                    className="rounded-lg px-6 py-3 font-bold text-center text-white"
                                    style={{
                                      backgroundColor: brandData?.brand_colors?.accent || brandData?.brand_colors?.primary || '#2979FF'
                                    }}
                                  >
                                    {flyer.template.cta}
                                  </div>
                                </div>

                                {/* Footer */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Footer / Contact Info</label>
                                  <div className="text-gray-400 text-sm whitespace-pre-line">{flyer.template.footer}</div>
                                </div>

                                {/* Design Notes */}
                                <div className="border-t border-white/10 pt-4 space-y-3">
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Layout Notes</label>
                                    <p className="text-gray-500 text-xs">{flyer.template.layoutNotes}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Color Usage</label>
                                    <p className="text-gray-500 text-xs">{flyer.template.colorNotes}</p>
                                  </div>
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Font Usage</label>
                                    <p className="text-gray-500 text-xs">{flyer.template.fontNotes}</p>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mt-4">
                                <button
                                  onClick={() => window.open(flyer.canvaUrl, '_blank')}
                                  className="px-4 py-2 bg-[#00C4CC] text-white rounded-lg text-sm font-semibold hover:bg-[#00C4CC]/90 transition-colors flex items-center gap-2"
                                >
                                  <FileText size={16} />
                                  Create in Canva
                                </button>
                                <button
                                  onClick={() => {
                                    const textToCopy = flyer.template ?
                                      `${flyer.template.headline}\n\n${flyer.template.subheadline}\n\n${flyer.template.bodyContent}\n\n${flyer.template.features?.join('\n') || ''}\n\n${flyer.template.cta}\n\n${flyer.template.footer}` :
                                      flyer.description;
                                    copyToClipboard(textToCopy, idx);
                                  }}
                                  className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                                >
                                  <Copy size={16} />
                                  {copiedIndex === idx ? 'Copied!' : 'Copy Template'}
                                </button>
                              </div>
                            </div>
                            ) : flyer.imageUrl ? (
                              <div>
                                <div className="mb-4 rounded-lg overflow-hidden border border-white/20">
                                  <img
                                    src={flyer.imageUrl}
                                    alt={flyer.title}
                                    className="w-full h-auto"
                                  />
                                </div>
                                <div className="flex flex-wrap gap-2 mt-4">
                                  <button
                                    onClick={() => window.open(flyer.canvaUrl, '_blank')}
                                    className="px-4 py-2 bg-[#00C4CC] text-white rounded-lg text-sm font-semibold hover:bg-[#00C4CC]/90 transition-colors flex items-center gap-2"
                                  >
                                    <FileText size={16} />
                                    Edit in Canva
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div ref={socialRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data.completed_steps.includes('social_posts') ? (
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

                    {data.social_posts.length === 0 ? (
                      <div className="space-y-3">
                        <button
                          onClick={generateSocialPosts}
                          disabled={generating}
                          className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {generating ? (
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

                        {generating && (
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
                        {data.social_posts.map((post: any, idx: number) => (
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
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div ref={messagesRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data.completed_steps.includes('message_templates') ? (
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

                    {data.message_templates.length === 0 ? (
                      <div className="space-y-3">
                        <button
                          onClick={generateMessageTemplates}
                          disabled={generating}
                          className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {generating ? (
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

                        {generating && (
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
                        {data.message_templates.map((template: any, idx: number) => (
                          <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              {template.type === 'sms' && <MessageCircle size={18} className="text-[#06D6A0]" />}
                              {template.type === 'email' && <Mail size={18} className="text-[#2979FF]" />}
                              {template.type === 'dm' && <MessageSquare size={18} className="text-[#EF476F]" />}
                              <h4 className="text-white font-semibold">{template.title}</h4>
                            </div>
                            <p className="text-gray-300 text-sm mb-3 whitespace-pre-line">{template.content}</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => copyToClipboard(template.content, idx + 200)}
                                className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 transition-colors flex items-center gap-2"
                              >
                                <Copy size={16} />
                                {copiedIndex === idx + 200 ? 'Copied!' : 'Copy'}
                              </button>
                              {template.type === 'sms' && (
                                <button
                                  onClick={() => sendViaSMS(template.content)}
                                  className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg text-sm font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2"
                                >
                                  <MessageCircle size={16} />
                                  Send via SMS
                                </button>
                              )}
                              {template.type === 'email' && (
                                <button
                                  onClick={() => sendViaEmail(template.content)}
                                  className="px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#2979FF]/90 transition-colors flex items-center gap-2"
                                >
                                  <Mail size={16} />
                                  Send via Email
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div ref={adStrategyRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {data.completed_steps.includes('ad_strategy') ? (
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

                    {!data.ad_strategy ? (
                      <button
                        onClick={generateAdStrategy}
                        disabled={generating}
                        className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {generating ? (
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
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-2">Target Audience</h4>
                          <p className="text-gray-300 text-sm">{data.ad_strategy.targetAudience}</p>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3">Budget Suggestion</h4>
                          {data.ad_strategy.budget && typeof data.ad_strategy.budget === 'object' ? (
                            <div className="space-y-3">
                              <div className="flex justify-between items-center pb-2 border-b border-white/10">
                                <span className="text-gray-300 text-sm">Total Budget:</span>
                                <span className="text-white font-semibold">${data.ad_strategy.budget.total}</span>
                              </div>
                              {data.ad_strategy.budget.breakdown && Object.entries(data.ad_strategy.budget.breakdown).map(([key, value]: [string, any]) => (
                                <div key={key} className="space-y-1">
                                  <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm capitalize">{key.replace(/_/g, ' ')}:</span>
                                    <span className="text-[#2979FF] font-semibold">${value.amount}</span>
                                  </div>
                                  {value.recommendations && (
                                    <p className="text-gray-400 text-xs ml-4">{value.recommendations}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-300 text-sm">{String(data.ad_strategy.budget)}</p>
                          )}
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="text-white font-semibold mb-3">Daily Content Calendar</h4>
                          <div className="space-y-3">
                            {data.ad_strategy.calendar.map((day: any, idx: number) => (
                              <div key={idx} className="flex gap-3">
                                <div className="text-[#2979FF] font-semibold text-sm w-24">{day.day}</div>
                                <div className="text-gray-300 text-sm flex-1">{day.activity}</div>
                              </div>
                            ))}
                          </div>
                        </div>
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
                    <button
                      onClick={() => navigate(`/build-site?ideaKey=${ideaKey}`)}
                      className="px-8 py-3 bg-[#2979FF] text-white rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
                    >
                      Continue to Website Builder →
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
