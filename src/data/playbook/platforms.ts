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
