import { useState, useEffect } from 'react';
import { supabase } from '../../auth/frontend/supabaseClient';
import SuggestionRepository from '../repositories/SuggestionRepository';

export function useSuggestions(activeTab, sortBy) {
  const [session, setSession] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [userVotes, setUserVotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const isAdmin = session?.user?.id === (process.env.NEXT_PUBLIC_ADMIN_USER_UUID || '');

  useEffect(() => {
    const fetchSessionAndData = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data?.session);
      fetchSuggestions(data?.session);
    };
    fetchSessionAndData();
  }, [sortBy, activeTab]);

  const fetchSuggestions = async (currentSession) => {
    try {
      const cacheKey = `otakufy_suggestions_cache_${activeTab}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Date.now() - parsed.timestamp < 300000) {
          setSuggestions(parsed.suggestions || []);
          setLoading(false);
        }
      } else {
        setLoading(true);
      }
    } catch (e) {
      setLoading(true);
    }
    
    const { data: suggestionsData, error } = await SuggestionRepository.getSuggestionsByTab(activeTab);

    if (error) {
        console.error("Error fetching suggestions:", error);
        setLoading(false);
        return;
    }

    try {
      sessionStorage.setItem(`otakufy_suggestions_cache_${activeTab}`, JSON.stringify({
        timestamp: Date.now(),
        suggestions: suggestionsData
      }));
    } catch (e) {}

    let sorted = [...suggestionsData];
    if (sortBy === 'hot') {
        sorted.sort((a, b) => b.hot_score - a.hot_score);
    } else if (sortBy === 'top') {
        sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    } else if (sortBy === 'new') {
        sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    let finalSuggestions = sorted;
    const activeSession = currentSession || session;
    if (activeSession?.user) {
        const { data: votesData } = await SuggestionRepository.getUserVotes();
            
        if (votesData) {
            const votesMap = {};
            votesData.forEach(v => {
                votesMap[v.suggestion_id] = v.vote_value;
            });
            setUserVotes(votesMap); 
            finalSuggestions = sorted.map(s => ({ ...s, userVote: votesMap[s.id] || 0 }));
        }
    }
    
    setSuggestions(finalSuggestions);
    setLoading(false);
  };

  const handleVote = async (suggestionId, voteValue) => {
    if (!session?.user) {
        setToast({ message: "You must be signed in to vote on suggestions!", type: "info" });
        return;
    }

    setSuggestions(prev => prev.map(s => {
        if (s.id !== suggestionId) return s;
        
        const previousVote = s.userVote || 0;
        if (previousVote === voteValue) return s;
        
        let newUpvotes = Number(s.upvotes || 0);
        let newDownvotes = Number(s.downvotes || 0);
        
        if (previousVote === 1) newUpvotes = Math.max(0, newUpvotes - 1);
        if (previousVote === -1) newDownvotes = Math.max(0, newDownvotes - 1);
        
        if (voteValue === 1) newUpvotes++;
        if (voteValue === -1) newDownvotes++;
        
        return { 
            ...s, 
            upvotes: newUpvotes, 
            downvotes: newDownvotes,
            userVote: voteValue 
        };
    }));

    const { error } = await SuggestionRepository.castVote(suggestionId, voteValue);

    if (error) {
        console.error("Vote failed:", error);
        setToast({ message: `Failed to cast vote: ${error.message}`, type: "error" });
        fetchSuggestions(); 
    }
  };

  const handleSubmitSuggestion = async ({ title, description, isAnonymous }) => {
    const { data, error } = await SuggestionRepository.submitSuggestion(title, description, isAnonymous);

    if (error) {
        throw error;
    }
    
    setToast({ message: "Suggestion submitted successfully!", type: "success" });
    fetchSuggestions();
  };

  const handleUpdateStatus = async (suggestionId, newStatus) => {
    const { error } = await SuggestionRepository.updateStatus(suggestionId, newStatus);
    if (error) {
        setToast({ message: "Failed to update status: " + error.message, type: "error" });
    } else {
        setToast({ message: `Status updated to ${newStatus}!`, type: "success" });
        fetchSuggestions();
    }
  };

  return {
    session,
    suggestions,
    userVotes,
    loading,
    toast,
    setToast,
    isAdmin,
    handleVote,
    handleSubmitSuggestion,
    handleUpdateStatus
  };
}
