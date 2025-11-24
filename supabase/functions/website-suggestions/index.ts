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

    const prompt = `You are a professional web designer and UX consultant providing feedback and suggestions for website improvements.

CURRENT WEBSITE CONTEXT:
Business: ${designPrefs.businessDescription || "N/A"}
Industry: ${designPrefs.industry || "N/A"}
Brand Personality: ${designPrefs.brandPersonality || "N/A"}

Current Content:
- Hero: ${copy.hero_headline || "N/A"}
- About: ${copy.about_text || "N/A"}
- Features: ${JSON.stringify(copy.features || [])}
- Value Benefits: ${JSON.stringify(copy.value_benefits || [])}

Brand Colors:
- Primary: ${theme.colors?.primary || "N/A"}
- Secondary: ${theme.colors?.secondary || "N/A"}
- Accent: ${theme.colors?.accent || "N/A"}

USER'S FEEDBACK/SUGGESTION:
"${userMessage}"

YOUR TASK:
Analyze the user's feedback and provide a helpful, actionable response.

If they want changes:
1. Explain what you'll improve and why
2. Provide specific, clear suggestions
3. If it's a copywriting change, provide the new copy
4. If it's a design change, describe what should change
5. Keep responses concise and professional

If they have questions:
1. Answer clearly and professionally
2. Provide context about why certain design decisions were made
3. Offer alternatives if appropriate

Response Style:
- Professional but friendly
- Clear and concise
- Actionable
- Educational when appropriate

Return ONLY valid JSON in this format:
{
  "response": "Your detailed response to the user",
  "suggested_changes": {
    "copy_updates": {
      "hero_headline": "new headline if suggested",
      "hero_subheadline": "new subheadline if suggested",
      "about_text": "new about text if suggested"
    },
    "design_updates": {
      "colors": {
        "primary": "new primary color if suggested",
        "secondary": "new secondary color if suggested"
      },
      "style_notes": "description of design changes"
    }
  },
  "requires_regeneration": false
}

Notes:
- Only include fields in "suggested_changes" if changes are actually recommended
- Set "requires_regeneration" to true if the website preview should be regenerated
- Keep the response conversational and helpful`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional web designer and UX consultant. Always respond with valid JSON only. Provide helpful, actionable feedback."
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