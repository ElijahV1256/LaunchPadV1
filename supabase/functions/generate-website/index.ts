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

    const logoInstruction = logoUrl
      ? `CRITICAL - LOGO IMAGE:
You MUST use this EXACT img tag for the logo in the navigation bar:
<img src="${logoUrl}" alt="${businessName} Logo" class="h-10 w-auto object-contain" />

Do NOT:
- Use placeholder images
- Use text instead of the logo
- Change the src URL
- Use background-image

The logo MUST be an <img> element with the exact URL: ${logoUrl}`
      : `Create a styled text logo with the business name using brand colors`;

    const prompt = `Generate a complete, modern, professional single-page website as a fully functional HTML document.

# BUSINESS INFORMATION
Business Name: ${businessName}
Tagline: ${tagline}
Brand Colors: Primary ${brandColors.primary}, Secondary ${brandColors.secondary}, Accent ${brandColors.accent}
Description: ${description}
Target Audience: ${targetAudience}
Business Type: ${businessType}

${logoInstruction}

# TECHNICAL REQUIREMENTS
- Single HTML file with embedded CSS and minimal JavaScript
- Tailwind CSS via CDN (version 3.4+)
- Google Fonts: Inter or similar modern sans-serif
- Fully responsive (mobile-first)
- Semantic HTML5
- Smooth scroll behavior
- No external dependencies except Tailwind CDN and Google Fonts

# VISUAL DESIGN REQUIREMENTS (CRITICAL)

LOGO IN NAVIGATION:
${logoUrl ? `- The navigation bar MUST contain: <img src="${logoUrl}" alt="${businessName} Logo" class="h-10 w-auto object-contain" />` : `- Create a styled text logo with the business name using brand colors`}
- Logo appears on the left side of the navigation
- Do NOT skip the logo or use placeholder text

COLORS (USE EXTENSIVELY):
- PRIMARY COLOR (${brandColors.primary}):
  * Hero section background or gradient
  * All primary CTA buttons (use inline style="background-color: ${brandColors.primary}")
  * Section accents and highlights
  * Icon backgrounds

- SECONDARY COLOR (${brandColors.secondary}):
  * Gradient combinations with primary
  * Alternate section backgrounds (use opacity: style="background-color: ${brandColors.secondary}; opacity: 0.1")
  * Secondary buttons and elements
  * Card borders or accents

- ACCENT COLOR (${brandColors.accent}):
  * Highlights and small accents
  * Icon colors
  * Hover states
  * Decorative elements

VISUAL ELEMENTS (REQUIRED):
1. Colorful hero background: Use gradient or solid brand color, NOT plain white
2. IMAGES - Use high-quality stock photos from Pexels (EXACTLY 2 images):
   - REQUIRED IMAGE 1 - Hero Section: One prominent hero image in the header section alongside the title
     * Place on the right side of the hero section (desktop) or below title (mobile)
     * Should be large and eye-catching
     * Choose an image that represents the business offering or happy customers
     * Example: <img src="https://images.pexels.com/photos/..." alt="..." class="w-full h-full object-cover rounded-2xl shadow-2xl" />
   - REQUIRED IMAGE 2 - CTA/About Section: One image in the about or final CTA section
     * Should showcase the product/service or satisfied customers
     * Professional and authentic
     * Example: <img src="https://images.pexels.com/photos/..." alt="..." class="w-full h-96 object-cover rounded-2xl shadow-2xl" />
   - Link directly to Pexels images (e.g., https://images.pexels.com/photos/...)
   - Choose images that match the business type and target audience
3. Icon backgrounds: Colored circles or squares with icons/emojis
4. Section alternation: Alternate between colored backgrounds and white
5. Decorative shapes: Add subtle SVG shapes or gradients for visual interest

DO NOT create a plain white website with only text. The website MUST be visually rich and colorful.

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
- LEFT SIDE: ${logoUrl ? `MUST display this exact logo: <img src="${logoUrl}" alt="${businessName} Logo" class="h-10 w-auto object-contain" />` : 'Styled text logo with brand color'}
- RIGHT SIDE: Nav links with hover color change to brand color
- Mobile hamburger menu
- Shadow on scroll
- The logo image is REQUIRED - do not use placeholder or text

2. HERO SECTION (min-h-screen) - MUST BE COLORFUL
- Background: Use inline style with gradient:
  style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.secondary} 100%)"
  OR use a colored background with overlay
- Two-column layout (text left, image right on desktop)
- Left side:
  * White or contrasting text color for readability
  * Large, bold headline (benefit-focused)
  * Subheadline with value proposition
  * Two CTAs: Primary button (use contrasting color like white with dark text), Secondary outline button
- Right side: HERO IMAGE (REQUIRED)
  * Use a relevant Pexels image that matches the business type
  * Large, prominent image that takes up significant space
  * Example: <img src="https://images.pexels.com/photos/..." alt="..." class="w-full h-full object-cover rounded-2xl shadow-2xl" />
- Make this section visually striking and memorable

3. FEATURES SECTION
- White or very light background
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8
- 3-6 feature cards with white background and shadow
- Each card:
  * Large colored circle/square icon background with emoji (use brand colors)
  * Example: <div class="w-16 h-16 rounded-full flex items-center justify-center text-3xl" style="background-color: ${brandColors.accent}">🎯</div>
  * Title and description
- Hover effects: lift and enhanced shadow

4. ABOUT/VALUE PROPOSITION SECTION
- Colored background (use brand color with low opacity or gradient)
- Two-column layout (text left, visual right on desktop)
- Compelling story about the business
- Right side: ABOUT IMAGE (REQUIRED)
  * Use a professional Pexels image that showcases the business, product/service, or happy customers
  * Should feel authentic and professional
  * Example: <img src="https://images.pexels.com/photos/..." alt="..." class="h-full min-h-[400px] w-full object-cover rounded-2xl shadow-2xl" />

5. TESTIMONIALS (if applicable)
- White background
- 2-3 testimonial cards in grid
- Each card: quote, name, title/company
- Colored accent borders or backgrounds (use brand colors)
- Avatar placeholders as colored circles with initials

6. CALL TO ACTION SECTION - BOLD & COLORFUL
- Full-width colored background:
  style="background: linear-gradient(to right, ${brandColors.primary}, ${brandColors.secondary})"
- White text for contrast
- Large, centered headline
- Primary CTA button (white background with dark text for contrast)
- Make this section pop and grab attention

7. FOOTER
- Background with brand color: style="background-color: ${brandColors.primary}" OR use dark gray
- Light text (white or light gray)
- Grid layout: brand info, links, contact
- Copyright
- Well organized and professional

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
✓ VISUALLY RICH - Use colors, gradients, and visual elements throughout
✓ Brand colors used prominently in hero, CTAs, sections, and accents
✓ ${logoUrl ? `Logo image MUST be in navigation using: <img src="${logoUrl}" class="h-10 w-auto object-contain" />` : 'Styled text logo with brand colors'}
✓ NOT a plain white website - alternate section colors
✓ Beautiful gradient backgrounds and colored placeholders instead of images
✓ Accessible (proper contrast, semantic HTML)
✓ Fast loading (minimal dependencies)
✓ Mobile-perfect responsive design
✓ Smooth interactions and hover effects

# CRITICAL REMINDERS
${logoUrl ? `- LOGO: You MUST include <img src="${logoUrl}" alt="${businessName} Logo" class="h-10 w-auto object-contain" /> in the navigation bar` : ''}
- The hero section MUST have a colored gradient background
- IMAGES: You MUST include EXACTLY 2 Pexels images:
  1. One large hero image on the right side of the hero section
  2. One image in the about/value proposition section
- Use inline styles for exact brand colors: style="background-color: ${brandColors.primary}"
- Alternate section backgrounds between white and colored
- Make the design visually impressive and modern

# OUTPUT FORMAT
Return ONLY the complete HTML document. Start with <!DOCTYPE html> and end with </html>.
No markdown code blocks. No explanations. Just the raw HTML code.

Create a visually stunning, colorful website with the brand colors prominently displayed throughout.
Make it beautiful and modern - like websites from Linear, Stripe, Vercel, or Framer - but MORE COLORFUL.`;

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
            content: `You are an expert web developer and designer creating visually stunning, colorful websites. Generate beautiful, modern, production-ready single-page websites with bold use of brand colors, gradients, and visual elements. CRITICAL: You MUST include EXACTLY 2 high-quality Pexels stock photos: (1) One large hero image in the header section alongside the title, and (2) One image in the about/CTA section. Link directly to Pexels images (e.g., https://images.pexels.com/photos/...). Return ONLY raw HTML code - no markdown, no code blocks, no explanations. Start with <!DOCTYPE html> and end with </html>. Use Tailwind CSS and inline styles for exact colors. The website MUST be colorful and visually rich - NOT a plain white page. Use colored backgrounds, gradients, and visual elements throughout.${logoUrl ? ` CRITICAL: When a logo URL is provided, you MUST use an <img> tag with that exact URL in the navigation bar. Do not use placeholder images or text logos when a logo URL is given.` : ''}`,
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