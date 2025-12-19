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
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({
          error: "Anthropic API key not configured in Supabase. Please set ANTHROPIC_API_KEY in Project Settings > Edge Functions > Secrets"
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

    const styleDescriptions = [
      "A professional logo with clean sans-serif typography and a minimal geometric icon.",
      "A modern logo with bold typography combined with an abstract icon symbol.",
      "A minimalist logo featuring elegant text with a simple geometric icon element.",
      "A bold logo design with strong typography alongside a geometric symbol.",
      "An elegant logo with refined text paired with an abstract mark.",
      "A creative logo combining unique typography with a distinctive visual icon."
    ];

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < styleDescriptions.length; i++) {
      const styleDescription = styleDescriptions[i];

      console.log(`Generating logo ${i + 1}/${styleDescriptions.length}`);

      const prompt = `Create a professional SVG logo design. Requirements:

Business Name: ${businessName}
Business Description: ${descriptionText}
Brand Personality: ${personalityText}
Style: ${styleDescription}
Colors to use: Primary ${colors.primary}, Secondary ${colors.secondary}, Accent ${colors.accent}

IMPORTANT REQUIREMENTS:
1. The business name "${businessName}" must be spelled EXACTLY as shown - character for character, preserving all spaces, capitalization, and spelling
2. Use clean, readable typography that matches the style description
3. Include a simple icon or graphic element that complements the text
4. The logo should be suitable for professional business use
5. Create a complete, production-ready SVG with proper viewBox="0 0 400 400"
6. Make sure all text is legible and properly positioned

Generate ONLY the SVG code, starting with <svg and ending with </svg>. Do not include any explanations or markdown formatting.`;

      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [
              {
                role: 'user',
                content: prompt
              }
            ]
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          console.error(`Anthropic API error for logo ${i + 1}:`, error);
          continue;
        }

        const data = await response.json();
        let svgCode = data.content[0]?.text;

        if (svgCode) {
          svgCode = svgCode.trim();
          if (svgCode.includes('```')) {
            svgCode = svgCode.replace(/```svg\n?/g, '').replace(/```\n?/g, '').trim();
          }
          
          if (!svgCode.startsWith('<svg')) {
            const svgMatch = svgCode.match(/<svg[\s\S]*<\/svg>/);
            if (svgMatch) {
              svgCode = svgMatch[0];
            }
          }

          const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgCode)}`;

          concepts.push({
            name: `${businessName} Logo ${i + 1}`,
            description: styleDescription,
            imageUrl: svgDataUrl,
            prompt: styleDescription,
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