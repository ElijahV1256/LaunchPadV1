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
    const { businessName, brandColors, businessDescription, logoDescription, logoUrl } = await req.json();

    const openai = new OpenAI({
      apiKey: Deno.env.get("OPENAI_API_KEY"),
    });

    const descriptionText = businessDescription || businessName;
    const logoText = logoDescription || "modern professional logo";

    const flyerTypes = [
      {
        title: "Grand Opening Flyer",
        style: "Bold grand opening announcement with eye-catching design",
        focus: "excitement and celebration with prominent business name",
        extraDetails: "Include 'GRAND OPENING' or 'NOW OPEN' text, contact info placeholder"
      },
      {
        title: "Service Showcase Flyer",
        style: "Clean professional layout showcasing offerings",
        focus: "benefits and value proposition",
        extraDetails: "Include service/product highlights, pricing tiers or 'Call for Quote'"
      },
      {
        title: "Social Media Story Template",
        style: "Vertical mobile-optimized bold design",
        focus: "eye-catching visuals perfect for Instagram/Facebook stories",
        extraDetails: "Optimized for 9:16 aspect ratio, minimal text, strong visual impact"
      }
    ];

    const flyers = [];

    for (let i = 0; i < flyerTypes.length; i++) {
      const flyerType = flyerTypes[i];

      const prompt = `Professional marketing flyer for business: "${businessName}"
Business offers: ${descriptionText}

Design Type: ${flyerType.title}
Style: ${flyerType.style}
Focus: ${flyerType.focus}

BRAND COLORS (use these exact colors):
- Primary: ${brandColors.primary}
- Secondary: ${brandColors.secondary || brandColors.primary}
- Accent: ${brandColors.accent || brandColors.primary}

REQUIRED ELEMENTS:
- Business name "${businessName}" prominently displayed in large, bold, modern sans-serif font
- Logo style: ${logoText} - integrate naturally into the design
- ${flyerType.extraDetails}
- Contact information placeholder (phone, website, email icons)
- Clean margins and professional spacing

DESIGN REQUIREMENTS:
- Use the brand colors prominently throughout
- High contrast for excellent readability
- Modern, professional, print-ready quality
- Balanced composition with clear visual hierarchy
- White or very light background for text readability

Style: Professional graphic design, marketing material, corporate identity, modern aesthetic.`;

      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: i === 2 ? "1024x1792" : "1024x1024",
          quality: "standard",
          style: "natural",
        });

        const imageUrl = response.data[0].url;

        if (imageUrl) {
          flyers.push({
            title: flyerType.title,
            description: `A professionally designed ${flyerType.title.toLowerCase()} featuring your brand colors and business identity.`,
            imageUrl: imageUrl,
            canvaUrl: "https://www.canva.com/create/flyers/",
            prompt: prompt,
          });
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error: any) {
        console.error(`Error generating flyer ${i + 1}:`, error);
      }
    }

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
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
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