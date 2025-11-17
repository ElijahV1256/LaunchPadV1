import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const defaultSteps = [
  {"id":"define-offer","label":"Define your mini-offer"},
  {"id":"pick-person","label":"Pick one person"},
  {"id":"make-proof","label":"Create something tiny"},
  {"id":"reach-out","label":"Send your invite"},
  {"id":"deliver","label":"Deliver & reflect"}
];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const authHeader = req.headers.get('Authorization')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { ideaKey, ideaName } = await req.json();

    if (!ideaKey) {
      return new Response(
        JSON.stringify({ error: 'ideaKey is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existing, error: fetchError } = await supabase
      .from('first_dollar')
      .select('*')
      .eq('user_id', user.id)
      .eq('idea_key', ideaKey)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (existing) {
      return new Response(
        JSON.stringify(existing),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: newRow, error: insertError } = await supabase
      .from('first_dollar')
      .insert({
        user_id: user.id,
        idea_key: ideaKey,
        steps: defaultSteps,
        completed: [],
      })
      .select()
      .single();

    if (insertError) {
      if (insertError.code === '23505') {
        const { data: existingRetry } = await supabase
          .from('first_dollar')
          .select('*')
          .eq('user_id', user.id)
          .eq('idea_key', ideaKey)
          .maybeSingle();

        if (existingRetry) {
          return new Response(
            JSON.stringify(existingRetry),
            {
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            }
          );
        }
      }
      throw insertError;
    }

    return new Response(
      JSON.stringify(newRow),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    console.error('Error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
