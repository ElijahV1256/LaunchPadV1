import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface BusinessIdea {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  costRange: string;
}

export interface RoadmapStage {
  stage: string;
  steps: string[];
}

export async function generateBusinessIdeas(
  interests: string,
  problems: string,
  budget: string,
  availability: string,
  keywords?: string,
  previousIdeas?: string[],
  businessType?: string
): Promise<BusinessIdea[]> {
  const keywordSection = keywords ? `\nAdditional keywords/focus areas: ${keywords}` : '';
  const previousSection = previousIdeas && previousIdeas.length > 0
    ? `\n\nIMPORTANT: The user has already seen these ideas, so generate COMPLETELY DIFFERENT and UNIQUE ideas:\n${previousIdeas.join('\n')}\n\nDo NOT repeat or create similar variations of these ideas. Be creative and explore different angles, industries, or approaches.`
    : '';

  const businessTypeGuidance = businessType && businessType !== 'any'
    ? getBusinessTypeGuidance(businessType)
    : '';

  const prompt = `Generate 3 business ideas for someone with the following profile:

Interests: ${interests}
Problems they want to solve: ${problems}
Budget: ${budget}
Time availability: ${availability}${businessTypeGuidance}${keywordSection}${previousSection}

For each idea, provide:
1. A catchy business name
2. A 2-3 sentence description
3. Difficulty rating (1-5, where 1 is easiest)
4. Estimated cost range to start

Format your response as a JSON array with objects containing: name, description, difficulty, costRange

Make the ideas realistic, achievable, and aligned with their profile. Be creative and think outside the box!`;

function getBusinessTypeGuidance(type: string): string {
  const guidance: Record<string, string> = {
    service: '\n\nBUSINESS TYPE REQUIREMENT: Generate ONLY service-based businesses such as consulting, coaching, freelancing, professional services, or expertise-based businesses. Focus on businesses where the main offering is a service or expertise rather than physical products.',
    online: '\n\nBUSINESS TYPE REQUIREMENT: Generate ONLY online businesses such as e-commerce, digital products, SaaS, online courses, subscription services, or digital agencies. Focus on businesses that can operate primarily or entirely online.',
    local: '\n\nBUSINESS TYPE REQUIREMENT: Generate ONLY local brick-and-mortar or local service businesses such as restaurants, retail stores, local services, repair shops, or businesses that serve a specific geographic community.',
    product: '\n\nBUSINESS TYPE REQUIREMENT: Generate ONLY product-based businesses such as physical product manufacturing, wholesale/retail products, handmade goods, or businesses focused on creating and selling tangible products.',
  };
  return guidance[type] || '';
}

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a business consultant helping aspiring entrepreneurs. Provide practical, actionable business ideas. Always respond with valid JSON only. Be creative and avoid repeating similar ideas.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.9,
  });

  const content = response.choices[0].message.content || '[]';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  const ideas = JSON.parse(cleanContent);

  return ideas.map((idea: any, index: number) => ({
    id: `idea-${Date.now()}-${index}`,
    ...idea,
  }));
}

export async function generateRoadmap(idea: BusinessIdea): Promise<RoadmapStage[]> {
  const prompt = `Create a detailed 5-stage startup roadmap for the following business idea:

Business Name: ${idea.name}
Description: ${idea.description}
Difficulty: ${idea.difficulty}/5
Cost Range: ${idea.costRange}

For each of the 5 stages, provide:
1. A clear stage title (e.g., "Stage 1: Validation", "Stage 2: Setup")
2. 3-5 specific, actionable steps

Format your response as a JSON array with objects containing: stage, steps (array of strings)

Make the roadmap practical and sequential, taking someone from idea to launch.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a business consultant creating actionable startup roadmaps. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '[]';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleanContent);
}

export async function generateStepPathway(
  businessName: string,
  businessDescription: string,
  stageTitle: string,
  stepDescription: string
): Promise<string[]> {
  const prompt = `For a business called "${businessName}" (${businessDescription}), the entrepreneur is working on:

Stage: ${stageTitle}
Step: ${stepDescription}

Generate 4-6 specific, practical pathways or resources to help them complete this step. Each pathway should be:
- Actionable and specific
- Include concrete resources, tools, or tactics
- Be achievable for a solo entrepreneur or small team

Format your response as a JSON array of strings. Each string should be one complete pathway or approach.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a business mentor providing specific, actionable guidance. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.8,
  });

  const content = response.choices[0].message.content || '[]';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleanContent);
}

