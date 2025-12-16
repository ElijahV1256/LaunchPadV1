import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Home, CheckCircle2, Circle, Loader2, Sparkles, RefreshCw, CreditCard as Edit2, X, Download, Upload, Bookmark, BookmarkCheck } from 'lucide-react';
import { generateLogoConcepts, regenerateLogoWithChanges, generateCompleteBrandFoundation } from '../services/openai';
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
  selected_tagline?: string | null;
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
  const [logoAnswers, setLogoAnswers] = useState({
    businessDescription: '',
    targetAudience: '',
    brandPersonality: '',
    industry: '',
    preferredStyle: '',
  });
  const [logoSuggestions, setLogoSuggestions] = useState('');
  const [generatingGuide, setGeneratingGuide] = useState(false);
  const [generatingOffer, setGeneratingOffer] = useState(false);
  const [generatingAudience, setGeneratingAudience] = useState(false);
  const [generatingKeywords, setGeneratingKeywords] = useState(false);
  const [generatingPersonality, setGeneratingPersonality] = useState(false);
  const [generatingIndustry, setGeneratingIndustry] = useState(false);
  const [generatingStyle, setGeneratingStyle] = useState(false);
  const [generatingTagline, setGeneratingTagline] = useState(false);
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
          ideaKey,
          userId: currentUser?.id,
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

  const saveName = async (nameOption: NameOption) => {
    if (!currentUser || !ideaKey) return;

    try {
      const { error: saveError } = await supabase
        .from('saved_business_names')
        .insert({
          user_id: currentUser.id,
          idea_key: ideaKey,
          name: nameOption.name,
          tagline: nameOption.tagline || '',
          description: nameOption.reason,
        });

      if (saveError) {
        if (saveError.code === '23505') {
          alert('This name is already saved!');
        } else {
          throw saveError;
        }
        return;
      }

      alert(`"${nameOption.name}" has been saved!`);
    } catch (err: any) {
      console.error('Error saving name:', err);
      alert('Failed to save name. Please try again.');
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

      const selectedNameOption = updatedNames.find(n => n.name === name);
      const taglineToUse = selectedNameOption?.tagline || null;

      const { error: updateError } = await supabase
        .from('brand_identity')
        .update({
          business_names: updatedNames,
          selected_name: name,
          selected_tagline: taglineToUse,
          completed_steps: newCompletedSteps,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data!.id);

      if (updateError) {
        console.error('Error selecting name:', updateError);
        alert('Failed to save selected name. Please try again.');
        return;
      }

      setData({ ...data!, business_names: updatedNames, selected_name: name, selected_tagline: taglineToUse, completed_steps: newCompletedSteps });
    } catch (err) {
      console.error('Error selecting name:', err);
    }
  };

  const handleGenerateTagline = async () => {
    if (!data?.selected_name) {
      alert('Please select a business name first');
      return;
    }

    setGeneratingTagline(true);
    try {
      const businessDesc = logoAnswers.businessDescription || offerDescription || `A business called ${data.selected_name}`;
      const audience = logoAnswers.targetAudience || targetAudience;

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-tagline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName: data.selected_name,
          businessDescription: businessDesc,
          targetAudience: audience,
          brandPersonality: logoAnswers.brandPersonality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate tagline');
      }

      const result = await response.json();
      const tagline = result.tagline;

      await supabase
        .from('brand_identity')
        .update({
          selected_tagline: tagline,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id);

      setData({ ...data, selected_tagline: tagline });
    } catch (err) {
      console.error('Error generating tagline:', err);
      alert('Failed to generate tagline. Please try again.');
    } finally {
      setGeneratingTagline(false);
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
    setLogoProgress({ current: 0, total: 3 });

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
        logoSuggestions.trim() && `Additional requirements: ${logoSuggestions}`,
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

  const navigateToLogoEditor = (logoIndex?: number) => {
    if (!data?.id) return;

    const params = new URLSearchParams({ id: data.id });
    if (logoIndex !== undefined) {
      params.append('logo', logoIndex.toString());
    }

    navigate(`/logo-editor?${params.toString()}`);
  };

  const handleRegenerateLogoWithChanges = async (promptOverride?: string) => {
    const promptToUse = promptOverride || customPrompt;

    if (!promptToUse.trim() || !data?.logo_data?.selected) {
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
        promptToUse
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

      let slogan = data.selected_tagline;
      let brandFoundation = undefined;

      // Try to generate slogan if not already set
      if (!slogan) {
        try {
          slogan = await generateSlogan(
            data.selected_name,
            businessDesc,
            audience,
            logoAnswers.brandPersonality
          );
        } catch (err) {
          console.warn('Could not generate slogan, using default:', err);
          slogan = `Elevating ${data.selected_name}`;
        }
      }

      // Try to generate brand foundation
      try {
        brandFoundation = await generateCompleteBrandFoundation(
          data.selected_name,
          businessDesc,
          audience,
          logoAnswers.brandPersonality,
          logoAnswers.industry
        );
      } catch (err) {
        console.warn('Could not generate brand foundation, proceeding without it:', err);
        // brandFoundation remains undefined, guide will still generate without it
      }

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
        brandFoundation: brandFoundation,
      });
    } catch (err) {
      console.error('Error generating brand guide:', err);
      alert(`Failed to generate brand guide: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/saved-names?ideaKey=${ideaKey}`)}
                          className="text-xs text-[#06D6A0] hover:text-[#06D6A0]/80 transition-colors flex items-center gap-1"
                        >
                          <BookmarkCheck size={12} />
                          View Saved
                        </button>
                        <button
                          onClick={generateNames}
                          disabled={generating}
                          className="text-xs text-[#2979FF] hover:text-[#2979FF]/80 transition-colors flex items-center gap-1"
                        >
                          <RefreshCw size={12} className={generating ? 'animate-spin' : ''} />
                          Regenerate
                        </button>
                      </div>
                    </div>
                    {data.business_names.map((nameOption, idx) => (
                      <div key={idx} className="flex gap-2">
                        <button
                          onClick={() => selectName(nameOption.name)}
                          className={`flex-1 px-4 py-3 rounded-lg text-left transition-all ${
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
                        <button
                          onClick={() => saveName(nameOption)}
                          className="px-3 py-3 bg-[#06D6A0]/20 border border-[#06D6A0]/30 text-[#06D6A0] rounded-lg hover:bg-[#06D6A0]/30 transition-all flex items-center justify-center"
                          title="Save this name"
                        >
                          <Bookmark size={18} />
                        </button>
                      </div>
                    ))}

                    {data.selected_name && (
                      <div className="mt-4 p-4 bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="text-white font-bold text-lg mb-2">{data.selected_name}</div>
                            {data.selected_tagline ? (
                              <div className="text-gray-300 italic text-sm">"{data.selected_tagline}"</div>
                            ) : (
                              <div className="text-gray-400 text-sm">No tagline yet</div>
                            )}
                          </div>
                          <button
                            onClick={handleGenerateTagline}
                            disabled={generatingTagline}
                            className="px-4 py-2 bg-[#2979FF] text-white rounded-lg text-sm font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                          >
                            {generatingTagline ? (
                              <>
                                <Loader2 size={14} className="animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <RefreshCw size={14} />
                                {data.selected_tagline ? 'Regenerate' : 'Generate'} Tagline
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
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
                <h3 className="text-xl font-bold text-white mb-2">3. Logo Creation</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Generate text-based logos featuring your business name in different typography styles.
                </p>

                {!data.logo_data?.concepts?.length && !generatingLogoConcepts && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleGenerateLogoConcepts}
                      disabled={!data.selected_name || !data.brand_colors.primary}
                      className="flex-1 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Sparkles size={18} />
                      Generate Logos
                    </button>
                    <div>
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
                        className={`px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-medium hover:bg-white/15 transition-colors flex items-center gap-2 justify-center cursor-pointer ${
                          uploadingLogo ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploadingLogo ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </label>
                    </div>
                  </div>
                )}

                {uploadedLogoUrl && (
                  <div className="flex items-center gap-4 p-4 bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg mb-4">
                    <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
                      <img src={uploadedLogoUrl} alt="Uploaded logo" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">Custom Logo Uploaded</p>
                      <button onClick={removeUploadedLogo} className="text-xs text-red-400 hover:text-red-300 mt-1">
                        Remove
                      </button>
                    </div>
                  </div>
                )}

                {generatingLogoConcepts && (
                  <div className="flex flex-col items-center py-12">
                    <Loader2 size={48} className="animate-spin text-[#2979FF] mb-4" />
                    <p className="text-white font-medium mb-2">Generating {logoProgress.current} of {logoProgress.total} logos...</p>
                    <p className="text-gray-400 text-sm">This takes about 1-2 minutes</p>
                    <div className="w-full max-w-xs mt-4 bg-white/10 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-[#2979FF] transition-all duration-500"
                        style={{ width: `${(logoProgress.current / logoProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {data.logo_data?.concepts && data.logo_data.concepts.length > 0 && !generatingLogoConcepts && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      {data.logo_data.concepts.map((concept, idx) => (
                        <button
                          key={idx}
                          onClick={() => selectLogo(concept)}
                          className={`group relative rounded-xl overflow-hidden transition-all ${
                            data.logo_data?.selected?.imageUrl === concept.imageUrl
                              ? 'ring-2 ring-[#2979FF] ring-offset-2 ring-offset-[#0A192F]'
                              : 'hover:ring-2 hover:ring-white/30 hover:ring-offset-2 hover:ring-offset-[#0A192F]'
                          }`}
                        >
                          <div className="aspect-square bg-white p-3">
                            <img src={concept.imageUrl} alt={concept.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium text-sm">{concept.name}</span>
                          </div>
                          {data.logo_data?.selected?.imageUrl === concept.imageUrl && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-[#2979FF] rounded-full flex items-center justify-center">
                              <CheckCircle2 size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <button
                        onClick={() => handleGenerateLogoConcepts()}
                        disabled={generatingLogoConcepts}
                        className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <RefreshCw size={14} />
                        Regenerate
                      </button>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload-alt"
                        />
                        <label
                          htmlFor="logo-upload-alt"
                          className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Upload size={14} />
                          Upload instead
                        </label>
                      </div>
                    </div>

                    {data.logo_data?.selected && data.completed_steps.includes('generate-names') &&
                     data.completed_steps.includes('select-colors') &&
                     data.completed_steps.includes('generate-logo') && (
                      <div className="flex justify-end">
                        <button
                          onClick={() => scrollToSection(completionRef)}
                          className="px-6 py-3 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center gap-2"
                        >
                          Continue
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
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
                  onClick={() => navigate(`/website?ideaKey=${ideaKey}`)}
                  className="px-8 py-3 bg-[#2979FF] text-white rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all duration-300"
                >
                  Continue to Website →
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
