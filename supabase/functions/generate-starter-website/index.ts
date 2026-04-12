iimport "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
  brandColors: { primary: string; secondary: string; accent: string };
  fonts: { heading: string; body: string };
  logoUrl: string;
  images: string[];
  socialLinks: Record<string, string>;
  location: string;
  contact: { email: string; phone: string };
  tagline?: string;
  checkoutUrl?: string;
  notes?: string;
}

async function generatePage(
  openaiApiKey: string,
  pageType: "home" | "shop",
  bp: BusinessPackage
): Promise<string> {
  const checkout = bp.checkoutUrl || "#";
  const primary = bp.brandColors.primary || "#2563eb";
  const secondary = bp.brandColors.secondary || "#1e40af";

  const socialHtml = Object.entries(bp.socialLinks || {})
    .map(([platform, url]) => `<a href="${url}" class="text-gray-400 hover:text-white capitalize">${platform}</a>`)
    .join("\n          ");

  const productImages = (bp.images || []).slice(0, 6);

  const homePrompt = `You are an expert web developer. Generate a COMPLETE, VALID HTML page for a business website homepage.

BUSINESS INFO:
- Name: ${bp.businessName}
- Tagline: ${bp.tagline || bp.offer}
- Description: ${bp.businessIdea}
- Offer: ${bp.offer}
- Target Customer: ${bp.targetCustomer}
- Location: ${bp.location || ""}
- Phone: ${bp.contact?.phone || ""}
- Email: ${bp.contact?.email || ""}
- Tone: ${bp.tone}

BRAND COLORS:
- Primary: ${primary}
- Secondary: ${secondary}
- Accent: ${bp.brandColors.accent || "#f59e0b"}

RULES — FOLLOW EXACTLY:
1. Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no code fences, no explanation.
2. Use Tailwind CSS via <script src="https://cdn.tailwindcss.com"></script>
3. NO <style> blocks. NO external CSS. Tailwind classes ONLY.
4. Use inline style ONLY for brand colors: style="background-color:${primary}" or style="color:${primary}"
5. Include a <script> block at bottom to configure Tailwind with brand colors:
   <script>tailwind.config={theme:{extend:{colors:{brand:{primary:'${primary}',secondary:'${secondary}'}}}}}</script>
6. Navigation: sticky top-0 white bg, business name (text-xl font-bold), links: Home | Shop
7. Hero: large headline (text-4xl md:text-5xl font-extrabold text-gray-900), subheadline, CTA button "Shop Now" → shop.html
8. Features: 3-column grid with 3 key benefits of the business
9. About: 2-sentence about section using the business description
10. CTA banner: colored background using primary color, white text, button → shop.html
11. Footer: business name, contact info (${bp.contact?.email || ""}, ${bp.contact?.phone || ""}), location (${bp.location || ""}), social links
12. All nav links: Home links to index.html, Shop links to shop.html
13. CTA buttons: style="background-color:${primary}" class="text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
14. Page background: white. Sections alternate white and bg-gray-50.
15. Professional, clean design. NO gradients on backgrounds. NO glassmorphism.
${bp.logoUrl ? `16. Show logo image in nav: <img src="${bp.logoUrl}" class="h-10 w-auto" alt="${bp.businessName} logo">` : "16. Text-only branding in nav."}

Generate the COMPLETE homepage HTML now:`;

  const shopPrompt = `You are an expert web developer. Generate a COMPLETE, VALID HTML page for a business website shop/services page.

BUSINESS INFO:
- Name: ${bp.businessName}
- Tagline: ${bp.tagline || bp.offer}
- Offer: ${bp.offer}
- Target Customer: ${bp.targetCustomer}
- Checkout URL: ${checkout}
- Phone: ${bp.contact?.phone || ""}
- Email: ${bp.contact?.email || ""}

BRAND COLORS:
- Primary: ${primary}
- Secondary: ${secondary}

PRODUCT/SERVICE IMAGES PROVIDED: ${productImages.length > 0 ? productImages.join(", ") : "none — use relevant Pexels images"}

RULES — FOLLOW EXACTLY:
1. Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no code fences, no explanation.
2. Use Tailwind CSS via <script src="https://cdn.tailwindcss.com"></script>
3. NO <style> blocks. NO external CSS. Tailwind classes ONLY.
4. Use inline style ONLY for brand colors.
5. Include Tailwind config script at bottom.
6. Same navigation as homepage: sticky white nav, business name, Home | Shop links
7. Page header: "Shop" title, breadcrumb "Home > Shop"
8. Products grid: 3 columns on desktop (lg:grid-cols-3), 2 on tablet (md:grid-cols-2), 1 on mobile
9. Generate 4-6 product/service cards relevant to: "${bp.offer}"
   Each card MUST have:
   - Image: ${productImages.length > 0 ? "use the provided images above in order" : `a relevant Pexels photo URL (https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=800)`}
   - Product/service name (text-lg font-semibold text-gray-900)
   - Short 1-sentence description (text-sm text-gray-600)
   - Price or "Contact for Quote" (font-bold, color: ${primary})
   - "Buy Now" button: href="${checkout}" style="background-color:${primary}" class="w-full text-white py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity mt-3 block text-center"
   - Card: class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
10. Trust section below grid: 3 badges — "Secure Checkout", "Fast Delivery", "Money-Back Guarantee"
11. Footer: same as homepage with contact info
12. All nav links work: Home → index.html, Shop → shop.html
${checkout === "#" ? '13. Add note below grid: <p class="text-center text-sm text-gray-500 mt-4">Checkout coming soon — contact us to order!</p>' : ""}

Generate the COMPLETE shop page HTML now:`;

  const prompt = pageType === "home" ? homePrompt : shopPrompt;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      max_tokens: 14000,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await response.json();
  let html = data.choices?.[0]?.message?.content || "";

  // Strip any accidental markdown fences
  html = html.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();

  // Validate we got real HTML
  if (!html.includes("<!DOCTYPE") && !html.includes("<html")) {
    throw new Error(`Invalid HTML output for ${pageType} page`);
  }

  return html;
}

