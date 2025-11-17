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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");

    if (!openaiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);

    if (!user) {
      throw new Error("Unauthorized");
    }

    const { ideaKey } = await req.json();

    if (!ideaKey) {
      throw new Error("ideaKey is required");
    }

    // Get business idea details
    const { data: idea, error: ideaError } = await supabase
      .from("business_ideas")
      .select("*")
      .eq("idea_id", ideaKey)
      .eq("user_id", user.id)
      .single();

    if (ideaError || !idea) {
      throw new Error("Failed to fetch business idea");
    }

    // Get brand identity for more context
    const { data: brand } = await supabase
      .from("brand_identity")
      .select("*")
      .eq("idea_key", ideaKey)
      .eq("user_id", user.id)
      .maybeSingle();

    // Get any existing feedback for context
    const { data: feedbacks } = await supabase
      .from("customer_feedback")
      .select("feedback_text, rating")
      .eq("idea_key", ideaKey)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    const feedbackContext = feedbacks && feedbacks.length > 0
      ? `\n\nRecent customer feedback:\n${feedbacks.map(f => `- Rating ${f.rating}/5: ${f.feedback_text}`).join('\n')}`
      : '';

    const brandContext = brand
      ? `\n\nBrand: ${brand.selected_name}\nTarget Market: ${brand.target_market || 'Not specified'}`
      : '';

    // Call OpenAI to generate upsell ideas
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert business strategist specializing in revenue growth and upselling strategies. Generate creative, practical upsell ideas that align with the business model."
          },
          {
            role: "user",
            content: `Generate 3-5 upsell ideas for this business:

Business Name: ${idea.name}
Description: ${idea.description}
Problem Solved: ${idea.problem || 'Not specified'}
Target Market: ${idea.target_market || 'Not specified'}${brandContext}${feedbackContext}

For each upsell idea, provide:
1. Type (product, service, or tier)
2. Title (short, catchy name)
3. Description (2-3 sentences explaining the upsell)
4. Estimated price (in dollars)
5. Target audience (who would buy this)
6. Implementation difficulty (easy, medium, or hard)
7. Confidence score (0-100, how likely this would succeed)

Respond in JSON format as an array:
[
  {
    "upsell_type": "product/service/tier",
    "title": "Upsell name",
    "description": "Detailed description",
    "estimated_price": 99,
    "target_audience": "Description of target audience",
    "implementation_difficulty": "easy/medium/hard",
    "ai_confidence": 85
  }
]`
          }
        ],
        temperature: 0.8,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let upsells;
    try {
      upsells = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", content);
      throw new Error("Failed to parse upsell ideas from AI");
    }

    // Check if scale_optimization record exists
    const { data: existing } = await supabase
      .from("scale_optimization")
      .select("id, upsell_ideas")
      .eq("user_id", user.id)
      .eq("idea_key", ideaKey)
      .maybeSingle();

    // Add generated timestamp to each upsell
    const timestampedUpsells = upsells.map((u: any) => ({
      ...u,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString()
    }));

    if (existing) {
      // Update existing record by appending new upsells
      const currentUpsells = Array.isArray(existing.upsell_ideas) ? existing.upsell_ideas : [];
      const { error: updateError } = await supabase
        .from("scale_optimization")
        .update({
          upsell_ideas: [...currentUpsells, ...timestampedUpsells],
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id);

      if (updateError) {
        throw new Error("Failed to update upsell ideas");
      }
    } else {
      // Create new record
      const { error: insertError } = await supabase
        .from("scale_optimization")
        .insert({
          user_id: user.id,
          idea_key: ideaKey,
          upsell_ideas: timestampedUpsells,
          feedback_entries: [],
          community_posts: []
        });

      if (insertError) {
        throw new Error("Failed to save upsell ideas");
      }
    }

    return new Response(
      JSON.stringify({ success: true, upsells }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in generate-upsells:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
