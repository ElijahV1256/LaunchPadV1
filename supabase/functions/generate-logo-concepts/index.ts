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

    const variations = [
      `A professional logo design with text that says "${businessName}" in clean sans-serif typography, paired with a minimal geometric icon. Color palette: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Modern and readable. High quality business logo.`,
      `A modern logo with bold text that says "${businessName}" combined with an abstract icon symbol. Use colors ${colors.primary}, ${colors.secondary}, and ${colors.accent}. Clean, professional design. High detail.`,
      `A minimalist logo featuring elegant text that says "${businessName}" with a simple geometric icon element. Colors: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Sophisticated and simple. Premium quality.`,
      `A bold logo design with strong text that says "${businessName}" alongside a geometric symbol. Color scheme: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Contemporary and impactful. Professional grade.`,
      `An elegant logo with refined text that says "${businessName}" paired with an abstract mark. Using colors ${colors.primary}, ${colors.secondary}, and ${colors.accent}. Sophisticated and memorable. Ultra high quality.`,
      `A creative logo combining unique text that says "${businessName}" with a distinctive visual icon. Color palette: ${colors.primary}, ${colors.secondary}, ${colors.accent}. Professional and eye-catching. Premium design.`
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
            model: 'gpt-image-1.5',
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