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

    // CRITICAL: Emphasize exact spelling preservation in all prompts
    const variations = [
      `Professional logo with the EXACT text "${businessName}" (spell it EXACTLY as shown) in clean typography with minimal icon. Use colors ${colors.primary}, ${colors.secondary}, ${colors.accent}. Modern, readable, correct spelling.`,
      `Modern logo featuring the EXACT business name "${businessName}" (preserve exact spelling and spacing) in bold typography with abstract icon. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Clean and professional.`,
      `Minimal logo with the text "${businessName}" spelled EXACTLY as shown, elegant typography with geometric icon. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Simple, sophisticated design with accurate spelling.`,
      `Bold logo with "${businessName}" in CORRECT spelling (no variations), strong typography with geometric symbol. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Contemporary and impactful with precise text.`,
      `Elegant logo with "${businessName}" spelled PRECISELY as written, refined text with abstract mark. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Sophisticated, memorable, accurate spelling.`,
      `Creative logo with "${businessName}" using EXACT spelling (maintain all spaces/capitalization), unique typography with visual icon. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Distinctive, professional, correct text.`
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
            style: 'vivid',
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