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
    const hasProductImages = businessPackage.images && businessPackage.images.length > 0;
    const hasSocialLinks = businessPackage.socialLinks && Object.keys(businessPackage.socialLinks).length > 0;
    const hasContactPhone = businessPackage.contact?.phone && businessPackage.contact.phone.trim() !== '';
    const hasLocation = businessPackage.location && businessPackage.location.trim() !== '';

    const prompt = `You are an elite web designer specializing in Apple-inspired minimalist design.

Create a CLEAN, SIMPLE, MOBILE-RESPONSIVE 2-page starter website for the business described below.

BUSINESS PACKAGE (JSON):
${JSON.stringify(businessPackage, null, 2)}

IMPORTANT CUSTOMER-PROVIDED DATA:
${hasProductImages ? `- The customer provided ${businessPackage.images.length} product image(s). YOU MUST USE THESE IMAGES for product cards on the shop page.` : '- No product images provided. Use relevant Pexels images only if appropriate for the business type.'}
${hasSocialLinks ? `- Social media links provided: ${Object.keys(businessPackage.socialLinks).join(', ')}. Include these in the footer.` : '- No social media links provided.'}
${hasContactPhone ? `- Phone number provided: ${businessPackage.contact.phone}. Display this prominently in the footer or contact section.` : ''}
${hasLocation ? `- Business address provided: ${businessPackage.location}. Include this in the footer.` : ''}
${businessPackage.checkoutUrl && businessPackage.checkoutUrl !== '#' ? `- Checkout URL provided: ${businessPackage.checkoutUrl}. Use this exact URL for all "Buy Now" buttons.` : '- No checkout URL provided yet. Use "#" for Buy Now buttons with a note to replace.'}

DESIGN PHILOSOPHY - APPLE-INSPIRED:
- Minimalist, clean design with generous white space
- Large, high-quality 4K imagery (minimum 1920x1080 resolution)
- Simple, elegant typography using system fonts (-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto)
- Premium feel with meticulous attention to spacing and hierarchy
- Limited color palette focused on neutrals with strategic use of brand colors
- Large hero sections with full-bleed images
- Crisp, professional aesthetic
- KEEP IT SIMPLE - fewer sections, more focus

TECH REQUIREMENTS:
- Output ONLY HTML for two pages using Tailwind via CDN.
- Each page must include: <script src="https://cdn.tailwindcss.com"></script> in <head>.
- Do NOT use <style> blocks.
- Do NOT use any external JS frameworks.
- CRITICAL IMAGE REQUIREMENTS:
  * Include ONLY 2-3 high-quality 4K Pexels photos total
  * ONLY use images if they are DIRECTLY relevant to the specific business type
  * For example:
    - Cleaning business: Use cleaning products, clean spaces, professional cleaners
    - Bakery: Use fresh baked goods, bakery interior, pastries
    - Consulting: Use professional office settings, meetings, business people
    - Pet grooming: Use groomed pets, grooming tools, happy pet owners
  * If you are NOT 100% confident the image matches the business, DO NOT include it
  * Link directly to Pexels images (e.g., https://images.pexels.com/photos/.../pexels-photo-....jpeg?auto=compress&cs=tinysrgb&w=1920)
  * Images must feel authentic and specific to the business type
  * Use the provided logoUrl for the brand logo
- Use large font sizes: text-5xl to text-7xl for headlines
- Generous padding and margins (py-20, py-32, etc.)
- System font stack for clean typography

PAGES:
1) Home page (index.html)
   Keep it simple with these sections:
   - Clean top nav (logo + links: Home, Shop)
   - Hero section:
     * Large, bold headline (text-6xl or text-7xl)
     * Short subheadline
     * Single CTA button linking to shop.html
     * Optional: ONE business-relevant hero image IF you're confident it matches
   - Brief about section (2-3 sentences)
   - Simple features/benefits (3 items max, no images)
   - Final CTA section
   - Footer with:
     * Contact info (email${hasContactPhone ? ', phone' : ''})
     ${hasLocation ? '* Business address' : ''}
     ${hasSocialLinks ? '* Social media links' : ''}

2) Shop page (shop.html)
   Keep it simple:
   - Clean top nav
   - Page header "Shop" with optional relevant image
   - ${hasProductImages ? `USE THE ${businessPackage.images.length} PROVIDED PRODUCT IMAGES for product cards` : '2-3 product cards with clean design'}
   - "Buy Now" buttons linking to: ${checkoutUrl}
   ${checkoutUrl === '#' ? '- Small note: "To start selling, replace the checkout link with your Shopify/Stripe link."' : ''}
   - Footer (same as home page)

STYLE GUIDELINES:
- Background: Mostly white or very light gray (gray-50)
- Text: Dark gray (gray-900) for headlines, gray-600/700 for body
- Buttons: Large (px-8 py-4), rounded-full or rounded-xl, use brand primary color
- Spacing: Generous (py-20, py-24, py-32 between sections)
- Images: Large, high quality, but ONLY if business-relevant
- Typography: Large headlines (text-5xl+), readable body text (text-lg)
- Keep it minimal and clean

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