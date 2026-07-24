-- =======================================================
-- DAILY QUESTS SYSTEM SCHEMA (100 Quests: Easy, Med, Hard)
-- =======================================================

-- 0. Wipe old tables to start fresh
DROP TABLE IF EXISTS user_active_quests CASCADE;
DROP TABLE IF EXISTS daily_quests_pool CASCADE;

-- 1. Create the Master Pool of Daily Quests
CREATE TABLE daily_quests_pool (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    quest_type VARCHAR(50) NOT NULL, -- kanji_count, vocab_count, grammar_count, perfect_session, streak_count, session_count, total_count
    difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard
    target_amount INTEGER NOT NULL,  -- The goal number
    xp_reward INTEGER NOT NULL,      -- How much XP they get
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the User Active Quests Table (Tracks today's progress)
CREATE TABLE user_active_quests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quest_id INTEGER REFERENCES daily_quests_pool(id) ON DELETE CASCADE,
    current_progress INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    is_claimed BOOLEAN DEFAULT false,
    assigned_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, quest_id, assigned_date)
);

-- =======================================================
-- SECURITY & POLICIES (Row Level Security)
-- =======================================================
ALTER TABLE daily_quests_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_quests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read daily quests pool" ON daily_quests_pool FOR SELECT USING (true);
CREATE POLICY "Users can view own active quests" ON user_active_quests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Backend can insert active quests" ON user_active_quests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =======================================================
-- INITIAL SEED DATA (100 Quests)
-- =======================================================
INSERT INTO daily_quests_pool (title, description, quest_type, difficulty, target_amount, xp_reward) VALUES

-- 🟢 EASY TIER (40 Quests | 100 XP)
('Baby Steps', 'Answer 5 questions correctly. Everyone starts somewhere!', 'total_count', 'easy', 5, 100),
('Brush Stroke', 'Write your first chapter — answer 12 Kanji correctly', 'kanji_count', 'easy', 12, 100),
('Word Picker', 'Collect 5 new Vocabulary words like rare items', 'vocab_count', 'easy', 5, 100),
('Grammar Dabbler', 'Dip your toes into 3 Grammar questions', 'grammar_count', 'easy', 3, 100),
('Morning Training Arc', 'Show up to the dojo — complete 1 quiz session', 'session_count', 'easy', 1, 100),
('Combo x3', 'Land a 3-hit combo — 3 correct in a row', 'streak_count', 'easy', 3, 100),
('Kanji Novice', 'Trace 10 Kanji from memory', 'kanji_count', 'easy', 10, 100),
('Vocab Starter Pack', 'Unlock 10 new Vocabulary words', 'vocab_count', 'easy', 10, 100),
('Sentence Builder', 'Assemble 5 Grammar questions correctly', 'grammar_count', 'easy', 5, 100),
('Warmup Routine', 'Stretch those brain muscles — 1 quiz session', 'session_count', 'easy', 1, 100),
('Rising Sun', 'Answer 15 questions before the sun sets', 'total_count', 'easy', 15, 100),
('Shonen Spirit', 'Channel your inner protagonist — 6 correct in a row', 'streak_count', 'easy', 6, 100),
('Otaku Initiate', 'Absorb 12 new Vocabulary words from the wild', 'vocab_count', 'easy', 12, 100),
('Kanji Explorer', 'Discover 15 Kanji hiding in plain sight', 'kanji_count', 'easy', 15, 100),
('Grammar Ninja', 'Silently nail 8 Grammar questions', 'grammar_count', 'easy', 8, 100),
('Quick Learner', 'Speed-run 20 questions correctly', 'total_count', 'easy', 20, 100),
('Kanji Learner', 'Your eyes are sharpening — recognize 20 Kanji', 'kanji_count', 'easy', 20, 100),
('Vocab Learner', 'Stock up on 20 new Vocabulary words', 'vocab_count', 'easy', 20, 100),
('Grammar Practice', 'Work through 10 Grammar questions like homework', 'grammar_count', 'easy', 10, 100),
('After School Club', 'Attend 2 quiz sessions today', 'session_count', 'easy', 2, 100),
('Combo x5', 'Land a 5-hit streak — you are getting dangerous', 'streak_count', 'easy', 5, 100),
('Ramen Break', 'Answer 30 questions — you have earned your bowl', 'total_count', 'easy', 30, 100),
('Kanji Apprentice', 'Carve out 30 Kanji from stone', 'kanji_count', 'easy', 30, 100),
('Vocab Apprentice', 'Hoard 30 new Vocabulary words in your scroll', 'vocab_count', 'easy', 30, 100),
('Grammar Review', 'Revisit 15 Grammar questions for mastery', 'grammar_count', 'easy', 15, 100),
('Nice and Steady', 'Maintain discipline — 2 quiz sessions today', 'session_count', 'easy', 2, 100),
('Dedicated Learner', 'Show commitment — 3 quiz sessions today', 'session_count', 'easy', 3, 100),
('Sharp Mind', 'Razor-sharp reflexes — 10 correct in a row', 'streak_count', 'easy', 10, 100),
('Lucky Streak', 'Fortune favors the bold — 7 correct in a row', 'streak_count', 'easy', 7, 100),
('Clean Sweep', 'Achieve a flawless 100% in one session', 'perfect_session', 'easy', 1, 100),
('Manga Reader', 'Devour 25 Vocabulary words like manga pages', 'vocab_count', 'easy', 25, 100),
('Dojo Warmup', 'Master 25 Kanji before the sensei arrives', 'kanji_count', 'easy', 25, 100),
('Consistent', 'Stay on track — 40 questions answered correctly', 'total_count', 'easy', 40, 100),
('First Blood', 'Score your very first correct answer today', 'total_count', 'easy', 1, 100),
('Genki Starter', 'Full of energy! Answer 8 Kanji correctly', 'kanji_count', 'easy', 8, 100),
('Pocket Dictionary', 'Learn 8 quick Vocabulary words on the go', 'vocab_count', 'easy', 8, 100),
('Rule of Three', 'Complete exactly 3 Grammar questions', 'grammar_count', 'easy', 3, 100),
('Combo x4', 'String together 4 correct answers in a row', 'streak_count', 'easy', 4, 100),
('Double Session', 'Two quiz sessions? You are on fire today', 'session_count', 'easy', 2, 100),
('General Knowledge', 'Answer 25 questions across all categories', 'total_count', 'easy', 25, 100),

