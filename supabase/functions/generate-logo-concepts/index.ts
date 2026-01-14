import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

const svgToDataUrl = (svg: string): string => {
  const encoded = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${encoded}`;
};

const extractSvg = (content: string): string | null => {
  const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/i);
  if (svgMatch) {
    let svg = svgMatch[0];
    if (!svg.includes('xmlns')) {
      svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return svg;
  }
  return null;
};

const getIndustryIcon = (industry: string): string => {
  const lower = industry.toLowerCase();
  if (lower.includes('tech') || lower.includes('software') || lower.includes('digital')) {
    return 'circuit node, hexagon grid, or abstract data flow';
  }
  if (lower.includes('health') || lower.includes('medical') || lower.includes('wellness')) {
    return 'heart, shield with cross, or wellness leaf';
  }
  if (lower.includes('finance') || lower.includes('bank') || lower.includes('invest')) {
    return 'upward arrow, bar chart, or coin stack';
  }
  if (lower.includes('food') || lower.includes('restaurant') || lower.includes('cafe')) {
    return 'fork and spoon, chef hat, or flame';
  }
  if (lower.includes('fitness') || lower.includes('gym') || lower.includes('sport')) {
    return 'dumbbell, running figure, or energy bolt';
  }
  if (lower.includes('education') || lower.includes('school') || lower.includes('learn')) {
    return 'book, graduation cap, or lightbulb';
  }
  if (lower.includes('real estate') || lower.includes('property') || lower.includes('home')) {
    return 'house, key, or building';
  }
  if (lower.includes('beauty') || lower.includes('salon') || lower.includes('spa')) {
    return 'flower, butterfly, or elegant curves';
  }
  if (lower.includes('consult') || lower.includes('business') || lower.includes('service')) {
    return 'handshake, ascending steps, or target';
  }
  if (lower.includes('construct') || lower.includes('build') || lower.includes('architect')) {
    return 'crane, hard hat, or geometric building';
  }
  if (lower.includes('legal') || lower.includes('law') || lower.includes('attorney')) {
    return 'scales of justice, pillar, or gavel';
  }
  if (lower.includes('creative') || lower.includes('design') || lower.includes('art')) {
    return 'paintbrush, palette, or creative spiral';
  }
  if (lower.includes('auto') || lower.includes('car') || lower.includes('vehicle')) {
    return 'speedometer, wheel, or sleek car silhouette';
  }
  if (lower.includes('travel') || lower.includes('tourism') || lower.includes('hotel')) {
    return 'plane, globe, or compass';
  }
  return 'abstract geometric shape representing growth and innovation';
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { businessName, industry, brandColors } = await req.json();

    if (!businessName || !industry) {
      return new Response(
        JSON.stringify({ error: "businessName and industry are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Generating logos for:', businessName, 'in', industry);

    const primary = brandColors?.primary || '#2563eb';
    const secondary = brandColors?.secondary || '#1e40af';
    const accent = brandColors?.accent || '#60a5fa';
    const industryIcon = getIndustryIcon(industry);

    const systemPrompt = `You are an expert SVG logo designer. Output ONLY raw SVG code, no markdown, no explanation, no code blocks.

STRICT SVG REQUIREMENTS:
- Start with: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
- End with: </svg>
- NO text elements, NO <text> tags, NO letters
- Use ONLY: <circle>, <rect>, <path>, <polygon>, <ellipse>, <line>, <g>
- Center the design (main elements around x=50, y=50)
- Keep it SIMPLE: 3-8 elements maximum
- Use the exact hex colors provided
- Make it look PROFESSIONAL and MODERN

Example of good simple SVG:
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <circle cx="50" cy="50" r="40" fill="#2563eb"/>
  <path d="M30 50 L50 30 L70 50 L50 70 Z" fill="#ffffff"/>
</svg>`;

    const variations = [
      {
        name: 'Circle Badge',
        prompt: `Create a circular badge logo. Use a filled circle as the base with ${primary}, then add a simple iconic symbol inside using ${secondary} or white. The symbol should represent: ${industryIcon}. Keep the inner icon simple with basic shapes.`
      },
      {
        name: 'Geometric Stack',
        prompt: `Create a logo using 2-3 stacked or overlapping geometric shapes (squares, triangles, or hexagons). Use ${primary} for the main shape, ${secondary} for overlapping elements. Add slight transparency (opacity="0.8") where shapes overlap. Represent: ${industryIcon} through abstract geometry.`
      },
      {
        name: 'Abstract Mark',
        prompt: `Create an abstract logomark using curved paths. Think of the Airbnb or Spotify style - flowing, modern curves. Use ${primary} as the main color. The curves should subtly suggest: ${industryIcon}. Use 2-4 path elements maximum.`
      },
      {
        name: 'Monogram Shield',
        prompt: `Create a shield or badge shape filled with ${primary}. Inside, add a simple geometric icon in white or ${accent} that represents: ${industryIcon}. The shield can be a rounded rectangle, hexagon, or classic shield shape.`
      },
      {
        name: 'Minimal Icon',
        prompt: `Create an ultra-minimal single-element icon. Use just ONE or TWO shapes to represent: ${industryIcon}. Fill with ${primary}. Think of how Apple or Nike logos use extreme simplicity. The negative space is as important as the filled space.`
      },
      {
        name: 'Split Design',
        prompt: `Create a logo split into two complementary halves or sections. Use ${primary} for one part and ${secondary} for the other. The two parts together should form a cohesive symbol representing: ${industryIcon}. Think yin-yang style balance.`
      }
    ];

    const concepts: LogoConcept[] = [];

    for (const variation of variations) {
      console.log(`Generating: ${variation.name}`);

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Business: "${businessName}" in ${industry} industry.\n\n${variation.prompt}\n\nOutput the SVG now:` }
            ],
            temperature: 0.7,
            max_tokens: 1500,
          }),
        });

        if (!response.ok) {
          console.error(`API error for ${variation.name}:`, await response.text());
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const svg = extractSvg(content);

        if (svg) {
          concepts.push({
            name: variation.name,
            description: `${variation.name} logo for ${businessName}`,
            imageUrl: svgToDataUrl(svg),
            prompt: variation.prompt,
          });
          console.log(`${variation.name} generated`);
        }
      } catch (error) {
        console.error(`Error for ${variation.name}:`, error);
      }
    }

    if (concepts.length === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to generate logos. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ concepts }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate logos' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});