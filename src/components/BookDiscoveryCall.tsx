import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Loader2,
  ArrowLeft,
  Paintbrush,
  Zap,
  Wrench,
} from 'lucide-react';

interface BookDiscoveryCallProps {
  businessName?: string;
}

export default function BookDiscoveryCall({ businessName }: BookDiscoveryCallProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booked, setBooked] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const handleCalendlyMessage = useCallback(
    async (event: MessageEvent) => {
      if (event.data?.event !== 'calendly.event_scheduled') return;

      setBooked(true);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
      });

      if (!currentUser) return;

      try {
        await supabase.from('website_bookings').insert({
          user_id: currentUser.id,
          business_name: businessName || null,
          calendly_event_uri: event.data?.payload?.event?.uri || null,
          status: 'booked',
          booking_time: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error saving booking:', err);
      }
    },
    [currentUser, businessName]
  );

  useEffect(() => {
    window.addEventListener('message', handleCalendlyMessage);
    return () => window.removeEventListener('message', handleCalendlyMessage);
  }, [handleCalendlyMessage]);

  const valueProps = [
    {
      icon: Paintbrush,
      title: 'Custom Design',
      description: 'Built specifically for your business',
    },
    {
      icon: Zap,
      title: '24-Hr Delivery',
      description: 'Live within one business day',
    },
    {
      icon: Wrench,
      title: 'Done For You',
      description: 'We handle everything',
    },
  ];

  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 max-w-3xl mx-auto">
      {!booked ? (
        <div className="space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#06D6A0]/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="text-[#06D6A0]" size={36} />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">
              Your Brand is Ready!
            </h2>
            <p className="text-gray-400 text-lg max-w-xl mx-auto">
              Book your free 30-minute website discovery call. We'll build your
              custom site and have it live within 24 hours.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {valueProps.map((prop) => (
              <div
                key={prop.title}
                className="bg-white/5 border border-white/10 rounded-lg p-5 text-center"
              >
                <div className="w-10 h-10 bg-[#2979FF]/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <prop.icon className="text-[#2979FF]" size={20} />
                </div>
                <h3 className="text-white font-semibold mb-1">{prop.title}</h3>
                <p className="text-gray-400 text-sm">{prop.description}</p>
              </div>
            ))}
          </div>

          <div>
            <p className="text-gray-400 text-sm mb-3 text-center">
              Pick a time that works for you
            </p>
            <div className="relative">
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/5 rounded-xl">
                  <Loader2 className="text-[#2979FF] animate-spin" size={32} />
                </div>
              )}
              <iframe
                src="https://calendly.com/CALENDLY_PLACEHOLDER/website-discovery"
                width="100%"
                height="630"
                style={{ border: 'none', borderRadius: '12px' }}
                onLoad={() => setIframeLoaded(true)}
                title="Book a Discovery Call"
              />
            </div>
          </div>

          <div className="text-center space-y-4">
            <p className="text-gray-500 text-sm">
              Prefer email? Reach us at hello@yourcompany.com
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 space-y-6">
          <p className="text-6xl">🎉</p>
          <h2 className="text-3xl font-bold text-white">You're Booked!</h2>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Check your email for your confirmation. Your custom website will be
            live within 24 hours of your call.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-[#2979FF] text-white rounded-lg font-bold text-lg hover:bg-[#2979FF]/90 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
