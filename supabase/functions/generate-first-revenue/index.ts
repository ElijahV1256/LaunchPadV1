import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

const defaultPlan = {
  title: 'Your Step-by-Step Plan to First Revenue',
  subtitle: "Let's turn your idea into your first $1.",
  stages: [
    {
      name: 'Clarify & Prepare',
      goal: 'Define your offer and who needs it.',
      steps: [
        'Write your offer in one sentence: "I help [who] do [what] so they can [benefit]"',
        'Identify 3 people who have this problem right now',
        'Set your first price (even if it\'s just $1)',
        'Decide how they\'ll pay you (Venmo, PayPal, cash, etc.)',
      ],
    },
    {
      name: 'Launch & Connect',
      goal: 'Invite people into your story and test your offer.',
      steps: [
        'Create something simple to share: a text, post, or one-page flyer',
        'Reach out to your 3 people with your offer',
        'Ask: "Would you be interested in trying this?"',
      ],
    },
    {
      name: 'Deliver & Celebrate',
      goal: 'Fulfill your promise, gather feedback, celebrate your win.',
      steps: [
        'Deliver your service or product to your first customer',
        'Collect payment (your first revenue!)',
        'Ask for feedback: "What did you love? What could be better?"',
        'Celebrate! You just made your first $1 🎉',
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

    const { data: businessIdea } = await supabase
      .from('business_ideas')
      .select('name, description')
      .eq('user_id', user.id)
      .eq('idea_id', ideaKey)
      .maybeSingle();

    const { data: existingPlan } = await supabase
      .from('first_revenue')
      .select('*')
      .eq('user_id', user.id)
      .eq('idea_key', ideaKey)
      .maybeSingle();

    if (existingPlan) {
      const enrichedPlan = {
        ...existingPlan,
        businessName: businessIdea?.name || '',
        businessDescription: businessIdea?.description || '',
      };
      return new Response(JSON.stringify(enrichedPlan), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: newPlan, error: insertError } = await supabase
      .from('first_revenue')
      .insert({
        user_id: user.id,
        idea_key: ideaKey,
        title: defaultPlan.title,
        subtitle: defaultPlan.subtitle,
        stages: defaultPlan.stages,
        completed: [],
        step_answers: {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    const enrichedPlan = {
      ...newPlan,
      businessName: businessIdea?.name || '',
      businessDescription: businessIdea?.description || '',
    };

    return new Response(JSON.stringify(enrichedPlan), {
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
