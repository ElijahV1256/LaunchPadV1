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
    const { businessName, ideaKey, designPreferences, brandData, apiKey, contentAnswers } = await req.json();

    console.log("Received request:", { businessName, ideaKey, designPreferences, contentAnswers });

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

    const contentContext = contentAnswers && Object.values(contentAnswers).some((v: any) => v) ? `
CUSTOM CONTENT DETAILS:
${contentAnswers.whatYouOffer ? `- What They Offer: ${contentAnswers.whatYouOffer}` : ''}
${contentAnswers.whoYouHelp ? `- Target Audience: ${contentAnswers.whoYouHelp}` : ''}
${contentAnswers.mainProblemSolved ? `- Problem Solved: ${contentAnswers.mainProblemSolved}` : ''}
${contentAnswers.keyBenefits ? `- Key Benefits: ${contentAnswers.keyBenefits}` : ''}
${contentAnswers.whatMakesYouDifferent ? `- Unique Differentiators: ${contentAnswers.whatMakesYouDifferent}` : ''}
${contentAnswers.pricing ? `- Pricing Info: ${contentAnswers.pricing}` : ''}
` : '';

    const exampleWebsites = designPreferences?.exampleWebsites && designPreferences.exampleWebsites.filter((url: string) => url).length > 0
      ? designPreferences.exampleWebsites.filter((url: string) => url)
      : [];

    const prompt = `You are a professional brand copywriter.
Your job is to generate clean, modern, high-converting landing page copy based on:

- The user's brand guide
- The user's business information
- The target audience
- The three websites the user likes
- The tone, style, and messaging rules
- Perfect grammar

You are NOT generating a full website, layout, code, or design.
You are ONLY generating high-quality landing page text that the user can paste into any website builder.

Follow the structure below EXACTLY.

BRAND GUIDE:
${brandContext}

BUSINESS INFORMATION:
Business: "${businessName}"
${designContext}
${contentContext}

${exampleWebsites.length > 0 ? `INSPIRATION WEBSITES:
${exampleWebsites.join('\n')}

Analyze these websites for tone, style, and messaging approach. Apply similar principles to the copy you generate.
` : 'No example websites provided. Use clean, modern copywriting style similar to Notion, Stripe, Shopify, Linear, or Webflow.'}

IMPORTANT: If custom content details are provided above, use them to create highly specific, tailored landing page copy that directly addresses the business's offerings, target audience, problems solved, and unique value proposition.

🧱 LANDING PAGE COPY STRUCTURE (STRICT)

1. HERO SECTION
- Headline (short, modern, benefit-driven)
- Subheadline (one sentence)
- Primary Call to Action
- Optional Secondary Call to Action
- Suggested hero image description (clean + modern)

2. ABOUT SECTION
- 2–3 short sentences:
  - What the business does
  - Who it helps
  - The main value it brings
- Written in brand voice

3. FEATURES / SERVICES
- Write 3–6 features/services, each with:
  - Feature/Service name
  - One sentence description
  - Optional image description
- Keep everything clean and simple.

4. VALUE PROPOSITION / WHY CHOOSE US
- Write 3–5 clear, punchy bullets that highlight:
  - Benefits
  - Unique value
  - Why customers choose this business
- No long paragraphs.

5. SOCIAL PROOF / TESTIMONIALS
- If relevant to the business:
  - Write 2–3 short testimonials in a modern, clean voice.
- If there are no testimonials:
  - Write high-level "credibility statements," such as:
    - "Trusted by local customers"
    - "Backed by a strong mission"
    - "Built around your needs"

6. PRICING (IF APPLICABLE)
- If the business uses pricing tiers, provide up to 3:
  - For each tier:
    - Title
    - Description
    - 3–5 bullet points
    - CTA
- If pricing doesn't apply, return empty array

7. FAQ SECTION
- Provide 3–6 short questions + answers based on typical customer concerns.

8. FINAL CALL TO ACTION (FOOTER CTA)
- A simple closing message in brand voice and a strong CTA.

📌 FORMATTING RULES
- Use clean headers
- Short sentences
- No rambling text
- No large paragraphs
- Perfect grammar
- Follow the brand guide tone exactly
- No HTML, CSS, or code
- No layouts
- No sections outside the ones listed

Return ONLY valid JSON in this exact format:
{
  "hero_headline": "string",
  "hero_subheadline": "string",
  "hero_cta_primary": "string",
  "hero_cta_secondary": "string",
  "hero_image_description": "string",
  "about_text": "string (2-3 sentences)",
  "features": [
    {"title": "string", "description": "string", "image_description": "string"}
  ],
  "value_proposition": "string",
  "value_benefits": ["string", "string", "string"],
  "testimonials": [
    {"name": "string", "text": "string", "role": "string"}
  ],
  "pricing_tiers": [
    {"name": "string", "price": "string", "description": "string", "features": ["string"], "cta": "string"}
  ],
  "faqs": [
    {"question": "string", "answer": "string"}
  ],
  "footer_message": "string",
  "footer_cta": "string"
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
            content: "You are a professional brand copywriter. Always respond with valid JSON only. Never include markdown code blocks or any text outside the JSON. Use perfect grammar, short sentences, and follow brand voice guidelines exactly.",
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