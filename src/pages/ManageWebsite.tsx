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
  LayoutDashboard,
  ArrowLeft,
  CheckSquare,
  Square,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { generateCopyPacket, downloadCopyPacketJSON } from '../utils/copyPacketGenerator';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'payments' | 'domain' | 'export'>('overview');

  const [website, setWebsite] = useState<WebsiteData | null>(null);
  const [content, setContent] = useState<WebsiteContent | null>(null);
  const [payments, setPayments] = useState<PaymentData | null>(null);

  const [showCopySuccess, setShowCopySuccess] = useState(false);
  const [checklist, setChecklist] = useState({
    offer_and_price: false,
    cta_set: false,
    contact_info: false,
    payments_connected: false,
    traffic_action: false,
  });

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
        updateChecklist(contentRes.data, paymentsRes.data);
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

  const updateChecklist = (contentData: WebsiteContent, paymentsData: PaymentData | null) => {
    const hasOffer = contentData.home.features_or_services.items.length > 0 &&
      contentData.home.features_or_services.items.some(item => item.title && item.desc);

    const hasCTA = contentData.home.hero.cta_text && contentData.home.hero.cta_link;

    const hasContact = contentData.home.contact.email || contentData.home.contact.phone;

    const hasPayments = paymentsData?.status === 'connected';

    setChecklist({
      offer_and_price: hasOffer,
      cta_set: Boolean(hasCTA),
      contact_info: Boolean(hasContact),
      payments_connected: hasPayments,
      traffic_action: false,
    });
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

      updateChecklist(content, payments);
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

  const savePayments = async () => {
    if (!payments) return;

    setSaving(true);
    try {
      await supabase
        .from('website_payments')
        .update({
          checkout_mode: payments.checkout_mode,
          default_price: payments.default_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payments.id);

      alert('Payment settings saved!');
    } catch (err: any) {
      console.error('Error saving:', err);
      alert('Failed to save payment settings');
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

  const handleExportCopyPacket = () => {
    if (!website || !content) return;

    const packet = generateCopyPacket(website, content);
    downloadCopyPacketJSON(packet, website.brand_name);
  };

  const copyPacketPreview = () => {
    if (!website || !content) return '';

    const packet = generateCopyPacket(website, content);
    return JSON.stringify(packet, null, 2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setShowCopySuccess(true);
    setTimeout(() => setShowCopySuccess(false), 3000);
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
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              {website.brand_name || 'Manage Website'}
            </h1>
            <p className="text-gray-400">
              {website.business_type === 'ecommerce' ? 'E-commerce' : 'Service-based'} website
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
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

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'content', label: 'Content', icon: FileText },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'domain', label: 'Domain', icon: Globe },
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
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Website Overview</h2>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="text-[#2979FF]" size={20} />
                    Live URL
                  </h3>
                  <div className="space-y-2">
                    <code className="text-white font-mono text-sm block bg-black/20 p-3 rounded">
                      {website.domain_status.subdomain || 'your-subdomain'}.launchpad.com
                    </code>
                    <button
                      onClick={togglePublish}
                      className={`w-full px-4 py-2 rounded-lg font-semibold transition-colors ${
                        website.publish_status === 'published'
                          ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          : 'bg-[#06D6A0] text-white hover:bg-[#06D6A0]/90'
                      }`}
                    >
                      {website.publish_status === 'published' ? 'Unpublish Site' : 'Publish Site'}
                    </button>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">First Dollar Checklist</h3>
                  <div className="space-y-3">
                    {[
                      { key: 'offer_and_price', label: 'Offer & price set', checked: checklist.offer_and_price },
                      { key: 'cta_set', label: 'CTA set', checked: checklist.cta_set },
                      { key: 'contact_info', label: 'Contact info set', checked: checklist.contact_info },
                      { key: 'payments_connected', label: 'Payments connected', checked: checklist.payments_connected },
                      { key: 'traffic_action', label: 'One traffic action selected', checked: checklist.traffic_action },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => setChecklist({ ...checklist, [item.key]: !item.checked })}
                        className="w-full flex items-center gap-3 text-left hover:bg-white/5 p-2 rounded transition-colors"
                      >
                        {item.checked ? (
                          <CheckSquare className="text-[#06D6A0] flex-shrink-0" size={20} />
                        ) : (
                          <Square className="text-gray-500 flex-shrink-0" size={20} />
                        )}
                        <span className={`text-sm ${item.checked ? 'text-white' : 'text-gray-400'}`}>
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Quick Actions</h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get your website ready to make sales with these essential tasks.
                </p>
                <div className="grid sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setActiveTab('content')}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Edit Content
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Connect Payments
                  </button>
                  <button
                    onClick={() => setActiveTab('export')}
                    className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Export Copy
                  </button>
                </div>
              </div>
            </div>
          )}

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
                          <span className="text-sm text-gray-400 flex items-center gap-2">
                            <GripVertical size={16} />
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
                            className="text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 size={16} />
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
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add {website.business_type === 'service' ? 'Service' : 'Item'}
                    </button>
                  </div>
                </div>

                <div className="border-b border-white/10 pb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">FAQ</h3>
                  <div className="space-y-4">
                    {content.home.faq.items.map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-400">Question {idx + 1}</span>
                          <button
                            onClick={() => {
                              const newItems = content.home.faq.items.filter((_, i) => i !== idx);
                              setContent({
                                ...content,
                                home: {
                                  ...content.home,
                                  faq: { items: newItems },
                                },
                              });
                            }}
                            className="text-red-400 hover:text-red-300 flex items-center gap-1"
                          >
                            <Trash2 size={16} />
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.q}
                          onChange={(e) => {
                            const newItems = [...content.home.faq.items];
                            newItems[idx] = { ...newItems[idx], q: e.target.value };
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                faq: { items: newItems },
                              },
                            });
                          }}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="Question"
                        />
                        <textarea
                          value={item.a}
                          onChange={(e) => {
                            const newItems = [...content.home.faq.items];
                            newItems[idx] = { ...newItems[idx], a: e.target.value };
                            setContent({
                              ...content,
                              home: {
                                ...content.home,
                                faq: { items: newItems },
                              },
                            });
                          }}
                          rows={2}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                          placeholder="Answer"
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newItems = [
                          ...content.home.faq.items,
                          { q: '', a: '' },
                        ];
                        setContent({
                          ...content,
                          home: {
                            ...content.home,
                            faq: { items: newItems },
                          },
                        });
                      }}
                      className="w-full px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add FAQ
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

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Footer</h3>
                  <textarea
                    value={content.home.footer.short_blurb}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        home: {
                          ...content.home,
                          footer: { ...content.home.footer, short_blurb: e.target.value },
                        },
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    placeholder="Short description or tagline for your footer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-white">Payment Settings</h2>
                <button
                  onClick={savePayments}
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
                      {website.business_type === 'ecommerce' ? (
                        <>
                          <option value="cart">Shopping Cart</option>
                          <option value="pay_link">Payment Links</option>
                        </>
                      ) : (
                        <>
                          <option value="deposit">Deposit/Retainer</option>
                          <option value="invoice">Send Invoices</option>
                          <option value="pay_link">Payment Links</option>
                        </>
                      )}
                    </select>
                    <p className="text-sm text-gray-400 mt-2">
                      {website.business_type === 'ecommerce'
                        ? 'Choose how customers will pay for products'
                        : 'Choose how clients will pay for services'}
                    </p>
                  </div>

                  {website.business_type === 'service' && payments.checkout_mode === 'deposit' && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                      <label className="block text-white font-semibold mb-2">
                        Default Deposit Amount
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-300">$</span>
                        <input
                          type="number"
                          value={payments.default_price || ''}
                          onChange={(e) =>
                            setPayments({
                              ...payments,
                              default_price: parseFloat(e.target.value) || null,
                            })
                          }
                          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#2979FF]"
                          placeholder="100"
                        />
                      </div>
                      <p className="text-sm text-gray-400 mt-2">
                        Amount customers pay upfront to book your service
                      </p>
                    </div>
                  )}
                </div>
              )}
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
                  Your website is hosted on a LaunchPad subdomain. This is perfect for getting started quickly.
                </p>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Change Subdomain
                  </label>
                  <input
                    type="text"
                    value={website.domain_status.subdomain}
                    onChange={(e) =>
                      setWebsite({
                        ...website,
                        domain_status: {
                          ...website.domain_status,
                          subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                        },
                      })
                    }
                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF]"
                    placeholder="your-business"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>
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

          {activeTab === 'export' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-4">Export Website Copy</h2>

              <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {website.business_type === 'ecommerce' ? 'Shopify' : 'Service'} Copy Packet
                </h3>
                <p className="text-gray-300 mb-4">
                  {website.business_type === 'ecommerce'
                    ? 'Export your website content in Shopify-ready format. Includes homepage copy, product descriptions, policies, and SEO metadata.'
                    : 'Export your website content optimized for service-based platforms. Includes homepage copy, services, process, and local SEO.'}
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={handleExportCopyPacket}
                    className="flex-1 px-6 py-3 bg-[#2979FF] text-white rounded-lg font-semibold hover:bg-[#2979FF]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={18} />
                    Download JSON
                  </button>
                  <button
                    onClick={() => copyToClipboard(copyPacketPreview())}
                    className="flex-1 px-6 py-3 bg-[#06D6A0] text-white rounded-lg font-semibold hover:bg-[#06D6A0]/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy size={18} />
                    Copy to Clipboard
                  </button>
                </div>

                {showCopySuccess && (
                  <div className="mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="text-green-400" size={16} />
                    <span className="text-green-300 text-sm">
                      Copied to clipboard! Ready to paste into your platform.
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Preview</h3>
                <pre className="bg-black/30 p-4 rounded-lg text-xs text-gray-300 overflow-auto max-h-96 whitespace-pre-wrap font-mono">
                  {copyPacketPreview()}
                </pre>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">How to Use</h3>
                <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
                  <li>Download the JSON file or copy to clipboard</li>
                  <li>
                    {website.business_type === 'ecommerce'
                      ? 'Import into Shopify or paste sections into your e-commerce platform'
                      : 'Paste sections into WordPress, Wix, Squarespace, or any website builder'}
                  </li>
                  <li>Customize styling to match your brand colors</li>
                  <li>Replace placeholder content as needed</li>
                  <li>Publish and start attracting customers!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
