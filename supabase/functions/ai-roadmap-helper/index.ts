import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { step, businessName, businessDescription, currentAnswer, openaiApiKey: providedApiKey } = await req.json();

    if (!step) {
      return new Response(
        JSON.stringify({ error: 'Missing step parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const openaiApiKey = providedApiKey || Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({
          error: 'AI assistance is not configured. The OPENAI_API_KEY environment variable needs to be set in Supabase.',
          suggestion: 'Please check your Supabase project settings to add the OPENAI_API_KEY secret.'
        }),
        {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const brandName = businessName || 'their business';

    const prompt = `Business name: "${brandName}"
Description: ${businessDescription || 'A new business venture'}

The user is working on this step for their business: "${step}"

Provide a direct, specific, actionable answer. Use the business name "${brandName}" when referencing the business — for example in testimonials, before/after stories, or marketing copy.

CRITICAL RULES:
- NEVER use the words "StoryBrand", "StoryBrand framework", "StoryBrand Marketing", or any reference to StoryBrand. This is someone else's brand.
- ALWAYS use "${brandName}" when referring to the user's business.
- Do NOT give coaching advice or ask questions. Just provide the answer directly.
- If the step involves testimonials, write them using "${brandName}" as the business being reviewed.
- If the step involves before/after stories, frame them around a customer's experience with "${brandName}".
- Keep suggestions specific, concrete, and ready to use.

Examples of what NOT to do:
- "After implementing the StoryBrand framework..." (WRONG)
- "Before working with StoryBrand Marketing..." (WRONG)

Examples of what TO do:
- "After working with ${brandName}, our sales increased by 30%..." (CORRECT)
- "Before I found ${brandName}, I was struggling to..." (CORRECT)

Answer:`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You provide direct, specific answers to business questions. Never give coaching advice or suggestions. Always answer with concrete, actionable specifics that directly answer the question asked. NEVER reference "StoryBrand" or "StoryBrand framework" — always use the actual business name provided. When writing testimonials or success stories, use the business name, not any framework name.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to get AI assistance',
          details: error.substring(0, 200)
        }),
        {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await openaiResponse.json();
    const suggestion = data.choices[0].message.content.trim();

    return new Response(
      JSON.stringify({ suggestion }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
    console.error('Error in ai-roadmap-helper:', err);
    return new Response(
      JSON.stringify({
        error: err.message || 'Internal server error',
        type: err.name || 'Unknown'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});