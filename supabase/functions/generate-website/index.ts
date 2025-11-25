import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const {
      businessName,
      tagline,
      brandColors,
      logoUrl,
      description,
      targetAudience,
      businessType,
    } = await req.json();

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      console.error('OPENAI_API_KEY not found in environment');
      throw new Error('OpenAI API key not configured');
    }

    console.log('OpenAI API key found, generating website...');

    const prompt = `You are an expert AI website designer named LaunchPad Site Builder.

Your job is to create modern, editable, exportable one-page websites based on business information.

Create a website for:
Business Name: ${businessName}
Tagline: ${tagline}
Brand Colors: Primary: ${brandColors.primary}, Secondary: ${brandColors.secondary}, Accent: ${brandColors.accent}
Logo URL: ${logoUrl || 'No logo provided'}
Description: ${description}
Target Audience: ${targetAudience}
Business Type: ${businessType}

Requirements:
- Use clean HTML with Tailwind CSS classes (include Tailwind CDN)
- Keep code well-formatted and production-ready
- Include inline placeholders like [Edit this text] so users can update content
- Keep it mobile-responsive
- Use semantic structure (<header>, <section>, <footer>)

Sections to include:

1. Hero Section (Cover):
   - Logo in the top left (use business name if no logo)
   - Headline that clearly explains what the business does
   - Subheadline describing the value or mission
   - CTA button (e.g., "Get Started" or "Learn More")

2. About Section:
   - Short story or mission statement about the company

3. Services / Products Section:
   - 3-4 service or product cards with icons or placeholders

4. Contact Section:
   - Simple form layout or placeholder for user contact info

5. Footer:
   - Basic copyright + brand name

Use the provided brand colors throughout the design.
Keep the tone modern, friendly, and trustworthy.
Do not use lorem ipsum - use natural, brand-appropriate placeholder text based on the business details.

Return ONLY valid HTML code with Tailwind CSS. Do not include any explanatory text, markdown formatting, or code blocks - just the raw HTML starting with <!DOCTYPE html>.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web designer. Return only valid HTML code with no explanatory text or markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate website');
    }

    const data = await response.json();
    let html = data.choices[0].message.content.trim();

    // Clean up any markdown code blocks if present
    html = html.replace(/^```html\n/, '').replace(/\n```$/, '');
    html = html.replace(/^```\n/, '').replace(/\n```$/, '');

    return new Response(
      JSON.stringify({ html }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating website:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate website' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});