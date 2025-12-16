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

    const prompt = `You are a senior brand designer creating modern, professional startup logos.

Create 3 distinct logo concepts for a business using the details below.

Business Name: ${businessName}
Industry: ${industry}
${brandPersonality ? `Brand personality: ${brandPersonality}` : ''}
Brand colors provided: Primary ${primaryColor}, Accent ${accentColor}

Design requirements:
- Clean, modern, minimal design
- Professional and trustworthy (not playful or cartoon)
- Flat design only (no gradients, shadows, or 3D effects)
- Must work in black and white
- Avoid clich\u00e9 industry icons and overused symbols
- Avoid overly abstract or artistic designs
- Do NOT default to an icon on the left and text on the right

Style guidance:
- Prefer typography-first logos
- Use clean, well-spaced typography
- Subtle icon or mark only if it truly adds value
- Logos should feel appropriate for real businesses, SaaS products, or professional services

For EACH logo concept, you must also generate a complete SVG implementation.

SVG Requirements:
- viewBox="0 0 512 512"
- Use the brand colors provided (primary: ${primaryColor}, accent: ${accentColor})
- For text, use <text> elements with font-family="Inter, system-ui, sans-serif"
- Keep SVGs simple: use path, rect, circle, text elements only
- No gradients, filters, or effects
- Transparent background
- Text should be prominent and well-positioned
- If using an icon/mark, keep it subtle and integrated

Return ONLY valid JSON in this exact structure:
{
  "logos": [
    {
      "id": "A",
      "concept_name": "Short creative name for this direction",
      "description": "1-2 sentence description of the concept",
      "typography_style": "Description of font characteristics (weight, spacing, style)",
      "icon_description": "Description of icon/symbol if any, or 'None - typography only'",
      "color_usage": "How the brand colors are applied",
      "why_it_works": "1 sentence on why this works for this business",
      "layout_type": "wordmark | lettermark | combination | emblem",
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

Important:
- Each logo concept must be visually and stylistically different from the others
- At least one should be typography-only (wordmark or lettermark)
- SVGs must be valid and render the actual logo design
- Do NOT include placeholder text in SVGs - render the actual business name
- Return structured JSON only, no markdown formatting`;

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
            content: "You are an expert brand designer who creates professional, modern logo concepts with clean SVG implementations. Focus on typography-first designs that look like real startup logos. Always return valid JSON only."
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
      typographyStyle: logo.typography_style,
      iconDescription: logo.icon_description,
      colorUsage: logo.color_usage,
      whyItWorks: logo.why_it_works,
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