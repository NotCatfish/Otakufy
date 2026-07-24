import React from 'react';

export const VOCAB_TYPES_CONFIG = {
  reading: {
    id: 'reading', en: 'Kanji Reading', ja: '漢字読み', desc: 'Select the correct hiragana reading.',
    instruction: '＿＿＿の言葉の読み方として最もよいものを、１・２・３・４から一つ選びなさい。',
    exampleText: <>あたらしい <span className="border-b border-white pb-1 mx-1">車</span> を買いました。</>,
    exampleOptions: <><span>1 くるま</span><span>2 じてんしゃ</span><span>3 ふね</span><span>4 でんしゃ</span></>,
    correctAnswer: '1'
  },
  orthography: {
    id: 'orthography', en: 'Orthography', ja: '表記', desc: 'Select the correct kanji spelling.',
    instruction: '＿＿＿の言葉を漢字で書くとき、最もよいものを、１・２・３・４から一つ選びなさい。',
    exampleText: <>毎日 <span className="border-b border-white pb-1 mx-1">とけい</span> を見ます。</>,
    exampleOptions: <><span>1 時計</span><span>2 時型</span><span>3 待計</span><span>4 持計</span></>,
    correctAnswer: '1'
  },
  paraphrase: {
    id: 'paraphrase', en: 'Paraphrases', ja: '言い換え類義', desc: 'Find the word with the exact same meaning.',
    instruction: '＿＿＿の言葉に意味が最も近いものを、１・２・３・４から一つ選びなさい。',
    exampleText: <>彼は <span className="border-b border-white pb-1 mx-1">いつも</span> 勉強している。</>,
    exampleOptions: <><span>1 常に</span><span>2 たまに</span><span>3 決して</span><span>4 必ず</span></>,
    correctAnswer: '1'
  },
  usage: {
    id: 'usage', en: 'Word Usage', ja: '用法', desc: 'Identify the sentence that uses the word correctly.',
    instruction: '次の言葉の使い方として最もよいものを、１・２・３・４から一つ選びなさい。',
    exampleText: '【 りんご 】',
    exampleOptions: <div className="flex flex-col gap-4 w-full max-w-md text-base text-left"><span>1 私は毎日りんごを食べます。</span><span>2 りんごに乗って学校へ行く。</span><span>3 ペンでりんごを書く。</span><span>4 りんごが降ってきた。</span></div>,
    correctAnswer: '1'
  },
  random: {
    id: 'random', en: 'Random', ja: 'ランダム', desc: 'A chaotic mix of all vocabulary question types.',
    instruction: 'このセッションでは、すべての語彙問題がランダムに出題されます。各問題の指示に従って、最もよいものを一つ選びなさい。'
  }
};

export const GRAMMAR_TYPES_CONFIG = {
  context: {
    id: 'context', en: 'Fill-in-the-Blank', ja: '文法形式の判断', desc: 'Select the correct grammar structure or particle.',
    instruction: '（　　　）に入れるのに最もよいものを、１・２・３・４から一つ選びなさい。',
    exampleText: <>明日のホテルを（　　　）しました。</>,
    exampleOptions: <><span>1 予約</span><span>2 約束</span><span>3 予定</span><span>4 予期</span></>,
    correctAnswer: '1'
  },
  scramble: {
    id: 'scramble', en: 'Sentence Scramble', ja: '文の組み立て', desc: 'Arrange the chunks and identify the star.',
    instruction: '次の文の ★ に入る最もよいものを、１・２・３・４から一つ選びなさい。',
    exampleText: 'きのう、＿＿＿ ＿＿＿ ★ ＿＿＿。',
    exampleOptions: <><span>1 じしょを</span><span>2 日本語の</span><span>3 行きました。</span><span>4 買いに</span></>,
    correctAnswer: '4',
    solutionText: <p className="mb-8 text-lg font-light text-white/80 tracking-wide">正しい文：きのう、<span className="border-b border-white/40 pb-1">日本語の</span> <span className="border-b border-white/40 pb-1">じしょを</span> <span className="border-b border-blue-400 pb-1 text-blue-400">買いに</span> <span className="border-b border-white/40 pb-1">行きました。</span></p>
  },
  random: {
    id: 'random', en: 'Random', ja: 'ランダム', desc: 'A chaotic mix of all grammar question types.',
    instruction: 'このセッションでは、すべての文法問題がランダムに出題されます。'
  }
};

export const THEME_MAP = {
  kanji: { color: "text-[var(--muted-text)] group-hover:text-[var(--foreground)]", border: "", bgHover: "", shadow: "" },
  vocabulary: { color: "text-[var(--muted-text)] group-hover:text-[var(--foreground)]", border: "", bgHover: "", shadow: "" },
  grammar: { color: "text-[var(--muted-text)] group-hover:text-[var(--foreground)]", border: "", bgHover: "", shadow: "" },
  comprehension: { color: "text-[var(--muted-text)] group-hover:text-[var(--foreground)]", border: "", bgHover: "", shadow: "" },
  listening: { color: "text-[var(--muted-text)] group-hover:text-[var(--foreground)]", border: "", bgHover: "", shadow: "" },
  random: { color: "text-[var(--muted-text)] group-hover:text-[var(--foreground)]", border: "", bgHover: "", shadow: "" },
};
