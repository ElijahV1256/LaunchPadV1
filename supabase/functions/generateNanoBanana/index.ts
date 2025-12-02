import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    console.log('Generating image with prompt:', prompt, 'type:', type);

    // Generate a simple placeholder image based on the type
    const canvas = createPlaceholderImage(prompt, type);

    return new Response(
      JSON.stringify({ imageUrl: canvas }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
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

function createPlaceholderImage(prompt: string, type: string): string {
  // Create a simple SVG placeholder image
  const colors = ['#2979FF', '#06D6A0', '#EF476F', '#FFA500', '#9D4EDD'];
  const bgColor = colors[Math.floor(Math.random() * colors.length)];
  const accentColor = colors[Math.floor(Math.random() * colors.length)];

  const promptSnippet = prompt.substring(0, 50);
  const typeLabel = type === 'flyer' ? 'Flyer' : 'Post';

  const svg = `
    <svg width="800" height="800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${accentColor};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="800" height="800" fill="url(#grad)"/>
      <rect x="50" y="50" width="700" height="150" fill="rgba(255,255,255,0.9)" rx="10"/>
      <rect x="50" y="250" width="700" height="500" fill="rgba(255,255,255,0.8)" rx="10"/>
      <text x="400" y="130" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle" fill="#1a1a2e">
        ${typeLabel} Design
      </text>
      <text x="400" y="400" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#666">
        Generated Design
      </text>
      <text x="400" y="450" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="#999">
        Based on: ${escapeXml(promptSnippet)}...
      </text>
    </svg>
  `;

  // Convert SVG to base64 data URL
  const base64 = btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}