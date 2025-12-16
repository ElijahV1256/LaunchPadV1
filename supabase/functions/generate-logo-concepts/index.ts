import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface LogoConcept {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  wordmark: {
    font_style: string;
    font_suggestions: string[];
    weight: string;
    kerning: string;
  };
  icon: {
    metaphor: string;
    shape_language: string;
    description: string;
  };
  colors: {
    primary: string[];
    black: string[];
    white: string[];
  };
}

const fontFamilies: Record<string, string> = {
  'Inter': "'Inter', system-ui, -apple-system, sans-serif",
  'Sora': "'Sora', sans-serif",
  'Montserrat': "'Montserrat', sans-serif",
  'Poppins': "'Poppins', sans-serif",
  'Plus Jakarta Sans': "'Plus Jakarta Sans', sans-serif",
  'Manrope': "'Manrope', sans-serif",
  'DM Sans': "'DM Sans', sans-serif",
  'Outfit': "'Outfit', sans-serif",
  'Space Grotesk': "'Space Grotesk', sans-serif",
  'Raleway': "'Raleway', sans-serif",
  'Lato': "'Lato', sans-serif",
  'Open Sans': "'Open Sans', sans-serif",
  'Roboto': "'Roboto', sans-serif",
  'Source Sans Pro': "'Source Sans Pro', sans-serif",
  'Nunito': "'Nunito', sans-serif",
  'Work Sans': "'Work Sans', sans-serif",
};

function getWebSafeFont(fontSuggestions: string[]): string {
  for (const font of fontSuggestions) {
    if (fontFamilies[font]) {
      return fontFamilies[font];
    }
  }
  return "'Inter', system-ui, sans-serif";
}

function getFontWeight(weight: string): string {
  const weightMap: Record<string, string> = {
    '300': '300',
    '400': '400',
    '500': '500',
    '600': '600',
    '700': '700',
    '800': '800',
    'light': '300',
    'regular': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700',
    'extrabold': '800',
  };
  return weightMap[weight.toLowerCase()] || '600';
}

function getLetterSpacing(kerning: string): string {
  if (kerning.includes('tight')) return '-0.02em';
  if (kerning.includes('wide') || kerning.includes('extended')) return '0.05em';
  return '0';
}

