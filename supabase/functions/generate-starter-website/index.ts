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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') ||
                         Deno.env.get('OPENAI_KEY') ||
                         Deno.env.get('openai_api_key');

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
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

    const prompt = `You are an elite Shopify theme designer specializing in high-converting e-commerce websites.

Create a PROFESSIONAL, SHOPIFY-STYLE 2-page e-commerce website for the business described below.

BUSINESS PACKAGE (JSON):
${JSON.stringify(businessPackage, null, 2)}

IMPORTANT CUSTOMER-PROVIDED DATA:
${hasProductImages ? `- The customer provided ${businessPackage.images.length} product image(s). YOU MUST USE THESE IMAGES for product cards on the shop page.` : '- No product images provided. Use relevant Pexels images only if appropriate for the business type.'}
${hasSocialLinks ? `- Social media links provided: ${Object.keys(businessPackage.socialLinks).join(', ')}. Include these in the footer.` : '- No social media links provided.'}
${hasContactPhone ? `- Phone number provided: ${businessPackage.contact.phone}. Display this prominently in the footer or contact section.` : ''}
${hasLocation ? `- Business address provided: ${businessPackage.location}. Include this in the footer.` : ''}
${businessPackage.checkoutUrl && businessPackage.checkoutUrl !== '#' ? `- Checkout URL provided: ${businessPackage.checkoutUrl}. Use this exact URL for all \"Add to Cart\" or \"Buy Now\" buttons.` : '- No checkout URL provided yet. Use \"#\" for Buy Now buttons with a note to replace.'}

DESIGN PHILOSOPHY - SHOPIFY E-COMMERCE:
- Professional, clean e-commerce design inspired by Shopify's Dawn theme
- Minimalist aesthetic with excellent product focus and clear hierarchy
- White/light backgrounds (gray-50) as primary - NOT heavy gradients
- Strategic, subtle use of brand colors for accents, buttons, and highlights only
- Large, high-quality product photography with clean presentation
- Professional, readable typography (no overly large headlines)
- Trust-building elements and clear conversion paths
- Clean, organized layouts with generous white space
- Mobile-first, responsive design
- Focus on usability and conversion optimization

TECH REQUIREMENTS:
- Output ONLY HTML for two pages using Tailwind via CDN
- Each page must include: <script src=\"https://cdn.tailwindcss.com\"></script> in <head>
- DO NOT use <style> blocks or external CSS files
- DO NOT use any external JS frameworks
- Use ONLY Tailwind classes for all styling
- DO NOT include any logo images - use the business name as text-based branding
- CRITICAL IMAGE REQUIREMENTS:
  * Include 2-4 high-quality 4K Pexels photos ONLY for products or relevant hero images
  * ONLY use images if they are DIRECTLY relevant to the specific business type
  * For example:
    - Cleaning business: Use cleaning products, clean spaces
    - Bakery: Use fresh baked goods, pastries
    - Consulting: Use professional office settings
    - Pet grooming: Use groomed pets
  * Link directly to Pexels images (e.g., https://images.pexels.com/photos/.../pexels-photo-....jpeg?auto=compress&cs=tinysrgb&w=1920)
  * Images must feel authentic and specific to the business type
- Use professional font sizes: text-4xl to text-5xl for main headlines (NOT text-8xl)
- System font stack: font-sans (Tailwind default)

PAGES STRUCTURE:

1) HOME PAGE (index.html) - SHOPIFY STYLE

   NAVIGATION (Sticky Header):
   - Clean white background with subtle border-bottom
   - Business name in medium-sized text (text-xl or text-2xl font-bold) in dark gray or brand color
   - Simple nav links: Home, Shop (text-sm uppercase tracking-wide)
   - Shopping bag/cart icon on the right (use SVG or Unicode 🛒)
   - Minimal shadow: shadow-sm

   HERO SECTION (Above the Fold):
   - Clean layout with white or very light background (NOT full gradients)
   - Professional headline (text-4xl or text-5xl font-bold) in dark text
   - Tagline/subheadline (text-lg or text-xl) in gray-600
   - Single primary CTA button: \"Shop Now\" linking to shop.html
     * Use brand primary color, text-white, px-8 py-3, rounded-lg
   - Optional: Large hero product image on side (50/50 split on desktop)
   - Clean, spacious layout with lots of white space

   ABOUT/VALUE PROP SECTION:
   - White or gray-50 background
   - Centered text layout or 2-column with image
   - Business description (2-3 sentences)
   - Include tagline
   - Clean typography, no flashy effects

   FEATURES/BENEFITS SECTION:
   - Simple 3-column grid (1 column on mobile)
   - Each feature: small icon, title, brief description
   - White background with subtle borders or very light gray cards
   - NO glassmorphism or heavy effects
   - Clean, professional spacing

   FEATURED PRODUCTS PREVIEW (Optional):
   - \"Featured Products\" or \"Shop Our Bestsellers\" heading
   - 2-3 product cards in a grid
   - Each card: product image, name, price, \"View Product\" link
   - Clean white cards with subtle hover lift

   CALL-TO-ACTION SECTION:
   - Light colored background (use subtle brand color with low opacity)
   - Centered text
   - \"Ready to get started?\" or similar headline
   - CTA button linking to shop.html
   - Professional, not overly flashy

   FOOTER (Professional):
   - Light gray background (gray-100 or gray-200)
   - Multi-column layout: About, Contact, Follow Us, Policies
   - Contact info, social links
   - Bottom bar: Copyright, payment icons (if applicable)
   - Clean, organized, professional

