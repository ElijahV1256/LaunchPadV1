interface BrandGuideData {
  businessName: string;
  slogan: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  businessDescription?: string;
  targetAudience?: string;
  brandPersonality?: string;
  industry?: string;
  brandFoundation?: {
    mission: string;
    vision: string;
    coreValues: string[];
    uvp: string;
    voiceDescription: string;
    voiceExamples: string[];
    elevatorPitch: string;
    messagingDos: string[];
    messagingDonts: string[];
  };
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '0, 0, 0';
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `${r}, ${g}, ${b}`;
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function generateBrandGuideHTML(data: BrandGuideData): string {
  const bf = data.brandFoundation;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.businessName} - Complete Brand Guide</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 60px 40px;
    }

    .cover {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, ${data.colors.primary} 0%, ${data.colors.secondary} 100%);
      color: white;
      padding: 60px 40px;
      page-break-after: always;
    }

    .cover h1 {
      font-size: 72px;
      font-weight: 700;
      margin-bottom: 30px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .cover .subtitle {
      font-size: 32px;
      font-style: italic;
      margin-bottom: 60px;
      opacity: 0.95;
    }

    .cover .date {
      font-size: 16px;
      opacity: 0.8;
      margin-top: 40px;
    }

    .section {
      margin-bottom: 80px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 40px;
      color: ${data.colors.primary};
      padding-bottom: 20px;
      border-bottom: 3px solid ${data.colors.primary};
    }

    .subsection-title {
      font-size: 24px;
      font-weight: 600;
      margin-top: 30px;
      margin-bottom: 15px;
      color: #1a1a1a;
    }

    .text-content {
      font-size: 16px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 20px;
    }

    .highlight-box {
      background: linear-gradient(135deg, ${data.colors.primary}15 0%, ${data.colors.secondary}15 100%);
      border-left: 4px solid ${data.colors.primary};
      padding: 25px 30px;
      margin: 20px 0;
      border-radius: 8px;
    }

    .logo-section {
      text-align: center;
      background: #f9f9f9;
      padding: 60px 40px;
      border-radius: 12px;
      margin: 30px 0;
    }

    .logo-section img {
      max-width: 500px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    }

    .logo-variations {
      margin-top: 40px;
      text-align: left;
    }

    .logo-variations h4 {
      font-size: 18px;
      margin-bottom: 15px;
      color: ${data.colors.primary};
    }

    .logo-variations p {
      color: #666;
      line-height: 1.8;
      margin-bottom: 10px;
    }

    .colors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 30px;
      margin: 30px 0;
    }

    .color-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .color-swatch {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      font-weight: 700;
    }

    .color-info {
      padding: 25px;
      background: white;
    }

    .color-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 12px;
      color: #1a1a1a;
    }

    .color-value {
      font-family: 'Courier New', monospace;
      font-size: 14px;
      color: #666;
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      margin: 5px 0;
      display: block;
    }

    .color-usage {
      margin-top: 12px;
      font-size: 13px;
      color: #888;
    }

    ul.value-list {
      list-style: none;
      padding: 0;
    }

    ul.value-list li {
      padding: 12px 0 12px 30px;
      position: relative;
      color: #333;
      font-size: 16px;
      line-height: 1.6;
    }

    ul.value-list li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: ${data.colors.primary};
      font-weight: bold;
      font-size: 20px;
    }

    .do-dont-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin: 30px 0;
    }

    .do-card {
      background: #e8f5e9;
      border-left: 4px solid #4CAF50;
      padding: 25px;
      border-radius: 8px;
    }

    .dont-card {
      background: #ffebee;
      border-left: 4px solid #f44336;
      padding: 25px;
      border-radius: 8px;
    }

    .do-card h4, .dont-card h4 {
      margin-bottom: 15px;
      font-size: 18px;
    }

    .do-card ul, .dont-card ul {
      list-style: none;
      padding: 0;
    }

    .do-card li:before {
      content: "✓";
      color: #4CAF50;
      font-weight: bold;
      margin-right: 10px;
    }

    .dont-card li:before {
      content: "✗";
      color: #f44336;
      font-weight: bold;
      margin-right: 10px;
    }

    .typography-section {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 12px;
      margin: 30px 0;
    }

    .font-display {
      margin: 20px 0;
      padding: 20px;
      background: white;
      border-radius: 8px;
    }

    .font-name {
      font-size: 18px;
      font-weight: 600;
      color: ${data.colors.primary};
      margin-bottom: 10px;
    }

    .font-sample {
      font-size: 32px;
      margin: 10px 0;
    }

    .guidelines-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
      margin: 30px 0;
    }

    .guideline-card {
      background: #f9f9f9;
      padding: 25px;
      border-radius: 12px;
      border-top: 4px solid ${data.colors.accent};
    }

    .guideline-card h4 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1a1a1a;
    }

    .guideline-card p {
      font-size: 14px;
      color: #666;
      line-height: 1.8;
    }

    .mockup-section {
      background: #f5f5f5;
      padding: 30px;
      border-radius: 12px;
      margin: 20px 0;
    }

    .mockup-section h4 {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 15px;
      color: ${data.colors.primary};
    }

    .mockup-section p {
      color: #666;
      line-height: 1.8;
      margin-bottom: 10px;
    }

    .page-break {
      page-break-before: always;
    }

    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }

      .container {
        padding: 40px 20px;
      }

      .section {
        page-break-inside: avoid;
      }

      .cover {
        page-break-after: always;
      }
    }

    @media (max-width: 768px) {
      .container {
        padding: 40px 20px;
      }

      .cover h1 {
        font-size: 48px;
      }

      .cover .subtitle {
        font-size: 24px;
      }

      .section-title {
        font-size: 28px;
      }

      .colors-grid {
        grid-template-columns: 1fr;
      }

      .guidelines-grid {
        grid-template-columns: 1fr;
      }

      .do-dont-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <!-- Cover Page -->
  <div class="cover">
    <h1>${data.businessName}</h1>
    <div class="subtitle">Complete Brand Guide</div>
    <div class="date">Generated ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
  </div>

  <div class="container">
    <!-- 1. Brand Foundation -->
    <div class="section">
      <h2 class="section-title">1. Brand Foundation</h2>

      <h3 class="subsection-title">Brand Name</h3>
      <div class="highlight-box">
        <p style="font-size: 32px; font-weight: 700; margin: 0;">${data.businessName}</p>
      </div>

      <h3 class="subsection-title">Tagline</h3>
      <div class="highlight-box">
        <p style="font-size: 20px; font-style: italic; margin: 0;">"${data.slogan}"</p>
      </div>

      ${bf ? `
      <h3 class="subsection-title">Mission Statement</h3>
      <p class="text-content">${bf.mission}</p>

      <h3 class="subsection-title">Vision Statement</h3>
      <p class="text-content">${bf.vision}</p>

      <h3 class="subsection-title">Core Values</h3>
      <ul class="value-list">
        ${bf.coreValues.map(value => `<li>${value}</li>`).join('')}
      </ul>

      <h3 class="subsection-title">Unique Value Proposition</h3>
      <div class="highlight-box">
        <p style="font-size: 18px; margin: 0;">${bf.uvp}</p>
      </div>

      <h3 class="subsection-title">Brand Personality</h3>
      <p class="text-content">${data.brandPersonality || 'Professional, modern, trustworthy, approachable, innovative'}</p>
      ` : ''}
    </div>

    <!-- 2. Visual Identity -->
    <div class="section page-break">
      <h2 class="section-title">2. Visual Identity</h2>

      <h3 class="subsection-title">Logo</h3>
      <div class="logo-section">
        <img src="${data.logoUrl}" alt="${data.businessName} Logo" />

        <div class="logo-variations">
          <h4>Logo Variations</h4>
          <p><strong>Primary:</strong> Full color logo on white or light backgrounds</p>
          <p><strong>Horizontal:</strong> Logo with text beside the icon for wide applications</p>
          <p><strong>Stacked:</strong> Logo with text below the icon for square formats</p>
          <p><strong>Icon Only:</strong> Use when brand name is clear from context</p>
          <p><strong>Black & White:</strong> Single-color version for print or limited-color applications</p>
        </div>
      </div>

      <h3 class="subsection-title">Color Palette</h3>
      <div class="colors-grid">
        <div class="color-card">
          <div class="color-swatch" style="background-color: ${data.colors.primary};">
            <span style="color: ${getContrastColor(data.colors.primary)};">Aa</span>
          </div>
          <div class="color-info">
            <div class="color-name">Primary Color</div>
            <div class="color-value">HEX: ${data.colors.primary.toUpperCase()}</div>
            <div class="color-value">RGB: ${hexToRgb(data.colors.primary)}</div>
            <div class="color-usage">Use for main branding elements, CTAs, headings</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: ${data.colors.secondary};">
            <span style="color: ${getContrastColor(data.colors.secondary)};">Aa</span>
          </div>
          <div class="color-info">
            <div class="color-name">Secondary Color</div>
            <div class="color-value">HEX: ${data.colors.secondary.toUpperCase()}</div>
            <div class="color-value">RGB: ${hexToRgb(data.colors.secondary)}</div>
            <div class="color-usage">Use for supporting elements, backgrounds, gradients</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: ${data.colors.accent};">
            <span style="color: ${getContrastColor(data.colors.accent)};">Aa</span>
          </div>
          <div class="color-info">
            <div class="color-name">Accent Color</div>
            <div class="color-value">HEX: ${data.colors.accent.toUpperCase()}</div>
            <div class="color-value">RGB: ${hexToRgb(data.colors.accent)}</div>
            <div class="color-usage">Use for highlights, important elements, icons</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: #FFFFFF; border: 1px solid #e0e0e0;">
            <span style="color: #000000;">Aa</span>
          </div>
          <div class="color-info">
            <div class="color-name">Background Light</div>
            <div class="color-value">HEX: #FFFFFF</div>
            <div class="color-value">RGB: 255, 255, 255</div>
            <div class="color-usage">Use for backgrounds, cards, clean spaces</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: #1a1a1a;">
            <span style="color: #FFFFFF;">Aa</span>
          </div>
          <div class="color-info">
            <div class="color-name">Text Dark</div>
            <div class="color-value">HEX: #1A1A1A</div>
            <div class="color-value">RGB: 26, 26, 26</div>
            <div class="color-usage">Use for body text, headings on light backgrounds</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: #666666;">
            <span style="color: #FFFFFF;">Aa</span>
          </div>
          <div class="color-info">
            <div class="color-name">Text Medium</div>
            <div class="color-value">HEX: #666666</div>
            <div class="color-value">RGB: 102, 102, 102</div>
            <div class="color-usage">Use for secondary text, captions, metadata</div>
          </div>
        </div>
      </div>

      <h3 class="subsection-title">Typography</h3>
      <div class="typography-section">
        <div class="font-display">
          <div class="font-name">Header Font: Inter / SF Pro Display / Helvetica Neue</div>
          <div class="font-sample" style="font-weight: 700;">The Quick Brown Fox Jumps</div>
          <p style="color: #666; margin-top: 10px;">Use for: Headings, titles, important text</p>
          <p style="color: #666;">Weights: Bold (700), Semibold (600), Medium (500)</p>
        </div>

        <div class="font-display">
          <div class="font-name">Body Font: Inter / SF Pro Text / Arial</div>
          <div class="font-sample" style="font-weight: 400; font-size: 18px;">The quick brown fox jumps over the lazy dog</div>
          <p style="color: #666; margin-top: 10px;">Use for: Body text, descriptions, paragraphs</p>
          <p style="color: #666;">Weights: Regular (400), Medium (500)</p>
        </div>
      </div>

      <h3 class="subsection-title">Iconography Style</h3>
      <p class="text-content">Use minimal line icons with 2px stroke width. Icons should be simple, geometric, and 2D. Rounded corners preferred. Maintain consistent visual weight across all icons.</p>

      <h3 class="subsection-title">Imagery Style</h3>
      <p class="text-content">Images should be clean, bright, and professional. Use natural lighting with high-quality photography. For illustrations, use flat design style with brand colors. Avoid busy backgrounds and ensure images support the brand's modern aesthetic.</p>
    </div>

    <!-- 3. Messaging Guide -->
    ${bf ? `
    <div class="section page-break">
      <h2 class="section-title">3. Messaging Guide</h2>

      <h3 class="subsection-title">Brand Voice</h3>
      <p class="text-content">${bf.voiceDescription}</p>

      <h3 class="subsection-title">Voice Examples</h3>
      <div class="highlight-box">
        ${bf.voiceExamples.map(example => `<p style="margin: 10px 0; font-size: 16px;">"${example}"</p>`).join('')}
      </div>

      <h3 class="subsection-title">Target Audience</h3>
      <p class="text-content">${data.targetAudience || 'General consumers seeking quality products/services'}</p>

      <h3 class="subsection-title">Elevator Pitch</h3>
      <div class="highlight-box">
        <p style="font-size: 16px; line-height: 1.8; margin: 0;">${bf.elevatorPitch}</p>
      </div>

      <h3 class="subsection-title">Messaging Guidelines</h3>
      <div class="do-dont-grid">
        <div class="do-card">
          <h4>✓ Do</h4>
          <ul>
            ${bf.messagingDos.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <div class="dont-card">
          <h4>✗ Don't</h4>
          <ul>
            ${bf.messagingDonts.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
    ` : ''}

    <!-- 4. Marketing Asset Guidelines -->
    <div class="section page-break">
      <h2 class="section-title">4. Marketing Asset Guidelines</h2>

      <div class="guidelines-grid">
        <div class="guideline-card">
          <h4>Social Media Posts</h4>
          <p>Use brand colors as backgrounds or accents. Include logo in corner. Keep text minimal and readable. Use high-quality images. Maintain 20px padding minimum.</p>
        </div>

        <div class="guideline-card">
          <h4>Advertisements</h4>
          <p>Lead with clear headline in header font. Use primary color for CTAs. Include logo prominently. Keep copy concise. Use imagery that resonates with target audience.</p>
        </div>

        <div class="guideline-card">
          <h4>Website Layout</h4>
          <p>Clean, spacious design with plenty of white space. Consistent 8px spacing system. Header with logo and navigation. Use color hierarchy. Mobile-responsive design.</p>
        </div>

        <div class="guideline-card">
          <h4>Buttons & CTAs</h4>
          <p>Use primary color for main actions. Minimum 44px height for touch. 12-16px padding horizontal. Bold text. Clear, action-oriented copy. Hover states required.</p>
        </div>

        <div class="guideline-card">
          <h4>Print Materials</h4>
          <p>EDDM flyers: Bold headline, clear offer, contact info, logo. Business cards: Logo front and center, essential contact info only. Use high-quality paper stock.</p>
        </div>

        <div class="guideline-card">
          <h4>Email Templates</h4>
          <p>Header with logo and brand colors. Clear subject line. Scannable content. Single CTA per email. Footer with contact info and social links.</p>
        </div>
      </div>
    </div>

    <!-- 5. Usage Rules -->
    <div class="section page-break">
      <h2 class="section-title">5. Usage Rules</h2>

      <h3 class="subsection-title">Logo Usage</h3>
      <ul class="value-list">
        <li>Maintain clear space around logo equal to the height of the logo icon</li>
        <li>Minimum size: 120px width for digital, 1 inch for print</li>
        <li>Never distort, rotate, or modify the logo</li>
        <li>Use only approved color variations</li>
        <li>Ensure sufficient contrast with background</li>
        <li>Never place on busy backgrounds or patterns</li>
      </ul>

      <h3 class="subsection-title">Color Usage</h3>
      <ul class="value-list">
        <li>Primary color: Main branding, CTAs, important elements (use 60% of design)</li>
        <li>Secondary color: Supporting elements, backgrounds (use 30% of design)</li>
        <li>Accent color: Highlights, icons, alerts (use 10% of design)</li>
        <li>Always maintain WCAG AA contrast ratios for text</li>
        <li>Use neutral colors for body text and backgrounds</li>
      </ul>

      <h3 class="subsection-title">Typography Rules</h3>
      <ul class="value-list">
        <li>Headings: 24-48px, bold weight, header font</li>
        <li>Body text: 14-16px, regular weight, body font, 1.5-1.8 line height</li>
        <li>Captions: 12-14px, medium weight</li>
        <li>Never use more than 3 font weights</li>
        <li>Maintain consistent hierarchy across all materials</li>
      </ul>

      <h3 class="subsection-title">Spacing & Layout</h3>
      <ul class="value-list">
        <li>Use 8px base spacing system (8, 16, 24, 32, 40, 48, etc.)</li>
        <li>Maintain generous white space for clean appearance</li>
        <li>Grid-based layouts with consistent alignment</li>
        <li>Minimum 40px padding on containers</li>
        <li>12-column grid for responsive layouts</li>
      </ul>
    </div>

    <!-- 6. Mockup Descriptions -->
    <div class="section page-break">
      <h2 class="section-title">6. Mockup Examples</h2>

      <div class="mockup-section">
        <h4>Business Card</h4>
        <p><strong>Front:</strong> Logo centered or top-left. Use primary brand color as background or accent. Clean, minimal design.</p>
        <p><strong>Back:</strong> Contact information in body font. Name in header font. Social media icons. Consistent color usage.</p>
        <p><strong>Specifications:</strong> 3.5" x 2" standard size, rounded corners optional, high-quality cardstock</p>
      </div>

      <div class="mockup-section">
        <h4>Social Media Post</h4>
        <p><strong>Layout:</strong> 1080x1080px square format. Brand color gradient or solid background. Logo in corner (100x100px).</p>
        <p><strong>Content:</strong> Bold headline in header font (48-64px). Supporting text in body font. High-quality product/service image or illustration.</p>
        <p><strong>Elements:</strong> CTA button or text. Consistent padding (40px). Clear visual hierarchy.</p>
      </div>

      <div class="mockup-section">
        <h4>Website Header</h4>
        <p><strong>Structure:</strong> Logo on left (max 200px height). Navigation menu on right in body font. White or light background with subtle shadow.</p>
        <p><strong>Navigation:</strong> 4-6 main menu items. Primary color on hover. Mobile hamburger menu for responsive design.</p>
        <p><strong>Height:</strong> 70-80px for optimal usability. Sticky header recommended.</p>
      </div>

      <div class="mockup-section">
        <h4>Product/Service Presentation</h4>
        <p><strong>Hero Section:</strong> Large heading (48px+) with tagline. High-quality hero image. Primary CTA button prominent.</p>
        <p><strong>Features:</strong> 3-column grid. Icon + heading + description per feature. Use accent color for icons.</p>
        <p><strong>Testimonials:</strong> Clean cards with quotes, customer name, photo optional. Secondary color backgrounds.</p>
        <p><strong>Footer:</strong> Contact info, social links, logo. Neutral background color.</p>
      </div>
    </div>

    <!-- Brand Summary -->
    <div class="section" style="text-align: center; padding: 60px 0;">
      <h3 style="font-size: 28px; color: ${data.colors.primary}; margin-bottom: 20px;">Brand Summary</h3>
      <p style="font-size: 18px; color: #666; max-width: 600px; margin: 0 auto;">
        This brand guide ensures consistent, professional representation of ${data.businessName} across all touchpoints.
        Keep it simple, modern, and trustworthy in every application.
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function downloadBrandGuide(data: BrandGuideData): void {
  const html = generateBrandGuideHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.businessName.replace(/[^a-z0-9]/gi, '_')}_Complete_Brand_Guide.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
