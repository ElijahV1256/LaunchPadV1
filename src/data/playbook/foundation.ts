export interface FoundationSection {
  id: string;
  title: string;
  subtitle?: string;
  content: string[];
  items?: { title: string; description: string }[];
  numbered?: boolean;
}

export const foundationSections: FoundationSection[] = [
  {
    id: 'hero-guide',
    title: 'The Hero / Guide Principle',
    subtitle: 'You are not the hero. Your customer is.',
    content: [
      'Every piece of content you post should position your customer as the hero of the story and your business as the guide that helps them win.',
      'Stop talking about yourself. Start talking about their problems, desires, and transformation.',
    ],
    items: [
      {
        title: 'The Hero',
        description: 'Your customer — they have a problem, a desire, and a journey ahead of them.',
      },
      {
        title: 'The Guide',
        description: 'Your business — you have the empathy to understand their pain and the authority to help them solve it.',
      },
      {
        title: 'The Plan',
        description: 'Your content — it shows the hero how to get from where they are to where they want to be.',
      },
    ],
  },
  {
    id: 'value-equation',
    title: 'The Value Equation',
    subtitle: 'Why people actually buy',
    content: [
      'People don\'t buy products. They buy outcomes. The faster and easier you can deliver a dream outcome with the least effort and risk, the more valuable your offer becomes.',
    ],
    items: [
      {
        title: 'Dream Outcome',
        description: 'What does your customer actually want? Not your product — their end result.',
      },
      {
        title: 'Perceived Likelihood of Achievement',
        description: 'Do they believe you can actually deliver? Proof, testimonials, and specificity increase this.',
      },
      {
        title: 'Time Delay',
        description: 'How long until they see results? Shorter = more valuable.',
      },
      {
        title: 'Effort & Sacrifice',
        description: 'How much work do they have to put in? Less = more valuable.',
      },
    ],
  },
  {
    id: 'hook-value-cta',
    title: 'Hook → Value → CTA',
    subtitle: 'The 3-part framework for every post',
    content: [
      'Every single piece of content you create — whether it\'s a reel, a tweet, a carousel, or a blog post — should follow this structure:',
    ],
    items: [
      {
        title: '1. Hook (first 1-3 seconds)',
        description: 'Stop the scroll. Ask a provocative question, state a bold claim, or call out your audience directly. If the hook fails, nothing else matters.',
      },
      {
        title: '2. Value (the body)',
        description: 'Teach something, tell a story, or share a perspective that makes the viewer think "I needed this." Don\'t hold back — free value builds trust faster than anything.',
      },
      {
        title: '3. CTA (the close)',
        description: 'Tell them exactly what to do next. Follow, save, comment, DM, click the link. One clear action. Never leave them wondering.',
      },
    ],
  },
  {
    id: 'hook-templates',
    title: '7 Hook Templates That Work Everywhere',
    subtitle: 'Swipe these and customize for your niche',
    content: [
      'These hooks have been tested across thousands of posts in every niche. Use them as starting points and adapt the specifics to your audience.',
    ],
    items: [
      {
        title: 'The Contrarian',
        description: '"Stop [common advice]. Here\'s what actually works..."',
      },
      {
        title: 'The Curiosity Gap',
        description: '"I tried [X] for 30 days. Here\'s what happened..."',
      },
      {
        title: 'The Callout',
        description: '"If you\'re a [type of person] struggling with [problem], read this."',
      },
      {
        title: 'The Number',
        description: '"[X] things I wish I knew before [starting/doing something]."',
      },
      {
        title: 'The Story',
        description: '"Last year I was [situation]. Today I [transformation]. Here\'s how..."',
      },
      {
        title: 'The Question',
        description: '"Why do most [people/businesses] fail at [X]?"',
      },
      {
        title: 'The Bold Claim',
        description: '"You don\'t need [thing everyone thinks you need] to [desired outcome]."',
      },
    ],
    numbered: true,
  },
  {
    id: '90-day-plan',
    title: 'The 90-Day Launch Plan',
    subtitle: 'Your roadmap from zero to generating leads',
    content: [
      'Don\'t try to do everything at once. Follow this phased approach to build momentum without burning out.',
    ],
    items: [
      {
        title: 'Days 1-30: Foundation',
        description: 'Pick ONE platform. Optimize your profile. Post 3-5x per week using Hook → Value → CTA. Study what performs. Engage 15 minutes daily with your target audience. Set up your lead capture (link in bio, DM automation, or landing page).',
      },
      {
        title: 'Days 31-60: Acceleration',
        description: 'Double down on what\'s working. Start conversations in DMs with engaged followers. Create your first lead magnet (free guide, checklist, or template). Test different content formats. Build a simple email sequence for new leads.',
      },
      {
        title: 'Days 61-90: Conversion',
        description: 'Launch your first offer or service to warm leads. Use social proof from early wins. Create case studies and testimonials. Refine your content pillars based on data. Systematize your posting and engagement routine.',
      },
    ],
  },
  {
    id: 'lead-capture',
    title: 'The Lead Capture System',
    subtitle: 'Turn followers into real contacts',
    content: [
      'Followers are vanity. Leads are money. Every platform strategy should funnel people into a system you own — your email list, your phone contacts, your CRM.',
    ],
    items: [
      {
        title: 'Lead Magnet',
        description: 'Create something free and valuable that solves a specific, small problem. A checklist, template, mini-guide, or free consultation. This is your "ethical bribe" to get contact info.',
      },
      {
        title: 'Landing Page',
        description: 'A simple page with one job: collect their name and email in exchange for the lead magnet. No distractions, no navigation, just the offer.',
      },
      {
        title: 'DM Strategy',
        description: 'When someone engages with your content, start a real conversation. Don\'t pitch immediately. Ask questions, provide value, and when the time is right, share your offer.',
      },
      {
        title: 'Follow-Up Sequence',
        description: 'Once you have their email, send 3-5 value-packed emails before making an offer. Build trust first, sell second.',
      },
    ],
  },
];
