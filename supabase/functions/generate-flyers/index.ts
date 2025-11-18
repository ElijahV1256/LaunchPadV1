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
        // Step 1: Generate clean text content with GPT-4
        const contentPrompt = `You are a professional brand copywriter.
Create clean, compelling flyer content for "${businessName}".

BRAND INFORMATION:
- Business: ${businessName}
- Tagline: ${tagline || "Quality Service You Can Trust"}
- Description: ${descriptionText}
- Target Audience: ${audienceText}
- Brand Voice: ${voiceText}
- Flyer Purpose: ${flyerType.purpose}
- Call to Action: ${flyerType.callToAction}

CONTENT REQUIREMENTS:
- Headline: Powerful, attention-grabbing (5-8 words max)
- Subheadline: Supporting text that reinforces the headline (8-12 words)
- Body Content: Brief description of value proposition (2-3 sentences, 30-50 words)
- Features: 3-4 key benefits or services (each 2-5 words)
- CTA: Use the provided call to action
- Footer: Contact info (use: ${contactText})

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "headline": "Your headline here",
  "subheadline": "Your subheadline here",
  "bodyContent": "2-3 sentences of body text",
  "features": ["Feature 1", "Feature 2", "Feature 3", "Feature 4"],
  "cta": "${flyerType.callToAction}",
  "footer": "${contactText}"
}

Return ONLY valid JSON, no markdown formatting.`;

        console.log(`Generating content for ${flyerType.title}...`);

        const contentResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: contentPrompt }],
          temperature: 0.7,
          max_tokens: 800,
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
            bodyContent: `We provide exceptional service with a focus on quality and customer satisfaction. Our team is dedicated to exceeding your expectations.`,
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

        // Step 2: Generate actual flyer image with DALL·E 3
        const primaryColor = brandColors?.primary || '#2979FF';
        const secondaryColor = brandColors?.secondary || '#06D6A0';
        const accentColor = brandColors?.accent || '#FF6B6B';

        const imagePrompt = `Create a professional, modern flyer design.

DESIGN SPECIFICATIONS:
- Format: ${flyerType.size}
- Style: Clean, minimal, modern, and professional
- Layout: Structured grid with plenty of white space

COLOR PALETTE (USE ONLY THESE EXACT COLORS):
- Primary: ${primaryColor}
- Secondary: ${secondaryColor}
- Accent: ${accentColor}
- Use white or light gray for backgrounds
- Use black or dark gray for body text

CONTENT LAYOUT (TOP TO BOTTOM):
1. HEADER: Large bold headline in primary color: "${templateData.headline}"
2. SUBHEADER: Medium text in dark gray: "${templateData.subheadline}"
3. BODY: Clean paragraphs with good spacing: "${templateData.bodyContent}"
4. FEATURES: Display as bullet points with accent color icons:
${templateData.features?.map((f: string) => `   • ${f}`).join('\n') || '   • Professional Service\n   • Quality Guaranteed\n   • Customer Focused'}
5. CTA BUTTON: Large button in accent color with white text: "${templateData.cta}"
6. FOOTER: Small text at bottom: "${templateData.footer.replace(/\n/g, ' | ')}"

DESIGN RULES (CRITICAL):
- Use ONLY the specified brand colors
- Simple, minimal layout with no clutter
- NO gradients, NO patterns, NO busy backgrounds
- Clean rectangular sections to organize content
- Strong visual hierarchy with clear spacing
- Professional sans-serif fonts
- Generous margins and padding (at least 10% on all sides)
- High contrast between text and background
- NO extra illustrations or decorative elements
- Focus on typography and clean layout`;

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
            bodyContent: `We provide exceptional service with a focus on quality and customer satisfaction. Our team is dedicated to exceeding your expectations.`,
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