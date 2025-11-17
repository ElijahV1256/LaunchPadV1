import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "npm:openai@4.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  userId?: string;
  ideaKey?: string;
  openaiApiKey?: string;
  prompt?: string;
  context?: string;
  businessName?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: RequestBody = await req.json();
    const { userId, ideaKey, openaiApiKey, prompt, context, businessName } = body;

    // Handle AI suggestion generation for input fields
    if (openaiApiKey && prompt) {
      const openai = new OpenAI({ apiKey: openaiApiKey });

      const systemPrompt = `You are a helpful AI assistant for entrepreneurs. Generate a brief, practical suggestion based on the user's request.
IMPORTANT: Always base your answer on the provided context. Keep responses very short - just a few words or one short phrase. No explanations or extra text.`;

      let userPrompt = prompt;
      if (context) {
        userPrompt = `CONTEXT: ${context}\n\nBased on the context above, ${prompt}`;
      }
      if (businessName) {
        userPrompt = `BUSINESS NAME: ${businessName}\n\nBased on this business name, ${prompt}`;
      }

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 50,
      });

      const suggestion = completion.choices[0]?.message?.content?.trim() || "";

      return new Response(
        JSON.stringify({ suggestion }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Handle reminder generation (existing functionality)
    if (!userId || !ideaKey) {
      return new Response(
        JSON.stringify({ error: "userId and ideaKey are required for reminder generation" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [plEntriesRes, goalsRes, firstDollarRes] = await Promise.all([
      supabase
        .from("profit_loss_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("idea_key", ideaKey)
        .order("entry_date", { ascending: false })
        .limit(10),
      supabase
        .from("business_goals")
        .select("*")
        .eq("user_id", userId)
        .eq("idea_key", ideaKey),
      supabase
        .from("first_dollar")
        .select("*")
        .eq("user_id", userId)
        .eq("idea_key", ideaKey)
        .maybeSingle(),
    ]);

    const suggestions = [];

    if (goalsRes.data && goalsRes.data.length > 0) {
      for (const goal of goalsRes.data) {
        const progress = (goal.current_value / goal.target_value) * 100;
        const daysLeft = Math.ceil(
          (new Date(goal.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        if (progress < 25 && daysLeft <= 7) {
          suggestions.push({
            user_id: userId,
            idea_key: ideaKey,
            reminder_type: "ai_generated",
            title: `${goal.goal_type.charAt(0).toUpperCase() + goal.goal_type.slice(1)} Goal Behind Schedule`,
            message: `You're at ${progress.toFixed(1)}% of your ${goal.period} ${goal.goal_type} goal with only ${daysLeft} days left. Consider increasing your marketing efforts or adjusting your target.`,
            priority: "high",
            is_read: false,
            is_dismissed: false,
          });
        } else if (progress >= 80 && progress < 100) {
          suggestions.push({
            user_id: userId,
            idea_key: ideaKey,
            reminder_type: "ai_generated",
            title: `Almost There!`,
            message: `You're at ${progress.toFixed(1)}% of your ${goal.goal_type} goal. Keep pushing, you're so close to hitting your target!`,
            priority: "medium",
            is_read: false,
            is_dismissed: false,
          });
        } else if (progress >= 100) {
          suggestions.push({
            user_id: userId,
            idea_key: ideaKey,
            reminder_type: "ai_generated",
            title: `Goal Achieved!`,
            message: `Congratulations! You've reached your ${goal.goal_type} goal. Consider setting a new, higher target to keep the momentum going.`,
            priority: "low",
            is_read: false,
            is_dismissed: false,
          });
        }
      }
    }

    if (plEntriesRes.data && plEntriesRes.data.length > 0) {
      const last7Days = plEntriesRes.data.filter(
        (e) =>
          new Date(e.entry_date).getTime() >
          Date.now() - 7 * 24 * 60 * 60 * 1000
      );
      const income = last7Days
        .filter((e) => e.entry_type === "income")
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const expenses = last7Days
        .filter((e) => e.entry_type === "expense")
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);

      if (expenses > income && income > 0) {
        suggestions.push({
          user_id: userId,
          idea_key: ideaKey,
          reminder_type: "ai_generated",
          title: "Expenses Exceeding Income",
          message: `In the last 7 days, your expenses ($${expenses.toFixed(2)}) have exceeded your income ($${income.toFixed(2)}). Review your spending or focus on increasing revenue.`,
          priority: "high",
          is_read: false,
          is_dismissed: false,
        });
      }

      if (income > 0 && last7Days.filter((e) => e.entry_type === "income").length >= 3) {
        suggestions.push({
          user_id: userId,
          idea_key: ideaKey,
          reminder_type: "ai_generated",
          title: "Great Sales Week!",
          message: `You've recorded ${last7Days.filter((e) => e.entry_type === "income").length} sales in the past week totaling $${income.toFixed(2)}. Keep up the great work!`,
          priority: "low",
          is_read: false,
          is_dismissed: false,
        });
      }
    }

    if (firstDollarRes.data) {
      const completedTasks = firstDollarRes.data.completed?.length || 0;
      const totalTasks = 10;

      if (completedTasks < 5 && completedTasks > 0) {
        suggestions.push({
          user_id: userId,
          idea_key: ideaKey,
          reminder_type: "ai_generated",
          title: "Complete Your First Dollar Plan",
          message: `You've completed ${completedTasks} out of ${totalTasks} tasks in your First Dollar plan. Keep going to get your first customer!`,
          priority: "medium",
          is_read: false,
          is_dismissed: false,
          action_url: `/first-revenue?ideaKey=${ideaKey}`,
        });
      }
    }

    const existingReminders = await supabase
      .from("reminders")
      .select("title")
      .eq("user_id", userId)
      .eq("idea_key", ideaKey)
      .eq("is_dismissed", false)
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const existingTitles = new Set(
      existingReminders.data?.map((r) => r.title) || []
    );
    const newSuggestions = suggestions.filter(
      (s) => !existingTitles.has(s.title)
    );

    if (newSuggestions.length > 0) {
      const { error: insertError } = await supabase
        .from("reminders")
        .insert(newSuggestions);

      if (insertError) {
        console.error("Failed to insert reminders:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        suggestionsGenerated: newSuggestions.length,
        suggestions: newSuggestions,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error generating AI suggestions:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
