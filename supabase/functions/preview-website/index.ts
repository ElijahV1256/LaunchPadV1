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
        name: "Premium Modern",
        description: "Ultra-modern design with glass-morphism effects, smooth gradients, large typography, generous spacing, floating cards, and sophisticated animations. Use backdrop-blur, subtle shadows, and elegant transitions."
      },
      {
        name: "Bold Luxury",
        description: "High-end luxury design with dramatic typography (72px+ headings), rich gradients, premium color overlays, parallax-style sections, and eye-catching micro-interactions. Make every element feel expensive and polished."
      },
      {
        name: "Sophisticated Minimal",
        description: "Clean, premium minimalist design with perfect spacing, elegant serif/sans-serif font pairing, subtle hover effects, smooth scrolling animations, and a focus on negative space. Every pixel matters."
      }
    ];

    const basePrompt = `You are an award-winning web designer creating PREMIUM, LUXURY websites. This website must look like it cost $10,000+ to build.

BUSINESS INFORMATION:
- Business Description: ${designPrefs.businessDescription || "A professional business"}
- Industry: ${designPrefs.industry || "General"}
- Target Audience: ${designPrefs.targetAudience || "General public"}
- Brand Personality: ${designPrefs.brandPersonality || "Professional and trustworthy"}
- Preferred Style: ${designPrefs.preferredStyle || "Modern and clean"}

CONTENT TO USE:
- Hero Headline: ${copy.hero_headline || "Welcome"}
- Hero Subheadline: ${copy.hero_subheadline || "Your business tagline"}
- Features: ${JSON.stringify(copy.features || [])}
- Value Proposition: ${copy.value_proposition || ""}
- Benefits: ${JSON.stringify(copy.value_benefits || [])}
- Pricing: ${JSON.stringify(copy.pricing_tiers || [])}
- Testimonials: ${JSON.stringify(copy.testimonials || [])}
- FAQs: ${JSON.stringify(copy.faqs || [])}

BRAND COLORS (use these EXACTLY):
- Primary: ${theme.colors.primary}
- Secondary: ${theme.colors.secondary}
- Accent: ${theme.colors.accent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 PREMIUM DESIGN REQUIREMENTS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

VISUAL EXCELLENCE:
✓ Large, bold typography (Hero headlines: 56px-72px on desktop)
✓ Perfect spacing and breathing room (80-120px section padding)
✓ Smooth gradients and glass-morphism effects (backdrop-blur-lg)
✓ Premium shadows: box-shadow: 0 20px 60px rgba(0,0,0,0.15)
✓ Rounded corners everywhere (12-24px border-radius)
✓ Professional imagery placeholders with overlays
✓ Consistent 8px spacing grid system

ANIMATIONS & INTERACTIONS:
✓ Smooth scroll animations using Intersection Observer
✓ Fade-in + slide-up on scroll (transform: translateY(30px) → translateY(0))
✓ Hover effects on ALL interactive elements (scale, brightness, shadow)
✓ Smooth transitions: transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1)
✓ Animated gradient backgrounds
✓ Floating/pulsing elements for visual interest

MODERN CSS TECHNIQUES:
✓ CSS Grid for layouts (not just flexbox)
✓ CSS Variables for theme colors
✓ backdrop-filter: blur(10px) for glass effects
✓ linear-gradient overlays on images
✓ Position sticky for navigation
✓ Modern font stack: system-ui, -apple-system, sans-serif

SECTIONS TO INCLUDE:
1. HERO - Full viewport height, centered content, large headline, gradient background, animated CTA
2. FEATURES/SERVICES - Icon + title + description cards with hover effects
3. VALUE PROPOSITION - Eye-catching callout with benefits list
4. PRICING - Beautiful pricing cards with hover lift effect
5. TESTIMONIALS - Elegant cards with ratings and customer info
6. FAQ - Accordion-style with smooth animations
7. CONTACT/CTA - Bold closing section with form
8. FOOTER - Clean, organized with links

NAVIGATION:
✓ Sticky header with blur background on scroll
✓ Smooth scroll to sections
✓ Mobile hamburger menu with smooth animation
✓ Logo + navigation links + CTA button

MOBILE RESPONSIVE:
✓ Perfect on mobile (320px-768px)
✓ Reduce font sizes appropriately (Hero: 36-42px on mobile)
✓ Stack elements vertically
✓ Touch-friendly buttons (min 44px height)

COLOR USAGE:
✓ Use provided brand colors throughout
✓ Create subtle gradients with brand colors
✓ Use opacity variations for depth
✓ Dark text on light backgrounds (proper contrast)

QUALITY STANDARDS:
✓ This must look like websites from Awwwards, Dribbble top shots, or Apple.com
✓ Every detail polished and intentional
✓ Professional, never "template-y" or generic
✓ Make competitors jealous
✓ Worth $10,000+ in perceived value

TECHNICAL:
✓ Valid HTML5 with semantic tags
✓ Embedded CSS in <style> tag
✓ Embedded JavaScript for interactions
✓ NO external dependencies or libraries
✓ Clean, organized code with comments
✓ Optimized for performance

Return ONLY the complete HTML code. No explanations. No markdown. Just pristine HTML.`;

    const selectedStyle = designStyles[Math.floor(Math.random() * designStyles.length)];
    const stylePrompt = `${basePrompt}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 DESIGN STYLE FOR THIS GENERATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${selectedStyle.name}
${selectedStyle.description}

Apply this design style while maintaining all the premium requirements above. Make it absolutely stunning.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an award-winning web designer who creates PREMIUM, LUXURY websites that look like they cost $10,000+. Every pixel is perfect. Every animation is smooth. Every detail is polished. You ONLY return pristine HTML code - no markdown, no explanations, just beautiful code."
        },
        {
          role: "user",
          content: stylePrompt
        }
      ],
      temperature: 0.9,
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