import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
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

    const { ideaKey, stepId, done } = await req.json();

    if (!ideaKey || !stepId || done === undefined) {
      return new Response(
        JSON.stringify({ error: 'ideaKey, stepId, and done are required' }),
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

    if (!existing) {
      return new Response(
        JSON.stringify({ error: 'First dollar row not found. Call /init first.' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let newCompleted = [...existing.completed];
    
    if (done && !newCompleted.includes(stepId)) {
      newCompleted.push(stepId);
    } else if (!done && newCompleted.includes(stepId)) {
      newCompleted = newCompleted.filter((id: string) => id !== stepId);
    }

    const { data: updated, error: updateError } = await supabase
      .from('first_dollar')
      .update({ completed: newCompleted })
      .eq('user_id', user.id)
      .eq('idea_key', ideaKey)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    const steps = existing.steps || [];
    const progressPct = steps.length > 0 ? Math.round((newCompleted.length / steps.length) * 100) : 0;

    return new Response(
      JSON.stringify({ completed: newCompleted, progressPct }),
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