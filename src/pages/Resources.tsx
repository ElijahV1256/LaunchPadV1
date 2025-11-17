import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Rocket,
  Download,
  FileText,
  Mail,
  DollarSign,
  Users,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  Home,
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  icon: any;
  content: string;
  downloadable: boolean;
}

const RESOURCES: Resource[] = [
  {
    id: 'outreach-email',
    title: 'First Customer Outreach Email',
    description: 'A proven template to reach your first potential customer',
    icon: Mail,
    downloadable: true,
    content: `Subject: Quick Question About [Their Business/Need]

Hi [Name],

I noticed [specific observation about their business or situation]. I've recently started [your business name], and I help [target audience] with [specific problem you solve].

I'd love to offer you [your service/product] at a special introductory rate as one of my first customers. This would include:
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]

Would you be interested in a quick 15-minute call to discuss how I might be able to help?

Best regards,
[Your Name]
[Your Contact Info]`,
  },
  {
    id: 'pricing-sheet',
    title: 'Simple Pricing Sheet Template',
    description: 'Create clear, compelling pricing for your first customers',
    icon: DollarSign,
    downloadable: true,
    content: `[Your Business Name]
Pricing & Packages

STARTER PACKAGE
$[Price]
• [Feature 1]
• [Feature 2]
• [Feature 3]
• [Deliverable timeline]
Perfect for: [Ideal customer description]

STANDARD PACKAGE (Most Popular!)
$[Price]
• Everything in Starter
• [Additional Feature 1]
• [Additional Feature 2]
• [Additional Feature 3]
• [Deliverable timeline]
Perfect for: [Ideal customer description]

PREMIUM PACKAGE
$[Price]
• Everything in Standard
• [Premium Feature 1]
• [Premium Feature 2]
• [Premium Feature 3]
• [Deliverable timeline]
Perfect for: [Ideal customer description]

All packages include:
✓ [Guarantee or promise]
✓ [Support details]
✓ [Revision policy]

Ready to get started? Contact: [Your Email/Phone]`,
  },
  {
    id: 'customer-checklist',
    title: 'First Customer Checklist',
    description: 'Everything you need to do to land and serve your first customer',
    icon: CheckSquare,
    downloadable: true,
    content: `FIRST CUSTOMER CHECKLIST

BEFORE OUTREACH:
☐ Define your ideal customer clearly
☐ Create a simple one-page offer
☐ Set your pricing (start higher than you think!)
☐ Prepare 3-5 portfolio/example pieces
☐ Set up basic payment method (PayPal, Venmo, Stripe)

DURING OUTREACH:
☐ Make a list of 20 potential customers
☐ Personalize each outreach message
☐ Follow up 2-3 times if no response
☐ Respond to inquiries within 24 hours
☐ Offer a discovery call or consultation

CLOSING THE SALE:
☐ Listen more than you talk
☐ Understand their specific problem
☐ Present your solution clearly
☐ Handle objections with empathy
☐ Ask for the sale directly
☐ Send a clear proposal/agreement

AFTER SALE:
☐ Send a welcome email with next steps
☐ Clarify expectations and timeline
☐ Over-communicate progress
☐ Deliver on time (or early!)
☐ Ask for feedback
☐ Request a testimonial
☐ Ask for referrals`,
  },
  {
    id: 'social-post',
    title: 'Launch Announcement Template',
    description: 'Announce your business on social media',
    icon: MessageSquare,
    downloadable: true,
    content: `🚀 Big news! I'm officially launching [Your Business Name]!

After [seeing/experiencing] [problem], I decided to do something about it.

[Your Business Name] helps [target audience] to [main benefit/transformation].

Here's what makes us different:
✨ [Unique selling point 1]
✨ [Unique selling point 2]
✨ [Unique selling point 3]

To celebrate the launch, I'm offering [special offer] to the first [X] customers.

Interested? Comment below or DM me!

Want to support? Share this with someone who needs [your solution]!

#[YourNiche] #SmallBusiness #NewBusiness #Entrepreneurship`,
  },
  {
    id: 'testimonial-request',
    title: 'Testimonial Request Email',
    description: 'Get powerful testimonials from happy customers',
    icon: Users,
    downloadable: true,
    content: `Subject: Quick Favor? Would Love Your Feedback

Hi [Customer Name],

I hope you're enjoying [product/service you delivered]!

As a new business, testimonials from customers like you mean the world to me. Would you mind sharing a few words about your experience?

Specifically, it would be helpful if you could mention:
• What problem you were facing before
• Why you chose to work with me
• What results or benefits you've seen
• What you'd tell others considering [your service]

No need to write a novel - even a few sentences would be amazing!

If you're willing, just reply to this email with your thoughts, and let me know if it's okay to use your feedback on my website and marketing materials.

Thank you so much for your support!

Best,
[Your Name]`,
  },
  {
    id: 'follow-up-email',
    title: 'Outreach Follow-Up Email',
    description: 'Follow up with prospects who haven\'t responded',
    icon: TrendingUp,
    downloadable: true,
    content: `Subject: Following up on my previous email

Hi [Name],

I wanted to quickly follow up on my email from [date] about [your service/product].

I know you're busy, so I'll keep this brief:

I help [target audience] with [specific problem], and I think I could really help with [specific observation about their situation].

Just checking:
• Is this still a priority for you?
• Would a quick 10-minute call this week work?

If now's not the right time, no worries at all - just let me know and I won't bother you again.

Thanks,
[Your Name]

P.S. Here's a quick win you can implement today: [one actionable tip related to their problem]`,
  },
];

