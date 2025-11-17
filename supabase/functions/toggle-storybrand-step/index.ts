import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
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

    const { ideaKey, step, done, answer } = await req.json();

    if (!ideaKey || !step || typeof done !== 'boolean') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid parameters' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (done && (!answer || answer.trim() === '')) {
      return new Response(
        JSON.stringify({ error: 'Answer is required to complete a step' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: roadmap, error: fetchError } = await supabase
      .from('storybrand_roadmap')
      .select('*')
      .eq('user_id', user.id)
      .eq('idea_key', ideaKey)
      .maybeSingle();

    if (fetchError) throw fetchError;

    if (!roadmap) {
      return new Response(
        JSON.stringify({ error: 'Roadmap not found' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let completed = roadmap.completed || [];
    let stepAnswers = roadmap.step_answers || {};

    if (done) {
      if (!completed.includes(step)) {
        completed = [...completed, step];
      }
      stepAnswers[step] = answer;
    } else {
      completed = completed.filter((item: string) => item !== step);
      delete stepAnswers[step];
    }

    const { data: updatedRoadmap, error: updateError } = await supabase
      .from('storybrand_roadmap')
      .update({
        completed,
        step_answers: stepAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq('id', roadmap.id)
      .select()
      .single();

    if (updateError) throw updateError;

    return new Response(
      JSON.stringify({
        completed: updatedRoadmap.completed,
        step_answers: updatedRoadmap.step_answers
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err: any) {
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