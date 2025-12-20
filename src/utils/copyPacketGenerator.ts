interface WebsiteData {
  business_type: 'ecommerce' | 'service';
  brand_name: string;
  primary_color: string;
  secondary_color: string;
  font_heading: string;
  font_body: string;
}

interface WebsiteContent {
  home: {
    hero: {
      headline: string;
      subheadline: string;
      cta_text: string;
      cta_link: string;
    };
    social_proof: {
      bullets: string[];
      testimonial_snippets: string[];
    };
    features_or_services: {
      items: Array<{
        title: string;
        desc: string;
        price_optional?: string;
      }>;
    };
    faq: {
      items: Array<{
        q: string;
        a: string;
      }>;
    };
    contact: {
      phone: string;
      email: string;
      city: string;
      service_area: string;
    };
    footer: {
      short_blurb: string;
      links: string[];
    };
  };
}

export interface EcommerceCopyPacket {
  type: 'ecommerce';
  generated_at: string;
  brand: {
    name: string;
    tagline: string;
    brand_story: string;
  };
  homepage_copy: {
    hero_headline: string;
    hero_subheadline: string;
    primary_cta: string;
    value_props: string[];
    product_highlights: string[];
    faq: Array<{ question: string; answer: string }>;
  };
  product_page_copy: {
    product_title: string;
    short_description: string;
    long_description: {
      sections: Array<{ heading: string; content: string }>;
    };
    how_to_use?: string;
    shipping_returns: string;
    trust_badges: string[];
  };
  policies: {
    shipping_policy: string;
    return_policy: string;
    privacy_policy_short: string;
  };
  seo: {
    homepage_title: string;
    homepage_meta_description: string;
    product_title_tag: string;
    product_meta_description: string;
  };
  contact: {
    phone: string;
    email: string;
    city: string;
  };
  design: {
    primary_color: string;
    secondary_color: string;
    heading_font: string;
    body_font: string;
  };
}

export interface ServiceCopyPacket {
  type: 'service';
  generated_at: string;
  brand: {
    name: string;
    tagline: string;
    positioning_statement: string;
  };
  homepage_copy: {
    hero_headline: string;
    hero_subheadline: string;
    primary_cta: string;
    who_we_help: string[];
    outcomes: string[];
    services: Array<{
      title: string;
      description: string;
      starting_price?: string;
    }>;
    process: Array<{ step: number; title: string; description: string }>;
    faq: Array<{ question: string; answer: string }>;
    service_area: string;
  };
  about_copy: {
    short_about: string;
    credibility_bullets: string[];
  };
  seo: {
    homepage_title: string;
    homepage_meta_description: string;
    service_page_title: string;
    service_page_meta_description: string;
  };
  contact: {
    phone: string;
    email: string;
    city: string;
    service_area: string;
  };
  design: {
    primary_color: string;
    secondary_color: string;
    heading_font: string;
    body_font: string;
  };
}

function fillDefaults(value: string, defaultValue: string): string {
  return value?.trim() || defaultValue;
}

