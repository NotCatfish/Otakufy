import { useState, useEffect, useRef } from 'react';
import QuestRepository from '../repositories/QuestRepository';
import { calculateLevelStats } from '../../profile/utils/levelUtils';
import { getTodayDateString } from '../../profile/utils/timeUtils';

export const useQuests = (userId) => {
    const [quests, setQuests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchingRef = useRef(false);

    useEffect(() => {
        if (!userId || fetchingRef.current) return;
        fetchingRef.current = true;
        
        const fetchOrAssignQuests = async () => {
            setLoading(true);
            const today = getTodayDateString();
            
            // 1. Fetch today's assigned quests
            const { data: activeQuests, error } = await QuestRepository.getActiveQuestsForDate(userId, today);

            if (error) {
                console.error("Error fetching quests:", error);
                setLoading(false);
                fetchingRef.current = false;
                return;
            }

            if (activeQuests && activeQuests.length > 0) {
                setQuests(activeQuests);
            } else {
                // 2. Assign new quests if none exist for today
                const { data: pool } = await QuestRepository.getQuestPool();
                if (!pool || pool.length === 0) {
                    setLoading(false);
                    fetchingRef.current = false;
                    return;
                }

                const easy = pool.filter(q => q.difficulty === 'easy').sort(() => 0.5 - Math.random());
                const med = pool.filter(q => q.difficulty === 'medium').sort(() => 0.5 - Math.random());
                const hard = pool.filter(q => q.difficulty === 'hard').sort(() => 0.5 - Math.random());

                // Select exactly 2 Easy, 1 Medium, 1 Hard
                const selected = [
                    easy[0],
                    easy[1],
                    med[0],
                    hard[0]
                ].filter(Boolean);

                const newInserts = selected.map(q => ({
                    user_id: userId,
                    quest_id: q.id,
                    assigned_date: today,
                    current_progress: 0 // Start fresh at 0
                }));

                const { error: insertErr } = await QuestRepository.assignQuests(newInserts);

                if (!insertErr) {
                    const { data: newlyAssigned } = await QuestRepository.getActiveQuestsForDate(userId, today);
                        
                    if (newlyAssigned) setQuests(newlyAssigned);
                }
            }
            setLoading(false);
            // intentionally leaving fetchingRef.current = true so strict mode doesn't re-run in same mount cycle
        };

        fetchOrAssignQuests();
    }, [userId]);

    const claimReward = async (activeQuestId, xpReward) => {
        const { data, error } = await QuestRepository.claimReward(activeQuestId);
            
        if (!error && data?.success) {
            setQuests(quests.map(q => q.id === activeQuestId ? { ...q, is_claimed: true } : q));
            // Reload page to instantly update top level XP and level bar
            window.location.reload(); 
        } else if (data?.error) {
            console.error("Reward claim failed:", data.error);
        }
    };

    return { quests, loading, claimReward };
};
