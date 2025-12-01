import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const GEMINI_API_KEY = Deno.env.get('NANOBANANA_API_KEY');
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { prompt, type } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: prompt' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!GEMINI_API_KEY) {
      console.error('NANOBANANA_API_KEY (Gemini API key) is not configured');
      return new Response(
        JSON.stringify({ error: 'NanoBanana API key not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('Calling Gemini image generation API with prompt length:', prompt.length, 'type:', type);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt }
          ]
        }],
        generationConfig: {
          responseModalities: ['IMAGE'],
          imageConfig: {
            aspectRatio: '1:1',
            imageSize: '2K'
          }
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: `Gemini API error: ${response.status} ${errorText}` }),
        {
          status: response.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const result = await response.json();
    console.log('Gemini API response structure:', Object.keys(result));

    // Extract the image data from Gemini's response
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
      const parts = result.candidates[0].content.parts;
      const imagePart = parts.find((part: any) => part.inlineData);
      
      if (imagePart && imagePart.inlineData) {
        const imageData = imagePart.inlineData.data;
        const mimeType = imagePart.inlineData.mimeType;
        
        // Convert to data URL
        const imageUrl = `data:${mimeType};base64,${imageData}`;
        
        console.log('Successfully generated image');
        
        return new Response(
          JSON.stringify({ imageUrl }),
          {
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
            },
          }
        );
      }
    }

    console.error('No image data found in response:', JSON.stringify(result));
    return new Response(
      JSON.stringify({ error: 'No image data in response' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in generateNanoBanana function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});