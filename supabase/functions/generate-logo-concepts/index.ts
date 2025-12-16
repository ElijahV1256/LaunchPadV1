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
    console.log('Business description:', businessDescription);
    console.log('Brand personality/requirements:', brandPersonality);

    const iconAccent = brandColors?.primary || '#2F6BFF';

    const additionalRequirements = brandPersonality ? `\nAdditional requirements from user: "${brandPersonality}"` : '';

    const prompt = `You are a brand designer generating clean, modern wordmark + icon logos that can be rendered in UI (not images).

Input:
company_name: "${businessName}"
business_description: "${businessDescription || 'Not provided'}"${additionalRequirements}

Goal:
Create 8 logo options using only the company name. Each option must include:
- Wordmark text = company_name
- Optional 2nd text option: remove spaces (e.g., "Launch Pad" -> "Launchpad") only if it looks better
- Simple icon on the left (must be clean and minimal)
- Typography + colors that look "startup-quality"

CRITICAL - Icon Selection Rules:
1. If the user specified additional requirements (like "baby icon"), PRIORITIZE those requests
2. Analyze what the company NAME means or evokes (e.g., "Haven" suggests safety/home, "Birth Kits" suggests baby/parenting)
3. Consider the business industry/description
4. Choose icons that match the user's request, name meaning, AND industry
5. Do NOT use random or generic icons - every icon must have a clear connection to the business

Industry icon guidance (use as reference):
- Baby/Birth/Parenting: Baby, Heart, HeartHandshake, Flower2, Sun, Star
- Health/Medical/Wellness: Stethoscope, Heart, ShieldCheck, Leaf, Sun
- Tech/Software: Rocket, Zap, Bolt, Globe, Target
- Food/Restaurant: Coffee, Leaf, Sun, Flower2, Star
- Home/Real Estate: Home, Sun, Mountain, TreePine, Compass
- Fitness/Sports: Target, Zap, Bolt, Mountain, Star
- Finance/Business: Briefcase, ShieldCheck, BadgeCheck, Target, Award
- Education: Book, Pen, Star, Award, Compass
- Travel: Plane, Globe, Compass, Mountain, Anchor
- Beauty/Fashion: Sparkles, Star, Crown, Flower2, Palette
- Eco/Green: Leaf, TreePine, Globe, Sun, Flower2
- Creative/Design: Palette, Pen, Camera, Sparkles, Star
- Shipping/Logistics: Truck, Package, Globe, Anchor, Plane

Hard rules:
- Do NOT generate images or mockups
- Output must be renderable as SVG + CSS
- Flat, minimal, scalable, readable at small sizes
- No gradients, shadows, 3D, textures, mascots, complex drawings

Available icons (pick ONLY from this list):
Rocket, Sparkles, ShieldCheck, BadgeCheck, Leaf, Bolt, HeartHandshake, Stethoscope, Baby, Package, Store, Wrench, Hammer, TreePine, Mountain, Waves, Globe, CheckCircle, Circle, Star, Heart, Home, Users, Zap, Crown, Target, Award, Compass, Sun, Moon, Cloud, Coffee, Briefcase, Camera, Music, Palette, Pen, Book, Gift, Truck, Plane, Anchor, Flower2

Font stacks (choose ONE per concept, vary them across all 8):
- "Inter", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "Manrope", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "Montserrat", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "Sora", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "DM Sans", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "Space Grotesk", system-ui, -apple-system, "Segoe UI", Arial, sans-serif
- "Poppins", system-ui, -apple-system, "Segoe UI", Arial, sans-serif

Weights allowed: 600, 700, 800
Letter spacing allowed: -0.02em, -0.01em, 0em

Color rules:
- wordmark: #0B1320
- icon accent: pick ONE from: ${iconAccent}, #2F6BFF, #16A34A, #F59E0B, #0EA5E9, #EF4444, #EC4899
- Also provide black/white variants

Output (JSON only):
Return valid JSON exactly in this structure:

{
  "company_name": "${businessName}",
  "logos": [
    {
      "id": "A",
      "text_primary": "${businessName}",
      "text_alt": "${businessName.replace(/\\s+/g, '')}",
      "icon_lucide": "Baby",
      "font_stack": "\\"Inter\\", system-ui, -apple-system, \\"Segoe UI\\", Arial, sans-serif",
      "font_weight": 700,
      "letter_spacing": "-0.01em",
      "colors": {
        "wordmark": "#0B1320",
        "icon": "#2F6BFF",
        "black": "#000000",
        "white": "#FFFFFF"
      },
      "layout": {
        "icon_left": true,
        "icon_size_px": 28,
        "icon_stroke": 2,
        "gap_px": 12
      },
      "rationale": "1 short sentence why this icon matches the business"
    }
  ],
  "top_pick": "A"
}

Generate exactly 8 logos with IDs A through H. Each should have a DIFFERENT icon and font combination. Match icons to BOTH the company name meaning AND the business industry.`;

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
      name: `Style ${logo.id}`,
      description: logo.rationale,
      text_primary: logo.text_primary,
      text_alt: logo.text_alt,
      icon_lucide: logo.icon_lucide,
      font_stack: logo.font_stack,
      font_weight: logo.font_weight,
      letter_spacing: logo.letter_spacing,
      colors: logo.colors,
      layout: logo.layout,
    }));

    console.log(`Generated ${concepts.length} logo concepts`);

    return new Response(
      JSON.stringify({ concepts, topPick: parsed.top_pick }),
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