export async function generateNanoDesign(prompt, type) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(
    `${supabaseUrl}/functions/v1/generateNanoBanana`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ prompt, type })
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error('NanoBanana API error:', error);
    throw new Error(`Failed to generate design: ${res.status} ${error}`);
  }

  return await res.json();
}
