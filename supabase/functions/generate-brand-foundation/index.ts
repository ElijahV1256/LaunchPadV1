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
    const { businessName, businessDescription, targetAudience, brandPersonality, industry } = await req.json();

    if (!businessName || !businessDescription) {
      return new Response(
        JSON.stringify({ error: "Business name and description are required" }),
        {
          status: 400,
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

    const audienceText = targetAudience ? `Target audience: ${targetAudience}.` : '';
    const personalityText = brandPersonality ? `Brand personality: ${brandPersonality}.` : '';
    const industryText = industry ? `Industry: ${industry}.` : '';

    const prompt = `You are an expert brand strategist. Create comprehensive brand foundation content for "${businessName}".

Business: ${businessDescription}
${audienceText}
${personalityText}
${industryText}

Generate the following in JSON format:
{
  "mission": "A clear mission statement (1-2 sentences about what the business does and why)",
  "vision": "An inspiring vision statement (1-2 sentences about future goals)",
  "coreValues": ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5"],
  "uvp": "A unique value proposition (1 sentence explaining what makes this business different)",
  "voiceDescription": "Brand voice description (professional, friendly, etc. - 1 sentence)",
  "voiceExamples": ["Example 1", "Example 2"],
  "elevatorPitch": "A compelling elevator pitch (2-3 sentences)",
  "messagingDos": ["Do 1", "Do 2", "Do 3"],
  "messagingDonts": ["Don't 1", "Don't 2", "Don't 3"]
}

Return ONLY valid JSON, no markdown formatting.`;

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
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
    const content = anthropicData.content[0].text.trim();

    let brandFoundation;
    try {
      brandFoundation = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      brandFoundation = {
        mission: `To provide exceptional ${businessDescription}`,
        vision: `To become a leading provider in our industry`,
        coreValues: ['Quality', 'Integrity', 'Innovation', 'Customer Focus', 'Excellence'],
        uvp: `Delivering outstanding value through ${businessDescription}`,
        voiceDescription: 'Professional, approachable, and trustworthy',
        voiceExamples: ['We make it easy for you.', 'Your success is our priority.'],
        elevatorPitch: `${businessName} helps ${targetAudience || 'customers'} by providing ${businessDescription}. We stand out through our commitment to quality and customer satisfaction.`,
        messagingDos: ['Be clear and concise', 'Focus on customer benefits', 'Maintain consistency'],
        messagingDonts: ['Use jargon', 'Make false promises', 'Ignore customer feedback']
      };
    }

    return new Response(
      JSON.stringify({ brandFoundation }),
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
      JSON.stringify({ error: error.message || "Failed to generate brand foundation" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});