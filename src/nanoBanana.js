export async function generateNanoDesign(prompt, type) {
  const res = await fetch(
    "https://fnmuycgxfruepjavtbrz.supabase.co/functions/v1/generateNanoBanana",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, type })
    }
  );

  return await res.json();
}
