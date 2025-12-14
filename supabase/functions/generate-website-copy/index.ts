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

    const prompt = `You are an elite conversion copywriter and brand strategist specializing in modern, high-performing landing pages.

Your mission is to create compelling, conversion-optimized copy that:
- Captures attention immediately
- Communicates clear value propositions
- Builds trust and credibility
- Drives action through strategic CTAs
- Resonates emotionally with the target audience
- Uses proven copywriting frameworks (AIDA, PAS, StoryBrand, Jobs-to-be-Done)

You are NOT generating HTML, designs, or layouts.
You are ONLY creating exceptional copy that converts visitors into customers.

Follow the structure below EXACTLY, applying modern copywriting best practices.

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
- Headline: Crystal clear, benefit-driven, emotionally resonant (5-10 words max)
  * Use power words that create urgency or desire
  * Focus on the transformation or outcome, not the product
  * Examples: "Launch Your Business in 30 Days", "Transform Your Ideas Into Revenue"
- Subheadline: Expand on the headline, address the pain point or desire (15-25 words)
  * Clarify WHO it's for and WHAT they'll achieve
  * Build on the emotional hook
- Primary CTA: Action-oriented, specific, creates urgency (2-4 words)
  * Examples: "Start Building Now", "Get Your Plan", "Launch Today"
- Secondary CTA: Lower commitment, informational (2-4 words)
  * Examples: "See How It Works", "View Examples", "Learn More"
- Hero Image Description: Specific, modern, aspirational visual that supports the message

2. ABOUT SECTION
- 2–3 compelling sentences that tell a story:
  - Lead with the WHY (mission, purpose, problem being solved)
  - Explain WHO you help and HOW you're different
  - End with the transformation or impact you create
- Use storytelling elements: conflict, solution, transformation
- Make it personal and authentic, not corporate
- Example structure: "We started because [problem]. Now we help [audience] achieve [outcome] through [unique approach]."

3. FEATURES / SERVICES
- Write 3–6 benefit-focused features (focus on outcomes, not features)
- For each feature:
  - Title: Benefit-driven name (not just feature name)
  - Description: One compelling sentence about the value/outcome (15-20 words)
  - Image description: Visual that represents the benefit
- Use the "So What?" test - every feature should answer "What's in it for me?"
- Pattern: "[Feature] so you can [benefit]" or "[Outcome] without [pain point]"
- Examples: "Instant Setup" → "Launch in Minutes, Not Months" with description "Get your business online today with our guided setup - no technical skills required."

4. VALUE PROPOSITION / WHY CHOOSE US
- Write 3–5 powerful, differentiated value statements
- Each should be specific, not generic
- Focus on unique advantages and competitive differentiators
- Use concrete numbers, timelines, or specifics when possible
- Avoid clichés like "high quality" or "great service"
- Pattern: "[Specific benefit] that [creates outcome]"
- Examples:
  * "Launch-ready templates that get you online in hours, not weeks"
  * "Built-in marketing tools that attract customers from day one"
  * "Zero technical knowledge required - if you can click, you can build"

5. SOCIAL PROOF / TESTIMONIALS
- Write 2–3 authentic-sounding testimonials that:
  - Mention a specific problem or situation
  - Describe the transformation or result
  - Include emotional language
  - Feel real, not corporate
- Format: [Name], [Role/Title] (make roles relevant to target audience)
- OR use credibility indicators:
  - Specific metrics: "Used by 500+ entrepreneurs", "10,000+ businesses launched"
  - Time-based trust: "Helping businesses since [year]", "Trusted by founders for 5+ years"
  - Authority markers: "Featured in [publication]", "Recommended by [expert]"
- Make testimonials feel authentic with specific details and natural language

6. PRICING (IF APPLICABLE)
- If the business uses pricing tiers, provide up to 3:
  - For each tier:
    - Title
    - Description
    - 3–5 bullet points
    - CTA
- If pricing doesn't apply, return empty array

7. FAQ SECTION
- Provide 3–6 strategic questions that address objections and build confidence
- Focus on questions that remove buying barriers:
  - "How quickly can I get started?" (removes time concern)
  - "Do I need technical skills?" (removes capability concern)
  - "What if I need help?" (removes support concern)
  - "Can I change my mind later?" (removes commitment concern)
- Answer concisely but reassuringly
- Use this section to overcome objections and reinforce value

8. FINAL CALL TO ACTION (FOOTER CTA)
- Create urgency and excitement without being pushy
- Reinforce the main benefit one last time
- Use pattern: "[Inspiring statement about future state]. [Strong CTA]"
- Examples:
  * "Ready to turn your idea into reality? Start building today."
  * "Your business journey starts here. Launch your first step now."
  * "Join thousands of entrepreneurs making their dreams happen. Get started free."

📌 COPYWRITING PRINCIPLES
- Write for skimmers: Short sentences, clear hierarchy, easy to scan
- Use active voice: "Launch your business" not "Your business can be launched"
- Be specific: Replace vague claims with concrete details
- Show, don't tell: Use examples and specifics instead of adjectives
- Create contrast: Highlight the before/after, problem/solution
- Build momentum: Start with attention, build desire, create urgency, call to action
- Perfect grammar and spelling always
- Match the brand voice and tone exactly
- No jargon or technical terms unless the audience expects them
- Every word should earn its place - be ruthless in editing
- Focus on benefits and outcomes, not features and processes

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