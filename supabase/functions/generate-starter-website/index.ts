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

    const prompt = `You are an elite web designer specializing in modern, stunning web design that converts visitors into customers.

Create a BEAUTIFUL, PROFESSIONAL, MOBILE-RESPONSIVE 2-page starter website for the business described below.

BUSINESS PACKAGE (JSON):
${JSON.stringify(businessPackage, null, 2)}

IMPORTANT CUSTOMER-PROVIDED DATA:
${hasProductImages ? `- The customer provided ${businessPackage.images.length} product image(s). YOU MUST USE THESE IMAGES for product cards on the shop page.` : '- No product images provided. Use relevant Pexels images only if appropriate for the business type.'}
${hasSocialLinks ? `- Social media links provided: ${Object.keys(businessPackage.socialLinks).join(', ')}. Include these in the footer.` : '- No social media links provided.'}
${hasContactPhone ? `- Phone number provided: ${businessPackage.contact.phone}. Display this prominently in the footer or contact section.` : ''}
${hasLocation ? `- Business address provided: ${businessPackage.location}. Include this in the footer.` : ''}
${businessPackage.checkoutUrl && businessPackage.checkoutUrl !== '#' ? `- Checkout URL provided: ${businessPackage.checkoutUrl}. Use this exact URL for all \"Buy Now\" buttons.` : '- No checkout URL provided yet. Use \"#\" for Buy Now buttons with a note to replace.'}

DESIGN PHILOSOPHY - MODERN & STUNNING:
- Create a visually striking design that immediately captures attention
- Use smooth gradient backgrounds incorporating the brand colors
- Implement subtle animations and transitions (CSS only, no JavaScript)
- Modern glassmorphism effects where appropriate (backdrop-blur, semi-transparent cards)
- Bold, contemporary typography with excellent hierarchy
- Strategic use of shadows and depth for visual interest
- Professional color theory - use the brand colors in sophisticated gradients and overlays
- Engaging hover effects and interactive elements
- Balance between minimalism and visual richness
- Make every section feel premium and polished

TECH REQUIREMENTS:
- Output ONLY HTML for two pages using Tailwind via CDN
- Each page must include: <script src=\"https://cdn.tailwindcss.com\"></script> in <head>
- DO NOT use <style> blocks or external CSS files
- DO NOT use any external JS frameworks
- Use ONLY Tailwind classes for all styling
- DO NOT include any logo images - use the business name as text-based branding
- CRITICAL IMAGE REQUIREMENTS:
  * Include 2-4 high-quality 4K Pexels photos strategically placed
  * ONLY use images if they are DIRECTLY relevant to the specific business type
  * For example:
    - Cleaning business: Use cleaning products, clean spaces, professional cleaners
    - Bakery: Use fresh baked goods, bakery interior, pastries
    - Consulting: Use professional office settings, meetings, business people
    - Pet grooming: Use groomed pets, grooming tools, happy pet owners
  * Link directly to Pexels images (e.g., https://images.pexels.com/photos/.../pexels-photo-....jpeg?auto=compress&cs=tinysrgb&w=1920)
  * Images must feel authentic and specific to the business type
- Use large, bold font sizes: text-6xl to text-8xl for main headlines
- System font stack: font-sans (Tailwind default)

PAGES STRUCTURE:

1) HOME PAGE (index.html)

   NAVIGATION:
   - Fixed/sticky top nav with backdrop-blur effect
   - Business name in large, bold text (text-2xl font-bold) using brand primary color
   - Nav links: Home, Shop (text-sm, clean spacing)
   - Add subtle shadow on scroll effect

   HERO SECTION:
   - Full-screen height (min-h-screen) with stunning gradient background using brand colors
   - Massive, eye-catching headline (text-6xl to text-8xl font-bold)
   - Compelling subheadline (text-xl to text-2xl)
   - Large, prominent CTA button with gradient, shadow, and hover effect
   - Optional: Overlay a relevant hero image with gradient overlay for depth

   ABOUT SECTION:
   - Clean layout with gradient or colored background (light)
   - 2-3 sentences about the business
   - Include the tagline prominently
   - Modern card design with subtle shadow

   FEATURES/BENEFITS SECTION:
   - 3 feature cards in a grid
   - Each card has: icon (use Unicode symbols or simple shapes), title, description
   - Glassmorphism effect: backdrop-blur, semi-transparent background
   - Hover effects with scale and shadow transitions
   - Use brand accent colors for accents

   CALL-TO-ACTION SECTION:
   - Eye-catching gradient background
   - Bold headline
   - Prominent CTA button linking to shop.html
   - Make this section visually distinct and compelling

   FOOTER:
   - Modern, clean design with dark background (gray-900)
   - Contact info in organized columns
   - Social links with hover effects
   - Copyright notice

