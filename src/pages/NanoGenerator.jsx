import { useState, useEffect } from "react";
import { generateNanoDesign } from "../nanoBanana";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../config/supabase";
import { buildStoryBrandFlyerPrompt } from "../utils/storyBrandFlyerPrompt";

export default function NanoGenerator() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingType, setGeneratingType] = useState("");
  const [brandData, setBrandData] = useState(null);
  const [storyBrandData, setStoryBrandData] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');

  useEffect(() => {
    if (ideaKey) {
      loadBrandData();
    }
  }, [ideaKey]);

  async function loadBrandData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brand } = await supabase
        .from('brand_identity')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      const { data: storyBrand } = await supabase
        .from('storybrand_roadmap')
        .select('*')
        .eq('user_id', user.id)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      setBrandData(brand);
      setStoryBrandData(storyBrand);
    } catch (error) {
      console.error('Error loading brand data:', error);
    }
  }

  async function handleGenerate(prompt, type, label) {
    setLoading(true);
    setGeneratingType(label);
    try {
      const result = await generateNanoDesign(prompt, type);
      setImageUrl(result.imageUrl);
    } catch (error) {
      console.error("Error generating design:", error);
      alert("Failed to generate design. Please try again.");
    }
    setLoading(false);
    setGeneratingType("");
  }

  // ⭐ CLEAN, MODERN, TEXT-FREE FLYER PROMPTS
  async function generateBusinessFlyer() {
    await handleGenerate(
      "clean modern business flyer layout, no words, no text, minimal shapes only, bold header space, professional visual design, premium layout",
      "flyer",
      "Business Flyer"
    );
  }

  async function generateServiceFlyer() {
    await handleGenerate(
      "clean minimal service flyer layout, geometric shapes only, no readable text, modern header area, premium marketing design",
      "flyer",
      "Service Flyer"
    );
  }

  async function generateEventFlyer() {
    await handleGenerate(
      "modern event flyer layout, bold shapes, clean spacing, no text or words, strong visual composition, professional aesthetic",
      "flyer",
      "Event Flyer"
    );
  }

  // ⭐ CLEAN, MODERN, TEXT-FREE SOCIAL POST PROMPTS
  async function generateSocialPost() {
    await handleGenerate(
      "modern social media post layout, clean shapes, no text, bold color blocking, premium visual style, minimal composition",
      "post",
      "Social Post"
    );
  }

  async function generateInstagramPost() {
    await handleGenerate(
      "instagram post layout only, no text, clean shapes, bold aesthetic, premium gradient design, modern minimal look",
      "post",
      "Instagram Post"
    );
  }

  async function generatePromoPost() {
    await handleGenerate(
      "promotional social post template, no text, clean geometric layout, bold shapes, modern marketing look, high contrast design",
      "post",
      "Promo Post"
    );
  }

  async function generateStoryBrandFlyer() {
    if (!brandData && !storyBrandData) {
      alert('Please complete Brand Identity and StoryBrand setup first');
      return;
    }

    const prompt = buildStoryBrandFlyerPrompt(brandData, storyBrandData);
    await handleGenerate(prompt, "flyer", "StoryBrand Flyer");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate("/marketing-assets")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Marketing Assets
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            NanoBanana AI Design Generator
          </h1>
          <p className="text-gray-400 text-lg">
            Generate professional flyers and social media posts instantly
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Flyers Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Flyers</h2>
            <p className="text-gray-400 mb-6">
              Create professional flyers for your business, services, or events
            </p>
            <div className="space-y-3">
              <button
                onClick={generateBusinessFlyer}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "Business Flyer" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Business Flyer"
                )}
              </button>

              <button
                onClick={generateServiceFlyer}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#06D6A0] to-[#2979FF] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "Service Flyer" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Service Flyer"
                )}
              </button>

              <button
                onClick={generateEventFlyer}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#EF476F] to-[#FF6B9D] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "Event Flyer" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Event Flyer"
                )}
              </button>

              <button
                onClick={generateStoryBrandFlyer}
                disabled={loading || (!brandData && !storyBrandData)}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#9b59b6] to-[#3498db] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "StoryBrand Flyer" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate StoryBrand Flyer"
                )}
              </button>
            </div>
          </div>

          {/* Social Posts Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Social Media Posts</h2>
            <p className="text-gray-400 mb-6">
              Design eye-catching posts for your social media channels
            </p>
            <div className="space-y-3">
              <button
                onClick={generateSocialPost}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "Social Post" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Social Post"
                )}
              </button>

              <button
                onClick={generateInstagramPost}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#06D6A0] to-[#2979FF] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "Instagram Post" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Instagram Post"
                )}
              </button>

              <button
                onClick={generatePromoPost}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-[#EF476F] to-[#FF6B9D] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && generatingType === "Promo Post" ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Promo Post"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Generated Image Display */}
        {imageUrl && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Generated Design</h3>
              <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2"
              >
                <Download size={18} />
                Download
              </a>
            </div>
            <div className="flex justify-center">
              <img
                src={imageUrl}
                alt="Generated Design"
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <Loader2 size={48} className="animate-spin text-[#2979FF] mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">
              Generating {generatingType}...
            </p>
            <p className="text-gray-400">
              This may take a few moments. Please be patient.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