export function generateEcommerceCopyPacket(
  website: WebsiteData,
  content: WebsiteContent
): EcommerceCopyPacket {
  const firstProduct = content.home.features_or_services.items[0] || {
    title: '',
    desc: '',
    price_optional: '',
  };

  const brandStory = fillDefaults(
    content.home.footer.short_blurb,
    `${website.brand_name} is dedicated to bringing you quality products that make a difference. We believe in exceptional value and outstanding customer service.`
  );

  return {
    type: 'ecommerce',
    generated_at: new Date().toISOString(),
    brand: {
      name: website.brand_name,
      tagline: fillDefaults(
        content.home.hero.subheadline,
        'Quality products delivered to your door'
      ),
      brand_story: brandStory,
    },
    homepage_copy: {
      hero_headline: fillDefaults(
        content.home.hero.headline,
        `Welcome to ${website.brand_name}`
      ),
      hero_subheadline: fillDefaults(
        content.home.hero.subheadline,
        'Discover premium products designed to enhance your life'
      ),
      primary_cta: fillDefaults(content.home.hero.cta_text, 'Shop Now'),
      value_props: content.home.social_proof.bullets.length > 0
        ? content.home.social_proof.bullets
        : [
            'Fast & free shipping on orders over $50',
            '30-day money-back guarantee',
            'Trusted by thousands of happy customers',
            'Premium quality at affordable prices',
          ],
      product_highlights: content.home.features_or_services.items.length > 0
        ? content.home.features_or_services.items.map((item) => item.title)
        : ['Featured Collection', 'Best Sellers', 'New Arrivals'],
      faq: content.home.faq.items.length > 0
        ? content.home.faq.items.map((item) => ({
            question: item.q,
            answer: item.a,
          }))
        : [
            {
              question: 'How long does shipping take?',
              answer:
                'Orders typically arrive within 3-5 business days. Express shipping is available at checkout.',
            },
            {
              question: 'What is your return policy?',
              answer:
                'We offer a 30-day money-back guarantee. If you\'re not satisfied, return your item for a full refund.',
            },
            {
              question: 'Do you ship internationally?',
              answer:
                'Yes, we ship to most countries worldwide. International shipping times vary by location.',
            },
          ],
    },
    product_page_copy: {
      product_title: fillDefaults(firstProduct.title, 'Premium Product'),
      short_description: fillDefaults(
        firstProduct.desc,
        'A high-quality product designed with care and attention to detail.'
      ),
      long_description: {
        sections: [
          {
            heading: 'Product Details',
            content: fillDefaults(
              firstProduct.desc,
              'This premium product combines quality materials with exceptional craftsmanship. Perfect for everyday use, it delivers the performance and reliability you need.'
            ),
          },
          {
            heading: 'Features & Benefits',
            content:
              'Made from premium materials. Designed for durability and longevity. Easy to use and maintain. Backed by our quality guarantee.',
          },
        ],
      },
      how_to_use: 'Use as directed. Store in a cool, dry place. Follow care instructions for best results.',
      shipping_returns:
        'Free shipping on orders over $50. 30-day return policy. Items must be unused and in original packaging.',
      trust_badges: [
        'Secure checkout with SSL encryption',
        '30-day money-back guarantee',
        'Trusted by 10,000+ customers',
        'Fast & free shipping',
      ],
    },
    policies: {
      shipping_policy:
        'We offer free standard shipping on orders over $50. Standard shipping takes 3-5 business days. Express shipping is available for an additional fee and arrives in 1-2 business days.',
      return_policy:
        'We want you to love your purchase! If you\'re not completely satisfied, you can return any item within 30 days of purchase for a full refund. Items must be unused and in their original packaging.',
      privacy_policy_short:
        'We respect your privacy and will never share your personal information with third parties. Your data is secure and used only to process your orders and improve your shopping experience.',
    },
    seo: {
      homepage_title: `${website.brand_name} - Quality Products Delivered`,
      homepage_meta_description: `Shop ${website.brand_name} for premium quality products. Fast shipping, easy returns, and exceptional customer service.`,
      product_title_tag: `${fillDefaults(firstProduct.title, 'Premium Product')} | ${website.brand_name}`,
      product_meta_description: `${fillDefaults(
        firstProduct.desc,
        'A high-quality product designed with care'
      )} Order now with fast shipping and easy returns.`,
    },
    contact: {
      phone: content.home.contact.phone,
      email: content.home.contact.email,
      city: content.home.contact.city,
    },
    design: {
      primary_color: website.primary_color,
      secondary_color: website.secondary_color,
      heading_font: website.font_heading,
      body_font: website.font_body,
    },
  };
}

