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
Using the user's brand guide and chosen business${designPreferences?.exampleWebsites ? ', and example websites they provided' : ''}, create a clean, modern one-page website layout that follows the brand's colors, typography, voice, structure, and overall style.

Business: "${businessName}"
${brandContext}
${designContext}

${designPreferences?.exampleWebsites && designPreferences.exampleWebsites.filter((url: string) => url).length > 0 ? `
WEBSITE STYLE INTERPRETATION:
Analyze the example websites and identify key style elements like layout structure, spacing, typography, color usage, button/CTA style, and overall vibe. Combine these with the brand guide to create a consistent design direction.
` : ''}

Create a complete one-page website structure with the following sections:

1. HERO SECTION
   - Clean, bold headline (brand voice aligned, 8-12 words)
   - Short sub-headline (15-25 words)
   - Primary CTA button text
   - Visual description (no image generation, just describe what image should show)

2. ABOUT SECTION
   - 2-3 sentence introduction to the business
   - What they do / who they help
   - Simple, friendly, brand-aligned tone

3. FEATURES/SERVICES SECTION
   - List 3-6 features or services with:
     * Title
     * One-sentence description
     * Icon description (matching brand style)

4. VALUE SECTION
   - Main value proposition
   - Key benefits
   - Social proof hooks

5. GALLERY/VISUAL SECTION
   - Descriptions of what images should look like based on brand guide

6. PRICING SECTION (if applicable)
   - Simple tier layout (1-3 tiers)
   - Clear bullet points for each
   - CTA under each tier

7. TESTIMONIALS SECTION
   - 2-3 short sample testimonials in brand tone
   - Include customer names

8. FAQ SECTION
   - 3-6 beginner-friendly FAQ questions and answers

9. CONTACT SECTION
   - Contact info layout description
   - Contact form description
   - CTA text

CRITICAL REQUIREMENTS:
- Perfect grammar throughout
- Follow brand voice: ${brandData?.brand_voice || 'professional and approachable'}
- Use brand colors: ${brandData?.brand_colors?.primary || 'blue'}, ${brandData?.brand_colors?.secondary || 'gray'}, ${brandData?.brand_colors?.accent || 'green'}
- Keep language simple and motivating
- No long paragraphs
- Beginner-friendly
- Clean formatting

Return ONLY valid JSON in this exact format:
{
  "style_summary": "Brief description of the overall website style and design approach",
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
  "contact_description": "string"
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