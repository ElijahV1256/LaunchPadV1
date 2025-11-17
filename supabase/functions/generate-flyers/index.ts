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
        style: "Bold grand opening announcement with geometric shapes and clean design",
        focus: "excitement and celebration with prominent business name, no people or faces",
        extraDetails: "Include 'GRAND OPENING' or 'NOW OPEN' text in large English letters, contact info icons",
        visualElements: "abstract shapes, icons, patterns, or product photography only"
      },
      {
        title: "Service Showcase Flyer",
        style: "Clean professional layout with icons and graphics",
        focus: "benefits and value proposition using symbols and illustrations",
        extraDetails: "Include service icons or product images, pricing sections or 'Call for Quote'",
        visualElements: "professional icons, abstract illustrations, product photos, no human faces"
      },
      {
        title: "Social Media Story Template",
        style: "Vertical mobile-optimized bold design with graphics",
        focus: "eye-catching geometric visuals perfect for Instagram/Facebook stories",
        extraDetails: "Optimized for 9:16 aspect ratio, bold English text, strong visual hierarchy",
        visualElements: "abstract patterns, shapes, icons, lifestyle product shots, no people"
      }
    ];

    const flyers = [];

    for (let i = 0; i < flyerTypes.length; i++) {
      const flyerType = flyerTypes[i];

      const prompt = `Create a professional marketing flyer design for "${businessName}" - ${descriptionText}

CRITICAL TEXT REQUIREMENTS:
- ALL text must be in ENGLISH ONLY
- Business name "${businessName}" in large, bold, clean sans-serif font
- ${flyerType.extraDetails}
- Use readable, modern typography
- Contact icons (phone, email, website symbols)

VISUAL STYLE - ${flyerType.title}:
${flyerType.style}
${flyerType.focus}

VISUAL ELEMENTS TO USE:
${flyerType.visualElements}

STRICT REQUIREMENTS - NO EXCEPTIONS:
❌ NO human faces, people, or portraits
❌ NO text in Arabic, Chinese, or any non-English language
❌ NO distorted or unclear text
✅ USE abstract shapes, geometric patterns, icons, or product photography
✅ USE English language only for all text elements
✅ USE clean, readable fonts in English

BRAND COLORS (integrate throughout design):
Primary: ${brandColors.primary}
Secondary: ${brandColors.secondary || brandColors.primary}
Accent: ${brandColors.accent || brandColors.primary}

LAYOUT REQUIREMENTS:
- Clean white or light neutral background for text areas
- High contrast between text and background
- Professional margins and spacing
- Balanced visual hierarchy
- Modern, minimalist aesthetic
- Print-ready quality at high resolution

Style reference: Modern professional graphic design, corporate marketing material, clean contemporary branding, minimalist business flyer, professional promotional design.`;

      try {
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: i === 2 ? "1024x1792" : "1024x1024",
          quality: "hd",
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
