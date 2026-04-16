export interface PlatformSection {
  id: string;
  type: 'intro' | 'list-grid' | 'content-mix' | 'formula-steps' | 'hooks' | 'content-ideas' | 'text-section' | 'lead-gen' | 'bio-template' | 'hashtag' | 'cadence' | 'kickstart' | 'one-rule' | 'stats-grid' | 'page-setup';
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
  bioTemplate?: string[];
  hashtagTiers?: { tier: string; range: string; count: string }[];
  callout?: { title: string; body: string[] };
  leadGenIntro?: string;
  leadGenSteps?: { title: string; description: string }[];
  leadGenReasons?: string[];
  paragraphs?: string[];
  stats?: { label: string; value: string }[];
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
    whatItDoes: 'Reaches older demographics, builds local community, and converts through Groups and Marketplace.',
    whatItsNotFor: 'Viral growth. Facebook rewards depth of relationship, not flash.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who Facebook Is Best For',
        bullets: [
          'Local service businesses (anything hiring a contractor, trades, home services)',
          'Businesses targeting customers 35+',
          'Community-driven brands',
          'B2C businesses in smaller towns and regional markets',
        ],
        callout: {
          title: '',
          body: ['If your customer is a homeowner, parent, or small business owner in a specific city \u2014 Facebook is still one of the highest-converting platforms on the planet.'],
        },
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix',
        contentMix: [
          { type: 'Long-Form Text Posts', frequency: '2\u20133x/week', description: 'Facebook loves text. Long-form posts with hooks outperform almost everything else.' },
          { type: 'Video Posts', frequency: '1\u20132x/week', description: 'Native upload, not YouTube links. Facebook pushes native video hard.' },
          { type: 'Local Group Activity', frequency: 'Daily', description: 'Engage in 3\u20135 local groups. 10\u201315 min/day giving value.' },
          { type: 'Marketplace Listings', frequency: 'As needed', description: 'If you sell anything tangible, list it on Facebook Marketplace.' },
        ],
      },
      {
        id: 'long-form-formula',
        type: 'formula-steps',
        title: 'The Long-Form Post Formula',
        intro: 'Facebook\u2019s algorithm rewards people who stop scrolling. Long text posts with hooks outperform almost everything else.',
        formulaSteps: [
          { label: 'Line 1', text: 'A specific, curiosity-driven hook.' },
          { label: 'Line 2', text: 'A line break (this forces people to click \u201csee more\u201d).' },
          { label: 'Middle', text: 'Tell a story. Share a win. Break down a lesson. Make it human.' },
          { label: 'End', text: 'Ask a question to drive comments. The algorithm eats that up.' },
        ],
      },
      {
        id: 'long-form-hooks',
        type: 'hooks',
        title: 'Long-Form Hook Examples',
        hooks: [
          '\u201cI almost lost my business 3 years ago. Here\u2019s what saved it.\u201d',
          '\u201cA customer called me yesterday crying. This is what happened.\u201d',
          '\u201cI made a $10,000 mistake last month. So you don\u2019t have to.\u201d',
          '\u201cMost [industry] companies are doing this wrong. Here\u2019s proof.\u201d',
          '\u201cThis one change doubled my revenue in 6 months.\u201d',
        ],
      },
      {
        id: 'why-long-text',
        type: 'content-ideas',
        title: 'Why Long Text Wins on Facebook',
        bullets: [
          'It feels like a real person, not an ad',
          'It makes the reader stop and read',
          'Comments drive reach, and stories drive comments',
          'Facebook hides links \u2014 text-only posts get 3\u20135x the reach',
        ],
      },
      {
        id: 'video-strategy',
        type: 'text-section',
        title: 'Video Strategy on Facebook',
        intro: 'Facebook still pushes native video hard \u2014 but only if you upload directly. Don\u2019t share a YouTube link. Upload the video to Facebook.',
        items: [
          { title: 'What Works', description: '' },
        ],
        bullets: [
          'Customer testimonial videos (2\u20133 minutes, raw and unpolished)',
          'Behind-the-scenes of your work (5\u201310 minutes of you actually doing the job)',
          'Talking head videos where you answer common questions',
          'Before & after videos for any visual transformation',
        ],
        callout: {
          title: '',
          body: ['Don\u2019t overthink production. Real beats polished on Facebook.'],
        },
      },
      {
        id: 'groups-goldmine',
        type: 'text-section',
        title: 'Facebook Groups: The Goldmine',
        intro: 'This is where Facebook prints money for small businesses. Most people miss it.',
        items: [
          { title: 'The Strategy', description: '' },
        ],
        bullets: [
          'Join 10 local groups where your customers hang out: neighborhood groups, parenting groups, industry groups, hobby groups, buy/sell/trade groups',
          'Rule of thumb: Give 10x before you ask. Answer questions. Help people. Never pitch in the group.',
          'When someone asks about your service (and they will), comment with genuine help \u2014 then follow up in DMs.',
          'Create your own Facebook Group around the problem you solve \u2014 not your service. Example: \u201cRedding Homeowner Tips\u201d not \u201cCannon Tree Service Customers.\u201d',
        ],
        callout: {
          title: 'Why Your Own Group Works',
          body: [
            'You become the authority in that space. Members get notifications from your posts. You can run events, Q&As, and live streams to the whole group. Every new member is a warm lead.',
          ],
        },
      },
      {
        id: 'lead-ads',
        type: 'lead-gen',
        title: 'Facebook Lead Ads: The Cheat Code',
        leadGenIntro: 'If you have even $5/day, Facebook Lead Ads are one of the highest-ROI paid channels for local service businesses.',
        subtitle: 'What Makes a Great Lead Ad',
        leadGenSteps: [
          { title: 'An irresistible offer', description: '\u201cFree tree health inspection\u201d / \u201cFree quote within 24 hours\u201d / \u201cFirst service 20% off\u201d' },
          { title: 'A clear image', description: 'Your work, your face, or your team. Not stock photos.' },
          { title: 'Simple copy', description: 'Problem they have \u2192 Solution you offer \u2192 Clear CTA.' },
          { title: 'Minimal form fields', description: 'Name + phone only. Every extra field cuts your conversion rate.' },
        ],
        leadGenReasons: [
          'Cost per lead: $3\u2013$15 for most local service businesses',
          'Lead-to-customer rate: 10\u201330% (depending on follow-up)',
          'Call leads within 5 minutes \u2014 every hour you wait cuts conversion in half',
        ],
      },
      {
        id: 'lead-gen-system',
        type: 'lead-gen',
        title: 'Lead Generation Strategy on Facebook',
        leadGenIntro: 'Your complete system for turning Facebook into a lead machine:',
        leadGenSteps: [
          { title: 'Post 4\u20135x per week on your business page', description: 'Mostly long-form text + 1\u20132 videos.' },
          { title: 'Engage in 3\u20135 local groups daily', description: '10\u201315 min/day, giving value.' },
          { title: 'Create your own Facebook Group in month 2\u20133', description: 'Once you\u2019ve built credibility in other groups.' },
          { title: 'Run simple Lead Ads', description: 'Your best offer with a $5\u2013$20/day budget.' },
          { title: 'Respond to every message within 5 minutes', description: 'During business hours. Speed is everything.' },
        ],
      },
      {
        id: 'page-setup',
        type: 'page-setup',
        title: 'Your Facebook Page Setup',
        intro: 'Most business pages are dead. Here\u2019s how to fix yours:',
        items: [
          { title: 'Cover photo', description: 'Shows your work or your team (not a logo)' },
          { title: 'Profile photo', description: 'Your face or your logo \u2014 pick one and stick with it' },
          { title: 'About section', description: 'Written in first person (\u201cI started this business because...\u201d)' },
          { title: 'Pinned post', description: 'Your best testimonial + a CTA' },
          { title: 'Services tab', description: 'Every service you offer, with clear pricing ranges' },
          { title: 'Reviews enabled', description: 'Ask every customer to leave one' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Business Page Posts', content: '4\u20135 per week' },
          { label: 'Group Engagement', content: 'Daily (10\u201315 min)' },
          { label: 'Group Posts', content: '1 per week (value-only, no pitch)' },
          { label: 'Stories', content: '1\u20132 per day (underused \u2014 high reach)' },
        ],
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day Facebook Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Optimize your business page. Join 10 local groups. Invite your current customers to follow your page.' },
          { week: 'Week 2', description: 'Post 3 long-form text posts about customer wins, lessons learned, or common problems. Comment in groups daily.' },
          { week: 'Week 3', description: 'Upload 1 video. Launch a simple offer for new customers. Start collecting reviews.' },
          { week: 'Week 4', description: 'Test a $5/day Lead Ad with your best offer. Create or announce your own community group.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The Facebook Rule That Changes Everything',
        oneRule: {
          title: 'Be the helpful local.',
          description: 'Facebook isn\u2019t a stage \u2014 it\u2019s a town square. The business owner who helps most wins the trust of the community. Trust converts into customers. Every time.',
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
    whatItDoes: 'Gets you in front of strangers. Fastest way to scale reach from zero followers to tens of thousands.',
    whatItsNotFor: 'Polished content. TikTok rewards raw, real, and unfiltered.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who TikTok Is Best For',
        bullets: [
          'Anyone who wants fast audience growth from zero',
          'Businesses targeting customers under 45',
          'Visual, hands-on trades and services (huge upside here)',
          'Coaches, creators, and personality-driven brands',
          'Local businesses that want to go viral in their city',
        ],
        callout: {
          title: '',
          body: ['TikTok has the most aggressive discovery algorithm on the internet. A brand-new account with zero followers can get 100,000 views on day one if the content is right.'],
        },
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix',
        contentMix: [
          { type: 'Videos', frequency: '1\u20133x/day', description: 'This is the minimum for real growth.' },
          { type: 'Comment Reply Videos', frequency: 'As opportunities arise', description: 'Reply to comments with video \u2014 massive reach boost.' },
          { type: 'Trend Jumps', frequency: 'Within 48 hours', description: 'Jump on trends fast. After 72 hours, they\u2019re saturated and dying.' },
          { type: 'Format Mix', frequency: 'Ongoing', description: 'Talking head, voiceover, green screen, before/after. Mix it up.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The TikTok Formula',
        formulaSteps: [
          { label: 'Hook (0\u20132 sec)', text: 'Visual movement + bold statement. No slow intros. Ever.' },
          { label: 'Build (2\u201315 sec)', text: 'Story, demo, or tip. Keep energy high.' },
          { label: 'Payoff (last 3 sec)', text: 'Deliver the value. Add a soft CTA like \u201cFollow for part 2\u201d or \u201cComment if you want the full list.\u201d' },
        ],
        callout: {
          title: 'The Rule of 3 Seconds',
          body: ['If your video doesn\u2019t grab someone in 3 seconds, the algorithm kills it. Your hook has to be instant.'],
        },
      },
      {
        id: 'hooks',
        type: 'hooks',
        title: 'TikTok Hooks That Crush',
        hooks: [
          '\u201cStop doing [common thing] right now.\u201d',
          '\u201cPOV: You just [customer situation].\u201d',
          '\u201cThis is your sign to [action].\u201d',
          '\u201c[Bold number] I learned after [experience].\u201d',
          '\u201cIf you\u2019re a [customer type], you need to hear this.\u201d',
          '\u201cHere\u2019s a secret from inside the [industry] industry.\u201d',
          '\u201cI can\u2019t believe nobody\u2019s talking about this.\u201d',
        ],
      },
      {
        id: 'content-formats',
        type: 'content-ideas',
        title: 'Content Formats That Work on TikTok',
        items: [
          { title: 'Day-in-the-Life', description: 'Show the real work. The real mess. The real wins. Authenticity crushes polish.' },
          { title: 'Before & After', description: 'Massive for service businesses. Show the problem \u2192 show the transformation. Keep it under 30 seconds. Zero words needed.' },
          { title: 'POV Videos', description: 'Put the viewer in your customer\u2019s shoes. \u201cPOV: You called a tree service at 10pm because a tree fell on your house.\u201d Instant emotional connection.' },
          { title: 'Green Screen Breakdowns', description: 'React to news, questions, or industry content. Low-effort, high-reach format. Just put an article or video behind you and break it down.' },
          { title: 'Storytime Videos', description: '\u201cLet me tell you about the customer who...\u201d Stories get watched to the end. Watch-time is TikTok\u2019s #1 metric.' },
          { title: 'Controversial Takes', description: '\u201cUnpopular opinion: most [industry] people are doing this wrong.\u201d If you believe it, say it. Don\u2019t fake it. Use with care.' },
        ],
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy on TikTok',
        leadGenIntro: 'TikTok\u2019s algorithm doesn\u2019t care about followers \u2014 it cares about watch time. Your job is to build attention first, then convert it off-platform.',
        subtitle: 'The Funnel',
        leadGenSteps: [
          { title: 'Build a following around your expertise, not your business', description: 'Your bio says what you help with, not what you sell.' },
          { title: 'Link in bio goes to ONE offer', description: 'A free consultation, a free guide, or a free first step. One thing only.' },
          { title: 'Pin 3 videos at the top of your profile', description: 'Video 1: The intro (\u201cWho I am and what I do\u201d). Video 2: The proof (\u201cHow I got X result\u201d or \u201cBefore & after\u201d). Video 3: The offer (\u201cHere\u2019s what I help with \u2014 DM me\u201d).' },
          { title: 'Comment sections are gold', description: 'Every comment is a potential lead. Reply to all of them \u2014 especially the skeptical ones.' },
        ],
        callout: {
          title: 'The Comment Reply Video Trick',
          body: ['When someone leaves a great comment or question, reply with a video. TikTok pushes these videos hard, and the original commenter almost always becomes a follower. This is the single fastest way to grow an account.'],
        },
      },
      {
        id: 'bio-setup',
        type: 'bio-template',
        title: 'Your TikTok Bio Setup',
        intro: 'Your bio is your storefront. Make it clear, not clever.',
        bioTemplate: [
          'Name: Your name + what you help with. (\u201cElijah | Tree Service Tips\u201d)',
          'Bio line 1: What you help with',
          'Bio line 2: Proof / credibility',
          'Bio line 3: CTA + link',
        ],
        callout: {
          title: 'Example',
          body: [
            'Elijah | Tree Service Tips',
            'Helping homeowners avoid costly tree mistakes',
            '500+ local jobs done',
            'Free tree inspection (link below)',
          ],
        },
      },
      {
        id: 'trends',
        type: 'text-section',
        title: 'Trends: The Shortcut to Reach',
        intro: 'Trends are free distribution. When TikTok is pushing a sound, format, or effect \u2014 they\u2019ll push your video too, just for using it.',
        items: [
          { title: 'How to Find Trends', description: 'Open your For You page every morning. If you see the same sound 3 times in 10 minutes, it\u2019s trending. Click on any sound \u2014 if it shows \u201c10K+ videos\u201d and the number is growing fast, it\u2019s trending. Follow 5\u201310 creators who cover trends for early signals.' },
          { title: 'The 48-Hour Rule', description: 'Jump on a trend within 48 hours of spotting it. After 72 hours, it\u2019s saturated and dying.' },
          { title: 'How to Use a Trend for Your Business', description: 'Don\u2019t just copy the trend \u2014 adapt it to your niche. Trending sound + your industry\u2019s pain point = viral potential.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Videos', content: '1\u20133 per day (consistency beats perfection)' },
          { label: 'Comment Engagement', content: '15 min after each post' },
          { label: 'Analytics Check', content: 'Weekly \u2014 double down on what works' },
        ],
        callout: {
          title: 'The 30-Day Volume Rule',
          body: ['Post 1 video per day for 30 days, even if they flop. TikTok\u2019s algorithm learns who your audience is through repetition. Most accounts hit their first viral video between day 15 and day 45 \u2014 NEVER on day 1.'],
        },
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day TikTok Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Post 1 video per day. Don\u2019t worry about views. Learn the camera. Learn the editor.' },
          { week: 'Week 2', description: 'Study your analytics. Which videos got the most watch-time? Make more like those.' },
          { week: 'Week 3', description: 'Jump on 2 trending sounds. Do 1 \u201creply to comment\u201d video.' },
          { week: 'Week 4', description: 'Pin your 3 best videos. Add your link in bio. Start directing traffic to your offer.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The TikTok Rule That Beats Every Tactic',
        oneRule: {
          title: 'Post before you\u2019re ready. Every time.',
          description: 'The #1 reason people fail on TikTok is they overthink. They edit for hours. They wait for the \u201cperfect\u201d video. The algorithm rewards volume and consistency over polish every single time. The creator who posts 30 mediocre videos will beat the creator who posts 3 perfect ones. Always.',
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
    whatItDoes: 'Builds authority and generates leads on autopilot \u2014 for years. A single good video can bring you customers 3 years from now.',
    whatItsNotFor: 'Instant results. YouTube is a long game. Most channels don\u2019t pop until month 6\u201312.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who YouTube Is Best For',
        bullets: [
          'Anyone selling a high-ticket product or service ($1,000+)',
          'Education-heavy businesses',
          'Personal brands and coaches',
          'Local service businesses that want to rank on Google',
          'Anyone willing to play a 12-month game for 10-year returns',
        ],
        callout: {
          title: '',
          body: ['Every other platform decays. A TikTok video dies in 48 hours. A YouTube video can keep getting views for a decade.'],
        },
      },
      {
        id: 'two-types',
        type: 'text-section',
        title: 'Two Types of YouTube Content',
        intro: 'You need both. They do different jobs.',
        items: [
          { title: '1. YouTube Shorts (under 60 seconds)', description: 'Top of funnel. Builds subscribers fast. Similar to TikTok \u2014 rapid discovery. Recycle your TikToks directly here.' },
          { title: '2. Long-Form Videos (8\u201320 minutes)', description: 'Builds deep trust. Ranks on Google and YouTube search. Converts buyers. The money maker.' },
        ],
        callout: {
          title: '',
          body: ['Shorts get you seen. Long videos get you paid.'],
        },
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The Long-Form Video Formula',
        formulaSteps: [
          { label: '0\u201315 seconds', text: 'Promise a specific outcome. Tell them exactly what they\u2019ll learn.' },
          { label: '15\u201330 seconds', text: 'Establish credibility fast (why should they trust you on this).' },
          { label: '30 sec \u2013 1 min', text: 'Preview the payoff. \u201cBy the end of this video you\u2019ll know X, Y, Z.\u201d' },
          { label: 'Main content (3\u201315 min)', text: 'Teach one thing deeply. Don\u2019t cover 5 topics.' },
          { label: 'Last 30 seconds', text: 'CTA to subscribe + link to your free resource in the description.' },
        ],
        callout: {
          title: 'The Rule of One',
          body: ['One video = one topic = one promise = one CTA. The biggest mistake on YouTube is trying to pack 5 ideas into one video. You lose the viewer. Pick one thing. Teach it better than anyone else on the internet.'],
        },
      },
      {
        id: 'topics',
        type: 'text-section',
        title: 'What Topics to Cover',
        intro: 'YouTube is a search engine. People go there looking for answers. Your job is to be the answer.',
        items: [
          { title: 'The Research Method', description: 'Go to Google and YouTube. Type the exact questions your customers ask you every day. Look at which questions have lots of searches but few good videos. Make the video you wish existed.' },
        ],
        bullets: [
          '\u201cHow much does [your service] cost in [your city]?\u201d',
          '\u201cHow to choose a contractor in [your city]\u201d',
          '\u201cWhat to do before hiring a [your service]\u201d',
          '\u201cRed flags when hiring a [your service]\u201d',
          '\u201c[Your service] in [city]: what to expect\u201d',
          '\u201cDIY vs. hiring a pro for [task]\u201d',
        ],
        callout: {
          title: '',
          body: ['These videos get searched for years. That\u2019s the compound interest of YouTube.'],
        },
      },
      {
        id: 'big-three',
        type: 'content-ideas',
        title: 'Title, Thumbnail, and First 30 Seconds: The Big 3',
        intro: 'YouTube lives and dies on these three. Everything else is secondary.',
        items: [
          { title: 'Titles That Get Clicked', description: 'Use numbers: \u201c5 Ways to...\u201d / \u201c$10,000 Mistake\u201d / \u201cIn 30 Days.\u201d Create curiosity: \u201cNobody Tells You This About...\u201d Promise a specific result: \u201cHow I Got [Result] Without [Pain].\u201d Use the exact question your customer asks.' },
          { title: 'Thumbnails That Convert', description: 'Your face \u2014 with a clear emotion. 3\u20135 words max of text. Bright, contrasting colors. Simple enough to read on a phone screen.' },
          { title: 'The First 30 Seconds', description: 'Confirm the promise \u2014 \u201cIn this video, I\u2019m going to show you exactly how to...\u201d Hook with proof \u2014 \u201cI\u2019ve done this 500 times and here\u2019s what I\u2019ve learned...\u201d Preview the payoff \u2014 \u201cBy the end you\u2019ll know how to...\u201d Create urgency \u2014 \u201cStick around to slide 7 \u2014 that\u2019s where it gets good.\u201d' },
        ],
        callout: {
          title: 'Good Thumbnail Test',
          body: ['Could someone 6 feet away from your phone screen tell what the video is about in 1 second?'],
        },
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy on YouTube',
        leadGenIntro: 'YouTube is the king of passive lead generation. Set it up once \u2014 leads come in forever.',
        subtitle: 'The 4-Layer Lead Capture',
        leadGenSteps: [
          { title: 'Link in every description', description: 'Every video description has a link to a free resource \u2014 a guide, checklist, or mini-course.' },
          { title: 'Two CTAs per video', description: 'Mid-video soft CTA: \u201cIf you want the free [thing], link is below.\u201d End of video hard CTA: \u201cGrab the free [thing] in the description and I\u2019ll see you in the next video.\u201d' },
          { title: 'Pinned comment on every video', description: 'Pin a comment with your offer and link. People often read the top comment before watching.' },
          { title: 'End screens', description: 'Link to your next video + your free resource. Every video should lead somewhere.' },
        ],
        callout: {
          title: 'The Free Resource That Works',
          body: ['Don\u2019t make a generic ebook. Make something your viewer can use in the next 10 minutes: a fillable checklist, a one-page cheat sheet, a template they can copy, or a 5-minute video walkthrough. The more specific and actionable, the higher the opt-in rate.'],
        },
      },
      {
        id: 'shorts-strategy',
        type: 'text-section',
        title: 'Shorts Strategy: The Subscriber Magnet',
        intro: 'YouTube Shorts are the fastest way to grow your subscriber count right now. The algorithm pushes them to strangers \u2014 just like TikTok.',
        bullets: [
          'Clips from your long-form videos (your best 30-second sections)',
          'Recycled TikTok content',
          'Quick tips (under 60 seconds)',
          '\u201cWatch this before you...\u201d',
          'Myth busters',
        ],
        callout: {
          title: 'The Shorts-to-Long-Form Funnel',
          body: ['People discover you through Shorts \u2192 They subscribe because they like your vibe \u2192 YouTube starts recommending your long-form videos to them \u2192 They watch, they trust you, they click your link \u2192 You capture the lead.'],
        },
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Long-Form Video', content: '1 per week (non-negotiable if you want to grow)' },
          { label: 'Shorts', content: '3\u20135 per week (recycle TikTok content to save time)' },
          { label: 'Community Posts', content: '2\u20133 per week (polls, behind-the-scenes, questions)' },
          { label: 'Comment Replies', content: 'Every comment in the first 24 hours (massive algorithm boost)' },
        ],
        callout: {
          title: 'Why Consistency Beats Everything',
          body: ['YouTube\u2019s algorithm tracks whether your audience can count on you. Missing weeks tanks your reach. Better to post one video every Sunday for 52 weeks than 5 videos in a burst and nothing for a month.'],
        },
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 90-Day YouTube Kickstart',
        kickstart: [
          { week: 'Month 1', description: 'Pick your niche. Post 4 long-form videos + 20 Shorts. Don\u2019t worry about views. Focus on improving each video.' },
          { week: 'Month 2', description: 'Study your analytics. Which titles got clicks? Which thumbnails worked? Which topics held attention? Make more of what worked.' },
          { week: 'Month 3', description: 'Launch your free resource + lead capture. Add CTAs to every video. Start collecting emails.' },
        ],
        callout: {
          title: '',
          body: ['Most channels hit their first \u201cpop\u201d video between months 4 and 8. Keep posting.'],
        },
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The YouTube Rule That Beats Every Tactic',
        oneRule: {
          title: 'Make the video you wish existed.',
          description: 'Every time you Google a question and can\u2019t find a good answer \u2014 that\u2019s a YouTube video waiting to be made. Be the person who makes it. 10 years from now, that video will still be working for you. YouTube is the one platform where the work you do today keeps paying you forever.',
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
    whatItDoes: 'Reaches decision makers, business owners, and professionals. Best platform for B2B lead generation \u2014 by a mile.',
    whatItsNotFor: 'B2C impulse purchases. LinkedIn buyers are slower, but the deals are bigger.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who LinkedIn Is Best For',
        bullets: [
          'B2B services (consulting, agencies, SaaS, coaching)',
          'Anyone selling to professionals or executives',
          'High-ticket service providers ($5,000+)',
          'Personal brands built around expertise',
          'Recruiters and hiring businesses',
        ],
        callout: {
          title: '',
          body: ['If your customer has the word \u201cdirector,\u201d \u201cmanager,\u201d \u201cfounder,\u201d \u201cCEO,\u201d or \u201cowner\u201d in their job title \u2014 LinkedIn is where you live.'],
        },
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix',
        contentMix: [
          { type: 'Text Posts', frequency: '3\u20135x/week', description: 'Story-driven posts with clear insights. LinkedIn loves personal stories with business lessons.' },
          { type: 'Carousel Docs', frequency: '1\u20132x/week', description: 'PDF carousels with frameworks, templates, or step-by-step guides. Highest engagement format on the platform.' },
          { type: 'Comments', frequency: '5\u201310/day', description: 'Thoughtful comments on posts from people in your target market. This is the #1 underrated growth strategy.' },
          { type: 'Long-Form Articles', frequency: '1x/month', description: 'Optional, but great for authority. Deep dives on your area of expertise.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The LinkedIn Post Formula',
        intro: 'LinkedIn rewards writing that feels personal \u2014 not corporate. The more it sounds like you\u2019re talking to one person, the better it performs.',
        formulaSteps: [
          { label: 'Line 1: Bold Hook', text: 'A bold, specific hook. Contrarian takes kill on LinkedIn.' },
          { label: 'Line 2: Line Break', text: 'Forces the \u201csee more\u201d click \u2014 critical for reach.' },
          { label: 'Middle: Story/Framework', text: 'Personal story, lesson, or framework. Keep paragraphs short (1\u20132 lines each).' },
          { label: 'End: Takeaway + Question', text: 'Lesson or takeaway + a question to drive engagement.' },
        ],
        callout: {
          title: 'The Formatting Secret',
          body: ['Short lines + white space = more readers. LinkedIn hides posts that look like a wall of text. Every 1\u20132 sentences, break to a new line.'],
        },
      },
      {
        id: 'hooks',
        type: 'content-ideas',
        title: 'LinkedIn Hooks That Work',
        bullets: [
          '\u201cI got fired from my first \u2018real\u2019 job. Best thing that ever happened.\u201d',
          '\u201cMost [job title] are doing [thing] completely wrong. Here\u2019s why.\u201d',
          '\u201c[Specific number] changed everything for me. Here\u2019s what I learned.\u201d',
          '\u201cUnpopular opinion about [industry topic].\u201d',
          '\u201cNobody talks about this side of [job / business].\u201d',
          '\u201cI spent $X on [thing] and here\u2019s what I wish I knew.\u201d',
        ],
      },
      {
        id: 'carousel-docs',
        type: 'text-section',
        title: 'Carousel Docs: The Highest-Engagement Format',
        intro: 'LinkedIn carousel PDFs (called \u201cdocs\u201d) get 3\u20135x the reach of normal posts. They\u2019re simple to make and they make you look like an expert.',
        items: [
          { title: 'Cover Slide', description: 'Bold promise or number. Big text, clean design.' },
          { title: 'Slides 2\u20138', description: 'One idea per slide, 20\u201340 words max.' },
          { title: 'Final Slide', description: 'CTA \u2014 \u201cFollow for more\u201d or \u201cDM me [keyword].\u201d' },
        ],
        bullets: [
          '\u201c[X] frameworks I use every week\u201d',
          '\u201c[X] lessons from [years] in [industry]\u201d',
          '\u201cHow to [specific skill] in [time frame]\u201d',
          '\u201c[X] mistakes that are costing you [money/time]\u201d',
          '\u201cThe [industry] playbook nobody shares\u201d',
        ],
        callout: {
          title: 'How to Make One',
          body: ['Use Canva, Figma, or even Google Slides. Export as PDF. Upload directly to LinkedIn. Done.'],
        },
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy on LinkedIn',
        leadGenIntro: 'LinkedIn\u2019s unique advantage: you can directly message the exact decision makers you want to reach.',
        subtitle: 'The 4-Step LinkedIn Lead Gen System',
        leadGenSteps: [
          { title: 'Step 1: Optimize Your Profile Like a Landing Page', description: 'Headline: Not your job title \u2014 the outcome you deliver (\u201cI help [customer] get [result] without [pain]\u201d). Banner image: Your value proposition in visual form. About section: First person, tell a story, end with a clear CTA. Featured section: Your best content, a link to your offer, testimonials.' },
          { title: 'Step 2: Connect With 20 Ideal Customers Per Day', description: 'Search for your exact customer (job title + industry + location). Send a connection request with a short personal note \u2014 no pitch. Example: \u201cHey [name], saw you\u2019re [role] at [company]. Love what you guys are doing with [specific thing]. Would love to connect.\u201d' },
          { title: 'Step 3: Engage With Their Content for 2 Weeks', description: 'Before you ever pitch, show up. Comment thoughtfully on their posts. Add value. Make yourself familiar. When you DM them later, you\u2019re not a stranger.' },
          { title: 'Step 4: The DM Script That Works', description: 'Don\u2019t pitch. Start a conversation. \u201cHey [name], saw your post about [topic]. Totally agree with [specific point]. Curious \u2014 are you [dealing with the problem you solve] right now? No pitch, just curious.\u201d If they say yes \u2192 ask to hop on a quick 15-min call. If they say no \u2192 thank them, keep engaging.' },
        ],
        callout: {
          title: 'The Give-Give-Ask Rule',
          body: ['Give value twice before you ever ask for anything. A comment. A resource. A useful intro. By the third interaction, you\u2019ve earned the right to offer something.'],
        },
      },
      {
        id: 'comment-strategy',
        type: 'text-section',
        title: 'The Comment Strategy: Your Secret Weapon',
        intro: 'Your comments on OTHER people\u2019s posts drive more growth than your own posts \u2014 especially when you\u2019re starting out.',
        items: [
          { title: 'Bigger accounts in your niche', description: 'You show up in front of their audience.' },
          { title: 'Your ideal customers', description: 'You build relationships with prospects.' },
          { title: 'Peers and connectors', description: 'You build your network.' },
        ],
        bullets: [
          'Adds to the conversation (don\u2019t just say \u201cgreat post!\u201d)',
          'Shares your own experience or perspective',
          'Asks a follow-up question',
          '2\u20134 sentences, not 2\u20134 words',
        ],
        callout: {
          title: '',
          body: ['A great comment under a post with 100K views = exposure to 100K potential customers. For free.'],
        },
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Posts', content: '5 per week' },
          { label: 'Engagement', content: '30 minutes per day commenting on others\u2019 posts' },
          { label: 'Connection Requests', content: '20 per day (max \u2014 don\u2019t overdo it)' },
          { label: 'Best Times to Post', content: 'Tuesday\u2013Thursday, 7\u20139am or 12\u20131pm (their time zone)' },
        ],
      },
      {
        id: 'content-pillars',
        type: 'content-ideas',
        title: 'Content Topics That Always Work',
        intro: 'LinkedIn rewards specific niches. Pick 3\u20135 topics and stick to them.',
        items: [
          { title: 'Your expertise', description: 'The thing you do for a living.' },
          { title: 'Your story', description: 'Wins, losses, lessons from your career.' },
          { title: 'Your industry insights', description: 'Trends, predictions, takes.' },
          { title: 'Your process', description: 'How you actually do the work.' },
          { title: 'Your people', description: 'Clients, team, mentors (with permission).' },
        ],
        callout: {
          title: '',
          body: ['Mix these. Don\u2019t just post about your expertise \u2014 that gets boring. Rotate through the pillars.'],
        },
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day LinkedIn Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Rewrite your profile as a landing page. Headline, banner, about section, featured section.' },
          { week: 'Week 2', description: 'Post 3 text posts about lessons from your career. Start commenting on 5 posts per day.' },
          { week: 'Week 3', description: 'Post your first carousel. Connect with 20 ideal customers per day.' },
          { week: 'Week 4', description: 'Start DM conversations with connections who\u2019ve engaged with your content. Book 3\u20135 discovery calls.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The LinkedIn Rule That Beats Every Tactic',
        oneRule: {
          title: 'Be a human on a professional platform.',
          description: 'Everyone else is writing boring corporate content about synergies and growth strategies. Share real stories. Real opinions. Real lessons. The more human you are, the more LinkedIn rewards you. Business owners buy from people they trust. LinkedIn is where you build that trust at scale.',
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
    whatItDoes: 'Fast audience growth, direct access to big accounts in your niche, and drives traffic to your other platforms.',
    whatItsNotFor: 'Visual content or local customer acquisition. X is a text-first, global, niche-driven platform.',
    sections: [
      {
        id: 'who-its-for',
        type: 'list-grid',
        title: 'Who X Is Best For',
        bullets: [
          'Online businesses (SaaS, info products, coaching)',
          'Personal brands built around ideas and opinions',
          'Anyone selling to tech, business, marketing, or creative audiences',
          'Writers, thinkers, and content creators',
          'B2B services targeting founders and operators',
        ],
        callout: {
          title: '',
          body: ['X is less about local customers and more about networking with people in your industry \u2014 many of whom will become customers, partners, or referrers.'],
        },
      },
      {
        id: 'content-mix',
        type: 'content-mix',
        title: 'Content Mix',
        contentMix: [
          { type: 'Tweets', frequency: '3\u20135x/day', description: 'Consistency is everything. One clear idea per tweet. Make it quotable and thought-provoking.' },
          { type: 'Long Threads', frequency: '1\u20132x/week', description: 'Deep dives into one topic. These are your authority builders.' },
          { type: 'Replies', frequency: '10\u201320/day', description: 'Reply to larger accounts daily \u2014 this is how you grow. The #1 underrated strategy on X.' },
        ],
      },
      {
        id: 'formula',
        type: 'formula-steps',
        title: 'The Tweet Formula',
        intro: 'Short punchy tweets outperform long ones most of the time. Use line breaks generously. One idea per tweet. End with a strong opinion or a surprising truth.',
        formulaSteps: [
          { label: 'The Bold Claim', text: 'Most business advice is garbage. The stuff that actually works is boring. Show up. Tell the truth. Ask for the sale.' },
          { label: 'The Specific Lesson', text: 'I used to chase every shiny marketing trend. Spent 3 years and $50K learning nothing. Then I got boring, consistent, and specific. Revenue 10x\u2019d in 18 months.' },
          { label: 'The Quick Framework', text: '3 types of content that always work: Your story. Your opinions. Your lessons. Pick one. Post daily. Done.' },
          { label: 'The Contrarian Take', text: 'Everyone says \u201cniche down.\u201d I say: niche down, then niche further. \u201cMarketing for small businesses\u201d \u2192 \u201cMarketing for local plumbers in Texas\u201d wins every time.' },
        ],
      },
      {
        id: 'thread-formula',
        type: 'formula-steps',
        title: 'The Thread Formula',
        intro: 'Threads are how you build authority on X. A good thread gets bookmarked, shared, and quoted for months.',
        formulaSteps: [
          { label: 'Tweet 1 (Hook)', text: 'The bold promise + what they\u2019ll learn. This is your title.' },
          { label: 'Tweet 2 (Stakes)', text: 'Set up the problem or stakes.' },
          { label: 'Tweets 3\u20139 (Value)', text: 'One idea per tweet. Keep them tight.' },
          { label: 'Last Tweet (CTA)', text: 'Recap + CTA (\u201cIf this helped, follow me for more\u201d + link to offer).' },
        ],
        callout: {
          title: 'The Retweet-Worthy Thread',
          body: ['Great threads end with a tweet that\u2019s so quotable, people screenshot just that tweet and share it on their own. That\u2019s free distribution.'],
        },
      },
      {
        id: 'hooks',
        type: 'content-ideas',
        title: 'Hook Tweets That Get Clicks',
        bullets: [
          '\u201cI spent [time] learning [skill]. Here\u2019s the 7-step process you can use tonight:\u201d',
          '\u201c[X] lessons from [experience/job] most people ignore:\u201d',
          '\u201cHow to [desired result] without [thing they hate]. A thread.\u201d',
          '\u201c[Famous person] said [quote]. Here\u2019s why it changed how I run my business:\u201d',
          '\u201cI analyzed 100 [successful examples]. Here\u2019s what they have in common:\u201d',
        ],
      },
      {
        id: 'reply-strategy',
        type: 'text-section',
        title: 'The Reply Strategy: The #1 Growth Move on X',
        intro: 'Posting original content is good. Replying to bigger accounts is better. This is the fastest path to followers on X \u2014 and almost nobody does it right.',
        items: [
          { title: 'Find 10\u201320 accounts slightly bigger than you', description: '10x\u2013100x your follower count in your niche.' },
          { title: 'Turn on notifications', description: 'Be one of the first 5 replies on every tweet they post.' },
          { title: 'Add real value', description: 'Don\u2019t just say \u201cgreat point.\u201d Expand the idea. Share your experience. Ask a smart follow-up.' },
        ],
        bullets: [
          'Builds on their point',
          'Shares a specific experience or example',
          'Is funny, insightful, or contrarian',
          '1\u20133 sentences (don\u2019t write a thesis)',
        ],
        callout: {
          title: 'Why This Works',
          body: ['When your reply gets likes, it ranks higher and more people see it. Their audience discovers you. You get followers. Every single day.'],
        },
      },
      {
        id: 'lead-gen',
        type: 'lead-gen',
        title: 'Lead Generation Strategy on X',
        leadGenIntro: 'X isn\u2019t great for local leads \u2014 but it\u2019s excellent for building a niche audience that buys online products, services, and info.',
        subtitle: 'The X Lead Gen Funnel',
        leadGenSteps: [
          { title: 'Your Bio Is Your Landing Page', description: 'It should say exactly who you help, how, and include one link. Line 1: What you do / who you help. Line 2: Proof or credibility. Line 3: What they get if they follow. Link: One CTA (free guide, newsletter, consultation).' },
          { title: 'Pin Your Best Thread', description: 'Your \u201cgreatest hits\u201d at the top of your profile. Every new visitor sees it first.' },
          { title: 'Tweet Consistently for 90+ Days', description: 'Build a following and become a known voice. The consistency principle: X rewards people who show up every day.' },
          { title: 'DM Conversations Convert Best', description: 'Follow up with people who engage with your content. After someone has liked multiple tweets, replied to you, or followed you for a while \u2014 open a conversation: \u201cHey [name], appreciate you engaging with my stuff. What do you do?\u201d Simple. Human. No pressure.' },
        ],
      },
      {
        id: 'cadence',
        type: 'cadence',
        title: 'Posting Cadence',
        postingCadence: [
          { label: 'Original Tweets', content: '3\u20135 per day' },
          { label: 'Threads', content: '1 per week' },
          { label: 'Replies', content: '10\u201320 per day (30 min/day)' },
          { label: 'Best Times', content: '7\u20139am and 7\u20139pm in your target audience\u2019s time zone' },
        ],
        callout: {
          title: 'The Consistency Principle',
          body: ['X rewards the people who show up every day. If you post for 2 weeks and quit, you\u2019ll get nowhere. If you post for 12 months \u2014 even mediocre content \u2014 you\u2019ll build something real.'],
        },
      },
      {
        id: 'kickstart',
        type: 'kickstart',
        title: 'The 30-Day X Kickstart',
        kickstart: [
          { week: 'Week 1', description: 'Optimize your bio. Pick 5 topics you\u2019ll tweet about. Start tweeting 3x per day. Don\u2019t worry about followers.' },
          { week: 'Week 2', description: 'Identify 15 larger accounts in your niche. Reply to their posts daily. Watch your follower count start moving.' },
          { week: 'Week 3', description: 'Write your first thread. Share a framework, lesson, or story you\u2019ve learned.' },
          { week: 'Week 4', description: 'Start DMing people who engage with your content. Open conversations. Build your network.' },
        ],
      },
      {
        id: 'one-rule',
        type: 'one-rule',
        title: 'The X Rule That Beats Every Tactic',
        oneRule: {
          title: 'Build in public.',
          description: 'The creators who win on X share the journey \u2014 not just the destination. They share wins and losses. Frameworks they\u2019re testing. Lessons from failures. Nobody wants to follow someone who has it all figured out. They want to follow someone on the way up, sharing everything they learn along the way. Be that person. Show up daily. Share generously. Comment honestly. The audience \u2014 and the opportunities \u2014 will come.',
        },
      },
    ],
  },
];
