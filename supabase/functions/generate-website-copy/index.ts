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

    // Build context from design preferences and brand data
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

    const prompt = `You are a professional web designer and brand strategist.
Using the user's brand guide, chosen business, and three website examples they provided, create a clean, modern one-page website layout that follows the brand's colors, typography, voice, structure, and overall style.

The final output must be simple, professional, and easy to use as a starter website.

Business: "${businessName}"
${brandContext}
${designContext}

🌐 1. WEBSITE STYLE INTERPRETATION

${designPreferences?.exampleWebsites && designPreferences.exampleWebsites.filter((url: string) => url).length > 0 ? `
Analyze the 3 example websites provided: ${designPreferences.exampleWebsites.filter((url: string) => url).join(', ')}

Identify and describe the key style elements:
- Layout structure
- Spacing & section flow
- Typography style
- Color usage
- Button/CTA style
- Imagery style
- Overall vibe

Combine these elements with the brand guide to create a consistent design direction.
` : `
Create a professional design direction using the brand guide provided.
Describe the overall style, layout approach, and visual elements that will work best for this business.
`}

🧱 2. ONE-PAGE WEBSITE STRUCTURE

Build a complete one-page website, including the following sections:

HERO SECTION
- Clean, bold headline (brand voice)
- Short sub-headline
- Primary CTA button
- Optional supporting image/visual description (no image generation)

ABOUT SECTION
- 2–3 sentence introduction to the business
- What they do / who they help
- Simple, friendly, brand-aligned tone

FEATURES / SERVICES SECTION
- List 3–6 features or services:
  * Title
  * One-sentence description
  * Optional icon description (must match brand style)

WHY CHOOSE US / VALUE SECTION
- A short area explaining:
  * Main value proposition
  * Benefits
  * Social proof hooks

GALLERY / VISUAL SECTION (Optional)
- Provide descriptions of what images should look like based on the brand guide and example sites

PRICING SECTION (Optional)
- If the business has pricing:
  * Simple tier layout (1–3 tiers)
  * Clear bullet points
  * CTA under each

TESTIMONIALS SECTION (Optional)
- If relevant to the business:
  * 2–3 short sample testimonials written in brand tone

FAQ SECTION
- Include 3–6 beginner-friendly FAQ questions and answers

CONTACT SECTION
- Include:
  * Contact info
  * Small contact form layout description
  * CTA text: "Get in Touch" or equivalent

🎨 3. STYLE RULES

All website content must follow:

BRAND GUIDE RULES:
- Brand voice: ${brandData?.brand_voice || 'professional and approachable'}
- Brand colors: Primary: ${brandData?.brand_colors?.primary || 'blue'}, Secondary: ${brandData?.brand_colors?.secondary || 'gray'}, Accent: ${brandData?.brand_colors?.accent || 'green'}
- Target audience: ${brandData?.target_audience || 'general customers'}
- Tagline: ${brandData?.selected_tagline || 'N/A'}

EXAMPLE SITE INSPIRATION:
- Apply the visual elements from the provided websites
- Only use inspiration, never copy
- Stay aligned with the brand's own aesthetic

✔️ RULES:
- Perfect grammar
- Follow brand voice
- Keep language simple and motivating
- Use clean formatting
- No long paragraphs
- Beginner-friendly
- No added colors outside the brand guide
- No complicated design or jargon

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
            content: "You are a professional web designer and brand strategist. Always respond with valid JSON only. Use perfect grammar and follow brand voice guidelines.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
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
    const content = data.choices[0].message.content;

    let copy;
    try {
      copy = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse OpenAI response:", content);
      return new Response(
        JSON.stringify({ error: "Failed to parse generated copy" }),
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