"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from './supabaseClient';
import DefaultAvatar from '../../profile/frontend/DefaultAvatar';
import { useLanguage } from '@/context/LanguageContext';

export default function UserMenu() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const fetchProfileData = useCallback(async (userId) => {
    if (!userId) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('username, avatar_url, discriminator, level')
        .eq('id', userId)
        .single();
      if (data) {
        setProfile(data);
        setImgError(false);
      }
    } catch (e) {
      console.error('Error loading profile in UserMenu:', e);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser?.id) {
        fetchProfileData(currentUser.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser?.id) {
        fetchProfileData(currentUser.id);
      } else {
        setProfile(null);
      }
      setImgError(false);
    });

    const handleProfileUpdate = () => {
      if (user?.id) fetchProfileData(user.id);
    };
    window.addEventListener('profile_updated', handleProfileUpdate);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('profile_updated', handleProfileUpdate);
    };
  }, [user?.id, fetchProfileData]);

  useEffect(() => {
    if (!dropdownOpen) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        setDropdownOpen(false);
      }
    };

    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown="true"]') && !e.target.closest('[data-trigger="true"]')) {
        setDropdownOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    if (typeof window !== 'undefined') {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('sb-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      
      // Force clear all cookies to prevent stuck Supabase SSR sessions
      document.cookie.split(";").forEach(function(c) {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    }
    
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Supabase signOut error (likely network or expired session), clearing locally anyway:", err);
    }
    
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <Link 
        href="/login"
        className="min-h-[40px] px-4.5 py-2 rounded-xl bg-sakura/10 hover:bg-sakura/20 text-sakura border border-sakura/30 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/20 flex items-center justify-center text-[13px] font-medium tracking-wide transition-all shadow-sm hover:shadow-sakura/10 dark:hover:shadow-none"
      >
        {t("Sign In")}
      </Link>
    );
  }

  const rawAvatar = profile?.avatar_url || user.user_metadata?.avatar_url;
  const avatar = !imgError && rawAvatar ? rawAvatar : null;
  const displayName = profile?.username || user.user_metadata?.username || user.email?.split('@')[0];

  return (
    <div className="relative flex items-center justify-center">
      <button 
        type="button"
        data-trigger="true"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer group focus:outline-none"
        aria-label="User profile menu"
        aria-expanded={dropdownOpen}
      >
        <div className={`rounded-full flex items-center justify-center ring-2 transition-all overflow-hidden w-9 h-9 ${
          dropdownOpen ? 'ring-sakura dark:ring-white ring-offset-2 ring-offset-black' : 'ring-white/15 group-hover:ring-white/40'
        }`}>
          <DefaultAvatar src={avatar} name={displayName} seed={user.id} size={36} />
        </div>
      </button>

      {dropdownOpen && (
        <div 
          data-dropdown="true" 
          className="absolute top-full right-0 mt-3 w-64 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden z-[100] animate-slide-up font-serif divide-y divide-white/10"
          style={{ backgroundColor: 'var(--card-bg)' }}
        >
          {/* User Header Info */}
          <div className="p-4 bg-white/[0.03] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden ring-1 ring-white/20">
              <DefaultAvatar src={avatar} name={displayName} seed={user.id} size={40} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-medium text-white truncate font-sans">
                {displayName}
              </div>
              <span className="inline-block mt-1 text-[10px] uppercase font-mono tracking-wider text-sakura bg-sakura/15 border border-sakura/30 dark:text-cyan-400 dark:bg-cyan-950/40 dark:border-cyan-500/30 px-2 py-0.5 rounded-full">
                {t("Otakufy Member")}
              </span>
            </div>
          </div>

          {/* Navigation Items (Profile, Settings, Help) */}
          <div className="p-2 flex flex-col gap-1 font-sans">
            <Link 
              href="/profile"
              onClick={() => setDropdownOpen(false)}
              className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4 text-white/50 group-hover:text-sakura dark:group-hover:text-white transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{t("Profile")}</span>
            </Link>

            <Link 
              href="/friends"
              onClick={() => setDropdownOpen(false)}
              className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4 text-white/50 group-hover:text-sakura dark:group-hover:text-white transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>{t("Friends")}</span>
            </Link>

            <Link 
              href="/settings"
              onClick={() => setDropdownOpen(false)}
              className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4 text-white/50 group-hover:text-sakura dark:group-hover:text-white transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t("Settings")}</span>
            </Link>

            <Link 
              href="/help"
              onClick={() => setDropdownOpen(false)}
              className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] text-white/80 hover:text-white hover:bg-white/10 transition-all"
            >
              <svg className="w-4 h-4 text-white/50 group-hover:text-sakura dark:group-hover:text-white transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{t("Help & Support")}</span>
            </Link>
          </div>

          {/* Sign Out Action */}
          <div className="p-2 font-sans">
            <button 
              type="button"
              onClick={handleLogout}
              className="group w-full px-3 py-2.5 rounded-xl flex items-center gap-3 text-[13px] font-medium text-red-400 hover:bg-red-500/10 transition-all"
            >
              <svg className="w-4 h-4 text-red-400 group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{t("Sign Out")}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
