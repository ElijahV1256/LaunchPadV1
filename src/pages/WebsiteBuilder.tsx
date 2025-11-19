import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Loader2,
  CheckCircle2,
  Circle,
  Globe,
  Eye,
  Edit3,
  Link as LinkIcon,
  CreditCard,
  Sparkles,
  X,
  Download,
  Copy
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
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [paymentLink, setPaymentLink] = useState('');
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
      alert('Design preferences saved! We will use these to create your website.');
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

  const generatePreview = async () => {
    if (!data || !brandData) return;

    console.log('Generating preview for website:', data.id);
    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/preview-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteId: data.id,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate preview');
      }

      const result = await response.json();
      setPreviewHtml(result.html);

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('preview')) {
        newCompletedSteps.push('preview');
      }

      await supabase
        .from('websites')
        .update({
          theme: { colors: brandData.brand_colors },
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, theme: { colors: brandData.brand_colors }, completed_steps: newCompletedSteps });
      setCurrentStep(3);
    } catch (err: any) {
      console.error('Error generating preview:', err);
      alert(err.message || 'Failed to generate preview');
    } finally {
      setGenerating(false);
    }
  };

  const savePaymentLink = async () => {
    if (!data) return;

    try {
      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('payment')) {
        newCompletedSteps.push('payment');
      }

      await supabase
        .from('websites')
        .update({
          payment_link: paymentLink,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, payment_link: paymentLink, completed_steps: newCompletedSteps });
      setCurrentStep(4);
    } catch (err) {
      console.error('Error saving payment link:', err);
      alert('Failed to save payment link');
    }
  };

  const setWebsiteSubdomain = async () => {
    if (!data || !subdomain) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/set-website-subdomain`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteId: data.id,
            subdomain,
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to set subdomain');
      }

      const result = await response.json();

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('subdomain')) {
        newCompletedSteps.push('subdomain');
      }

      await supabase
        .from('websites')
        .update({
          subdomain: result.subdomain,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, subdomain: result.subdomain, completed_steps: newCompletedSteps });
      setCurrentStep(5);
    } catch (err: any) {
      console.error('Error setting subdomain:', err);
      alert(err.message || 'Failed to set subdomain');
    }
  };

  const publishWebsite = async () => {
    if (!data) return;

    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/publish-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            websiteId: data.id,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to publish website');

      const result = await response.json();

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('published')) {
        newCompletedSteps.push('published');
      }

      await supabase
        .from('websites')
        .update({
          published_url: result.url,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, published_url: result.url, completed_steps: newCompletedSteps });
    } catch (err) {
      console.error('Error publishing website:', err);
      alert('Failed to publish website');
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

  const steps = [
    { id: 1, name: 'Generate Copy', key: 'copy' },
    { id: 2, name: 'Preview Website', key: 'preview' },
    { id: 3, name: 'Add Payment', key: 'payment' },
    { id: 4, name: 'Set Subdomain', key: 'subdomain' },
    { id: 5, name: 'Publish', key: 'published' },
  ];

  const isStepComplete = (stepKey: string) => data.completed_steps.includes(stepKey);
  const allStepsComplete = steps.every(step => isStepComplete(step.key));

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
            <h1 className="text-4xl font-bold text-white mb-2">Website Builder</h1>
            <p className="text-gray-400">Create and publish your one-page website for {brandData.selected_name}</p>
          </div>

          <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
            {steps.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  currentStep === step.id
                    ? 'bg-[#2979FF] text-white'
                    : isStepComplete(step.key)
                    ? 'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {isStepComplete(step.key) ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Circle size={18} />
                )}
                {step.name}
              </button>
            ))}
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Step 1: Generate Website Copy</h2>
                <p className="text-gray-400 mb-6">
                  AI will create conversion-optimized copy including hero section, benefits, pricing, testimonials, and FAQs.
                </p>
                {!isStepComplete('copy') ? (
                  <div className="space-y-4">
                    {!data.design_preferences && (
                      <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-4 mb-4">
                        <p className="text-gray-300 mb-3">
                          Want a custom website design? Answer a few questions to help us create the perfect style for your brand.
                        </p>
                        <button
                          onClick={() => setShowDesignQuestionnaire(true)}
                          className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                          Set Design Preferences
                        </button>
                      </div>
                    )}
                    {data.design_preferences && (
                      <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4 mb-4 flex items-start justify-between">
                        <div>
                          <p className="text-[#06D6A0] font-semibold mb-1">Design preferences set!</p>
                          <p className="text-gray-400 text-sm">We'll use your preferences to create a custom design.</p>
                        </div>
                        <button
                          onClick={() => setShowDesignQuestionnaire(true)}
                          className="text-sm text-gray-400 hover:text-white"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                    <button
                      onClick={generateCopy}
                      disabled={generating}
                      className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 disabled:opacity-50"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="animate-spin" size={20} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} />
                          Generate Copy
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
                      <div className="space-y-4 text-gray-300">
                        <div>
                          <h3 className="font-bold text-white mb-2">Hero Headline:</h3>
                          <p>{data.copy.hero_headline}</p>
                        </div>
                        <div>
                          <h3 className="font-bold text-white mb-2">Subheadline:</h3>
                          <p>{data.copy.hero_subheadline}</p>
                        </div>
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

                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-6 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
                    >
                      Next: Preview Website →
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Step 2: Preview Your Website</h2>
                <p className="text-gray-400 mb-6">
                  See a live preview of your website with your brand colors and copy.
                </p>
                {!isStepComplete('preview') ? (
                  <button
                    onClick={generatePreview}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Generating Preview...
                      </>
                    ) : (
                      <>
                        <Eye size={20} />
                        Generate Preview
                      </>
                    )}
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-[#06D6A0] mb-4">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">Preview Ready!</span>
                    </div>
                    {previewHtml && (
                      <div className="mb-6 border border-white/20 rounded-lg overflow-hidden">
                        <iframe
                          srcDoc={previewHtml}
                          className="w-full h-96 bg-white"
                          title="Website Preview"
                        />
                      </div>
                    )}

                    <div className="mb-6 bg-white/5 border border-white/10 rounded-lg p-4">
                      <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                        <Globe size={20} />
                        Prefer Wix?
                      </h3>
                      <p className="text-gray-400 text-sm mb-4">
                        Take your content to Wix and build your site there instead
                      </p>
                      <div className="flex gap-3">
                        <a
                          href="https://www.wix.com/html5us/hiker-new-user?utm_source=affiliate&experiment_id=editor_adi"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                        >
                          <Globe size={18} />
                          Create on Wix
                        </a>
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
                              Copy Content
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
                    >
                      Next: Add Payment →
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Step 3: Add Payment Link</h2>
                <p className="text-gray-400 mb-6">
                  Add your Stripe payment link or booking/contact URL.
                </p>
                {!isStepComplete('payment') ? (
                  <div>
                    <input
                      type="url"
                      value={paymentLink}
                      onChange={(e) => setPaymentLink(e.target.value)}
                      placeholder="https://buy.stripe.com/... or your booking link"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white mb-4"
                    />
                    <button
                      onClick={savePaymentLink}
                      disabled={!paymentLink}
                      className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 disabled:opacity-50"
                    >
                      <CreditCard size={20} />
                      Save Payment Link
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-[#06D6A0] mb-4">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">Payment Link Added!</span>
                    </div>
                    <p className="text-gray-400 mb-6">{data.payment_link}</p>
                    <button
                      onClick={() => setCurrentStep(4)}
                      className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
                    >
                      Next: Set Subdomain →
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Step 4: Choose Your Subdomain</h2>
                <p className="text-gray-400 mb-6">
                  Pick a unique subdomain for your website (e.g., sunset-dog-walks.launchpadai.com)
                </p>
                {!isStepComplete('subdomain') ? (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <input
                        type="text"
                        value={subdomain}
                        onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        placeholder="your-business-name"
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white"
                      />
                      <span className="text-gray-400">.launchpadai.com</span>
                    </div>
                    <button
                      onClick={setWebsiteSubdomain}
                      disabled={!subdomain}
                      className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 disabled:opacity-50"
                    >
                      <LinkIcon size={20} />
                      Reserve Subdomain
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-[#06D6A0] mb-4">
                      <CheckCircle2 size={24} />
                      <span className="font-bold">Subdomain Reserved!</span>
                    </div>
                    <p className="text-gray-400 mb-6">{data.subdomain}.launchpadai.com</p>
                    <button
                      onClick={() => setCurrentStep(5)}
                      className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
                    >
                      Next: Publish Website →
                    </button>
                  </div>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Step 5: Publish Your Website</h2>
                <p className="text-gray-400 mb-6">
                  Ready to go live? Click publish to make your website available to the world!
                </p>
                {!isStepComplete('published') ? (
                  <button
                    onClick={publishWebsite}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90 disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Globe size={20} />
                        Publish Website
                      </>
                    )}
                  </button>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 text-[#06D6A0] mb-4">
                      <CheckCircle2 size={24} />
                      <span className="font-bold text-2xl">Website Published!</span>
                    </div>
                    <p className="text-gray-400 mb-4">Your website is now live at:</p>
                    <a
                      href={data.published_url || ''}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 mb-6"
                    >
                      Visit Your Website →
                    </a>
                    <div className="mt-8">
                      <button
                        onClick={() => navigate(`/operations?ideaKey=${ideaKey}`)}
                        className="px-6 py-3 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90"
                      >
                        Continue to Operations →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDesignQuestionnaire && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0F2847] border border-white/10 rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Website Design Preferences</h2>
              <button
                onClick={() => setShowDesignQuestionnaire(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-white mb-2">What does your business do?</label>
                <textarea
                  value={designAnswers.businessDescription}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, businessDescription: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                  rows={3}
                  placeholder="Describe your business and what makes it unique..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Who is your target audience?</label>
                <input
                  type="text"
                  value={designAnswers.targetAudience}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, targetAudience: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                  placeholder="e.g., Small business owners, millennials, tech enthusiasts..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">What personality should your brand have?</label>
                <input
                  type="text"
                  value={designAnswers.brandPersonality}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, brandPersonality: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                  placeholder="e.g., Professional, fun, trustworthy, innovative..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">What industry are you in?</label>
                <input
                  type="text"
                  value={designAnswers.industry}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, industry: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                  placeholder="e.g., Technology, healthcare, education, retail..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">What design style do you prefer?</label>
                <input
                  type="text"
                  value={designAnswers.preferredStyle}
                  onChange={(e) => setDesignAnswers({ ...designAnswers, preferredStyle: e.target.value })}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                  placeholder="e.g., Modern and minimalist, bold and colorful, clean and professional..."
                />
              </div>

              <div>
                <label className="block text-white mb-2">Example Websites (Optional)</label>
                <p className="text-gray-400 text-sm mb-3">
                  Provide up to 3 example website URLs that you like for style inspiration.
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
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] text-sm"
                      placeholder={`Example website ${idx + 1} (e.g., https://example.com)`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={saveDesignPreferences}
                  className="flex-1 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
                >
                  Save Preferences
                </button>
                <button
                  onClick={() => setShowDesignQuestionnaire(false)}
                  className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10"
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
