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
  Eye,
  RefreshCw
} from 'lucide-react';

interface WebsiteData {
  id: string;
  user_id: string;
  idea_key: string;
  html_code: string | null;
  completed_steps: string[];
}

interface BrandData {
  id: string;
  user_id: string;
  idea_key: string;
  selected_name: string;
  selected_tagline: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  logo_url: string | null;
  business_type: string;
  description: string;
  target_audience: string;
}

export default function WebsiteBuilder() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');
  const { currentUser } = useAuth();

  const [data, setData] = useState<WebsiteData | null>(null);
  const [brandData, setBrandData] = useState<BrandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (!currentUser || !ideaKey) {
      navigate('/dashboard');
      return;
    }

    loadData();
  }, [currentUser, ideaKey]);

  const loadData = async () => {
    try {
      // Load brand identity data
      const { data: brand, error: brandError } = await supabase
        .from('brand_identity')
        .select('*')
        .eq('user_id', currentUser!.id)
        .eq('idea_key', ideaKey)
        .single();

      if (brandError) throw new Error('Please complete Brand Identity first');
      setBrandData(brand);

      // Load or create website data
      let { data: website, error: websiteError } = await supabase
        .from('websites')
        .select('*')
        .eq('user_id', currentUser!.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (!website) {
        // Create or update website entry using upsert
        const { data: newWebsite, error: createError } = await supabase
          .from('websites')
          .upsert({
            user_id: currentUser!.id,
            idea_key: ideaKey,
            completed_steps: [],
          }, {
            onConflict: 'user_id,idea_key',
            ignoreDuplicates: false
          })
          .select()
          .single();

        if (createError) throw createError;
        website = newWebsite;
      }

      setData(website);
    } catch (err: any) {
      console.error('Error loading data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateWebsite = async () => {
    if (!data || !brandData) return;

    setGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-website`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName: brandData.selected_name,
            tagline: brandData.selected_tagline,
            brandColors: brandData.brand_colors,
            logoUrl: brandData.logo_url,
            description: brandData.description,
            targetAudience: brandData.target_audience,
            businessType: brandData.business_type,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate website');
      }

      const result = await response.json();

      const newCompletedSteps = [...data.completed_steps];
      if (!newCompletedSteps.includes('generated')) {
        newCompletedSteps.push('generated');
      }

      await supabase
        .from('websites')
        .update({
          html_code: result.html,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, html_code: result.html, completed_steps: newCompletedSteps });
      setShowPreview(true);
    } catch (err: any) {
      console.error('Error generating website:', err);
      alert(err.message || 'Failed to generate website');
    } finally {
      setGenerating(false);
    }
  };

  const downloadHTML = () => {
    if (!data?.html_code || !brandData) return;

    const blob = new Blob([data.html_code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${brandData.selected_name.toLowerCase().replace(/\s+/g, '-')}-website.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyHTML = async () => {
    if (!data?.html_code) return;

    try {
      await navigator.clipboard.writeText(data.html_code);
      alert('HTML code copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Failed to copy to clipboard');
    }
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

  const isGenerated = data.completed_steps.includes('generated');

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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Website Builder</h1>
            <p className="text-gray-400">Create a modern, editable one-page website for {brandData.selected_name}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            {!isGenerated ? (
              <div className="text-center py-12">
                <Sparkles className="mx-auto mb-6 text-[#2979FF]" size={64} />
                <h2 className="text-2xl font-bold text-white mb-4">Generate Your Website</h2>
                <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
                  We'll create a professional one-page website with your brand colors, logo, and business information.
                  The site will include Hero, About, Services, Contact sections and be ready to export to Wix, Framer, or Shopify.
                </p>
                <button
                  onClick={generateWebsite}
                  disabled={generating}
                  className="flex items-center gap-2 px-8 py-4 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 disabled:opacity-50 transition-all mx-auto text-lg font-medium"
                >
                  {generating ? (
                    <>
                      <Loader2 className="animate-spin" size={24} />
                      Generating Your Website...
                    </>
                  ) : (
                    <>
                      <Sparkles size={24} />
                      Generate Website
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle2 className="text-[#06D6A0]" size={32} />
                  <div>
                    <h2 className="text-2xl font-bold text-white">Website Generated!</h2>
                    <p className="text-gray-400">Your one-page website is ready to preview and export</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-white rounded-lg hover:bg-[#2979FF]/90 transition-all"
                  >
                    <Eye size={20} />
                    {showPreview ? 'Hide Preview' : 'Show Preview'}
                  </button>
                  <button
                    onClick={downloadHTML}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    <Download size={20} />
                    Download HTML
                  </button>
                  <button
                    onClick={copyHTML}
                    className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all"
                  >
                    <Copy size={20} />
                    Copy Code
                  </button>
                  <button
                    onClick={generateWebsite}
                    disabled={generating}
                    className="flex items-center gap-2 px-6 py-3 bg-[#06D6A0]/20 border border-[#06D6A0]/30 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/30 transition-all disabled:opacity-50"
                  >
                    <RefreshCw size={20} />
                    Regenerate
                  </button>
                </div>

                {showPreview && data.html_code && (
                  <div className="mb-6 border border-white/20 rounded-lg overflow-hidden">
                    <div className="bg-white/5 border-b border-white/10 px-4 py-2">
                      <p className="text-gray-400 text-sm">Website Preview</p>
                    </div>
                    <iframe
                      srcDoc={data.html_code}
                      className="w-full h-[800px] bg-white"
                      title="Website Preview"
                    />
                  </div>
                )}

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-3">Export to Website Builders</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Your website uses clean HTML and Tailwind CSS, making it easy to import into popular website builders.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a
                      href="https://www.wix.com/html5us/hiker-new-user?utm_source=affiliate&experiment_id=editor_adi"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Export to Wix
                    </a>
                    <a
                      href="https://www.framer.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Export to Framer
                    </a>
                    <a
                      href="https://www.shopify.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                    >
                      Export to Shopify
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