export function generateServiceCopyPacket(
  website: WebsiteData,
  content: WebsiteContent
): ServiceCopyPacket {
  const positioningStatement = fillDefaults(
    content.home.footer.short_blurb,
    `${website.brand_name} provides professional services tailored to your needs. We're committed to delivering exceptional results with personal attention to every project.`
  );

  const defaultProcess = [
    {
      step: 1,
      title: 'Initial Consultation',
      description: 'We discuss your needs and goals to create a customized plan.',
    },
    {
      step: 2,
      title: 'Planning & Preparation',
      description: 'We prepare everything needed to deliver outstanding results.',
    },
    {
      step: 3,
      title: 'Execution',
      description: 'Our experienced team delivers professional service with attention to detail.',
    },
    {
      step: 4,
      title: 'Follow-Up',
      description: 'We ensure your complete satisfaction and address any questions.',
    },
  ];

  return {
    type: 'service',
    generated_at: new Date().toISOString(),
    brand: {
      name: website.brand_name,
      tagline: fillDefaults(
        content.home.hero.subheadline,
        'Professional service you can trust'
      ),
      positioning_statement: positioningStatement,
    },
    homepage_copy: {
      hero_headline: fillDefaults(
        content.home.hero.headline,
        `Professional Services from ${website.brand_name}`
      ),
      hero_subheadline: fillDefaults(
        content.home.hero.subheadline,
        'Expert solutions tailored to your needs'
      ),
      primary_cta: fillDefaults(content.home.hero.cta_text, 'Get a Free Quote'),
      who_we_help: content.home.social_proof.bullets.length > 0
        ? content.home.social_proof.bullets
        : [
            'Homeowners looking for quality service',
            'Businesses needing reliable solutions',
            'Anyone seeking professional expertise',
          ],
      outcomes: [
        'Fast, reliable service',
        'Professional results guaranteed',
        'Transparent pricing with no hidden fees',
        'Friendly, experienced team',
      ],
      services: content.home.features_or_services.items.length > 0
        ? content.home.features_or_services.items.map((item) => ({
            title: item.title,
            description: item.desc,
            starting_price: item.price_optional,
          }))
        : [
            {
              title: 'Standard Service',
              description: 'Our most popular service option for typical projects.',
              starting_price: 'Contact for quote',
            },
            {
              title: 'Premium Service',
              description: 'Enhanced service with priority scheduling and extras.',
              starting_price: 'Contact for quote',
            },
          ],
      process: defaultProcess,
      faq: content.home.faq.items.length > 0
        ? content.home.faq.items.map((item) => ({
            question: item.q,
            answer: item.a,
          }))
        : [
            {
              question: 'How quickly can you start?',
              answer:
                'We typically have availability within 1-2 weeks. For urgent projects, we may be able to accommodate sooner.',
            },
            {
              question: 'What areas do you serve?',
              answer: `We serve ${content.home.contact.service_area || 'the local area'} and surrounding communities.`,
            },
            {
              question: 'Do you offer free estimates?',
              answer:
                'Yes! We provide free, no-obligation estimates for all our services.',
            },
            {
              question: 'Are you licensed and insured?',
              answer:
                'Absolutely. We are fully licensed, bonded, and insured for your protection.',
            },
          ],
      service_area: fillDefaults(
        content.home.contact.service_area,
        `${content.home.contact.city || 'Local area'} and surrounding communities`
      ),
    },
    about_copy: {
      short_about: fillDefaults(
        content.home.footer.short_blurb,
        `${website.brand_name} has been providing professional services with integrity and expertise. We take pride in every project and treat your space with respect.`
      ),
      credibility_bullets: [
        'Experienced team of professionals',
        'Fully licensed and insured',
        'Hundreds of satisfied customers',
        'A+ Rating with Better Business Bureau',
        'Commitment to quality and customer satisfaction',
      ],
    },
    seo: {
      homepage_title: `${website.brand_name} - Professional Services in ${content.home.contact.city || 'Your Area'}`,
      homepage_meta_description: `Need professional service? ${website.brand_name} offers expert solutions with guaranteed results. Licensed, insured, and trusted by your neighbors. Get a free quote today!`,
      service_page_title: `Services | ${website.brand_name}`,
      service_page_meta_description: `Explore our full range of professional services. Quality work, fair pricing, and satisfaction guaranteed. Serving ${content.home.contact.service_area || 'the local area'}.`,
    },
    contact: {
      phone: content.home.contact.phone,
      email: content.home.contact.email,
      city: content.home.contact.city,
      service_area: content.home.contact.service_area,
    },
    design: {
      primary_color: website.primary_color,
      secondary_color: website.secondary_color,
      heading_font: website.font_heading,
      body_font: website.font_body,
    },
  };
}

export function generateCopyPacket(
  website: WebsiteData,
  content: WebsiteContent
): EcommerceCopyPacket | ServiceCopyPacket {
  if (website.business_type === 'ecommerce') {
    return generateEcommerceCopyPacket(website, content);
  } else {
    return generateServiceCopyPacket(website, content);
  }
}

export function downloadCopyPacketJSON(packet: EcommerceCopyPacket | ServiceCopyPacket, brandName: string) {
  const blob = new Blob([JSON.stringify(packet, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${brandName.toLowerCase().replace(/\s+/g, '-')}-copy-packet-${packet.type}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
