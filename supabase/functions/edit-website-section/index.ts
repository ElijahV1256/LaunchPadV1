import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const { sectionHtml, instruction } = await req.json() as {
      sectionHtml: string;
      instruction: string;
    };

    if (!sectionHtml || !instruction) {
      return new Response(
        JSON.stringify({ error: "sectionHtml and instruction are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const prompt = `You are a web designer helping edit a website section.

CURRENT HTML SECTION:
${sectionHtml}

USER INSTRUCTION:
${instruction}

IMPORTANT REQUIREMENTS:
- Edit ONLY the provided HTML section based on the user's instruction
- Keep the same structure and Tailwind CSS classes unless the instruction explicitly asks to change them
- Maintain mobile responsiveness
- Keep the clean, professional design aesthetic
- Do NOT add comments or explanations
- Return ONLY the modified HTML, nothing else
- If the instruction mentions changing text, update the text content
- If the instruction mentions colors, update the Tailwind color classes
- If the instruction mentions layout, adjust the layout structure
- Keep image URLs intact unless specifically asked to change them

Return only the updated HTML section, with no markdown formatting, no backticks, and no explanations.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to edit section", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const editedHtml = data.content?.[0]?.text || "";

    return new Response(
      JSON.stringify({ editedHtml }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error editing website section:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
