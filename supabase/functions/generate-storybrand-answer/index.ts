import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { question, field, ideaKey } = await req.json();

    if (!question || !field) {
      return new Response(
        JSON.stringify({ error: "Missing question or field parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: profile } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    let brandContext = '';
    if (ideaKey) {
      const { data: brandIdentity } = await supabaseClient
        .from("brand_identity")
        .select("*")
        .eq("user_id", user.id)
        .eq("idea_key", ideaKey)
        .maybeSingle();

      if (brandIdentity) {
        brandContext = `
Business Name: ${brandIdentity.business_name || 'Not specified'}
Business Type: ${brandIdentity.business_type || 'Not specified'}
Target Audience: ${brandIdentity.target_audience || 'Not specified'}
Unique Value: ${brandIdentity.unique_value || 'Not specified'}`;
      }
    }

    let profileContext = '';
    if (profile?.onboarding_answers) {
      const answers = profile.onboarding_answers;
      profileContext = `
Stage: ${answers.stage || 'Not specified'}
Motivation: ${answers.motivation || 'Not specified'}
Problems They're Passionate About: ${answers.passionate_problems || 'Not specified'}
Specific Skills: ${answers.specific_skills || 'Not specified'}
Ideal Customer: ${answers.ideal_customer || 'Not specified'}
Industries: ${answers.industries || 'Not specified'}`;
    }

    const fieldInstructions: { [key: string]: string } = {
      customerWant: "Focus on the main desire or goal. Keep it simple and emotional (e.g., 'save time', 'feel confident', 'make more money').",
      problem: "Identify the specific frustration or pain point preventing them from getting what they want. Be concrete and relatable.",
      solution: "Explain clearly how your business solves their problem in simple terms. Focus on the transformation, not features.",
      brandPromise: "Describe the better life or feeling they'll experience after working with you. Paint a picture of success.",
      cta: "Create a clear, actionable next step that's low-risk and easy to take (e.g., 'Schedule a free call', 'Get your first month free')."
    };

    const instruction = fieldInstructions[field] || "Provide a clear, simple answer.";

    const prompt = `You are a StoryBrand messaging expert helping create clear, compelling business messaging.

Question: ${question}

Business Context:${brandContext || ' Not yet specified'}

User Profile:${profileContext || ' Not yet specified'}

Instructions: ${instruction}

Generate a short, clear answer to this question (2-3 sentences max). Write at a 6th grade reading level. Make it specific to this business context when available, but keep it simple and actionable. Return ONLY the answer text, no extra formatting or explanation.`;

    const apiKey = Deno.env.get("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not set");
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI request failed: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const answer = openaiData.choices[0]?.message?.content?.trim() || "";

    return new Response(
      JSON.stringify({ answer }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});