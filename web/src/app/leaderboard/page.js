"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/features/auth/frontend/supabaseClient';
import Link from 'next/link';
import PageContainer from '../../components/PageContainer';
import DefaultAvatar from '@/features/profile/frontend/DefaultAvatar';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../../components/ui/Button';
import SmoothFade from '../../components/SmoothFade';
import RevealText from '../../components/RevealText';

export default function LeaderboardPage() {
  const { lang, t } = useLanguage();
  const [leaderboard, setLeaderboard] = useState([]);
  const [callerData, setCallerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  
  const [leaderboardMode, setLeaderboardMode] = useState('global');
  const [friendsLeaderboard, setFriendsLeaderboard] = useState([]);
  const [friendsCallerData, setFriendsCallerData] = useState(null);
  const [friendsLoading, setFriendsLoading] = useState(false);

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
    const fetchLeaderboard = async () => {
      // Check sessionStorage for immediate stale-while-revalidate display
      try {
        const cached = sessionStorage.getItem('otakufy_leaderboard_cache');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Date.now() - parsed.timestamp < 300000) { // 5-minute freshness window
            setLeaderboard(parsed.leaderboard || []);
            if (parsed.callerData) setCallerData(parsed.callerData);
            setLoading(false);
          }
        }
      } catch (e) {
        console.warn('Session cache read failed:', e);
      }

      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data } = await supabase.rpc('get_leaderboard_state', { caller_id: session.user.id });
        if (data) {
          setLeaderboard(data.top_50 || []);
          setCallerData(data.caller);
          try {
            sessionStorage.setItem('otakufy_leaderboard_cache', JSON.stringify({
              timestamp: Date.now(),
              leaderboard: data.top_50 || [],
              callerData: data.caller
            }));
          } catch (e) {}
        }
      } else {
        const { data } = await supabase.from('global_leaderboard').select('*').limit(50).order('xp', { ascending: false });
        if (data) {
          setLeaderboard(data);
          try {
            sessionStorage.setItem('otakufy_leaderboard_cache', JSON.stringify({
              timestamp: Date.now(),
              leaderboard: data,
              callerData: null
            }));
          } catch (e) {}
        }
      }
      
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (leaderboardMode === 'friends' && session) {
      const fetchFriendsLeaderboard = async () => {
        try {
          const cached = sessionStorage.getItem('otakufy_friends_leaderboard_cache');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Date.now() - parsed.timestamp < 300000) {
              setFriendsLeaderboard(parsed.leaderboard || []);
              if (parsed.callerData) setFriendsCallerData(parsed.callerData);
              return;
            }
          }
        } catch(e) {}

        setFriendsLoading(true);
        const { data: friendsData } = await supabase.rpc('get_friends', { current_user_id: session.user.id });
        
        if (friendsData && friendsData.length > 0) {
          const friendIds = friendsData.map(f => f.id);
          const { data: friendProfiles } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, xp, level, streak, privacy_setting')
            .in('id', friendIds);
            
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, xp, level, streak, privacy_setting')
            .eq('id', session.user.id)
            .single();
          
          let allUsers = friendProfiles || [];
          if (profile && !allUsers.find(u => u.id === profile.id)) {
              allUsers.push(profile);
          }
          
          // Filter out private users
          allUsers = allUsers.filter(u => u.privacy_setting !== 'private');
          
          allUsers.sort((a, b) => (b.xp || 0) - (a.xp || 0));
          const ranked = allUsers.map((u, i) => ({...u, rank: i + 1}));
          
          setFriendsLeaderboard(ranked);
          const caller = ranked.find(u => u.id === session.user.id);
          setFriendsCallerData(caller);
          
          try {
            sessionStorage.setItem('otakufy_friends_leaderboard_cache', JSON.stringify({
              timestamp: Date.now(),
              leaderboard: ranked,
              callerData: caller
            }));
          } catch(e) {}
        } else if (friendsData && friendsData.length === 0) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, avatar_url, xp, level, streak, privacy_setting')
            .eq('id', session.user.id)
            .single();
            
          let ranked = [];
          let caller = null;
          
          if (profile && profile.privacy_setting !== 'private') {
             ranked = [{...profile, rank: 1}];
             caller = ranked[0];
          }
          
          setFriendsLeaderboard(ranked);
          setFriendsCallerData(caller);
        }
        setFriendsLoading(false);
      };
      
      if (friendsLeaderboard.length === 0 && !friendsLoading) {
         fetchFriendsLeaderboard();
      }
    }
  }, [leaderboardMode, session]);

  const currentLeaderboard = leaderboardMode === 'friends' ? friendsLeaderboard : leaderboard;
  const currentCaller = leaderboardMode === 'friends' ? friendsCallerData : callerData;
  const isListLoading = leaderboardMode === 'friends' ? friendsLoading : loading;

  if (isListLoading) return (
    <PageContainer maxWidth="max-w-[1440px]" className="font-medium text-white">
      <header className="mb-20 pb-12 border-b border-[var(--strong-border)] text-center">
        <div className="h-10 w-64 skeleton-shimmer mx-auto mb-3"></div>
        <div className="h-4 w-48 skeleton-shimmer mx-auto"></div>
      </header>
      <div className="flex flex-col gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-6 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <div className="w-8 h-4 skeleton-shimmer rounded"></div>
            <div className="w-12 h-12 skeleton-shimmer rounded-full"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 skeleton-shimmer rounded"></div>
              <div className="h-3 w-20 skeleton-shimmer rounded"></div>
            </div>
            <div className="h-6 w-16 skeleton-shimmer rounded"></div>
          </div>
        ))}
      </div>
    </PageContainer>
  );

  // Check if caller is already in the top to avoid rendering them twice
  const isCallerInTop = currentCaller && currentLeaderboard.some(u => u.id === currentCaller.id);
  const shouldRenderCallerAtBottom = currentCaller && !isCallerInTop;

  return (
    <PageContainer maxWidth="max-w-[1440px]" className="font-medium text-white">
      <SmoothFade as="header" delay={0.1} className="mb-12 pb-12 border-b border-[var(--strong-border)] text-center flex flex-col items-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white mb-6">
          <RevealText text={leaderboardMode === 'global' ? t("Global Leaderboard") : t("Friends Leaderboard")} baseDelay={0.2} />
        </h1>
        
        {session && (
          <div className="flex bg-[var(--surface-hover)] border border-[var(--strong-border)] p-1 rounded-full w-fit">
            <Button 
              variant={leaderboardMode === 'global' ? 'pill-active' : 'pill'}
              onClick={() => setLeaderboardMode('global')}
              className="px-6 py-2"
            >
              {t("Global")}
            </Button>
            <Button 
              variant={leaderboardMode === 'friends' ? 'pill-active' : 'pill'}
              onClick={() => setLeaderboardMode('friends')}
              className="px-6 py-2"
            >
              {t("Friends")}
            </Button>
          </div>
        )}

        <p className="text-[14px] text-white/50 mt-6">
          {leaderboardMode === 'global' 
            ? t("Top 50 learners ranked by XP. (Public profiles only)")
            : t("Ranked amongst your friends network.")}
        </p>
      </SmoothFade>

      <div className="flex flex-col gap-4">
        {currentLeaderboard.length === 0 ? (
          <div className="text-center py-20 text-white/30 uppercase tracking-widest text-[12px]">
            {leaderboardMode === 'global' ? t("No public profiles found.") : t("No friends added yet.")}
          </div>
        ) : (
          currentLeaderboard.map((user, index) => (
            <SmoothFade delay={0.3 + (index * 0.05)} key={user.id}>
            <Link href={`/profile/${user.id}`} className={`group block ${session?.user?.id === user.id ? 'relative z-10 scale-[1.02]' : ''}`}>
              <div className={`flex items-center gap-6 p-6 rounded-2xl transition-all ${session?.user?.id === user.id ? 'border border-[var(--strong-border)] bg-[var(--surface-hover)]' : 'border border-[var(--strong-border)] bg-[var(--surface)] hover:border-[var(--strong-border)] hover:bg-[var(--surface)]'}`}>
                <div className={`w-12 text-center text-xl mb-mono ${session?.user?.id === user.id ? 'text-white font-semibold' : 'text-white/30 group-hover:text-white transition-colors'}`}>
                  #{user.rank || (index + 1)}
                </div>
                
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <DefaultAvatar src={user.avatar_url} name={user.username} seed={user.id} size={48} />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-[16px] font-medium text-white">{user.username || (lang === 'ja' ? '匿名' : t("Anonymous"))} {session?.user?.id === user.id && <span className="text-[10px] uppercase tracking-widest bg-white text-black px-2 py-0.5 rounded ml-2 font-semibold">{t("You")}</span>}</h3>
                  <p className="mb-label mt-1">{t("LEVEL")} {toKanji(user.level)}</p>
                </div>

                <div className="flex flex-col items-end justify-center pr-4">
                  <span className={`text-[16px] mb-mono transition-colors ${session?.user?.id === user.id ? 'text-white font-semibold' : 'text-white/50 group-hover:text-white'}`}>{toKanji(user.xp?.toLocaleString() || 0)} {lang === 'ja' ? '経験値' : 'XP'}</span>
                  {user.streak > 0 && <span className="text-[11px] text-white/30 mt-1">🔥 {toKanji(user.streak)} {t("Day Streak")}</span>}
                </div>
              </div>
            </Link>
            </SmoothFade>
          ))
        )}

        {shouldRenderCallerAtBottom && (
          <SmoothFade delay={0.8} className="mt-12 pt-12 border-t border-dashed border-[var(--strong-border)] relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--surface)] px-4 text-[10px] uppercase tracking-widest text-white/30 font-medium">
              {t("Your Current Rank")}
            </div>
            
            <Link href={`/profile/${currentCaller.id}`} className="group block relative z-10 scale-[1.02]">
              <div className="flex items-center gap-6 p-6 rounded-2xl transition-all border border-[var(--strong-border)] bg-[var(--surface-hover)]">
                <div className="w-12 text-center text-xl mb-mono text-white font-semibold">
                  #{currentCaller.rank}
                </div>
                
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <DefaultAvatar src={currentCaller.avatar_url} name={currentCaller.username} seed={currentCaller.id} size={48} />
                </div>

                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="text-[16px] font-medium text-white">{currentCaller.username || (lang === 'ja' ? '匿名' : t("Anonymous"))} <span className="text-[10px] uppercase tracking-widest bg-white text-black px-2 py-0.5 rounded ml-2 font-semibold">{t("You")}</span></h3>
                  <p className="mb-label mt-1">{t("LEVEL")} {toKanji(currentCaller.level)}</p>
                </div>

                <div className="flex flex-col items-end justify-center pr-4">
                  <span className="text-[16px] mb-mono text-white font-semibold">{toKanji(currentCaller.xp?.toLocaleString() || 0)} {lang === 'ja' ? '経験値' : 'XP'}</span>
                  {currentCaller.streak > 0 && <span className="text-[11px] text-white/30 mt-1">🔥 {toKanji(currentCaller.streak)} {t("Day Streak")}</span>}
                </div>
              </div>
            </Link>
          </SmoothFade>
        )}
      </div>
    </PageContainer>
  );
}
