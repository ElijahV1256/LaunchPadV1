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

    const { feedbackId } = await req.json();

    if (!feedbackId) {
      throw new Error("feedbackId is required");
    }

    // Get the feedback
    const { data: feedback, error: fetchError } = await supabase
      .from("customer_feedback")
      .select("*")
      .eq("id", feedbackId)
      .single();

    if (fetchError || !feedback) {
      throw new Error("Failed to fetch feedback");
    }

    // Call OpenAI to analyze the feedback
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
            content: "You are an expert business analyst specializing in customer feedback analysis. Analyze the feedback and provide actionable insights."
          },
          {
            role: "user",
            content: `Analyze this customer feedback and provide:
1. Overall sentiment (positive, negative, neutral, or mixed)
2. Key points mentioned (3-5 bullet points)
3. Specific suggestions for improvement (3-5 actionable items)

Customer: ${feedback.customer_name}
Rating: ${feedback.rating}/5
Feedback: ${feedback.feedback_text}

Respond in JSON format with this structure:
{
  "sentiment": "positive/negative/neutral/mixed",
  "key_points": ["point1", "point2", ...],
  "suggestions": ["suggestion1", "suggestion2", ...]
}`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const openaiData = await openaiResponse.json();
    const content = openaiData.choices[0].message.content;

    // Parse the JSON response from OpenAI
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (parseError) {
      // If parsing fails, extract information manually
      analysis = {
        sentiment: "neutral",
        key_points: ["Unable to parse detailed analysis"],
        suggestions: ["Review feedback manually for specific insights"]
      };
    }

    // Update the feedback with AI analysis
    const { error: updateError } = await supabase
      .from("customer_feedback")
      .update({ ai_analysis: analysis })
      .eq("id", feedbackId);

    if (updateError) {
      throw new Error("Failed to update feedback with analysis");
    }

    return new Response(
      JSON.stringify({ success: true, analysis }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error in analyze-feedback:", error);
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
