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
    const { businessName, businessDescription } = body;

    console.log('Received request for message templates:', { businessName });

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const descriptionText = businessDescription || businessName;

    const prompt = `You are a messaging expert. Create 6 professional message templates for ${businessName} to use across different channels.

Business: ${descriptionText}

Create templates for:
1. Initial outreach email
2. Follow-up email
3. SMS/text message
4. LinkedIn connection message
5. Voicemail script
6. Thank you message

Each template should:
- Be personalized and genuine
- Include a clear call-to-action
- Be appropriate for the channel
- Be concise but effective
- Include placeholders like [Name], [Your Name], etc.

Format each template as JSON with:
{
  "title": "Template name",
  "channel": "email|sms|linkedin|voicemail|thankyou",
  "subject": "Subject line (for email only, empty string for others)",
  "body": "The message template with [placeholders]"
}

Return a JSON array of 6 templates. Only return the JSON array, no other text.`;

    console.log('Calling OpenAI API for message templates...');

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a messaging expert who creates effective, professional templates. Always return valid JSON only."
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

    let templates;
    try {
      templates = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', cleanContent);
      throw new Error('Failed to parse message templates from AI response');
    }

    if (!Array.isArray(templates) || templates.length === 0) {
      throw new Error('Invalid message templates format from AI');
    }

    console.log(`Successfully generated ${templates.length} message templates`);

    return new Response(
      JSON.stringify({ templates }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error('Error in generate-message-templates:', error);
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