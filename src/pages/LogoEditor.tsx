import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Sparkles, Loader2, Download, Save, RefreshCw } from 'lucide-react';
import { supabase } from '../config/supabase';
import { regenerateLogoWithChanges } from '../services/openai';

interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export default function LogoEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const brandIdentityId = searchParams.get('id');
  const logoIndex = searchParams.get('logo');

  const [loading, setLoading] = useState(true);
  const [ideaKey, setIdeaKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const [businessName, setBusinessName] = useState('');
  const [logo, setLogo] = useState<LogoConcept | null>(null);
  const [originalLogo, setOriginalLogo] = useState<LogoConcept | null>(null);
  const [brandColors, setBrandColors] = useState<BrandColors>({ primary: '#000000', secondary: '#666666', accent: '#999999' });

  const [editPrompt, setEditPrompt] = useState('');
  const [correctSpelling, setCorrectSpelling] = useState('');
  const [styleAdjustments, setStyleAdjustments] = useState({
    makeMoreMinimal: false,
    makeMoreDetailed: false,
    changeIconStyle: '',
    adjustColors: '',
    modifyText: '',
  });

  useEffect(() => {
    loadLogoData();
  }, [brandIdentityId, logoIndex]);

  const loadLogoData = async () => {
    if (!brandIdentityId) {
      navigate('/dashboard');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('brand_identity')
        .select('*')
        .eq('id', brandIdentityId)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        navigate('/dashboard');
        return;
      }

      const loadedIdeaKey = data.idea_key;
      setIdeaKey(loadedIdeaKey);
      setBusinessName(data.selected_name || '');
      setBrandColors({
        primary: data.brand_colors?.primary || '#000000',
        secondary: data.brand_colors?.secondary || '#666666',
        accent: data.brand_colors?.accent || '#999999',
      });

      // Get the specific logo or the selected one
      let logoToEdit: LogoConcept | null = null;
      if (logoIndex !== null) {
        const idx = parseInt(logoIndex);
        if (data.logo_data?.concepts?.[idx]) {
          logoToEdit = data.logo_data.concepts[idx];
        }
      } else if (data.logo_data?.selected) {
        logoToEdit = data.logo_data.selected;
      }

      if (!logoToEdit) {
        const returnPath = loadedIdeaKey ? `/brand-identity?idea=${loadedIdeaKey}` : '/dashboard';
        navigate(returnPath);
        return;
      }

      setLogo(logoToEdit);
      setOriginalLogo(logoToEdit);
    } catch (error) {
      console.error('Error loading logo:', error);
      alert('Failed to load logo. Redirecting...');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleFixSpelling = async () => {
    if (!correctSpelling.trim()) {
      alert('Please enter the corrected text for your logo');
      return;
    }

    if (!logo) return;

    setRegenerating(true);
    try {
      // Import the logo composer
      const { composeLogoWithText } = await import('../utils/logoComposer');

      // Extract the icon from the current logo (we'll regenerate with new text)
      // For now, since we can't extract the icon easily, we'll need to regenerate with specific instructions
      const updatedLogo = await regenerateLogoWithChanges(
        logo,
        correctSpelling.trim(),
        brandColors,
        `CRITICAL: Use EXACTLY this text: "${correctSpelling.trim()}". Keep the same icon design and colors. ONLY change the text spelling to exactly match: "${correctSpelling.trim()}". Do not change any other aspect of the logo.`
      );

      setLogo(updatedLogo);
      setCorrectSpelling('');
      alert('Logo text updated! If the text is still not correct, you may need to generate a new logo concept from the Brand Identity page.');
    } catch (error) {
      console.error('Error fixing spelling:', error);
      alert('Failed to update text. Please try again or generate a new logo from Brand Identity page.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleRegenerateLogo = async () => {
    if (!logo || !businessName) return;

    // Build the prompt from style adjustments and custom prompt
    const promptParts: string[] = [];

    if (styleAdjustments.makeMoreMinimal) {
      promptParts.push('Make it more minimal and simple');
    }
    if (styleAdjustments.makeMoreDetailed) {
      promptParts.push('Add more detail and refinement');
    }
    if (styleAdjustments.changeIconStyle) {
      promptParts.push(`Change icon style to: ${styleAdjustments.changeIconStyle}`);
    }
    if (styleAdjustments.adjustColors) {
      promptParts.push(`Color adjustment: ${styleAdjustments.adjustColors}`);
    }
    if (styleAdjustments.modifyText) {
      promptParts.push(`Text modification: ${styleAdjustments.modifyText}`);
    }
    if (editPrompt.trim()) {
      promptParts.push(editPrompt);
    }

    const fullPrompt = promptParts.join('. ');

    if (!fullPrompt) {
      alert('Please describe the changes you want to make');
      return;
    }

    setRegenerating(true);
    try {
      const updatedLogo = await regenerateLogoWithChanges(
        logo,
        businessName,
        brandColors,
        fullPrompt
      );

      setLogo(updatedLogo);
    } catch (error) {
      console.error('Error regenerating logo:', error);
      alert('Failed to regenerate logo. Please try again.');
    } finally {
      setRegenerating(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!logo || !brandIdentityId) return;

    setSaving(true);
    try {
      const { data: currentData, error: fetchError } = await supabase
        .from('brand_identity')
        .select('logo_data')
        .eq('id', brandIdentityId)
        .maybeSingle();

      if (fetchError) throw fetchError;

      const updatedLogoData = {
        concepts: currentData?.logo_data?.concepts || [],
        selected: logo,
      };

      const { error: updateError } = await supabase
        .from('brand_identity')
        .update({
          logo_data: updatedLogoData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', brandIdentityId);

      if (updateError) throw updateError;

      alert('Logo saved successfully!');
      const returnPath = ideaKey ? `/brand-identity?idea=${ideaKey}` : '/dashboard';
      navigate(returnPath);
    } catch (error) {
      console.error('Error saving logo:', error);
      alert('Failed to save logo. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadLogo = () => {
    if (!logo) return;

    const link = document.createElement('a');
    link.href = logo.imageUrl;
    link.download = `${businessName.replace(/[^a-z0-9]/gi, '_')}_Logo.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    if (originalLogo) {
      setLogo(originalLogo);
      setEditPrompt('');
      setStyleAdjustments({
        makeMoreMinimal: false,
        makeMoreDetailed: false,
        changeIconStyle: '',
        adjustColors: '',
        modifyText: '',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => {
              if (brandIdentityId) {
                navigate(`/brand-identity?id=${brandIdentityId}`);
              } else if (ideaKey) {
                navigate(`/brand-identity?idea=${ideaKey}`);
              } else {
                navigate('/dashboard');
              }
            }}
            className="flex items-center gap-2 text-white hover:text-[#06D6A0] transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Brand Identity
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadLogo}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handleSaveLogo}
              disabled={saving}
              className="px-6 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save & Return
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Logo Preview */}
          <div className="space-y-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Logo Preview</h2>

              <div className="bg-white rounded-lg p-8 mb-6 flex items-center justify-center min-h-[400px]">
                {logo && (
                  <img
                    src={logo.imageUrl}
                    alt={logo.name}
                    className="max-w-full h-auto object-contain"
                  />
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-white font-semibold">{businessName}</p>
                  <p className="text-gray-400 text-sm">{logo?.name}</p>
                </div>

                {logo && logo.imageUrl !== originalLogo?.imageUrl && (
                  <button
                    onClick={handleReset}
                    className="w-full px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Reset to Original
                  </button>
                )}
              </div>
            </div>

            {/* Brand Colors Reference */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Brand Colors</h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div
                    className="w-full h-16 rounded-lg mb-2"
                    style={{ backgroundColor: brandColors.primary }}
                  />
                  <p className="text-xs text-gray-400">Primary</p>
                  <p className="text-xs text-white font-mono">{brandColors.primary}</p>
                </div>
                <div>
                  <div
                    className="w-full h-16 rounded-lg mb-2"
                    style={{ backgroundColor: brandColors.secondary }}
                  />
                  <p className="text-xs text-gray-400">Secondary</p>
                  <p className="text-xs text-white font-mono">{brandColors.secondary}</p>
                </div>
                <div>
                  <div
                    className="w-full h-16 rounded-lg mb-2"
                    style={{ backgroundColor: brandColors.accent }}
                  />
                  <p className="text-xs text-gray-400">Accent</p>
                  <p className="text-xs text-white font-mono">{brandColors.accent}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Controls */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Edit Your Logo</h2>

            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-300">
                  <strong>Note:</strong> Logos are icon-only (no text). You can add your business name later in tools like Canva or Figma, or use these as standalone icon marks.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Customize Your Icon</h3>
                <p className="text-sm text-gray-400 mb-4">Adjust colors, style, or details of your logo icon</p>

                {/* Color Changes */}
                <div className="mb-4">
                  <label className="text-white font-semibold mb-2 block text-sm">Change Specific Colors</label>
                  <input
                    type="text"
                    value={styleAdjustments.adjustColors}
                    onChange={(e) => setStyleAdjustments({ ...styleAdjustments, adjustColors: e.target.value })}
                    placeholder='e.g., "change the blue to #FF5733" or "make the text darker"'
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] text-sm"
                  />
                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-xs text-gray-400">Quick colors:</p>
                    <div className="flex gap-2">
                      {[brandColors.primary, brandColors.secondary, brandColors.accent, '#000000', '#FFFFFF'].map((color, idx) => (
                        <button
                          key={idx}
                          onClick={() => setStyleAdjustments({ ...styleAdjustments, adjustColors: `use ${color}` })}
                          className="w-8 h-8 rounded border-2 border-white/20 hover:border-white transition-colors"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Specific Element Changes */}
                <div className="mb-4">
                  <label className="text-white font-semibold mb-2 block text-sm">Other Specific Changes</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder='e.g., "remove the circle around the icon" or "make the tagline smaller"'
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] resize-none text-sm"
                    rows={3}
                  />
                </div>
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Make Style Changes</h3>
                <p className="text-sm text-gray-400 mb-4">For broader design changes to the overall style</p>

              {/* Quick Style Adjustments */}
              <div>
                <label className="text-white font-semibold mb-3 block">Quick Adjustments</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styleAdjustments.makeMoreMinimal}
                      onChange={(e) => setStyleAdjustments({ ...styleAdjustments, makeMoreMinimal: e.target.checked, makeMoreDetailed: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-white text-sm">Make more minimal and simple</span>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
                    <input
                      type="checkbox"
                      checked={styleAdjustments.makeMoreDetailed}
                      onChange={(e) => setStyleAdjustments({ ...styleAdjustments, makeMoreDetailed: e.target.checked, makeMoreMinimal: false })}
                      className="w-4 h-4"
                    />
                    <span className="text-white text-sm">Add more detail and refinement</span>
                  </label>
                </div>
              </div>

              {/* Icon Style */}
              <div>
                <label className="text-white font-semibold mb-2 block text-sm">Change Icon Style</label>
                <input
                  type="text"
                  value={styleAdjustments.changeIconStyle}
                  onChange={(e) => setStyleAdjustments({ ...styleAdjustments, changeIconStyle: e.target.value })}
                  placeholder="e.g., more geometric, abstract, modern, classic..."
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] text-sm"
                />
              </div>
              </div>

              {/* Regenerate Button */}
              <button
                onClick={handleRegenerateLogo}
                disabled={regenerating}
                className="w-full px-6 py-4 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {regenerating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Regenerating Logo...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Apply Changes & Regenerate
                  </>
                )}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Your logo will be regenerated with the changes you've specified. This may take 30-60 seconds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
