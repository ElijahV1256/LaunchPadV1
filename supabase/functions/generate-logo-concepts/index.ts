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
  const industryMap: Record<string, string> = {
    'technology': 'innovation, digital, connectivity, precision, forward-thinking',
    'healthcare': 'trust, care, wellness, protection, vitality',
    'finance': 'stability, growth, security, prosperity, precision',
    'food': 'freshness, warmth, nourishment, craftsmanship, delight',
    'fitness': 'strength, energy, movement, transformation, vitality',
    'education': 'growth, knowledge, enlightenment, potential, discovery',
    'real estate': 'stability, home, foundation, aspiration, shelter',
    'beauty': 'elegance, refinement, transformation, radiance, luxury',
    'consulting': 'expertise, guidance, insight, partnership, strategy',
    'retail': 'quality, value, discovery, experience, accessibility',
    'construction': 'strength, reliability, craftsmanship, foundation, building',
    'legal': 'justice, trust, authority, precision, advocacy',
    'creative': 'imagination, expression, innovation, artistry, vision',
    'automotive': 'performance, precision, reliability, speed, engineering',
    'hospitality': 'warmth, welcome, comfort, experience, service',
  };
  
  const lowerIndustry = industry.toLowerCase();
  for (const [key, value] of Object.entries(industryMap)) {
    if (lowerIndustry.includes(key)) {
      return value;
    }
  }
  return 'professionalism, quality, trust, innovation, excellence';
};

const svgToDataUrl = (svg: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
};

const extractSvg = (content: string): string | null => {
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    return svgMatch[0];
  }
  return null;
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { businessName, industry, brandColors } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!industry) {
      return new Response(
        JSON.stringify({ error: "industry is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Starting SVG logo generation for:', businessName, 'in', industry);
    
    const industryKeywords = getIndustryKeywords(industry);
    const primaryColor = brandColors?.primary || '#2563eb';
    const secondaryColor = brandColors?.secondary || '#1e40af';
    const accentColor = brandColors?.accent || '#3b82f6';

    const systemPrompt = `You are an expert logo designer who creates beautiful, professional SVG logos. You output ONLY valid SVG code - no explanations, no markdown, no code blocks, just the raw SVG.

Rules for your SVG logos:
- ViewBox must be "0 0 100 100"
- Create ICON-ONLY logos - NO text, letters, or words
- Use clean, geometric shapes
- Logos must be centered and balanced
- Use the provided brand colors
- Keep designs simple but distinctive
- Ensure the design works at any size
- Use modern, professional aesthetics
- No gradients with more than 2 stops
- No complex filters or effects
- Maximum 10-15 path elements for simplicity`;

    const variations = [
      {
        name: 'Minimal Geometric',
        style: `Create a minimal geometric logo using simple bold shapes like circles, squares, or triangles. Think Apple or Nike simplicity. Use solid fills, maximum 2 colors. The shape should be iconic and instantly recognizable.`
      },
      {
        name: 'Modern Abstract',
        style: `Create an abstract modern logo with flowing curves and contemporary aesthetics. Think Airbnb or Spotify. The design should suggest movement or connection through abstract forms.`
      },
      {
        name: 'Elegant Linework',
        style: `Create an elegant logo using refined linework and strokes. Think luxury brand aesthetics. Use consistent stroke widths, create something sophisticated and premium-feeling.`
      },
      {
        name: 'Bold Symbol',
        style: `Create a bold, confident symbol that commands attention. Think Target or FedEx. Strong silhouette, high contrast, solid shapes that work at any size.`
      },
      {
        name: 'Layered Shapes',
        style: `Create a logo using overlapping or layered geometric shapes with transparency. Think Mastercard or Olympics. Use 2-3 shapes that interact to create visual interest.`
      },
      {
        name: 'Dynamic Mark',
        style: `Create a dynamic logo with a sense of motion or energy. Think Pepsi or Sprint. Curved elements suggest movement while maintaining professional polish.`
      }
    ];

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      console.log(`Generating logo ${i + 1}/${variations.length}: ${variation.name}`);

      const userPrompt = `Create an SVG logo for "${businessName}" in the ${industry} industry.

Brand values: ${industryKeywords}

Colors to use:
- Primary: ${primaryColor}
- Secondary: ${secondaryColor}
- Accent: ${accentColor}

Style: ${variation.style}

Output ONLY the SVG code, nothing else.`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.9,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error for logo ${i + 1}:`, errorText);
          throw new Error('API request failed');
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        
        const svg = extractSvg(content);
        
        if (svg) {
          const imageUrl = svgToDataUrl(svg);
          concepts.push({
            name: variation.name,
            description: `${variation.name} style logo for ${businessName}`,
            imageUrl: imageUrl,
            prompt: variation.style,
          });
          console.log(`Logo ${i + 1} (${variation.name}) generated successfully`);
        } else {
          console.error(`No valid SVG found in response for logo ${i + 1}`);
        }
      } catch (error) {
        console.error(`Error generating logo ${i + 1}:`, error);
      }
    }

    console.log(`Generated ${concepts.length} logo concepts total`);

    if (concepts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate logos. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ concepts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-logo-concepts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate logo concepts' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});