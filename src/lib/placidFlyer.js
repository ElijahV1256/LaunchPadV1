export async function generatePlacidFlyer(templateId, fields) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const res = await fetch(
    `${supabaseUrl}/functions/v1/generatePlacidFlyer`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, fields })
    }
  );

  return await res.json();
}
