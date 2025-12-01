import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const NANOBANANA_API_KEY = Deno.env.get('NANOBANANA_API_KEY');
const NANOBANANA_API_URL = 'https://api.nanobanana.ai/v1/generate';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, type } = await req.json();

    if (!prompt || !type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: prompt and type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!NANOBANANA_API_KEY) {
      console.error('NANOBANANA_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'NanoBanana API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Calling NanoBanana API with:', { prompt, type });

    const response = await fetch(NANOBANANA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NANOBANANA_API_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        type,
        width: 1024,
        height: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('NanoBanana API error:', errorText);
      return new Response(
        JSON.stringify({ error: `NanoBanana API error: ${response.status} ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    console.log('NanoBanana API success');

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in generateNanoBanana function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});