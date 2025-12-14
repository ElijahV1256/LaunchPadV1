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

    const prompt = `You are a professional web designer and front-end developer.

Create a CLEAN, MODERN, MOBILE-RESPONSIVE 2-page starter website for the business described below.

BUSINESS PACKAGE (JSON):
${JSON.stringify(businessPackage, null, 2)}

TECH REQUIREMENTS:
- Output ONLY HTML for two pages using Tailwind via CDN.
- Each page must include: <script src="https://cdn.tailwindcss.com"></script> in <head>.
- Do NOT use <style> blocks.
- Do NOT use any external JS frameworks.
- Keep images optional. If needed, use simple placeholders or the provided logoUrl.
- Must look premium, spacious, and trustworthy.
- Use the brand colors from the business package for styling.
- If brandColors are provided, use them for buttons, accents, and key elements.

PAGES:
1) Home page (index.html)
   Sections in this order:
   - Top nav (logo + links: Home, Shop)
   - Hero (headline, subheadline, primary CTA button linking to shop.html)
   - Social proof strip (3 short trust bullets)
   - About (short)
   - Features/Benefits (3-6 items)
   - "Why Us / Story" section
   - Final CTA (button to shop.html)
   - Footer

2) Shop page (shop.html)
   Sections:
   - Top nav (logo + links)
   - Page header "Shop"
   - 1-3 product cards (name, short benefit, price placeholder)
   - Each product card has a "Buy Now" button that links to: ${checkoutUrl}
     - Also include a small note: "To start selling, replace the checkout link with your Shopify/Stripe link."
   - Simple FAQ (3 questions)
   - Footer

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
        model: "claude-opus-4-5-20251101",
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