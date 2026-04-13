import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

function buildHtml(website: any, content: any): string {
  const brand = escapeHtml(website.brand_name || 'My Business');
  const primary = website.primary_color || '#2979FF';
  const secondary = website.secondary_color || '#06D6A0';
  const fontHeading = website.font_heading || 'Inter';
  const fontBody = website.font_body || 'Inter';

  const home = content?.home || {};
  const hero = home.hero || {};
  const services = home.features_or_services?.items || [];
  const faqs = home.faq?.items || [];
  const contact = home.contact || {};
  const footer = home.footer || {};
  const socialProof = home.social_proof || {};

  const servicesHtml = services
    .filter((s: any) => s.title)
    .map(
      (s: any) => `
      <div class="service-card">
        <h3>${escapeHtml(s.title)}</h3>
        <p>${escapeHtml(s.desc || '')}</p>
        ${s.price_optional ? `<span class="price">${escapeHtml(s.price_optional)}</span>` : ''}
      </div>`
    )
    .join('');

  const faqHtml = faqs
    .filter((f: any) => f.q)
    .map(
      (f: any) => `
      <details class="faq-item">
        <summary>${escapeHtml(f.q)}</summary>
        <p>${escapeHtml(f.a || '')}</p>
      </details>`
    )
    .join('');

  const bulletsHtml = (socialProof.bullets || [])
    .filter((b: string) => b)
    .map((b: string) => `<span class="proof-badge">${escapeHtml(b)}</span>`)
    .join('');

  const testimonialsHtml = (socialProof.testimonial_snippets || [])
    .filter((t: string) => t)
    .map((t: string) => `<blockquote class="testimonial">"${escapeHtml(t)}"</blockquote>`)
    .join('');

  const contactItems: string[] = [];
  if (contact.phone) contactItems.push(`<p>Phone: <a href="tel:${escapeHtml(contact.phone)}">${escapeHtml(contact.phone)}</a></p>`);
  if (contact.email) contactItems.push(`<p>Email: <a href="mailto:${escapeHtml(contact.email)}">${escapeHtml(contact.email)}</a></p>`);
  if (contact.city) contactItems.push(`<p>Location: ${escapeHtml(contact.city)}</p>`);
  if (contact.service_area) contactItems.push(`<p>Service Area: ${escapeHtml(contact.service_area)}</p>`);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontHeading)}:wght@400;600;700&family=${encodeURIComponent(fontBody)}:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --primary: ${primary};
      --secondary: ${secondary};
      --font-heading: '${fontHeading}', system-ui, sans-serif;
      --font-body: '${fontBody}', system-ui, sans-serif;
    }

    body {
      font-family: var(--font-body);
      color: #1a1a2e;
      line-height: 1.6;
      background: #fff;
    }

    .container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

    /* NAV */
    nav {
      padding: 20px 0;
      border-bottom: 1px solid #eee;
      position: sticky;
      top: 0;
      background: rgba(255,255,255,0.95);
      backdrop-filter: blur(8px);
      z-index: 100;
    }
    nav .container { display: flex; justify-content: space-between; align-items: center; }
    .nav-brand {
      font-family: var(--font-heading);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--primary);
      text-decoration: none;
    }
    .nav-cta {
      background: var(--primary);
      color: #fff;
      padding: 10px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.9rem;
      transition: opacity 0.2s;
    }
    .nav-cta:hover { opacity: 0.9; }

    /* HERO */
    .hero {
      padding: 80px 0 60px;
      text-align: center;
    }
    .hero h1 {
      font-family: var(--font-heading);
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 700;
      color: #1a1a2e;
      margin-bottom: 16px;
      line-height: 1.2;
    }
    .hero p {
      font-size: 1.15rem;
      color: #555;
      max-width: 600px;
      margin: 0 auto 32px;
    }
    .hero-cta {
      display: inline-block;
      background: var(--primary);
      color: #fff;
      padding: 14px 36px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.05rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .hero-cta:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    }

    /* SOCIAL PROOF */
    .social-proof {
      padding: 40px 0;
      text-align: center;
    }
    .proof-badges { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-bottom: 24px; }
    .proof-badge {
      background: #f0f4ff;
      color: var(--primary);
      padding: 8px 20px;
      border-radius: 100px;
      font-size: 0.9rem;
      font-weight: 500;
    }
    .testimonials { display: flex; flex-wrap: wrap; justify-content: center; gap: 24px; }
    .testimonial {
      background: #f9fafb;
      border-left: 3px solid var(--secondary);
      padding: 20px 24px;
      border-radius: 0 8px 8px 0;
      max-width: 400px;
      font-style: italic;
      color: #444;
    }

    /* SERVICES */
    .services {
      padding: 60px 0;
    }
    .services h2 {
      font-family: var(--font-heading);
      font-size: 2rem;
      text-align: center;
      margin-bottom: 40px;
      color: #1a1a2e;
    }
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    .service-card {
      background: #f9fafb;
      border: 1px solid #eee;
      border-radius: 12px;
      padding: 28px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .service-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0,0,0,0.08);
    }
    .service-card h3 {
      font-family: var(--font-heading);
      font-size: 1.15rem;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a2e;
    }
    .service-card p { color: #555; font-size: 0.95rem; margin-bottom: 12px; }
    .service-card .price {
      display: inline-block;
      background: var(--secondary);
      color: #fff;
      padding: 4px 14px;
      border-radius: 100px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    /* FAQ */
    .faq-section {
      padding: 60px 0;
      background: #f9fafb;
    }
    .faq-section h2 {
      font-family: var(--font-heading);
      font-size: 2rem;
      text-align: center;
      margin-bottom: 40px;
      color: #1a1a2e;
    }
    .faq-list { max-width: 700px; margin: 0 auto; }
    .faq-item {
      border-bottom: 1px solid #e0e0e0;
      padding: 16px 0;
    }
    .faq-item summary {
      font-weight: 600;
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 1.05rem;
      color: #1a1a2e;
    }
    .faq-item summary::after { content: '+'; font-size: 1.3rem; color: var(--primary); }
    .faq-item[open] summary::after { content: '-'; }
    .faq-item p { padding-top: 12px; color: #555; }

    /* CONTACT */
    .contact-section {
      padding: 60px 0;
      text-align: center;
    }
    .contact-section h2 {
      font-family: var(--font-heading);
      font-size: 2rem;
      margin-bottom: 24px;
      color: #1a1a2e;
    }
    .contact-info {
      display: inline-block;
      text-align: left;
      background: #f9fafb;
      padding: 28px 36px;
      border-radius: 12px;
      border: 1px solid #eee;
    }
    .contact-info p { margin-bottom: 8px; color: #444; }
    .contact-info a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .contact-info a:hover { text-decoration: underline; }

    /* FOOTER */
    footer {
      background: #1a1a2e;
      color: #aaa;
      padding: 40px 0;
      text-align: center;
    }
    footer .brand-name {
      font-family: var(--font-heading);
      font-size: 1.2rem;
      font-weight: 700;
      color: #fff;
      margin-bottom: 8px;
    }
    footer p { font-size: 0.9rem; margin-bottom: 4px; }

    @media (max-width: 640px) {
      .hero { padding: 48px 0 36px; }
      .services, .faq-section, .contact-section { padding: 40px 0; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="container">
      <a href="#" class="nav-brand">${brand}</a>
      ${hero.cta_text ? `<a href="${escapeHtml(hero.cta_link || '#contact')}" class="nav-cta">${escapeHtml(hero.cta_text)}</a>` : ''}
    </div>
  </nav>

  <section class="hero">
    <div class="container">
      ${hero.headline ? `<h1>${escapeHtml(hero.headline)}</h1>` : `<h1>Welcome to ${brand}</h1>`}
      ${hero.subheadline ? `<p>${escapeHtml(hero.subheadline)}</p>` : ''}
      ${hero.cta_text ? `<a href="${escapeHtml(hero.cta_link || '#contact')}" class="hero-cta">${escapeHtml(hero.cta_text)}</a>` : ''}
    </div>
  </section>

  ${bulletsHtml || testimonialsHtml ? `
  <section class="social-proof">
    <div class="container">
      ${bulletsHtml ? `<div class="proof-badges">${bulletsHtml}</div>` : ''}
      ${testimonialsHtml ? `<div class="testimonials">${testimonialsHtml}</div>` : ''}
    </div>
  </section>` : ''}

  ${servicesHtml ? `
  <section class="services">
    <div class="container">
      <h2>${website.business_type === 'ecommerce' ? 'What We Offer' : 'Our Services'}</h2>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </div>
  </section>` : ''}

  ${faqHtml ? `
  <section class="faq-section">
    <div class="container">
      <h2>Frequently Asked Questions</h2>
      <div class="faq-list">
        ${faqHtml}
      </div>
    </div>
  </section>` : ''}

  ${contactItems.length > 0 ? `
  <section class="contact-section" id="contact">
    <div class="container">
      <h2>Get in Touch</h2>
      <div class="contact-info">
        ${contactItems.join('\n        ')}
      </div>
    </div>
  </section>` : ''}

  <footer>
    <div class="container">
      <div class="brand-name">${brand}</div>
      ${footer.short_blurb ? `<p>${escapeHtml(footer.short_blurb)}</p>` : ''}
      <p style="margin-top: 16px; font-size: 0.8rem; color: #666;">&copy; ${new Date().getFullYear()} ${brand}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const websiteId = url.searchParams.get('id');
    const subdomain = url.searchParams.get('subdomain');

    if (!websiteId && !subdomain) {
      return new Response(
        JSON.stringify({ error: "Website ID or subdomain is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    let query = supabaseClient
      .from("managed_websites")
      .select(`
        *,
        managed_website_content(*),
        website_payments(*)
      `);

    if (websiteId) {
      query = query.eq('id', websiteId);
    } else if (subdomain) {
      query = query.eq('domain_status->>subdomain', subdomain);
    }

    const { data: website, error } = await query
      .eq('publish_status', 'published')
      .maybeSingle();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({ error: "Database error" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!website) {
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Website Not Found</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: #f0f4f8;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      max-width: 500px;
    }
    h1 { color: #333; margin: 0 0 1rem 0; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Website Not Found</h1>
    <p>This website hasn't been published yet or doesn't exist.</p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    const contentRow = Array.isArray(website.managed_website_content)
      ? website.managed_website_content[0]
      : website.managed_website_content;

    const html = buildHtml(website, contentRow);

    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
