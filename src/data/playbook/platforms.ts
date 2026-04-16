export interface PlatformData {
  slug: string;
  name: string;
  tagline: string;
  color: string;
  colorLight: string;
  icon: string;
  bestFor: string[];
  notFor: string[];
  whoIsItFor: string[];
  contentMix: { type: string; frequency: string; description: string }[];
  formula: { hook: string; content: string; cta: string };
  leadGenSteps: { step: number; title: string; description: string }[];
  postingCadence: { day: string; content: string }[];
  kickstartPlan: { week: string; tasks: string[] }[];
  oneRule: { title: string; description: string };
}

export const platforms: PlatformData[] = [
  {
    slug: 'instagram',
    name: 'Instagram',
    tagline: 'The Trust Builder',
    color: '#E1306C',
    colorLight: 'rgba(225, 48, 108, 0.15)',
    icon: 'instagram',
    bestFor: [
      'Building a personal brand alongside your business',
      'Visual businesses (food, fitness, fashion, design, real estate)',
      'Service providers who want to showcase expertise',
      'Local businesses looking to connect with their community',
    ],
    notFor: [
      'Businesses that rely purely on long-form written content',
      'B2B companies targeting C-suite executives exclusively',
      'People unwilling to show up on camera or create visual content',
    ],
    whoIsItFor: [
      'Coaches, consultants, and service providers',
      'Local business owners (restaurants, salons, gyms, shops)',
      'Creators and personal brands',
      'E-commerce brands with visually appealing products',
    ],
    contentMix: [
      { type: 'Reels', frequency: '3-4x/week', description: 'Short-form video for reach and discovery. Use trending audio, quick tips, and behind-the-scenes.' },
      { type: 'Carousel Posts', frequency: '2-3x/week', description: 'Educational slides that get saved and shared. Break down complex topics into swipeable steps.' },
      { type: 'Stories', frequency: 'Daily', description: 'Behind-the-scenes, polls, Q&As, and daily engagement. This is where trust is built.' },
      { type: 'Static Posts', frequency: '1-2x/week', description: 'Quote graphics, testimonials, and brand-building single images.' },
    ],
    formula: {
      hook: 'First frame of a Reel or first slide of a carousel must stop the scroll. Use text overlays, bold statements, or curiosity gaps.',
      content: 'Deliver real value in 15-60 seconds (Reels) or 5-10 slides (Carousel). Teach, inspire, or entertain. Don\'t hold back.',
      cta: '"Save this for later," "Share with someone who needs this," "DM me [keyword] for the free guide," or "Link in bio."',
    },
    leadGenSteps: [
      { step: 1, title: 'Optimize Your Bio', description: 'Clear statement of who you help and how. Include a call-to-action and link to your lead magnet.' },
      { step: 2, title: 'Create a Keyword DM Trigger', description: 'In your posts, say "DM me [keyword] for [free resource]." Use this to start conversations.' },
      { step: 3, title: 'Post Consistently', description: 'Minimum 4x/week mixing Reels and Carousels. Consistency beats virality every time.' },
      { step: 4, title: 'Engage Strategically', description: 'Spend 15 min/day commenting on posts from your ideal customers. Be genuine, add value.' },
      { step: 5, title: 'Convert in DMs', description: 'When someone DMs your keyword, deliver value first. Then ask about their situation and offer help.' },
    ],
    postingCadence: [
      { day: 'Monday', content: 'Educational Reel (quick tip)' },
      { day: 'Tuesday', content: 'Carousel (step-by-step breakdown)' },
      { day: 'Wednesday', content: 'Story-driven Reel (personal story + lesson)' },
      { day: 'Thursday', content: 'Testimonial or social proof post' },
      { day: 'Friday', content: 'Engagement Reel (question or hot take)' },
      { day: 'Saturday', content: 'Behind-the-scenes Story series' },
      { day: 'Sunday', content: 'Rest or repurpose top-performing content' },
    ],
    kickstartPlan: [
      { week: 'Week 1', tasks: ['Optimize bio with clear value proposition and CTA', 'Create content pillars (3-4 main topics)', 'Post 4 pieces of content (mix of Reels and Carousels)', 'Engage with 20 accounts in your niche daily'] },
      { week: 'Week 2', tasks: ['Create and post your lead magnet offer', 'Film 3 Reels in a batch session', 'Test your first DM keyword trigger', 'Analyze Week 1 metrics and double down on what worked'] },
      { week: 'Week 3', tasks: ['Post 5 pieces of content this week', 'Start Story series (daily behind-the-scenes)', 'Follow up with all DM conversations', 'Create a testimonial or case study post'] },
      { week: 'Week 4', tasks: ['Review analytics — identify top 3 performing posts', 'Create a content calendar for next month', 'Make your first direct offer to warm leads', 'Celebrate your wins and plan your next 30 days'] },
    ],
    oneRule: {
      title: 'Relationships beat reach.',
      description: 'You don\'t need 10,000 followers to generate leads on Instagram. You need 100 people who trust you. Focus on building real connections through DMs, comments, and Stories. One genuine relationship is worth more than a thousand passive followers.',
    },
  },
  {
    slug: 'facebook',
    name: 'Facebook',
    tagline: 'The Community Converter',
    color: '#1877F2',
    colorLight: 'rgba(24, 119, 242, 0.15)',
    icon: 'facebook',
    bestFor: [
      'Building community around a niche topic',
      'Local businesses with a geographic focus',
      'Businesses targeting 30-65 age demographic',
      'Service providers who thrive on referrals and trust',
    ],
    notFor: [
      'Brands targeting Gen Z exclusively',
      'Businesses that rely on short-form viral video only',
      'Those unwilling to moderate and nurture a community',
    ],
    whoIsItFor: [
      'Local service businesses (plumbers, landscapers, cleaners)',
      'Coaches and consultants targeting experienced professionals',
      'Community-driven brands and membership businesses',
      'Event-based businesses and nonprofits',
    ],
    contentMix: [
      { type: 'Group Posts', frequency: 'Daily', description: 'Ask questions, share tips, celebrate wins. Your group is your goldmine.' },
      { type: 'Video/Reels', frequency: '2-3x/week', description: 'Facebook Reels get massive organic reach right now. Repurpose from Instagram.' },
      { type: 'Text Posts', frequency: '2-3x/week', description: 'Long-form storytelling posts perform incredibly well. Share your journey and lessons.' },
      { type: 'Live Video', frequency: '1x/week', description: 'Go live in your group or on your page. Q&As, tutorials, and behind-the-scenes.' },
    ],
    formula: {
      hook: 'First 2 lines must create curiosity. Facebook truncates posts after ~3 lines, so your hook determines if they click "See More."',
      content: 'Tell stories. Be personal. Share specific numbers, timelines, and results. Facebook audiences love authenticity over polish.',
      cta: '"Drop a [emoji] if you relate," "Comment [word] and I\'ll send you the guide," or "Share this with someone who needs it."',
    },
    leadGenSteps: [
      { step: 1, title: 'Create a Facebook Group', description: 'Name it after the transformation, not your business. Example: "First-Time Homebuyers Success Circle" not "Bob\'s Realty Group."' },
      { step: 2, title: 'Set Up Entry Questions', description: 'Ask 3 questions when people join. The last one: "What\'s your email so I can send you our free [resource]?"' },
      { step: 3, title: 'Post Value Daily', description: 'Alternate between teaching, asking questions, and sharing wins. Make members feel like insiders.' },
      { step: 4, title: 'Run Weekly Live Sessions', description: 'Go live once a week to answer questions. This builds trust faster than any other content type.' },
      { step: 5, title: 'Convert with DMs', description: 'When someone is actively engaged, reach out personally. Offer a free call or resource.' },
    ],
    postingCadence: [
      { day: 'Monday', content: 'Question post in Group (spark discussion)' },
      { day: 'Tuesday', content: 'Teaching post or video (solve a problem)' },
      { day: 'Wednesday', content: 'Story post (personal or client story)' },
      { day: 'Thursday', content: 'Live Q&A session in Group' },
      { day: 'Friday', content: 'Win celebration (yours or a member\'s)' },
      { day: 'Saturday', content: 'Reel or short video (repurpose)' },
      { day: 'Sunday', content: 'Rest or light engagement post' },
    ],
    kickstartPlan: [
      { week: 'Week 1', tasks: ['Create Facebook Group with clear name and description', 'Set up 3 entry questions (including email capture)', 'Invite 50 people you know who fit your target audience', 'Post introduction and welcome thread'] },
      { week: 'Week 2', tasks: ['Post daily in your group (value + engagement)', 'Share group in relevant communities (without spamming)', 'Do your first Facebook Live (even if it\'s scary)', 'Start DMing active group members'] },
      { week: 'Week 3', tasks: ['Create a pinned post with your best free resource', 'Run a mini challenge or themed week in the group', 'Post 2-3 Reels on your business page', 'Follow up with all DM conversations'] },
      { week: 'Week 4', tasks: ['Review group growth and engagement metrics', 'Make your first offer to the group (soft sell)', 'Plan next month\'s content calendar', 'Identify your top 10 most engaged members and nurture those relationships'] },
    ],
    oneRule: {
      title: 'The group is the product.',
      description: 'Your Facebook Group is not a marketing channel — it\'s the experience itself. When people feel like they belong to something valuable, they naturally want more of what you offer. Build the community first, and the sales will follow.',
    },
  },
  {
    slug: 'tiktok',
    name: 'TikTok',
    tagline: 'The Discovery Engine',
    color: '#00F2EA',
    colorLight: 'rgba(0, 242, 234, 0.15)',
    icon: 'tiktok',
    bestFor: [
      'Reaching brand new audiences who\'ve never heard of you',
      'Businesses with visually demonstrable products or services',
      'Personal brands willing to be authentic on camera',
      'Anyone who wants the fastest path to organic reach',
    ],
    notFor: [
      'Businesses that need highly polished, corporate content',
      'B2B services targeting conservative industries',
      'Those unwilling to experiment and iterate quickly',
    ],
    whoIsItFor: [
      'New businesses that need awareness fast',
      'Creators and educators in any niche',
      'E-commerce and product-based businesses',
      'Service providers willing to show their personality',
    ],
    contentMix: [
      { type: 'Educational Videos', frequency: '3-4x/week', description: 'Quick tips, how-tos, and "things I wish I knew" formats. These build authority.' },
      { type: 'Trending Sounds', frequency: '2x/week', description: 'Ride trending audio with your own twist. This is how you get discovered.' },
      { type: 'Story Time', frequency: '1-2x/week', description: 'Personal stories, client wins, and "day in the life" content. Authenticity wins.' },
      { type: 'Engagement Bait', frequency: '1x/week', description: 'Controversial takes, "unpopular opinions," or "which would you choose" posts.' },
    ],
    formula: {
      hook: 'First 1-2 seconds. Use text on screen + spoken hook simultaneously. Pattern interrupt with movement, zoom, or unexpected visual.',
      content: 'Keep it tight — 15-45 seconds is the sweet spot. One idea per video. Speak fast, cut dead air, use captions.',
      cta: '"Follow for more [niche] tips," "Comment [word] and I\'ll DM you the link," or "Save this before it gets buried."',
    },
    leadGenSteps: [
      { step: 1, title: 'Optimize Your Profile', description: 'Bio should clearly state your niche and include a link to your lead magnet. Use a Linktree or direct landing page.' },
      { step: 2, title: 'Post Daily for 30 Days', description: 'The algorithm rewards consistency. Post 1-2 times daily, test different formats, and let the data guide you.' },
      { step: 3, title: 'Use Comment Triggers', description: 'Say "Comment [keyword] and I\'ll DM you the free guide." This drives engagement AND generates leads.' },
      { step: 4, title: 'Create a Series', description: 'Multi-part content keeps people coming back. "Part 1 of 5" creates built-in follow motivation.' },
      { step: 5, title: 'Funnel to DMs or Link', description: 'Every viral video is a waste if there\'s no next step. Always direct people to your link or DMs.' },
    ],
    postingCadence: [
      { day: 'Monday', content: 'Educational tip (core niche topic)' },
      { day: 'Tuesday', content: 'Trending sound with your twist' },
      { day: 'Wednesday', content: 'Story time / personal experience' },
      { day: 'Thursday', content: 'Quick how-to or tutorial' },
      { day: 'Friday', content: 'Hot take or controversial opinion' },
      { day: 'Saturday', content: 'Behind-the-scenes or day-in-the-life' },
      { day: 'Sunday', content: 'Recap or repurpose best performer of the week' },
    ],
    kickstartPlan: [
      { week: 'Week 1', tasks: ['Set up profile with clear bio and link', 'Study 20 successful creators in your niche', 'Post your first 5 videos (don\'t overthink — just start)', 'Save 10 trending sounds to use this month'] },
      { week: 'Week 2', tasks: ['Post daily (7 videos minimum)', 'Test your first comment trigger CTA', 'Reply to every comment on your videos', 'Analyze which videos got the most views — find patterns'] },
      { week: 'Week 3', tasks: ['Start a content series (minimum 3 parts)', 'Create your lead magnet and link it in bio', 'Batch film 10 videos in one session', 'Engage with creators in your niche (duet, stitch, comment)'] },
      { week: 'Week 4', tasks: ['Review analytics — identify your top content format', 'Follow up with everyone who commented keywords', 'Test a longer-form video (60-90 seconds)', 'Plan next month based on data'] },
    ],
    oneRule: {
      title: 'Volume beats perfection.',
      description: 'On TikTok, the algorithm needs data to work with. Your first 50 videos are practice. Don\'t polish — publish. The creators who win aren\'t the most talented; they\'re the most consistent. Post more, learn faster, and let the algorithm find your audience for you.',
    },
  },
  {
    slug: 'youtube',
    name: 'YouTube',
    tagline: 'The Long Game That Pays Forever',
    color: '#FF0000',
    colorLight: 'rgba(255, 0, 0, 0.12)',
    icon: 'youtube',
    bestFor: [
      'Building deep authority in your field',
      'Evergreen content that generates leads for years',
      'Businesses with complex offerings that need explanation',
      'Anyone willing to invest in long-term compound growth',
    ],
    notFor: [
      'Businesses that need immediate results this week',
      'Those unwilling to learn basic video production',
      'Niches with very small, hard-to-reach audiences',
    ],
    whoIsItFor: [
      'Educators, coaches, and consultants',
      'SaaS and tech businesses',
      'Professional service providers (lawyers, accountants, agencies)',
      'Anyone building a long-term authority brand',
    ],
    contentMix: [
      { type: 'Long-Form Videos', frequency: '1-2x/week', description: '8-15 minute deep dives. These are your authority builders and SEO plays.' },
      { type: 'YouTube Shorts', frequency: '3-5x/week', description: 'Quick tips and hooks to drive subscribers. Repurpose from TikTok/Reels.' },
      { type: 'Tutorial/How-To', frequency: '2x/month', description: 'Step-by-step guides that solve specific problems. These rank in search forever.' },
      { type: 'Community Posts', frequency: '2-3x/week', description: 'Polls, questions, and updates to keep subscribers engaged between uploads.' },
    ],
    formula: {
      hook: 'First 30 seconds must promise a clear outcome. "In this video, you\'ll learn exactly how to [result] — even if [objection]."',
      content: 'Deliver on the promise. Use chapters, clear structure, and examples. Longer watch time = more promotion by the algorithm.',
      cta: '"Subscribe and hit the bell," "Download the free worksheet in the description," or "Watch this next video for step 2."',
    },
    leadGenSteps: [
      { step: 1, title: 'Keyword Research', description: 'Find what your audience is searching for. Use YouTube search suggestions, TubeBuddy, or VidIQ.' },
      { step: 2, title: 'Create a Lead Magnet', description: 'A PDF, template, or checklist that complements your video content. Link it in every description.' },
      { step: 3, title: 'Optimize Descriptions', description: 'First 2 lines should include your CTA and link. Include keywords, timestamps, and social links.' },
      { step: 4, title: 'Use End Screens and Cards', description: 'Point viewers to your landing page or next video. Every video should lead somewhere.' },
      { step: 5, title: 'Build a Content Flywheel', description: 'Each video should naturally lead to the next. Create playlists that guide viewers through your funnel.' },
    ],
    postingCadence: [
      { day: 'Monday', content: 'Publish long-form video' },
      { day: 'Tuesday', content: 'YouTube Short + Community post' },
      { day: 'Wednesday', content: 'YouTube Short' },
      { day: 'Thursday', content: 'Publish second long-form video (if 2x/week)' },
      { day: 'Friday', content: 'YouTube Short + Community post' },
      { day: 'Saturday', content: 'YouTube Short' },
      { day: 'Sunday', content: 'Batch plan and film next week\'s content' },
    ],
    kickstartPlan: [
      { week: 'Week 1', tasks: ['Set up channel with optimized banner, bio, and links', 'Research 20 video topics your audience searches for', 'Film and publish your first long-form video', 'Create 3 Shorts from your long-form content'] },
      { week: 'Week 2', tasks: ['Publish second long-form video', 'Create lead magnet and add to all descriptions', 'Post daily Shorts (batch film them)', 'Study top-performing channels in your niche'] },
      { week: 'Week 3', tasks: ['Film 2 long-form videos in a batch session', 'Create a playlist organizing your content', 'Start using Community tab for engagement', 'Reply to every comment on your videos'] },
      { week: 'Week 4', tasks: ['Review analytics — identify top-performing topics', 'Create a content calendar for next month', 'Optimize thumbnails and titles based on CTR data', 'Celebrate your consistency and plan the next 60 days'] },
    ],
    oneRule: {
      title: 'Think in years, not weeks.',
      description: 'YouTube is the only platform where a video you post today can generate leads 3 years from now. Most creators quit after 20 videos. The ones who make it to 100 almost always succeed. Every video is an asset that compounds over time. Play the long game.',
    },
  },
  {
    slug: 'linkedin',
    name: 'LinkedIn',
    tagline: 'The B2B Goldmine',
    color: '#0A66C2',
    colorLight: 'rgba(10, 102, 194, 0.15)',
    icon: 'linkedin',
    bestFor: [
      'B2B services and professional consulting',
      'High-ticket offers ($1,000+)',
      'Building authority in professional industries',
      'Networking with decision-makers and executives',
    ],
    notFor: [
      'Consumer products with low price points',
      'Businesses targeting teenagers or young consumers',
      'Brands that rely on visual/entertaining content only',
    ],
    whoIsItFor: [
      'B2B service providers and agencies',
      'Consultants and fractional executives',
      'SaaS founders and tech entrepreneurs',
      'Professional coaches and career advisors',
    ],
    contentMix: [
      { type: 'Text Posts', frequency: '3-5x/week', description: 'Story-driven posts with clear insights. LinkedIn loves personal stories with business lessons.' },
      { type: 'Carousels/Documents', frequency: '1-2x/week', description: 'PDF carousels with frameworks, templates, or step-by-step guides. Highest save rate.' },
      { type: 'Video', frequency: '1x/week', description: 'Talking head videos sharing insights. Keep under 2 minutes. Native video outperforms links.' },
      { type: 'Comments', frequency: 'Daily', description: 'Thoughtful comments on others\' posts. This is the #1 underrated growth strategy.' },
    ],
    formula: {
      hook: 'First line is everything. Use a bold statement, surprising data point, or personal confession. Line break after the hook to create a "See More" click.',
      content: 'Share frameworks, lessons learned, and specific examples. Use line breaks for readability. Keep paragraphs to 1-2 sentences.',
      cta: '"Agree? Disagree? Tell me in the comments," "Repost this if it resonated," or "DM me [keyword] for the full framework."',
    },
    leadGenSteps: [
      { step: 1, title: 'Optimize Your Profile as a Landing Page', description: 'Headline should state who you help and how. Banner should reinforce your value prop. Featured section should showcase your lead magnet.' },
      { step: 2, title: 'Post 5x Per Week', description: 'Consistency on LinkedIn is rare, which makes it a massive advantage. Mix personal stories with professional insights.' },
      { step: 3, title: 'Comment on 10 Posts Daily', description: 'Leave thoughtful, detailed comments on posts from your ideal clients and industry leaders. This gets you seen.' },
      { step: 4, title: 'Send Connection Requests', description: 'Connect with people who engage with your content. Include a personalized note. Don\'t pitch in the request.' },
      { step: 5, title: 'Convert with Value-First DMs', description: 'After connecting, send a genuine message. Share a free resource, ask about their challenges, and offer to help.' },
    ],
    postingCadence: [
      { day: 'Monday', content: 'Personal story with a business lesson' },
      { day: 'Tuesday', content: 'Framework or process breakdown (carousel)' },
      { day: 'Wednesday', content: 'Industry insight or hot take' },
      { day: 'Thursday', content: 'Client win or case study' },
      { day: 'Friday', content: 'Reflective post or weekly lesson' },
      { day: 'Saturday', content: 'Light engagement or repurpose' },
      { day: 'Sunday', content: 'Plan and draft next week\'s content' },
    ],
    kickstartPlan: [
      { week: 'Week 1', tasks: ['Rewrite headline, about section, and featured section', 'Identify 30 ideal clients and connect with them', 'Post 4 text posts (mix of stories and insights)', 'Comment on 10 posts per day from target accounts'] },
      { week: 'Week 2', tasks: ['Create your first carousel (PDF) post', 'Continue daily commenting and connecting', 'Post 5 times this week', 'Start 5 DM conversations with engaged connections'] },
      { week: 'Week 3', tasks: ['Post your first native video', 'Create a lead magnet and feature it on your profile', 'Share a detailed case study or client success story', 'Follow up on all DM conversations'] },
      { week: 'Week 4', tasks: ['Review analytics and identify top-performing content', 'Batch write next month\'s posts', 'Make your first offer via DMs to warm leads', 'Identify partnerships or collaboration opportunities'] },
    ],
    oneRule: {
      title: 'Give before you ask.',
      description: 'LinkedIn rewards generosity. The more value you give away — frameworks, insights, introductions — the more trust you build. People buy from people they trust and respect. Build in public, share your journey, and the inbound leads will follow.',
    },
  },
  {
    slug: 'x-twitter',
    name: 'X (Twitter)',
    tagline: 'The Conversation Starter',
    color: '#1DA1F2',
    colorLight: 'rgba(29, 161, 242, 0.15)',
    icon: 'twitter',
    bestFor: [
      'Building thought leadership through ideas and perspectives',
      'Networking with other founders, creators, and industry peers',
      'Real-time engagement and trend participation',
      'Driving traffic to long-form content on other platforms',
    ],
    notFor: [
      'Businesses that need heavy visual content',
      'Local businesses with a purely geographic audience',
      'Brands that can\'t maintain high-frequency posting',
    ],
    whoIsItFor: [
      'Founders and entrepreneurs sharing their journey',
      'Writers, thinkers, and idea-driven creators',
      'Tech startups and SaaS companies',
      'Media personalities and commentators',
    ],
    contentMix: [
      { type: 'Single Tweets', frequency: '3-5x/day', description: 'One clear idea per tweet. Make it quotable, shareable, and thought-provoking.' },
      { type: 'Threads', frequency: '2-3x/week', description: 'Deep dives into one topic. These are your authority builders. Start with a killer hook tweet.' },
      { type: 'Replies & QTs', frequency: 'Daily', description: 'Jump into conversations. Quote tweet with your perspective. This is how you get discovered.' },
      { type: 'Media Posts', frequency: '1-2x/week', description: 'Screenshots, infographics, or short videos to break up text-heavy feeds.' },
    ],
    formula: {
      hook: 'First tweet/line must be a standalone banger. If it doesn\'t work as a standalone tweet, it\'s not strong enough.',
      content: 'Be concise. Every word must earn its place. Use line breaks, numbered lists, and strong verbs. Cut the fluff.',
      cta: '"Retweet if you agree," "Follow me for more on [topic]," "Reply with your [experience/opinion]," or "DM me for the full guide."',
    },
    leadGenSteps: [
      { step: 1, title: 'Craft a Magnetic Bio', description: 'State what you tweet about and who it\'s for. Pin your best thread or link to your lead magnet.' },
      { step: 2, title: 'Tweet 3-5x Daily', description: 'Volume matters on X. Mix original thoughts, replies to bigger accounts, and curated insights.' },
      { step: 3, title: 'Write 2-3 Threads Per Week', description: 'Threads are your long-form content. Each one should be valuable enough to bookmark.' },
      { step: 4, title: 'Engage in Conversations', description: 'Reply to accounts with your target audience. Be insightful, not promotional. Build relationships.' },
      { step: 5, title: 'Convert with Pinned Content', description: 'Pin a thread that ends with a CTA to your lead magnet. Every new profile visitor sees it first.' },
    ],
    postingCadence: [
      { day: 'Monday', content: 'Motivational/insight tweet + Thread' },
      { day: 'Tuesday', content: '3 tweets + engage in 5 conversations' },
      { day: 'Wednesday', content: 'Hot take or contrarian opinion + Thread' },
      { day: 'Thursday', content: '3 tweets + quote tweet industry news' },
      { day: 'Friday', content: 'Reflective tweet + engage in 5 conversations' },
      { day: 'Saturday', content: 'Casual/personal tweet' },
      { day: 'Sunday', content: 'Plan threads and tweet ideas for the week' },
    ],
    kickstartPlan: [
      { week: 'Week 1', tasks: ['Optimize bio, banner, and pinned tweet', 'Follow 50 accounts in your niche', 'Tweet 3x daily (even if it feels weird)', 'Write and publish your first thread'] },
      { week: 'Week 2', tasks: ['Increase to 5 tweets per day', 'Write 2 threads this week', 'Reply to 10 tweets daily from bigger accounts', 'Start noting which tweet formats get the most engagement'] },
      { week: 'Week 3', tasks: ['Create a lead magnet and link in bio', 'Pin your best-performing thread', 'Engage in Twitter Spaces or host one', 'DM 5 people you\'ve been engaging with'] },
      { week: 'Week 4', tasks: ['Review analytics — identify top tweet formats', 'Batch write 20 tweets for next week', 'Make an offer to warm DM connections', 'Plan next month\'s thread topics'] },
    ],
    oneRule: {
      title: 'Ideas win. Not followers.',
      description: 'On X, a single tweet can reach millions regardless of your follower count. Focus on sharpening your thinking and articulating ideas clearly. The people who build the biggest audiences here are the ones who say what everyone is thinking but nobody is saying. Be bold, be clear, be consistent.',
    },
  },
];
