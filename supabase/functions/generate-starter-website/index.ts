import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BusinessPackage {
  businessName: string;
  businessIdea: string;
  offer: string;
  targetCustomer: string;
  tone: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logoUrl: string;
  images: string[];
  socialLinks: Record<string, string>;
  location: string;
  contact: {
    email: string;
    phone: string;
  };
  tagline?: string;
  checkoutUrl?: string;
  notes?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { businessPackage } = await req.json() as { businessPackage: BusinessPackage };

    if (!businessPackage || !businessPackage.businessName) {
      return new Response(
        JSON.stringify({ error: "Business package with businessName is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const checkoutUrl = businessPackage.checkoutUrl || "#";

    const prompt = `You are an elite web designer specializing in Apple-inspired minimalist design.

Create a PREMIUM, APPLE-LIKE, MOBILE-RESPONSIVE 2-page starter website for the business described below.

BUSINESS PACKAGE (JSON):
${JSON.stringify(businessPackage, null, 2)}

DESIGN PHILOSOPHY - APPLE-INSPIRED:
- Minimalist, clean design with generous white space
- Large, high-quality 4K imagery (minimum 1920x1080 resolution)
- Simple, elegant typography using system fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Subtle animations and smooth transitions
- Premium feel with meticulous attention to spacing and hierarchy
- Limited color palette focused on neutrals with strategic use of brand colors
- Large hero sections with full-bleed images
- Clean product cards with emphasis on imagery
- Crisp, professional aesthetic

TECH REQUIREMENTS:
- Output ONLY HTML for two pages using Tailwind via CDN.
- Each page must include: <script src="https://cdn.tailwindcss.com"></script> in <head>.
- Do NOT use <style> blocks.
- Do NOT use any external JS frameworks.
- CRITICAL: Include EXACTLY 3-5 high-quality 4K Pexels stock photos:
  1. HERO IMAGE: One large, stunning 4K image in the hero section (full-width or 50% width beside headline)
  2. FEATURE IMAGES: 2-3 high-quality lifestyle images showcasing the business/product in use
  3. SHOP IMAGE: One professional 4K product/service image on the shop page
  - ONLY use high-resolution Pexels images (minimum 1920x1080)
  - Link directly to Pexels images (e.g., https://images.pexels.com/photos/.../pexels-photo-....jpeg?auto=compress&cs=tinysrgb&w=1920)
  - Choose stunning, professional images that match the business type
  - Images should have excellent composition, lighting, and feel premium
  - Use the provided logoUrl for the brand logo
- Use large font sizes: text-5xl to text-7xl for headlines
- Generous padding and margins (py-20, py-32, etc.)
- Subtle shadows and rounded corners
- System font stack for clean typography

PAGES:
1) Home page (index.html)
   Sections in this order:
   - Clean top nav (logo + links: Home, Shop) - minimal, floating or with subtle border
   - Hero (full-width or two-column layout):
     * Large, bold headline (text-6xl or text-7xl)
     * Short, impactful subheadline
     * Single prominent CTA button (large, rounded, brand color)
     * REQUIRED: Stunning 4K hero image - either full-width background or large image beside text
   - Social proof strip (3 clean trust indicators with icons)
   - About section (minimal text, focus on key message)
   - Features/Benefits (3-4 items with icons and 2-3 lifestyle images integrated)
   - "Why Choose Us" section with image
   - Final CTA (clean, prominent)
   - Minimal footer

2) Shop page (shop.html)
   Sections:
   - Clean top nav
   - Page header with large headline and REQUIRED 4K shop image
   - 2-3 product cards with:
     * High-quality product images (if available, otherwise use relevant Pexels images)
     * Clean typography
     * Clear pricing
     * Prominent "Buy Now" buttons linking to: ${checkoutUrl}
   - Small note below products: "To start selling, replace the checkout link with your Shopify/Stripe link."
   - Clean FAQ section (3 questions, minimal styling)
   - Minimal footer

STYLE GUIDELINES:
- Background: Mostly white or very light gray (gray-50)
- Text: Dark gray (gray-900) for headlines, gray-600/700 for body
- Buttons: Large (px-8 py-4), rounded-full or rounded-xl, use brand primary color
- Spacing: Generous (py-20, py-24, py-32 between sections)
- Images: Large, full-width or 50%+ width, high quality
- Typography: Large headlines (text-5xl+), readable body text (text-lg)
- Borders: Minimal, subtle when used
- Hover effects: Subtle scale or opacity transitions

OUTPUT FORMAT:
Return ONLY the two files in this exact format, no backticks, no markdown:

<!-- LAUNCHPAD_START:index.html -->
...FULL HTML FOR HOME PAGE...
<!-- LAUNCHPAD_END:index.html -->

<!-- LAUNCHPAD_START:shop.html -->
...FULL HTML FOR SHOP PAGE...
<!-- LAUNCHPAD_END:shop.html -->`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16000,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate website", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    const homeMatch = content.match(/<!-- LAUNCHPAD_START:index\.html -->([\s\S]*?)<!-- LAUNCHPAD_END:index\.html -->/);
    const shopMatch = content.match(/<!-- LAUNCHPAD_START:shop\.html -->([\s\S]*?)<!-- LAUNCHPAD_END:shop\.html -->/);

    const homeHtml = homeMatch ? homeMatch[1].trim() : "";
    const shopHtml = shopMatch ? shopMatch[1].trim() : "";

    if (!homeHtml || !shopHtml) {
      console.error("Failed to parse website output:", content.substring(0, 500));
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse generated website",
          rawContent: content.substring(0, 1000)
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        home_html: homeHtml,
        shop_html: shopHtml,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating website:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
