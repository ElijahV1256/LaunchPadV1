import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

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
  notes?: string;
}

interface RequestBody {
  userId: string;
  ideaKey: string;
  businessPackage: BusinessPackage;
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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId, ideaKey, businessPackage, notes } = await req.json() as RequestBody;

    if (!userId || !ideaKey || !businessPackage) {
      return new Response(
        JSON.stringify({ error: "userId, ideaKey, and businessPackage are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { data: existingRequest, error: checkError } = await supabase
      .from("pro_website_requests")
      .select("id, status")
      .eq("user_id", userId)
      .eq("idea_key", ideaKey)
      .maybeSingle();

    if (checkError) {
      console.error("Error checking existing request:", checkError);
    }

    let requestId: string;

    if (existingRequest) {
      const { data: updatedRequest, error: updateError } = await supabase
        .from("pro_website_requests")
        .update({
          business_package: businessPackage,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRequest.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating request:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update request", details: updateError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      requestId = updatedRequest.id;
    } else {
      const { data: newRequest, error: insertError } = await supabase
        .from("pro_website_requests")
        .insert({
          user_id: userId,
          idea_key: ideaKey,
          business_package: businessPackage,
          notes: notes || null,
          status: "submitted",
          price: 600,
        })
        .select()
        .single();

      if (insertError) {
        console.error("Error creating request:", insertError);
        return new Response(
          JSON.stringify({ error: "Failed to create request", details: insertError.message }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      requestId = newRequest.id;
    }

    const n8nWebhookUrl = Deno.env.get("N8N_PRO_WEBSITE_WEBHOOK_URL");
    if (n8nWebhookUrl) {
      try {
        const webhookPayload = {
          requestId,
          userId,
          ideaKey,
          businessPackage,
          notes: notes || "",
          timestamp: new Date().toISOString(),
        };

        const webhookResponse = await fetch(n8nWebhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(webhookPayload),
        });

        if (!webhookResponse.ok) {
          console.error("n8n webhook failed:", await webhookResponse.text());
        } else {
          console.log("n8n webhook triggered successfully");
        }
      } catch (webhookError) {
        console.error("Error triggering n8n webhook:", webhookError);
      }
    } else {
      console.log("N8N_PRO_WEBSITE_WEBHOOK_URL not configured, skipping webhook");
    }

    return new Response(
      JSON.stringify({
        success: true,
        requestId,
        message: "Professional website request submitted successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});