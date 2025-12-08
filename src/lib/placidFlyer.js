export async function generatePlacidFlyer(templateId, fields) {
  const supabaseUrl = "https://pkravblnlyqtftjeezmr.supabase.co";

  const res = await fetch(
    `${supabaseUrl}/functions/v1/generatePlacidFlyer`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, fields })
    }
  );

  const data = await res.json();

  console.log("Placid flyer result:", data);

  if (!res.ok) {
    throw new Error(data.error || "Failed to generate flyer");
  }

  return data;
}
