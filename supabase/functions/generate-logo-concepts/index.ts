import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

function getIndustryIcon(industry: string): string {
  const lower = industry.toLowerCase();
  if (lower.includes('tech') || lower.includes('software') || lower.includes('digital') || lower.includes('app'))
    return 'abstract digital/tech symbol';
  if (lower.includes('health') || lower.includes('medical') || lower.includes('wellness'))
    return 'health or wellness symbol';
  if (lower.includes('finance') || lower.includes('bank') || lower.includes('invest'))
    return 'growth or financial symbol';
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe') || lower.includes('bakery'))
    return 'culinary or food symbol';
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('sport'))
    return 'fitness or movement symbol';
  if (lower.includes('education') || lower.includes('school') || lower.includes('learn') || lower.includes('tutor'))
    return 'education or knowledge symbol';
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('home'))
    return 'property or home symbol';
  if (lower.includes('beauty') || lower.includes('salon') || lower.includes('spa'))
    return 'beauty or elegance symbol';
  if (lower.includes('construct') || lower.includes('build') || lower.includes('architect'))
    return 'building or structure symbol';
  if (lower.includes('legal') || lower.includes('law') || lower.includes('attorney'))
    return 'justice or trust symbol';
  if (lower.includes('creative') || lower.includes('design') || lower.includes('art') || lower.includes('photo'))
    return 'creative or artistic symbol';
  if (lower.includes('auto') || lower.includes('car') || lower.includes('vehicle'))
    return 'automotive or precision symbol';
  if (lower.includes('travel') || lower.includes('tourism') || lower.includes('hotel'))
    return 'travel or exploration symbol';
  if (lower.includes('clean') || lower.includes('maid') || lower.includes('janitorial'))
    return 'cleanliness or sparkle symbol';
  if (lower.includes('pet') || lower.includes('animal') || lower.includes('vet'))
    return 'animal or pet symbol';
  if (lower.includes('landscap') || lower.includes('garden') || lower.includes('lawn'))
    return 'nature or growth symbol';
  return 'professional business symbol';
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { businessName, industry, brandColors, businessDescription, brandPersonality } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Generating logos for:', businessName, 'in', industry || 'general');

    const primary = brandColors?.primary || '#2563eb';
    const secondary = brandColors?.secondary || '#1e40af';
    const accent = brandColors?.accent || primary;
    const iconHint = getIndustryIcon(industry || 'business');

    const contextLine = businessDescription
      ? `The business: ${businessDescription.slice(0, 120)}.`
      : '';
    const personalityLine = brandPersonality
      ? `Brand feel: ${brandPersonality.slice(0, 100)}.`
      : '';

    const coreRules = `STRICT RULES: Absolutely NO text, NO letters, NO words, NO typography anywhere in the image. Icon only. Pure white background (#FFFFFF). Single centered mark. Flat 2D vector style. No gradients. No shadows. No 3D effects. No photorealism. No textures. Think SVG-quality simplicity.`;

    const variations = [
      {
        name: 'Clean Geometric',
        desc: 'A single bold geometric shape — ultra minimal',
        prompt: `A single minimal geometric ${iconHint} logo mark in ${primary}. One simple bold shape, maximum 2-3 elements total. Inspired by the simplicity of Apple, Nike, or Target logos. ${contextLine} ${personalityLine} ${coreRules}`,
      },
      {
        name: 'Abstract Mark',
        desc: 'Flowing abstract symbol with elegant curves',
        prompt: `An abstract flowing logo mark — a ${iconHint} rendered as smooth curves and rounded forms in ${primary} and ${secondary}. Elegant and organic, like Airbnb or Spotify branding. Maximum 2-3 visual elements. ${contextLine} ${personalityLine} ${coreRules}`,
      },
      {
        name: 'Letterform Icon',
        desc: 'The first letter stylized as a distinctive mark',
        prompt: `A single stylized letter "${businessName.charAt(0).toUpperCase()}" transformed into a unique ${iconHint} logo mark using ${primary} and ${accent}. The letter should be abstracted into a creative icon shape, not just a plain letter. Think how Beats by Dre uses "b" or how Uber stylizes "U". Minimal, modern, distinctive. ${contextLine} ${personalityLine} STRICT RULES: Only this ONE stylized letter-icon, no other text. Pure white background (#FFFFFF). Flat 2D vector style. No gradients. No shadows. No 3D. No photorealism. SVG-quality simplicity.`,
      },
      {
        name: 'Negative Space',
        desc: 'Clever use of negative space within a simple shape',
        prompt: `A clever negative-space logo mark: a simple ${iconHint} created by the negative space inside a solid geometric shape in ${primary}. Think FedEx arrow or WWF panda style. One shape, one hidden form. Ultra minimal. ${contextLine} ${personalityLine} ${coreRules}`,
      },
      {
        name: 'Line Art',
        desc: 'Single continuous line forming a recognizable symbol',
        prompt: `A continuous single-line ${iconHint} logo drawn with one clean stroke in ${primary}. Minimal line art, like a wire sculpture. Thin consistent line weight. Elegant and modern. Maximum simplicity. ${contextLine} ${personalityLine} ${coreRules}`,
      },
      {
        name: 'Bold Symbol',
        desc: 'Strong iconic silhouette that works at any size',
        prompt: `A bold solid silhouette ${iconHint} logo in ${primary}. Strong recognizable shape that reads clearly at 16px and 1600px. High contrast, thick forms, confident and modern. Like the Twitter bird or the Apple apple. ${contextLine} ${personalityLine} ${coreRules}`,
      },
    ];

    const concepts: LogoConcept[] = [];

    for (const variation of variations) {
      console.log(`Generating: ${variation.name}`);

      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: variation.prompt,
            n: 1,
            size: '1024x1024',
            quality: 'hd',
            style: 'natural',
            response_format: 'url',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`DALL-E error for ${variation.name}:`, errorText);
          continue;
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;

        if (imageUrl) {
          concepts.push({
            name: variation.name,
            description: variation.desc,
            imageUrl,
            prompt: variation.prompt,
          });
          console.log(`${variation.name} generated successfully`);
        }
      } catch (error) {
        console.error(`Error generating ${variation.name}:`, error);
      }
    }

    if (concepts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate logos. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generated ${concepts.length} logo concepts`);

    return new Response(
      JSON.stringify({ concepts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate logos' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
