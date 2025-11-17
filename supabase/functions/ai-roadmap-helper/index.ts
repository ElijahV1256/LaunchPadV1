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

    const prompt = `Business: ${businessName || 'Their business'}
Description: ${businessDescription || 'A new business venture'}

Question: "${step}"

Provide a direct, specific answer to fill in the blank. Do NOT give coaching advice or ask questions. Just answer directly with what they should offer, who they should target, what price to charge, etc.

Examples:
- If asked "What should I offer?": Answer with a specific service like "Website design for small businesses" or "1-hour photography sessions"
- If asked about pricing: Answer with a specific price like "$75" or "$50-$100"
- If asked about customers: Answer with a specific person like "Local coffee shop owners" or "Busy parents in your neighborhood"

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
            content: 'You provide direct, specific answers to business questions. Never give coaching advice or suggestions. Always answer with concrete, actionable specifics that directly answer the question asked.',
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