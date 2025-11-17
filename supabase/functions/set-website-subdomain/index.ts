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
    const { websiteId, subdomain } = await req.json();

    if (!websiteId || !subdomain) {
      return new Response(
        JSON.stringify({ error: "Website ID and subdomain are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, "");

    if (cleanSubdomain.length < 3) {
      return new Response(
        JSON.stringify({ error: "Subdomain must be at least 3 characters" }),
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

    const { data: existing, error: checkError } = await supabaseClient
      .from("websites")
      .select("id")
      .eq("subdomain", cleanSubdomain)
      .neq("id", websiteId)
      .maybeSingle();

    if (existing) {
      return new Response(
        JSON.stringify({ error: "Subdomain already taken" }),
        {
          status: 409,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { error: updateError } = await supabaseClient
      .from("websites")
      .update({ subdomain: cleanSubdomain })
      .eq("id", websiteId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ subdomain: cleanSubdomain }),
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