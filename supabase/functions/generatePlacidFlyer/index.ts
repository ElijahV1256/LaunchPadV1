import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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
    const { templateId, fields } = await req.json();

    if (!templateId || !fields) {
      throw new Error("Missing templateId or fields");
    }

    const placidApiToken = Deno.env.get("PLACID_API_TOKEN");
    if (!placidApiToken) {
      throw new Error("PLACID_API_TOKEN not configured");
    }

    const placidResponse = await fetch(
      `https://api.placid.app/api/rest/${templateId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${placidApiToken}`,
        },
        body: JSON.stringify({
          layers: fields,
          create_now: true,
        }),
      }
    );

    if (!placidResponse.ok) {
      const errorText = await placidResponse.text();
      throw new Error(`Placid API error: ${errorText}`);
    }

    const placidData = await placidResponse.json();

    return new Response(
      JSON.stringify({
        imageUrl: placidData.image_url || placidData.url,
        data: placidData,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error in generatePlacidFlyer:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
        details: error.stack,
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