function generateIconSVG(icon: { metaphor: string; shape_language: string; description: string }, primaryColor: string, accentColor: string): string {
  const isRounded = icon.shape_language === 'rounded' || icon.shape_language === 'mixed';
  const desc = icon.description.toLowerCase();
  const metaphor = icon.metaphor.toLowerCase();

  if (desc.includes('leaf') || metaphor.includes('leaf') || metaphor.includes('growth') || metaphor.includes('nature')) {
    return `<path d="M20 8c-4 0-8 4-10 8 2-1 5-2 8-2 2 0 4 .5 6 1.5C26 12 24 8 20 8z" fill="${primaryColor}" ${isRounded ? 'stroke-linejoin="round"' : ''}/>
            <path d="M18 24c0-4 2-8 6-10" stroke="${primaryColor}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  }

  if (desc.includes('star') || metaphor.includes('star') || metaphor.includes('spark') || metaphor.includes('excellence')) {
    return `<polygon points="20,6 23,14 32,14 25,20 28,28 20,23 12,28 15,20 8,14 17,14" fill="${primaryColor}"/>`;
  }

  if (desc.includes('shield') || metaphor.includes('shield') || metaphor.includes('protect') || metaphor.includes('trust') || metaphor.includes('security')) {
    return `<path d="M20 6L8 12v8c0 7 5 12 12 14 7-2 12-7 12-14v-8L20 6z" fill="${primaryColor}" ${isRounded ? 'stroke-linejoin="round"' : ''}/>`;
  }

  if (desc.includes('heart') || metaphor.includes('heart') || metaphor.includes('love') || metaphor.includes('care')) {
    return `<path d="M20 28C12 22 8 17 8 13c0-3.5 3-6 6-6 2 0 4 1 6 3 2-2 4-3 6-3 3 0 6 2.5 6 6 0 4-4 9-12 15z" fill="${primaryColor}"/>`;
  }

  if (desc.includes('circle') || metaphor.includes('unity') || metaphor.includes('complete') || metaphor.includes('whole')) {
    return `<circle cx="20" cy="17" r="11" fill="none" stroke="${primaryColor}" stroke-width="3"/>`;
  }

  if (desc.includes('bolt') || desc.includes('lightning') || metaphor.includes('energy') || metaphor.includes('power') || metaphor.includes('fast')) {
    return `<polygon points="22,6 12,18 18,18 16,30 28,16 21,16" fill="${primaryColor}"/>`;
  }

  if (desc.includes('wave') || metaphor.includes('wave') || metaphor.includes('flow') || metaphor.includes('fluid')) {
    return `<path d="M8 20c4-4 8-4 12 0s8 4 12 0" stroke="${primaryColor}" stroke-width="3" fill="none" stroke-linecap="round"/>
            <path d="M8 14c4-4 8-4 12 0s8 4 12 0" stroke="${accentColor || primaryColor}" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/>`;
  }

  if (desc.includes('arrow') || metaphor.includes('direction') || metaphor.includes('forward') || metaphor.includes('progress')) {
    return `<path d="M10 17h16M20 11l6 6-6 6" stroke="${primaryColor}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  if (desc.includes('diamond') || metaphor.includes('premium') || metaphor.includes('luxury') || metaphor.includes('value')) {
    return `<polygon points="20,6 30,17 20,28 10,17" fill="${primaryColor}"/>`;
  }

  if (desc.includes('sun') || metaphor.includes('bright') || metaphor.includes('radiant') || metaphor.includes('light')) {
    return `<circle cx="20" cy="17" r="6" fill="${primaryColor}"/>
            <g stroke="${primaryColor}" stroke-width="2" stroke-linecap="round">
              <line x1="20" y1="5" x2="20" y2="8"/>
              <line x1="20" y1="26" x2="20" y2="29"/>
              <line x1="8" y1="17" x2="11" y2="17"/>
              <line x1="29" y1="17" x2="32" y2="17"/>
              <line x1="11.5" y1="8.5" x2="13.6" y2="10.6"/>
              <line x1="26.4" y1="23.4" x2="28.5" y2="25.5"/>
              <line x1="28.5" y1="8.5" x2="26.4" y2="10.6"/>
              <line x1="13.6" y1="23.4" x2="11.5" y2="25.5"/>
            </g>`;
  }

  if (desc.includes('cube') || desc.includes('box') || metaphor.includes('build') || metaphor.includes('structure')) {
    return `<path d="M20 6L32 13v12L20 32 8 25V13L20 6z" fill="none" stroke="${primaryColor}" stroke-width="2.5"/>
            <path d="M20 6v13M8 13l12 6M32 13l-12 6" stroke="${primaryColor}" stroke-width="2"/>`;
  }

  if (desc.includes('mountain') || metaphor.includes('peak') || metaphor.includes('summit') || metaphor.includes('achievement')) {
    return `<polygon points="20,6 32,28 8,28" fill="${primaryColor}"/>
            <polygon points="14,28 20,18 26,28" fill="${accentColor || '#ffffff'}" opacity="0.3"/>`;
  }

  if (desc.includes('gear') || desc.includes('cog') || metaphor.includes('setting') || metaphor.includes('mechanical')) {
    return `<circle cx="20" cy="17" r="5" fill="none" stroke="${primaryColor}" stroke-width="2"/>
            <path d="M20 8v-2M20 28v-2M11 17H9M31 17h-2M13 10l-1.5-1.5M28.5 25.5L27 24M13 24l-1.5 1.5M28.5 8.5L27 10" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  if (desc.includes('home') || desc.includes('house') || metaphor.includes('home') || metaphor.includes('shelter')) {
    return `<path d="M8 18l12-10 12 10" stroke="${primaryColor}" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M11 16v10h7v-6h4v6h7V16" stroke="${primaryColor}" stroke-width="2.5" fill="none"/>`;
  }

  if (desc.includes('check') || metaphor.includes('success') || metaphor.includes('complete') || metaphor.includes('done')) {
    return `<path d="M10 17l6 6 14-14" stroke="${primaryColor}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  if (desc.includes('target') || desc.includes('bullseye') || metaphor.includes('focus') || metaphor.includes('goal')) {
    return `<circle cx="20" cy="17" r="10" fill="none" stroke="${primaryColor}" stroke-width="2"/>
            <circle cx="20" cy="17" r="6" fill="none" stroke="${primaryColor}" stroke-width="2"/>
            <circle cx="20" cy="17" r="2" fill="${primaryColor}"/>`;
  }

  if (desc.includes('plus') || desc.includes('cross') || metaphor.includes('health') || metaphor.includes('medical') || metaphor.includes('add')) {
    return `<path d="M20 8v18M11 17h18" stroke="${primaryColor}" stroke-width="3" stroke-linecap="round"/>`;
  }

  if (desc.includes('book') || metaphor.includes('knowledge') || metaphor.includes('learn') || metaphor.includes('education')) {
    return `<path d="M8 8v18c4-2 8-2 12 0V8c-4 2-8 2-12 0z" fill="none" stroke="${primaryColor}" stroke-width="2"/>
            <path d="M32 8v18c-4-2-8-2-12 0V8c4 2 8 2 12 0z" fill="none" stroke="${primaryColor}" stroke-width="2"/>`;
  }

  if (desc.includes('clock') || desc.includes('time') || metaphor.includes('time') || metaphor.includes('schedule')) {
    return `<circle cx="20" cy="17" r="10" fill="none" stroke="${primaryColor}" stroke-width="2.5"/>
            <path d="M20 11v6l4 4" stroke="${primaryColor}" stroke-width="2.5" stroke-linecap="round"/>`;
  }

  if (desc.includes('person') || desc.includes('user') || metaphor.includes('people') || metaphor.includes('human')) {
    return `<circle cx="20" cy="11" r="5" fill="${primaryColor}"/>
            <path d="M10 28c0-5.5 4.5-10 10-10s10 4.5 10 10" fill="${primaryColor}"/>`;
  }

  if (desc.includes('nest') || metaphor.includes('nest') || metaphor.includes('nurture') || metaphor.includes('birth') || metaphor.includes('baby')) {
    return `<ellipse cx="20" cy="22" rx="12" ry="6" fill="none" stroke="${primaryColor}" stroke-width="2"/>
            <ellipse cx="20" cy="20" rx="10" ry="4" fill="none" stroke="${primaryColor}" stroke-width="1.5"/>
            <circle cx="16" cy="18" r="3" fill="${primaryColor}"/>
            <circle cx="24" cy="18" r="3" fill="${primaryColor}"/>
            <circle cx="20" cy="16" r="3" fill="${accentColor || primaryColor}"/>`;
  }

  if (desc.includes('lotus') || desc.includes('flower') || metaphor.includes('bloom') || metaphor.includes('petal')) {
    return `<ellipse cx="20" cy="18" rx="4" ry="8" fill="${primaryColor}"/>
            <ellipse cx="14" cy="20" rx="3" ry="6" fill="${primaryColor}" transform="rotate(-30 14 20)"/>
            <ellipse cx="26" cy="20" rx="3" ry="6" fill="${primaryColor}" transform="rotate(30 26 20)"/>
            <ellipse cx="11" cy="22" rx="2.5" ry="5" fill="${accentColor || primaryColor}" opacity="0.7" transform="rotate(-50 11 22)"/>
            <ellipse cx="29" cy="22" rx="2.5" ry="5" fill="${accentColor || primaryColor}" opacity="0.7" transform="rotate(50 29 22)"/>`;
  }

  const abstractPatterns = [
    `<rect x="10" y="9" width="8" height="8" fill="${primaryColor}" ${isRounded ? 'rx="2"' : ''}/>
     <rect x="22" y="9" width="8" height="8" fill="${accentColor || primaryColor}" opacity="0.7" ${isRounded ? 'rx="2"' : ''}/>
     <rect x="16" y="17" width="8" height="8" fill="${primaryColor}" ${isRounded ? 'rx="2"' : ''}/>`,
    `<circle cx="15" cy="17" r="7" fill="${primaryColor}"/>
     <circle cx="25" cy="17" r="7" fill="${accentColor || primaryColor}" opacity="0.7"/>`,
    `<path d="M20 6L32 28H8L20 6z" fill="${primaryColor}"/>`,
  ];

  return abstractPatterns[Math.floor(Math.random() * abstractPatterns.length)];
}

function generateLogoSVG(
  businessName: string,
  concept: any,
  brandColors: { primary: string; secondary?: string; accent?: string }
): string {
  const fontFamily = getWebSafeFont(concept.wordmark.font_suggestions);
  const fontWeight = getFontWeight(concept.wordmark.weight);
  const letterSpacing = getLetterSpacing(concept.wordmark.kerning);

  const primaryColor = concept.colors.primary[0] || brandColors.primary || '#0B1320';
  const accentColor = concept.colors.primary[1] || brandColors.secondary || brandColors.accent;

  const iconSVG = generateIconSVG(concept.icon, primaryColor, accentColor);

  const nameLength = businessName.length;
  let fontSize = 28;
  let viewBoxWidth = 400;

  if (nameLength > 20) {
    fontSize = 22;
    viewBoxWidth = 480;
  } else if (nameLength > 15) {
    fontSize = 24;
    viewBoxWidth = 440;
  } else if (nameLength > 10) {
    fontSize = 26;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxWidth} 40" width="${viewBoxWidth}" height="40">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;family=Montserrat:wght@400;500;600;700&amp;family=Poppins:wght@400;500;600;700&amp;family=DM+Sans:wght@400;500;600;700&amp;family=Space+Grotesk:wght@400;500;600;700&amp;display=swap');
    </style>
  </defs>
  <g transform="translate(4, 3) scale(0.85)">
    ${iconSVG}
  </g>
  <text
    x="48"
    y="27"
    font-family="${fontFamily}"
    font-size="${fontSize}"
    font-weight="${fontWeight}"
    fill="${primaryColor}"
    letter-spacing="${letterSpacing}"
  >${businessName}</text>
</svg>`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) {
      return new Response(
        JSON.stringify({ error: "Anthropic API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { businessName, brandColors, businessDescription, brandPersonality } = await req.json();

    if (!businessName) {
      return new Response(
        JSON.stringify({ error: "businessName is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Starting high-quality logo generation for:', businessName);

    const colors = brandColors || { primary: '#0B1320', secondary: '#2F6BFF', accent: '#666666' };

    const hasCustomDescription = brandPersonality && brandPersonality.includes('Additional requirements:');
    const customRequirements = hasCustomDescription
      ? brandPersonality.split('Additional requirements:')[1]?.trim()
      : null;

    const keywordsList = customRequirements
      ? [customRequirements]
      : businessDescription
      ? [businessDescription.split(' ').slice(0, 5).join(' ')]
      : [];

    const prompt = `You are a professional brand designer. Generate multiple high-quality, usable logo options for a user's business. The output must be clean, modern, and website-header ready (like a simple rocket icon + wordmark).

Input:
business_name: "${businessName}"
industry: "${businessDescription || 'general business'}"
keywords: ${JSON.stringify(keywordsList)}
color_preference: "${colors.primary}"
style_preference: "${customRequirements || 'modern, professional'}"

Your task: Create 8 logo concepts for "${businessName}" in a consistent, professional system.

Core layout (required for every concept):
- Horizontal lockup: simple icon on the left + wordmark on the right
- White background, lots of whitespace
- Wordmark is the focus; icon is small and simple

Typography (required):
- Each concept must use a different font personality (geometric sans, neo-grotesk, rounded sans, slightly condensed, wide/extended)
- Provide font suggestions by name (Inter, Montserrat, Manrope, Sora, Poppins, Plus Jakarta Sans, DM Sans, Space Grotesk, Outfit, Raleway)
- Specify weight (600 or 700) and note kerning (tight/normal/wide)

Icon (required):
- Icon must be minimal and built from simple shapes
- Use an icon metaphor based on industry/keywords when available
- If custom requirements mention specific icons (like "nest", "lotus", "heart", "leaf"), USE THOSE
- No detailed illustrations; must work at favicon size

Color (required):
- Provide for each concept:
  - Primary color version (1-2 colors max, using "${colors.primary}" as base)
  - All-black and all-white versions

Hard rules (must follow):
- Flat vector look only
- No gradients, no shadows, no 3D, no textures
- Avoid circular badge/seal logos
- Avoid overly thin strokes
- Must be legible at small sizes

OUTPUT FORMAT - Return ONLY valid JSON in this exact structure:
{
  "brand": {
    "business_name": "${businessName}",
    "industry": "${businessDescription || 'general'}",
    "keywords": ${JSON.stringify(keywordsList)}
  },
  "concepts": [
    {
      "id": "A",
      "layout": "icon-left + wordmark-right",
      "wordmark": {
        "text_options": ["${businessName}"],
        "font_style": "geometric sans",
        "font_suggestions": ["Inter", "Sora"],
        "weight": "700",
        "kerning": "slightly tight"
      },
      "icon": {
        "metaphor": "short phrase describing the icon concept",
        "shape_language": "rounded",
        "description": "1-2 sentences describing the simple icon using basic shapes"
      },
      "colors": {
        "primary": ["${colors.primary}", "${colors.secondary || colors.accent || '#2F6BFF'}"],
        "black": ["#000000"],
        "white": ["#FFFFFF"]
      },
      "usage_notes": ["works as favicon", "works on dark header"]
    }
  ],
  "top_pick": "A"
}

Generate exactly 8 concepts with IDs A through H, each with a different font and icon style.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 6000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to generate logo concepts" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text || "";

    console.log('Claude response received, parsing...');

    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse Claude response:", parseError);
      console.error("Raw content:", content.substring(0, 500));
      return new Response(
        JSON.stringify({ error: "Failed to parse logo data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const concepts: LogoConcept[] = [];

    for (const concept of parsed.concepts || []) {
      try {
        const svg = generateLogoSVG(businessName, concept, colors);
        const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

        concepts.push({
          id: concept.id,
          name: `Style ${concept.id}`,
          description: concept.icon.metaphor,
          imageUrl: svgDataUrl,
          wordmark: concept.wordmark,
          icon: concept.icon,
          colors: concept.colors,
        });
        console.log(`Logo "${concept.id}" generated successfully`);
      } catch (err) {
        console.error(`Error generating logo ${concept.id}:`, err);
      }
    }

    console.log(`Generated ${concepts.length} logo concepts total`);

    return new Response(
      JSON.stringify({ concepts, topPick: parsed.top_pick }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-logo-concepts:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate logo concepts' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});