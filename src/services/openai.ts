import OpenAI from 'openai';

// NOTE: OpenAI client is only created when needed in specific functions
// The API key should be stored in Supabase Edge Function secrets, not in frontend env vars

// Lazy client initialization - only creates client when actually needed
let _openaiClient: OpenAI | null = null;
function getOpenAIClient(): OpenAI {
  if (!_openaiClient) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. This function requires direct OpenAI access.');
    }
    _openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
  }
  return _openaiClient;
}

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

// DEPRECATED: This function is no longer used. Business ideas are now generated
// via the Supabase Edge Function at /functions/v1/generate-business-ideas
// The edge function uses Deno.env.get("OPENAI_API_KEY") for secure API key management
// See: src/pages/Ideas.tsx for the current implementation

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

  const response = await getOpenAIClient().chat.completions.create({
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
  try {
    return JSON.parse(cleanContent);
  } catch {
    throw new Error('Failed to parse roadmap response from AI');
  }
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

  const response = await getOpenAIClient().chat.completions.create({
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
  try {
    return JSON.parse(cleanContent);
  } catch {
    throw new Error('Failed to parse pathway response from AI');
  }
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

  const response = await getOpenAIClient().chat.completions.create({
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
  try {
    return JSON.parse(cleanContent);
  } catch {
    throw new Error('Failed to parse business plan response from AI');
  }
}

// DEPRECATED: This function is no longer used. Logos are now generated as icon-only
// via the Supabase Edge Function at /functions/v1/generate-logo-concepts
// The edge function generates clean icon marks without text

export async function generateLogoConcepts(
  businessName: string,
  industry: string,
  brandColors: { primary: string; secondary: string; accent: string },
  businessDescription?: string,
  brandPersonality?: string,
  onProgress?: (current: number, total: number) => void
): Promise<LogoConcept[]> {
  console.log('Starting logo generation for:', businessName, 'in', industry);
  console.log('Colors:', brandColors);

  // Call the Supabase Edge Function instead of OpenAI directly
  try {
    onProgress?.(0, 6);

    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout for 6 logos

    // Simulate progress updates while waiting for the edge function
    let currentProgress = 0;
    const progressInterval = setInterval(() => {
      if (currentProgress < 5) {
        currentProgress += 1;
        onProgress?.(currentProgress, 6);
      }
    }, 15000); // Update every 15 seconds

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-logo-concepts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName,
            industry,
            brandColors,
            businessDescription,
            brandPersonality,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to generate logo concepts');
      }

      const { concepts } = await response.json();

      onProgress?.(6, 6);

      console.log(`Generated ${concepts.length} logo concepts total`);

      if (!concepts || concepts.length === 0) {
        throw new Error('No logos were generated. Please try again.');
      }

      return concepts;
    } catch (error: any) {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      if (error.name === 'AbortError') {
        throw new Error('Logo generation timed out. This usually means the AI service is overloaded. Please try again in a few moments.');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error generating logos:', error);
    throw new Error(error.message || 'Failed to generate logos');
  }
}

export async function regenerateLogoWithChanges(
  originalLogo: LogoConcept,
  businessName: string,
  industry: string,
  brandColors: { primary: string; secondary: string; accent: string },
  changeRequest: string
): Promise<LogoConcept> {
  // Call the Supabase Edge Function for logo regeneration
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-logo-concepts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            businessName,
            industry,
            brandColors,
            businessDescription: `${originalLogo.description}. MODIFICATIONS REQUESTED: ${changeRequest}`,
            brandPersonality: changeRequest,
            regenerate: true,
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${response.status} - ${errorText}`);
        }
        throw new Error(errorData.error || 'Failed to regenerate logo');
      }

      const { concepts } = await response.json();

      if (!concepts || concepts.length === 0) {
        throw new Error('No logo generated. Please try again.');
      }

      // Return the first generated concept
      return {
        name: originalLogo.name,
        description: `${originalLogo.description} (Modified: ${changeRequest})`,
        imageUrl: concepts[0].imageUrl,
        prompt: concepts[0].prompt,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Logo regeneration timed out. Please try again in a few moments.');
      }
      throw error;
    }
  } catch (error: any) {
    console.error('Error regenerating logo:', error);
    throw new Error(error.message || 'Logo regeneration failed');
  }
}

export async function generateSlogan(
  businessName: string,
  businessDescription: string,
  targetAudience?: string,
  brandPersonality?: string
): Promise<string> {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-slogan`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
          targetAudience,
          brandPersonality,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error response:', errorText);
      throw new Error(`Failed to generate slogan (${response.status})`);
    }

    const result = await response.json();
    return result.slogan || 'Your Business, Your Way';
  } catch (error: any) {
    console.error('Error calling generate-slogan edge function:', error);
    return 'Your Business, Your Way';
  }
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
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-brand-foundation`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
          targetAudience,
          brandPersonality,
          industry,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Edge function error response:', errorText);
      throw new Error(`Failed to generate brand foundation (${response.status})`);
    }

    const result = await response.json();
    return result.brandFoundation;
  } catch (error: any) {
    console.error('Error calling generate-brand-foundation edge function:', error);
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
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-social-posts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
          targetAudience,
          brandVoice,
          storyBrandData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Failed to generate social posts (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      if (!result.posts || result.posts.length === 0) {
        throw new Error('No social posts returned from edge function');
      }

      return result.posts;
    } catch (error: any) {
      console.error('Error calling generate-social-posts edge function:', error);
      throw new Error(`Social posts generation failed: ${error.message}`);
    }
  }

  if (type === 'message_templates') {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-message-templates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Failed to generate message templates (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      if (!result.templates || result.templates.length === 0) {
        throw new Error('No message templates returned from edge function');
      }

      return result.templates;
    } catch (error: any) {
      console.error('Error calling generate-message-templates edge function:', error);
      throw new Error(`Message templates generation failed: ${error.message}`);
    }
  }

  if (type === 'ad_strategy') {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-ad-strategy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          businessName,
          businessDescription,
          targetAudience,
          brandVoice,
          tagline,
          storyBrandData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error response:', errorText);
        throw new Error(`Failed to generate ad strategy (${response.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await response.json();

      if (!result.strategy) {
        throw new Error('No ad strategy returned from edge function');
      }

      return result.strategy;
    } catch (error: any) {
      console.error('Error calling generate-ad-strategy edge function:', error);
      throw new Error(`Ad strategy generation failed: ${error.message}`);
    }
  }

  return null;
}
