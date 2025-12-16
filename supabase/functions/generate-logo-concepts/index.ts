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

    console.log('Starting logo generation for:', businessName);

    const primaryColor = brandColors?.primary || '#0B1320';
    const accentColor = brandColors?.accent || brandColors?.secondary || '#2979FF';

    const prompt = `You are a world-class brand designer creating premium, minimalist logo concepts. Generate 8 unique logo variations for "${businessName}".

Business context: ${businessDescription || 'Not provided'}
${brandPersonality ? `Style preferences: ${brandPersonality}` : ''}

LOGO STYLE REQUIREMENTS:
Create clean, sophisticated logos using ONLY typography and simple geometric accents. Think high-end brands like Apple, Nike, Airbnb, Stripe, Linear.

For each logo, specify ONE of these styles:
1. "wordmark" - Pure typography with stylized lettering
2. "monogram" - Initials only (1-3 letters) with distinctive treatment
3. "wordmark-accent" - Typography with a simple geometric accent (line, dot, circle)
4. "stacked" - Name split across two lines with intentional hierarchy

DESIGN RULES:
- NO clipart, icons, or illustrations
- NO complex shapes or mascots
- Geometric accents must be SIMPLE: single line, dot, circle, or arc
- Focus on typography weight, spacing, and arrangement
- Make each option distinctly different

Available fonts (use exact names):
- "Inter" (clean, modern)
- "Manrope" (geometric, friendly)
- "Space Grotesk" (technical, bold)
- "DM Sans" (rounded, approachable)
- "Sora" (contemporary, balanced)
- "Poppins" (geometric, modern)
- "Playfair Display" (elegant, serif)
- "Libre Baskerville" (classic, refined)

OUTPUT FORMAT (JSON only):
{
  "logos": [
    {
      "id": "A",
      "style": "wordmark",
      "displayText": "${businessName}",
      "font": "Inter",
      "fontWeight": 700,
      "letterSpacing": "-0.02em",
      "textTransform": "none",
      "textColor": "#0B1320",
      "accent": null,
      "layout": {
        "type": "horizontal",
        "alignment": "left"
      },
      "rationale": "Brief explanation"
    },
    {
      "id": "B",
      "style": "monogram",
      "displayText": "HB",
      "font": "Playfair Display",
      "fontWeight": 600,
      "letterSpacing": "0.1em",
      "textTransform": "uppercase",
      "textColor": "#0B1320",
      "accent": {
        "type": "circle-outline",
        "color": "${accentColor}",
        "position": "around"
      },
      "layout": {
        "type": "centered",
        "alignment": "center"
      },
      "rationale": "Brief explanation"
    },
    {
      "id": "C",
      "style": "wordmark-accent",
      "displayText": "${businessName}",
      "font": "Space Grotesk",
      "fontWeight": 600,
      "letterSpacing": "-0.01em",
      "textTransform": "none",
      "textColor": "#0B1320",
      "accent": {
        "type": "underline",
        "color": "${accentColor}",
        "position": "below"
      },
      "layout": {
        "type": "horizontal",
        "alignment": "left"
      },
      "rationale": "Brief explanation"
    }
  ]
}

ACCENT OPTIONS (when style is "wordmark-accent" or "monogram"):
- "underline" - Simple line below text
- "dot" - Small circle before or after text
- "circle-outline" - Thin circle around monogram
- "line-left" - Vertical line to the left
- "arc" - Curved line above or below
- null - No accent (required for pure "wordmark" style)

For monograms, extract meaningful initials from "${businessName}".

Generate exactly 8 logos with varied styles:
- At least 2 pure wordmarks
- At least 2 monograms
- At least 2 with accents
- Mix of serif and sans-serif fonts
- Mix of weights and spacings

Return ONLY valid JSON.`;

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
      console.error("Raw content:", content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse logo data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const concepts = (parsed.logos || []).map((logo: any) => ({
      id: logo.id,
      style: logo.style,
      displayText: logo.displayText,
      font: logo.font,
      fontWeight: logo.fontWeight,
      letterSpacing: logo.letterSpacing,
      textTransform: logo.textTransform || 'none',
      textColor: logo.textColor || primaryColor,
      accent: logo.accent,
      layout: logo.layout,
      rationale: logo.rationale,
    }));

    console.log(`Generated ${concepts.length} logo concepts`);

    return new Response(
      JSON.stringify({ concepts }),
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