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
    const { businessName, ideaKey, designPreferences, brandData, apiKey } = await req.json();

    console.log("Received request:", { businessName, ideaKey, designPreferences });

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "Business name is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = apiKey || Deno.env.get("OPENAI_API_KEY");
    console.log("OpenAI API key exists:", !!openaiApiKey);
    console.log("OpenAI API key prefix:", openaiApiKey ? openaiApiKey.substring(0, 10) : "none");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const brandContext = brandData ? `
BRAND GUIDE:
- Brand Colors: Primary: ${brandData.brand_colors?.primary || 'N/A'}, Secondary: ${brandData.brand_colors?.secondary || 'N/A'}, Accent: ${brandData.brand_colors?.accent || 'N/A'}
- Brand Voice: ${brandData.brand_voice || 'Professional and approachable'}
- Target Audience: ${brandData.target_audience || 'General customers'}
- Tagline: ${brandData.selected_tagline || 'N/A'}
- Business Description: ${brandData.offer_description || 'N/A'}
` : '';

    const designContext = designPreferences ? `
DESIGN PREFERENCES:
- Business Description: ${designPreferences.businessDescription || 'N/A'}
- Target Audience: ${designPreferences.targetAudience || 'N/A'}
- Brand Personality: ${designPreferences.brandPersonality || 'N/A'}
- Industry: ${designPreferences.industry || 'N/A'}
- Preferred Style: ${designPreferences.preferredStyle || 'N/A'}
${designPreferences.exampleWebsites && designPreferences.exampleWebsites.filter((url: string) => url).length > 0 ? `- Example Websites for Inspiration: ${designPreferences.exampleWebsites.filter((url: string) => url).join(', ')}` : ''}
` : '';

    const prompt = `You are a professional web designer.
Your job is to create a one-page website that STRICTLY follows:
1. The brand guide
2. The 3 website inspirations chosen by the user
3. The Launch Pad one-page layout structure

DO NOT add additional sections.
DO NOT ignore any part of the brand guide.
DO NOT invent colors, fonts, or messaging.

Business: "${businessName}"
${brandContext}
${designContext}

PRIORITY ORDER (if conflicts arise):
1. Brand guide
2. Website examples
3. Simplicity

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. WEBSITE STYLE ANALYSIS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${designPreferences?.exampleWebsites && designPreferences.exampleWebsites.filter((url: string) => url).length > 0 ? `
Review the 3 websites provided: ${designPreferences.exampleWebsites.filter((url: string) => url).join(', ')}

Analyze and output these specific elements:
- Layout patterns (grid, single column, multi-column)
- Spacing rules (tight, airy, generous whitespace)
- Typography style (serif, sans-serif, weight, size hierarchy)
- Button style (rounded, sharp, filled, outlined, size)
- Color energy (vibrant, muted, high contrast, subtle)
- Imagery style (photos, illustrations, icons, minimalist)
- Section flow (how sections connect and transition)

Then explain EXACTLY how each of these will be applied to the generated website.
This ensures you are actually using the inspiration sites.
` : `
No example websites provided. Create a professional design direction using ONLY the brand guide.
Describe the layout approach and visual elements that match the brand personality.
`}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. ONE-PAGE WEBSITE LAYOUT (STRICT SECTIONS ONLY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate the website using ONLY these sections in this EXACT order:

HERO
- Headline (strict brand voice: ${brandData?.brand_voice || 'professional and approachable'})
- Subheadline (supporting the headline)
- Primary CTA (action-oriented)
- Image/visual description based on inspiration sites
- Color + spacing rules from inspiration

ABOUT
- 2–3 sentence business intro
- What they do / who they help
- Brand guide tone ENFORCED

FEATURES / SERVICES
Generate 3–6 features with:
- Title
- One-sentence description
- Icon style (brand guide + inspiration sites)

VALUE / WHY CHOOSE US
- Brand value proposition
- 3 benefit bullets
- Simple and clear

GALLERY (optional, follow inspiration sites EXACTLY)
- Describe images the user should use
- Style MUST match the example sites' visual language

PRICING (if the business type supports it)
- 1–3 pricing blocks
- Matching layout from inspiration site styles
- Clear features and CTA for each tier

TESTIMONIALS (only if business type benefits from it)
- 2–3 sample testimonials in brand tone
- Keep realistic and professional

FAQ
- 3–6 simple questions and answers
- Address common customer concerns

CONTACT
- Contact info
- Contact form layout
- Final CTA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. HARD RULES (STRICTLY ENFORCE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

These rules are NON-NEGOTIABLE:

✓ Use ONLY brand guide colors:
  - Primary: ${brandData?.brand_colors?.primary || 'blue'}
  - Secondary: ${brandData?.brand_colors?.secondary || 'gray'}
  - Accent: ${brandData?.brand_colors?.accent || 'green'}

✓ Use ONLY brand guide typography style
✓ Use inspiration sites ONLY for structure and visual style
✓ NO extra creativity outside the brand
✓ NO additional sections beyond what's listed
✓ Perfect grammar
✓ Perfect formatting
✓ NO long paragraphs (keep sentences short and punchy)
✓ NO filler language
✓ Clean, modern layout style matching inspirations
✓ All text MUST sound like: ${brandData?.brand_voice || 'professional and approachable'}
✓ Target audience: ${brandData?.target_audience || 'general customers'}
✓ Include tagline if appropriate: ${brandData?.selected_tagline || 'N/A'}

Return ONLY valid JSON in this exact format:
{
  "style_summary": "Brief description analyzing example sites and combining with brand guide to create design direction",
  "hero_headline": "string",
  "hero_subheadline": "string",
  "hero_cta": "string",
  "hero_visual_description": "string",
  "about_text": "string (2-3 sentences)",
  "features": [
    {"title": "string", "description": "string", "icon_description": "string"},
    {"title": "string", "description": "string", "icon_description": "string"},
    {"title": "string", "description": "string", "icon_description": "string"}
  ],
  "value_proposition": "string",
  "value_benefits": ["string", "string", "string"],
  "social_proof_hooks": ["string", "string"],
  "gallery_description": "string",
  "pricing_tiers": [
    {"name": "string", "price": "string", "features": ["string", "string"], "cta": "string"}
  ],
  "testimonials": [
    {"name": "string", "text": "string", "rating": 5},
    {"name": "string", "text": "string", "rating": 5}
  ],
  "faqs": [
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"}
  ],
  "contact_cta": "string",
  "contact_form_description": "string"
}`;

    console.log("Calling OpenAI API...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional web designer and brand strategist. Always respond with valid JSON only. Never include markdown code blocks or any text outside the JSON. Use perfect grammar and follow brand voice guidelines.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    console.log("OpenAI API response status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error("OpenAI API error:", error);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${error}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let copy;
    try {
      copy = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      console.error("Parse error:", e);
      return new Response(
        JSON.stringify({
          error: "Failed to parse generated copy",
          details: content.substring(0, 500)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ copy }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});