export default function Resources() {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const navigate = useNavigate();

  const handleDownload = (resource: Resource) => {
    const blob = new Blob([resource.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resource.title.toLowerCase().replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0A192F] to-[#0A192F]">
      <nav className="container mx-auto px-6 py-6">
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <Rocket className="text-[#2979FF]" size={32} />
            <span className="text-2xl font-bold text-white font-['Montserrat']">Launch Pad</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <Home size={20} />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
        </div>
      </nav>

      <div className="container mx-auto px-6 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-['Montserrat']">
              Resource Library
            </h1>
            <p className="text-xl text-gray-300">
              Templates, checklists, and scripts to help you launch faster
            </p>
          </div>

          {!selectedResource ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {RESOURCES.map((resource) => {
                const Icon = resource.icon;
                return (
                  <button
                    key={resource.id}
                    onClick={() => setSelectedResource(resource)}
                    className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-left group"
                  >
                    <Icon
                      className="text-[#2979FF] mb-4 group-hover:scale-110 transition-transform"
                      size={40}
                    />
                    <h3 className="text-xl font-bold text-white mb-2">{resource.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{resource.description}</p>
                    {resource.downloadable && (
                      <div className="flex items-center gap-2 text-[#2979FF] text-sm font-semibold">
                        <Download size={16} />
                        Downloadable
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <button
                onClick={() => setSelectedResource(null)}
                className="text-gray-400 hover:text-white transition-colors mb-6"
              >
                ← Back to Resources
              </button>

              <div className="flex items-start gap-4 mb-6">
                {(() => {
                  const Icon = selectedResource.icon;
                  return <Icon className="text-[#2979FF]" size={32} />;
                })()}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-white mb-2 font-['Montserrat']">
                    {selectedResource.title}
                  </h2>
                  <p className="text-gray-300">{selectedResource.description}</p>
                </div>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
                <pre className="text-gray-200 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {selectedResource.content}
                </pre>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleDownload(selectedResource)}
                  className="flex items-center gap-2 px-6 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all duration-300"
                >
                  <Download size={18} />
                  Download
                </button>
                <button
                  onClick={() => handleCopy(selectedResource.content)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg font-bold hover:bg-white/20 transition-all duration-300"
                >
                  <FileText size={18} />
                  Copy to Clipboard
                </button>
              </div>
            </div>
          )}

          {!selectedResource && (
            <div className="mt-12 bg-gradient-to-br from-[#2979FF]/20 to-purple-500/20 backdrop-blur-sm border border-[#2979FF]/30 rounded-2xl p-8 text-center">
              <FileText className="text-[#2979FF] mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold text-white mb-2 font-['Montserrat']">
                Need something specific?
              </h3>
              <p className="text-gray-300 mb-6">
                These templates are starting points. Customize them to fit your unique business and
                voice.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-3 bg-[#2979FF] text-[#0A192F] rounded-lg font-bold hover:bg-[#2979FF]/90 transition-all duration-300"
              >
                Back to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
