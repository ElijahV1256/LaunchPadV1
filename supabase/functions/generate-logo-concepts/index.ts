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

    const basePrompt = `Create a premium symbol-only logo for a ${descriptionText}.
Brand personality: ${personalityText}

COLOR PALETTE (use these exact colors):
Primary: ${colors.primary}
Secondary: ${colors.secondary}
Accent: ${colors.accent}

STYLE REQUIREMENTS:
- Pure geometric symbol - NO text, NO letters, NO initials, NO words
- Clean, minimal, modern design aesthetic
- Simple geometric shapes: circles, arcs, lines, triangles, squares
- Use negative space intelligently
- Symmetrical or balanced asymmetric composition
- Soft curves or clean angles only
- High recognizability at small sizes (16px to 1024px)
- Premium studio-quality design
- 2-3 colors maximum from the provided palette
- White or light neutral background
- Centered, balanced composition
- Professional enough for Fortune 500 brands

DESIGN PHILOSOPHY:
Think Mastercard circles, Mitsubishi triangles, Adidas stripes, BP sunburst, Chase octagon - pure geometric symbols that work at any scale. The mark should be instantly recognizable and timeless.

CRITICAL: This must be a SYMBOL ONLY. Absolutely NO typography, letters, text, or business names. If you include any text, the design fails.`;

    const variations = [
      'Interlocking circles or rings creating a unified symbol with depth through overlapping geometry',
      'Geometric abstract mark using triangular or angular forms arranged in a balanced, symmetrical pattern',
      'Curved flowing symbol with soft arcs and negative space forming an elegant, minimal icon',
      'Bold geometric shape with clean straight lines and sharp angles creating a strong, recognizable mark',
      'Circular emblem with internal geometric divisions or segments radiating from center',
      'Abstract symbol using intersecting lines or paths creating a unique, modern letterless icon'
    ];

    const concepts: LogoConcept[] = [];

    // Generate only 3 logos to avoid timeout
    const selectedVariations = variations.slice(0, 3);

    for (let i = 0; i < selectedVariations.length; i++) {
      const variation = selectedVariations[i];
      const fullPrompt = `${basePrompt}

CONCEPT DIRECTION: ${variation}

Execute this as a clean, minimal, geometric symbol using the exact brand colors provided. This must be a letterless icon mark suitable for app icons, favicons, and brand identity. Premium studio quality. SYMBOL ONLY - zero text.`;

      console.log(`Generating logo ${i + 1}/${selectedVariations.length}:`, variation);

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