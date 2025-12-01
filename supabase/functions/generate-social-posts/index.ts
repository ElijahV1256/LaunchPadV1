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
      storyBrandData
    } = body;

    console.log('Received request for social posts:', { businessName });

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const descriptionText = businessDescription || businessName;
    const voiceText = brandVoice || "professional, approachable, and engaging";
    const audienceText = targetAudience || "your target audience";

    const storyBrandContext = storyBrandData
      ? `\n\nStoryBrand Context:\n- Character: ${storyBrandData.character || 'N/A'}\n- Problem: ${storyBrandData.problem || 'N/A'}\n- Solution: ${storyBrandData.solution || 'N/A'}`
      : '';

    const prompt = `You are a social media marketing expert. Create 5 engaging Instagram/social media post captions for ${businessName}.

Business: ${descriptionText}
Target Audience: ${audienceText}
Brand Voice: ${voiceText}${storyBrandContext}

Create 5 diverse social media posts that:
1. Are engaging and authentic
2. Include a strong call-to-action
3. Use relevant hashtags (5-10 per post)
4. Vary in style (educational, promotional, behind-the-scenes, testimonial-style, value-driven)
5. Are optimized for Instagram/Facebook/LinkedIn
6. Are 100-150 words each

Format each post as JSON with:
{
  "caption": "The full post caption with emojis where appropriate",
  "hashtags": ["hashtag1", "hashtag2", ...],
  "postType": "educational|promotional|behind-the-scenes|testimonial|value-driven"
}

Return a JSON array of 5 posts. Only return the JSON array, no other text.`;

    console.log('Calling OpenAI API for social posts...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a social media marketing expert who creates engaging, authentic content that drives results. Always return valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
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

    let posts;
    try {
      posts = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', cleanContent);
      throw new Error('Failed to parse social posts from AI response');
    }

    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error('Invalid social posts format from AI');
    }

    console.log(`Successfully generated ${posts.length} social posts`);

    return new Response(
      JSON.stringify({ posts }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-social-posts:', error);
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