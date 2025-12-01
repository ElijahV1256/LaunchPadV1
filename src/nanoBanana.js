export async function generateNanoDesign(prompt, type) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const res = await fetch(
    `${supabaseUrl}/functions/v1/generateNanoBanana`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt, type })
    }
  );

  return await res.json();
}
