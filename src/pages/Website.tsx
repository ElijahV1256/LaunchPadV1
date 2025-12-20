import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Loader2,
  Sparkles,
  Crown,
  Download,
  Copy,
  RefreshCw,
  CheckCircle2,
  Clock,
  FileText,
  X,
  ArrowLeft,
  Settings,
} from 'lucide-react';
import RocketGame from '../components/RocketGame';
import WebsiteEditor from '../components/WebsiteEditor';
import WebsiteQuestionnaire from '../components/WebsiteQuestionnaire';

interface BusinessPackage {
  businessName: string;
  businessIdea: string;
  offer: string;
  targetCustomer: string;
  tone: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logoUrl: string;
  images: string[];
  socialLinks: Record<string, string>;
  location: string;
  contact: {
    email: string;
    phone: string;
  };
  tagline?: string;
  notes?: string;
}

interface StarterWebsite {
  id: string;
  user_id: string;
  idea_key: string;
  business_package: BusinessPackage;
  home_html: string | null;
  shop_html: string | null;
  created_at: string;
  updated_at: string;
}

interface ProWebsiteRequest {
  id: string;
  user_id: string;
  idea_key: string;
  business_package: BusinessPackage;
  status: 'submitted' | 'paid' | 'assigned' | 'in_progress' | 'delivered';
  price: number;
  notes: string | null;
  deliverables_url: string | null;
  created_at: string;
  updated_at: string;
}

interface BrandData {
  selected_name: string;
  selected_tagline: string | null;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo_data?: {
    selected?: {
      imageUrl: string;
    };
    uploaded_logo_url?: string;
  };
  offer_description?: string;
  target_audience?: string;
}

interface BusinessIdea {
  name: string;
  description: string;
}