export interface BusinessPlanData {
  planName: string;
  character: string;
  problem: string;
  guide: string;
  plan: string;
  callToAction: string;
  success: string;
  failure: string;
  transformation: string;
}

export interface LogoConcept {
  name: string;
  description: string;
  imageUrl: string;
  prompt: string;
}

export async function generateBusinessPlan(
  businessName: string,
  businessDescription: string,
  stepAnswers: Record<string, string>
): Promise<BusinessPlanData> {
  const answersText = Object.entries(stepAnswers)
    .map(([step, answer]) => `${step}: ${answer}`)
    .join('\n');

  const prompt = `Based on the following business idea and the entrepreneur's answers to their roadmap steps, create a comprehensive business plan using Donald Miller's StoryBrand framework:

Business: ${businessName}
Description: ${businessDescription}

Entrepreneur's Roadmap Answers:
${answersText}

Generate a complete business plan with the following sections based on the StoryBrand framework:

1. Plan Name: A compelling, professional name for this business plan
2. Character (The Customer): Who is your ideal customer? What do they want?
3. Problem: What external, internal, and philosophical problems does your customer face?
4. Guide (Your Business): How does your business position itself as the guide? What empathy and authority do you bring?
5. Plan: What is your clear process or agreement that makes it easy for customers to do business with you?
6. Call to Action: What direct and transitional calls to action will you use?
7. Success: What does success look like for your customer? How will their life improve?
8. Failure: What's at stake if they don't use your solution?
9. Transformation: What is the identity transformation your customer will experience?

Format your response as a JSON object with keys: planName, character, problem, guide, plan, callToAction, success, failure, transformation

Make each section detailed, specific, and actionable based on the provided information.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a business strategist and StoryBrand certified guide helping entrepreneurs create compelling business plans. Always respond with valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.7,
  });

  const content = response.choices[0].message.content || '{}';
  const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  return JSON.parse(cleanContent);
}

export async function generateHybridLogoConcepts(
  businessName: string,
  brandColors: { primary: string; secondary: string; accent: string },
  businessDescription?: string,
  brandPersonality?: string,
  onProgress?: (current: number, total: number) => void
): Promise<LogoConcept[]> {
  console.log('Starting hybrid logo generation for:', businessName);
  console.log('Colors:', brandColors);

  const { composeLogoWithText, generateIconOnlyPrompt } = await import('../utils/logoComposer');

  const descriptionText = businessDescription || `a modern business`;
  const personalityText = brandPersonality || 'professional, modern, trustworthy';

  const variations = [
    { style: 'ultra minimal geometric, simple clean shapes', layout: 'horizontal' as const },
    { style: 'modern abstract lettermark, sleek and minimal', layout: 'horizontal' as const },
    { style: 'contemporary tech symbol, flat and simple', layout: 'vertical' as const },
    { style: 'minimalist linear icon, maximum simplicity', layout: 'horizontal' as const },
    { style: 'clean geometric mark, professional modern', layout: 'stacked' as const },
    { style: 'simple abstract shape, sleek contemporary', layout: 'vertical' as const }
  ];

  const concepts: LogoConcept[] = [];

  for (let i = 0; i < variations.length; i++) {
    const { style, layout } = variations[i];

    const iconPrompt = generateIconOnlyPrompt(
      descriptionText,
      personalityText,
      brandColors,
      style
    );

    console.log(`Generating icon ${i + 1}/${variations.length}:`, style);
    onProgress?.(i * 2, variations.length * 2);

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: iconPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        response_format: 'url',
      });

      const iconUrl = response.data[0].url;
      console.log(`Icon ${i + 1} generated successfully:`, iconUrl);

      if (iconUrl) {
        onProgress?.(i * 2 + 1, variations.length * 2);

        try {
          console.log(`Composing logo with text for ${businessName}...`);
          const composedLogoUrl = await composeLogoWithText({
            businessName,
            iconImageUrl: iconUrl,
            primaryColor: brandColors.primary,
            secondaryColor: brandColors.secondary,
            layout,
            fontSize: 48,
            fontFamily: 'Arial, Helvetica, sans-serif'
          });

          concepts.push({
            name: `${businessName} - ${style.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
            description: `A professional logo featuring ${style}, with guaranteed accurate text rendering.`,
            imageUrl: composedLogoUrl,
            prompt: iconPrompt,
          });

          console.log(`Logo ${i + 1} composed successfully`);
        } catch (composeError: any) {
          console.error(`Error composing logo ${i + 1}:`, composeError);
          console.error('Compose error details:', composeError?.message);
        }
      }

      onProgress?.(i * 2 + 2, variations.length * 2);
    } catch (error: any) {
      console.error(`Error generating icon ${i + 1}:`, error);
      console.error('Icon generation error details:', error?.message, error?.response?.data);
    }
  }

  console.log(`Generated ${concepts.length} hybrid logo concepts total`);
  return concepts;
}

