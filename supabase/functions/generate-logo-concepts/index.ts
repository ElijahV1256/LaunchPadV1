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

    const basePrompt = `You are the Launch Pad Logo Generator. Create a SIMPLE, CLEAN, MINIMAL logo.

BUSINESS NAME (MUST BE SPELLED EXACTLY): "${businessName}"
Business description: ${descriptionText}
Brand personality: ${personalityText}
Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}

STRICT REQUIREMENTS:
- Logo must contain ONLY: business name + one very small simple icon
- Icon must be: line art, geometric shape, or single simple shape
- NO detailed illustrations, NO mascots, NO characters, NO complex graphics
- NO gradients (unless very simple), NO 3D effects, NO multiple icons
- NO busy compositions
- Clean, minimal, flat design
- Modern sans-serif typography
- Balanced spacing and white space
- Professional and trustworthy look
- Easy to recreate in Canva, Adobe Express, or Figma
- White or transparent background

CRITICAL: Verify spelling is EXACTLY "${businessName}" letter-by-letter.`;

    const variations = [
      'business name with one minimal geometric icon (circle, square, or triangle based)',
      'business name with one simple line art icon',
      'business name with one clean abstract symbol'
    ];

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < variations.length; i++) {
      const variation = variations[i];
      const fullPrompt = `${basePrompt}

SPECIFIC VARIATION: ${variation}

Remember: Keep it minimal, clean, and simple. Business name "${businessName}" spelled exactly + one small simple icon only.`;

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
            description: `A professional logo featuring ${variation}, designed with your brand colors in a clean, modern style.`,
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