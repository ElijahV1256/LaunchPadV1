export interface PlatformSection {
  id: string;
  type: 'intro' | 'list-grid' | 'content-mix' | 'formula-steps' | 'hooks' | 'content-ideas' | 'text-section' | 'lead-gen' | 'bio-template' | 'hashtag' | 'cadence' | 'kickstart' | 'one-rule';
  title: string;
  subtitle?: string;
  intro?: string;
  items?: { title: string; description: string }[];
  bullets?: string[];
  steps?: { step: number; title: string; description: string }[];
  contentMix?: { type: string; frequency: string; description: string }[];
  formulaSteps?: { label: string; text: string }[];
  hooks?: string[];
  postingCadence?: { label: string; content: string }[];
  kickstart?: { week: string; description: string }[];
  bioExample?: { label: string; lines: string[] };
  hashtagTiers?: { tier: string; range: string; count: string }[];
  callout?: { title: string; body: string[] };
  leadGenIntro?: string;
  leadGenSteps?: { title: string; description: string }[];
  leadGenReasons?: string[];
  paragraphs?: string[];
  oneRule?: { title: string; description: string };
}

export interface PlatformData {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  colorLight: string;
  icon: string;
  whatItDoes: string;
  whatItsNotFor: string;
  sections: PlatformSection[];
}

