import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

const LOGO_STYLES = [
  { name: "Minimal Wordmark", desc: "Clean typographic logo with subtle styling", style: "a minimal wordmark/typographic logo. Focus on elegant letter spacing, a clean sans-serif or geometric typeface, and subtle styling like a single accent stroke or color highlight on one letter. No icon." },
  { name: "Lettermark Icon", desc: "Bold single-letter monogram with geometric shape", style: "a bold lettermark/monogram logo using the first letter of the business name inside a simple geometric shape (circle, square, or hexagon). The letter should be stylized and modern." },
  { name: "Abstract Symbol", desc: "Geometric abstract mark with wordmark", style: "an abstract geometric symbol paired with the business name in clean text below or beside it. The symbol should be simple, memorable, and suggest the industry without being literal." },
  { name: "Icon + Text", desc: "Simple line icon paired with business name", style: "a simple line-art icon related to the industry paired with the business name. The icon should be minimal with consistent stroke width, like icons from Stripe or Linear." },
  { name: "Emblem Style", desc: "Modern contained badge or emblem design", style: "a modern emblem or badge-style logo with the business name integrated into a clean geometric container. Not ornate — think modern sports brand or tech startup emblem." },
  { name: "Stacked Layout", desc: "Vertically stacked icon over text", style: "a vertically stacked logo with a small geometric icon or symbol on top and the business name below in clean uppercase or lowercase letters. Balanced and centered." },
];

function buildPrompt(businessName: string, industry: string, primaryColor: string, styleDirective: string, businessDescription?: string, brandPersonality?: string): string {
  const parts = [
    `Create ${styleDirective}`,
    `Business name: "${businessName}".`,
    `Industry: ${industry}.`,
    businessDescription ? `About: ${businessDescription}.` : "",
    brandPersonality ? `Brand personality: ${brandPersonality}.` : "",
    `Primary brand color: ${primaryColor}.`,
    "Requirements:",
    "- Pure white background, no textures or patterns",
    "- Flat vector style, no gradients, no shadows, no 3D effects, no glow",
    "- Maximum 2 colors (primary + one neutral or white)",
    "- Must look professional, polished, and scalable to any size",
    "- Inspired by brands like Stripe, Linear, Notion, Vercel — confident and minimal",
    "- No clip art, no stock imagery, no decorative flourishes",
    "- The result should look like a real logo designed by a top agency",
  ];
  return parts.filter(Boolean).join("\n");
}

async function generateSingleLogo(
  openaiApiKey: string,
  prompt: string,
): Promise<string | null> {
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "medium",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("GPT Image API error:", errorText);
    return null;
  }

  const data = await response.json();
  return data.data?.[0]?.b64_json || null;
}

async function uploadToStorage(
  supabase: ReturnType<typeof createClient>,
  base64Data: string,
  fileName: string,
): Promise<string | null> {
  const binaryStr = atob(base64Data);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const { error } = await supabase.storage
    .from("logos")
    .upload(fileName, bytes.buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (error) {
    console.error("Storage upload error:", error);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from("logos")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { businessName, industry, brandColors, businessDescription, brandPersonality, regenerate } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Generating logos for:", businessName, "using gpt-image-1");

    const primaryColor = brandColors?.primary || "#2563eb";
    const timestamp = Date.now();
    const safeBusinessName = businessName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();

    const stylesToUse = regenerate ? [LOGO_STYLES[Math.floor(Math.random() * LOGO_STYLES.length)]] : LOGO_STYLES;

    const concepts: LogoConcept[] = [];

    for (let i = 0; i < stylesToUse.length; i++) {
      const style = stylesToUse[i];
      console.log(`Generating: ${style.name} (${i + 1}/${stylesToUse.length})`);

      const prompt = buildPrompt(
        businessName,
        industry || "general business",
        primaryColor,
        style.style,
        businessDescription,
        brandPersonality,
      );

      try {
        const base64 = await generateSingleLogo(openaiApiKey, prompt);
        if (!base64) continue;

        const fileName = `generated/${safeBusinessName}/${timestamp}-${i}.png`;
        const publicUrl = await uploadToStorage(supabase, base64, fileName);

        if (publicUrl) {
          concepts.push({
            name: style.name,
            description: style.desc,
            imageUrl: publicUrl,
            prompt,
          });
          console.log(`${style.name} generated and uploaded`);
        }
      } catch (error) {
        console.error(`Error generating ${style.name}:`, error);
      }
    }

    if (concepts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate logos. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`Generated ${concepts.length} logo concepts with gpt-image-1`);

    return new Response(
      JSON.stringify({ concepts }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to generate logos" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