export default function Website() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [businessIdea, setBusinessIdea] = useState<BusinessIdea | null>(null);
  const [starterWebsite, setStarterWebsite] = useState<StarterWebsite | null>(null);
  const [proRequest, setProRequest] = useState<ProWebsiteRequest | null>(null);

  const [view, setView] = useState<'selection' | 'starter' | 'pro' | 'pro-status'>('selection');
  const [generating, setGenerating] = useState(false);
  const [generatingProgress, setGeneratingProgress] = useState(0);
  const [generatingStage, setGeneratingStage] = useState('');
  const [gameMinimized, setGameMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'shop'>('home');
  const [showProForm, setShowProForm] = useState(false);
  const [proNotes, setProNotes] = useState('');
  const [submittingPro, setSubmittingPro] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [setupData, setSetupData] = useState<any>(null);

  useEffect(() => {
    if (!currentUser || !ideaKey) {
      navigate('/dashboard');
      return;
    }
    loadData();
  }, [currentUser, ideaKey]);

  useEffect(() => {
    const shouldShowSetup = searchParams.get('setup') === 'true';
    if (shouldShowSetup && !starterWebsite?.home_html && view === 'selection') {
      setShowQuestionnaire(true);
    }
  }, [searchParams, starterWebsite, view]);

  const loadData = async () => {
    try {
      const [brandResult, ideaResult, starterResult, proResult, setupResult] = await Promise.all([
        supabase
          .from('brand_identity')
          .select('selected_name, selected_tagline, brand_colors, logo_data, offer_description, target_audience')
          .eq('user_id', currentUser!.id)
          .eq('idea_key', ideaKey)
          .maybeSingle(),
        supabase
          .from('business_ideas')
          .select('name, description')
          .eq('user_id', currentUser!.id)
          .eq('idea_id', ideaKey)
          .maybeSingle(),
        supabase
          .from('starter_websites')
          .select('*')
          .eq('user_id', currentUser!.id)
          .eq('idea_key', ideaKey)
          .maybeSingle(),
        supabase
          .from('pro_website_requests')
          .select('*')
          .eq('user_id', currentUser!.id)
          .eq('idea_key', ideaKey)
          .maybeSingle(),
        supabase
          .from('website_setup')
          .select('*')
          .eq('user_id', currentUser!.id)
          .eq('idea_key', ideaKey)
          .maybeSingle(),
      ]);

      if (brandResult.error) throw brandResult.error;
      if (!brandResult.data?.selected_name) {
        setError('Please complete Brand Identity first');
        return;
      }

      setBrandData(brandResult.data);
      setBusinessIdea(ideaResult.data);
      setStarterWebsite(starterResult.data);
      setProRequest(proResult.data);
      setSetupData(setupResult.data);

      if (starterResult.data?.home_html) {
        setView('starter');
      } else if (proResult.data) {
        setView('pro-status');
      }
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const buildBusinessPackage = (): BusinessPackage => {
    const logoUrl = brandData?.logo_data?.uploaded_logo_url || brandData?.logo_data?.selected?.imageUrl || '';

    const basePackage = {
      businessName: brandData?.selected_name || '',
      businessIdea: businessIdea?.description || '',
      offer: brandData?.offer_description || businessIdea?.name || '',
      targetCustomer: brandData?.target_audience || '',
      tone: 'friendly',
      brandColors: {
        primary: brandData?.brand_colors?.primary || '#2979FF',
        secondary: brandData?.brand_colors?.secondary || '#0A192F',
        accent: brandData?.brand_colors?.accent || '#06D6A0',
      },
      fonts: {
        heading: 'Montserrat',
        body: 'Inter',
      },
      logoUrl,
      images: setupData?.product_images || [],
      socialLinks: setupData?.social_links || {},
      location: setupData?.contact_info?.address || '',
      contact: {
        email: setupData?.contact_info?.email || currentUser?.email || '',
        phone: setupData?.contact_info?.phone || '',
      },
      tagline: brandData?.selected_tagline || '',
      checkoutUrl: setupData?.stripe_info?.checkoutUrl || '#',
      notes: '',
    };

    if (setupData?.business_info?.hours) {
      basePackage.notes = `Business Hours: ${setupData.business_info.hours}`;
    }

    return basePackage;
  };

  const handleQuestionnaireComplete = async (data: any) => {
    if (!currentUser || !ideaKey) return;

    try {
      await supabase.from('website_setup').upsert({
        user_id: currentUser.id,
        idea_key: ideaKey,
        contact_info: data.contact,
        social_links: data.social,
        business_info: data.business,
        stripe_info: data.stripe,
        product_images: data.productImages,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,idea_key',
      });

      setSetupData({
        contact_info: data.contact,
        social_links: data.social,
        business_info: data.business,
        stripe_info: data.stripe,
        product_images: data.productImages,
      });

      setShowQuestionnaire(false);
      await generateStarterWebsite();
    } catch (err: any) {
      console.error('Error saving setup:', err);
      alert(err.message || 'Failed to save setup data');
    }
  };

  const handleGenerateClick = () => {
    if (setupData) {
      generateStarterWebsite();
    } else {
      setShowQuestionnaire(true);
    }
  };

  const generateStarterWebsite = async () => {
    if (!currentUser || !ideaKey || !brandData) return;

    setGenerating(true);
    setGameMinimized(false);
    setGeneratingProgress(0);
    setGeneratingStage('Igniting engines...');

    const stages = [
      { progress: 8, stage: 'Igniting engines...' },
      { progress: 18, stage: 'Systems check complete...' },
      { progress: 32, stage: 'Analyzing your brand...' },
      { progress: 48, stage: 'Designing home page...' },
      { progress: 65, stage: 'Building shop page...' },
      { progress: 78, stage: 'Adding final polish...' },
      { progress: 88, stage: 'Almost there...' },
    ];

    let stageIndex = 0;
    const progressInterval = setInterval(() => {
      setGeneratingProgress(prev => {
        if (stageIndex < stages.length) {
          const targetProgress = stages[stageIndex].progress;
          if (prev >= targetProgress - 1) {
            setGeneratingStage(stages[stageIndex].stage);
            stageIndex++;
          }
          return Math.min(prev + 0.5, 88);
        }
        return prev;
      });
    }, 400);

    try {
      const businessPackage = buildBusinessPackage();

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-starter-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ businessPackage }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate website');
      }

      const result = await response.json();

      clearInterval(progressInterval);
      setGeneratingProgress(100);
      setGeneratingStage('Touchdown!');

      await new Promise(resolve => setTimeout(resolve, 500));

      const { data: savedWebsite, error: saveError } = await supabase
        .from('starter_websites')
        .upsert({
          user_id: currentUser.id,
          idea_key: ideaKey,
          business_package: businessPackage,
          home_html: result.home_html,
          shop_html: result.shop_html,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,idea_key',
        })
        .select()
        .single();

      if (saveError) throw saveError;

      setStarterWebsite(savedWebsite);
      setView('starter');
    } catch (err: any) {
      console.error('Error generating website:', err);
      alert(err.message || 'Failed to generate website');
    } finally {
      clearInterval(progressInterval);
      setGenerating(false);
      setGeneratingProgress(0);
      setGeneratingStage('');
    }
  };

  const downloadZip = async () => {
    if (!starterWebsite?.home_html || !starterWebsite?.shop_html || !brandData) return;

    const JSZip = (await import('https://cdn.skypack.dev/jszip@3.10.1')).default;
    const zip = new JSZip();

    zip.file('index.html', starterWebsite.home_html);
    zip.file('shop.html', starterWebsite.shop_html);

    const readme = `# ${brandData.selected_name} Website

## Files Included
- index.html - Home page
- shop.html - Shop page

## How to Use
1. Open index.html in a browser to preview
2. Upload to your hosting provider
3. Replace checkout links with your Shopify/Stripe links

## Tech Stack
- HTML5
- Tailwind CSS (via CDN)

Generated by LaunchPad AI
`;
    zip.file('README.md', readme);

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandData.selected_name.toLowerCase().replace(/\s+/g, '-')}-website.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyHtml = async (type: 'home' | 'shop') => {
    const html = type === 'home' ? starterWebsite?.home_html : starterWebsite?.shop_html;
    if (!html) return;

    try {
      await navigator.clipboard.writeText(html);
      alert(`${type === 'home' ? 'Home' : 'Shop'} HTML copied to clipboard!`);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const submitProRequest = async () => {
    if (!currentUser || !ideaKey || !brandData) return;

    setSubmittingPro(true);
    try {
      const businessPackage = buildBusinessPackage();
      businessPackage.notes = proNotes;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/request-pro-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: currentUser.id,
            ideaKey,
            businessPackage,
            notes: proNotes,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit request');
      }

      const { data: updatedRequest } = await supabase
        .from('pro_website_requests')
        .select('*')
        .eq('user_id', currentUser.id)
        .eq('idea_key', ideaKey)
        .single();

      setProRequest(updatedRequest);
      setShowProForm(false);
      setView('pro-status');
    } catch (err: any) {
      console.error('Error submitting pro request:', err);
      alert(err.message || 'Failed to submit request');
    } finally {
      setSubmittingPro(false);
    }
  };

  const downloadBusinessPackage = () => {
    const businessPackage = buildBusinessPackage();
    const blob = new Blob([JSON.stringify(businessPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandData?.selected_name?.toLowerCase().replace(/\s+/g, '-') || 'business'}-package.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const saveEditedHtml = async (newHtml: string) => {
    if (!currentUser || !ideaKey || !starterWebsite) return;

    try {
      const updateData = activeTab === 'home'
        ? { home_html: newHtml }
        : { shop_html: newHtml };

      const { error } = await supabase
        .from('starter_websites')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', currentUser.id)
        .eq('idea_key', ideaKey);

      if (error) throw error;

      setStarterWebsite({
        ...starterWebsite,
        ...(activeTab === 'home' ? { home_html: newHtml } : { shop_html: newHtml }),
        updated_at: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Error saving edited HTML:', err);
      alert(err.message || 'Failed to save changes');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      submitted: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Request Received' },
      paid: { bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Payment Confirmed' },
      assigned: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Designer Assigned' },
      in_progress: { bg: 'bg-orange-500/20', text: 'text-orange-400', label: 'In Progress' },
      delivered: { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Delivered' },
    };

    const config = statusConfig[status] || statusConfig.submitted;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
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
        <div className="text-center max-w-md">
          <p className="text-red-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            {error.includes('Brand Identity') && ideaKey && (
              <button
                onClick={() => navigate(`/brand-identity?ideaKey=${ideaKey}`)}
                className="px-6 py-3 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90"
              >
                Go to Brand Identity
              </button>
            )}
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <button
          onClick={() => view === 'selection' ? navigate('/dashboard') : setView('selection')}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          {view === 'selection' ? <Home size={20} /> : <ArrowLeft size={20} />}
          <span>{view === 'selection' ? 'Dashboard' : 'Back'}</span>
        </button>
      </nav>

      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Website</h1>
            <p className="text-gray-400">Create your professional website for {brandData?.selected_name}</p>
          </div>

          {view === 'selection' && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 hover:border-[#2979FF]/50 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-[#2979FF]/20 rounded-xl flex items-center justify-center">
                    <Sparkles className="text-[#2979FF]" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white">AI Starter Website</h2>
                </div>
                <p className="text-gray-300 mb-2 text-lg">Instant</p>
                <p className="text-gray-400 mb-6">
                  Get a clean 2-page starter website now (Home + Shop). Perfect for launching quickly and testing your business idea.
                </p>
                <ul className="text-gray-400 text-sm mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Home page with hero, about, features
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Shop page with product cards
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Mobile responsive design
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Download as ZIP
                  </li>
                </ul>
                <button
                  onClick={() => starterWebsite?.home_html ? setView('starter') : handleGenerateClick()}
                  disabled={generating}
                  className="w-full py-4 bg-[#2979FF] text-white rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Generating...
                    </>
                  ) : starterWebsite?.home_html ? (
                    'View My Website'
                  ) : (
                    <>
                      <Sparkles size={20} />
                      Generate AI Website
                    </>
                  )}
                </button>
              </div>

              <div className="bg-gradient-to-br from-[#2979FF]/10 to-[#06D6A0]/10 backdrop-blur-sm border border-[#2979FF]/30 rounded-xl p-8 hover:border-[#2979FF]/50 transition-all group">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#2979FF] to-[#06D6A0] rounded-xl flex items-center justify-center">
                    <Crown className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Professional Website</h2>
                    <span className="text-[#06D6A0] font-bold">$600</span>
                  </div>
                </div>
                <p className="text-gray-300 mb-2 text-lg">Delivered within 24 hours</p>
                <p className="text-gray-400 mb-6">
                  Our team builds a polished, custom website for you. Professional design, better layout, and premium polish.
                </p>
                <ul className="text-gray-400 text-sm mb-6 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Custom professional design
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Premium typography and spacing
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    Optimized for conversions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                    24-hour delivery guarantee
                  </li>
                </ul>
                <button
                  onClick={() => proRequest ? setView('pro-status') : setShowProForm(true)}
                  className="w-full py-4 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all flex items-center justify-center gap-2"
                >
                  {proRequest ? (
                    'View Request Status'
                  ) : (
                    <>
                      <Crown size={20} />
                      Request Professional Website
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {view === 'starter' && starterWebsite && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#06D6A0]" size={28} />
                  <h2 className="text-2xl font-bold text-white">Your Starter Website</h2>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={generateStarterWebsite}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={18} className={generating ? 'animate-spin' : ''} />
                    Regenerate
                  </button>
                  <button
                    onClick={downloadZip}
                    className="flex items-center gap-2 px-4 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90 transition-all"
                  >
                    <Download size={18} />
                    Download ZIP
                  </button>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
                <div className="flex border-b border-white/10">
                  <button
                    onClick={() => setActiveTab('home')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                      activeTab === 'home'
                        ? 'bg-[#2979FF]/20 text-[#2979FF] border-b-2 border-[#2979FF]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Home Preview
                  </button>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className={`flex-1 py-4 px-6 text-center font-medium transition-all ${
                      activeTab === 'shop'
                        ? 'bg-[#2979FF]/20 text-[#2979FF] border-b-2 border-[#2979FF]'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Shop Preview
                  </button>
                </div>

                <div className="p-4">
                  <div className="flex justify-end gap-2 mb-4">
                    <button
                      onClick={() => copyHtml(activeTab)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 text-white text-sm rounded-lg hover:bg-white/20 transition-all"
                    >
                      <Copy size={14} />
                      Copy {activeTab === 'home' ? 'Home' : 'Shop'} HTML
                    </button>
                  </div>

                  <WebsiteEditor
                    html={activeTab === 'home' ? starterWebsite.home_html! : starterWebsite.shop_html!}
                    onSave={saveEditedHtml}
                    pageType={activeTab}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#2979FF]/10 to-[#06D6A0]/10 border-2 border-[#2979FF]/40 rounded-xl p-8">
                <div className="text-center">
                  <Settings className="w-12 h-12 text-[#2979FF] mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-3">Manage Your Website</h3>
                  <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                    Take full control of your website content, connect payments, set up your domain, and export your copy to any platform.
                  </p>
                  <button
                    onClick={() => {
                      alert('Website management portal coming soon! You\'ll be able to edit content, connect Stripe, and export to Shopify.');
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all shadow-lg flex items-center gap-3 mx-auto"
                  >
                    <Settings size={24} />
                    Open Website Manager
                  </button>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-white font-bold mb-3">Or Download & Self-Host</h3>
                <ol className="text-gray-400 text-sm space-y-2 list-decimal list-inside">
                  <li>Download the ZIP file containing both HTML pages</li>
                  <li>Upload to your hosting provider (Netlify, Vercel, or any web host)</li>
                  <li>Replace checkout links with your Shopify/Stripe payment links</li>
                  <li>Connect your custom domain</li>
                </ol>
              </div>

              <div className="bg-gradient-to-r from-[#2979FF]/20 to-[#06D6A0]/20 border border-[#2979FF]/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <Crown className="text-[#2979FF] flex-shrink-0" size={32} />
                  <div>
                    <h3 className="text-white font-bold mb-2">Want a more polished website?</h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Our team can create a professional, custom-designed website with premium polish and optimized for conversions.
                    </p>
                    <button
                      onClick={() => setShowProForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-medium hover:opacity-90 transition-all"
                    >
                      Request Professional Website - $600
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {view === 'pro-status' && proRequest && (
            <div className="space-y-6">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">Professional Website Request</h2>
                  {getStatusBadge(proRequest.status)}
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg">
                    <CheckCircle2 className="text-[#06D6A0]" size={24} />
                    <div>
                      <p className="text-white font-medium">Request Received</p>
                      <p className="text-gray-400 text-sm">
                        Submitted on {new Date(proRequest.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
                    <Clock className="text-[#2979FF]" size={24} />
                    <div>
                      <p className="text-white font-medium">Delivery within 24 hours</p>
                      <p className="text-gray-400 text-sm">
                        Our team is working on your professional website
                      </p>
                    </div>
                  </div>

                  {proRequest.notes && (
                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                      <p className="text-gray-400 text-sm mb-2">Your Notes:</p>
                      <p className="text-white">{proRequest.notes}</p>
                    </div>
                  )}

                  {proRequest.status === 'delivered' && proRequest.deliverables_url && (
                    <div className="p-4 bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg">
                      <p className="text-white font-medium mb-2">Your website is ready!</p>
                      <a
                        href={proRequest.deliverables_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90 transition-all"
                      >
                        <Download size={18} />
                        Download Deliverables
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <button
                    onClick={downloadBusinessPackage}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    <FileText size={18} />
                    Download Business Package
                  </button>
                </div>
              </div>

              {!starterWebsite?.home_html && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <p className="text-gray-400 mb-4">
                    While you wait, you can generate an AI Starter Website to preview your brand online.
                  </p>
                  <button
                    onClick={generateStarterWebsite}
                    disabled={generating}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 transition-all disabled:opacity-50"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate AI Starter Website
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showProForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A192F] border border-white/10 rounded-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Request Professional Website</h3>
              <button
                onClick={() => setShowProForm(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Anything specific you want on your website?
                </label>
                <textarea
                  value={proNotes}
                  onChange={(e) => setProNotes(e.target.value)}
                  placeholder="E.g., I want a testimonials section, specific color scheme changes, integration with my booking system..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] resize-none h-32"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-2">What's included:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>- Professional 2-page website (Home + Shop)</li>
                  <li>- Custom design based on your brand</li>
                  <li>- Mobile responsive layout</li>
                  <li>- 24-hour delivery guarantee</li>
                </ul>
                <p className="text-white font-bold mt-3">Total: $600</p>
              </div>

              <button
                onClick={submitProRequest}
                disabled={submittingPro}
                className="w-full py-4 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submittingPro ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Submitting...
                  </>
                ) : (
                  'Submit Request'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {generating && !gameMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setGameMinimized(true)}
          >
            <motion.div
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="bg-[#0A192F] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-white font-semibold text-center mb-4">
                Dodge the asteroids while we build your site!
              </h3>
              <RocketGame progress={generatingProgress} stage={generatingStage} />
              <p className="text-center text-gray-500 text-xs mt-3">
                Click outside to minimize
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generating && gameMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              onClick={() => setGameMinimized(false)}
              className="bg-[#0A192F] border border-white/10 rounded-xl p-4 shadow-2xl flex items-center gap-3 hover:border-[#2979FF]/50 transition-colors"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-[#2979FF] to-[#06D6A0] rounded-lg flex items-center justify-center">
                <Loader2 className="text-white animate-spin" size={20} />
              </div>
              <div className="text-left">
                <p className="text-white text-sm font-medium">{Math.round(generatingProgress)}%</p>
                <p className="text-gray-400 text-xs">{generatingStage}</p>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {showQuestionnaire && (
        <WebsiteQuestionnaire
          businessName={brandData?.selected_name || ''}
          defaultEmail={currentUser?.email || ''}
          onComplete={handleQuestionnaireComplete}
          onSkip={async () => {
            setShowQuestionnaire(false);
            await generateStarterWebsite();
          }}
        />
      )}
    </div>
  );
}