function fallbackPage(bp: BusinessPackage, pageType: "home" | "shop"): string {
  const primary = bp.brandColors?.primary || "#2563eb";
  const checkout = bp.checkoutUrl || "#";
  const name = bp.businessName || "Our Business";

  if (pageType === "home") {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${name}</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white font-sans">
<nav class="sticky top-0 bg-white border-b border-gray-200 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    <span class="text-xl font-bold text-gray-900">${name}</span>
    <div class="flex gap-6 text-sm font-medium text-gray-600">
      <a href="index.html" class="hover:text-gray-900">Home</a>
      <a href="shop.html" class="hover:text-gray-900">Shop</a>
    </div>
  </div>
</nav>
<section class="py-24 px-4 text-center bg-gray-50">
  <h1 class="text-5xl font-extrabold text-gray-900 mb-4">${bp.tagline || bp.offer || "Welcome"}</h1>
  <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">${bp.businessIdea || ""}</p>
  <a href="shop.html" style="background-color:${primary}" class="inline-block text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity">Shop Now</a>
</section>
<section class="py-16 px-4">
  <div class="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-center">
    <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-semibold text-gray-900 text-lg mb-2">Quality Products</h3><p class="text-gray-600 text-sm">We offer only the best for our customers.</p></div>
    <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-semibold text-gray-900 text-lg mb-2">Fast Delivery</h3><p class="text-gray-600 text-sm">Get your order quickly and reliably.</p></div>
    <div class="p-6 bg-gray-50 rounded-xl"><h3 class="font-semibold text-gray-900 text-lg mb-2">Great Support</h3><p class="text-gray-600 text-sm">We're here for you every step of the way.</p></div>
  </div>
</section>
<footer class="bg-gray-900 text-gray-400 py-12 px-4 text-center">
  <p class="text-white font-bold text-lg mb-2">${name}</p>
  ${bp.contact?.email ? `<p>${bp.contact.email}</p>` : ""}
  ${bp.contact?.phone ? `<p>${bp.contact.phone}</p>` : ""}
  <p class="mt-4 text-xs">&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
</footer>
</body></html>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Shop — ${name}</title>
<script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white font-sans">
<nav class="sticky top-0 bg-white border-b border-gray-200 z-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
    <span class="text-xl font-bold text-gray-900">${name}</span>
    <div class="flex gap-6 text-sm font-medium text-gray-600">
      <a href="index.html" class="hover:text-gray-900">Home</a>
      <a href="shop.html" class="hover:text-gray-900">Shop</a>
    </div>
  </div>
</nav>
<section class="py-12 px-4 bg-gray-50 text-center">
  <h1 class="text-4xl font-extrabold text-gray-900">Shop</h1>
  <p class="text-gray-500 mt-2 text-sm"><a href="index.html" class="hover:underline">Home</a> &rsaquo; Shop</p>
</section>
<section class="py-16 px-4">
  <div class="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    ${[1,2,3].map(i => `
    <div class="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
      <div class="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Product ${i}</div>
      <div class="p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-1">${bp.offer || "Product"} ${i}</h3>
        <p class="text-sm text-gray-600 mb-3">A great offering from ${name}.</p>
        <p class="font-bold mb-3" style="color:${primary}">Contact for pricing</p>
        <a href="${checkout}" style="background-color:${primary}" class="block w-full text-white text-center py-2.5 rounded-lg font-semibold hover:opacity-90 transition-opacity">Buy Now</a>
      </div>
    </div>`).join("")}
  </div>
</section>
<footer class="bg-gray-900 text-gray-400 py-12 px-4 text-center">
  <p class="text-white font-bold text-lg mb-2">${name}</p>
  ${bp.contact?.email ? `<p>${bp.contact.email}</p>` : ""}
  <p class="mt-4 text-xs">&copy; ${new Date().getFullYear()} ${name}. All rights reserved.</p>
</footer>
</body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { businessPackage } = await req.json() as { businessPackage: BusinessPackage };

    if (!businessPackage?.businessName) {
      return new Response(
        JSON.stringify({ error: "businessPackage.businessName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiApiKey =
      Deno.env.get("OPENAI_API_KEY") ||
      Deno.env.get("OPENAI_KEY") ||
      Deno.env.get("openai_api_key");

    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Generate both pages in parallel with individual timeouts
    const [homeResult, shopResult] = await Promise.allSettled([
      Promise.race([
        generatePage(openaiApiKey, "home", businessPackage),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Home page timeout")), 90000)
        ),
      ]),
      Promise.race([
        generatePage(openaiApiKey, "shop", businessPackage),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Shop page timeout")), 90000)
        ),
      ]),
    ]);

    const homeHtml =
      homeResult.status === "fulfilled"
        ? homeResult.value
        : fallbackPage(businessPackage, "home");

    const shopHtml =
      shopResult.status === "fulfilled"
        ? shopResult.value
        : fallbackPage(businessPackage, "shop");

    if (homeResult.status === "rejected") {
      console.error("Home page generation failed:", homeResult.reason);
    }
    if (shopResult.status === "rejected") {
      console.error("Shop page generation failed:", shopResult.reason);
    }

    return new Response(
      JSON.stringify({ home_html: homeHtml, shop_html: shopHtml }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});