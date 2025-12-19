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
      industry,
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

    const basePrompt = `Create an original, modern logo for a business named '${businessName}' in the '${industry}' industry. Make it stylistically aligned with typical logos in this industry (category design language) while remaining clearly original and not resembling any specific real brand. Provide a clean, professional, scalable logo suitable for web and print. No mockups, no watermarks, no copyrighted/trademarked elements.`;

    const variations = [
      `${basePrompt} Style: Minimal geometric design with clean lines and simple shapes. Icon-only or with minimal text. Perfect for modern tech and professional services.`,
      `${basePrompt} Style: Friendly modern approach with rounded elements and approachable typography. Warm and welcoming feel suitable for consumer-facing brands.`,
      `${basePrompt} Style: Premium monoline design with elegant single-stroke linework. Sophisticated and refined, ideal for luxury or upscale positioning.`,
      `${basePrompt} Style: Bold badge format with strong shapes and confident presence. Impactful design that commands attention.`,
      `${basePrompt} Style: Abstract mark with conceptual symbolism. Creative interpretation of brand values through modern abstract forms.`,
      `${basePrompt} Style: Icon-focused lettermark combining typography with symbolic elements. Balanced design merging text and visual identity.`
    ];

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < variations.length; i++) {
      const fullPrompt = variations[i];

      console.log(`Generating logo ${i + 1}/${variations.length}:`, fullPrompt);

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
            quality: 'hd',
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
            name: `${businessName} Logo ${i + 1}`,
            description: fullPrompt,
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