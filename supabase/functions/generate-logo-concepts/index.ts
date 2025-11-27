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
      brandColors,
      businessDescription,
      brandPersonality,
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

    console.log('Starting logo generation for:', businessName);

    const descriptionText = businessDescription || `A business called ${businessName}`;
    const personalityText = brandPersonality || 'professional, modern, trustworthy';
    const colors = brandColors || { primary: '#000000', secondary: '#666666', accent: '#999999' };

    const basePrompt = `Design a premium, iconic logo mark for ${descriptionText}.
Brand personality: ${personalityText}
Primary color: ${colors.primary}
Secondary color: ${colors.secondary}
Accent color: ${colors.accent}

DESIGN REQUIREMENTS:
- Icon/symbol ONLY - absolutely NO text, letters, words, or business names
- Think Apple, Nike swoosh, Target circles, McDonald's arches - instantly recognizable icon marks
- Bold, confident, memorable design that works at any size
- Modern and timeless aesthetic
- Perfect for app icons, favicons, social media avatars, and brand marks
- Simple enough to be drawn from memory, but distinctive and unique
- Professional quality suitable for Fortune 500 companies
- Uses 2-3 colors maximum from the provided palette
- Clean vector-style design with smooth curves and precise geometry
- High contrast and visual impact
- Centered composition on white/transparent background
- Should evoke the business concept through pure visual form

STYLE INSPIRATION: World-class brands like Spotify, Airbnb, Slack, Dropbox, Twitter bird, Instagram camera - simple iconic symbols that define brands.

CRITICAL: NO TEXT ANYWHERE. This is a pure icon/symbol only.`;

    const variations = [
      'bold geometric logo mark with strong recognizable shape, inspired by modern tech brands',
      'elegant minimalist symbol with refined curves and balance, premium luxury feel',
      'distinctive abstract icon mark with unique memorable silhouette'
    ];

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const fullPrompt = `${basePrompt}

SPECIFIC STYLE: ${variation}

Create an iconic, world-class logo mark. Think of the most memorable brand icons you know - that level of quality and impact. ICON ONLY - absolutely NO text, letters, or words.`;

      console.log(`Generating logo ${i + 1}/${variations.length}:`, variation);

      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: fullPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            style: 'natural',
            response_format: 'url',
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`OpenAI API error for logo ${i + 1}:`, error);
          continue;
        }

        const data = await response.json();
        const imageUrl = data.data[0]?.url;

        if (imageUrl) {
          concepts.push({
            name: `${businessName} - ${variation.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
            description: `A professional icon-only logo mark featuring ${variation}, designed with your brand colors in a clean, modern style.`,
            imageUrl: imageUrl,
            prompt: fullPrompt,
          });
          console.log(`Logo ${i + 1} generated successfully`);
        }
      } catch (error) {
        console.error(`Error generating logo ${i + 1}:`, error);
      }
    }

    console.log(`Generated ${concepts.length} logo concepts total`);

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