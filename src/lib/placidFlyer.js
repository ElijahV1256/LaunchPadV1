export async function generatePlacidFlyer(templateId, fields) {
  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generatePlacidFlyer`,
    {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
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
}
