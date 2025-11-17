interface WebsiteCopy {
  hero_headline: string;
  hero_subheadline: string;
  benefits: string[];
  offer_section: string;
  pricing: string;
  testimonials: Array<{
    name: string;
    text: string;
    rating: number;
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

interface BrandData {
  selected_name: string;
  tagline: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export function formatForWix(
  copy: WebsiteCopy,
  brandData: BrandData
): string {
  const sections = [
    '='.repeat(60),
    'WIX WEBSITE CONTENT - READY TO IMPORT',
    '='.repeat(60),
    '',
    `Business Name: ${brandData.selected_name}`,
    `Tagline: ${brandData.tagline}`,
    '',
    'COLOR PALETTE',
    '-'.repeat(60),
    `Primary Color: ${brandData.brand_colors.primary}`,
    `Secondary Color: ${brandData.brand_colors.secondary}`,
    `Accent Color: ${brandData.brand_colors.accent}`,
    '',
    '',
    'HERO SECTION',
    '-'.repeat(60),
    'Headline:',
    copy.hero_headline,
    '',
    'Subheadline:',
    copy.hero_subheadline,
    '',
    '',
    'BENEFITS SECTION',
    '-'.repeat(60),
    'Title: Why Choose Us?',
    '',
    ...copy.benefits.map((benefit, i) => `${i + 1}. ${benefit}`),
    '',
    '',
    'OFFER SECTION',
    '-'.repeat(60),
    'Title: What We Offer',
    '',
    copy.offer_section,
    '',
    '',
    'PRICING SECTION',
    '-'.repeat(60),
    'Title: Pricing',
    '',
    copy.pricing,
    '',
    '',
    'TESTIMONIALS SECTION',
    '-'.repeat(60),
    'Title: What Our Customers Say',
    '',
    ...copy.testimonials.flatMap((testimonial, i) => [
      `Testimonial ${i + 1}:`,
      `"${testimonial.text}"`,
      `- ${testimonial.name} (${'⭐'.repeat(testimonial.rating)})`,
      '',
    ]),
    '',
    'FAQ SECTION',
    '-'.repeat(60),
    'Title: Frequently Asked Questions',
    '',
    ...copy.faqs.flatMap((faq, i) => [
      `Q${i + 1}: ${faq.question}`,
      `A${i + 1}: ${faq.answer}`,
      '',
    ]),
    '',
    '='.repeat(60),
    'IMPORT INSTRUCTIONS FOR WIX',
    '='.repeat(60),
    '',
    '1. Go to Wix.com and create a new site',
    '2. Choose a template that matches your industry',
    '3. Use the color palette above in the Site Design settings',
    '4. Copy each section above into the corresponding section in Wix',
    '5. Add your business name and logo to the header',
    '6. Customize images and layout to match your brand',
    '',
    'TIP: Wix ADI can help you get started faster by auto-generating',
    'a layout based on your content.',
    '',
    '='.repeat(60),
  ];

  return sections.join('\n');
}

export function downloadWixExport(content: string, businessName: string): void {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${businessName.replace(/\s+/g, '-').toLowerCase()}-wix-content.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(content: string): Promise<void> {
  await navigator.clipboard.writeText(content);
}
