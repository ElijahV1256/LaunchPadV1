import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const defaultRoadmap = {
  title: '3 Stages to Start Your Business',
  subtitle: 'A clear plan to turn your idea into a story people love.',
  stages: [
    {
      name: 'Clarify Your Message',
      goal: 'Define what you do, who you help, and why it matters.',
      steps: [
        "Write your one-liner: 'We help ___ do ___ so they can ___'.",
        "Identify the customer's main problem.",
        "State the transformation: how life improves after they work with you.",
      ],
    },
    {
      name: 'Invite People Into the Story',
      goal: 'Communicate clearly and ask people to engage.',
      steps: [
        'Build a simple landing page or flyer with your one-liner.',
        'Share it on social or message 3 people directly.',
        'Offer a clear next step: call, demo, or purchase.',
      ],
    },
    {
      name: 'Deliver Transformation',
      goal: 'Serve customers well and tell the success story.',
      steps: [
        'Deliver your offer and collect feedback.',
        'Capture 1–2 testimonials or before/after stories.',
        'Post a success story and refine your process.',
      ],
    },
  ],
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

    const url = new URL(req.url);
    const ideaKey = url.searchParams.get('ideaKey');

    if (!ideaKey) {
      return new Response(
        JSON.stringify({ error: 'Missing ideaKey parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: existingRoadmap } = await supabase
      .from('storybrand_roadmap')
      .select('*')
      .eq('user_id', user.id)
      .eq('idea_key', ideaKey)
      .maybeSingle();

    if (existingRoadmap) {
      return new Response(JSON.stringify(existingRoadmap), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: newRoadmap, error: insertError } = await supabase
      .from('storybrand_roadmap')
      .insert({
        user_id: user.id,
        idea_key: ideaKey,
        title: defaultRoadmap.title,
        subtitle: defaultRoadmap.subtitle,
        stages: defaultRoadmap.stages,
        completed: [],
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(JSON.stringify(newRoadmap), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
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
