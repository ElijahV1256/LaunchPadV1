import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, CheckCircle2, Circle, Loader2, Sparkles, RefreshCw, CreditCard as Edit2, X, Download, Upload } from 'lucide-react';
import { generateLogoConcepts, regenerateLogoWithChanges, generateSlogan } from '../services/openai';
import { downloadBrandGuide } from '../utils/brandGuide';

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
}

interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

interface NameOption {
  name: string;
  reason: string;
  tagline?: string;
}

interface BrandData {
  id: string;
  business_names: NameOption[];
  selected_name: string | null;
  brand_colors: {
    primary?: string;
    secondary?: string;
    accent?: string;
    palettes?: ColorPalette[];
    selected_palette_index?: number;
  };
  logo_data?: {
    concepts?: LogoConcept[];
    selected?: LogoConcept;
    uploaded_logo_url?: string;
  };
  domain_suggestions?: any[];
  selected_domain?: string | null;
  completed_steps: string[];
}

export default function BrandIdentity() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { currentUser } = useAuth();
  const ideaKey = searchParams.get('ideaKey') || '';

  const [data, setData] = useState<BrandData | null>(null);
  const [businessIdea, setBusinessIdea] = useState<{name: string; description: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatingLogos, setGeneratingLogos] = useState(false);

  const [offerDescription, setOfferDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [keywords, setKeywords] = useState('');
  const [customName, setCustomName] = useState('');
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [generatingLogoConcepts, setGeneratingLogoConcepts] = useState(false);
  const [logoProgress, setLogoProgress] = useState({ current: 0, total: 6 });
  const [editingLogo, setEditingLogo] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [regeneratingLogo, setRegeneratingLogo] = useState(false);
  const [showLogoQuestionnaire, setShowLogoQuestionnaire] = useState(false);
  const [logoAnswers, setLogoAnswers] = useState({
    businessDescription: '',
    targetAudience: '',
    brandPersonality: '',
    industry: '',
    preferredStyle: '',
  });
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [generatingAudience, setGeneratingAudience] = useState(false);
  const [generatingKeywords, setGeneratingKeywords] = useState(false);
  const [generatingPersonality, setGeneratingPersonality] = useState(false);
  const [generatingIndustry, setGeneratingIndustry] = useState(false);
  const [generatingStyle, setGeneratingStyle] = useState(false);
  const [uploadedLogoUrl, setUploadedLogoUrl] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const completionRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  const normalizeBusinessNames = (names: any): NameOption[] => {
    if (!names || !Array.isArray(names)) return [];

    return names.map(name => {
      if (typeof name === 'string') {
        return { name, reason: 'Generated name', tagline: undefined };
      }
      return name;
    });
  };

  useEffect(() => {
    if (!currentUser || !ideaKey) {
      setLoading(false);
      return;
    }
    loadData();
  }, [currentUser, ideaKey]);

  const loadData = async () => {
    if (!currentUser || !ideaKey) return;

    try {
      const [brandResult, ideaResult] = await Promise.all([
        supabase
          .from('brand_identity')
          .select('*')
          .eq('user_id', currentUser.id)
          .eq('idea_key', ideaKey)
          .maybeSingle(),
        supabase
          .from('business_ideas')
          .select('name, description')
          .eq('user_id', currentUser.id)
          .eq('idea_id', ideaKey)
          .maybeSingle()
      ]);

      const { data: existingData, error: fetchError } = brandResult;

      if (ideaResult.data) {
        setBusinessIdea({
          name: ideaResult.data.name,
          description: ideaResult.data.description
        });
      }

      if (fetchError) throw fetchError;

      if (existingData) {
        setData({
          id: existingData.id,
          business_names: normalizeBusinessNames(existingData.business_names),
          selected_name: existingData.selected_name,
          logo_data: existingData.logo_data || {},
          brand_colors: existingData.brand_colors || {},
          domain_suggestions: existingData.domain_suggestions || [],
          selected_domain: existingData.selected_domain,
          completed_steps: existingData.completed_steps || [],
        });
        setUploadedLogoUrl(existingData.logo_data?.uploaded_logo_url || null);
        setOfferDescription(existingData.offer_description || '');
        setTargetAudience(existingData.target_audience || '');
        setKeywords(existingData.brand_keywords || '');
      } else {
        const { data: newData, error: insertError } = await supabase
          .from('brand_identity')
          .insert({
            user_id: currentUser.id,
            idea_key: ideaKey,
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === '23505') {
            const { data: existingRetry } = await supabase
              .from('brand_identity')
              .select('*')
              .eq('user_id', currentUser.id)
              .eq('idea_key', ideaKey)
              .maybeSingle();

            if (existingRetry) {
              setData({
                id: existingRetry.id,
                business_names: normalizeBusinessNames(existingRetry.business_names),
                selected_name: existingRetry.selected_name,
                logo_data: existingRetry.logo_data || {},
                brand_colors: existingRetry.brand_colors || {},
                domain_suggestions: existingRetry.domain_suggestions || [],
                selected_domain: existingRetry.selected_domain,
                completed_steps: existingRetry.completed_steps || [],
              });
              return;
            }
          }
          throw insertError;
        }

        setData({
          id: newData.id,
          business_names: [],
          selected_name: null,
          logo_data: {},
          brand_colors: {},
          domain_suggestions: [],
          selected_domain: null,
          completed_steps: [],
        });
      }
    } catch (err: any) {
      console.error('Error loading brand identity data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveBusinessDetails = async (overrides?: { offer?: string; audience?: string; keywords?: string }) => {
    if (!data || !currentUser) return;

    try {
      await supabase
        .from('brand_identity')
        .update({
          offer_description: overrides?.offer ?? offerDescription,
          target_audience: overrides?.audience ?? targetAudience,
          brand_keywords: overrides?.keywords ?? keywords,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);
    } catch (err) {
      console.error('Error saving business details:', err);
    }
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !currentUser || !data) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${ideaKey}/custom-logo-${Date.now()}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      setUploadedLogoUrl(publicUrl);

      await supabase
        .from('brand_identity')
        .update({
          logo_data: {
            ...data.logo_data,
            uploaded_logo_url: publicUrl,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({
        ...data,
        logo_data: {
          ...data.logo_data,
          uploaded_logo_url: publicUrl,
        },
      });

      alert('Logo uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      alert(`Failed to upload logo: ${err.message}`);
    } finally {
      setUploadingLogo(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeUploadedLogo = async () => {
    if (!data || !uploadedLogoUrl) return;

    try {
      await supabase
        .from('brand_identity')
        .update({
          logo_data: {
            ...data.logo_data,
            uploaded_logo_url: null,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setUploadedLogoUrl(null);
      setData({
        ...data,
        logo_data: {
          ...data.logo_data,
          uploaded_logo_url: undefined,
        },
      });
    } catch (err: any) {
      console.error('Error removing logo:', err);
      alert(`Failed to remove logo: ${err.message}`);
    }
  };

  const generateNames = async () => {
    const hasOfferAndAudience = offerDescription.trim() && targetAudience.trim();
    const hasKeywords = keywords.trim();

    if (!hasOfferAndAudience && !hasKeywords) {
      alert('Please fill in either offer + audience OR keywords');
      return;
    }

    setGenerating(true);
    try {
      let idea = '';
      if (hasOfferAndAudience) {
        idea = `${offerDescription} for ${targetAudience}`;
      } else {
        idea = keywords;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/business-name`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          idea,
          keywords: hasKeywords ? keywords : undefined,
          openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate names');
      }

      const result = await response.json();
      console.log('API result:', result);
      const names: NameOption[] = result.names || [];
      console.log('Normalized names:', names);

      if (names.length === 0) {
        alert('No names were generated. Please try again.');
        return;
      }

      const { error: updateError } = await supabase
        .from('brand_identity')
        .update({
          business_names: names,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      if (updateError) {
        console.error('Error saving business names:', updateError);
        alert('Failed to save business names. Please try again.');
        return;
      }

      console.log('Successfully saved names, updating state...');
      setData({ ...data!, business_names: names });

      if (!data!.completed_steps.includes('generate-names')) {
        const updatedSteps = [...data!.completed_steps, 'generate-names'];
        const { error: stepError } = await supabase
          .from('brand_identity')
          .update({ completed_steps: updatedSteps })
          .eq('id', data!.id);

        if (stepError) {
          console.error('Error updating steps:', stepError);
        } else {
          setData({ ...data!, business_names: names, completed_steps: updatedSteps });
        }
      }
    } catch (err) {
      console.error('Error generating names:', err);
    } finally {
      setGenerating(false);
    }
  };

  const selectName = async (name: string) => {
    try {
      const isCustomName = !data!.business_names.some(n => n.name === name);
      const updatedNames = isCustomName
        ? [...data!.business_names, { name, reason: 'Custom name', tagline: undefined }]
        : data!.business_names;

      const newCompletedSteps = [...data!.completed_steps];
      if (!newCompletedSteps.includes('generate-names')) {
        newCompletedSteps.push('generate-names');
      }

      const { error: updateError } = await supabase
        .from('brand_identity')
        .update({
          business_names: updatedNames,
          selected_name: name,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      if (updateError) {
        console.error('Error selecting name:', updateError);
        alert('Failed to save selected name. Please try again.');
        return;
      }

      setData({ ...data!, business_names: updatedNames, selected_name: name, completed_steps: newCompletedSteps });
    } catch (err) {
      console.error('Error selecting name:', err);
    }
  };

  const generateColorPalettes = async () => {
    if (selectedColors.length !== 3) {
      alert('Please select exactly 3 colors first');
      return;
    }

    setGeneratingLogos(true);
    try {
      const palettes: ColorPalette[] = [];

      for (let i = 0; i < 10; i++) {
        const shuffled = [...selectedColors].sort(() => Math.random() - 0.5);
        palettes.push({
          primary: shuffled[0],
          secondary: shuffled[1],
          accent: shuffled[2],
        });
      }

      await supabase
        .from('brand_identity')
        .update({
          brand_colors: { ...data!.brand_colors, palettes },
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      setData({ ...data!, brand_colors: { ...data!.brand_colors, palettes } });
      setShowColorPicker(false);

      if (!data!.completed_steps.includes('generate-logo')) {
        const updatedSteps = [...data!.completed_steps, 'generate-logo'];
        await supabase
          .from('brand_identity')
          .update({ completed_steps: updatedSteps })
          .eq('id', data!.id);
        setData({ ...data!, brand_colors: { ...data!.brand_colors, palettes }, completed_steps: updatedSteps });
      }
    } catch (err) {
      console.error('Error generating color palettes:', err);
    } finally {
      setGeneratingLogos(false);
    }
  };

  const selectPalette = async (index: number) => {
    if (!data?.brand_colors?.palettes) return;

    const palette = data.brand_colors.palettes[index];

    try {
      const newCompletedSteps = [...data!.completed_steps];
      if (!newCompletedSteps.includes('select-colors')) {
        newCompletedSteps.push('select-colors');
      }

      await supabase
        .from('brand_identity')
        .update({
          brand_colors: { ...data!.brand_colors, ...palette, selected_palette_index: index },
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      setData({ ...data, brand_colors: { ...data!.brand_colors, ...palette, selected_palette_index: index }, completed_steps: newCompletedSteps });
    } catch (err) {
      console.error('Error selecting palette:', err);
    }
  };

  const toggleColorSelection = (color: string) => {
    if (selectedColors.includes(color)) {
      setSelectedColors(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < 3) {
      setSelectedColors([...selectedColors, color]);
    }
  };

  const predefinedColors = [
    '#2979FF', '#06D6A0', '#EF476F', '#FFD60A', '#FF6B35',
    '#3D5A80', '#98C1D9', '#EE6C4D', '#293241', '#E0FBFC',
    '#5F0F40', '#9A031E', '#FB8B24', '#E36414', '#0F4C5C',
    '#9B5DE5', '#F15BB5', '#FEE440', '#00BBF9', '#00F5FF',
  ];

  const handleGenerateLogoConcepts = async () => {
    console.log('=== handleGenerateLogoConcepts called ===');
    console.log('data:', data);
    console.log('selected_name:', data?.selected_name);
    console.log('brand_colors:', data?.brand_colors);

    if (!data?.selected_name || !data.brand_colors.primary) {
      console.error('Missing required data - selected_name or primary color');
      alert('Please select a business name and brand colors first');
      return;
    }

    setGeneratingLogoConcepts(true);
    setLogoProgress({ current: 0, total: 6 });

    try {
      const businessDescription = logoAnswers.businessDescription.trim()
        ? logoAnswers.businessDescription
        : offerDescription.trim()
        ? offerDescription
        : `A business called ${data.selected_name}`;

      const personalityText = [
        (logoAnswers.targetAudience || targetAudience) && `Target audience: ${logoAnswers.targetAudience || targetAudience}`,
        logoAnswers.brandPersonality && `Brand personality: ${logoAnswers.brandPersonality}`,
        logoAnswers.industry && `Industry: ${logoAnswers.industry}`,
        logoAnswers.preferredStyle && `Preferred style: ${logoAnswers.preferredStyle}`,
      ].filter(Boolean).join('. ');

      console.log('Calling logo generation...');

      const concepts = await generateLogoConcepts(
        data.selected_name,
        {
          primary: data.brand_colors.primary,
          secondary: data.brand_colors.secondary || data.brand_colors.primary,
          accent: data.brand_colors.accent || data.brand_colors.primary,
        },
        businessDescription,
        personalityText || undefined,
        (current, total) => {
          setLogoProgress({ current, total });
        }
      );

      console.log('Received concepts:', concepts);
      console.log('Number of concepts:', concepts.length);

      if (concepts.length === 0) {
        alert('No logos were generated. Please check the browser console for errors.');
        return;
      }

      const newCompletedSteps = [...data!.completed_steps];
      if (!newCompletedSteps.includes('generate-logo')) {
        newCompletedSteps.push('generate-logo');
      }

      await supabase
        .from('brand_identity')
        .update({
          logo_data: { concepts, selected: data!.logo_data?.selected },
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      setData({ ...data, logo_data: { ...data!.logo_data, concepts }, completed_steps: newCompletedSteps });

      console.log('Logo generation complete!');
      setShowLogoQuestionnaire(false);
    } catch (err: any) {
      console.error('Error generating logo concepts:', err);
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      alert(`Failed to generate logos: ${err?.message || 'Unknown error'}. Check console for details.`);
    } finally {
      setGeneratingLogoConcepts(false);
      setLogoProgress({ current: 0, total: 6 });
    }
  };

  const selectLogo = async (logoData: any) => {
    try {
      await supabase
        .from('brand_identity')
        .update({
          logo_data: { concepts: data!.logo_data?.concepts, selected: logoData },
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      setData({ ...data!, logo_data: { ...data!.logo_data, selected: logoData } });
      setEditingLogo(false);
    } catch (err) {
      console.error('Error selecting logo:', err);
    }
  };

  const handleRegenerateLogoWithChanges = async () => {
    if (!customPrompt.trim() || !data?.logo_data?.selected) {
      alert('Please describe what changes you want to make');
      return;
    }

    setRegeneratingLogo(true);
    try {
      const updatedLogoConcept = await regenerateLogoWithChanges(
        data.logo_data.selected,
        data.selected_name!,
        {
          primary: data.brand_colors.primary!,
          secondary: data.brand_colors.secondary || data.brand_colors.primary!,
          accent: data.brand_colors.accent || data.brand_colors.primary!,
        },
        customPrompt
      );

      await supabase
        .from('brand_identity')
        .update({
          logo_data: { concepts: data!.logo_data?.concepts, selected: updatedLogoConcept },
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      setData({ ...data!, logo_data: { ...data!.logo_data, selected: updatedLogoConcept } });
      setCustomPrompt('');
      setEditingLogo(false);
    } catch (err) {
      console.error('Error regenerating logo:', err);
      alert('Failed to regenerate logo. Please try again.');
    } finally {
      setRegeneratingLogo(false);
    }
  };

  const handleDownloadBrandGuide = async () => {
    if (!data?.selected_name || !data?.logo_data?.selected || !data?.brand_colors?.primary) {
      alert('Please complete your brand identity (name, logo, and colors) before downloading the guide.');
      return;
    }

    setGeneratingGuide(true);
    try {
      const businessDesc = logoAnswers.businessDescription || offerDescription || `A business called ${data.selected_name}`;
      const audience = logoAnswers.targetAudience || targetAudience;

      const slogan = await generateSlogan(
        data.selected_name,
        businessDesc,
        audience,
        logoAnswers.brandPersonality
      );

      downloadBrandGuide({
        businessName: data.selected_name,
        slogan: slogan,
        logoUrl: data.logo_data.selected.imageUrl,
        colors: {
          primary: data.brand_colors.primary,
          secondary: data.brand_colors.secondary || data.brand_colors.primary,
          accent: data.brand_colors.accent || data.brand_colors.primary,
        },
        businessDescription: businessDesc,
        targetAudience: audience,
        brandPersonality: logoAnswers.brandPersonality,
        industry: logoAnswers.industry,
      });
    } catch (err) {
      console.error('Error generating brand guide:', err);
      alert('Failed to generate brand guide. Please try again.');
    } finally {
      setGeneratingGuide(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
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

  if (!data) return null;

  const sections = [
    { name: 'Business Name', ref: nameRef, step: 'generate-names', icon: '✍️' },
    { name: 'Brand Colors', ref: colorsRef, step: 'select-colors', icon: '🎨' },
    { name: 'Logo Design', ref: logoRef, step: 'generate-logo', icon: '🎯' },
  ];

  const completedCount = sections.filter(s => data.completed_steps.includes(s.step)).length;
  const progressPct = Math.round((completedCount / sections.length) * 100);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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
            <h2 className="text-white font-bold text-lg mb-2">Brand Identity</h2>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-[#2979FF] transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{progressPct}%</span>
            </div>
          </div>

          <nav className="space-y-2">
            {sections.map((section, idx) => {
              const isCompleted = data?.completed_steps.includes(section.step);
              const isActive = !isCompleted && (idx === 0 || data?.completed_steps.includes(sections[idx - 1].step));

              return (
                <button
                  key={section.step}
                  onClick={() => scrollToSection(section.ref)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 ${
                    isCompleted
                      ? 'bg-[#06D6A0]/10 border border-[#06D6A0]/30 text-[#06D6A0]'
                      : isActive
                      ? 'bg-[#2979FF]/10 border border-[#2979FF]/30 text-[#2979FF]'
                      : 'bg-white/5 border border-white/10 text-gray-500'
                  }`}
                >
                  <span className="text-xl">{section.icon}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{section.name}</div>
                    <div className="text-xs opacity-70">
                      {isCompleted ? 'Completed' : isActive ? 'In Progress' : 'Locked'}
                    </div>
                  </div>
                  {isCompleted && (
                    <CheckCircle2 size={16} className="text-[#06D6A0]" />
                  )}
                </button>
              );
            })}

            {data?.completed_steps.length === 3 && (
              <button
                onClick={() => scrollToSection(completionRef)}
                className="w-full text-left px-4 py-3 rounded-lg transition-all flex items-center gap-3 bg-gradient-to-r from-[#2979FF]/20 to-[#06D6A0]/20 border border-[#2979FF]/30 text-white"
              >
                <span className="text-xl">🎉</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">Complete</div>
                  <div className="text-xs opacity-70">Download Guide</div>
                </div>
              </button>
            )}
          </nav>
        </div>

        <div className="flex-1 lg:ml-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="mb-6 lg:hidden flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Home size={20} />
              <span>Back to Dashboard</span>
            </button>

            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-3 font-['Montserrat']">
                🚀 Phase 2 – Brand & Identity
              </h1>
              <p className="text-gray-300 text-lg">
                Create your business name, logo, and claim your domain.
              </p>
            </div>

            <div className="mb-8 lg:hidden bg-[#E6EEF5] rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-[#2979FF] transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            <div className="space-y-6">
          <div ref={nameRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed_steps.includes('generate-names') ? (
                  <CheckCircle2 className="text-[#06D6A0]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">1. Business Name Generator</h3>
                <p className="text-gray-400 text-sm mb-4">
                  AI creates 3-5 name options based on your offer and audience.
                </p>
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="What do you offer? (e.g., 'dog walking', 'logo design')"
                      value={offerDescription}
                      onChange={(e) => setOfferDescription(e.target.value)}
                      onBlur={saveBusinessDetails}
                      className="w-full px-4 py-2 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                    <button
                      onClick={async () => {
                        setGeneratingOffer(true);
                        try {
                          const contextStr = businessIdea ? `Business Idea: ${businessIdea.name} - ${businessIdea.description}` : '';
                          const promptStr = businessIdea
                            ? 'Based on this business idea, what does this business offer? (1 short phrase)'
                            : 'Generate a brief, common business service or product offering (1 short phrase, e.g., "dog walking", "web design")';

                          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
                              context: contextStr || undefined,
                              prompt: promptStr
                            }),
                          });
                          const result = await response.json();
                          const suggestion = result.suggestion || '';
                          setOfferDescription(suggestion);
                          await saveBusinessDetails({ offer: suggestion });
                        } catch (err) {
                          console.error('Error generating offer:', err);
                          alert('Failed to generate offer suggestion. Please try again.');
                        } finally {
                          setGeneratingOffer(false);
                        }
                      }}
                      disabled={generatingOffer}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#2979FF] hover:text-[#2979FF]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate with AI"
                    >
                      {generatingOffer ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Who is your target audience? (e.g., 'busy pet owners', 'small gyms')"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      onBlur={saveBusinessDetails}
                      className="w-full px-4 py-2 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                    <button
                      onClick={async () => {
                        setGeneratingAudience(true);
                        try {
                          let contextStr = '';
                          if (businessIdea) {
                            contextStr = `Business Idea: ${businessIdea.name} - ${businessIdea.description}`;
                            if (offerDescription.trim()) {
                              contextStr += `\nBusiness offers: ${offerDescription}`;
                            }
                          } else if (offerDescription.trim()) {
                            contextStr = `Business offers: ${offerDescription}`;
                          }

                          const promptStr = contextStr
                            ? 'Who is the ideal target audience for this business? (1 short phrase)'
                            : 'Generate a common target audience for a small business (1 short phrase, e.g., "busy professionals", "pet owners")';

                          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
                              context: contextStr || undefined,
                              prompt: promptStr
                            }),
                          });
                          const result = await response.json();
                          const suggestion = result.suggestion || '';
                          setTargetAudience(suggestion);
                          await saveBusinessDetails({ audience: suggestion });
                        } catch (err) {
                          console.error('Error generating audience:', err);
                          alert('Failed to generate audience suggestion. Please try again.');
                        } finally {
                          setGeneratingAudience(false);
                        }
                      }}
                      disabled={generatingAudience}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#2979FF] hover:text-[#2979FF]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate with AI"
                    >
                      {generatingAudience ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center gap-3 my-3">
                    <div className="flex-1 h-px bg-white/10"></div>
                    <span className="text-gray-500 text-sm">OR</span>
                    <div className="flex-1 h-px bg-white/10"></div>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter keywords (e.g., 'fast, fresh, local')"
                      value={keywords}
                      onChange={(e) => setKeywords(e.target.value)}
                      onBlur={saveBusinessDetails}
                      className="w-full px-4 py-2 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                    <button
                      onClick={async () => {
                        setGeneratingKeywords(true);
                        try {
                          let contextStr = '';
                          if (businessIdea) {
                            contextStr = `Business Idea: ${businessIdea.name} - ${businessIdea.description}`;
                            if (offerDescription.trim()) {
                              contextStr += `\nOffers: ${offerDescription}`;
                            }
                            if (targetAudience.trim()) {
                              contextStr += `\nTarget Audience: ${targetAudience}`;
                            }
                          } else if (data?.selected_name || offerDescription.trim()) {
                            contextStr = `Business: ${data?.selected_name || offerDescription}`;
                          }

                          const promptStr = contextStr
                            ? 'Generate 3-5 brand keywords that describe this business (comma-separated)'
                            : 'Generate 3-5 common brand keywords for a small business (comma-separated, e.g., "fast, fresh, local")';

                          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
                              context: contextStr || undefined,
                              prompt: promptStr
                            }),
                          });
                          const result = await response.json();
                          const suggestion = result.suggestion || '';
                          setKeywords(suggestion);
                          await saveBusinessDetails({ keywords: suggestion });
                        } catch (err) {
                          console.error('Error generating keywords:', err);
                          alert('Failed to generate keywords. Please try again.');
                        } finally {
                          setGeneratingKeywords(false);
                        }
                      }}
                      disabled={generatingKeywords}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#2979FF] hover:text-[#2979FF]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Generate with AI"
                    >
                      {generatingKeywords ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Sparkles size={18} />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={generateNames}
                    disabled={generating || (!offerDescription.trim() && !keywords.trim()) || (!targetAudience.trim() && !keywords.trim())}
                    className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {generating ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Generate Names
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-gray-500 text-sm">OR</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-400">Already have a name in mind?</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your own business name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    />
                    <button
                      onClick={() => {
                        if (customName.trim()) {
                          selectName(customName.trim());
                          setCustomName('');
                        }
                      }}
                      disabled={!customName.trim()}
                      className="px-6 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Use This Name
                    </button>
                  </div>
                </div>

                {data.business_names.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">Select your favorite:</p>
                      <button
                        onClick={generateNames}
                        disabled={generating}
                        className="text-xs text-[#2979FF] hover:text-[#2979FF]/80 transition-colors flex items-center gap-1"
                      >
                        <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                        Regenerate
                      </button>
                    </div>
                    {data.business_names.map((nameOption, idx) => (
                      <button
                        key={idx}
                        onClick={() => selectName(nameOption.name)}
                        className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                          data.selected_name === nameOption.name
                            ? 'bg-[#2979FF] text-white border-2 border-[#2979FF]'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        <div className="font-semibold mb-1">{nameOption.name}</div>
                        {nameOption.tagline && (
                          <div className="text-sm italic mb-1 opacity-90">{nameOption.tagline}</div>
                        )}
                        <div className="text-xs opacity-75">{nameOption.reason}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div ref={colorsRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed_steps.includes('select-colors') ? (
                  <CheckCircle2 className="text-[#06D6A0]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">2. Logo & Brand Colors</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Select 3 colors, then generate 10 different palette combinations.
                </p>

                {!showColorPicker && !data.brand_colors?.palettes && (
                  <button
                    onClick={() => setShowColorPicker(true)}
                    disabled={!data.selected_name}
                    className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mb-4"
                  >
                    <Sparkles size={18} />
                    Choose Colors
                  </button>
                )}

                {showColorPicker && (
                  <div className="space-y-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-3">
                        Select 3 colors ({selectedColors.length}/3):
                      </p>
                      <div className="grid grid-cols-10 gap-2">
                        {predefinedColors.map((color, idx) => (
                          <button
                            key={idx}
                            onClick={() => toggleColorSelection(color)}
                            className={`h-10 w-10 rounded-lg transition-all ${
                              selectedColors.includes(color)
                                ? 'ring-4 ring-white scale-110'
                                : 'hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={generateColorPalettes}
                      disabled={generatingLogos || selectedColors.length !== 3}
                      className="px-6 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {generatingLogos ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          Generate 10 Palettes
                        </>
                      )}
                    </button>
                  </div>
                )}

                {data.brand_colors?.palettes && data.brand_colors.palettes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-400">Choose your favorite palette:</p>
                      <button
                        onClick={() => {
                          setShowColorPicker(true);
                          setSelectedColors([]);
                        }}
                        className="text-sm text-[#2979FF] hover:text-[#2979FF]/80 flex items-center gap-1"
                      >
                        <RefreshCw size={14} />
                        Generate New
                      </button>
                    </div>

                    <div className="space-y-3">
                      {data.brand_colors.palettes!.map((palette, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectPalette(idx)}
                          className={`w-full p-4 rounded-lg transition-all ${
                            data.brand_colors?.selected_palette_index === idx
                              ? 'bg-[#2979FF]/20 border-2 border-[#2979FF]'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="flex-1 flex gap-2">
                              <div className="flex-1 space-y-1">
                                <div
                                  className="h-16 rounded"
                                  style={{ backgroundColor: palette.primary }}
                                />
                                <p className="text-xs text-gray-400">Primary</p>
                                <p className="text-xs text-white font-mono">{palette.primary}</p>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div
                                  className="h-16 rounded"
                                  style={{ backgroundColor: palette.secondary }}
                                />
                                <p className="text-xs text-gray-400">Secondary</p>
                                <p className="text-xs text-white font-mono">{palette.secondary}</p>
                              </div>
                              <div className="flex-1 space-y-1">
                                <div
                                  className="h-16 rounded"
                                  style={{ backgroundColor: palette.accent }}
                                />
                                <p className="text-xs text-gray-400">Accent</p>
                                <p className="text-xs text-white font-mono">{palette.accent}</p>
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div ref={logoRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {data.completed_steps.includes('generate-logo') ? (
                  <CheckCircle2 className="text-[#06D6A0]" size={24} />
                ) : (
                  <Circle className="text-gray-500" size={24} />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-3">3. Logo Creation</h3>
                <p className="text-gray-400 text-sm mb-4">
                  AI generates 6 professional logo concepts with icon+wordmark and icon-only variants.
                </p>

                <div className="flex gap-3 mb-4">
                  {!showLogoQuestionnaire ? (
                    <button
                      onClick={() => setShowLogoQuestionnaire(true)}
                      disabled={generatingLogoConcepts || !data.selected_name || !data.brand_colors.primary}
                      className="px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Sparkles size={18} />
                      Generate Logo Concepts
                    </button>
                  ) : null}

                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className={`px-6 py-2 bg-white/5 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2 justify-center cursor-pointer ${
                        uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload size={18} />
                          Upload Your Own Logo
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {uploadedLogoUrl && (
                  <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-24 h-24 bg-white rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={uploadedLogoUrl}
                          alt="Uploaded logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">Your Uploaded Logo</h4>
                        <p className="text-sm text-gray-400 mb-3">
                          This logo will be used when generating your brand guide
                        </p>
                        <button
                          onClick={removeUploadedLogo}
                          className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                        >
                          <X size={14} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {showLogoQuestionnaire && generatingLogoConcepts ? (
                  <div className="bg-white/5 rounded-lg p-8 border border-white/10 mb-4">
                    <div className="flex flex-col items-center gap-6 py-8">
                      <div className="relative w-40 h-40">
                        <svg className="w-40 h-40 transform -rotate-90">
                          <circle
                            cx="80"
                            cy="80"
                            r="72"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="10"
                            fill="none"
                          />
                          <circle
                            cx="80"
                            cy="80"
                            r="72"
                            stroke="url(#gradient)"
                            strokeWidth="10"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 72}`}
                            strokeDashoffset={`${2 * Math.PI * 72 * (1 - logoProgress.current / logoProgress.total)}`}
                            strokeLinecap="round"
                            className="transition-all duration-700 ease-out"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#2979FF" />
                              <stop offset="100%" stopColor="#06D6A0" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-4xl font-bold bg-gradient-to-r from-[#2979FF] to-[#06D6A0] bg-clip-text text-transparent">
                              {logoProgress.current}
                            </div>
                            <div className="text-sm opacity-75 text-gray-300">of {logoProgress.total}</div>
                          </div>
                        </div>
                      </div>

                      <div className="w-full max-w-md space-y-4">
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden shadow-lg">
                          <div
                            className="h-full bg-gradient-to-r from-[#2979FF] to-[#06D6A0] transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(41,121,255,0.5)]"
                            style={{ width: `${(logoProgress.current / logoProgress.total) * 100}%` }}
                          />
                        </div>

                        <div className="text-center space-y-2">
                          <div className="text-xl font-semibold text-white">
                            {logoProgress.current === 0 && 'Starting AI generation...'}
                            {logoProgress.current >= 1 && logoProgress.current < logoProgress.total / 3 && 'Creating first concepts...'}
                            {logoProgress.current >= logoProgress.total / 3 && logoProgress.current < (logoProgress.total * 2) / 3 && 'Halfway there!'}
                            {logoProgress.current >= (logoProgress.total * 2) / 3 && logoProgress.current < logoProgress.total && 'Almost done!'}
                            {logoProgress.current === logoProgress.total && 'Finalizing your logos...'}
                          </div>
                          <div className="text-sm text-gray-400">
                            This takes 1-2 minutes. Creating professional AI-generated logos...
                          </div>
                          <div className="text-xs text-gray-500 mt-3">
                            {Math.round((logoProgress.current / logoProgress.total) * 100)}% complete
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg p-6 border border-white/10 mb-4 space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-semibold">Customize Your Logo</h4>
                      <button
                        onClick={() => setShowLogoQuestionnaire(false)}
                        className="text-gray-400 hover:text-white"
                      >
                        <X size={18} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                      Refine your logo design with these optional details. We'll use your business info from above as defaults.
                    </p>

                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Brand personality (How should your brand feel?)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={logoAnswers.brandPersonality}
                          onChange={(e) => setLogoAnswers({ ...logoAnswers, brandPersonality: e.target.value })}
                          placeholder="e.g., Modern, trustworthy, energetic, sophisticated, playful"
                          className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                        />
                        <button
                          onClick={async () => {
                            if (!data?.selected_name) {
                              alert('Please select a business name first');
                              return;
                            }
                            setGeneratingPersonality(true);
                            try {
                              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
                                  context: `Business: ${data.selected_name}. Offer: ${offerDescription}. Audience: ${targetAudience}`,
                                  prompt: 'Suggest 3-4 brand personality traits (comma-separated adjectives)'
                                }),
                              });
                              const result = await response.json();
                              setLogoAnswers({ ...logoAnswers, brandPersonality: result.suggestion || '' });
                            } catch (err) {
                              console.error('Error generating personality:', err);
                            } finally {
                              setGeneratingPersonality(false);
                            }
                          }}
                          disabled={generatingPersonality || !data?.selected_name}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#2979FF] hover:text-[#2979FF]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Generate with AI"
                        >
                          {generatingPersonality ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Industry or category
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={logoAnswers.industry}
                          onChange={(e) => setLogoAnswers({ ...logoAnswers, industry: e.target.value })}
                          placeholder="e.g., Technology, Healthcare, Food & Beverage, Consulting"
                          className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                        />
                        <button
                          onClick={async () => {
                            if (!offerDescription.trim() && !data?.selected_name) {
                              alert('Please enter business information first');
                              return;
                            }
                            setGeneratingIndustry(true);
                            try {
                              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
                                  context: `Business: ${data?.selected_name}. Offer: ${offerDescription}`,
                                  prompt: 'Identify the primary industry or category (1-2 words)'
                                }),
                              });
                              const result = await response.json();
                              setLogoAnswers({ ...logoAnswers, industry: result.suggestion || '' });
                            } catch (err) {
                              console.error('Error generating industry:', err);
                            } finally {
                              setGeneratingIndustry(false);
                            }
                          }}
                          disabled={generatingIndustry || (!offerDescription.trim() && !data?.selected_name)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#2979FF] hover:text-[#2979FF]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Generate with AI"
                        >
                          {generatingIndustry ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-gray-300 mb-2 block">
                        Preferred logo style
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={logoAnswers.preferredStyle}
                          onChange={(e) => setLogoAnswers({ ...logoAnswers, preferredStyle: e.target.value })}
                          placeholder="e.g., Minimalist, Geometric, Abstract, Nature-inspired, Bold"
                          className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                        />
                        <button
                          onClick={async () => {
                            if (!data?.selected_name) {
                              alert('Please select a business name first');
                              return;
                            }
                            setGeneratingStyle(true);
                            try {
                              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ai-suggestions`, {
                                method: 'POST',
                                headers: {
                                  'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY,
                                  context: `Business: ${data.selected_name}. Industry: ${logoAnswers.industry}. Personality: ${logoAnswers.brandPersonality}`,
                                  prompt: 'Suggest an ideal logo style (1-2 descriptive words)'
                                }),
                              });
                              const result = await response.json();
                              setLogoAnswers({ ...logoAnswers, preferredStyle: result.suggestion || '' });
                            } catch (err) {
                              console.error('Error generating style:', err);
                            } finally {
                              setGeneratingStyle(false);
                            }
                          }}
                          disabled={generatingStyle || !data?.selected_name}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#2979FF] hover:text-[#2979FF]/80 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Generate with AI"
                        >
                          {generatingStyle ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Sparkles size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleGenerateLogoConcepts}
                        disabled={generatingLogoConcepts}
                        className="flex-1 px-6 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Sparkles size={18} />
                        Generate Logos
                      </button>
                      <button
                        onClick={() => {
                          setLogoAnswers({
                            businessDescription: '',
                            targetAudience: '',
                            brandPersonality: '',
                            industry: '',
                            preferredStyle: '',
                          });
                        }}
                        className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm hover:bg-white/10 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                )}

                {data.logo_data?.concepts && data.logo_data.concepts.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">Choose your favorite logo design:</p>
                      <button
                        onClick={() => {
                          if (confirm('Generate new logos? Your current logos will be replaced.')) {
                            handleGenerateLogoConcepts();
                          }
                        }}
                        disabled={generatingLogoConcepts}
                        className="px-4 py-2 bg-white/5 text-white rounded-lg text-sm hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-white/10"
                      >
                        {generatingLogoConcepts ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles size={14} />
                            Generate New Logos
                          </>
                        )}
                      </button>
                    </div>

                    {generatingLogoConcepts && (
                      <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white">
                            Creating Logo {logoProgress.current} of {logoProgress.total}
                          </span>
                          <span className="text-sm text-[#2979FF] font-semibold">
                            {Math.round((logoProgress.current / logoProgress.total) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="h-full bg-[#2979FF] transition-all duration-500 ease-out"
                            style={{ width: `${(logoProgress.current / logoProgress.total) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                          {logoProgress.current === 0 && 'Initializing logo generation...'}
                          {logoProgress.current > 0 && logoProgress.current < logoProgress.total && 'Generating professional logo concepts with AI...'}
                          {logoProgress.current === logoProgress.total && 'Finalizing your logos...'}
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      {data.logo_data.concepts.map((concept, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectLogo(concept)}
                          className={`p-4 rounded-lg transition-all ${
                            data.logo_data?.selected?.name === concept.name
                              ? 'bg-[#2979FF]/20 border-2 border-[#2979FF]'
                              : 'bg-white/5 border border-white/10 hover:bg-white/10'
                          }`}
                        >
                          <div className="w-full aspect-square mb-3 bg-white rounded-lg overflow-hidden">
                            <img
                              src={concept.imageUrl}
                              alt={concept.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <p className="text-sm font-semibold text-white text-center mb-1">{concept.name}</p>
                          <p className="text-xs text-gray-400 text-center">{concept.description}</p>
                        </button>
                      ))}
                    </div>

                    {data.logo_data?.selected && (
                      <div className="mt-6 space-y-4">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-white font-semibold">Selected Logo</h4>
                            <button
                              onClick={() => setEditingLogo(!editingLogo)}
                              className="px-3 py-1 bg-[#2979FF] text-white rounded-lg text-sm flex items-center gap-2 hover:bg-[#2979FF]/90 transition-colors"
                            >
                              {editingLogo ? (
                                <>
                                  <X size={14} />
                                  Cancel
                                </>
                              ) : (
                                <>
                                  <Edit2 size={14} />
                                  Make Changes
                                </>
                              )}
                            </button>
                          </div>

                          <div className="flex gap-4">
                            <div className="w-32 h-32 bg-white rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                              <img
                                src={data.logo_data.selected.imageUrl}
                                alt={data.logo_data.selected.name}
                                className="w-full h-full object-contain"
                              />
                            </div>

                            <div className="flex-1">
                              <p className="text-white font-medium mb-1">{data.logo_data.selected.name}</p>
                              <p className="text-gray-400 text-xs mb-2">{data.logo_data.selected.description}</p>
                              <p className="text-gray-500 text-xs mb-3">AI-generated using DALL-E 3</p>

                              {editingLogo && (
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-sm text-gray-400 mb-1 block">
                                      Describe changes you'd like:
                                    </label>
                                    <textarea
                                      value={customPrompt}
                                      onChange={(e) => setCustomPrompt(e.target.value)}
                                      placeholder="E.g., make it more rounded, add a border, simplify the design, etc."
                                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#2979FF] resize-none"
                                      rows={3}
                                    />
                                  </div>
                                  <button
                                    onClick={handleRegenerateLogoWithChanges}
                                    disabled={regeneratingLogo || !customPrompt.trim()}
                                    className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg text-sm font-semibold hover:bg-[#06D6A0]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    {regeneratingLogo ? (
                                      <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Applying Changes...
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={14} />
                                        Apply Changes
                                      </>
                                    )}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {data.completed_steps.includes('generate-names') &&
                         data.completed_steps.includes('select-colors') &&
                         data.completed_steps.includes('generate-logo') && (
                          <div className="flex justify-end mt-6">
                            <button
                              onClick={() => {
                                completionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                              }}
                              className="px-6 py-3 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2"
                            >
                              View Completion
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {data.completed_steps.includes('generate-names') &&
           data.completed_steps.includes('select-colors') &&
           data.completed_steps.includes('generate-logo') && (
            <div ref={completionRef} className="bg-gradient-to-r from-[#2979FF]/20 to-[#2979FF]/10 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-white mb-4 text-center font-['Montserrat']">
                Brand Identity Complete! 🎉
              </h2>
              <p className="text-gray-300 mb-6 text-center">
                You've created your brand foundation. Download your brand guide or continue to the next phase.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleDownloadBrandGuide}
                  disabled={generatingGuide}
                  className="px-8 py-3 bg-[#06D6A0] text-white rounded-lg font-bold text-lg hover:bg-[#06D6A0]/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {generatingGuide ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generating Guide...
                    </>
                  ) : (
                    <>
                      <Download size={20} />
                      Download Brand Guide
                    </>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/marketing-assets?ideaKey=${ideaKey}`)}
                  className="px-8 py-3 bg-[#2979FF] text-white rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
                >
                  Continue to Marketing Assets →
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
