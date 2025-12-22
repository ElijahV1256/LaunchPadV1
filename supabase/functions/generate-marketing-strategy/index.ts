import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { websiteId } = await req.json();

    if (!websiteId) {
      return new Response(
        JSON.stringify({ error: "Website ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: website, error: websiteError } = await supabaseClient
      .from("managed_websites")
      .select(`
        *,
        website_content(*),
        website_payments(*)
      `)
      .eq("id", websiteId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (websiteError || !website) {
      return new Response(
        JSON.stringify({ error: "Website not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const businessType = website.business_type === 'ecommerce' ? 'E-commerce' : 'Service-based';
    const content = website.website_content?.[0];
    const payments = website.website_payments?.[0];

    const prompt = `You are a marketing strategy expert. Create a comprehensive, actionable marketing strategy guide for this business.

BUSINESS INFORMATION:
- Business Name: ${website.brand_name}
- Business Type: ${businessType}
- Hero Headline: ${content?.home?.hero?.headline || 'Not set'}
- Value Proposition: ${content?.home?.hero?.subheadline || 'Not set'}
- Target Audience: ${content?.home?.social_proof?.bullets?.[0] || 'General consumers'}
- Pricing: ${payments?.default_price || 'Not set'}
- CTA: ${content?.home?.hero?.cta_text || 'Get Started'}

Create a detailed marketing strategy in JSON format with these sections:

1. overview: {
  executive_summary: "2-3 sentence overview",
  primary_goal: "Main business objective",
  key_objectives: ["objective 1", "objective 2", "objective 3"]
}

2. target_audience: {
  primary_persona: {
    name: "Persona name",
    demographics: "Age, income, location, etc",
    psychographics: "Values, interests, pain points",
    behaviors: "Online behavior, buying patterns"
  },
  secondary_personas: [/* 1-2 additional personas */],
  audience_size_estimate: "Market size estimate"
}

3. unique_selling_points: {
  main_usp: "Primary differentiator",
  supporting_usps: ["usp 1", "usp 2", "usp 3"],
  competitive_advantages: ["advantage 1", "advantage 2"],
  value_proposition_statement: "One-liner pitch"
}

4. marketing_channels: {
  priority_channels: [
    {
      name: "Channel name",
      rationale: "Why this channel",
      strategy: "Specific approach",
      tactics: ["tactic 1", "tactic 2"],
      budget_allocation: "XX%",
      expected_roi: "Expected return"
    }
  ],
  content_themes: ["theme 1", "theme 2", "theme 3"]
}

5. content_strategy: {
  content_pillars: ["pillar 1", "pillar 2", "pillar 3"],
  content_types: [
    {
      type: "Blog posts, videos, etc",
      frequency: "How often",
      topics: ["topic 1", "topic 2"]
    }
  ],
  distribution_plan: "Where and how to distribute"
}

6. launch_plan: {
  phase_1_first_30_days: {
    focus: "Primary focus",
    actions: [
      {
        action: "Specific action",
        deadline: "Day X",
        success_metric: "How to measure"
      }
    ]
  },
  phase_2_days_31_60: {/* same structure */},
  phase_3_days_61_90: {/* same structure */}
}

7. metrics: {
  primary_kpis: [
    {
      metric: "Metric name",
      target: "Goal",
      measurement_frequency: "Daily/Weekly/Monthly"
    }
  ],
  secondary_metrics: ["metric 1", "metric 2"],
  tracking_tools: ["tool 1", "tool 2"]
}

8. budget_recommendations: {
  total_monthly_budget: "Recommended amount",
  allocation: [
    {
      category: "Category name",
      percentage: "XX%",
      amount: "$XXX",
      rationale: "Why this amount"
    }
  ],
  bootstrap_alternatives: ["low-cost option 1", "low-cost option 2"]
}

Make the strategy:
- ACTIONABLE: Specific steps, not vague advice
- REALISTIC: Achievable for a small business owner
- MEASURABLE: Clear metrics and goals
- TAILORED: Specific to this business type and industry
- PRACTICAL: Include both paid and organic tactics

Return ONLY the JSON object, no markdown formatting or code blocks.`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!anthropicResponse.ok) {
      const errorText = await anthropicResponse.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicData = await anthropicResponse.json();
    const strategyText = anthropicData.content[0].text;

    let strategy;
    try {
      strategy = JSON.parse(strategyText);
    } catch (parseError) {
      console.error("Failed to parse AI response:", strategyText);
      return new Response(
        JSON.stringify({ error: "Failed to parse strategy" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: existingStrategy } = await supabaseClient
      .from("marketing_strategies")
      .select("id")
      .eq("website_id", websiteId)
      .eq("user_id", user.id)
      .maybeSingle();

    let savedStrategy;
    if (existingStrategy) {
      const { data, error } = await supabaseClient
        .from("marketing_strategies")
        .update({
          business_name: website.brand_name,
          overview: strategy.overview,
          target_audience: strategy.target_audience,
          unique_selling_points: strategy.unique_selling_points,
          marketing_channels: strategy.marketing_channels,
          content_strategy: strategy.content_strategy,
          launch_plan: strategy.launch_plan,
          metrics: strategy.metrics,
          budget_recommendations: strategy.budget_recommendations,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingStrategy.id)
        .select()
        .single();

      savedStrategy = data;
      if (error) throw error;
    } else {
      const { data, error } = await supabaseClient
        .from("marketing_strategies")
        .insert({
          user_id: user.id,
          website_id: websiteId,
          business_name: website.brand_name,
          overview: strategy.overview,
          target_audience: strategy.target_audience,
          unique_selling_points: strategy.unique_selling_points,
          marketing_channels: strategy.marketing_channels,
          content_strategy: strategy.content_strategy,
          launch_plan: strategy.launch_plan,
          metrics: strategy.metrics,
          budget_recommendations: strategy.budget_recommendations,
        })
        .select()
        .single();

      savedStrategy = data;
      if (error) throw error;
    }

    return new Response(
      JSON.stringify({
        success: true,
        strategy: savedStrategy
      }),
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
