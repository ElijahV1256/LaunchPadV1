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
          error: "OpenAI API key not configured in Supabase. Please set OPENAI_API_KEY in Project Settings > Edge Functions > Secrets"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const {
      businessName,
      industry,
      brandColors,
    } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!industry) {
      return new Response(
        JSON.stringify({ error: "industry is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Starting logo generation for:', businessName, 'in', industry, 'industry');
    
    const industryKeywords = getIndustryKeywords(industry);
    const colorInstruction = brandColors?.primary 
      ? `Use a color palette inspired by ${brandColors.primary} as the dominant color.` 
      : 'Use sophisticated, professional colors.';

    const coreRequirements = `CRITICAL REQUIREMENTS:
- Create ONLY a symbol/icon/logomark - absolutely NO text, letters, words, or typography
- Pure white background (#FFFFFF), completely clean with no textures or gradients
- The icon must be centered and well-balanced
- Design must work at any size from favicon to billboard
- No mockups, no watermarks, no 3D effects, no drop shadows
- Clean vector-style appearance with crisp edges
- Single cohesive design, not multiple elements scattered
${colorInstruction}`;

    const contextPrompt = `Business context: '${businessName}' in the ${industry} industry. Brand values: ${industryKeywords}.`;

    const variations = [
      {
        name: 'Minimal Geometric',
        prompt: `${coreRequirements}\n\n${contextPrompt}\n\nDesign a minimal geometric logomark using simple, bold shapes. Think Apple logo, Nike swoosh, or Mastercard circles - iconic through simplicity. Use clean geometry: circles, squares, triangles, or elegant curves. The design should feel timeless and instantly recognizable. Flat design with no gradients. Maximum 2-3 colors.`
      },
      {
        name: 'Modern Abstract',
        prompt: `${coreRequirements}\n\n${contextPrompt}\n\nCreate a modern abstract logomark that cleverly represents the brand concept without being literal. Think Airbnb's belonging symbol or the Twitter bird - abstract yet meaningful. Smooth curves, flowing forms, and contemporary aesthetics. The shape should suggest movement, growth, or connection. Flat design with subtle color gradients allowed.`
      },
      {
        name: 'Elegant Monoline',
        prompt: `${coreRequirements}\n\n${contextPrompt}\n\nDesign a sophisticated monoline logomark using continuous single-weight linework. Think of premium brands like luxury car emblems or high-end fashion marks. Elegant, refined, and detailed enough to feel premium but simple enough to be memorable. Single color only - pure black or the brand's primary color on white.`
      },
      {
        name: 'Bold Symbol',
        prompt: `${coreRequirements}\n\n${contextPrompt}\n\nCreate a bold, confident symbol that commands attention. Think FedEx arrow, Amazon smile, or Target bullseye - simple but powerful. Strong silhouette that's instantly recognizable even at small sizes. High contrast, solid fills, no fine details. The icon should feel established and trustworthy.`
      },
      {
        name: 'Smart Negative Space',
        prompt: `${coreRequirements}\n\n${contextPrompt}\n\nDesign a clever logomark that uses negative space to create a hidden meaning or secondary symbol. Think FedEx hidden arrow or NBC peacock. The design should reward closer inspection while remaining clean and professional at first glance. Intelligent use of space creates depth and memorability.`
      },
      {
        name: 'Dynamic Mark',
        prompt: `${coreRequirements}\n\n${contextPrompt}\n\nCreate a dynamic logomark with a sense of motion, energy, or transformation. Think Pepsi globe, Sprint pin drop, or Spotify waves. The design should feel alive and forward-moving while maintaining professional polish. Curved elements suggest movement without being chaotic. May use gradients for depth.`
      }
    ];

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];

      console.log(`Generating logo ${i + 1}/${variations.length}: ${variation.name}`);

      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-image-1',
            prompt: variation.prompt,
            n: 1,
            size: '1024x1024',
            quality: 'high',
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`OpenAI API error for logo ${i + 1}:`, errorText);

          let errorMessage = 'Failed to generate image';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.error?.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }

          throw new Error(errorMessage);
        }

        const data = await response.json();
        const base64Image = data.data?.[0]?.b64_json;
        const imageUrl = base64Image
          ? `data:image/png;base64,${base64Image}`
          : data.data?.[0]?.url;

        if (imageUrl) {
          concepts.push({
            name: `${variation.name}`,
            description: `${variation.name} style logo for ${businessName}`,
            imageUrl: imageUrl,
            prompt: variation.prompt,
          });
          console.log(`Logo ${i + 1} (${variation.name}) generated successfully`);
        }
      } catch (error) {
        console.error(`Error generating logo ${i + 1}:`, error);
      }
    }

    console.log(`Generated ${concepts.length} logo concepts total`);

    if (concepts.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Failed to generate any logos. GPT Image models require API Organization Verification. Please verify your organization at https://platform.openai.com/settings/organization/general"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ concepts }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-logo-concepts:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to generate logo concepts'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});