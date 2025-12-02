interface BrandData {
  selected_name?: string;
  offer_description?: string;
  target_audience?: string;
  brand_keywords?: string;
  brand_colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface StoryBrandData {
  character?: string;
  problem?: string;
  guide?: string;
  plan?: string;
  call_to_action?: string;
  success?: string;
  failure?: string;
}

export function buildStoryBrandFlyerPrompt(
  brandData: BrandData | null,
  storyBrandData: StoryBrandData | null
): string {
  const businessName = brandData?.selected_name || 'Your Business';
  const targetAudience = brandData?.target_audience || storyBrandData?.character || 'customers';
  const problem = storyBrandData?.problem || 'solving their challenges';
  const solution = brandData?.offer_description || storyBrandData?.guide || 'providing expert solutions';
  const brandPromise = storyBrandData?.success || 'achieving success';
  const tone = brandData?.brand_keywords || 'professional, trustworthy';
  const primaryColor = brandData?.brand_colors?.primary || '#2979FF';
  const accentColor = brandData?.brand_colors?.accent || '#06D6A0';
  const cta = storyBrandData?.call_to_action || 'Get Started Today';

  return `
Create a clean, modern marketing flyer layout (no readable text) based on this StoryBrand brand guide:

Business Name: ${businessName}
Target Audience: ${targetAudience}
Main Problem: ${problem}
Solution / Unique Value: ${solution}
Brand Promise: ${brandPromise}
Desired Tone: ${tone}
Primary Brand Colors: ${primaryColor}, ${accentColor}
Call To Action: ${cta}

Design Requirements:
- Minimal, professional layout
- No readable text
- Use brand colors in accents
- Strong shapes, sections, and composition
- Prominent hero area
- Space for headline, subheadline, benefits, call-to-action
- Premium, agency-level aesthetic
- Bold but clean geometric visual structure

Output a layout-only design with zero words.
  `.trim();
}
