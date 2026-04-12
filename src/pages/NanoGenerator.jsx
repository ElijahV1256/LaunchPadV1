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
  const ideaKey = searchParams.get("ideaKey");

  let story = {};
  let brand = {};
  try {
    story = JSON.parse(localStorage.getItem("storyBrandFlyerData") || "{}");
  } catch {
    story = {};
  }
  try {
    brand = JSON.parse(localStorage.getItem("brandGuide") || "{}");
  } catch {
    brand = {};
  }

  useEffect(() => {
    if (ideaKey) {
      loadBrandData();
    }

    const autoGenerate = searchParams.get("autoGenerate");
    if (autoGenerate === "true") {
      generateStoryBrandFlyer();
    }
  }, [ideaKey]);

  async function loadBrandData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: brand } = await supabase
        .from("brand_identity")
        .select("*")
        .eq("user_id", user.id)
        .eq("idea_key", ideaKey)
        .maybeSingle();

      const { data: storyBrand } = await supabase
        .from("storybrand_roadmap")
        .select("*")
        .eq("user_id", user.id)
        .eq("idea_key", ideaKey)
        .maybeSingle();

      setBrandData(brand);
      setStoryBrandData(storyBrand);
    } catch (error) {
      console.error("Error loading brand data:", error);
    }
  }

  async function generateStoryBrandFlyer() {
    setLoading(true);
    setGeneratingType("StoryBrand Flyer");

    try {
      const businessName =
        brandData?.selected_name ||
        brand.businessName ||
        story.businessName ||
        "Your Business";

      const primaryColor =
        brandData?.brand_colors?.primary ||
        brand.primaryColor ||
        story.primaryColor ||
        "#2979FF";

      const accentColor =
        brandData?.brand_colors?.accent ||
        brand.accentColor ||
        story.accentColor ||
        "#06D6A0";

      const logoUrl = brand.logoUrl || "";

      // FINAL flyer field mapping for Placid
      const flyerFields = {
        headline: story.customerWant || "",
        subheadline: story.problem || "",
        description: story.solution || "",
        cta: story.cta || "Get Started Today",
        contact_information:
          story.contact_information ||
          `${businessName}\nwww.yourbusiness.com\n(555) 123-4567`,
        logo: logoUrl,
        image: story.imageUrl || "",
        primary_color: primaryColor,
        accent_color: accentColor
      };

      // Call Supabase -> Placid
      const result = await generatePlacidFlyer(
        "wtevbj3ailraa",
        flyerFields
      );

      console.log("StoryBrand flyer result:", result);

      if (!result.imageUrl) {
        throw new Error("No flyer returned from Supabase/Placid");
      }

      setImageUrl(result.imageUrl);

    } catch (error) {
      console.error("Error generating StoryBrand flyer:", error);
      console.error("Error details:", error.message, error.stack);
      alert(`Failed to generate flyer: ${error.message || "Unknown error"}. Check console for details.`);
    }

    setLoading(false);
    setGeneratingType("");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f1e]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Back Button */}
        <button
          onClick={() => navigate("/marketing-assets")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Marketing Assets
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            StoryBrand Marketing Flyer
          </h1>
          <p className="text-gray-400 text-lg">
            Your professionally designed marketing flyer
          </p>
        </div>

        {/* Flyer Output */}
        {imageUrl && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                Generated Flyer
              </h3>

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
                alt="Generated Flyer"
                className="max-w-full h-auto rounded-lg shadow-2xl"
              />
            </div>
          </div>
        )}

        {/* Loading UI */}
        {loading && (
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
            <Loader2
              size={48}
              className="animate-spin text-[#2979FF] mx-auto mb-4"
            />
            <p className="text-white text-lg font-semibold mb-2">
              Generating {generatingType}...
            </p>
            <p className="text-gray-400">
              This may take a few moments. Please be patient.
            </p>
          </div>
        )}

        {/* Generate Button */}
        {!loading && (
          <div className="mt-10 text-center">
            <button
              onClick={generateStoryBrandFlyer}
              className="px-8 py-4 bg-gradient-to-r from-[#06D6A0] to-[#2979FF] text-white font-bold rounded-xl hover:opacity-90 transition-opacity text-lg"
            >
              Generate StoryBrand Flyer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
