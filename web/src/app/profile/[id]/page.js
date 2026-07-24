"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../../../../features/auth/frontend/supabaseClient';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DefaultAvatar from '../../../../../features/profile/frontend/DefaultAvatar';
import { calculateLevelStats } from '../../../../../features/profile/utils/levelUtils';
import PageContainer from '../../../components/PageContainer';
import { useLanguage } from '@/context/LanguageContext';

export default function PublicProfilePage() {
  const { id } = useParams();
  const { lang, t } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const toKanji = (str) => {
    if (lang !== 'ja') return str;
    const numToKanji = (numStr) => {
      const kanjiDigits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
      const positions = ['', '十', '百', '千'];
      const bigPositions = ['', '万', '億', '兆'];
      let num = parseInt(numStr.replace(/,/g, ''), 10);
      if (isNaN(num)) return numStr;
      if (num === 0) return '〇';
      let result = '';
      let bigPosIndex = 0;
      while (num > 0) {
        let part = num % 10000;
        let partStr = '';
        if (part > 0) {
          let posIndex = 0;
          while (part > 0) {
            let digit = part % 10;
            if (digit > 0) {
              let digitStr = kanjiDigits[digit];
              if (digit === 1 && posIndex > 0 && posIndex < 3) digitStr = ''; 
              if (digit === 1 && posIndex === 3) digitStr = ''; 
              partStr = digitStr + positions[posIndex] + partStr;
            }
            part = Math.floor(part / 10);
            posIndex++;
          }
          result = partStr + bigPositions[bigPosIndex] + result;
        }
        num = Math.floor(num / 10000);
        bigPosIndex++;
      }
      return result;
    };
    return String(str).replace(/[0-9,]+/g, (match) => {
      if (match === ',') return match;
      return numToKanji(match);
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase.rpc('get_profile_safely', { target_user_id: id });
      
      if (error || !data || data.length === 0) {
        setNotFound(true);
      } else {
        setProfile(data[0]);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [id]);

  if (loading) return (
    <PageContainer maxWidth="max-w-[1440px]" className="pt-8 pb-20 font-medium text-white">
      <div className="flex flex-col items-center p-8 rounded-2xl border border-[var(--strong-border)] bg-[var(--surface)] mb-8">
        <div className="w-48 h-48 rounded-full skeleton-shimmer mb-6"></div>
        <div className="h-6 w-40 skeleton-shimmer rounded mb-3"></div>
        <div className="h-4 w-64 skeleton-shimmer rounded"></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="h-24 skeleton-shimmer rounded-2xl"></div>
        <div className="h-24 skeleton-shimmer rounded-2xl"></div>
      </div>
    </PageContainer>
  );

  if (notFound || !profile) return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[60vh] text-white font-medium">
      <h1 className="text-4xl mb-2 font-semibold">Profile Not Found</h1>
      <p className="text-[14px] text-[var(--muted-text)]">This user does not exist or the link is invalid.</p>
    </PageContainer>
  );

  const calculatedLevel = profile.xp !== null ? calculateLevelStats(profile.xp).calculatedLevel : profile.level;

  return (
    <PageContainer maxWidth="max-w-[1440px]" className="font-medium text-white mt-6">
      <Link href="/leaderboard" className="text-[12px] uppercase tracking-widest text-[var(--muted-text)] hover:text-white transition-colors mb-12 block font-medium">
        &larr; {lang === 'ja' ? 'リーダーボードに戻る' : 'Back to Leaderboard'}
      </Link>

      <div className="flex flex-col md:flex-row items-center md:items-start gap-12 p-12 border border-[var(--strong-border)] rounded-2xl bg-[var(--surface)] relative overflow-hidden">
        <div className="relative z-10 w-48 h-48 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
          <DefaultAvatar src={profile.avatar_url} name={profile.username} seed={id} size={192} />
        </div>

        <div className="relative z-10 flex-1 text-center md:text-left flex flex-col justify-center h-full pt-4">
          <h1 className="text-4xl font-semibold tracking-tight mb-2 flex items-center justify-center md:justify-start gap-4 text-white">
            {profile.username || (lang === 'ja' ? '匿名' : 'Anonymous')}
          </h1>
          <p className="mb-label mb-10">
            {profile.xp === null ? (lang === 'ja' ? '非公開プロフィール' : 'Private Profile') : (lang === 'ja' ? '公開プロフィール' : 'Public Profile')}
          </p>

          <div className="flex justify-center md:justify-start gap-12">
            <div className="flex flex-col">
              <span className="mb-label mb-1">{t('LEVEL')}</span>
              <span className="text-3xl text-white font-semibold">{toKanji(calculatedLevel)}</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-label mb-1">{lang === 'ja' ? '総経験値' : 'Total XP'}</span>
              <span className="text-3xl mb-mono font-semibold text-white">{profile.xp !== null ? toKanji(profile.xp.toLocaleString()) : (lang === 'ja' ? '非公開' : 'Hidden')}</span>
            </div>
            <div className="flex flex-col">
              <span className="mb-label mb-1">{lang === 'ja' ? '連続記録' : 'Streak'}</span>
              <span className="text-3xl mb-mono font-semibold text-white">{profile.streak !== null ? toKanji(profile.streak) : (lang === 'ja' ? '非公開' : 'Hidden')}</span>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
