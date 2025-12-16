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

    const colors = brandColors || { primary: '#000000', secondary: '#666666', accent: '#999999' };

    const basePrompt = `Create a professional wordmark logo that displays the text "${businessName}" as the entire logo. This is a text-based logo design where the business name itself IS the logo. Use the colors ${colors.primary} (primary), ${colors.secondary} (secondary), and ${colors.accent} (accent). The design should be on a clean white background, suitable for business use. No icons, no symbols, no graphics - ONLY the stylized text "${businessName}" as a typographic logo.`;

    const variations = [
      `${basePrompt} Use a bold, modern sans-serif typography style. Make it clean, professional, and memorable.`,
      `${basePrompt} Use an elegant, sophisticated serif typography style. Make it look premium and trustworthy.`,
      `${basePrompt} Use a creative, unique custom lettering style. Make it distinctive and eye-catching while remaining professional.`
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
          const styleNames = ['Modern Sans-Serif', 'Elegant Serif', 'Custom Lettering'];
          const styleDescriptions = [
            'Bold, modern typography with clean lines',
            'Sophisticated serif typography with a premium feel',
            'Creative custom lettering with a unique style'
          ];
          concepts.push({
            name: `${businessName} - ${styleNames[i]}`,
            description: styleDescriptions[i],
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