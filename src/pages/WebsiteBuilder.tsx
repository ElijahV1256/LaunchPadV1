import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Loader2,
  CheckCircle2,
  Sparkles,
  X,
  Download,
  Copy,
  Globe
} from 'lucide-react';
import { formatForWix, downloadWixExport, copyToClipboard } from '../utils/wixExport';

interface WebsiteData {
  id: string;
  user_id: string;
  idea_key: string;
  copy: {
    hero_headline: string;
    hero_subheadline: string;
    benefits: string[];
    offer_section: string;
    pricing: string;
    testimonials: any[];
    faqs: any[];
  } | null;
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
  } | null;
  design_preferences?: {
    businessDescription: string;
    targetAudience: string;
    brandPersonality: string;
    industry: string;
    preferredStyle: string;
    exampleWebsites?: string[];
  } | null;
  subdomain: string | null;
  payment_link: string | null;
  published_url: string | null;
  completed_steps: string[];
}

interface BrandData {
  selected_name: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export default function WebsiteBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const ideaKey = searchParams.get('ideaKey') || '';

  const [data, setData] = useState<WebsiteData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showDesignQuestionnaire, setShowDesignQuestionnaire] = useState(false);
  const [designAnswers, setDesignAnswers] = useState({
    businessDescription: '',
    targetAudience: '',
    brandPersonality: '',
    industry: '',
    preferredStyle: '',
    exampleWebsites: ['', '', ''],
  });
  const [wixCopied, setWixCopied] = useState(false);
  const [showContentQuestionnaire, setShowContentQuestionnaire] = useState(false);
  const [contentAnswers, setContentAnswers] = useState({
    whatYouOffer: '',
    whoYouHelp: '',
    mainProblemSolved: '',
    keyBenefits: '',
    whatMakesYouDifferent: '',
    pricing: '',
  });

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }
    if (!ideaKey) {
      setError('No idea selected. Please select a business idea first.');
      setLoading(false);
      return;
    }
    loadData();
  }, [currentUser, ideaKey]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: brand, error: brandError } = await supabase
        .from('brand_identity')
        .select('selected_name, brand_colors')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (brandError) {
        console.error('Brand error:', brandError);
        throw new Error('Failed to load brand data');
      }

      if (!brand) {
        setError('Please complete Brand Identity first');
        setLoading(false);
        return;
      }

      setBrandData(brand);

      let { data: websiteData, error: websiteError } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (websiteError) throw websiteError;

      if (!websiteData) {
        const { data: newData, error: insertError } = await supabase
          .from('websites')
          .insert({
            user_id: user.id,
            idea_key: ideaKey,
            copy: null,
            theme: null,
            subdomain: null,
            payment_link: null,
            published_url: null,
            completed_steps: [],
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            const { data: existingData } = await supabase
              .from('websites')
              .select('*')
              .eq('user_id', user.id)
              .eq('idea_key', ideaKey)
              .maybeSingle();
            websiteData = existingData;
          } else {
            throw insertError;
          }
        } else {
          websiteData = newData;
        }
      }

      setData(websiteData);

      if (websiteData.design_preferences) {
        setDesignAnswers(websiteData.design_preferences);
      }

      if (websiteData.completed_steps.includes('preview')) {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/preview-website`,
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              websiteId: websiteData.id,
              apiKey: import.meta.env.VITE_OPENAI_API_KEY,
            }),
          }
        );

        if (response.ok) {
          const result = await response.json();
          setPreviewHtml(result.html);
        }
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const saveDesignPreferences = async () => {
    if (!data) return;

    try {
      await supabase
        .from('websites')
        .update({
          design_preferences: designAnswers,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, design_preferences: designAnswers });
      setShowDesignQuestionnaire(false);
      alert("Perfect! Your style preferences are saved. We'll use these to create a website that matches your vision.");
    } catch (err: any) {
      console.error('Error saving design preferences:', err);
      alert('Failed to save design preferences');
    }
  };

  const generateCopy = async () => {
    console.log('generateCopy called', { brandData, data });

    if (!brandData || !data) {
      alert('Missing data: ' + (!brandData ? 'Brand data not loaded' : 'Website data not loaded'));
      return;
    }

    setGenerating(true);
    try {
      console.log('Calling generate-website-copy with:', {
        businessName: brandData.selected_name,
        ideaKey,
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-website-copy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: brandData.selected_name,
            ideaKey,
            designPreferences: data.design_preferences,
            contentAnswers: contentAnswers,
            brandData: brandData,
            apiKey: import.meta.env.VITE_OPENAI_API_KEY,
          }),
        }
      );

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to generate copy');
      }

      const result = await response.json();
      console.log('Generated copy:', result);

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('copy')) {
        newCompletedSteps.push('copy');
      }

      await supabase
        .from('websites')
        .update({
          copy: result.copy,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, copy: result.copy, completed_steps: newCompletedSteps });
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Error generating copy:', err);
      alert(err.message || 'Failed to generate website copy');
    } finally {
      setGenerating(false);
    }
  };

  const handleWixExport = () => {
    if (!data?.copy || !brandData) return;

    const wixContent = formatForWix(data.copy, brandData);
    downloadWixExport(wixContent, brandData.selected_name);
  };

  const handleWixCopy = async () => {
    if (!data?.copy || !brandData) return;

    const wixContent = formatForWix(data.copy, brandData);
    await copyToClipboard(wixContent);
    setWixCopied(true);
    setTimeout(() => setWixCopied(false), 2000);
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
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
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
        <div className="text-center">
          <p className="text-gray-400 mb-4">Unable to load website builder data</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isStepComplete = (stepKey: string) => data.completed_steps.includes(stepKey);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Home size={20} />
          <span>Dashboard</span>
        </button>
      </nav>

      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Landing Page Copy Generator</h1>
            <p className="text-gray-400">Generate professional landing page copy for {brandData.selected_name}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Create Your Landing Page Content</h2>
                <p className="text-gray-400 mb-6">
                  We'll craft professional copy for your entire one-page site — headlines, features, pricing, testimonials, and FAQs — all in your brand voice.
                </p>
                {!isStepComplete('copy') ? (
                  <div className="space-y-6">
                    {!data.design_preferences && (
                      <div className="bg-gradient-to-r from-[#2979FF]/10 to-[#06D6A0]/10 border border-[#2979FF]/20 rounded-lg p-6">
                        <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                          <Sparkles size={18} className="text-[#2979FF]" />
                          Get a Custom Design
                        </h3>
                        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                          Tell us about your style preferences and share 3 websites you love. We'll analyze them and create a site that matches your vision perfectly.
                        </p>
                        <button
                          onClick={() => setShowDesignQuestionnaire(true)}
                          className="px-5 py-2.5 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 transition-all font-medium"
                        >
                          Customize Your Design
                        </button>
                      </div>
                    )}
                    {data.design_preferences && (
                      <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-5 flex items-start justify-between">
                        <div>
                          <p className="text-[#06D6A0] font-semibold mb-1 flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Design Preferences Saved
                          </p>
                          <p className="text-gray-400 text-sm">Your custom style will be applied to the website.</p>
                        </div>
                        <button
                          onClick={() => setShowDesignQuestionnaire(true)}
                          className="text-sm text-gray-400 hover:text-white underline"
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {/* Content Questionnaire */}
                    <div className="bg-gradient-to-r from-[#06D6A0]/10 to-[#2979FF]/10 border border-[#06D6A0]/20 rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <MessageSquare size={18} className="text-[#06D6A0]" />
                        Customize Your Website Content
                      </h3>
                      <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                        Answer these questions to help us create tailored content for your website. The more details you provide, the better your website copy will be.
                      </p>
                      {!showContentQuestionnaire ? (
                        <button
                          onClick={() => setShowContentQuestionnaire(true)}
                          className="px-5 py-2.5 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90 transition-all font-medium"
                        >
                          Answer Questions
                        </button>
                      ) : (
                        <div className="space-y-4 mt-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              What do you offer? (Services/Products)
                            </label>
                            <textarea
                              value={contentAnswers.whatYouOffer}
                              onChange={(e) => setContentAnswers({ ...contentAnswers, whatYouOffer: e.target.value })}
                              placeholder="E.g., Professional lawn care services including mowing, edging, and seasonal cleanups"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] resize-none"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Who do you help? (Target audience)
                            </label>
                            <input
                              type="text"
                              value={contentAnswers.whoYouHelp}
                              onChange={(e) => setContentAnswers({ ...contentAnswers, whoYouHelp: e.target.value })}
                              placeholder="E.g., Busy homeowners in suburban neighborhoods"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              What problem do you solve?
                            </label>
                            <textarea
                              value={contentAnswers.mainProblemSolved}
                              onChange={(e) => setContentAnswers({ ...contentAnswers, mainProblemSolved: e.target.value })}
                              placeholder="E.g., Homeowners don't have time or energy to maintain their lawns"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] resize-none"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Key benefits or features? (3-4 items)
                            </label>
                            <textarea
                              value={contentAnswers.keyBenefits}
                              onChange={(e) => setContentAnswers({ ...contentAnswers, keyBenefits: e.target.value })}
                              placeholder="E.g., Weekly service, professional equipment, satisfaction guaranteed, eco-friendly products"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] resize-none"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              What makes you different from competitors?
                            </label>
                            <textarea
                              value={contentAnswers.whatMakesYouDifferent}
                              onChange={(e) => setContentAnswers({ ...contentAnswers, whatMakesYouDifferent: e.target.value })}
                              placeholder="E.g., 20 years experience, locally owned, same-day service available"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] resize-none"
                              rows={2}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Pricing information (optional)
                            </label>
                            <input
                              type="text"
                              value={contentAnswers.pricing}
                              onChange={(e) => setContentAnswers({ ...contentAnswers, pricing: e.target.value })}
                              placeholder="E.g., Starting at $50/week, Free estimates, or leave blank"
                              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#06D6A0]"
                            />
                          </div>

                          <div className="flex gap-3 pt-2">
                            <button
                              onClick={() => setShowContentQuestionnaire(false)}
                              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                            >
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={generateCopy}
                      disabled={generating}
                      className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 disabled:opacity-50 transition-all font-semibold"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Creating Your Content...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Generate Website Content
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-[#06D6A0] mb-4">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">Copy Generated!</span>
                    </div>
                    {data.copy && (
                      <div className="space-y-6 text-gray-300">
                        {/* Hero Section */}
                        <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                          <h3 className="font-bold text-white mb-4 text-lg">Hero Section</h3>
                          <div className="space-y-3">
                            <div>
                              <label className="text-xs text-gray-400 uppercase tracking-wide">Headline</label>
                              <p className="text-white font-semibold text-xl mt-1">{data.copy.hero_headline}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-400 uppercase tracking-wide">Subheadline</label>
                              <p className="text-gray-300 mt-1">{data.copy.hero_subheadline}</p>
                            </div>
                            <div className="flex gap-3 mt-4">
                              <div className="px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold">
                                {data.copy.hero_cta_primary}
                              </div>
                              {data.copy.hero_cta_secondary && (
                                <div className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-semibold">
                                  {data.copy.hero_cta_secondary}
                                </div>
                              )}
                            </div>
                            {data.copy.hero_image_description && (
                              <div className="mt-3 pt-3 border-t border-white/10">
                                <label className="text-xs text-gray-400 uppercase tracking-wide">Image Description</label>
                                <p className="text-gray-500 text-sm mt-1">{data.copy.hero_image_description}</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* About Section */}
                        {data.copy.about_text && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                            <h3 className="font-bold text-white mb-3 text-lg">About</h3>
                            <p className="text-gray-300 leading-relaxed">{data.copy.about_text}</p>
                          </div>
                        )}

                        {/* Features */}
                        {data.copy.features && data.copy.features.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                            <h3 className="font-bold text-white mb-4 text-lg">Features / Services</h3>
                            <div className="grid gap-4">
                              {data.copy.features.map((feature: any, idx: number) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-4">
                                  <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                                  <p className="text-gray-400 text-sm">{feature.description}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Value Proposition */}
                        {data.copy.value_benefits && data.copy.value_benefits.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                            <h3 className="font-bold text-white mb-3 text-lg">Why Choose Us</h3>
                            {data.copy.value_proposition && (
                              <p className="text-gray-300 mb-4">{data.copy.value_proposition}</p>
                            )}
                            <ul className="space-y-2">
                              {data.copy.value_benefits.map((benefit: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300">
                                  <span className="text-[#06D6A0] mt-1">✓</span>
                                  <span>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Testimonials */}
                        {data.copy.testimonials && data.copy.testimonials.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                            <h3 className="font-bold text-white mb-4 text-lg">Testimonials / Social Proof</h3>
                            <div className="space-y-3">
                              {data.copy.testimonials.map((testimonial: any, idx: number) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-4">
                                  <p className="text-gray-300 italic mb-2">"{testimonial.text}"</p>
                                  <p className="text-sm text-gray-400">
                                    — {testimonial.name}
                                    {testimonial.role && <span className="text-gray-500">, {testimonial.role}</span>}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Pricing */}
                        {data.copy.pricing_tiers && data.copy.pricing_tiers.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                            <h3 className="font-bold text-white mb-4 text-lg">Pricing</h3>
                            <div className="grid gap-4">
                              {data.copy.pricing_tiers.map((tier: any, idx: number) => (
                                <div key={idx} className="bg-white/5 rounded-lg p-4">
                                  <h4 className="text-white font-semibold text-lg">{tier.name}</h4>
                                  <p className="text-[#2979FF] font-bold text-2xl my-2">{tier.price}</p>
                                  <p className="text-gray-400 text-sm mb-3">{tier.description}</p>
                                  <ul className="space-y-1 mb-4">
                                    {tier.features?.map((feature: string, fIdx: number) => (
                                      <li key={fIdx} className="text-gray-300 text-sm flex items-start gap-2">
                                        <span className="text-[#06D6A0]">✓</span>
                                        <span>{feature}</span>
                                      </li>
                                    ))}
                                  </ul>
                                  <div className="px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold text-center">
                                    {tier.cta}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* FAQs */}
                        {data.copy.faqs && data.copy.faqs.length > 0 && (
                          <div className="bg-white/5 border border-white/10 rounded-lg p-5">
                            <h3 className="font-bold text-white mb-4 text-lg">FAQs</h3>
                            <div className="space-y-4">
                              {data.copy.faqs.map((faq: any, idx: number) => (
                                <div key={idx}>
                                  <h4 className="text-white font-semibold mb-1">{faq.question}</h4>
                                  <p className="text-gray-400 text-sm">{faq.answer}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Footer CTA */}
                        {data.copy.footer_message && (
                          <div className="bg-gradient-to-r from-[#2979FF]/10 to-[#06D6A0]/10 border border-[#2979FF]/30 rounded-lg p-6 text-center">
                            <p className="text-white text-lg mb-4">{data.copy.footer_message}</p>
                            <div className="px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold inline-block">
                              {data.copy.footer_cta}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="mt-6 bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <Globe size={20} />
                        Export to Wix
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Want to use Wix instead? Download your content formatted for easy import into Wix.com
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={handleWixExport}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <Download size={18} />
                          Download for Wix
                        </button>
                        <button
                          onClick={handleWixCopy}
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                          {wixCopied ? (
                            <>
                              <CheckCircle2 size={18} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={18} />
                              Copy to Clipboard
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
          </div>
        </div>
      </div>

      {showDesignQuestionnaire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F2847] border border-white/10 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Tell Us About Your Style</h2>
                <p className="text-gray-400 text-sm">Help us create a website that feels uniquely yours</p>
              </div>
              <button
                onClick={() => setShowDesignQuestionnaire(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">What does your business do?</label>
                <p className="text-gray-400 text-sm mb-2">Give us the quick version — what makes you special?</p>
                <textarea
                  value={designAnswers.businessDescription}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, businessDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors"
                  rows={3}
                  placeholder="We help local businesses get online with beautiful, simple websites..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Who are you trying to reach?</label>
                <input
                  type="text"
                  value={designAnswers.targetAudience}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors"
                  placeholder="Young professionals in their 30s, families with kids, freelancers..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">How should your brand feel?</label>
                <p className="text-gray-400 text-sm mb-2">Pick a few words that capture your vibe</p>
                <input
                  type="text"
                  value={designAnswers.brandPersonality}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, brandPersonality: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors"
                  placeholder="Friendly and approachable, professional but not stuffy, energetic..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">What industry are you in?</label>
                <input
                  type="text"
                  value={designAnswers.industry}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors"
                  placeholder="Coffee & food, wellness & fitness, tech services, creative..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">What design style speaks to you?</label>
                <p className="text-gray-400 text-sm mb-2">Think about websites or brands you admire</p>
                <input
                  type="text"
                  value={designAnswers.preferredStyle}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, preferredStyle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] transition-colors"
                  placeholder="Clean and modern, bold with bright colors, minimalist and elegant..."
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Show Us Some Inspiration</label>
                <p className="text-gray-400 text-sm mb-3">
                  Share up to 3 websites you love. We'll study their style and blend it with your brand.
                </p>
                <div className="space-y-2">
                  {designAnswers.exampleWebsites.map((url, idx) => (
                    <input
                      key={idx}
                      type="url"
                      value={url}
                      onChange={(e) => {
                        const newExamples = [...designAnswers.exampleWebsites];
                        newExamples[idx] = e.target.value;
                        setDesignAnswers({ ...designAnswers, exampleWebsites: newExamples });
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] text-sm transition-colors"
                      placeholder={idx === 0 ? "https://yourfavorite.com" : idx === 1 ? "https://another-you-like.com" : "https://one-more.com"}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={saveDesignPreferences}
                  className="flex-1 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 font-semibold transition-all"
                >
                  Save My Preferences
                </button>
                <button
                  onClick={() => setShowDesignQuestionnaire(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
