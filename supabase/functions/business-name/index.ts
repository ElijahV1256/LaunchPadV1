import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  idea: string;
  keywords?: string;
  openaiApiKey?: string;
  ideaKey?: string;
  userId?: string;
}

interface NameResult {
  name: string;
  reason: string;
  tagline: string;
}

interface ResponseBody {
  names: NameResult[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { idea, keywords, openaiApiKey: providedApiKey, ideaKey, userId }: RequestBody = await req.json();

    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'idea' field" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const openaiApiKey = providedApiKey || Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

    let existingNames: string[] = [];
    if (userId && ideaKey) {
      const { data: savedNames } = await supabase
        .from('saved_business_names')
        .select('name')
        .eq('user_id', userId)
        .eq('idea_key', ideaKey);

      if (savedNames && savedNames.length > 0) {
        existingNames = savedNames.map((n: any) => n.name);
      }

      const { data: brandData } = await supabase
        .from('brand_identity')
        .select('generated_names')
        .eq('user_id', userId)
        .eq('idea_key', ideaKey)
        .maybeSingle();

      if (brandData?.generated_names) {
        const previousNames = Array.isArray(brandData.generated_names)
          ? brandData.generated_names.map((n: any) => n.name || n)
          : [];
        existingNames = [...existingNames, ...previousNames];
      }
    }

    let userMessage = `Generate 5 creative business names for ${idea.trim()}.`;
    if (keywords && keywords.trim()) {
      userMessage += ` Consider these keywords: ${keywords.trim()}.`;
    }
    if (existingNames.length > 0) {
      userMessage += ` IMPORTANT: DO NOT generate any of these names that were already generated: ${existingNames.join(', ')}.`;
    }
    userMessage += ` For each name, include reasoning and a short, catchy tagline (5-8 words max).`;

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
            content: "You are Launch Pad's Business Name Generator. You create short, catchy, easy-to-pronounce names (1–2 words) for business ideas. Always respond with valid JSON in this exact format: { \"names\": [{ \"name\": \"string\", \"reason\": \"string\", \"tagline\": \"string\" }] }",
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.9,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate names" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return new Response(
        JSON.stringify({ error: "No response from AI" }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result: ResponseBody = JSON.parse(content);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err: any) {
    console.error("Error in business-name function:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});