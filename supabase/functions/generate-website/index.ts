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

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || 
                         Deno.env.get('OPENAI_KEY') ||
                         Deno.env.get('openai_api_key');
    
    console.log('Available env vars:', Object.keys(Deno.env.toObject()));
    
    if (!openaiApiKey) {
      console.error('OpenAI API key not found in any expected environment variable');
      throw new Error('OpenAI API key not configured. Please add OPENAI_API_KEY to Edge Function secrets in Supabase dashboard.');
    }

    console.log('OpenAI API key found, generating website...');

    const prompt = `Generate a complete, modern, professional single-page website as a fully functional HTML document.

# BUSINESS INFORMATION
Business Name: ${businessName}
Tagline: ${tagline}
Brand Colors: Primary ${brandColors.primary}, Secondary ${brandColors.secondary}, Accent ${brandColors.accent}
Logo: ${logoUrl || 'Use business name as text logo'}
Description: ${description}
Target Audience: ${targetAudience}
Business Type: ${businessType}

# TECHNICAL REQUIREMENTS
- Single HTML file with embedded CSS and minimal JavaScript
- Tailwind CSS via CDN (version 3.4+)
- Google Fonts: Inter or similar modern sans-serif
- Fully responsive (mobile-first)
- Semantic HTML5
- Smooth scroll behavior
- No external dependencies except Tailwind CDN and Google Fonts

# DESIGN SYSTEM
Colors:
- Use provided brand colors strategically
- Gradients: subtle, modern (e.g., "from-blue-50 via-white to-purple-50")
- Neutral palette: slate-50, slate-100, slate-600, slate-900
- Always ensure high contrast for accessibility

Typography:
- Hero headline: text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight
- Subheadings: text-xl lg:text-2xl text-slate-600
- Body: text-base lg:text-lg text-slate-600 leading-relaxed
- Use font-bold, font-semibold, font-medium appropriately

Spacing:
- Sections: py-16 lg:py-24 xl:py-32
- Containers: max-w-7xl mx-auto px-6 lg:px-8
- Consistent gaps: gap-8, gap-12, gap-16
- Generous whitespace

Components:
- Buttons: px-6 py-3 lg:px-8 lg:py-4, rounded-lg, font-semibold, shadow-lg, transition-all duration-200, hover:scale-105 hover:shadow-xl
- Cards: bg-white rounded-2xl shadow-lg hover:shadow-2xl p-8 transition-all duration-300 hover:-translate-y-2
- Inputs: rounded-lg border-2 border-slate-200 focus:border-[brandcolor] px-4 py-3 transition-colors

# LAYOUT STRUCTURE

1. NAVIGATION (Fixed/Sticky)
- Fixed top, backdrop-blur-lg bg-white/80
- Transparent initially, solid on scroll (use simple JS)
- Logo/business name left, nav links right
- Mobile hamburger menu (simple, functional)
- Smooth scroll to sections
- Shadow on scroll

2. HERO SECTION (min-h-screen)
- Full viewport height with flex centering
- Large headline (6-10 words, benefit-focused)
- Subheadline (15-20 words, specific value prop)
- Two CTAs: Primary (brand accent, bold) + Secondary (outline style)
- Background: subtle gradient or modern pattern
- Optional: Hero image/illustration on right (use colored div placeholder)
- Scroll indicator at bottom

3. FEATURES SECTION
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- 3-6 feature cards
- Each card: icon (use emoji or colored circle), title, 2-line description
- Hover effects: lift and shadow
- Icons: Use large colored circles with emojis or initials

4. ABOUT/VALUE PROPOSITION SECTION
- Two-column layout (text left, visual right on desktop)
- Compelling story (3-4 paragraphs)
- Stats or highlights (numbers that matter)
- Visual: gradient box or colored placeholder

5. TESTIMONIALS (if relevant)
- 2-3 testimonial cards in grid
- Each: quote, name, title, optional avatar placeholder
- Clean, minimal design
- Subtle background color

6. CALL TO ACTION SECTION
- Centered content
- Contrasting background (gradient or solid brand color)
- Large headline
- Primary CTA button
- Brief supporting text

7. FOOTER
- Background: slate-50 or slate-100
- Grid layout: brand/description, links, contact
- Copyright
- Clean, organized

# JAVASCRIPT (Minimal, Inline)
Add simple vanilla JS for:
1. Navbar background on scroll
2. Smooth scroll to anchors
3. Mobile menu toggle (if applicable)
4. Simple animations on scroll (optional, use Intersection Observer)

Keep JS minimal and functional.

# CONTENT GUIDELINES
- NO lorem ipsum or placeholder text
- Write realistic, professional copy based on business details
- Be specific to the industry and target audience
- Use power words and clear value propositions
- Professional, modern tone
- Include realistic business examples

# QUALITY STANDARDS
✓ Production-ready code
✓ Perfect spacing and alignment
✓ Consistent design language
✓ Accessible (proper contrast, semantic HTML)
✓ Fast loading (minimal dependencies)
✓ Mobile-perfect responsive design
✓ Professional color usage
✓ Smooth interactions

# OUTPUT FORMAT
Return ONLY the complete HTML document. Start with <!DOCTYPE html> and end with </html>.
No markdown code blocks. No explanations. Just the raw HTML code.

Make it beautiful, modern, and professional - like websites from Linear, Stripe, Vercel, or Notion.`;

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
            content: 'You are an expert web developer and designer. Generate beautiful, modern, production-ready single-page websites. Return ONLY raw HTML code - no markdown, no code blocks, no explanations. Start with <!DOCTYPE html> and end with </html>. Use Tailwind CSS for styling. Make it look like a professional website from Linear, Stripe, or Vercel - clean, modern, with perfect spacing and typography.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.9,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate website');
    }

    const data = await response.json();
    let html = data.choices[0].message.content.trim();

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