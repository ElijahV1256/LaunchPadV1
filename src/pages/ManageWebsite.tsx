import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Home,
  Globe,
  Palette,
  FileText,
  CreditCard,
  Download,
  Eye,
  Save,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  Settings
} from 'lucide-react';

interface WebsiteData {
  id: string;
  user_id: string;
  business_type: 'ecommerce' | 'service';
  brand_name: string;
  domain_status: {
    mode: 'subdomain' | 'custom';
    subdomain: string;
    custom_domain: string;
    verification_status: string;
  };
  publish_status: 'draft' | 'published';
  primary_color: string;
  secondary_color: string;
  font_heading: string;
  font_body: string;
}

interface WebsiteContent {
  id: string;
  website_id: string;
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

interface PaymentData {
  id: string;
  website_id: string;
  provider: 'stripe';
  status: 'not_connected' | 'connected';
  stripe_account_id: string | null;
  checkout_mode: 'pay_link' | 'deposit' | 'cart' | 'invoice';
  default_price: number | null;
}

export default function ManageWebsite() {
  const { websiteId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'domain' | 'design' | 'payments' | 'export'>('content');

  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [payments, setPayments] = useState<PaymentData | null>(null);

  const [showCopySuccess, setShowCopySuccess] = useState(false);

  useEffect(() => {
    if (currentUser && websiteId) {
      loadWebsiteData();
    }
  }, [currentUser, websiteId]);

  const loadWebsiteData = async () => {
    try {
      const [websiteRes, contentRes, paymentsRes] = await Promise.all([
        supabase
          .from('managed_websites')
          .select('*')
          .eq('id', websiteId)
          .maybeSingle(),
        supabase
          .from('managed_website_content')
          .select('*')
          .eq('website_id', websiteId)
          .maybeSingle(),
        supabase
          .from('website_payments')
          .select('*')
          .eq('website_id', websiteId)
          .maybeSingle(),
      ]);

      if (websiteRes.error) throw websiteRes.error;
      if (!websiteRes.data) {
        navigate('/dashboard');
        return;
      }

      setWebsite(websiteRes.data);

      if (contentRes.data) {
        setContent(contentRes.data);
      } else {
        const { data: newContent } = await supabase
          .from('managed_website_content')
          .insert({ website_id: websiteId })
          .select()
          .single();
        setContent(newContent);
      }

      if (paymentsRes.data) {
        setPayments(paymentsRes.data);
      } else {
        const { data: newPayment } = await supabase
          .from('website_payments')
          .insert({ website_id: websiteId })
          .select()
          .single();
        setPayments(newPayment);
      }
    } catch (err: any) {
      console.error('Error loading website:', err);
      alert('Failed to load website data');
    } finally {
      setLoading(false);
    }
  };

  const saveContent = async () => {
    if (!content || !website) return;

    setSaving(true);
    try {
      await supabase
        .from('managed_website_content')
        .update({
          home: content.home,
          updated_at: new Date().toISOString(),
        })
        .eq('id', content.id);

      await supabase
        .from('managed_websites')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', website.id);

      alert('Content saved successfully!');
    } catch (err: any) {
      console.error('Error saving:', err);
      alert('Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  const saveDesign = async () => {
    if (!website) return;

    setSaving(true);
    try {
      await supabase
        .from('managed_websites')
        .update({
          primary_color: website.primary_color,
          secondary_color: website.secondary_color,
          font_heading: website.font_heading,
          font_body: website.font_body,
          updated_at: new Date().toISOString(),
        })
        .eq('id', website.id);

      alert('Design saved successfully!');
    } catch (err: any) {
      console.error('Error saving:', err);
      alert('Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    if (!website) return;

    const newStatus = website.publish_status === 'published' ? 'draft' : 'published';

    try {
      await supabase
        .from('managed_websites')
        .update({
          publish_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', website.id);

      setWebsite({ ...website, publish_status: newStatus });
      alert(`Website ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
    } catch (err: any) {
      console.error('Error toggling publish:', err);
      alert('Failed to update publish status');
    }
  };

  const generateExportPacket = () => {
    if (!website || !content) return '';

    const packet = `
==============================================
WEBSITE COPY PACKET
${website.brand_name}
Generated: ${new Date().toLocaleDateString()}
==============================================

HERO SECTION
Headline: ${content.home.hero.headline}
Subheadline: ${content.home.hero.subheadline}
Call-to-Action: ${content.home.hero.cta_text}
CTA Link: ${content.home.hero.cta_link}

----------------------------------------------

SOCIAL PROOF
${content.home.social_proof.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Testimonials:
${content.home.social_proof.testimonial_snippets.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

----------------------------------------------

${website.business_type === 'service' ? 'SERVICES' : 'PRODUCTS/FEATURES'}
${content.home.features_or_services.items.map((item, i) => `
${i + 1}. ${item.title}
   ${item.desc}
   ${item.price_optional ? `Price: ${item.price_optional}` : ''}
`).join('\n')}

----------------------------------------------

FAQ
${content.home.faq.items.map((item, i) => `
Q${i + 1}: ${item.q}
A${i + 1}: ${item.a}
`).join('\n')}

----------------------------------------------

CONTACT INFORMATION
Phone: ${content.home.contact.phone}
Email: ${content.home.contact.email}
City: ${content.home.contact.city}
Service Area: ${content.home.contact.service_area}

----------------------------------------------

FOOTER
${content.home.footer.short_blurb}

Links:
${content.home.footer.links.map((l, i) => `${i + 1}. ${l}`).join('\n')}

----------------------------------------------

DESIGN
Primary Color: ${website.primary_color}
Secondary Color: ${website.secondary_color}
Heading Font: ${website.font_heading}
Body Font: ${website.font_body}

==============================================
END OF PACKET
==============================================
`;

    return packet;
  };

  const copyExportPacket = () => {
    const packet = generateExportPacket();
    navigator.clipboard.writeText(packet);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 3000);
  };

  const downloadExportPacket = () => {
    const packet = generateExportPacket();
    const blob = new Blob([packet], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${website?.brand_name || 'website'}-copy-packet.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  if (!website || !content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F] flex items-center justify-center">
        <div className="text-white">Website not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#0F2847] to-[#0A192F]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <Home size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {website.brand_name || 'Manage Website'}
            </h1>
            <p className="text-gray-400">
              {website.business_type === 'ecommerce' ? 'E-commerce' : 'Service-based'} website
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg">
              {website.publish_status === 'published' ? (
                <>
                  <CheckCircle2 className="text-green-400" size={16} />
                  <span className="text-green-400 text-sm font-medium">Published</span>
                </>
              ) : (
                <>
                  <AlertCircle className="text-yellow-400" size={16} />
                  <span className="text-yellow-400 text-sm font-medium">Draft</span>
                </>
              )}
            </div>

            <button
              onClick={togglePublish}
              className="px-4 py-2 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors flex items-center gap-2"
            >
              {website.publish_status === 'published' ? 'Unpublish' : 'Publish'}
            </button>

            {website.publish_status === 'published' && (
              <a
                href={`https://${website.domain_status.subdomain || 'your-site'}.launchpad.com`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/5 border border-white/20 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Eye size={16} />
                View Live
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {[
            { id: 'content', label: 'Content', icon: FileText },
            { id: 'domain', label: 'Domain', icon: Globe },
            { id: 'design', label: 'Design', icon: Palette },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'export', label: 'Export', icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#2979FF] text-white'
                  : 'bg-white/5 text-gray-400 hover:bg-white/10'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Website Content</h2>
                <button
                  onClick={saveContent}
                  disabled={saving}
                  className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Hero Section</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Headline
                      </label>
                      <input
                        type="text"
                        value={content.home.hero.headline}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            home: {
                              ...content.home,
                              hero: { ...content.home.hero, headline: e.target.value },
                            },
                          })
                        }
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                        placeholder="Your compelling headline"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Subheadline
                      </label>
                      <textarea
                        value={content.home.hero.subheadline}
                        onChange={(e) =>
                          setContent({
                            ...content,
                            home: {
                              ...content.home,
                              hero: { ...content.home.hero, subheadline: e.target.value },
                            },
                          })
                        }
                        rows={2}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                        placeholder="Supporting text that explains your value"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          CTA Button Text
                        </label>
                        <input
                          type="text"
                          value={content.home.hero.cta_text}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                hero: { ...content.home.hero, cta_text: e.target.value },
                              },
                            })
                          }
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="Get Started"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          CTA Link
                        </label>
                        <input
                          type="text"
                          value={content.home.hero.cta_link}
                          onChange={(e) =>
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                hero: { ...content.home.hero, cta_link: e.target.value },
                              },
                            })
                          }
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="#contact"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    {website.business_type === 'service' ? 'Services' : 'Products/Features'}
                  </h3>
                  <div className="space-y-4">
                    {content.home.features_or_services.items.map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">
                            {website.business_type === 'service' ? 'Service' : 'Item'} {idx + 1}
                          </span>
                          <button
                            onClick={() => {
                              const newItems = content.home.features_or_services.items.filter(
                                (_, i) => i !== idx
                              );
                              setContent({
                                ...content,
                                home: {
                                  ...content.home,
                                  features_or_services: { items: newItems },
                                },
                              });
                            }}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const newItems = [...content.home.features_or_services.items];
                            newItems[idx] = { ...newItems[idx], title: e.target.value };
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                features_or_services: { items: newItems },
                              },
                            });
                          }}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="Title"
                        />
                        <textarea
                          value={item.desc}
                          onChange={(e) => {
                            const newItems = [...content.home.features_or_services.items];
                            newItems[idx] = { ...newItems[idx], desc: e.target.value };
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                features_or_services: { items: newItems },
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="Description"
                        />
                        <input
                          type="text"
                          value={item.price_optional || ''}
                          onChange={(e) => {
                            const newItems = [...content.home.features_or_services.items];
                            newItems[idx] = { ...newItems[idx], price_optional: e.target.value };
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                features_or_services: { items: newItems },
                              },
                            });
                          }}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="Price (optional)"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [
                          ...content.home.features_or_services.items,
                          { title: '', desc: '', price_optional: '' },
                        ];
                        setContent({
                          ...content,
                          home: {
                            ...content.home,
                            features_or_services: { items: newItems },
                          },
                        });
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors"
                    >
                      + Add {website.business_type === 'service' ? 'Service' : 'Item'}
                    </button>
                  </div>
                </div>

                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={content.home.contact.phone}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          home: {
                            ...content.home,
                            contact: { ...content.home.contact, phone: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                      placeholder="Phone"
                    />
                    <input
                      type="email"
                      value={content.home.contact.email}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          home: {
                            ...content.home,
                            contact: { ...content.home.contact, email: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                      placeholder="Email"
                    />
                    <input
                      type="text"
                      value={content.home.contact.city}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          home: {
                            ...content.home,
                            contact: { ...content.home.contact, city: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                      placeholder="City"
                    />
                    <input
                      type="text"
                      value={content.home.contact.service_area}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          home: {
                            ...content.home,
                            contact: { ...content.home.contact, service_area: e.target.value },
                          },
                        })
                      }
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                      placeholder="Service Area"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'domain' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Domain Settings</h2>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Current Domain</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="text-[#2979FF]" size={20} />
                  <code className="text-white font-mono">
                    {website.domain_status.subdomain || 'your-subdomain'}.launchpad.com
                  </code>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Your website is hosted on a LaunchPad subdomain. Upgrade to Pro to connect a custom domain.
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Custom Domain (Pro)</h3>
                <p className="text-gray-400 mb-4">
                  Connect your own domain name (e.g., yourbusiness.com) with a Pro subscription.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-6 py-2 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Design Settings</h2>
                <button
                  onClick={saveDesign}
                  disabled={saving}
                  className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Brand Colors</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Primary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={website.primary_color}
                          onChange={(e) =>
                            setWebsite({ ...website, primary_color: e.target.value })
                          }
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={website.primary_color}
                          onChange={(e) =>
                            setWebsite({ ...website, primary_color: e.target.value })
                          }
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-[#2979FF]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Secondary Color
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={website.secondary_color}
                          onChange={(e) =>
                            setWebsite({ ...website, secondary_color: e.target.value })
                          }
                          className="w-16 h-10 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={website.secondary_color}
                          onChange={(e) =>
                            setWebsite({ ...website, secondary_color: e.target.value })
                          }
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-[#2979FF]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Typography</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Heading Font
                      </label>
                      <select
                        value={website.font_heading}
                        onChange={(e) =>
                          setWebsite({ ...website, font_heading: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Raleway">Raleway</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Body Font
                      </label>
                      <select
                        value={website.font_body}
                        onChange={(e) => setWebsite({ ...website, font_body: e.target.value })}
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Roboto">Roboto</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Payment Settings</h2>

              {payments && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <CreditCard className="text-[#2979FF]" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-white">Stripe Integration</h3>
                      <p className="text-sm text-gray-400">
                        Status:{' '}
                        <span
                          className={
                            payments.status === 'connected'
                              ? 'text-green-400'
                              : 'text-yellow-400'
                          }
                        >
                          {payments.status === 'connected' ? 'Connected' : 'Not Connected'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {payments.status === 'not_connected' && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                      <p className="text-sm text-yellow-200 mb-3">
                        Connect your Stripe account to accept payments on your website.
                      </p>
                      <button className="px-4 py-2 bg-[#635BFF] text-white rounded-lg font-semibold hover:bg-[#635BFF]/90 transition-colors">
                        Connect Stripe
                      </button>
                    </div>
                  )}

                  {website.business_type === 'ecommerce' && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Checkout Mode</h4>
                      <select
                        value={payments.checkout_mode}
                        onChange={(e) =>
                          setPayments({
                            ...payments,
                            checkout_mode: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
                      >
                        <option value="cart">Shopping Cart</option>
                        <option value="pay_link">Pay Links</option>
                      </select>
                    </div>
                  )}

                  {website.business_type === 'service' && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <h4 className="text-white font-semibold mb-3">Payment Options</h4>
                      <select
                        value={payments.checkout_mode}
                        onChange={(e) =>
                          setPayments({
                            ...payments,
                            checkout_mode: e.target.value as any,
                          })
                        }
                        className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
                      >
                        <option value="deposit">Deposit/Retainer</option>
                        <option value="invoice">Send Invoices</option>
                        <option value="pay_link">Payment Links</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Export Website Copy</h2>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Website Copy Packet</h3>
                <p className="text-gray-300 mb-4">
                  Export all your website content in a structured format. Perfect for:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-1 mb-6">
                  <li>Pasting into Shopify product/page descriptions</li>
                  <li>Importing into WordPress, Wix, or Squarespace</li>
                  <li>Sharing with designers and developers</li>
                  <li>Keeping a backup of your content</li>
                </ul>

                <div className="flex gap-3">
                  <button
                    onClick={copyExportPacket}
                    className="flex-1 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copy to Clipboard
                  </button>
                  <button
                    onClick={downloadExportPacket}
                    className="flex-1 px-6 py-3 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download as File
                  </button>
                </div>

                {showCopySuccess && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="text-green-400" size={16} />
                    <span className="text-green-300 text-sm">
                      Copied to clipboard! Ready to paste into Shopify or any website builder.
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
                <pre className="bg-black/30 p-4 rounded-lg text-xs text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                  {generateExportPacket()}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
