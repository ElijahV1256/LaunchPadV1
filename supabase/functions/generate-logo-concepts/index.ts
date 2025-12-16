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
          error: "Anthropic API key not configured"
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { businessName, brandColors } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log('Starting SVG logo generation for:', businessName);

    const colors = brandColors || { primary: '#000000', secondary: '#666666', accent: '#999999' };

    const prompt = `Create 3 simple, clean SVG wordmark logos for the business "${businessName}".

REQUIREMENTS:
- Each logo shows ONLY the business name "${businessName}" as styled text
- NO icons, NO symbols, NO graphics - just the text
- Clean, professional, minimal design
- Use the color: ${colors.primary}
- White background (or transparent)
- Simple typography only

Create exactly 3 variations:
1. "Modern" - Bold sans-serif, clean and minimal
2. "Classic" - Elegant serif, refined and timeless
3. "Creative" - Unique stylized lettering, still simple

OUTPUT FORMAT - Return ONLY valid JSON, no markdown:
{
  "logos": [
    {
      "name": "Modern",
      "svg": "<svg>...</svg>"
    },
    {
      "name": "Classic",
      "svg": "<svg>...</svg>"
    },
    {
      "name": "Creative",
      "svg": "<svg>...</svg>"
    }
  ]
}

SVG REQUIREMENTS:
- viewBox="0 0 400 120"
- Width 400, height 120
- Text centered vertically and horizontally
- Use standard web fonts: Arial, Georgia, or Verdana
- Keep it simple - just a <text> element with styling
- Fill color: ${colors.primary}

Return ONLY the JSON object, nothing else.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate logos" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    console.log('Claude response:', content.substring(0, 500));

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", parseError);
      return new Response(
        JSON.stringify({ error: "Failed to parse logo data" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const concepts: LogoConcept[] = [];

    for (const logo of parsed.logos || []) {
      if (logo.svg && logo.name) {
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(logo.svg)))}`;
        concepts.push({
          name: logo.name,
          description: businessName,
          imageUrl: svgDataUrl,
          prompt: prompt,
        });
        console.log(`Logo "${logo.name}" generated successfully`);
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