import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

const platformContentFormats: Record<string, string> = {
  instagram:
    'Each content piece should be an Instagram caption with a strong hook first line, value in the middle, clear CTA at the end, and 5 relevant hashtags. Label them like "Post 1 — Educational", "Post 2 — Social Proof", "Post 3 — Offer".',
  meta_ads:
    'Each content piece should include: headline (under 40 chars), ad body copy (2-3 paragraphs), CTA button label, and an audience targeting note. Label them like "Ad 1 — Cold Audience", "Ad 2 — Warm Retarget", "Ad 3 — Lookalike".',
  tiktok:
    'Each content piece should be a 60-second video script broken into: Hook (0-3s), Middle/Value (4-50s), CTA (50-60s). Label them like "Video 1 — Problem/Solution", "Video 2 — Before/After", "Video 3 — Hot Take".',
  mass_text:
    'Each content piece should be an SMS message under 160 characters with a follow-up text message. Label them like "Text 1 — Initial Outreach", "Text 2 — Value Drop", "Text 3 — Urgency Close".',
  email:
    'Each content piece should include: subject line, short email body (3-4 paragraphs), and a PS line. Label them like "Email 1 — Welcome/Intro", "Email 2 — Value Bomb", "Email 3 — Direct Offer".',
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Authorization header required" }, 401);
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return jsonResponse({ error: "AI service not configured" }, 503);
    }

    const body = await req.json();
    const { platform, businessName, offer, targetCustomer, action } = body;

    if (!platform) {
      return jsonResponse({ error: "Platform is required" }, 400);
    }

    const contentFormat = platformContentFormats[platform] || "";

    if (action === "more_content") {
      const morePrompt = `You are Alex Hormozi. Generate 3 MORE unique content pieces for ${platform.replace("_", " ")} for a business called "${businessName || "the business"}" that offers "${offer || "their service"}" to "${targetCustomer || "their target market"}".

${contentFormat}

Return ONLY a JSON object with no markdown, no code fences:
{
  "content": [
    { "title": "label", "body": "full content" },
    { "title": "label", "body": "full content" },
    { "title": "label", "body": "full content" }
  ]
}

Make each piece completely different from typical content. Be specific, direct, and action-oriented. Write like Hormozi — blunt, value-first, no fluff.`;

      const anthropicResponse = await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": anthropicApiKey,
            "anthropic-version": "2023-06-01",
          },
          body: JSON.stringify({
            model: "claude-sonnet-4-20250514",
            max_tokens: 2000,
            temperature: 0.8,
            messages: [{ role: "user", content: morePrompt }],
          }),
        }
      );

      if (!anthropicResponse.ok) {
        const errText = await anthropicResponse.text();
        console.error("Anthropic error:", errText);
        return jsonResponse({ error: "AI service error" }, 500);
      }

      const aiData = await anthropicResponse.json();
      const rawText = aiData.content[0].text;
      const cleaned = rawText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);

      return jsonResponse({ content: parsed.content });
    }

    const prompt = `You are Alex Hormozi. Create a practical marketing strategy and content for a business called "${businessName || "the business"}" that offers "${offer || "their service"}" to "${targetCustomer || "their target market"}".

Platform: ${platform.replace("_", " ")}

${contentFormat}

Return ONLY a JSON object with no markdown, no code fences:
{
  "strategy": {
    "thisWeek": ["action 1", "action 2", "action 3"],
    "whoToTarget": "one paragraph describing their specific audience on this platform",
    "whatWorks": ["tip 1", "tip 2", "tip 3"],
    "thirtyDayGoal": "one clear measurable goal"
  },
  "content": [
    { "title": "label", "body": "full content" },
    { "title": "label", "body": "full content" },
    { "title": "label", "body": "full content" }
  ]
}

Keep everything short, direct, and actionable. No fluff. Write like Hormozi — blunt, value-first, clear next steps.`;

    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": anthropicApiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2500,
          temperature: 0.7,
          messages: [{ role: "user", content: prompt }],
        }),
      }
    );

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      console.error("Anthropic error:", errText);
      return jsonResponse({ error: "AI service error" }, 500);
    }

    const aiData = await anthropicResponse.json();
    const rawText = aiData.content[0].text;
    const cleaned = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse:", cleaned.substring(0, 200));
      return jsonResponse({ error: "Failed to parse AI response" }, 500);
    }

    const { data: existing } = await supabaseClient
      .from("marketing_playbook")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", platform)
      .maybeSingle();

    if (existing) {
      await supabaseClient
        .from("marketing_playbook")
        .update({
          business_name: businessName || "",
          strategy: parsed.strategy,
          content: parsed.content,
          generated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);
    } else {
      await supabaseClient.from("marketing_playbook").insert({
        user_id: user.id,
        business_name: businessName || "",
        platform,
        strategy: parsed.strategy,
        content: parsed.content,
      });
    }

    return jsonResponse({
      success: true,
      strategy: parsed.strategy,
      content: parsed.content,
    });
  } catch (error) {
    console.error("Error in generate-playbook:", error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Internal error" },
      500
    );
  }
});
