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
}

export function generateBrandGuideHTML(data: BrandGuideData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.businessName} - Brand Guide</title>
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

    .header {
      text-align: center;
      margin-bottom: 80px;
      padding-bottom: 40px;
      border-bottom: 3px solid #f0f0f0;
    }

    .header h1 {
      font-size: 48px;
      font-weight: 700;
      margin-bottom: 20px;
      color: #1a1a1a;
    }

    .header .slogan {
      font-size: 24px;
      color: #666;
      font-style: italic;
      margin-bottom: 40px;
    }

    .section {
      margin-bottom: 60px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 32px;
      font-weight: 700;
      margin-bottom: 30px;
      color: #1a1a1a;
      padding-bottom: 15px;
      border-bottom: 2px solid #e0e0e0;
    }

    .logo-section {
      text-align: center;
      background: #f9f9f9;
      padding: 60px 40px;
      border-radius: 12px;
      margin-bottom: 40px;
    }

    .logo-section img {
      max-width: 400px;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .logo-usage {
      margin-top: 30px;
      text-align: left;
      max-width: 600px;
      margin-left: auto;
      margin-right: auto;
    }

    .logo-usage h3 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #333;
    }

    .logo-usage ul {
      list-style: none;
      padding-left: 0;
    }

    .logo-usage li {
      padding: 8px 0 8px 25px;
      position: relative;
      color: #666;
    }

    .logo-usage li:before {
      content: "✓";
      position: absolute;
      left: 0;
      color: #4CAF50;
      font-weight: bold;
    }

    .colors-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }

    .color-card {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .color-swatch {
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .color-info {
      padding: 20px;
      background: white;
    }

    .color-name {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #1a1a1a;
    }

    .color-value {
      font-family: 'Courier New', monospace;
      font-size: 16px;
      color: #666;
      background: #f5f5f5;
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 30px;
    }

    .info-card {
      background: #f9f9f9;
      padding: 30px;
      border-radius: 12px;
      border-left: 4px solid ${data.colors.primary};
    }

    .info-card h3 {
      font-size: 18px;
      margin-bottom: 15px;
      color: #1a1a1a;
    }

    .info-card p {
      color: #666;
      line-height: 1.8;
    }

    .footer {
      margin-top: 80px;
      padding-top: 40px;
      border-top: 2px solid #f0f0f0;
      text-align: center;
      color: #999;
      font-size: 14px;
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
    }

    @media (max-width: 768px) {
      .container {
        padding: 40px 20px;
      }

      .header h1 {
        font-size: 36px;
      }

      .header .slogan {
        font-size: 18px;
      }

      .section-title {
        font-size: 24px;
      }

      .colors-grid {
        grid-template-columns: 1fr;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${data.businessName}</h1>
      <div class="slogan">"${data.slogan}"</div>
    </div>

    <div class="section">
      <h2 class="section-title">Logo</h2>
      <div class="logo-section">
        <img src="${data.logoUrl}" alt="${data.businessName} Logo" />
        <div class="logo-usage">
          <h3>Logo Usage Guidelines</h3>
          <ul>
            <li>Maintain clear space around the logo equal to the height of the icon</li>
            <li>Do not distort or rotate the logo</li>
            <li>Use on backgrounds that provide sufficient contrast</li>
            <li>Minimum size: 120px width for digital, 1 inch for print</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Brand Colors</h2>
      <div class="colors-grid">
        <div class="color-card">
          <div class="color-swatch" style="background-color: ${data.colors.primary};">
            <span style="color: ${getContrastColor(data.colors.primary)};">A</span>
          </div>
          <div class="color-info">
            <div class="color-name">Primary Color</div>
            <div class="color-value">${data.colors.primary.toUpperCase()}</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: ${data.colors.secondary};">
            <span style="color: ${getContrastColor(data.colors.secondary)};">A</span>
          </div>
          <div class="color-info">
            <div class="color-name">Secondary Color</div>
            <div class="color-value">${data.colors.secondary.toUpperCase()}</div>
          </div>
        </div>

        <div class="color-card">
          <div class="color-swatch" style="background-color: ${data.colors.accent};">
            <span style="color: ${getContrastColor(data.colors.accent)};">A</span>
          </div>
          <div class="color-info">
            <div class="color-name">Accent Color</div>
            <div class="color-value">${data.colors.accent.toUpperCase()}</div>
          </div>
        </div>
      </div>
    </div>

    ${data.businessDescription || data.targetAudience || data.brandPersonality || data.industry ? `
    <div class="section">
      <h2 class="section-title">Brand Information</h2>
      <div class="info-grid">
        ${data.businessDescription ? `
        <div class="info-card">
          <h3>Business Description</h3>
          <p>${data.businessDescription}</p>
        </div>
        ` : ''}

        ${data.targetAudience ? `
        <div class="info-card">
          <h3>Target Audience</h3>
          <p>${data.targetAudience}</p>
        </div>
        ` : ''}

        ${data.brandPersonality ? `
        <div class="info-card">
          <h3>Brand Personality</h3>
          <p>${data.brandPersonality}</p>
        </div>
        ` : ''}

        ${data.industry ? `
        <div class="info-card">
          <h3>Industry</h3>
          <p>${data.industry}</p>
        </div>
        ` : ''}
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>Brand Guide for ${data.businessName}</p>
      <p>Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
  </div>
</body>
</html>
  `;
}

function getContrastColor(hexColor: string): string {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

export function downloadBrandGuide(data: BrandGuideData): void {
  const html = generateBrandGuideHTML(data);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${data.businessName.replace(/[^a-z0-9]/gi, '_')}_Brand_Guide.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
