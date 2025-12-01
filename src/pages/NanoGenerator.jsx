import { useState } from "react";
import { generateNanoDesign } from "../nanoBanana";
import { ArrowLeft, Loader2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function NanoGenerator() {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [generatingType, setGeneratingType] = useState("");
  const navigate = useNavigate();

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

  async function generateBusinessFlyer() {
    await handleGenerate(
      "clean modern business flyer with professional layout, contact information section, and bold headlines",
      "flyer",
      "Business Flyer"
    );
  }

  async function generateServiceFlyer() {
    await handleGenerate(
      "service flyer highlighting key offerings, pricing, and call-to-action with eye-catching design",
      "flyer",
      "Service Flyer"
    );
  }

  async function generateEventFlyer() {
    await handleGenerate(
      "event flyer with date, time, location details and exciting visuals",
      "flyer",
      "Event Flyer"
    );
  }

  async function generateSocialPost() {
    await handleGenerate(
      "social media post template with engaging graphics and text overlay space",
      "post",
      "Social Post"
    );
  }

  async function generateInstagramPost() {
    await handleGenerate(
      "Instagram post template with modern aesthetic, brand colors, and room for captions",
      "post",
      "Instagram Post"
    );
  }

  async function generatePromoPost() {
    await handleGenerate(
      "promotional social media post with special offer layout and compelling visuals",
      "post",
      "Promo Post"
    );
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