export const platforms: PlatformData[] = [
  {
    slug: 'instagram',
    name: 'Instagram',
    tagline: 'The Trust Builder',
    color: '#E1306C',
    colorLight: 'rgba(225, 48, 108, 0.15)',
    icon: 'instagram',
    whatItDoes: 'Builds know-like-trust with your local audience and ideal customer through a mix of polish and personality.',
    whatItsNotFor: 'Direct sales. Instagram is a trust machine, not a cash register.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who Instagram Is Best For',
        bullets: [
          'Local service businesses (trades, home services, restaurants, gyms)',
          'Lifestyle brands and personal brands',
          'Anyone selling something visual',
          'Businesses that rely on referrals and word-of-mouth',
        ],
        callout: {
          title: '',
          body: ['If your customer would Google you before hiring you, Instagram is where they\'ll check you out. Make sure what they find makes them trust you.'],
        },
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix (Post This Weekly)',
        contentMix: [
          { type: 'Reels', frequency: '3x/week', description: 'Your main reach driver' },
          { type: 'Carousels', frequency: '2x/week', description: 'Your teaching tool' },
          { type: 'Stories', frequency: '3\u20135/day', description: 'Your relationship builder' },
          { type: 'Photo Post', frequency: '1x/week', description: 'For the feed aesthetic' },
        ],
        callout: {
          title: '',
          body: ['Reels get you reach. Carousels get saves and shares. Stories keep your existing audience warm. You need all three working together.'],
        },
      },
      {
        id: 'reel-formula',
        type: 'formula-steps',
        title: 'The Reel Formula That Works',
        formulaSteps: [
          { label: '0\u20133 seconds', text: 'Pattern interrupt. Bold claim, surprising visual, or direct question.' },
          { label: '3\u201315 seconds', text: 'Deliver the value. Keep it tight. No fluff.' },
          { label: 'Last 3 seconds', text: 'CTA. \u201cFollow for more.\u201d \u201cComment [WORD] and I\'ll send it to you.\u201d' },
        ],
      },
      {
        id: 'reel-hooks',
        type: 'hooks',
        title: 'Reel Hooks That Stop the Scroll',
        hooks: [
          '\u201cStop doing [common thing]. Here\u2019s what works instead.\u201d',
          '\u201cThis one thing changed my [business/life] in 30 days.\u201d',
          '\u201cIf I had to start over, I\u2019d do this first.\u201d',
          '\u201cNobody tells you this, but...\u201d',
          '\u201cHere\u2019s what [result] actually looks like.\u201d',
        ],
      },
      {
        id: 'reel-ideas',
        type: 'content-ideas',
        title: 'Reel Content Ideas for Any Business',
        bullets: [
          'Before & after transformations',
          '\u201cA day in the life\u201d',
          'Common myths in your industry \u2014 debunked',
          'Quick tips (under 30 seconds)',
          'Customer reactions or testimonials',
          'Behind-the-scenes of your work',
        ],
      },
      {
        id: 'carousel-formula',
        type: 'formula-steps',
        title: 'The Carousel Formula',
        intro: 'Carousels are the highest-engagement format on Instagram. People save them, share them, and come back to them.',
        formulaSteps: [
          { label: 'Slide 1', text: 'Hook + benefit (\u201c7 Ways to [Result]\u201d)' },
          { label: 'Slides 2\u20138', text: 'One idea per slide, simple graphic, short text' },
          { label: 'Last slide', text: 'CTA \u2014 save this post, DM a keyword, visit your link' },
        ],
      },
      {
        id: 'carousel-topics',
        type: 'hooks',
        title: 'Carousel Topics That Always Work',
        hooks: [
          '\u201c[X] mistakes [your customer type] makes with [topic]\u201d',
          '\u201c[X] things I wish I knew before [doing thing]\u201d',
          '\u201cHow to [get result] in [time frame]\u201d',
          '\u201cThe [topic] checklist\u201d',
          '\u201c[Before state] vs. [after state]\u201d',
        ],
      },
      {
        id: 'stories-strategy',
        type: 'text-section',
        title: 'Stories Strategy',
        intro: 'Stories are where relationships happen. Your feed is the storefront \u2014 Stories are the conversation at the counter.',
        items: [
          { title: 'What to Post in Stories', description: '' },
        ],
        bullets: [
          'Polls and question boxes (engagement = reach boost)',
          'Behind-the-scenes of your day',
          'Customer DMs and testimonials (with permission)',
          'Quick tips and reminders',
          'Your face talking to the camera \u2014 people want to see you',
          'Countdowns to launches, events, or offers',
        ],
        callout: {
          title: 'The Magic of the Question Sticker',
          body: ['Post a question sticker like \u201cWhat\u2019s your biggest struggle with [problem]?\u201d once a week. You\u2019ll get free market research AND conversation starters for your next DM.'],
        },
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy on Instagram',
        leadGenIntro: 'Here\u2019s the system that actually generates leads from Instagram \u2014 not just likes.',
        subtitle: 'The DM Magnet System',
        leadGenSteps: [
          { title: 'Create one valuable free resource', description: 'A PDF, checklist, guide, or short video. Something your customer wants badly enough to give you their attention for.' },
          { title: 'Add the CTA to every Reel and post', description: '\u201cComment [KEYWORD] and I\u2019ll DM it to you.\u201d' },
          { title: 'Every comment triggers a DM', description: 'Which gives you a conversation, which gives you a qualified lead.' },
          { title: 'Deliver the free thing first, then ask', description: '\u201cOut of curiosity \u2014 are you currently dealing with [problem] yourself?\u201d' },
          { title: 'Conversation happens', description: 'Lead gets qualified. You book the call.' },
        ],
        leadGenReasons: [
          'Comments boost your reach in the algorithm',
          'DMs have 90%+ open rates (email is 20%)',
          'You\u2019re giving before asking (StoryBrand guide principle)',
          'You\u2019re having real conversations instead of broadcasting',
        ],
      },
      {
        id: 'bio',
        type: 'bio-template',
        title: 'Your Instagram Bio = Your Landing Page',
        intro: 'Most bios are wasted. Here\u2019s what yours should say:',
        items: [
          { title: 'Line 1', description: 'What you do + who you do it for' },
          { title: 'Line 2', description: 'The specific result you deliver' },
          { title: 'Line 3', description: 'Proof (years in business, customers served, a notable win)' },
          { title: 'Line 4', description: 'CTA with link' },
        ],
        bioExample: {
          label: 'Example (Tree Service)',
          lines: [
            'Redding\u2019s most trusted tree service',
            'Saving homeowners thousands on tree removal',
            '500+ local jobs completed',
            'Free tree health check',
            '[link]',
          ],
        },
      },
      {
        id: 'hashtags',
        type: 'hashtag',
        title: 'Hashtag Strategy (Yes, Still Use Them)',
        intro: 'Use 8\u201315 hashtags per post. Mix three tiers:',
        hashtagTiers: [
          { tier: 'Small', range: 'Under 50K posts', count: '3\u20135' },
          { tier: 'Medium', range: '50K\u2013500K posts', count: '3\u20135' },
          { tier: 'Large', range: '500K+ posts', count: '2\u20133' },
        ],
        callout: {
          title: '',
          body: ['Rotate them. Don\u2019t use the exact same set every post.'],
        },
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Reels', content: '3\u20135x per week' },
          { label: 'Stories', content: 'Daily (3\u20135 per day)' },
          { label: 'Feed Posts', content: '2\u20133x per week' },
          { label: 'Best Times', content: '11am, 2pm, 7pm local time' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day Instagram Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Optimize your bio, profile photo, and highlights. Pin your 3 best existing posts.' },
          { week: 'Week 2', description: 'Post 3 Reels + 1 Carousel. Focus on teaching one skill or solving one problem your customer has.' },
          { week: 'Week 3', description: 'Add daily Stories. Start using question stickers and polls.' },
          { week: 'Week 4', description: 'Launch your DM magnet. Create your free resource and start the \u201cComment [KEYWORD]\u201d CTA.' },
        ],
        callout: {
          title: '',
          body: ['After 30 days, you\u2019ll have data showing what works. Double down there.'],
        },
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Rule That Beats Every Tactic',
        oneRule: {
          title: 'Post like a person, not a brand.',
          description: 'People follow people. They buy from people. Don\u2019t hide behind a logo \u2014 show your face, tell your story, share your opinions. The more human you are, the more Instagram rewards you.',
        },
      },
    ],
  },
  {
    slug: 'facebook',
    name: 'Facebook',
    tagline: 'The Community Converter',
    color: '#1877F2',
    colorLight: 'rgba(24, 119, 242, 0.15)',
    icon: 'facebook',
    whatItDoes: 'Turns strangers into community members and community members into customers through groups and trust.',
    whatItsNotFor: 'Viral discovery. Facebook rewards depth over reach.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who Facebook Is Best For',
        bullets: [
          'Local service businesses (plumbers, landscapers, cleaners)',
          'Coaches and consultants targeting experienced professionals',
          'Community-driven brands and membership businesses',
          'Event-based businesses and nonprofits',
        ],
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix (Post This Weekly)',
        contentMix: [
          { type: 'Group Posts', frequency: 'Daily', description: 'Ask questions, share tips, celebrate wins. Your group is your goldmine.' },
          { type: 'Video/Reels', frequency: '2\u20133x/week', description: 'Facebook Reels get massive organic reach right now. Repurpose from Instagram.' },
          { type: 'Text Posts', frequency: '2\u20133x/week', description: 'Long-form storytelling posts perform incredibly well. Share your journey and lessons.' },
          { type: 'Live Video', frequency: '1x/week', description: 'Go live in your group or on your page. Q&As, tutorials, and behind-the-scenes.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The Facebook Post Formula',
        formulaSteps: [
          { label: 'Hook', text: 'First 2 lines must create curiosity. Facebook truncates posts after ~3 lines, so your hook determines if they click \u201cSee More.\u201d' },
          { label: 'Value', text: 'Tell stories. Be personal. Share specific numbers, timelines, and results. Facebook audiences love authenticity over polish.' },
          { label: 'CTA', text: '\u201cDrop a [emoji] if you relate,\u201d \u201cComment [word] and I\'ll send you the guide,\u201d or \u201cShare this with someone who needs it.\u201d' },
        ],
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy',
        subtitle: 'The Facebook Group Funnel',
        leadGenSteps: [
          { title: 'Create a Facebook Group', description: 'Name it after the transformation, not your business. Example: \u201cFirst-Time Homebuyers Success Circle\u201d not \u201cBob\u2019s Realty Group.\u201d' },
          { title: 'Set Up Entry Questions', description: 'Ask 3 questions when people join. The last one: \u201cWhat\u2019s your email so I can send you our free [resource]?\u201d' },
          { title: 'Post Value Daily', description: 'Alternate between teaching, asking questions, and sharing wins. Make members feel like insiders.' },
          { title: 'Run Weekly Live Sessions', description: 'Go live once a week to answer questions. This builds trust faster than any other content type.' },
          { title: 'Convert with DMs', description: 'When someone is actively engaged, reach out personally. Offer a free call or resource.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Monday', content: 'Question post in Group (spark discussion)' },
          { label: 'Tuesday', content: 'Teaching post or video (solve a problem)' },
          { label: 'Wednesday', content: 'Story post (personal or client story)' },
          { label: 'Thursday', content: 'Live Q&A session in Group' },
          { label: 'Friday', content: 'Win celebration (yours or a member\u2019s)' },
          { label: 'Saturday', content: 'Reel or short video (repurpose)' },
          { label: 'Sunday', content: 'Rest or light engagement post' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day Facebook Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Create Facebook Group with clear name and description. Set up 3 entry questions (including email capture). Invite 50 people you know who fit your target audience.' },
          { week: 'Week 2', description: 'Post daily in your group (value + engagement). Share group in relevant communities. Do your first Facebook Live.' },
          { week: 'Week 3', description: 'Create a pinned post with your best free resource. Run a mini challenge or themed week in the group. Post 2\u20133 Reels on your business page.' },
          { week: 'Week 4', description: 'Review group growth and engagement metrics. Make your first offer to the group (soft sell). Identify your top 10 most engaged members and nurture those relationships.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Rule That Beats Every Tactic',
        oneRule: {
          title: 'The group is the product.',
          description: 'Your Facebook Group is not a marketing channel \u2014 it\u2019s the experience itself. When people feel like they belong to something valuable, they naturally want more of what you offer. Build the community first, and the sales will follow.',
        },
      },
    ],
  },
  {
    slug: 'tiktok',
    name: 'TikTok',
    tagline: 'The Discovery Engine',
    color: '#00F2EA',
    colorLight: 'rgba(0, 242, 234, 0.15)',
    icon: 'tiktok',
    whatItDoes: 'Gets your content in front of people who\'ve never heard of you. The fastest path to organic reach.',
    whatItsNotFor: 'Polished corporate content. TikTok rewards raw authenticity.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who TikTok Is Best For',
        bullets: [
          'New businesses that need awareness fast',
          'Creators and educators in any niche',
          'E-commerce and product-based businesses',
          'Service providers willing to show their personality',
        ],
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix (Post This Weekly)',
        contentMix: [
          { type: 'Educational Videos', frequency: '3\u20134x/week', description: 'Quick tips, how-tos, and \u201cthings I wish I knew\u201d formats. These build authority.' },
          { type: 'Trending Sounds', frequency: '2x/week', description: 'Ride trending audio with your own twist. This is how you get discovered.' },
          { type: 'Story Time', frequency: '1\u20132x/week', description: 'Personal stories, client wins, and \u201cday in the life\u201d content. Authenticity wins.' },
          { type: 'Engagement Bait', frequency: '1x/week', description: 'Controversial takes, \u201cunpopular opinions,\u201d or \u201cwhich would you choose\u201d posts.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The TikTok Video Formula',
        formulaSteps: [
          { label: 'Hook (1\u20132 sec)', text: 'Use text on screen + spoken hook simultaneously. Pattern interrupt with movement, zoom, or unexpected visual.' },
          { label: 'Value (15\u201345 sec)', text: 'Keep it tight. One idea per video. Speak fast, cut dead air, use captions.' },
          { label: 'CTA', text: '\u201cFollow for more [niche] tips,\u201d \u201cComment [word] and I\u2019ll DM you the link,\u201d or \u201cSave this before it gets buried.\u201d' },
        ],
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy',
        subtitle: 'The TikTok-to-Lead Pipeline',
        leadGenSteps: [
          { title: 'Optimize Your Profile', description: 'Bio should clearly state your niche and include a link to your lead magnet.' },
          { title: 'Post Daily for 30 Days', description: 'The algorithm rewards consistency. Post 1\u20132 times daily, test different formats.' },
          { title: 'Use Comment Triggers', description: 'Say \u201cComment [keyword] and I\u2019ll DM you the free guide.\u201d This drives engagement AND generates leads.' },
          { title: 'Create a Series', description: 'Multi-part content keeps people coming back. \u201cPart 1 of 5\u201d creates built-in follow motivation.' },
          { title: 'Funnel to DMs or Link', description: 'Every viral video is a waste if there\u2019s no next step. Always direct people to your link or DMs.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Monday', content: 'Educational tip (core niche topic)' },
          { label: 'Tuesday', content: 'Trending sound with your twist' },
          { label: 'Wednesday', content: 'Story time / personal experience' },
          { label: 'Thursday', content: 'Quick how-to or tutorial' },
          { label: 'Friday', content: 'Hot take or controversial opinion' },
          { label: 'Saturday', content: 'Behind-the-scenes or day-in-the-life' },
          { label: 'Sunday', content: 'Recap or repurpose best performer of the week' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day TikTok Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Set up profile with clear bio and link. Study 20 successful creators in your niche. Post your first 5 videos (don\u2019t overthink \u2014 just start).' },
          { week: 'Week 2', description: 'Post daily (7 videos minimum). Test your first comment trigger CTA. Reply to every comment. Find patterns in what gets views.' },
          { week: 'Week 3', description: 'Start a content series (minimum 3 parts). Create your lead magnet and link it in bio. Batch film 10 videos in one session.' },
          { week: 'Week 4', description: 'Review analytics \u2014 identify your top content format. Follow up with everyone who commented keywords. Test a longer-form video (60\u201390 seconds).' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Rule That Beats Every Tactic',
        oneRule: {
          title: 'Volume beats perfection.',
          description: 'On TikTok, the algorithm needs data to work with. Your first 50 videos are practice. Don\u2019t polish \u2014 publish. The creators who win aren\u2019t the most talented; they\u2019re the most consistent. Post more, learn faster, and let the algorithm find your audience for you.',
        },
      },
    ],
  },
  {
    slug: 'youtube',
    name: 'YouTube',
    tagline: 'The Long Game That Pays Forever',
    color: '#FF0000',
    colorLight: 'rgba(255, 0, 0, 0.12)',
    icon: 'youtube',
    whatItDoes: 'Builds deep authority and generates leads for years from a single piece of content.',
    whatItsNotFor: 'Quick wins. YouTube is a compounding asset that takes months to pay off.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who YouTube Is Best For',
        bullets: [
          'Educators, coaches, and consultants',
          'SaaS and tech businesses',
          'Professional service providers (lawyers, accountants, agencies)',
          'Anyone building a long-term authority brand',
        ],
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix (Post This Weekly)',
        contentMix: [
          { type: 'Long-Form Videos', frequency: '1\u20132x/week', description: '8\u201315 minute deep dives. These are your authority builders and SEO plays.' },
          { type: 'YouTube Shorts', frequency: '3\u20135x/week', description: 'Quick tips and hooks to drive subscribers. Repurpose from TikTok/Reels.' },
          { type: 'Tutorial/How-To', frequency: '2x/month', description: 'Step-by-step guides that solve specific problems. These rank in search forever.' },
          { type: 'Community Posts', frequency: '2\u20133x/week', description: 'Polls, questions, and updates to keep subscribers engaged between uploads.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The YouTube Video Formula',
        formulaSteps: [
          { label: 'Hook (first 30 sec)', text: 'Promise a clear outcome. \u201cIn this video, you\u2019ll learn exactly how to [result] \u2014 even if [objection].\u201d' },
          { label: 'Value', text: 'Deliver on the promise. Use chapters, clear structure, and examples. Longer watch time = more promotion by the algorithm.' },
          { label: 'CTA', text: '\u201cSubscribe and hit the bell,\u201d \u201cDownload the free worksheet in the description,\u201d or \u201cWatch this next video for step 2.\u201d' },
        ],
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy',
        subtitle: 'The YouTube Content Flywheel',
        leadGenSteps: [
          { title: 'Keyword Research', description: 'Find what your audience is searching for. Use YouTube search suggestions, TubeBuddy, or VidIQ.' },
          { title: 'Create a Lead Magnet', description: 'A PDF, template, or checklist that complements your video content. Link it in every description.' },
          { title: 'Optimize Descriptions', description: 'First 2 lines should include your CTA and link. Include keywords, timestamps, and social links.' },
          { title: 'Use End Screens and Cards', description: 'Point viewers to your landing page or next video. Every video should lead somewhere.' },
          { title: 'Build a Content Flywheel', description: 'Each video should naturally lead to the next. Create playlists that guide viewers through your funnel.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Monday', content: 'Publish long-form video' },
          { label: 'Tuesday', content: 'YouTube Short + Community post' },
          { label: 'Wednesday', content: 'YouTube Short' },
          { label: 'Thursday', content: 'Publish second long-form video (if 2x/week)' },
          { label: 'Friday', content: 'YouTube Short + Community post' },
          { label: 'Saturday', content: 'YouTube Short' },
          { label: 'Sunday', content: 'Batch plan and film next week\u2019s content' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day YouTube Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Set up channel with optimized banner, bio, and links. Research 20 video topics your audience searches for. Film and publish your first long-form video.' },
          { week: 'Week 2', description: 'Publish second long-form video. Create lead magnet and add to all descriptions. Post daily Shorts (batch film them).' },
          { week: 'Week 3', description: 'Film 2 long-form videos in a batch session. Create a playlist organizing your content. Start using Community tab for engagement.' },
          { week: 'Week 4', description: 'Review analytics \u2014 identify top-performing topics. Optimize thumbnails and titles based on CTR data. Plan the next 60 days of content.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Rule That Beats Every Tactic',
        oneRule: {
          title: 'Think in years, not weeks.',
          description: 'YouTube is the only platform where a video you post today can generate leads 3 years from now. Most creators quit after 20 videos. The ones who make it to 100 almost always succeed. Every video is an asset that compounds over time. Play the long game.',
        },
      },
    ],
  },
  {
    slug: 'linkedin',
    name: 'LinkedIn',
    tagline: 'The B2B Goldmine',
    color: '#0A66C2',
    colorLight: 'rgba(10, 102, 194, 0.15)',
    icon: 'linkedin',
    whatItDoes: 'Connects you directly with decision-makers and high-ticket buyers in professional industries.',
    whatItsNotFor: 'Consumer products or young demographics. LinkedIn is a professional platform.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who LinkedIn Is Best For',
        bullets: [
          'B2B service providers and agencies',
          'Consultants and fractional executives',
          'SaaS founders and tech entrepreneurs',
          'Professional coaches and career advisors',
        ],
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix (Post This Weekly)',
        contentMix: [
          { type: 'Text Posts', frequency: '3\u20135x/week', description: 'Story-driven posts with clear insights. LinkedIn loves personal stories with business lessons.' },
          { type: 'Carousels/Documents', frequency: '1\u20132x/week', description: 'PDF carousels with frameworks, templates, or step-by-step guides. Highest save rate.' },
          { type: 'Video', frequency: '1x/week', description: 'Talking head videos sharing insights. Keep under 2 minutes. Native video outperforms links.' },
          { type: 'Comments', frequency: 'Daily', description: 'Thoughtful comments on others\u2019 posts. This is the #1 underrated growth strategy.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The LinkedIn Post Formula',
        formulaSteps: [
          { label: 'Hook', text: 'First line is everything. Use a bold statement, surprising data point, or personal confession. Line break after the hook to create a \u201cSee More\u201d click.' },
          { label: 'Value', text: 'Share frameworks, lessons learned, and specific examples. Use line breaks for readability. Keep paragraphs to 1\u20132 sentences.' },
          { label: 'CTA', text: '\u201cAgree? Disagree? Tell me in the comments,\u201d \u201cRepost this if it resonated,\u201d or \u201cDM me [keyword] for the full framework.\u201d' },
        ],
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy',
        subtitle: 'The LinkedIn Authority Funnel',
        leadGenSteps: [
          { title: 'Optimize Your Profile as a Landing Page', description: 'Headline should state who you help and how. Banner should reinforce your value prop. Featured section should showcase your lead magnet.' },
          { title: 'Post 5x Per Week', description: 'Consistency on LinkedIn is rare, which makes it a massive advantage. Mix personal stories with professional insights.' },
          { title: 'Comment on 10 Posts Daily', description: 'Leave thoughtful, detailed comments on posts from your ideal clients and industry leaders. This gets you seen.' },
          { title: 'Send Connection Requests', description: 'Connect with people who engage with your content. Include a personalized note. Don\u2019t pitch in the request.' },
          { title: 'Convert with Value-First DMs', description: 'After connecting, send a genuine message. Share a free resource, ask about their challenges, and offer to help.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Monday', content: 'Personal story with a business lesson' },
          { label: 'Tuesday', content: 'Framework or process breakdown (carousel)' },
          { label: 'Wednesday', content: 'Industry insight or hot take' },
          { label: 'Thursday', content: 'Client win or case study' },
          { label: 'Friday', content: 'Reflective post or weekly lesson' },
          { label: 'Saturday', content: 'Light engagement or repurpose' },
          { label: 'Sunday', content: 'Plan and draft next week\u2019s content' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day LinkedIn Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Rewrite headline, about section, and featured section. Identify 30 ideal clients and connect with them. Post 4 text posts (mix of stories and insights).' },
          { week: 'Week 2', description: 'Create your first carousel (PDF) post. Continue daily commenting and connecting. Post 5 times this week. Start 5 DM conversations.' },
          { week: 'Week 3', description: 'Post your first native video. Create a lead magnet and feature it on your profile. Share a detailed case study or client success story.' },
          { week: 'Week 4', description: 'Review analytics and identify top-performing content. Batch write next month\u2019s posts. Make your first offer via DMs to warm leads.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Rule That Beats Every Tactic',
        oneRule: {
          title: 'Give before you ask.',
          description: 'LinkedIn rewards generosity. The more value you give away \u2014 frameworks, insights, introductions \u2014 the more trust you build. People buy from people they trust and respect. Build in public, share your journey, and the inbound leads will follow.',
        },
      },
    ],
  },
  {
    slug: 'x-twitter',
    name: 'X (Twitter)',
    tagline: 'The Conversation Starter',
    color: '#1DA1F2',
    colorLight: 'rgba(29, 161, 242, 0.15)',
    icon: 'twitter',
    whatItDoes: 'Spreads ideas fast and connects you with other founders, creators, and industry peers.',
    whatItsNotFor: 'Visual-first businesses or purely local audiences.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who X Is Best For',
        bullets: [
          'Founders and entrepreneurs sharing their journey',
          'Writers, thinkers, and idea-driven creators',
          'Tech startups and SaaS companies',
          'Media personalities and commentators',
        ],
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix (Post This Weekly)',
        contentMix: [
          { type: 'Single Tweets', frequency: '3\u20135x/day', description: 'One clear idea per tweet. Make it quotable, shareable, and thought-provoking.' },
          { type: 'Threads', frequency: '2\u20133x/week', description: 'Deep dives into one topic. These are your authority builders. Start with a killer hook tweet.' },
          { type: 'Replies & QTs', frequency: 'Daily', description: 'Jump into conversations. Quote tweet with your perspective. This is how you get discovered.' },
          { type: 'Media Posts', frequency: '1\u20132x/week', description: 'Screenshots, infographics, or short videos to break up text-heavy feeds.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The X Post Formula',
        formulaSteps: [
          { label: 'Hook', text: 'First tweet/line must be a standalone banger. If it doesn\u2019t work as a standalone tweet, it\u2019s not strong enough.' },
          { label: 'Value', text: 'Be concise. Every word must earn its place. Use line breaks, numbered lists, and strong verbs. Cut the fluff.' },
          { label: 'CTA', text: '\u201cRetweet if you agree,\u201d \u201cFollow me for more on [topic],\u201d \u201cReply with your [experience/opinion],\u201d or \u201cDM me for the full guide.\u201d' },
        ],
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy',
        subtitle: 'The X Authority Pipeline',
        leadGenSteps: [
          { title: 'Craft a Magnetic Bio', description: 'State what you tweet about and who it\u2019s for. Pin your best thread or link to your lead magnet.' },
          { title: 'Tweet 3\u20135x Daily', description: 'Volume matters on X. Mix original thoughts, replies to bigger accounts, and curated insights.' },
          { title: 'Write 2\u20133 Threads Per Week', description: 'Threads are your long-form content. Each one should be valuable enough to bookmark.' },
          { title: 'Engage in Conversations', description: 'Reply to accounts with your target audience. Be insightful, not promotional. Build relationships.' },
          { title: 'Convert with Pinned Content', description: 'Pin a thread that ends with a CTA to your lead magnet. Every new profile visitor sees it first.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Monday', content: 'Motivational/insight tweet + Thread' },
          { label: 'Tuesday', content: '3 tweets + engage in 5 conversations' },
          { label: 'Wednesday', content: 'Hot take or contrarian opinion + Thread' },
          { label: 'Thursday', content: '3 tweets + quote tweet industry news' },
          { label: 'Friday', content: 'Reflective tweet + engage in 5 conversations' },
          { label: 'Saturday', content: 'Casual/personal tweet' },
          { label: 'Sunday', content: 'Plan threads and tweet ideas for the week' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day X Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Optimize bio, banner, and pinned tweet. Follow 50 accounts in your niche. Tweet 3x daily. Write and publish your first thread.' },
          { week: 'Week 2', description: 'Increase to 5 tweets per day. Write 2 threads this week. Reply to 10 tweets daily from bigger accounts.' },
          { week: 'Week 3', description: 'Create a lead magnet and link in bio. Pin your best-performing thread. Engage in Twitter Spaces or host one. DM 5 people you\u2019ve been engaging with.' },
          { week: 'Week 4', description: 'Review analytics \u2014 identify top tweet formats. Batch write 20 tweets for next week. Make an offer to warm DM connections.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Rule That Beats Every Tactic',
        oneRule: {
          title: 'Ideas win. Not followers.',
          description: 'On X, a single tweet can reach millions regardless of your follower count. Focus on sharpening your thinking and articulating ideas clearly. The people who build the biggest audiences here are the ones who say what everyone is thinking but nobody is saying. Be bold, be clear, be consistent.',
        },
      },
    ],
  },
];
