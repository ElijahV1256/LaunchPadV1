import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../config/supabase";
import { generatePlacidFlyer } from "../lib/placidFlyer";

export default function NanoGenerator() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingType, setGeneratingType] = useState("");
  const [brandData, setBrandData] = useState(null);
  const [storyBrandData, setStoryBrandData] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const ideaKey = searchParams.get('ideaKey');

  const story = JSON.parse(localStorage.getItem("storyBrandFlyerData") || "{}");
  const brand = JSON.parse(localStorage.getItem("brandGuide") || "{}");

  useEffect(() => {
    if (ideaKey) {
      loadBrandData();
    }
    const autoGenerate = searchParams.get('autoGenerate');
    if (autoGenerate === 'true') {
      generateStoryBrandFlyer();
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

  async function generateStoryBrandFlyer() {
    setLoading(true);
    setGeneratingType("StoryBrand Flyer");
    try {
      const businessName = brandData?.selected_name || brand.businessName || story.businessName || "Your Business";
      const primaryColor = brandData?.brand_colors?.primary || story.primaryColor || "#06D6A0";
      const accentColor = brandData?.brand_colors?.accent || story.accentColor || "#E0FBFC";
      const tagline = brandData?.selected_tagline || brand.tagline || "";

      const flyerFields = {
        headline: story.customerWant || "",
        subheadline: story.problem || "",
        description: story.solution || "",
        cta: story.cta || "Get Started Today",
        contact_information: story.contact_information || `${businessName}\nwww.yourbusiness.com\n(555) 123-4567`,
        logo: brand.logoUrl || "",
        image: story.imageUrl || "",
        primary_color: primaryColor,
        accent_color: accentColor,
        business_name: businessName,
        tagline: tagline
      };

      const result = await generatePlacidFlyer(
        "YOUR_PLACID_TEMPLATE_ID",
        flyerFields
      );

      if (result.imageUrl) {
        setImageUrl(result.imageUrl);
      } else {
        throw new Error("No image URL returned from Placid");
      }
    } catch (error) {
      console.error("Error generating StoryBrand flyer:", error);
      alert("Failed to generate flyer. Please try again.");
    }
    setLoading(false);
    setGeneratingType("");
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
            StoryBrand Marketing Flyer
          </h1>
          <p className="text-gray-400 text-lg">
            Your professionally designed marketing flyer
          </p>
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
