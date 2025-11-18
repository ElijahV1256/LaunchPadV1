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
      openaiApiKey,
      logoUrl
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
    const contactText = contactInfo || `${businessName}\nwww.yourbusiness.com\n(555) 123-4567`;

    const flyerTypes = [
      {
        title: "EDDM Postcard",
        purpose: "Direct mail campaign to local residents",
        size: "6x11 inches",
        imageSize: "1792x1024" as const,
        callToAction: "Call Today for Your Free Quote"
      },
      {
        title: "Social Media Post",
        purpose: "Instagram/Facebook post to drive engagement",
        size: "1080x1080px square",
        imageSize: "1024x1024" as const,
        callToAction: "Book Now - Limited Spots Available"
      },
      {
        title: "Service Flyer",
        purpose: "Print flyer for community boards and handouts",
        size: "8.5x11 inches",
        imageSize: "1024x1792" as const,
        callToAction: "Get Started Today"
      }
    ];

    const flyers = [];

    for (let i = 0; i < flyerTypes.length; i++) {
      const flyerType = flyerTypes[i];

      try {
        // Step 1: Text Cleanup & Brand Enforcement with GPT-4
        const contentPrompt = `You are a professional brand copywriter with expertise in grammar and spelling.

BRAND GUIDE:
- Business Name: ${businessName}
- Tagline: ${tagline || "Quality Service You Can Trust"}
- Brand Voice: ${voiceText}
- Target Audience: ${audienceText}
- Business Description: ${descriptionText}

TASK:
Create flyer content for: ${flyerType.purpose}

CRITICAL REQUIREMENTS:
1. PERFECT GRAMMAR - No errors whatsoever
2. PERFECT SPELLING - Double-check every word
3. Brand Voice: ${voiceText}
4. Short, clear, professional sentences
5. Brand-appropriate vocabulary only
6. Professional formatting
7. Proofread everything before responding

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "headline": "Powerful 5-8 word headline (perfect grammar)",
  "subheadline": "Supporting 8-12 word subheadline (perfect grammar)",
  "body": "2-3 clear sentences explaining value (perfect grammar, 30-50 words)",
  "features": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
  "cta": "${flyerType.callToAction}",
  "footer": "${contactText}"
}

IMPORTANT: Proofread all text for spelling and grammar errors before returning. Return ONLY valid JSON with perfect grammar and spelling.`;

        console.log(`Step 1: Cleaning text with brand voice for ${flyerType.title}...`);

        const contentResponse = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [{ role: "user", content: contentPrompt }],
          temperature: 0.3,
          max_tokens: 600,
        });

        const content = contentResponse.choices[0].message.content?.trim() || '{}';

        let templateData;
        try {
          const jsonContent = content.replace(/```json\n?|\n?```/g, '').trim();
          templateData = JSON.parse(jsonContent);
        } catch (e) {
          console.error('Failed to parse template JSON:', e);
          templateData = {
            headline: "Experience Quality Service",
            subheadline: `Trust ${businessName} for all your needs`,
            body: `We provide exceptional service with a focus on quality and customer satisfaction. Our team is dedicated to exceeding your expectations.`,
            features: [
              "Professional Service",
              "Competitive Pricing",
              "Customer Focused",
              "Quality Guaranteed"
            ],
            cta: flyerType.callToAction,
            footer: contactText,
          };
        }

        console.log(`Step 2: Generating flyer image with branded text for ${flyerType.title}...`);

        // Step 2: Flyer Image Generation with DALL-E 3 (using cleaned, branded text)
        const primaryColor = brandColors?.primary || '#2979FF';
        const secondaryColor = brandColors?.secondary || '#06D6A0';
        const accentColor = brandColors?.accent || '#FF6B6B';

        const imagePrompt = `Create a professional marketing flyer with EXACT text and colors specified below.

SIZE: ${flyerType.size}

MANDATORY COLOR PALETTE - USE THESE EXACT COLORS ONLY:
• Headline color: ${primaryColor}
• Button/CTA background: ${accentColor}
• Bullet point icons: ${secondaryColor}
• Background: White (#FFFFFF)
• Body text: Dark gray (#333333)

EXACT TEXT CONTENT (USE WORD-FOR-WORD):

[HEADLINE - Large, bold, ${primaryColor} color]
${templateData.headline}

[SUBHEADLINE - Medium weight, #333333 color]
${templateData.subheadline}

[BODY TEXT - Regular weight, #333333 color]
${templateData.body}

[FEATURES LIST - Bullet points with ${secondaryColor} icons]
${templateData.features?.map((f: string) => `• ${f}`).join('\n') || '• Professional Service\n• Quality Guaranteed\n• Customer Focused'}

[CALL TO ACTION - Large button with ${accentColor} background, white text]
${templateData.cta}

[FOOTER - Small text, #666666 color]
${templateData.footer.replace(/\n/g, ' | ')}

DESIGN REQUIREMENTS:
✓ Clean white background
✓ Use ONLY the hex colors specified above
✓ Large readable headline in ${primaryColor}
✓ CTA button in ${accentColor} with white text
✓ Bullet icons in ${secondaryColor}
✓ Generous margins and spacing
✓ Modern sans-serif font
✓ Professional, minimal design

✗ NO additional colors beyond those specified
✗ NO gradients or color variations
✗ NO decorative elements
✗ NO photos or illustrations
✗ NO patterns or textures

CRITICAL: Use the EXACT hex color codes provided. Do not interpret or modify them.`;

        console.log(`Generating image for ${flyerType.title}...`);

        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: imagePrompt,
          n: 1,
          size: flyerType.imageSize,
          quality: "standard",
        });

        const imageUrl = imageResponse.data[0]?.url;
        if (!imageUrl) {
          throw new Error('No image URL returned from DALL·E');
        }

        flyers.push({
          title: flyerType.title,
          description: `${flyerType.purpose} (${flyerType.size})`,
          template: templateData,
          imageUrl: imageUrl,
          size: flyerType.size,
          purpose: flyerType.purpose,
          canvaUrl: "https://www.canva.com/create/flyers/",
        });

        console.log(`Successfully generated ${flyerType.title}`);

        // Rate limiting delay between DALL·E calls
        if (i < flyerTypes.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }

      } catch (error: any) {
        console.error(`Error generating ${flyerType.title}:`, error);

        // Add fallback template without image
        flyers.push({
          title: flyerType.title,
          description: `Template for ${flyerType.title.toLowerCase()} (${flyerType.size})`,
          template: {
            headline: "Experience Quality Service",
            subheadline: `Trust ${businessName} for all your needs`,
            body: `We provide exceptional service with a focus on quality and customer satisfaction. Our team is dedicated to exceeding your expectations.`,
            features: [
              "Professional Service",
              "Competitive Pricing",
              "Customer Focused",
              "Quality Guaranteed"
            ],
            cta: flyerType.callToAction,
            footer: contactText,
          },
          size: flyerType.size,
          purpose: flyerType.purpose,
          canvaUrl: "https://www.canva.com/create/flyers/",
          error: error.message
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