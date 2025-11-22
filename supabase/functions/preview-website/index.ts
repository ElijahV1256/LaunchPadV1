import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";
import OpenAI from "npm:openai@4.70.1";

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
    const { websiteId, apiKey } = await req.json();

    console.log("Received request for websiteId:", websiteId);

    if (!websiteId) {
      return new Response(
        JSON.stringify({ error: "Website ID is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const openaiApiKey = apiKey || Deno.env.get("OPENAI_API_KEY");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    console.log("Querying website with ID:", websiteId);

    const { data: website, error } = await supabaseClient
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .maybeSingle();

    console.log("Query result - website:", website ? "found" : "not found", "error:", error);

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: `Database error: ${error.message}` }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!website) {
      console.error("Website not found. ID:", websiteId);

      const { data: allWebsites } = await supabaseClient
        .from("websites")
        .select("id, user_id, idea_key")
        .limit(5);

      console.log("Sample websites in database:", allWebsites);

      return new Response(
        JSON.stringify({ error: "Website not found. Make sure you've generated copy first." }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const copy = website.copy || {};
    const theme = website.theme || { colors: { primary: "#2979FF", secondary: "#06D6A0", accent: "#FF6B6B" } };
    const designPrefs = website.design_preferences || {};

    console.log("Generating AI-powered website preview...");

    const openai = new OpenAI({
      apiKey: openaiApiKey,
    });

    const designStyles = [
      {
        name: "Modern Minimalist",
        description: "Clean, minimal design with lots of whitespace, simple typography, and subtle animations. Focus on clarity and elegance."
      },
      {
        name: "Bold & Dynamic",
        description: "Eye-catching design with bold typography, vibrant gradients, strong contrasts, and engaging animations. Make it pop!"
      },
      {
        name: "Professional Corporate",
        description: "Polished, trustworthy design with structured layouts, professional imagery placeholders, and sophisticated styling."
      }
    ];

    const basePrompt = `You are an expert web designer and developer. Create a stunning, modern, single-page website using only HTML, CSS, and vanilla JavaScript.

BUSINESS INFORMATION:
- Business Description: ${designPrefs.businessDescription || "A professional business"}
- Industry: ${designPrefs.industry || "General"}
- Target Audience: ${designPrefs.targetAudience || "General public"}
- Brand Personality: ${designPrefs.brandPersonality || "Professional and trustworthy"}
- Preferred Style: ${designPrefs.preferredStyle || "Modern and clean"}

CONTENT:
- Hero Headline: ${copy.hero_headline || "Welcome"}
- Hero Subheadline: ${copy.hero_subheadline || "Your business tagline"}
- Benefits: ${(copy.benefits || []).join(", ")}
- Offer: ${copy.offer_section || ""}
- Pricing: ${copy.pricing || ""}
- Testimonials: ${JSON.stringify(copy.testimonials || [])}
- FAQs: ${JSON.stringify(copy.faqs || [])}

COLOR PALETTE:
- Primary: ${theme.colors.primary}
- Secondary: ${theme.colors.secondary}
- Accent: ${theme.colors.accent}

REQUIREMENTS:
1. Create a complete, production-ready HTML file with embedded CSS and JavaScript
2. Make it fully responsive (mobile, tablet, desktop)
3. Use modern design principles: clear hierarchy, ample whitespace, professional typography
4. Include smooth scroll animations and hover effects
5. Add a sticky navigation bar
6. Use the provided color palette consistently
7. Include ALL sections: hero, benefits, offer/services, pricing, testimonials, FAQs, and footer
8. Add a prominent CTA button that stands out
9. Use modern CSS (flexbox/grid, gradients, shadows, border-radius)
10. Make it look like a premium, professional website worthy of a real business
11. Include meta tags for SEO
12. Add subtle animations on scroll (use Intersection Observer)
13. DO NOT use any external dependencies, libraries, or frameworks
14. Return ONLY the complete HTML code, no explanations or markdown

The website should look modern and professional, similar to high-end business websites you'd see on Awwwards or Dribbble.`;

    const selectedStyle = designStyles[Math.floor(Math.random() * designStyles.length)];
    const stylePrompt = `${basePrompt}

DESIGN STYLE: ${selectedStyle.name}
${selectedStyle.description}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert web designer who creates beautiful, modern, production-ready websites. You return only valid HTML code with no additional text or markdown formatting."
        },
        {
          role: "user",
          content: stylePrompt
        }
      ],
      temperature: 0.8,
    });

    let html = completion.choices[0].message.content || "";
    html = html.replace(/```html\n?/g, "").replace(/```\n?/g, "").trim();

    const variation = {
      name: selectedStyle.name,
      html: html
    };

    console.log(`AI website variation (${selectedStyle.name}) generated successfully`);

    return new Response(
      JSON.stringify({ html: variation.html, style: variation.name }),
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
      JSON.stringify({ error: error?.message || String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});