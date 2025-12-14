import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import OpenAI from "npm:openai@4.70.1";

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
    const { websiteId, userMessage, apiKey } = await req.json();

    if (!websiteId || !userMessage) {
      return new Response(
        JSON.stringify({ error: "Website ID and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = apiKey || Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: website, error: websiteError } = await supabaseClient
      .from("websites")
      .select("*")
      .eq("id", websiteId)
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

    const copy = website.copy || {};
    const theme = website.theme || {};
    const designPrefs = website.design_preferences || {};

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const prompt = `You are an elite web design and UX expert who provides strategic, actionable feedback for website optimization.

CURRENT WEBSITE CONTEXT:
Business: ${designPrefs.businessDescription || "N/A"}
Industry: ${designPrefs.industry || "N/A"}
Brand Personality: ${designPrefs.brandPersonality || "N/A"}

Current Content:
- Hero Headline: ${copy.hero_headline || "N/A"}
- Hero Subheadline: ${copy.hero_subheadline || "N/A"}
- About: ${copy.about_text || "N/A"}
- Features: ${JSON.stringify(copy.features || [])}
- Value Benefits: ${JSON.stringify(copy.value_benefits || [])}

Brand Colors:
- Primary: ${theme.colors?.primary || "N/A"}
- Secondary: ${theme.colors?.secondary || "N/A"}
- Accent: ${theme.colors?.accent || "N/A"}

USER'S REQUEST:
"${userMessage}"

YOUR TASK:
Provide expert analysis and actionable recommendations based on UX best practices, conversion optimization, and modern design principles.

RESPONSE FRAMEWORK:

For Content/Copy Changes:
1. Acknowledge the request and why it matters
2. Explain the improvement from a conversion/UX perspective
3. Provide the exact new copy, ready to use
4. Explain how this strengthens the message
5. Set requires_regeneration: true if the change is significant

For Design Changes:
1. Validate the request with design principles
2. Explain the visual/UX impact
3. Provide specific design recommendations
4. Suggest complementary improvements if relevant
5. Set requires_regeneration: true if preview should update

For Questions/Feedback:
1. Answer with expertise and context
2. Reference design principles or conversion best practices
3. Provide actionable next steps
4. Offer alternatives or enhancements

QUALITY STANDARDS:
- Be specific, not vague ("Make it pop" ❌ "Increase contrast with a bolder headline" ✓)
- Ground suggestions in principles (UX, conversion, accessibility, psychology)
- Provide complete, ready-to-use content (not placeholders)
- Think conversion-first: Will this help users take action?
- Consider the user journey and emotional impact
- Be encouraging and collaborative in tone

RESPONSE FORMAT:

Return ONLY valid JSON in this exact structure:
{
  "response": "Your expert, friendly response explaining the changes and why they work",
  "suggested_changes": {
    "copy_updates": {
      "hero_headline": "Complete new headline (only if change requested)",
      "hero_subheadline": "Complete new subheadline (only if change requested)",
      "about_text": "Complete new about text (only if change requested)",
      "hero_cta_primary": "New primary CTA text (only if change requested)",
      "hero_cta_secondary": "New secondary CTA text (only if change requested)",
      "features": [{"title": "...", "description": "..."}] (only if changes requested)
    },
    "design_updates": {
      "colors": {
        "primary": "New hex code (only if requested)",
        "secondary": "New hex code (only if requested)",
        "accent": "New hex code (only if requested)"
      },
      "typography": "Font or typography suggestions if relevant",
      "layout": "Layout change suggestions if relevant",
      "style_notes": "Detailed description of all design changes"
    }
  },
  "requires_regeneration": true or false
}

CRITICAL RULES:
- Only include fields in "suggested_changes" if you're actually providing new content
- Provide COMPLETE content, not partial edits or instructions
- Set "requires_regeneration" to true for any content or design changes
- Set "requires_regeneration" to false for questions or minor feedback
- Make "response" conversational, encouraging, and educational
- Ground all suggestions in UX/conversion principles
- Be specific with colors (use hex codes), typography, and spacing recommendations`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite web design and UX expert specializing in conversion optimization. Always respond with valid JSON only. Provide strategic, actionable, conversion-focused feedback grounded in design principles and user psychology."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    let aiResponse = completion.choices[0].message.content || "{}";
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse AI response:", aiResponse);
      parsedResponse = {
        response: aiResponse,
        suggested_changes: {},
        requires_regeneration: false
      };
    }

    const { data: suggestion, error: insertError } = await supabaseClient
      .from("website_suggestions")
      .insert({
        website_id: websiteId,
        user_id: user.id,
        user_message: userMessage,
        ai_response: JSON.stringify(parsedResponse),
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving suggestion:", insertError);
    }

    return new Response(
      JSON.stringify({
        suggestion_id: suggestion?.id,
        ...parsedResponse
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});