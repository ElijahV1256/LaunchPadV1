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

const getIndustryKeywords = (industry: string): string => {
  const lower = industry.toLowerCase();
  if (lower.includes('tech') || lower.includes('software') || lower.includes('digital')) {
    return 'technology, innovation, digital connectivity, modern circuits';
  }
  if (lower.includes('health') || lower.includes('medical') || lower.includes('wellness')) {
    return 'healthcare, wellness, vitality, care, medical';
  }
  if (lower.includes('finance') || lower.includes('bank') || lower.includes('invest')) {
    return 'finance, growth, stability, prosperity, wealth';
  }
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe')) {
    return 'culinary, food, freshness, dining, gastronomy';
  }
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('sport')) {
    return 'fitness, strength, athletics, energy, movement';
  }
  if (lower.includes('education') || lower.includes('school') || lower.includes('learn')) {
    return 'education, learning, knowledge, growth, enlightenment';
  }
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('home')) {
    return 'real estate, property, home, architecture, building';
  }
  if (lower.includes('beauty') || lower.includes('salon') || lower.includes('spa')) {
    return 'beauty, elegance, luxury, refinement, aesthetics';
  }
  if (lower.includes('consult') || lower.includes('business') || lower.includes('service')) {
    return 'business, consulting, strategy, professional, expertise';
  }
  if (lower.includes('construct') || lower.includes('build') || lower.includes('architect')) {
    return 'construction, building, architecture, engineering, structure';
  }
  if (lower.includes('legal') || lower.includes('law') || lower.includes('attorney')) {
    return 'legal, justice, law, authority, trust';
  }
  if (lower.includes('creative') || lower.includes('design') || lower.includes('art')) {
    return 'creative, artistic, design, imagination, visual';
  }
  if (lower.includes('auto') || lower.includes('car') || lower.includes('vehicle')) {
    return 'automotive, speed, precision, engineering, performance';
  }
  if (lower.includes('travel') || lower.includes('tourism') || lower.includes('hotel')) {
    return 'travel, adventure, exploration, hospitality, journey';
  }
  return 'professional, quality, trust, innovation, excellence';
};

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

    const { businessName, industry, brandColors } = await req.json();

    if (!businessName || !industry) {
      return new Response(
        JSON.stringify({ error: "businessName and industry are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Generating DALL-E 3 logos for:', businessName, 'in', industry);

    const primary = brandColors?.primary || '#2563eb';
    const secondary = brandColors?.secondary || '#1e40af';
    const industryKeywords = getIndustryKeywords(industry);

    const basePrompt = `Professional minimalist logo design for "${businessName}", a ${industry} company. Clean vector style, simple geometric shapes, modern and memorable. Keywords: ${industryKeywords}. Brand colors: ${primary} and ${secondary}. White or transparent background. No text, no letters, icon only. High-end corporate quality.`;

    const variations = [
      {
        name: 'Minimal Geometric',
        prompt: `${basePrompt} Style: Ultra-minimal geometric icon, single bold shape, Apple/Nike level simplicity.`
      },
      {
        name: 'Abstract Symbol',
        prompt: `${basePrompt} Style: Abstract flowing symbol with elegant curves, Airbnb/Spotify aesthetic.`
      },
      {
        name: 'Modern Badge',
        prompt: `${basePrompt} Style: Modern badge or emblem design, clean circular or shield shape containing a simple icon.`
      },
      {
        name: 'Dynamic Mark',
        prompt: `${basePrompt} Style: Dynamic logomark suggesting motion and energy, sleek and contemporary.`
      },
      {
        name: 'Layered Shapes',
        prompt: `${basePrompt} Style: Overlapping geometric shapes with transparency, Mastercard/Olympics style.`
      },
      {
        name: 'Iconic Symbol',
        prompt: `${basePrompt} Style: Bold iconic symbol that works at any size, strong silhouette, high contrast.`
      }
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
            quality: 'standard',
            response_format: 'url',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`DALL-E API error for ${variation.name}:`, errorText);
          continue;
        }

        const data = await response.json();
        const imageUrl = data.data?.[0]?.url;

        if (imageUrl) {
          concepts.push({
            name: variation.name,
            description: `${variation.name} logo for ${businessName}`,
            imageUrl: imageUrl,
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