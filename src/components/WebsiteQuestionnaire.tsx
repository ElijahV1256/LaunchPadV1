import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  CreditCard,
  Upload,
  X,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Image as ImageIcon,
  Check,
} from 'lucide-react';

interface WebsiteData {
  contact: {
    email: string;
    phone: string;
    address: string;
  };
  social: {
    website?: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  business: {
    hours?: string;
    servicesDescription?: string;
  };
  stripe: {
    connected: boolean;
    checkoutUrl?: string;
  };
  productImages: string[];
}

interface WebsiteQuestionnaireProps {
  businessName: string;
  defaultEmail: string;
  onComplete: (data: WebsiteData) => void;
  onSkip: () => void;
}

export default function WebsiteQuestionnaire({
  businessName,
  defaultEmail,
  onComplete,
  onSkip,
}: WebsiteQuestionnaireProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [contact, setContact] = useState({
    email: defaultEmail,
    phone: '',
    address: '',
  });

  const [social, setSocial] = useState({
    website: '',
    facebook: '',
    instagram: '',
    twitter: '',
    linkedin: '',
  });

  const [business, setBusiness] = useState({
    hours: '',
    servicesDescription: '',
  });

  const [stripe, setStripe] = useState({
    connected: false,
    checkoutUrl: '',
  });

  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageUrl, setImageUrl] = useState('');

  const addProductImage = () => {
    if (imageUrl.trim() && productImages.length < 6) {
      setProductImages([...productImages, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeProductImage = (index: number) => {
    setProductImages(productImages.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete({
        contact,
        social,
        business,
        stripe,
        productImages,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return contact.email.trim() !== '';
      case 2:
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-[#0A192F] to-[#0F2847] border-2 border-[#2979FF]/30 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden"
      >
        <div className="bg-gradient-to-r from-[#2979FF] to-[#06D6A0] p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Setup Your Website</h2>
                <p className="text-white/80 text-sm">Let's make it perfect for {businessName}</p>
              </div>
            </div>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition-colors text-sm"
            >
              Skip for now
            </button>
          </div>

          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full flex-1 transition-all ${
                  i + 1 <= step ? 'bg-white' : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Contact Information</h3>
                  <p className="text-gray-400 text-sm">
                    How can customers reach you? This will appear on your website.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Mail size={16} />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => setContact({ ...contact, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Phone size={16} />
                      Phone Number (Optional)
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <MapPin size={16} />
                      Business Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={contact.address}
                      onChange={(e) => setContact({ ...contact, address: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                      placeholder="123 Main St, City, State 12345"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Social Media</h3>
                  <p className="text-gray-400 text-sm">
                    Connect your social profiles (all optional)
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Globe size={16} />
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={social.website}
                      onChange={(e) => setSocial({ ...social, website: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                      placeholder="https://yourbusiness.com"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                      <Instagram size={16} />
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={social.instagram}
                      onChange={(e) => setSocial({ ...social, instagram: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                      placeholder="@yourbusiness"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Facebook size={16} />
                        Facebook
                      </label>
                      <input
                        type="text"
                        value={social.facebook}
                        onChange={(e) => setSocial({ ...social, facebook: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                        placeholder="@yourbusiness"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                        <Twitter size={16} />
                        Twitter
                      </label>
                      <input
                        type="text"
                        value={social.twitter}
                        onChange={(e) => setSocial({ ...social, twitter: e.target.value })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                        placeholder="@yourbusiness"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Payment Setup</h3>
                  <p className="text-gray-400 text-sm">
                    Connect your payment system to start accepting orders
                  </p>
                </div>

                <div className="bg-[#2979FF]/10 border border-[#2979FF]/30 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-4">
                    <CreditCard className="text-[#2979FF] flex-shrink-0 mt-1" size={20} />
                    <div>
                      <p className="text-white font-medium mb-1">Stripe Checkout Link</p>
                      <p className="text-gray-400 text-sm">
                        Add your Stripe payment link or checkout URL. Customers will be sent here when they click "Buy Now".
                      </p>
                    </div>
                  </div>

                  <input
                    type="url"
                    value={stripe.checkoutUrl}
                    onChange={(e) => setStripe({ ...stripe, checkoutUrl: e.target.value, connected: e.target.value.trim() !== '' })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20"
                    placeholder="https://buy.stripe.com/..."
                  />

                  <p className="text-gray-500 text-xs mt-2">
                    Don't have Stripe yet? You can add this later.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                    <Building2 size={16} />
                    Business Hours (Optional)
                  </label>
                  <textarea
                    value={business.hours}
                    onChange={(e) => setBusiness({ ...business, hours: e.target.value })}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#2979FF] focus:ring-2 focus:ring-[#2979FF]/20 resize-none h-24"
                    placeholder="Mon-Fri: 9am-6pm&#10;Sat: 10am-4pm&#10;Sun: Closed"
                  />
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Product Images</h3>
                  <p className="text-gray-400 text-sm">
                    Add photos of your products or services (optional, up to 6 images)
                  </p>
                </div>

                <div className="bg-[#06D6A0]/10 border border-[#06D6A0]/30 rounded-lg p-4">
                  <div className="flex gap-2 mb-3">
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addProductImage()}
                      className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#06D6A0] focus:ring-2 focus:ring-[#06D6A0]/20 text-sm"
                      placeholder="Paste image URL from Pexels, Unsplash, or your host"
                      disabled={productImages.length >= 6}
                    />
                    <button
                      onClick={addProductImage}
                      disabled={!imageUrl.trim() || productImages.length >= 6}
                      className="px-4 py-2 bg-[#06D6A0] text-white rounded-lg hover:bg-[#06D6A0]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Upload size={18} />
                    </button>
                  </div>
                  <p className="text-gray-500 text-xs">
                    Tip: Search for free high-quality images on{' '}
                    <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer" className="text-[#06D6A0] hover:underline">
                      Pexels.com
                    </a>
                  </p>
                </div>

                {productImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3">
                    {productImages.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`Product ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          onClick={() => removeProductImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {productImages.length === 0 && (
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-8 text-center">
                    <ImageIcon className="text-gray-600 mx-auto mb-2" size={32} />
                    <p className="text-gray-500 text-sm">No images added yet</p>
                    <p className="text-gray-600 text-xs mt-1">Images are optional - we'll use stock photos if needed</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="border-t border-white/10 p-6 flex items-center justify-between bg-white/5">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={18} />
            Back
          </button>

          <div className="text-sm text-gray-400">
            Step {step} of {totalSteps}
          </div>

          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#2979FF] to-[#06D6A0] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {step === totalSteps ? (
              <>
                <Check size={18} />
                Generate Website
              </>
            ) : (
              <>
                Next
                <ChevronRight size={18} />
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
