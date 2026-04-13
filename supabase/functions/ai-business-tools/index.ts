import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string, temperature = 0.7) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error (${res.status}): ${err.substring(0, 200)}`);
  }

  const data = await res.json();
  const content = data.choices[0].message.content || '';
  return content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return jsonResponse({ error: 'Missing authorization header' }, 401);
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return jsonResponse({
        error: 'OPENAI_API_KEY not configured in Supabase secrets.',
      }, 503);
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'generateRoadmap') {
      const { idea } = body;
      if (!idea) return jsonResponse({ error: 'Missing idea parameter' }, 400);

      const prompt = `Create a detailed 5-stage startup roadmap for the following business idea:

Business Name: ${idea.name}
Description: ${idea.description}
Difficulty: ${idea.difficulty}/5
Cost Range: ${idea.costRange}

For each of the 5 stages, provide:
1. A clear stage title (e.g., "Stage 1: Validation", "Stage 2: Setup")
2. 3-5 specific, actionable steps

Format your response as a JSON array with objects containing: stage, steps (array of strings)

Make the roadmap practical and sequential, taking someone from idea to launch.`;

      const raw = await callOpenAI(
        openaiApiKey,
        'You are a business consultant creating actionable startup roadmaps. Always respond with valid JSON only.',
        prompt,
        0.7
      );

      const stages = JSON.parse(raw);
      return jsonResponse({ stages });
    }

    if (action === 'generateStepPathway') {
      const { businessName, businessDescription, stageTitle, stepDescription } = body;

      const prompt = `For a business called "${businessName}" (${businessDescription}), the entrepreneur is working on:

Stage: ${stageTitle}
Step: ${stepDescription}

Generate 4-6 specific, practical pathways or resources to help them complete this step. Each pathway should be:
- Actionable and specific
- Include concrete resources, tools, or tactics
- Be achievable for a solo entrepreneur or small team

Format your response as a JSON array of strings. Each string should be one complete pathway or approach.`;

      const raw = await callOpenAI(
        openaiApiKey,
        'You are a business mentor providing specific, actionable guidance. Always respond with valid JSON only.',
        prompt,
        0.8
      );

      const pathways = JSON.parse(raw);
      return jsonResponse({ pathways });
    }

    if (action === 'generateBusinessPlan') {
      const { businessName, businessDescription, stepAnswers } = body;

      const answersText = Object.entries(stepAnswers || {})
        .map(([step, answer]) => `${step}: ${answer}`)
        .join('\n');

      const prompt = `Based on the following business idea and the entrepreneur's answers to their roadmap steps, create a comprehensive business plan using Donald Miller's StoryBrand framework:

Business: ${businessName}
Description: ${businessDescription}

Entrepreneur's Roadmap Answers:
${answersText}

Generate a complete business plan with the following sections based on the StoryBrand framework:

1. Plan Name: A compelling, professional name for this business plan
2. Character (The Customer): Who is your ideal customer? What do they want?
3. Problem: What external, internal, and philosophical problems does your customer face?
4. Guide (Your Business): How does your business position itself as the guide? What empathy and authority do you bring?
5. Plan: What is your clear process or agreement that makes it easy for customers to do business with you?
6. Call to Action: What direct and transitional calls to action will you use?
7. Success: What does success look like for your customer? How will their life improve?
8. Failure: What's at stake if they don't use your solution?
9. Transformation: What is the identity transformation your customer will experience?

Format your response as a JSON object with keys: planName, character, problem, guide, plan, callToAction, success, failure, transformation

Make each section detailed, specific, and actionable based on the provided information.`;

      const raw = await callOpenAI(
        openaiApiKey,
        'You are a business strategist and StoryBrand certified guide helping entrepreneurs create compelling business plans. Always respond with valid JSON only.',
        prompt,
        0.7
      );

      const planData = JSON.parse(raw);
      return jsonResponse({ planData });
    }

    return jsonResponse({ error: `Unknown action: ${action}` }, 400);
  } catch (err: any) {
    console.error('Error in ai-business-tools:', err);
    return jsonResponse({ error: err.message || 'Internal server error' }, 500);
  }
});
