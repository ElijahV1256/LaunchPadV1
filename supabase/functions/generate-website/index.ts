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
    const {
      businessName,
      tagline,
      brandColors,
      logoUrl,
      description,
      targetAudience,
      businessType,
    } = await req.json();

    // Try multiple possible environment variable names
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || 
                         Deno.env.get('OPENAI_KEY') ||
                         Deno.env.get('openai_api_key');
    
    // Debug: log all available env vars (be careful with this in production)
    console.log('Available env vars:', Object.keys(Deno.env.toObject()));
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in any expected environment variable');
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to Edge Function secrets in Supabase dashboard.');
    }

    console.log('OpenAI API key found, generating website...');

    const prompt = `You are an elite web designer creating premium, conversion-optimized landing pages.

BUSINESS DETAILS:
Business Name: ${businessName}
Tagline: ${tagline}
Brand Colors: Primary: ${brandColors.primary}, Secondary: ${brandColors.secondary}, Accent: ${brandColors.accent}
Logo URL: ${logoUrl || 'No logo provided'}
Description: ${description}
Target Audience: ${targetAudience}
Business Type: ${businessType}

DESIGN REQUIREMENTS:

TECHNICAL SPECIFICATIONS:
- Use HTML5 with Tailwind CSS (include Tailwind CDN v3.4+)
- Include Inter or similar modern font from Google Fonts
- Fully responsive (mobile-first approach)
- Semantic HTML structure
- Clean, production-ready code
- Smooth scroll behavior
- Modern CSS transitions and hover effects

PREMIUM DESIGN PRINCIPLES:
- Generous white space (padding: py-20 lg:py-32 minimum for sections)
- Large, bold typography (text-5xl lg:text-7xl for hero headlines)
- Subtle gradients and shadows for depth
- Modern card designs with hover effects
- Professional color usage (use brand colors strategically)
- Visual hierarchy with font sizes and weights
- Micro-interactions on buttons and cards
- Professional imagery placeholders with colored backgrounds

SECTIONS TO BUILD:

1. HERO SECTION (Full viewport height):
   - Sticky/fixed transparent navigation that becomes solid on scroll
   - Logo/brand name in nav
   - Massive, attention-grabbing headline (test-5xl+)
   - Compelling subheadline (text-xl, muted color)
   - Two CTAs: Primary (bold, accent color) + Secondary (outline/ghost)
   - Hero image or gradient background
   - Scroll indicator or down arrow

2. FEATURES/BENEFITS SECTION:
   - 3-6 feature cards in grid layout
   - Icons or colored circles for each feature
   - Clear titles and descriptions
   - Subtle shadows and hover lift effects
   - Use background gradients or subtle colors

3. ABOUT/STORY SECTION:
   - Split layout (text + image/illustration placeholder)
   - Emotional, mission-driven copy
   - Trust-building elements
   - Professional formatting

4. SOCIAL PROOF (if applicable):
   - Testimonial cards or trust badges
   - Customer logos or statistics
   - Clean, minimalist design

5. FINAL CTA SECTION:
   - Bold, centered call-to-action
   - Contrasting background (gradient or solid color)
   - Large button
   - Brief reinforcement text

6. FOOTER:
   - Clean, organized layout
   - Copyright, links, contact info
   - Subtle background color

STYLING BEST PRACTICES:
- Buttons: px-8 py-4, rounded-lg, font-semibold, hover:scale-105 transition
- Cards: bg-white, shadow-lg, hover:shadow-xl, rounded-2xl, p-8
- Headings: font-bold, tracking-tight, leading-tight
- Body text: text-gray-600, leading-relaxed
- Spacing: Always use consistent spacing scale (p-4, p-6, p-8, py-20, etc.)
- Colors: Use brand colors for accents, neutral grays for text
- Shadows: shadow-sm, shadow-md, shadow-lg, shadow-xl for depth
- Gradients: Use subtle gradients like "from-blue-50 to-white"

MODERN TOUCHES:
- Add transition-all duration-300 to interactive elements
- Use hover:translate-y-[-4px] on cards
- Implement backdrop-blur for modern glassmorphism effects where appropriate
- Use rounded-2xl or rounded-3xl for modern, soft corners
- Add subtle border colors (border border-gray-100)

COLOR USAGE:
- Primary color: Main CTAs, important headings, accents
- Secondary color: Secondary buttons, highlights, decorative elements
- Accent color: Borders, icons, small highlights
- Use neutral grays (gray-50, gray-100, gray-600, gray-900) for backgrounds and text

CRITICAL: Do NOT use placeholder text like "Lorem ipsum" or generic content. Create realistic, brand-appropriate text based on the business details provided. Make it feel like a real, professional website.

Return ONLY the complete HTML code starting with <!DOCTYPE html>. No markdown, no explanations, no code blocks - just pure HTML.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an elite web designer specializing in premium, conversion-optimized landing pages. Return only valid, production-ready HTML code with Tailwind CSS. No explanatory text, no markdown formatting, no code blocks - just pure HTML starting with <!DOCTYPE html>. Focus on modern design, excellent UX, and conversion optimization.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate website');
    }

    const data = await response.json();
    let html = data.choices[0].message.content.trim();

    // Clean up any markdown code blocks if present
    html = html.replace(/^```html\n/, '').replace(/\n```$/, '');
    html = html.replace(/^```\n/, '').replace(/\n```$/, '');

    return new Response(
      JSON.stringify({ html }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error generating website:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to generate website' }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});