-- 🟡 MEDIUM TIER (30 Quests | 225 XP)
('Chunin Exam', 'Prove your rank — answer 60 Kanji correctly', 'kanji_count', 'medium', 60, 225),
('Bookworm Senpai', 'Devour 60 Vocabulary words like light novels', 'vocab_count', 'medium', 60, 225),
('Grammar Sensei', 'Teach by example — complete 35 Grammar questions', 'grammar_count', 'medium', 35, 225),
('Training Montage', 'Cue the music — 6 quiz sessions today', 'session_count', 'medium', 6, 225),
('Fire Streak', 'Blaze through 20 correct answers in a row', 'streak_count', 'medium', 20, 225),
('Kanji Adept', 'Your strokes flow naturally — 50 Kanji correct', 'kanji_count', 'medium', 50, 225),
('Vocab Scholar', 'Your word bank is impressive — 50 new words', 'vocab_count', 'medium', 50, 225),
('Grammar Expert', 'Parse 30 Grammar questions without breaking a sweat', 'grammar_count', 'medium', 30, 225),
('Marathon Session', 'Go the distance — 5 quiz sessions today', 'session_count', 'medium', 5, 225),
('Hot Streak', 'You cannot be stopped — 15 correct in a row', 'streak_count', 'medium', 15, 225),
('Knowledge is Power', 'Accumulate 70 correct answers across all types', 'total_count', 'medium', 70, 225),
('Kanji Specialist', 'Specialist-level precision — 70 Kanji correct', 'kanji_count', 'medium', 70, 225),
('Vocab Specialist', 'Your vocabulary rivals a textbook — 70 new words', 'vocab_count', 'medium', 70, 225),
('Grammar Master', 'Command the language — 40 Grammar questions', 'grammar_count', 'medium', 40, 225),
('Relentless', 'You do not quit — 7 quiz sessions today', 'session_count', 'medium', 7, 225),
('Flawless Run', 'Pure perfection — 100% in one session', 'perfect_session', 'medium', 1, 225),
('Unstoppable', 'A machine — 25 correct answers in a row', 'streak_count', 'medium', 25, 225),
('Broad Knowledge', 'Well-rounded scholar — 60 correct answers total', 'total_count', 'medium', 60, 225),
('Trivia Master', 'Walking encyclopedia — 80 correct answers total', 'total_count', 'medium', 80, 225),
('Kanji Enthusiast', 'Obsessed in the best way — 90 Kanji correct', 'kanji_count', 'medium', 90, 225),
('Vocab Enthusiast', 'Words are your weapons — 90 new words', 'vocab_count', 'medium', 90, 225),
('Grammar Guru', 'Enlightened — complete 50 Grammar questions', 'grammar_count', 'medium', 50, 225),
('Super Learner', 'Absolute unit — 10 quiz sessions today', 'session_count', 'medium', 10, 225),
('Kanji Samurai', 'Your blade is your brush — 80 Kanji correct', 'kanji_count', 'medium', 80, 225),
('Polyglot Path', 'Walking the multilingual road — 80 new words', 'vocab_count', 'medium', 80, 225),
('Grammar Shogun', 'Rule over syntax — 45 Grammar questions', 'grammar_count', 'medium', 45, 225),
('No Miss Zone', 'Absolute focus — 30 correct in a row', 'streak_count', 'medium', 30, 225),
('Study Beast', 'Raw power — 100 correct answers total', 'total_count', 'medium', 100, 225),
('Endurance Test', 'Test your limits — 8 quiz sessions today', 'session_count', 'medium', 8, 225),
('Double Perfection', 'Back-to-back flawless — 100% in two sessions', 'perfect_session', 'medium', 2, 225),

