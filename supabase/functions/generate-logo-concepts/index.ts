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

    const primaryColor = brandColors?.primary || '#2563eb';

    const logoPrompt = `Professional business logo for "${businessName}".
Style: Clean, minimal, modern. The kind of logo a real company would actually use.
Requirements:
- Simple flat design, 1 to 2 colors maximum
- Transparent or solid white background
- Either a simple icon/symbol combined with the business name as clean text, OR a bold stylized lettermark using the first letter of "${businessName}"
- NO gradients, NO drop shadows, NO glow effects, NO 3D effects, NO clip art
- NO busy patterns, NO decorative flourishes
- Inspired by logos like Stripe, Linear, Notion, Vercel, Figma — minimal and confident
- The icon should be geometric, sharp, and scalable
- If including the business name as text, use a clean sans-serif style
- Primary color: ${primaryColor}
- White or very light background so it works on any surface
The logo must look like it was designed by a professional graphic designer, not AI generated. Simple. Trustworthy. Memorable.`;

    const variations = [
      { name: 'Concept A', desc: 'Clean professional logo' },
      { name: 'Concept B', desc: 'Clean professional logo' },
      { name: 'Concept C', desc: 'Clean professional logo' },
      { name: 'Concept D', desc: 'Clean professional logo' },
      { name: 'Concept E', desc: 'Clean professional logo' },
      { name: 'Concept F', desc: 'Clean professional logo' },
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
            prompt: logoPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
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
            prompt: logoPrompt,
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
