import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

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
    const { websiteId } = await req.json();

    if (!websiteId) {
      return new Response(
        JSON.stringify({ error: "Website ID is required" }),
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

    const { data: website, error } = await supabaseClient
      .from("websites")
      .select("*")
      .eq("id", websiteId)
      .single();

    if (error || !website) {
      return new Response(
        JSON.stringify({ error: "Website not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!website.subdomain) {
      return new Response(
        JSON.stringify({ error: "Subdomain must be set before publishing" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const publishedUrl = `https://${website.subdomain}.launchpadai.com`;

    const { error: updateError } = await supabaseClient
      .from("websites")
      .update({
        published_url: publishedUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", websiteId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ url: publishedUrl }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
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