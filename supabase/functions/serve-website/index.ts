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

    // Query by either ID or subdomain
    let query = supabaseClient
      .from("managed_websites")
      .select(`
        *,
        website_content(*),
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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

    // Check if html_code exists in the website object
    if (!website.html_code) {
      return new Response(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(website.brand_name || 'Website')}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .container {
      text-align: center;
      padding: 2rem;
      background: white;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      max-width: 500px;
    }
    h1 { color: #333; margin: 0 0 1rem 0; }
    p { color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(website.brand_name || 'Coming Soon')}</h1>
    <p>This website is still being set up. Please check back soon!</p>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html" },
        }
      );
    }

    // Serve the actual HTML content
    return new Response(website.html_code, {
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