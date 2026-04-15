import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("plan, trial_end")
      .eq("id", user.id)
      .maybeSingle();

    const isPro =
      profile?.plan === "pro" ||
      (profile?.trial_end && new Date(profile.trial_end) > new Date());
    if (!isPro) {
      return new Response(
        JSON.stringify({ error: "Upgrade required", code: "PRO_REQUIRED" }),
        {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { zip } = await req.json();
    if (!zip || !/^\d{5}$/.test(zip)) {
      return new Response(
        JSON.stringify({ error: "Valid 5-digit ZIP code required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are a local market research analyst. Generate a comprehensive business growth report for ZIP code ${zip} in the United States.

Use your knowledge of US demographics, economic trends, regional industries, and business data to create an accurate, helpful report. Be specific to the actual area this ZIP code covers -- reference the real city/town name, known local industries, and regional economic patterns.

Return ONLY a valid JSON object with this EXACT structure:

{
  "zipCode": "${zip}",
  "areaName": "City/Town Name, State",
  "marketSummary": "2-3 sentence overview of the local business climate and economic health of this specific area",
  "winningBusinesses": [
    {
      "name": "Business Type/Industry Name",
      "trend": "Brief trend description",
      "growthRate": "e.g. +15% YoY",
      "demandLevel": "High/Medium/Low",
      "saturation": "Low/Medium/High",
      "insight": "2-3 sentences explaining why this business type is thriving here specifically"
    }
  ],
  "decliningBusinesses": [
    {
      "name": "Business Type/Industry Name",
      "trend": "Brief trend description",
      "growthRate": "e.g. -12% YoY",
      "demandLevel": "High/Medium/Low",
      "saturation": "Oversaturated/High/Medium",
      "insight": "2-3 sentences explaining why this business type is declining here specifically"
    }
  ],
  "recommendations": [
    {
      "title": "Recommended Business to Start",
      "why": "2-3 sentences on why this is a strong opportunity in this specific area",
      "estimatedStartupCost": "$X,XXX - $XX,XXX",
      "difficultyLevel": "Beginner/Intermediate/Advanced",
      "firstStep": "One concrete actionable first step to get started"
    }
  ],
  "marketStats": {
    "populationTrend": "Growing/Stable/Declining with context",
    "medianIncome": "Approximate median household income",
    "topIndustry": "The dominant industry in this area",
    "marketHealth": "Strong/Moderate/Weak with brief reason"
  }
}

Requirements:
- Include exactly 5 winning businesses
- Include exactly 4 declining businesses
- Include exactly 3 recommendations
- Be specific to the actual geographic area of ZIP ${zip}
- Base insights on real regional economic patterns, not generic advice
- Growth rates should be realistic estimates
- Recommendations should fill gaps between winning trends and declining sectors
- Each recommendation must include a practical, specific first step`;

    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.7,
          max_tokens: 3000,
        }),
      }
    );

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text();
      console.error("OpenAI error:", errText);
      throw new Error("Failed to generate market report");
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    const report = JSON.parse(
      content
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
    );

    await supabase.from("local_analyses").insert({
      user_id: user.id,
      zip,
      lat: 0,
      lng: 0,
      radius_miles: 0,
      result_json: report,
    });

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
