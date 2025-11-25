import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

export const useRouteGuard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    const checkRouting = async () => {
      try {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', currentUser.id)
          .maybeSingle();

        if (!profile || !profile.onboarding_completed) {
          if (location.pathname !== '/onboarding' && location.pathname !== '/dashboard') {
            navigate('/onboarding');
          }
          setLoading(false);
          return;
        }

        if (location.pathname === '/onboarding' || location.pathname === '/auth') {
          navigate('/dashboard');
        }

        setLoading(false);
      } catch (error) {
        console.error('Route guard error:', error);
        setLoading(false);
      }
    };

    checkRouting();
  }, [currentUser, location.pathname]);

  return { loading };
};
