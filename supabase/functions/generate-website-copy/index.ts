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
    const { businessName, ideaKey, apiKey } = await req.json();

    console.log("Received request:", { businessName, ideaKey });

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

    const prompt = `You are a conversion copywriter creating website copy for a business called "${businessName}".

Create compelling, conversion-optimized copy for a one-page website including:

1. Hero Headline: A punchy, benefit-driven headline (8-12 words)
2. Hero Subheadline: Expands on the headline, addresses pain point (15-25 words)
3. Benefits: 3 key benefits (each 10-15 words)
4. Offer Section: Clear description of what they're buying (30-50 words)
5. Pricing: Simple pricing presentation (20-30 words)
6. Testimonials: 2 realistic customer testimonials with names
7. FAQs: 3 common questions with answers

Return ONLY valid JSON in this exact format:
{
  "hero_headline": "string",
  "hero_subheadline": "string",
  "benefits": ["string", "string", "string"],
  "offer_section": "string",
  "pricing": "string",
  "testimonials": [
    {"name": "string", "text": "string", "rating": 5},
    {"name": "string", "text": "string", "rating": 5}
  ],
  "faqs": [
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"},
    {"question": "string", "answer": "string"}
  ]
}`;

    console.log("Calling OpenAI API...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional conversion copywriter. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.8,
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