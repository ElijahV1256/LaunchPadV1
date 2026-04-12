import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function callOpenAI(apiKey: string, systemPrompt: string, userPrompt: string, maxTokens = 300) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
      temperature: 0.7,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error.substring(0, 200)}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
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
      return jsonResponse({ error: 'AI service not configured' }, 503);
    }

    const body = await req.json();
    const { action, businessName, businessDescription, offer, price, customerName, credibilityType, credibilityStatement } = body;

    if (!action) {
      return jsonResponse({ error: 'Missing action parameter' }, 400);
    }

    const bizContext = `Business: ${businessName || 'New business'}\nDescription: ${businessDescription || 'A new venture'}`;

    switch (action) {
      case 'pricing': {
        const result = await callOpenAI(
          openaiApiKey,
          'You are a direct, no-fluff business pricing expert. Return ONLY valid JSON, no markdown, no explanation.',
          `${bizContext}\nOffer: ${offer || businessName}\n\nReturn exactly this JSON format with 3 pricing options. The recommended one should be the middle option:\n{"options":[{"label":"Starter","price":"$XX","description":"one sentence"},{"label":"Recommended","price":"$XX","description":"one sentence","recommended":true},{"label":"Premium","price":"$XX","description":"one sentence"}],"offerSentence":"I help [specific audience] [achieve specific result] for [price]"}`,
          400
        );
        try {
          const parsed = JSON.parse(result);
          return jsonResponse(parsed);
        } catch {
          const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            const parsed = JSON.parse(cleaned);
            return jsonResponse(parsed);
          } catch {
            return jsonResponse({
              options: [
                { label: 'Starter', price: '$47', description: 'Basic package to get started' },
                { label: 'Recommended', price: '$97', description: 'Full service with best value', recommended: true },
                { label: 'Premium', price: '$197', description: 'Premium experience with extras' },
              ],
              offerSentence: `I help people with ${offer || businessName} to get results fast.`
            });
          }
        }
      }

      case 'customers': {
        const result = await callOpenAI(
          openaiApiKey,
          'You are a direct, no-fluff business coach. Return ONLY valid JSON, no markdown.',
          `${bizContext}\nOffer: ${offer}\nPrice: ${price}\n\nGenerate 5 specific types of people from the user's likely network who would need this RIGHT NOW. Make them feel real and personal — like someone they actually know. Return JSON:\n{"suggestions":["description 1","description 2","description 3","description 4","description 5"]}`,
          300
        );
        try {
          const parsed = JSON.parse(result);
          return jsonResponse(parsed);
        } catch {
          const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            return jsonResponse(JSON.parse(cleaned));
          } catch {
            return jsonResponse({
              suggestions: [
                'Your friend who just started a new project',
                'That coworker who mentioned needing help',
                'A family member with a side business',
                'Someone from your social media who posted about this problem',
                'A neighbor or local business owner you know'
              ]
            });
          }
        }
      }

      case 'credibility': {
        const typeDescriptions: Record<string, string> = {
          'free-testimonial': 'doing it free or discounted in exchange for a testimonial',
          'guarantee': 'offering a money-back guarantee if they are not satisfied',
          'experience': 'referencing past experience or related skills',
        };
        const typeDesc = typeDescriptions[credibilityType] || credibilityType;
        const result = await callOpenAI(
          openaiApiKey,
          'You write short, confident credibility statements for new entrepreneurs. 2 sentences max. Direct and persuasive.',
          `${bizContext}\nOffer: ${offer}\nPrice: ${price}\nApproach: ${typeDesc}\n\nWrite a 2-sentence credibility statement this person can use when pitching. Make it sound natural, confident, not salesy.`,
          100
        );
        return jsonResponse({ statement: result });
      }

      case 'pitch': {
        const result = await callOpenAI(
          openaiApiKey,
          'You write natural, conversational sales pitches. Each sentence should be on its own. 5 sentences max. Sound like a friend texting, not a salesperson.',
          `${bizContext}\nOffer: ${offer}\nPrice: ${price}\nCustomer name: ${customerName}\nCredibility: ${credibilityStatement}\n\nWrite a 5-sentence personalized pitch to send to ${customerName}. Make it feel like a casual text message. Include the offer, price, and credibility naturally. Number each sentence 1-5.`,
          200
        );
        return jsonResponse({ pitch: result });
      }

      case 'followup': {
        const result = await callOpenAI(
          openaiApiKey,
          'You write short, encouraging follow-up messages. Sound friendly and persistent but not pushy.',
          `${bizContext}\nOffer: ${offer}\nCustomer name: ${customerName}\n\nWrite a short follow-up message (2-3 sentences) to send to ${customerName} who hasn't responded yet. Keep it casual and friendly.`,
          100
        );
        return jsonResponse({ message: result });
      }

      case 'reframe': {
        const result = await callOpenAI(
          openaiApiKey,
          'You are a motivational business coach. Be direct, encouraging, and practical. Return ONLY valid JSON.',
          `${bizContext}\nOffer: ${offer}\nPrice: ${price}\n\nThe user got a "no" from their first pitch. Give them:\n1. A short reframe message (2 sentences) about why "no" is normal\n2. A suggestion for who to contact next from their network\n\nReturn JSON: {"reframe":"...","nextPerson":"..."}`,
          150
        );
        try {
          return jsonResponse(JSON.parse(result));
        } catch {
          const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            return jsonResponse(JSON.parse(cleaned));
          } catch {
            return jsonResponse({
              reframe: "Every successful entrepreneur heard 'no' before they heard 'yes.' This is part of the process, not the end of it.",
              nextPerson: "Think of someone else who mentioned a problem your offer solves — a different friend, colleague, or local business owner."
            });
          }
        }
      }

      case 'celebrate': {
        const result = await callOpenAI(
          openaiApiKey,
          'You help entrepreneurs celebrate wins and plan next steps. Be energetic but authentic. Return ONLY valid JSON.',
          `${bizContext}\nOffer: ${offer}\nPrice: ${price}\nRevenue: $${body.revenue || price}\nCustomer: ${customerName}\n\nGenerate:\n1. A 1-paragraph origin story they can post on social media about making their first sale (authentic, inspiring, not braggy)\n2. A follow-up message to send the customer asking for a testimonial (casual, grateful)\n3. Their next suggested action to get customer #2 (specific and actionable)\n\nReturn JSON: {"originStory":"...","followupMessage":"...","nextAction":"..."}`,
          400
        );
        try {
          return jsonResponse(JSON.parse(result));
        } catch {
          const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          try {
            return jsonResponse(JSON.parse(cleaned));
          } catch {
            return jsonResponse({
              originStory: `I just made my first sale! I offered ${offer} and someone actually said yes. This is just the beginning.`,
              followupMessage: `Hey ${customerName}! Thanks so much for being my first customer. Would you mind sharing a quick sentence about your experience? It would mean the world to me!`,
              nextAction: 'Reach out to 3 more people today using the same pitch. Momentum is everything right now.'
            });
          }
        }
      }

      default:
        return jsonResponse({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    console.error('Error in first-dollar-ai:', err);
    return jsonResponse({ error: message }, 500);
  }
});
