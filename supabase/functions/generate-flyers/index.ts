import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.20.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const body = await req.json();
    const {
      businessName,
      brandColors,
      businessDescription,
      targetAudience,
      brandVoice,
      tagline,
      contactInfo,
      openaiApiKey
    } = body;

    console.log('Received request:', { businessName, brandColors });

    const openaiKey = openaiApiKey || Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      console.error('OPENAI_API_KEY not found in environment or request');
      throw new Error('OpenAI API key not configured');
    }

    const openai = new OpenAI({
      apiKey: openaiKey,
    });

    const descriptionText = businessDescription || businessName;
    const voiceText = brandVoice || "professional, approachable, and trustworthy";
    const audienceText = targetAudience || "general customers";

    const flyerTypes = [
      {
        title: "EDDM Postcard",
        purpose: "Direct mail campaign to local residents",
        size: "6x11 inches",
        callToAction: "Call Today for Your Free Quote"
      },
      {
        title: "Social Media Post",
        purpose: "Instagram/Facebook post to drive engagement",
        size: "1080x1080px square",
        callToAction: "Book Now - Limited Spots Available"
      },
      {
        title: "Service Flyer",
        purpose: "Print flyer for community boards and handouts",
        size: "8.5x11 inches",
        callToAction: "Get Started Today"
      }
    ];

    const flyers = [];

    for (let i = 0; i < flyerTypes.length; i++) {
      const flyerType = flyerTypes[i];

      const prompt = `You are a professional brand designer and copywriter.
Using the brand information provided, create a clean, modern flyer template for "${businessName}".

BRAND INFORMATION:
Business: ${businessName}
Tagline: ${tagline || "Quality Service You Can Trust"}
Description: ${descriptionText}
Target Audience: ${audienceText}
Brand Voice: ${voiceText}
Primary Color: ${brandColors.primary}
Secondary Color: ${brandColors.secondary || brandColors.primary}
Accent Color: ${brandColors.accent || brandColors.primary}

TEMPLATE TYPE: ${flyerType.title} (${flyerType.purpose})
SIZE: ${flyerType.size}

Create a complete ${flyerType.title} template following these STRICT REQUIREMENTS:

1. HEADLINE
- Short, bold, benefit-driven (5-8 words max)
- Uses brand header font
- Follows brand voice: ${voiceText}

2. SUB-HEADLINE
- One sentence that supports the headline
- Clean and easy to understand

3. MAIN BODY CONTENT
- 2-5 lines describing the offer, service, or message
- Perfect grammar
- Uses the brand's tone: ${voiceText}
- No long paragraphs — keep spacing clean

4. FEATURES / BENEFITS SECTION
- 3-5 bullet points
- Clear and concise
- Directly tied to the business

5. CALL TO ACTION
- Simple and action-oriented: "${flyerType.callToAction}"
- Follows brand color rules

6. FOOTER / CONTACT INFO
- Business name: ${businessName}
${contactInfo ? `- Contact: ${contactInfo}` : "- Website: www.yourbusiness.com\n- Phone: (555) 123-4567"}
- Formatted cleanly and consistently

DESIGN RULES TO FOLLOW:
✓ Use brand color palette only (Primary: ${brandColors.primary}, Secondary: ${brandColors.secondary || brandColors.primary}, Accent: ${brandColors.accent || brandColors.primary})
✓ Use brand fonts only (Header: Bold Sans-Serif, Body: Clean Sans-Serif)
✓ Simple shapes: rectangles, clean lines, soft corners
✓ Plenty of spacing and margins
✓ Keep everything symmetrical and aligned
✓ No clutter, no busy backgrounds
✓ Use minimal icons consistent with brand

✗ NEVER add extra colors outside brand guide
✗ NEVER use overly creative or messy designs
✗ NEVER repeat sentences or add unnecessary filler

OUTPUT FORMAT - Provide as structured JSON:
{
  "headline": "Your headline here",
  "subheadline": "Your subheadline here",
  "bodyContent": "2-5 lines of body text here",
  "features": ["Feature 1", "Feature 2", "Feature 3"],
  "cta": "Call to action text",
  "footer": "Contact information formatted",
  "layoutNotes": "Brief description of layout structure and spacing",
  "colorNotes": "Which colors to use where (Primary for X, Secondary for Y, etc.)",
  "fontNotes": "Which fonts to use where (Header font for X, Body font for Y)"
}

Return ONLY valid JSON, no markdown formatting.`;

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        });

        const content = response.choices[0].message.content?.trim() || '{}';

        let templateData;
        try {
          // Remove markdown code blocks if present
          const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
          templateData = JSON.parse(jsonContent);
        } catch (e) {
          console.error('Failed to parse template JSON:', e);
          templateData = {
            headline: "Experience Quality Service",
            subheadline: `Trust ${businessName} for all your needs`,
            bodyContent: `We provide exceptional ${descriptionText} with a focus on quality and customer satisfaction.`,
            features: [
              "Professional Service",
              "Competitive Pricing",
              "Customer Focused"
            ],
            cta: flyerType.callToAction,
            footer: `${businessName}\nwww.yourbusiness.com\n(555) 123-4567`,
            layoutNotes: "Center-aligned with clear hierarchy",
            colorNotes: "Primary color for headline and CTA",
            fontNotes: "Bold header font for headline, clean body font for content"
          };
        }

        flyers.push({
          title: flyerType.title,
          description: `A professionally designed ${flyerType.title.toLowerCase()} template (${flyerType.size}) following your brand guidelines.`,
          template: templateData,
          size: flyerType.size,
          purpose: flyerType.purpose,
          canvaUrl: "https://www.canva.com/create/flyers/",
        });

        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error: any) {
        console.error(`Error generating template ${i + 1}:`, error);
        flyers.push({
          title: flyerType.title,
          description: `Template for ${flyerType.title.toLowerCase()} (${flyerType.size})`,
          template: {
            headline: "Experience Quality Service",
            subheadline: `Trust ${businessName} for all your needs`,
            bodyContent: `We provide exceptional service with a focus on quality and customer satisfaction.`,
            features: [
              "Professional Service",
              "Competitive Pricing",
              "Customer Focused"
            ],
            cta: flyerType.callToAction,
            footer: `${businessName}\nwww.yourbusiness.com\n(555) 123-4567`,
            layoutNotes: "Center-aligned with clear hierarchy",
            colorNotes: "Primary color for headline and CTA",
            fontNotes: "Bold header font for headline, clean body font for content"
          },
          size: flyerType.size,
          purpose: flyerType.purpose,
          canvaUrl: "https://www.canva.com/create/flyers/",
        });
      }
    }

    console.log('Successfully generated', flyers.length, 'flyer templates');

    return new Response(
      JSON.stringify({ flyers }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in generate-flyers:", error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error',
        details: error.stack
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
