-- Table for JLPT-style Vocabulary Questions
create table public.vocab_questions (
  id uuid default gen_random_uuid() primary key,
  jlpt_level text not null, -- 'N5', 'N4', 'N3', 'N2', 'N1'
  question_type text not null, -- 'comprehension', 'sentence_matching', 'scramble'
  
  -- The main prompt or question text
  prompt_ja text not null,
  prompt_en text,
  
  -- The target word being tested (if applicable)
  target_word text,
  
  -- Array of 4 options (strings)
  options jsonb not null,
  
  -- The index of the correct option (0, 1, 2, or 3)
  correct_option_index integer not null,
  
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.vocab_questions enable row level security;

-- Public read access
create policy "Vocab questions are viewable by everyone." on vocab_questions
  for select using (true);
