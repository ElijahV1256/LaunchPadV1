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
  Sparkles,
  Download,
  RefreshCw,
  Edit3,
  Save,
  X
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
  const [storyBrandData, setStoryBrandData] = useState<any>(null);
  const [generatingFlyers, setGeneratingFlyers] = useState(false);
  const [generatingSocial, setGeneratingSocial] = useState(false);
  const [generatingMessages, setGeneratingMessages] = useState(false);
  const [generatingAds, setGeneratingAds] = useState(false);
  const [generatingStep, setGeneratingStep] = useState('');
  const [progress, setProgress] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [editingFlyerIndex, setEditingFlyerIndex] = useState<number | null>(null);
  const [editedFlyerData, setEditedFlyerData] = useState<any>(null);
  const [savingFlyer, setSavingFlyer] = useState(false);

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

      // Fetch StoryBrand data
      const { data: storyBrand } = await supabase
        .from('storybrand_roadmap')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey!)
        .maybeSingle();

      setStoryBrandData(storyBrand);

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

  const startEditingFlyer = (index: number) => {
    const flyer = data!.flyers[index];
    setEditingFlyerIndex(index);
    setEditedFlyerData({ ...flyer.template });
  };

  const cancelEditingFlyer = () => {
    setEditingFlyerIndex(null);
    setEditedFlyerData(null);
  };

  const saveEditedFlyer = async () => {
    if (editingFlyerIndex === null || !data || !editedFlyerData) return;

    setSavingFlyer(true);
    try {
      const updatedFlyers = [...data.flyers];
      updatedFlyers[editingFlyerIndex] = {
        ...updatedFlyers[editingFlyerIndex],
        template: editedFlyerData,
      };

      await supabase
        .from('marketing_assets')
        .update({
          flyers: updatedFlyers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, flyers: updatedFlyers });
      setEditingFlyerIndex(null);
      setEditedFlyerData(null);
    } catch (err: any) {
      console.error('Error saving flyer:', err);
      alert('Failed to save changes');
    } finally {
      setSavingFlyer(false);
    }
  };

  const generateFlyers = async () => {
    if (!brandData || !data) return;

    setGeneratingFlyers(true);
    setProgress(0);
    setGeneratingStep('Preparing your brand assets...');

    try {
      const logoDescription = brandData.logo_data?.selected?.description || 'modern professional logo';
      const logoUrl = brandData.logo_data?.selected?.imageUrl || brandData.logo_data?.uploaded_logo_url;
      const businessDescription = (brandData as any).offer_description || brandData.selected_name;

      setProgress(10);
      setGeneratingStep('Creating flyer 1 of 3 with AI...');

      const progressUpdates = [
        { step: 15, message: 'Generating content for flyer 1...' },
        { step: 25, message: 'Creating flyer image 1 with DALL·E 3...' },
        { step: 40, message: 'Generating content for flyer 2...' },
        { step: 50, message: 'Creating flyer image 2 with DALL·E 3...' },
        { step: 65, message: 'Generating content for flyer 3...' },
        { step: 75, message: 'Creating flyer image 3 with DALL·E 3...' },
        { step: 85, message: 'Finalizing designs (this may take 30-60 seconds)...' },
      ];

      let updateIndex = 0;
      const progressInterval = setInterval(() => {
        if (updateIndex < progressUpdates.length) {
          setProgress(progressUpdates[updateIndex].step);
          setGeneratingStep(progressUpdates[updateIndex].message);
          updateIndex++;
        }
      }, 8000);

      console.log('Calling flyer generation with:', {
        businessName: brandData.selected_name,
        hasColors: !!brandData.brand_colors,
        hasLogoUrl: !!logoUrl,
        hasDescription: !!businessDescription
      });

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
        contactInfo: undefined,
        storyBrandData: storyBrandData?.step_answers || null
      });

      console.log('Flyers generated successfully:', flyers);

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
        setGeneratingFlyers(false);
        setProgress(0);
        setGeneratingStep('');
      }, 1000);
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
                          disabled={generatingFlyers}
                          className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {generatingFlyers ? (
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

                        {generatingFlyers && (
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
                              <button
                                onClick={() => startEditingFlyer(idx)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#2979FF]/20 border border-[#2979FF]/30 text-[#2979FF] rounded-lg text-sm hover:bg-[#2979FF]/30 transition-colors"
                              >
                                <Edit3 size={14} />
                                Edit Text
                              </button>
                            </div>

                            {flyer.imageUrl ? (
                              <div className="space-y-6">
                                {/* Generated Flyer Image */}
                                <div className="rounded-lg overflow-hidden border-2 border-white/20 bg-white">
                                  <img
                                    src={flyer.imageUrl}
                                    alt={flyer.title}
                                    className="w-full h-auto"
                                  />
                                </div>

                                {/* Text Content Details (Collapsible) */}
                                <details className="bg-white/5 border border-white/10 rounded-lg">
                                  <summary className="px-4 py-3 cursor-pointer text-sm font-semibold text-white hover:bg-white/5 transition-colors">
                                    View Text Content & Brand Assets
                                  </summary>
                                  <div className="p-4 space-y-4 border-t border-white/10">
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
                                    {editingFlyerIndex === idx ? (
                                      <input
                                        type="text"
                                        value={editedFlyerData.headline}
                                        onChange={(e) => setEditedFlyerData({ ...editedFlyerData, headline: e.target.value })}
                                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                                      />
                                    ) : (
                                      <div
                                        className="text-2xl font-bold"
                                        style={{ color: brandData?.brand_colors?.primary || '#fff' }}
                                      >
                                        {flyer.template.headline}
                                      </div>
                                    )}
                                  </div>

                                {/* Subheadline */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Subheadline</label>
                                  {editingFlyerIndex === idx ? (
                                    <input
                                      type="text"
                                      value={editedFlyerData.subheadline}
                                      onChange={(e) => setEditedFlyerData({ ...editedFlyerData, subheadline: e.target.value })}
                                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-lg focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                                    />
                                  ) : (
                                    <div className="text-gray-200 text-lg">{flyer.template.subheadline}</div>
                                  )}
                                </div>

                                {/* Body Content */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Body Content</label>
                                  {editingFlyerIndex === idx ? (
                                    <textarea
                                      value={editedFlyerData.body || editedFlyerData.bodyContent || ''}
                                      onChange={(e) => setEditedFlyerData({ ...editedFlyerData, body: e.target.value, bodyContent: e.target.value })}
                                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF] resize-none"
                                      rows={3}
                                    />
                                  ) : (
                                    <div className="text-gray-300 text-sm leading-relaxed">{flyer.template.body || flyer.template.bodyContent}</div>
                                  )}
                                </div>

                                {/* Features */}
                                {(flyer.template.features && flyer.template.features.length > 0) && (
                                  <div>
                                    <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Features & Benefits</label>
                                    {editingFlyerIndex === idx ? (
                                      <div className="space-y-2">
                                        {editedFlyerData.features?.map((feature: string, fIdx: number) => (
                                          <input
                                            key={fIdx}
                                            type="text"
                                            value={feature}
                                            onChange={(e) => {
                                              const newFeatures = [...editedFlyerData.features];
                                              newFeatures[fIdx] = e.target.value;
                                              setEditedFlyerData({ ...editedFlyerData, features: newFeatures });
                                            }}
                                            className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                                          />
                                        ))}
                                      </div>
                                    ) : (
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
                                    )}
                                  </div>
                                )}

                                {/* Call to Action */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Call to Action</label>
                                  {editingFlyerIndex === idx ? (
                                    <input
                                      type="text"
                                      value={editedFlyerData.cta}
                                      onChange={(e) => setEditedFlyerData({ ...editedFlyerData, cta: e.target.value })}
                                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#2979FF]"
                                    />
                                  ) : (
                                    <div
                                      className="rounded-lg px-6 py-3 font-bold text-center text-white"
                                      style={{
                                        backgroundColor: brandData?.brand_colors?.accent || brandData?.brand_colors?.primary || '#2979FF'
                                      }}
                                    >
                                      {flyer.template.cta}
                                    </div>
                                  )}
                                </div>

                                {/* Footer */}
                                <div>
                                  <label className="text-xs text-gray-400 uppercase tracking-wide mb-2 block">Footer / Contact Info</label>
                                  {editingFlyerIndex === idx ? (
                                    <textarea
                                      value={editedFlyerData.footer}
                                      onChange={(e) => setEditedFlyerData({ ...editedFlyerData, footer: e.target.value })}
                                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2979FF] resize-none"
                                      rows={2}
                                    />
                                  ) : (
                                    <div className="text-gray-400 text-sm whitespace-pre-line">{flyer.template.footer}</div>
                                  )}
                                </div>

                                {/* Edit Mode Actions */}
                                {editingFlyerIndex === idx && (
                                  <div className="flex gap-3 pt-4 border-t border-white/10">
                                    <button
                                      onClick={saveEditedFlyer}
                                      disabled={savingFlyer}
                                      className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {savingFlyer ? (
                                        <>
                                          <Loader2 size={16} className="animate-spin" />
                                          Saving...
                                        </>
                                      ) : (
                                        <>
                                          <Save size={16} />
                                          Save Changes
                                        </>
                                      )}
                                    </button>
                                    <button
                                      onClick={cancelEditingFlyer}
                                      disabled={savingFlyer}
                                      className="flex items-center gap-2 px-6 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50"
                                    >
                                      <X size={16} />
                                      Cancel
                                    </button>
                                  </div>
                                )}

                                {flyer.template.layoutNotes && (
                                  <div className="border-t border-white/10 pt-4 space-y-3">
                                    <div>
                                      <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Layout Notes</label>
                                      <p className="text-gray-500 text-xs">{flyer.template.layoutNotes}</p>
                                    </div>
                                    {flyer.template.colorNotes && (
                                      <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Color Usage</label>
                                        <p className="text-gray-500 text-xs">{flyer.template.colorNotes}</p>
                                      </div>
                                    )}
                                    {flyer.template.fontNotes && (
                                      <div>
                                        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Font Usage</label>
                                        <p className="text-gray-500 text-xs">{flyer.template.fontNotes}</p>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                                  </div>
                                </details>

                              <div className="flex flex-wrap gap-2 mt-4">
                                <a
                                  href={flyer.imageUrl}
                                  download={`${flyer.title.replace(/\s+/g, '-')}.png`}
                                  className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg text-sm font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2"
                                >
                                  <Download size={16} />
                                  Download PNG
                                </a>
                                <button
                                  onClick={() => window.open(flyer.canvaUrl, '_blank')}
                                  className="px-4 py-2 bg-[#00C4CC] text-white rounded-lg text-sm font-semibold hover:bg-[#00C4CC]/90 transition-colors flex items-center gap-2"
                                >
                                  <FileText size={16} />
                                  Edit in Canva
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
                                  {copiedIndex === idx ? 'Copied!' : 'Copy Text'}
                                </button>
                              </div>
                            </div>
                            ) : flyer.template ? (
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

                        <div className="mt-6 pt-6 border-t border-white/10">
                          <button
                            onClick={() => {
                              if (confirm('Generate new flyers? This will replace your current flyers.')) {
                                generateFlyers();
                              }
                            }}
                            disabled={generatingFlyers}
                            className="px-6 py-2 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <RefreshCw size={18} />
                            Regenerate All Flyers
                          </button>
                          {generatingFlyers && (
                            <div className="space-y-2 mt-4">
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
                        {data.message_templates.map((template: any, idx: number) => {
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
                        {data.ad_strategy.coreMessaging && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">1. Core Messaging</h4>
                            <div className="space-y-3">
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold uppercase">Headline</span>
                                <p className="text-white text-lg font-bold mt-1">{data.ad_strategy.coreMessaging.headline}</p>
                              </div>
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold uppercase">Sub-headline</span>
                                <p className="text-gray-300 text-sm mt-1">{data.ad_strategy.coreMessaging.subheadline}</p>
                              </div>
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold uppercase">Value Proposition</span>
                                <p className="text-gray-300 text-sm mt-1">{data.ad_strategy.coreMessaging.valueProposition}</p>
                              </div>
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold uppercase">Talking Points</span>
                                <ul className="list-disc list-inside text-gray-300 text-sm mt-2 space-y-1">
                                  {data.ad_strategy.coreMessaging.talkingPoints.map((point: string, idx: number) => (
                                    <li key={idx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Target Audience Summary */}
                        {data.ad_strategy.targetAudienceSummary && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">2. Target Audience Summary</h4>
                            <div className="space-y-2">
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold">Who: </span>
                                <span className="text-gray-300 text-sm">{data.ad_strategy.targetAudienceSummary.who}</span>
                              </div>
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold">What They Care About: </span>
                                <span className="text-gray-300 text-sm">{data.ad_strategy.targetAudienceSummary.whatTheyCareAbout}</span>
                              </div>
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold">What Motivates Them: </span>
                                <span className="text-gray-300 text-sm">{data.ad_strategy.targetAudienceSummary.whatMotivatesThem}</span>
                              </div>
                              <div>
                                <span className="text-[#2979FF] text-xs font-semibold">Where Online: </span>
                                <span className="text-gray-300 text-sm">{data.ad_strategy.targetAudienceSummary.whereTheyAreOnline}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Recommended Channels */}
                        {data.ad_strategy.recommendedChannels && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">3. Recommended Advertising Channels</h4>
                            <div className="space-y-2">
                              {data.ad_strategy.recommendedChannels.map((channel: any, idx: number) => (
                                <div key={idx} className="flex gap-2">
                                  <span className="text-[#06D6A0] font-semibold text-sm">•</span>
                                  <div>
                                    <span className="text-white font-semibold text-sm">{channel.name}</span>
                                    <span className="text-gray-400 text-sm"> – {channel.reason}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Channel Strategies */}
                        {data.ad_strategy.channelStrategies && data.ad_strategy.channelStrategies.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">4. Ad Strategy for Each Channel</h4>
                            <div className="space-y-4">
                              {data.ad_strategy.channelStrategies.map((strategy: any, idx: number) => (
                                <div key={idx} className="border-l-2 border-[#2979FF] pl-4">
                                  <h5 className="text-[#2979FF] font-bold text-sm mb-2">{strategy.channel}</h5>
                                  <div className="space-y-1 text-sm">
                                    <p><span className="text-gray-400">Goal:</span> <span className="text-gray-300">{strategy.goal}</span></p>
                                    <p><span className="text-gray-400">Target:</span> <span className="text-gray-300">{strategy.targeting}</span></p>
                                    <p><span className="text-gray-400">Format:</span> <span className="text-gray-300">{strategy.format}</span></p>
                                    <p><span className="text-gray-400">Message:</span> <span className="text-gray-300">{strategy.adContent}</span></p>
                                    {strategy.budgetRanges && (
                                      <p><span className="text-gray-400">Budget:</span> <span className="text-gray-300">Low: {strategy.budgetRanges.low}, Medium: {strategy.budgetRanges.medium}, High: {strategy.budgetRanges.high}</span></p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ad Concepts */}
                        {data.ad_strategy.adConcepts && data.ad_strategy.adConcepts.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">5. Ready-to-Use Ad Concepts</h4>
                            <div className="space-y-4">
                              {data.ad_strategy.adConcepts.map((concept: any, idx: number) => (
                                <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4">
                                  <h5 className="text-white font-bold mb-2">Ad Concept {idx + 1}</h5>
                                  <div className="space-y-2 text-sm">
                                    <p><span className="text-[#2979FF] font-semibold">Headline:</span> <span className="text-white">{concept.headline}</span></p>
                                    <p><span className="text-[#2979FF] font-semibold">Sub-headline:</span> <span className="text-gray-300">{concept.subheadline}</span></p>
                                    <p><span className="text-[#2979FF] font-semibold">Body:</span> <span className="text-gray-300">{concept.bodyCopy}</span></p>
                                    <p><span className="text-[#2979FF] font-semibold">CTA:</span> <span className="text-[#06D6A0]">{concept.cta}</span></p>
                                    <p><span className="text-[#2979FF] font-semibold">Image Idea:</span> <span className="text-gray-400 italic">{concept.imageIdea}</span></p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 30-Day Plan */}
                        {data.ad_strategy.thirtyDayPlan && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">6. 30-Day Advertising Plan</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {Object.entries(data.ad_strategy.thirtyDayPlan).map(([weekKey, weekData]: [string, any]) => (
                                <div key={weekKey} className="bg-white/5 border border-white/10 rounded-lg p-3">
                                  <h5 className="text-[#2979FF] font-bold text-sm mb-2">{weekData.title}</h5>
                                  <ul className="space-y-1">
                                    {weekData.steps.map((step: string, idx: number) => (
                                      <li key={idx} className="text-gray-300 text-xs flex gap-2">
                                        <span className="text-[#06D6A0]">✓</span>
                                        <span>{step}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hustle Now */}
                        {data.ad_strategy.hustleNow && data.ad_strategy.hustleNow.length > 0 && (
                          <div className="bg-gradient-to-r from-[#06D6A0]/20 to-[#2979FF]/20 border border-[#06D6A0]/30 rounded-lg p-4">
                            <h4 className="text-white font-semibold mb-3">7. Hustle Now — Quick Ways to Grow Today</h4>
                            <div className="space-y-3">
                              {data.ad_strategy.hustleNow.map((hustle: any, idx: number) => (
                                <div key={idx} className="bg-[#0A192F]/50 border border-white/10 rounded-lg p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <h5 className="text-[#06D6A0] font-bold text-sm">{hustle.title}</h5>
                                    <div className="text-xs text-gray-400 flex gap-2">
                                      <span>{hustle.estimatedTime}</span>
                                      <span>•</span>
                                      <span>{hustle.cost}</span>
                                    </div>
                                  </div>
                                  <p className="text-gray-300 text-xs mb-2">{hustle.description}</p>
                                  <div className="space-y-1">
                                    {hustle.steps.map((step: string, stepIdx: number) => (
                                      <div key={stepIdx} className="flex gap-2 text-xs text-gray-400">
                                        <span className="text-[#2979FF] font-semibold">{stepIdx + 1}.</span>
                                        <span>{step}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
                    <button
                      onClick={() => {
                        console.log('ideaKey:', ideaKey);
                        if (!ideaKey) {
                          alert('No idea key found. Please go back to dashboard and select your business idea again.');
                          return;
                        }
                        navigate(`/build-site?ideaKey=${ideaKey}`);
                      }}
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