2) SHOP PAGE (shop.html)

   NAVIGATION:
   - Same as home page

   HEADER SECTION:
   - Page title \"Shop\" with gradient text effect
   - Optional: Background image with overlay
   - Breadcrumb or back to home link

   PRODUCTS GRID:
   - ${hasProductImages ? `USE THE ${businessPackage.images.length} PROVIDED PRODUCT IMAGES for product cards` : '3-4 product cards showcasing offerings'}
   - Modern card design with:
     * Product image (rounded corners, good aspect ratio)
     * Product name (bold, clear)
     * Brief description
     * Price (prominent, using brand colors)
     * \"Buy Now\" button with gradient and hover effect linking to: ${checkoutUrl}
   - Grid layout: responsive (1 column mobile, 2-3 columns desktop)
   - Cards have hover effects (lift, shadow increase)
   ${checkoutUrl === '#' ? '- Small note below products: \"To start selling, replace the checkout link with your Shopify/Stripe link.\"' : ''}

   FOOTER:
   - Same as home page

CRITICAL STYLING REQUIREMENTS:

COLORS & GRADIENTS:
- Use the brand primary color (${businessPackage.brandColors.primary}) extensively in gradients
- Use the brand secondary color (${businessPackage.brandColors.secondary}) for accents
- Use the brand accent color (${businessPackage.brandColors.accent}) for highlights
- Create beautiful gradients: \"bg-gradient-to-r from-[${businessPackage.brandColors.primary}] to-[${businessPackage.brandColors.secondary}]\"
- Use color overlays on images for cohesive look

MODERN EFFECTS:
- backdrop-blur-lg for glassmorphism
- shadow-xl and shadow-2xl for depth
- rounded-2xl and rounded-3xl for modern feel
- transition-all duration-300 for smooth interactions
- hover:scale-105 for card hover effects
- hover:shadow-2xl for interactive elements

TYPOGRAPHY:
- Headlines: text-6xl to text-8xl, font-bold or font-extrabold
- Subheadlines: text-2xl to text-3xl, font-semibold
- Body: text-lg, leading-relaxed
- Use gradient text where impactful: \"bg-gradient-to-r from-[color] to-[color] bg-clip-text text-transparent\"

SPACING:
- Generous padding: py-20, py-24, py-32
- Good section spacing: space-y-16, space-y-20
- Proper container widths: max-w-7xl mx-auto px-4

RESPONSIVE DESIGN:
- Mobile-first approach
- Use sm:, md:, lg:, xl: breakpoints effectively
- Ensure text scales appropriately
- Grid layouts that adapt (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)

OUTPUT FORMAT:
Return ONLY the two files in this exact format, no backticks, no markdown:

<!-- LAUNCHPAD_START:index.html -->
...FULL HTML FOR HOME PAGE...
<!-- LAUNCHPAD_END:index.html -->

<!-- LAUNCHPAD_START:shop.html -->
...FULL HTML FOR SHOP PAGE...
<!-- LAUNCHPAD_END:shop.html -->`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
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