export async function generateLogoConcepts(
  businessName: string,
  brandColors: { primary: string; secondary: string; accent: string },
  businessDescription?: string,
  brandPersonality?: string,
  onProgress?: (current: number, total: number) => void
): Promise<LogoConcept[]> {
  console.log('Starting logo generation for:', businessName);
  console.log('Colors:', brandColors);

  const descriptionText = businessDescription || `A business called ${businessName}`;
  const personalityText = brandPersonality || 'professional, modern, trustworthy';

  const basePrompt = `You are the Launch Pad Logo Generator. Create a SIMPLE, CLEAN, MINIMAL logo.

BUSINESS NAME (MUST BE SPELLED EXACTLY): "${businessName}"
Business description: ${descriptionText}
Brand personality: ${personalityText}
Colors: ${brandColors.primary}, ${brandColors.secondary}, ${brandColors.accent}

STRICT REQUIREMENTS:
- Logo must contain ONLY: business name + one very small simple icon
- Icon must be: line art, geometric shape, or single simple shape
- NO detailed illustrations, NO mascots, NO characters, NO complex graphics
- NO gradients (unless very simple), NO 3D effects, NO multiple icons
- NO busy compositions
- Clean, minimal, flat design
- Modern sans-serif typography
- Balanced spacing and white space
- Professional and trustworthy look
- Easy to recreate in Canva, Adobe Express, or Figma
- White or transparent background

CRITICAL: Verify spelling is EXACTLY "${businessName}" letter-by-letter.`;

  const variations = [
    'business name with one minimal geometric icon (circle, square, or triangle based)',
    'business name with one simple line art icon',
    'business name with one clean abstract symbol'
  ];

  const concepts: LogoConcept[] = [];

  for (let i = 0; i < variations.length; i++) {
    const variation = variations[i];
    const fullPrompt = `${basePrompt}

SPECIFIC VARIATION: ${variation}

Remember: Keep it minimal, clean, and simple. Business name "${businessName}" spelled exactly + one small simple icon only.`;

    console.log(`Generating logo ${i + 1}/${variations.length}:`, variation);
    onProgress?.(i, variations.length);

    try {
      const response = await openai.images.generate({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        style: 'natural',
        response_format: 'url',
      });

      const imageUrl = response.data[0].url;
      console.log(`Logo ${i + 1} generated successfully:`, imageUrl);

      if (imageUrl) {
        concepts.push({
          name: `${businessName} - ${variation.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
          description: `A professional logo featuring ${variation}, designed with your brand colors in a clean, modern style.`,
          imageUrl: imageUrl,
          prompt: fullPrompt,
        });
      }

      onProgress?.(i + 1, variations.length);
    } catch (error: any) {
      console.error(`Error generating logo ${i + 1}:`, error);
      console.error('Error details:', error?.message, error?.response?.data);
    }
  }

  console.log(`Generated ${concepts.length} logo concepts total`);
  return concepts;
}

export async function regenerateLogoWithChanges(
  originalLogo: LogoConcept,
  businessName: string,
  brandColors: { primary: string; secondary: string; accent: string },
  changeRequest: string
): Promise<LogoConcept> {
  const modifiedPrompt = `${originalLogo.prompt}

REQUESTED CHANGES: ${changeRequest}

CRITICAL REQUIREMENTS:
1. Business name MUST be spelled EXACTLY as "${businessName}" - letter by letter, no typos
2. Apply the requested changes
3. MAINTAIN minimal, clean, simple design
4. Logo must still be: business name + ONE small simple icon only
5. NO detailed illustrations, NO mascots, NO complex graphics
6. Keep it easy to recreate in Canva/Figma
7. Verify spelling: "${businessName}"`;

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: modifiedPrompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
    style: 'natural',
    response_format: 'url',
  });

  const imageUrl = response.data[0].url;

  return {
    name: originalLogo.name,
    description: `${originalLogo.description} (Modified: ${changeRequest})`,
    imageUrl: imageUrl || originalLogo.imageUrl,
    prompt: modifiedPrompt,
  };
}

export async function generateSlogan(
  businessName: string,
  businessDescription: string,
  targetAudience?: string,
  brandPersonality?: string
): Promise<string> {
  const audienceText = targetAudience ? `Target audience: ${targetAudience}.` : '';
  const personalityText = brandPersonality ? `Brand personality: ${brandPersonality}.` : '';

  const prompt = `Create a short, memorable slogan (5-7 words max) for a business called "${businessName}".
${businessDescription}
${audienceText}
${personalityText}

The slogan should be:
- Catchy and easy to remember
- Reflect what the business offers
- Professional yet creative
- No more than 7 words

Return ONLY the slogan text, nothing else.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.9,
    max_tokens: 50,
  });

  return response.choices[0].message.content?.trim() || 'Your Business, Your Way';
}

export async function generateCompleteBrandFoundation(
  businessName: string,
  businessDescription: string,
  targetAudience?: string,
  brandPersonality?: string,
  industry?: string
): Promise<{
  mission: string;
  vision: string;
  coreValues: string[];
  uvp: string;
  voiceDescription: string;
  voiceExamples: string[];
  elevatorPitch: string;
  messagingDos: string[];
  messagingDonts: string[];
}> {
  const audienceText = targetAudience ? `Target audience: ${targetAudience}.` : '';
  const personalityText = brandPersonality ? `Brand personality: ${brandPersonality}.` : '';
  const industryText = industry ? `Industry: ${industry}.` : '';

  const prompt = `You are an expert brand strategist. Create comprehensive brand foundation content for "${businessName}".

Business: ${businessDescription}
${audienceText}
${personalityText}
${industryText}

Generate the following in JSON format:
{
  "mission": "A clear mission statement (1-2 sentences about what the business does and why)",
  "vision": "An inspiring vision statement (1-2 sentences about future goals)",
  "coreValues": ["Value 1", "Value 2", "Value 3", "Value 4", "Value 5"] (5 core values),
  "uvp": "A unique value proposition (1 sentence explaining what makes this business different)",
  "voiceDescription": "Brand voice description (professional, friendly, etc. - 1 sentence)",
  "voiceExamples": ["Example 1", "Example 2"] (2 sample sentences in the brand voice),
  "elevatorPitch": "A compelling elevator pitch (2-3 sentences)",
  "messagingDos": ["Do 1", "Do 2", "Do 3"] (3 messaging do's),
  "messagingDonts": ["Don't 1", "Don't 2", "Don't 3"] (3 messaging don'ts)
}

Return ONLY valid JSON, no markdown formatting.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 800,
  });

  const content = response.choices[0].message.content?.trim() || '{}';

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error('Failed to parse brand foundation JSON:', e);
    return {
      mission: `To provide exceptional ${businessDescription}`,
      vision: `To become a leading provider in our industry`,
      coreValues: ['Quality', 'Integrity', 'Innovation', 'Customer Focus', 'Excellence'],
      uvp: `Delivering outstanding value through ${businessDescription}`,
      voiceDescription: 'Professional, approachable, and trustworthy',
      voiceExamples: ['We make it easy for you.', 'Your success is our priority.'],
      elevatorPitch: `${businessName} helps ${targetAudience || 'customers'} by providing ${businessDescription}. We stand out through our commitment to quality and customer satisfaction.`,
      messagingDos: ['Be clear and concise', 'Focus on customer benefits', 'Maintain consistency'],
      messagingDonts: ['Use jargon', 'Make false promises', 'Ignore customer feedback']
    };
  }
}

export async function generateMarketingContent(params: {
  type: 'flyers' | 'social_posts' | 'message_templates' | 'ad_strategy';
  businessName: string;
  brandColors: { primary: string; secondary: string; accent: string };
  businessDescription?: string;
  logoDescription?: string;
  logoUrl?: string;
  targetAudience?: string;
  brandVoice?: string;
  tagline?: string;
  contactInfo?: string;
  storyBrandData?: any;
}): Promise<any> {
  const { type, businessName, businessDescription, brandColors, logoDescription, logoUrl, targetAudience, brandVoice, tagline, contactInfo, storyBrandData } = params;

  if (type === 'flyers') {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-flyers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          brandColors,
          businessDescription,
          targetAudience,
          brandVoice,
          tagline,
          contactInfo,
          logoUrl,
          storyBrandData,
          openaiApiKey: import.meta.env.VITE_OPENAI_API_KEY
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        console.error('Edge function status:', response.status);
        throw new Error(`Failed to generate flyers (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      if (!result.flyers || result.flyers.length === 0) {
        throw new Error('No flyers returned from edge function');
      }

      return result.flyers;
    } catch (error: any) {
      console.error('Error calling generate-flyers edge function:', error);
      throw new Error(`Flyer generation failed: ${error.message}`);
    }
  }

  if (type === 'social_posts') {
    const prompt = `Generate 3 Instagram post ideas for "${businessName}".
${businessDescription || ''}

For each post, provide:
1. An engaging caption (2-3 sentences, include call to action)
2. Relevant hashtags (8-12 hashtags)

Format as JSON array with objects containing: caption, hashtags

Make them engaging and suited for Instagram.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a social media expert creating Instagram content. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || '[]';
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  }

  if (type === 'message_templates') {
    const prompt = `Generate 3 intro message templates for "${businessName}" - one for SMS, one for email, and one for DM.
${businessDescription || ''}

For each template, provide:
1. Type (sms, email, or dm)
2. A title
3. The message content (keep SMS under 160 chars, email and DM can be longer)

Format as JSON array with objects containing: type, title, content

Make them friendly, professional, and include a clear call to action.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing copywriter creating outreach templates. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const content = response.choices[0].message.content || '[]';
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  }

  if (type === 'ad_strategy') {
    const prompt = `Create a simple advertising strategy for "${businessName}".
${businessDescription || ''}

Provide:
1. Target audience description (2-3 sentences)
2. Budget suggestion (detailed breakdown with recommendations)
3. Daily content calendar (7 days of activities)

Format as JSON object with: targetAudience, budget, calendar (array of objects with day and activity)

Make it practical and achievable for a new business.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an advertising strategist helping new businesses launch. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0].message.content || '{}';
    const cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanContent);
  }

  return null;
}
