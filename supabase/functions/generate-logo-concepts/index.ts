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

    const prompt = `Create 3 simple, clean SVG logos for the business "${businessName}".

REQUIREMENTS:
- Each logo has the business name "${businessName}" as styled text
- Each logo has a small, simple icon to the LEFT of the text
- The icon should be relevant to the business name/type
- Clean, professional, minimal design
- Primary color: ${colors.primary}
- Secondary/accent color: ${colors.secondary || colors.accent || '#666666'}
- Keep icons SIMPLE - basic geometric shapes, no complex illustrations

Create exactly 3 variations:
1. "Modern" - Bold sans-serif text, geometric minimal icon
2. "Classic" - Elegant serif text, refined simple icon
3. "Creative" - Unique stylized text, distinctive icon

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
- viewBox="0 0 400 100"
- Use xmlns="http://www.w3.org/2000/svg"
- Icon on the left (around x=15-55), sized about 40-50px
- Text to the right of icon (starting around x=70)
- Text vertically centered (y around 55-60)
- Use web-safe fonts: Arial, Georgia, Verdana
- Icon uses primary color: ${colors.primary}
- Text uses primary color: ${colors.primary}
- Can use secondary color ${colors.secondary || colors.accent || '#666666'} for icon accents
- Keep icons simple: circles, squares, lines, basic paths only
- NO gradients, NO filters, NO complex effects
- Font size around 32-38px for readability

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