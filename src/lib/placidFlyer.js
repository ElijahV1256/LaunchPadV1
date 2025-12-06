export async function generatePlacidFlyer(templateId, fields) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log("Supabase URL:", supabaseUrl);
  console.log("Calling generatePlacidFlyer with template:", templateId);

  if (!supabaseUrl) {
    throw new Error("VITE_SUPABASE_URL is not defined");
  }

  try {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/generatePlacidFlyer`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ templateId, fields })
      }
    );

    const data = await res.json();

    console.log("Placid flyer result:", data);

    if (!res.ok) {
      throw new Error(data.error || "Failed to generate flyer");
    }

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}
