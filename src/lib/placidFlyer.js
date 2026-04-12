export async function generatePlacidFlyer(templateId, fields) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  try {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/generatePlacidFlyer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({ templateId, fields })
      }
    );

    if (!res.ok) {
      let errorMsg = `Server returned ${res.status}`;
      try {
        const data = await res.json();
        errorMsg = data.error || data.message || errorMsg;
      } catch {
        // response wasn't JSON
      }
      throw new Error(errorMsg);
    }

    return await res.json();
  } catch (error) {
    throw new Error(`Failed to call Supabase function: ${error.message}`);
  }
}
