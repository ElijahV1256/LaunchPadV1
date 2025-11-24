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
- Tone: ${brandData.brand_voice || 'Professional and approachable'}
- Voice: ${brandData.brand_voice || 'Professional and approachable'}
- Colors: Primary: ${brandData.brand_colors?.primary || 'N/A'}, Secondary: ${brandData.brand_colors?.secondary || 'N/A'}, Accent: ${brandData.brand_colors?.accent || 'N/A'}
- Messaging Style: ${brandData.brand_voice || 'Professional and approachable'}
- Value Proposition: ${brandData.offer_description || 'N/A'}
- Target Audience: ${brandData.target_audience || 'General customers'}
- Tagline: ${brandData.selected_tagline || 'N/A'}
` : '';

    const designContext = designPreferences ? `
BUSINESS DETAILS:
- Business Description: ${designPreferences.businessDescription || 'N/A'}
- Target Audience: ${designPreferences.targetAudience || 'N/A'}
- Brand Personality: ${designPreferences.brandPersonality || 'N/A'}
- Industry: ${designPreferences.industry || 'N/A'}
- Preferred Style: ${designPreferences.preferredStyle || 'N/A'}
` : '';

    const exampleWebsites = designPreferences?.exampleWebsites && designPreferences.exampleWebsites.filter((url: string) => url).length > 0
      ? designPreferences.exampleWebsites.filter((url: string) => url)
      : [];

    const prompt = `You are a professional web designer and website copywriter.
Your job is ONLY to generate structured website content + layout instructions for a clean, modern one-page website.
A renderer will handle the HTML and design.

Follow these rules EXACTLY:

🔒 NON-NEGOTIABLE DESIGN RULES

Logo must be placed in the top-left corner. (MANDATORY)

Website must be clean, modern, minimal, with lots of white space.

Follow the brand guide voice, tone, value, and style exactly.
${brandContext}

Follow the structure exactly as listed.

No large paragraphs.

No HTML, no CSS, no design code.

Perfect grammar.

No extra creativity outside the brand.

No extra sections.

Business: "${businessName}"
${designContext}

📸 PHOTO INTEGRATION RULES

User has NOT provided photos.
Generate clean, modern photo descriptions the user can recreate or generate with AI.

Photo descriptions must:
- Match brand guide
- Match the style of the 3 websites the user likes
- Be minimal, clean, and modern

Example formats:
"Full-width, soft lighting, minimal background, product centered"
"Crisp lifestyle shot with neutral tones"

🎨 WEBSITE STYLE INTERPRETATION

${exampleWebsites.length > 0 ? `Analyze the 3 inspiration websites and output:
${exampleWebsites.join('\n')}

Extract:
- Layout style
- Spacing
- Typography feel
- Button style
- Imagery look
- Overall vibe

Apply this style to the website content.
` : 'No example websites provided. Use clean, modern style similar to Notion, Stripe, Shopify, Linear, or Webflow.'}

🧱 STRICT ONE-PAGE WEBSITE STRUCTURE

You MUST follow this exact structure.

1. HEADER
- Logo placement: Top-left (MANDATORY)
- CTA button on the right
- Short description of styling based on inspiration sites

2. HERO SECTION
- Headline
- Subheadline
- Primary CTA
- Secondary CTA (optional)
- Hero photo placement description

3. ABOUT SECTION
- 2–3 short clean sentences:
  - What the business does
  - Who it helps
  - Why it matters
- About photo placement description (optional)

4. FEATURES / SERVICES SECTION
- Provide 3–6 features, each with:
  - Title
  - One-sentence description
  - Photo/icon placement description (optional)

5. VALUE / WHY CHOOSE US SECTION
- 3–5 clean bullet points

6. GALLERY SECTION (OPTIONAL)
- Provide 3–5 photo descriptions

7. PRICING SECTION (IF APPLICABLE)
- If relevant to the business:
  - Up to 3 tiers
  - Title
  - Description
  - 3–5 bullets
  - CTA
- If not applicable: return empty array

8. TESTIMONIALS (OPTIONAL)
- If relevant: Write 2–3 clean testimonials
- If not relevant: return empty array

9. FAQ SECTION
- 3–6 short Q/A items

10. CONTACT SECTION
- Contact info
- Simple closing message
- CTA
- Contact photo placement description (optional)

Return ONLY valid JSON in this exact format:
{
  "style_interpretation": "Brief style analysis of inspiration sites",
  "header_cta": "string",
  "header_style_notes": "string",
  "hero_headline": "string",
  "hero_subheadline": "string",
  "hero_cta_primary": "string",
  "hero_cta_secondary": "string",
  "hero_photo_description": "string",
  "about_text": "string (2-3 sentences)",
  "about_photo_description": "string",
  "features": [
    {"title": "string", "description": "string", "photo_description": "string"}
  ],
  "value_proposition": "string",
  "value_benefits": ["string", "string", "string"],
  "gallery_photos": [
    {"description": "string"}
  ],
  "pricing_tiers": [
    {"name": "string", "price": "string", "description": "string", "features": ["string"], "cta": "string"}
  ],
  "testimonials": [
    {"name": "string", "text": "string", "rating": 5}
  ],
  "faqs": [
    {"question": "string", "answer": "string"}
  ],
  "contact_message": "string",
  "contact_cta": "string",
  "contact_photo_description": "string"
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