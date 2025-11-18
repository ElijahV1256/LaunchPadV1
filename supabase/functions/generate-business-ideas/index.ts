import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  costRange: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  console.log('=== Edge Function Called ===');

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

    const { keywords, previousIdeas, openaiApiKey } = await req.json();

    const apiKey = openaiApiKey || Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY not provided and environment variable is not set");
    }

    const { data: profile, error: profileError } = await supabaseClient
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const previousSection = previousIdeas && previousIdeas.length > 0
      ? `\n\nIMPORTANT: The user has already seen these ideas, so generate COMPLETELY DIFFERENT and UNIQUE ideas:\n${previousIdeas.join('\n')}\n\nDo NOT repeat or create similar variations of these ideas. Be creative and explore different angles, industries, or approaches.`
      : '';

    let prompt: string;

    if (keywords) {
      prompt = `You are the Launch Pad Business Generator. Generate 3 business ideas based on: ${keywords}

Your business ideas must be:
- Proven to work in the real world with many successful examples
- Currently trending upward, not declining
- Relatively simple to start and operate
- Low to medium startup cost (under $5000)
- Quick to become profitable
- Beginner-friendly

Every business idea must:
1. Already exist in the real world with many successful examples
2. Be validated by a large number of entrepreneurs
3. Have clear demand and paying customers
4. Be feasible for solo founders or small teams

Avoid:
- Extremely complex tech startups
- High-risk ideas that depend on luck or virality
- Anything requiring large upfront capital
- Unproven or experimental business models

For each idea provide:
1. Simple, clear business name (not overly creative)
2. 2-sentence description focusing on proven success and simplicity
3. Difficulty (1-5, keep most 1-3 for beginners)
4. Realistic cost range (keep it low to medium)

Return ONLY a valid JSON object in this EXACT format:
{
  "ideas": [
    {
      "name": "Business Name Here",
      "description": "Description here",
      "difficulty": 2,
      "costRange": "$500-$1000"
    }
  ]
}${previousSection}`;
    } else {
      const onboardingAnswers = profile.onboarding_answers;

      let profileContext = '';
      if (onboardingAnswers) {
        profileContext = `
Stage: ${onboardingAnswers.stage || 'Not specified'}
Motivation: ${onboardingAnswers.motivation || 'Not specified'}
Time Commitment: ${onboardingAnswers.time_commitment || 'Not specified'}
Strengths: ${onboardingAnswers.strengths || 'Not specified'}
Energizing Work: ${onboardingAnswers.energizing_work || 'Not specified'}
Tech Level: ${onboardingAnswers.tech_savvy || 'Not specified'}
Budget: ${onboardingAnswers.budget || 'Not specified'}
Build Preference: ${onboardingAnswers.build_preference || 'Not specified'}
Lifestyle: ${onboardingAnswers.lifestyle || 'Not specified'}
Location: ${onboardingAnswers.location || 'Not specified'}
Industries: ${onboardingAnswers.industries || 'Not specified'}
Risk Tolerance: ${onboardingAnswers.risk_tolerance || 'Not specified'}
Business Size: ${onboardingAnswers.business_size || 'Not specified'}
Launch Timeline: ${onboardingAnswers.launch_timeline || 'Not specified'}

CRITICAL CONTEXT (Use these to deeply personalize ideas):
Problems They're Passionate About: ${onboardingAnswers.passionate_problems || 'Not specified'}
Specific Skills/Experience: ${onboardingAnswers.specific_skills || 'Not specified'}
Ideal Customer/Who They Want to Serve: ${onboardingAnswers.ideal_customer || 'Not specified'}`;
      } else {
        const passionateProblems = profile.interests === "I'm not sure" ? "open to various problem areas" : profile.interests;
        const energizingWork = profile.problems === "I'm not sure" ? "flexible on work type" : profile.problems;
        const lifestyle = !profile.budget || profile.budget === "Not specified" ? "flexible lifestyle goals" : profile.budget;

        profileContext = `
Problems they're passionate about: ${passionateProblems}
Work that energizes them: ${energizingWork}
Lifestyle goals: ${lifestyle}`;
      }

      prompt = `You are the Launch Pad Business Generator. Your job is to generate business ideas that are:
- Proven to work in the real world
- Currently trending upward, not declining
- Relatively simple to start and operate
- Low to medium startup cost
- Quick to become profitable
- Beginner-friendly unless otherwise specified

User Profile:
${profileContext}${previousSection}

Use the user's profile to personalize the ideas, but you are allowed to suggest ideas outside of their answers when:
- They click "I'm not sure"
- Their answers are conflicting or unclear
- A different proven business would serve them better

Every business idea must:
1. Already exist in the real world with many successful examples.
2. Be validated by a large number of entrepreneurs.
3. Have clear demand and paying customers.
4. Be feasible for solo founders or small teams.

Avoid:
- Extremely complex tech startups
- High-risk ideas that depend on luck or virality
- Anything that requires large upfront capital
- Unproven or experimental business models

For each of the 3 ideas provide:
1. Simple, clear business name (not overly creative)
2. 2-sentence description focusing on what makes it proven and simple to start
3. Difficulty (1-5, keep most ideas 1-3 unless user wants challenge)
4. Realistic cost range (keep it low to medium)

Return ONLY a valid JSON object in this EXACT format:
{
  "ideas": [
    {
      "name": "Business Name Here",
      "description": "Description here",
      "difficulty": 2,
      "costRange": "$500-$1000"
    }
  ]
}`;
    }

    console.log("Starting OpenAI request...");
    const startTime = Date.now();

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
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    const duration = Date.now() - startTime;
    console.log(`OpenAI request completed in ${duration}ms`);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI error:", errorText);
      throw new Error(`OpenAI request failed: ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    console.log('OpenAI response data:', JSON.stringify(openaiData, null, 2));

    const content = openaiData.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }

    const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    console.log('Cleaned content:', cleanContent);

    const parsedResponse = JSON.parse(cleanContent);
    const ideas = parsedResponse.ideas || parsedResponse;

    if (!Array.isArray(ideas) || ideas.length === 0) {
      throw new Error('No ideas array found in OpenAI response');
    }

    const generatedIdeas: BusinessIdea[] = ideas.map((idea: any, index: number) => ({
      id: `idea-${Date.now()}-${index}`,
      name: idea.name || 'Unnamed Idea',
      description: idea.description || 'No description provided',
      difficulty: idea.difficulty || 3,
      costRange: idea.costRange || idea.cost_range || '$500-$1000',
    }));

    console.log('Generated ideas:', generatedIdeas.length, 'ideas');

    await supabaseClient
      .from("business_ideas")
      .delete()
      .eq("user_id", user.id);

    const inserts = generatedIdeas.map((idea) => ({
      user_id: user.id,
      idea_id: idea.id,
      name: idea.name,
      description: idea.description,
      difficulty: idea.difficulty,
      cost_range: idea.costRange,
      created_at: new Date().toISOString(),
    }));

    const { error: insertError } = await supabaseClient
      .from("business_ideas")
      .insert(inserts);

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw insertError;
    }

    console.log('Successfully stored ideas in database');

    return new Response(
      JSON.stringify({ ideas: generatedIdeas }),
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
