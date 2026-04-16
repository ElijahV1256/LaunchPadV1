export interface FoundationSection {
  id: string;
  title: string;
  subtitle?: string;
  paragraphs?: string[];
  formula?: string;
  formulaPlain?: string;
  questions?: string[];
  items?: FoundationItem[];
  numbered?: boolean;
  phases?: FoundationPhase[];
  funnelSteps?: string[];
  callout?: { title: string; body: string[] };
}

export interface FoundationItem {
  title: string;
  description: string;
  example?: string;
}

export interface FoundationPhase {
  title: string;
  description?: string;
  bullets?: string[];
}

export const introSection = {
  title: 'Before You Post a Single Thing: Read This',
  paragraphs: [
    'Most business owners post on social media and wonder why nothing happens. Here\'s why: they\'re talking about themselves. They\'re the hero of their own story. Big mistake.',
    'Your customer is the hero. You are the guide.',
    'Think of every great story. Luke Skywalker had Yoda. Frodo had Gandalf. Rocky had Mickey. The hero has a problem \u2014 the guide has a plan to solve it.',
  ],
  threeThings: [
    'Show your customer you understand their problem',
    'Position yourself as the guide with the plan',
    'Give them so much value upfront they feel stupid not calling you',
  ],
  closing: 'If you do those three things on every post, every platform, every day \u2014 you win. Period.',
};

export const foundationSections: FoundationSection[] = [
  {
    id: 'core-formula',
    title: 'The Core Formula (Use This Everywhere)',
    subtitle: 'Before we break down each platform, memorize this. It\'s the backbone of everything that follows.',
    formula: 'Dream Outcome \u00d7 Likelihood of Success \u00f7 (Time Delay \u00d7 Effort Required) = Perceived Value',
    formulaPlain: 'In plain English: Make the result sound amazing, believable, fast, and easy \u2014 and people will buy.',
    questions: [
      '\u201cWhat do I want?\u201d (dream outcome)',
      '\u201cWill this actually work for me?\u201d (proof)',
      '\u201cHow fast can I get it?\u201d (speed)',
      '\u201cIs this going to be a pain?\u201d (ease)',
    ],
    paragraphs: [
      'If your post doesn\'t answer one of these \u2014 don\'t post it.',
    ],
  },
  {
    id: 'content-framework',
    title: 'The Universal Content Framework',
    subtitle: 'Every post on every platform should follow this structure:',
    paragraphs: [
      'HOOK \u2192 VALUE \u2192 CTA',
    ],
    items: [
      {
        title: 'Hook (first 3 seconds or first line)',
        description: 'Stop the scroll. Make them curious or emotional.',
      },
      {
        title: 'Value',
        description: 'Give them something useful they can use right now \u2014 even if they never buy from you.',
      },
      {
        title: 'CTA',
        description: 'Tell them exactly what to do next. One action. No choices.',
      },
    ],
    callout: {
      title: 'Remember',
      body: [
        'If you give enough value, asking for the sale feels natural.',
        'If you give no value, asking for the sale feels desperate.',
      ],
    },
  },
  {
    id: 'hook-templates',
    title: 'The 7 Hook Templates That Always Work',
    subtitle: 'Swipe these. Adapt them to your business. Use them forever.',
    numbered: true,
    items: [
      {
        title: 'If you [problem], stop doing [wrong thing] and do this instead.',
        description: '',
        example: 'If your tree service is losing money, stop discounting and do this instead.',
      },
      {
        title: 'I tried [thing] for [time]. Here\'s what happened.',
        description: '',
        example: 'I tried cold calling for 90 days. Here\'s what worked.',
      },
      {
        title: 'The #1 mistake [your customer type] makes with [topic].',
        description: '',
        example: 'The #1 mistake homeowners make when hiring a tree service.',
      },
      {
        title: 'Nobody talks about this, but it\'s costing you [money/time/results].',
        description: '',
        example: 'Nobody talks about this, but it\'s costing contractors thousands.',
      },
      {
        title: 'How to [desired result] without [thing they hate].',
        description: '',
        example: 'How to get more clients without spending a dollar on ads.',
      },
      {
        title: '[Number] things I wish I knew before [starting X].',
        description: '',
        example: '5 things I wish I knew before starting my business.',
      },
      {
        title: 'This is the [tool/strategy/script] that [specific result].',
        description: '',
        example: 'This is the email script that booked me 14 clients last month.',
      },
    ],
  },
  {
    id: '90-day-plan',
    title: 'The 90-Day Launch Plan',
    subtitle: 'Don\'t try to master all six platforms at once. You\'ll burn out. Here\'s the order:',
    phases: [
      {
        title: 'Days 1\u201330: Pick Your Primary Platform',
        description: 'Choose one platform where your ideal customer already hangs out. Post there daily. Ignore everything else for 30 days.',
        bullets: [
          'Local service business? \u2192 Instagram + Facebook',
          'B2B / professional services? \u2192 LinkedIn',
          'Younger consumer / lifestyle? \u2192 TikTok',
          'Education-heavy / high-ticket? \u2192 YouTube',
        ],
      },
      {
        title: 'Days 31\u201360: Add a Second Platform',
        description: 'Pick one that complements your first (usually a short-form video platform if you started with written content, or vice versa). Repurpose your content between the two.',
      },
      {
        title: 'Days 61\u201390: Build the Funnel',
        description: 'By now, you should know what content works. Set up:',
        bullets: [
          'A simple landing page with one offer',
          'An email list capture',
          'A DM follow-up script for each platform',
        ],
      },
    ],
  },
  {
    id: 'lead-capture',
    title: 'The Lead Capture System',
    subtitle: 'Content without capture = wasted effort. Here\'s the simplest system that works.',
    paragraphs: ['The One-Page Funnel'],
    funnelSteps: [
      'Social media post \u2192 value + DM keyword or link',
      'Link goes to a simple landing page with one offer (free guide, free consultation, free audit \u2014 whatever fits your business)',
      'They enter name + email + phone to get the free thing',
      'Automated text + email goes out immediately with the free resource + a question (\u201cWhat\u2019s your biggest challenge with [X]?\u201d)',
      'They reply. You have a conversation. You book the call.',
    ],
    callout: {
      title: 'That\'s it.',
      body: ['That\'s the whole system. Don\'t overcomplicate it.'],
    },
  },
  {
    id: 'one-rule',
    title: 'The One Rule That Beats Every Strategy',
    paragraphs: [
      'Show up every day. For at least a year.',
      'Most businesses quit at 90 days because they don\'t see results. The ones who make it to 12 months win, because by then:',
    ],
    items: [
      { title: 'The algorithms know what you do', description: '' },
      { title: 'Your best content compounds', description: '' },
      { title: 'Your audience trusts you', description: '' },
      { title: 'Your offer is dialed in', description: '' },
    ],
    callout: {
      title: 'You don\'t need to be the best.',
      body: ['You need to be the one who didn\'t quit.'],
    },
  },
];
