import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.73.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  business_name: string;
  industry?: string;
  color_palette?: string[];
}

interface LogoConcept {
  concept: string;
  description: string;
  rationale: string;
}

interface ResponseBody {
  logos: LogoConcept[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      throw new Error("OpenAI API key not configured");
    }

    const { business_name, industry, color_palette }: RequestBody = await req.json();

    if (!business_name) {
      return new Response(
        JSON.stringify({ error: "business_name is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openai = new OpenAI({ apiKey: openaiApiKey });

    const industryText = industry ? ` in the ${industry} industry` : "";
    const colorText = color_palette && color_palette.length > 0
      ? ` using colors ${color_palette.join(", ")}`
      : "";

    const systemMessage = "You are Launch Pad's Logo Designer. You create simple, modern, trustworthy logo ideas for businesses. Focus on readability, clean shapes, and balanced color use.";
    
    const userMessage = `Generate 3 professional logo concept ideas for ${business_name}${industryText}${colorText}. Include a short rationale for each.

Respond ONLY with valid JSON in this exact format:
{
  "logos": [
    {
      "concept": "Brief concept description",
      "description": "What the logo looks like",
      "rationale": "Why this works for the business"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    const parsedResponse = JSON.parse(content) as ResponseBody;

    if (!parsedResponse.logos || !Array.isArray(parsedResponse.logos)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return new Response(
      JSON.stringify(parsedResponse),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in logo-generator:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});