2) SHOP PAGE (shop.html) - SHOPIFY PRODUCT CATALOG

   NAVIGATION:
   - Same as home page

   PAGE HEADER:
   - Clean white background
   - Page title \"Shop\" or \"Our Products\" (text-3xl or text-4xl font-bold)
   - Optional breadcrumb: Home > Shop
   - Professional, minimal design

   PRODUCTS GRID (E-Commerce Focus):
   - ${hasProductImages ? `USE THE ${businessPackage.images.length} PROVIDED PRODUCT IMAGES for product cards` : '3-6 product cards showcasing offerings'}
   - Professional Shopify-style product cards:
     * Clean white background (bg-white)
     * Product image (square or 4:5 ratio, rounded-lg, object-cover)
     * Product name (text-lg font-semibold, text-gray-900)
     * Short description (text-sm text-gray-600)
     * Price (text-lg font-bold, use brand color)
     * \"Add to Cart\" or \"Buy Now\" button linking to: ${checkoutUrl}
       - Styled with brand primary color
       - Full width or prominent placement
       - px-6 py-2.5, rounded-lg
     * Subtle border (border border-gray-200)
     * Hover effect: subtle shadow increase (hover:shadow-lg)
   - Grid layout:
     * Mobile: 1 column (grid-cols-1)
     * Tablet: 2 columns (md:grid-cols-2)
     * Desktop: 3 columns (lg:grid-cols-3)
   - Good spacing between cards (gap-6 or gap-8)
   ${checkoutUrl === '#' ? '- Small gray text note below grid: \"Note: To start selling, replace the checkout link with your payment processor URL.\"' : ''}

   TRUST SECTION (Optional):
   - Below products: \"Why Shop With Us\" or \"Our Guarantee\"
   - 3 trust badges in a row: Free Shipping, Easy Returns, Secure Checkout
   - Icons + short text
   - Light background

   FOOTER:
   - Same as home page

CRITICAL STYLING REQUIREMENTS - SHOPIFY AESTHETIC:

COLOR USAGE (Professional & Subtle):
- PRIMARY BACKGROUND: White (bg-white) and light gray (bg-gray-50) - these should dominate
- BRAND COLORS: Use sparingly and strategically
  * Primary color (${businessPackage.brandColors.primary}): Main CTA buttons, important links, accents
  * Secondary color (${businessPackage.brandColors.secondary}): Secondary buttons, subtle highlights
  * Accent color (${businessPackage.brandColors.accent}): Small accents only
- NO heavy gradients as backgrounds
- Use inline Tailwind colors: style=\"background-color: ${businessPackage.brandColors.primary}\" for buttons
- Text colors: text-gray-900 (headlines), text-gray-600 (body), text-gray-500 (muted)

EFFECTS (Subtle & Professional):
- Shadows: shadow-sm for nav, shadow-md for cards, hover:shadow-lg for interactions
- Borders: border border-gray-200 for card separation
- Rounded corners: rounded-lg or rounded-xl (NOT rounded-3xl)
- Transitions: transition-all duration-200 for smooth interactions
- Hover effects: hover:shadow-lg, slight hover:-translate-y-1 for cards (subtle lift)
- NO backdrop-blur or glassmorphism effects
- NO hover:scale-105 or dramatic scale effects

TYPOGRAPHY (Professional & Readable):
- Main headlines: text-4xl or text-5xl, font-bold
- Section headlines: text-3xl, font-bold
- Subheadlines: text-xl, font-semibold or font-normal
- Body text: text-base, leading-relaxed
- Small text: text-sm
- Colors: Headlines in text-gray-900, body in text-gray-600
- NO gradient text effects

SPACING (Clean & Organized):
- Section padding: py-16 or py-20 (not py-32)
- Container: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Card spacing: gap-6 or gap-8 for grids
- Internal card padding: p-6
- Consistent, clean spacing throughout

RESPONSIVE DESIGN:
- Mobile-first approach
- Breakpoints: sm: md: lg: xl:
- Text sizing: scale down headlines on mobile (text-3xl md:text-4xl lg:text-5xl)
- Grid layouts: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Proper padding adjustments: px-4 sm:px-6 lg:px-8

SHOPIFY-SPECIFIC ELEMENTS:
- Clean product cards with clear imagery
- Prominent, clear pricing
- Professional CTA buttons that stand out but aren't garish
- Trust indicators and social proof
- Clean navigation with cart icon
- Professional footer with organized information

OUTPUT FORMAT:
Return ONLY the two files in this exact format, no backticks, no markdown:

<!-- LAUNCHPAD_START:index.html -->
...FULL HTML FOR HOME PAGE...
<!-- LAUNCHPAD_END:index.html -->

<!-- LAUNCHPAD_START:shop.html -->
...FULL HTML FOR SHOP PAGE...
<!-- LAUNCHPAD_END:shop.html -->`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    let response;
    try {
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          max_tokens: 8000,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return new Response(
          JSON.stringify({ error: "Request timeout after 120 seconds" }),
          {
            status: 504,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      throw error;
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate website", details: errorText }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

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