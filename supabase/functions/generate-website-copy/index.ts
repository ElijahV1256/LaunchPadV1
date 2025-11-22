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
Your job is to generate only the website content, not the layout or code.

This content will be inserted into a pre-built HTML template, just like Wix's AI Website Builder.

You MUST follow the rules below.

🔥 PRIORITY RULES (Follow Exactly)

Use the brand guide exactly as provided.
${brandContext}

${exampleWebsites.length > 0 ? `Analyze the 3 example websites the user provided and extract ONLY the following:
${exampleWebsites.join('\n')}

Extract from these sites:
- Tone
- Style
- Structure
- Section flow
- Copywriting style
- Vibe
` : 'No example websites provided. Use clean, modern copywriting style similar to Notion, Stripe, Shopify, Linear, or Webflow.'}

You are NOT allowed to generate HTML, CSS, layouts, spacing, or design instructions.
Only create text content in the structured sections below.

Business: "${businessName}"
${designContext}

Do NOT add sections that are not listed.
Follow the structure EXACTLY.

Grammar must be perfect
No run-on sentences
No filler
No fluff
No overly complex marketing jargon

Content must be extremely clean and modern
Similar to brands like: Notion, Stripe, Shopify, Linear, Wix, Webflow

🧱 GENERATE THESE SECTIONS ONLY (STRICT)

Produce ONLY the following:

1. HERO SECTION
- Headline
- Subheadline
- Primary CTA
- Secondary CTA (optional)
Tone must match the brand guide + inspiration websites.

2. ABOUT SECTION
Write 2–3 short, clean sentences explaining:
- What the business does
- Who it helps
- Why it matters
Use modern, simple, brand-appropriate language.

3. FEATURES / SERVICES
Provide 3–6 features or services, each with:
- Feature title
- One-sentence explanation (No paragraphs longer than 2 lines.)

4. VALUE PROPOSITION
3–5 clear, punchy benefit bullets that highlight:
- Why customers should choose this business
- What makes it unique
- How it solves the customer's need

5. PRICING (IF APPLICABLE)
If the business has services or product tiers, generate up to 3 pricing tiers:
For each tier:
- Title
- Short description
- 3–5 bullet points
- CTA
If pricing doesn't apply to the business model, write: "Pricing not applicable for this business type."

6. TESTIMONIALS (OPTIONAL)
If relevant, create 2–3 simple, believable testimonials written in modern tone.
If irrelevant, return empty array.

7. FAQ SECTION
Provide 3–6 FAQs, each with:
- Question
- Short, helpful answer
Keep answers short and modern.

8. CONTACT SECTION
Include:
- One short, brand-aligned closing message
- CTA such as: "Get in Touch", "Book Now", "Request a Quote"
Use the brand voice.

Return ONLY valid JSON in this exact format:
{
  "hero_headline": "string",
  "hero_subheadline": "string",
  "hero_cta_primary": "string",
  "hero_cta_secondary": "string",
  "about_text": "string (2-3 sentences)",
  "features": [
    {"title": "string", "description": "string"},
    {"title": "string", "description": "string"},
    {"title": "string", "description": "string"}
  ],
  "value_proposition": "string",
  "value_benefits": ["string", "string", "string"],
  "pricing_tiers": [
    {"name": "string", "price": "string", "description": "string", "features": ["string", "string"], "cta": "string"}
  ],
  "testimonials": [
    {"name": "string", "text": "string", "rating": 5}
  ],
  "faqs": [
    {"question": "string", "answer": "string"}
  ],
  "contact_message": "string",
  "contact_cta": "string"
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