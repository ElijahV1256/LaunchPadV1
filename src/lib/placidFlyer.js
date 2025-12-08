export async function generatePlacidFlyer(templateId, fields) {
  // Use environment variable for Supabase URL
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  console.log("Calling generatePlacidFlyer with:", {
    url: `${supabaseUrl}/functions/v1/generatePlacidFlyer`,
    templateId,
    fields
  });

  try {
    const res = await fetch(
      `${supabaseUrl}/functions/v1/generatePlacidFlyer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ templateId, fields })
      }
    );

    console.log("Response status:", res.status);
    console.log("Response headers:", Object.fromEntries(res.headers.entries()));

    const data = await res.json();
    console.log("Placid flyer result:", data);

    if (!res.ok) {
      throw new Error(data.error || data.message || `Server returned ${res.status}`);
    }

    return data;
  } catch (error) {
    console.error("Fetch error in generatePlacidFlyer:", error);
    throw new Error(`Failed to call Supabase function: ${error.message}`);
  }
}
