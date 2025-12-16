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
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
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

    console.log('Starting logo concept generation for:', businessName);

    const primaryColor = brandColors?.primary || '#0B1320';
    const accentColor = brandColors?.accent || brandColors?.secondary || '#2979FF';
    const industry = businessDescription || 'general business';

    const prompt = `You are a world-class brand designer creating REAL, finished logos — not text concepts.

Generate 3 professional, modern business logos for the following company:

Business Name: ${businessName}
Industry: ${industry}
${brandPersonality ? `Brand personality: ${brandPersonality}` : ''}
Brand colors: Primary ${primaryColor}, Accent ${accentColor}

CRITICAL REQUIREMENTS:
- Each must be a FULL logo with a clear visual mark or symbol, not just the name in different colors
- Each logo must include a custom-designed icon, symbol, or abstract mark that represents the business
- The icon must be unique and intentionally designed (not clipart, not emojis, not generic shapes)
- The logos should look like something a real design agency would deliver

STYLE:
- Clean, modern, minimal
- Flat design only
- No gradients, shadows, bevels, or 3D effects
- No cartoon or playful styles
- Professional, premium, and trustworthy

ICON RULES:
- The icon can be abstract, geometric, or symbolic
- Avoid cliche industry icons (no lightbulbs, trees, houses, gears, rockets unless heavily abstracted)
- The icon should visually connect to the industry or brand values
- The icon can be integrated with the typography or stand alone

TYPOGRAPHY:
- Clean, modern typography
- Balanced spacing and alignment
- The name must be readable and well-proportioned with the icon

LAYOUT:
- Do NOT default to icon-left / text-right only
- Explore stacked, integrated, or badge-style compositions
- Each logo should have a DIFFERENT layout approach

SVG REQUIREMENTS:
- viewBox="0 0 512 512"
- Use the brand colors provided
- For text, use font-family="Inter, system-ui, sans-serif"
- Create the icon using path, rect, circle, polygon, line elements
- The icon must be detailed and intentional - NOT just a simple circle or square
- No gradients, filters, or effects
- Centered composition on transparent background
- Text must be readable (minimum font-size 32)

Return ONLY valid JSON in this exact structure:
{
  "logos": [
    {
      "id": "A",
      "concept_name": "Short creative name",
      "description": "1-2 sentence description",
      "icon_description": "What the icon represents and how it connects to the brand",
      "layout_type": "stacked | integrated | badge | horizontal | vertical",
      "svg": "<svg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'>...</svg>"
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
  "recommended": "A"
}

IMPORTANT:
- Each logo MUST have a distinct, custom icon - no text-only logos
- Each logo MUST have a different layout approach
- SVGs must render actual, finished logos ready for use
- Return valid JSON only, no markdown`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a world-class brand designer who creates professional, production-ready logos with custom icons and symbols. Every logo must have a unique, intentionally designed visual mark. You output clean SVG code that renders real logos. Always return valid JSON only."
          },
          { role: "user", content: prompt }
        ],
        max_tokens: 8000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate logo concepts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    console.log('OpenAI response received, parsing...');

    let parsed;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith('```')) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();

      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.error("Raw content:", content.substring(0, 1000));
      return new Response(
        JSON.stringify({ error: "Failed to parse logo data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const concepts = (parsed.logos || []).map((logo: any) => ({
      id: logo.id,
      directionName: logo.concept_name,
      concept: logo.description,
      iconDescription: logo.icon_description,
      layoutType: logo.layout_type,
      svg: logo.svg,
      palette: { primary: primaryColor, accent: accentColor },
    }));

    console.log(`Generated ${concepts.length} logo concepts`);

    return new Response(
      JSON.stringify({
        concepts,
        topPick: parsed.recommended,
        businessName,
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