import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const body = await req.json();
    const {
      businessName,
      businessDescription,
      targetAudience,
      brandVoice,
      tagline,
      storyBrandData
    } = body;

    console.log('Received request for ad strategy:', { businessName });

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const descriptionText = businessDescription || businessName;
    const voiceText = brandVoice || "professional, approachable, and trustworthy";
    const audienceText = targetAudience || "your target market";
    const taglineText = tagline || businessName;

    const storyBrandContext = storyBrandData
      ? `\n\nStoryBrand Context:\n- Character: ${storyBrandData.character || 'N/A'}\n- Problem: ${storyBrandData.problem || 'N/A'}\n- Solution: ${storyBrandData.solution || 'N/A'}`
      : '';

    const prompt = `You are a digital marketing strategist. Create a comprehensive advertising strategy for ${businessName}.

Business: ${descriptionText}
Target Audience: ${audienceText}
Brand Voice: ${voiceText}
Tagline: ${taglineText}${storyBrandContext}

Create a detailed ad strategy with:

1. Platform Recommendations (3-4 platforms with reasoning)
2. Budget Allocation (percentage breakdown across platforms)
3. Target Audience Segments (3-4 key segments with demographics/psychographics)
4. Key Messages (3-5 core messages to emphasize)
5. Ad Formats (recommended ad types for each platform)
6. Success Metrics (KPIs to track)
7. Campaign Timeline (suggested phases and duration)

Format your response as JSON with:
{
  "platforms": [
    {
      "name": "Platform name",
      "reasoning": "Why this platform",
      "budgetPercent": 30
    }
  ],
  "targetSegments": [
    {
      "name": "Segment name",
      "description": "Demographics and psychographics"
    }
  ],
  "keyMessages": ["Message 1", "Message 2", ...],
  "adFormats": {
    "PlatformName": ["Format 1", "Format 2"]
  },
  "metrics": ["Metric 1", "Metric 2", ...],
  "timeline": {
    "phase1": "Description",
    "phase2": "Description",
    "phase3": "Description"
  }
}

Return only valid JSON, no other text.`;

    console.log('Calling OpenAI API for ad strategy...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a digital marketing strategist creating comprehensive ad strategies. Always return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    console.log('Raw OpenAI response:', content);

    const cleanContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let strategy;
    try {
      strategy = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', cleanContent);
      throw new Error('Failed to parse ad strategy from AI response');
    }

    console.log('Successfully generated ad strategy');

    return new Response(
      JSON.stringify({ strategy }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-ad-strategy:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
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