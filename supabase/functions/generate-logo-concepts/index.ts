import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { businessName, brandColors, businessDescription, brandPersonality } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Starting SVG logo generation for:', businessName);

    const primaryColor = brandColors?.primary || '#0B1320';
    const accentColor = brandColors?.accent || brandColors?.secondary || '#2979FF';
    const regenNonce = Date.now().toString(36) + Math.random().toString(36).substring(2, 8);

    const industry = businessDescription || 'general business';

    const prompt = `You are a senior brand designer. Generate 3 distinct, high-quality modern logos as original SVG vectors (not mockups, not images).

Business:
Name: ${businessName}
Industry: ${industry}
${brandPersonality ? `Style preferences: ${brandPersonality}` : ''}
Regenerate seed (always different each time): ${regenNonce}

Brand colors to use:
- Primary: ${primaryColor}
- Accent: ${accentColor}

Rules:
1. Produce 3 completely different directions (different concept + different composition).
2. Do NOT force "icon left + wordmark right." Any layout is allowed (stacked, emblem, integrated wordmark, monogram, abstract mark).
3. Keep it minimal and premium: flat vector only, use the brand colors provided, lots of whitespace.
4. No gradients, no shadows, no 3D, no textures, no photos, no clipart.
5. Use the business name in at least 2 of the 3 options (wordmark or integrated). The 3rd can be mark/monogram only if strong.
6. The logos must be scalable and clean at small sizes (app icon / favicon).
7. Make the concepts relevant to the industry, but avoid obvious clichés.

SVG requirements (very important):
- Return valid SVG strings with transparent background.
- Use viewBox="0 0 512 512".
- Use simple shapes (path, rect, circle, line, polygon) with clean strokes or fills.
- For text in SVG, use <text> elements with font-family specified.
- Keep SVGs clean and minimal - no unnecessary complexity.

Return JSON ONLY in this exact structure:
{
  "business_name": "${businessName}",
  "industry": "${industry}",
  "regen_nonce": "${regenNonce}",
  "logos": [
    {
      "id": "A",
      "direction_name": "1-3 words describing direction",
      "concept": "1 sentence explaining the concept",
      "palette": { "primary": "${primaryColor}", "accent": "${accentColor}" },
      "layout_type": "stacked | emblem | wordmark | monogram | abstract",
      "svg": "<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>...</svg>",
      "wordmark_style": {
        "font_stack": "\\"Inter\\", system-ui, sans-serif",
        "weight": 700,
        "letter_spacing": "-0.01em"
      }
    },
    {
      "id": "B",
      ...same structure...
    },
    {
      "id": "C",
      ...same structure...
    }
  ],
  "top_pick": "A"
}

Hard anti-repeat instruction:
Treat regen_nonce as a command to generate new shapes + new concepts every time. Do not reuse prior layouts, motifs, or geometry.

Generate completely unique, professional SVG logos now.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate logo concepts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    console.log('Claude response received, parsing...');

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
      console.error("Raw content:", content.substring(0, 1000));
      return new Response(
        JSON.stringify({ error: "Failed to parse logo data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const concepts = (parsed.logos || []).map((logo: any) => ({
      id: logo.id,
      directionName: logo.direction_name,
      concept: logo.concept,
      palette: logo.palette,
      layoutType: logo.layout_type,
      svg: logo.svg,
      wordmarkStyle: logo.wordmark_style,
    }));

    console.log(`Generated ${concepts.length} SVG logo concepts`);

    return new Response(
      JSON.stringify({
        concepts,
        topPick: parsed.top_pick,
        businessName: parsed.business_name,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-logo-concepts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate logo concepts' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});