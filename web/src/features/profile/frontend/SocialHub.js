"use client";

import { useEffect, useState } from 'react';
import SocialRepository from '../repositories/SocialRepository';
import Link from 'next/link';
import DefaultAvatar from './DefaultAvatar';
import { useLanguage } from '@/context/LanguageContext';

export default function SocialHub({ session }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('friends'); // friends, requests, add_friend
  const [addFriendSubTab, setAddFriendSubTab] = useState('search'); // search, outgoing
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      fetchFriends();
      fetchRequests();
      fetchOutgoingRequests();
    }
  }, [session]);

  const fetchFriends = async () => {
    const { data } = await SocialRepository.getFriends(session.user.id);
    if (data) setFriends(data);
  };

  const fetchRequests = async () => {
    const { data } = await SocialRepository.getPendingRequests(session.user.id);
    if (data) setRequests(data);
  };

  const fetchOutgoingRequests = async () => {
    const { data } = await SocialRepository.getOutgoingRequests(session.user.id);
    if (data && data.length > 0) {
      // fetch profile info for each addressee
      const ids = data.map(r => r.addressee_id);
      const { data: profiles } = await SocialRepository.getProfilesByIds(ids);
      const profileMap = Object.fromEntries((profiles || []).map(p => [p.id, p]));
      setOutgoingRequests(data.map(r => ({ friendship_id: r.id, ...profileMap[r.addressee_id] })));
    } else {
      setOutgoingRequests([]);
    }
  };

  // Exact-match search: requires "username#discriminator" format
  const executeExactSearch = async () => {
    const q = searchQuery.trim();
    setSearchError('');
    setSearchResults([]);
    if (!q) return;

    if (!q.includes('#')) {
      setSearchError('Please enter the full tag, e.g. Sakura#2640');
      return;
    }

    const hashIdx = q.lastIndexOf('#');
    const uname = q.slice(0, hashIdx).trim();
    const disc = q.slice(hashIdx + 1).trim();

    if (!uname || !disc) {
      setSearchError('Invalid format. Use username#0000');
      return;
    }

    setLoading(true);
    const { data, error } = await SocialRepository.searchUserExact(uname, disc, session.user.id);

    if (error || !data || data.length === 0) {
      setSearchResults([]);
      setSearchError('No one with that name could be found');
      setLoading(false);
      return;
    }

    // Annotate with friendship status
    const target = data[0];
    const { data: existing } = await SocialRepository.checkFriendshipStatus(session.user.id, target.id);

    let friendship_status = null;
    if (existing && existing.length > 0) {
      friendship_status = existing[0].status === 'accepted' ? 'accepted' : 'pending';
    }

    setSearchResults([{ ...target, friendship_status }]);
    setLoading(false);
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'add_friend') {
      await executeExactSearch();
    }
  };



  const sendFriendRequest = async (targetId) => {
    setSearchResults(prev => prev.map(u => u.id === targetId ? { ...u, friendship_status: 'pending' } : u));
    
    const { error } = await SocialRepository.sendFriendRequest(session.user.id, targetId);
    
    if (error) {
      setSearchResults(prev => prev.map(u => u.id === targetId ? { ...u, friendship_status: null } : u));
      console.error('Friend request failed:', error.message);
    } else {
      fetchOutgoingRequests();
    }
  };

  const acceptRequest = async (friendshipId) => {
    await SocialRepository.acceptFriendRequest(friendshipId);
    fetchRequests();
    fetchFriends();
  };

  const declineRequest = async (friendshipId) => {
    await SocialRepository.removeFriendshipById(friendshipId);
    fetchRequests();
  };

  const withdrawRequest = async (friendshipId) => {
    await SocialRepository.removeFriendshipById(friendshipId);
    setOutgoingRequests(prev => prev.filter(r => r.friendship_id !== friendshipId));
    // also update search results if still visible
    setSearchResults(prev => prev.map(u =>
      outgoingRequests.find(r => r.friendship_id === friendshipId && r.id === u.id)
        ? { ...u, friendship_status: null }
        : u
    ));
  };

  const unfriend = async (friendId) => {
    await SocialRepository.unfriend(session.user.id, friendId);
    fetchFriends();
  };


  if (!session) return null;

  // Local filtering for Friends and Requests tabs
  const filterUsers = (userList) => userList.filter(user => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (user.username || '').toLowerCase().includes(q);
    const discMatch = (user.discriminator || '').toString().includes(q);
    const fullMatch = `${user.username || ''}#${user.discriminator || ''}`.toLowerCase().includes(q);
    return nameMatch || discMatch || fullMatch;
  });

  const filteredFriends = filterUsers(friends);
  const filteredRequests = filterUsers(requests);

  return (
    <div className="w-full font-light text-white pb-16">
      <header className="mb-8 border-b border-[var(--strong-border)] pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">{t("Social Hub")}</h1>
          <p className="text-[14px] text-white/50">{t("Connect with friends, accept friend requests, and discover fellow learners.")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setActiveTab('friends')} 
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'friends' ? 'bg-white text-black font-bold shadow-sm' : 'border border-[var(--strong-border)] text-white/60 hover:border-white/50 hover:text-white bg-[var(--surface)]'}`}
          >
            {t("Friends")} ({friends.length})
          </button>
          <button 
            onClick={() => setActiveTab('requests')} 
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'requests' ? 'bg-white text-black font-bold shadow-sm' : 'border border-[var(--strong-border)] text-white/60 hover:border-white/50 hover:text-white bg-[var(--surface)]'}`}
          >
            {t("Requests")} {requests.length > 0 && `(${requests.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('add_friend')} 
            className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all ${activeTab === 'add_friend' ? 'bg-white text-black font-bold shadow-sm' : 'border border-[var(--strong-border)] text-white/60 hover:border-white/50 hover:text-white bg-[var(--surface)]'}`}
          >
            {t("Add Friend")}
          </button>
        </div>
      </header>

      <div className="mb-10 w-full">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input 
            type="text" 
            placeholder={
              activeTab === 'friends' 
                ? t("Search & filter friends by name or #ID...") 
                : activeTab === 'requests' 
                ? t("Search & filter requests by name or #ID...") 
                : t("Enter exact tag e.g. Sakura#2640")
            } 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSearchError(''); }}
            className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-2xl py-3.5 pl-5 pr-32 text-sm font-medium text-white focus:outline-none focus:border-white transition-all placeholder:text-white/30 shadow-lg"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => { setSearchQuery(''); setSearchError(''); setSearchResults([]); }}
                className="p-2 text-white/40 hover:text-white text-xs uppercase tracking-wider font-semibold"
              >
                {t("Clear")}
              </button>
            )}
            {activeTab === 'add_friend' && addFriendSubTab === 'search' && (
              <button 
                type="submit" 
                className="px-6 py-2 bg-white text-black rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-sm"
              >
                {loading ? '...' : t("Search")}
              </button>
            )}
          </div>
        </form>
        <p className="text-[11px] text-left mt-2.5 tracking-wider">
          {activeTab === 'friends' && <span className="text-white/40">{t("Filtering friends list.")}</span>}
          {activeTab === 'requests' && <span className="text-white/40">{t("Filtering pending requests.")}</span>}
          {activeTab === 'add_friend' && addFriendSubTab === 'search' && (
            searchError 
              ? <span className="text-red-400">{t(searchError)}</span>
              : <span className="text-white/40">{t("Exact match only — enter the full tag including #0000.")}</span>
          )}
        </p>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="animate-fade-in">
          {friends.length === 0 ? (
            <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
              <p className="text-white/40 uppercase tracking-widest text-sm mb-4">{t("No friends added yet.")}</p>
              <button 
                onClick={() => setActiveTab('add_friend')}
                className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-white/90 transition-all"
              >
                {t("Find & Add Friends")}
              </button>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
              <p className="text-white/60 text-base font-medium">{t("No one with that name could be found")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFriends.map(friend => (
                <div key={friend.id} className="p-6 border border-white/10 rounded-2xl bg-[var(--surface)] hover:border-white/25 transition-all flex items-center justify-between group shadow-md">
                  <Link href={`/profile/${friend.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                      <DefaultAvatar src={friend.avatar_url} name={friend.username} seed={friend.id} size={48} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-semibold text-white truncate">{friend.username || t('Anonymous')}</h3>
                      <p className="text-[11px] font-mono uppercase tracking-widest text-white/50 mt-0.5">Lvl {friend.level} • {friend.xp !== null ? friend.xp.toLocaleString() + ' XP' : 'Hidden XP'}</p>
                    </div>
                  </Link>
                  <button 
                    onClick={() => unfriend(friend.id)} 
                    className="opacity-0 group-hover:opacity-100 p-2.5 text-red-400 hover:bg-red-500/10 rounded-xl transition-all shrink-0 ml-2" 
                    title="Remove Friend"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="23" y2="12"/><line x1="23" y1="8" x2="19" y2="12"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="animate-fade-in flex flex-col gap-4 w-full">
          {requests.length === 0 ? (
            <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
              <p className="text-white/40 uppercase tracking-widest text-sm">{t("No pending friend requests.")}</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
              <p className="text-white/60 text-base font-medium">{t("No one with that name could be found")}</p>
            </div>
          ) : (
            filteredRequests.map(req => (
              <div key={req.friendship_id} className="p-6 border border-white/10 rounded-2xl bg-[var(--surface)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-md">
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                    <DefaultAvatar src={req.avatar_url} name={req.username} seed={req.friendship_id} size={48} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white truncate">
                      {req.username || t('Anonymous')} <span className="text-xs font-mono text-white/40 font-normal">#{req.discriminator}</span>
                    </h3>
                    <p className="text-[11px] uppercase tracking-widest text-white/50 mt-0.5">{t("wants to be friends")}</p>
                  </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto justify-end">
                  <button onClick={() => acceptRequest(req.friendship_id)} className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-all shadow-sm">{t("Accept")}</button>
                  <button onClick={() => declineRequest(req.friendship_id)} className="px-6 py-2.5 border border-[var(--strong-border)] text-white/80 hover:text-white font-semibold text-xs rounded-xl hover:border-white/40 transition-all bg-[var(--surface-hover)]">{t("Decline")}</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Friend Tab */}
      {activeTab === 'add_friend' && (
        <div className="animate-fade-in w-full">
          {/* Sub-tabs: Search | Outgoing */}
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setAddFriendSubTab('search')}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all ${
                addFriendSubTab === 'search' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'
              }`}
            >
              {t("Search")}
            </button>
            <button
              onClick={() => setAddFriendSubTab('outgoing')}
              className={`px-4 py-2 rounded-lg text-xs uppercase tracking-widest font-semibold transition-all ${
                addFriendSubTab === 'outgoing' ? 'bg-white/10 text-white border border-white/20' : 'text-white/40 hover:text-white'
              }`}
            >
              {t("Outgoing")} {outgoingRequests.length > 0 && `(${outgoingRequests.length})`}
            </button>
          </div>

          {/* Search Sub-tab */}
          {addFriendSubTab === 'search' && (
            <div className="flex flex-col gap-4">
              {searchResults.length === 0 && !loading && !searchError && (
                <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
                  <p className="text-white/40 uppercase tracking-widest text-sm">{t("Enter an exact tag above to find someone, e.g. Sakura#2640")}</p>
                </div>
              )}
              {searchError && searchResults.length === 0 && !loading && (
                <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
                  <p className="text-white/60 text-base font-medium">{t("No one with that name could be found")}</p>
                </div>
              )}
              {searchResults.map(user => (
                <div key={user.id} className="p-5 border border-white/10 rounded-2xl bg-[var(--surface)] hover:border-white/25 transition-all flex items-center justify-between gap-4 shadow-md">
                  <Link href={`/profile/${user.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                      <DefaultAvatar src={user.avatar_url} name={user.username} seed={user.id} size={48} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white truncate">
                        {user.username || t('Anonymous')} <span className="text-xs font-mono text-white/40 font-normal">#{user.discriminator}</span>
                      </h3>
                    </div>
                  </Link>
                  <div className="shrink-0">
                    {user.friendship_status === 'accepted' ? (
                      <span className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-[11px] font-semibold text-white/50 tracking-wider uppercase">{t("Friends")}</span>
                    ) : user.friendship_status === 'pending' ? (
                      <span className="px-4 py-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-[11px] font-semibold text-yellow-400 tracking-wider uppercase">{t("Pending")}</span>
                    ) : (
                      <button 
                        onClick={() => sendFriendRequest(user.id)} 
                        className="px-5 py-2.5 bg-white text-black hover:bg-white/90 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-sm"
                      >
                        {t("Add Friend")}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Outgoing Sub-tab */}
          {addFriendSubTab === 'outgoing' && (
            <div className="flex flex-col gap-4">
              {outgoingRequests.length === 0 ? (
                <div className="py-16 border border-white/10 rounded-2xl bg-[var(--surface)] pl-8">
                  <p className="text-white/40 uppercase tracking-widest text-sm">{t("No outgoing friend requests.")}</p>
                </div>
              ) : (
                outgoingRequests.map(req => (
                  <div key={req.friendship_id} className="p-5 border border-white/10 rounded-2xl bg-[var(--surface)] hover:border-white/25 transition-all flex items-center justify-between gap-4 shadow-md">
                    <Link href={`/profile/${req.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        <DefaultAvatar src={req.avatar_url} name={req.username} seed={req.friendship_id} size={48} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base font-semibold text-white truncate">
                          {req.username || t('Anonymous')} <span className="text-xs font-mono text-white/40 font-normal">#{req.discriminator}</span>
                        </h3>
                        <p className="text-[11px] uppercase tracking-widest text-white/40 mt-0.5">{t("Request sent · awaiting response")}</p>
                      </div>
                    </Link>
                    <button 
                      onClick={() => withdrawRequest(req.friendship_id)}
                      className="px-5 py-2.5 border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all"
                    >
                      {t("Withdraw")}
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
