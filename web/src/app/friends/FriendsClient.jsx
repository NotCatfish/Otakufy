"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../../features/auth/frontend/supabaseClient';
import SocialHub from '../../../../features/profile/frontend/SocialHub';
import { useLanguage } from '../../context/LanguageContext';

export default function FriendsClient() {
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border border-[var(--strong-border)] border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-32 font-medium text-white/50">
        <h2 className="text-2xl font-semibold text-white mb-2">{t("Authentication Required")}</h2>
        <p className="text-[14px]">{t("Please sign in to access your Friends and Social Hub.")}</p>
      </div>
    );
  }

  return <SocialHub session={session} />;
}