-- 🔴 HARD TIER (30 Quests | 375 XP)
('Kanji Master', 'Your mastery is undeniable — 120 Kanji correct', 'kanji_count', 'hard', 120, 375),
('Vocab Dictionary', 'You ARE the dictionary — 120 new words', 'vocab_count', 'hard', 120, 375),
('Grammar Perfectionist', 'Not a single mistake — 80 Grammar questions', 'grammar_count', 'hard', 80, 375),
('Iron Man', 'Built different — 15 quiz sessions today', 'session_count', 'hard', 15, 375),
('Double Flawless', 'Flawless twice — 100% in two sessions', 'perfect_session', 'hard', 2, 375),
('Monster Streak', 'Terrifying — 50 correct answers in a row', 'streak_count', 'hard', 50, 375),
('Omni-Scholar', 'Master of all trades — 150 correct answers total', 'total_count', 'hard', 150, 375),
('Kanji Grandmaster', 'Grandmaster rank achieved — 150 Kanji correct', 'kanji_count', 'hard', 150, 375),
('Walking Dictionary', 'People consult YOU — 150 new words', 'vocab_count', 'hard', 150, 375),
('Linguistic Genius', 'Big brain energy — 100 Grammar questions', 'grammar_count', 'hard', 100, 375),
('Unbreakable', 'Nothing can stop you — 20 quiz sessions today', 'session_count', 'hard', 20, 375),
('Triple Flawless', 'Three perfect scores — you are not human', 'perfect_session', 'hard', 3, 375),
('Legendary Streak', 'Legendary status — 80 correct in a row', 'streak_count', 'hard', 80, 375),
('The Grind', 'No shortcuts — 200 correct answers total', 'total_count', 'hard', 200, 375),
('Kanji God', 'Ascended — 250 Kanji correct', 'kanji_count', 'hard', 250, 375),
('Vocab Deity', 'Divine vocabulary — 250 new words', 'vocab_count', 'hard', 250, 375),
('Flawless Champion', 'Five perfect sessions — bow down', 'perfect_session', 'hard', 5, 375),
('The Absolute Pinnacle', 'The summit — 300 correct answers total', 'total_count', 'hard', 300, 375),
('Kanji Overlord', 'You rule the strokes — 180 Kanji correct', 'kanji_count', 'hard', 180, 375),
('Vocab Titan', 'Colossal word power — 180 new words', 'vocab_count', 'hard', 180, 375),
('Grammar Warlord', 'Conquer all syntax — 120 Grammar questions', 'grammar_count', 'hard', 120, 375),
('All Day Grind', 'Sunrise to sunset — 25 quiz sessions today', 'session_count', 'hard', 25, 375),
('Inhuman Streak', 'Beyond mortal limits — 100 correct in a row', 'streak_count', 'hard', 100, 375),
('Encyclopedic', 'You contain multitudes — 250 correct answers total', 'total_count', 'hard', 250, 375),
('Kanji Demon', 'Fearsome — 200 Kanji correct', 'kanji_count', 'hard', 200, 375),
('Living Lexicon', 'A breathing dictionary — 200 new words', 'vocab_count', 'hard', 200, 375),
('Syntax Slayer', 'Grammar fears you — 150 Grammar questions', 'grammar_count', 'hard', 150, 375),
('Quad Flawless', 'Four perfect sessions in one day — mythical', 'perfect_session', 'hard', 4, 375),
('Immortal Streak', 'Unkillable — 120 correct answers in a row', 'streak_count', 'hard', 120, 375),
('Beyond Limits', 'Plus Ultra — 350 correct answers total', 'total_count', 'hard', 350, 375);
