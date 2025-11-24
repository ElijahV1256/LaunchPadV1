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

    const basePrompt = `You are an award-winning web designer creating CLEAN, MODERN, PREMIUM websites with lots of white space.

BUSINESS INFORMATION:
- Business Description: ${designPrefs.businessDescription || "A professional business"}
- Industry: ${designPrefs.industry || "General"}
- Target Audience: ${designPrefs.targetAudience || "General public"}
- Brand Personality: ${designPrefs.brandPersonality || "Professional and trustworthy"}
- Preferred Style: ${designPrefs.preferredStyle || "Modern and clean"}

STYLE INTERPRETATION:
${copy.style_interpretation || "Clean, modern design with generous whitespace"}

CONTENT TO USE:
- Header CTA: ${copy.header_cta || "Get Started"}
- Header Style: ${copy.header_style_notes || "Clean and minimal"}
- Hero Headline: ${copy.hero_headline || "Welcome"}
- Hero Subheadline: ${copy.hero_subheadline || "Your business tagline"}
- Hero CTA Primary: ${copy.hero_cta_primary || "Get Started"}
- Hero CTA Secondary: ${copy.hero_cta_secondary || ""}
- Hero Photo: ${copy.hero_photo_description || "Full-width hero image with soft lighting"}
- About Text: ${copy.about_text || ""}
- About Photo: ${copy.about_photo_description || ""}
- Features: ${JSON.stringify(copy.features || [])}
- Value Proposition: ${copy.value_proposition || ""}
- Benefits: ${JSON.stringify(copy.value_benefits || [])}
- Gallery Photos: ${JSON.stringify(copy.gallery_photos || [])}
- Pricing: ${JSON.stringify(copy.pricing_tiers || [])}
- Testimonials: ${JSON.stringify(copy.testimonials || [])}
- FAQs: ${JSON.stringify(copy.faqs || [])}
- Contact Message: ${copy.contact_message || ""}
- Contact CTA: ${copy.contact_cta || "Get in Touch"}
- Contact Photo: ${copy.contact_photo_description || ""}

BRAND COLORS (use these EXACTLY):
- Primary: ${theme.colors.primary}
- Secondary: ${theme.colors.secondary}
- Accent: ${theme.colors.accent}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 CLEAN MODERN DESIGN REQUIREMENTS (MANDATORY)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DESIGN PHILOSOPHY:
✓ CLEAN, MODERN, MINIMAL design with LOTS OF WHITE SPACE
✓ Simple, elegant, sophisticated
✓ Every element has breathing room
✓ Less is more - remove anything unnecessary

VISUAL EXCELLENCE:
✓ Large, clean typography (Hero headlines: 48-64px on desktop)
✓ Generous spacing and breathing room (100-160px section padding)
✓ Subtle shadows: box-shadow: 0 2px 20px rgba(0,0,0,0.08)
✓ Minimal rounded corners (8-12px border-radius)
✓ Clean imagery placeholders following photo descriptions
✓ Consistent 8px spacing grid system
✓ Lots of white/light background (#FFFFFF, #FAFAFA, #F8F9FA)

HEADER (MANDATORY):
✓ Logo in TOP-LEFT corner (MANDATORY)
✓ Simple navigation menu
✓ CTA button on the right
✓ Clean, minimal styling
✓ Sticky with subtle shadow on scroll

ANIMATIONS & INTERACTIONS:
✓ Subtle scroll animations using Intersection Observer
✓ Gentle fade-in on scroll (opacity: 0 → 1)
✓ Simple hover effects (slight scale, subtle shadow)
✓ Smooth transitions: transition: all 0.3s ease
✓ NO flashy animations - keep it minimal

MODERN CSS TECHNIQUES:
✓ CSS Grid for layouts (clean and organized)
✓ CSS Variables for theme colors
✓ Clean, simple shadows
✓ Modern font stack: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
✓ Position sticky for navigation

SECTIONS TO INCLUDE (EXACT ORDER):
1. HEADER - Logo top-left, navigation, CTA button right
2. HERO - Full viewport height, centered content, large clean headline, photo placeholder
3. ABOUT - 2-3 sentences, optional photo
4. FEATURES - Clean cards with icons, titles, descriptions
5. VALUE - Simple bullet list of benefits
6. GALLERY - Grid of photo placeholders (if provided in content)
7. PRICING - Clean pricing cards (if provided in content)
8. TESTIMONIALS - Simple testimonial cards (if provided in content)
9. FAQ - Clean accordion-style FAQs
10. CONTACT - Contact form, message, CTA
11. FOOTER - Minimal footer with links

PHOTO PLACEHOLDERS:
✓ Use the photo descriptions from the content
✓ Create clean placeholder divs with:
  - Background: light gray (#F0F0F0)
  - Centered text describing the photo
  - Proper aspect ratios
  - Clean borders

MOBILE RESPONSIVE:
✓ Perfect on mobile (320px-768px)
✓ Reduce font sizes (Hero: 32-40px on mobile)
✓ Stack elements vertically
✓ Touch-friendly buttons (min 48px height)
✓ Maintain generous spacing

COLOR USAGE:
✓ Use provided brand colors for accents and CTAs
✓ Lots of white/light backgrounds
✓ Clean, simple color palette
✓ High contrast for readability
✓ Minimal use of gradients (only if subtle)

QUALITY STANDARDS:
✓ Clean and modern like Apple, Stripe, Notion
✓ Minimal and sophisticated
✓ Professional and polished
✓ Lots of breathing room
✓ Easy to scan and read

TECHNICAL:
✓ Valid HTML5 with semantic tags
✓ Embedded CSS in <style> tag
✓ Embedded JavaScript for simple interactions
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
          content: "You are an award-winning web designer who creates CLEAN, MODERN, MINIMAL websites with lots of white space. Every design is sophisticated and elegant. You ONLY return pristine HTML code - no markdown, no explanations, just beautiful code."
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