"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import PageContainer from '../../components/PageContainer';
import SmoothFade from '../../components/SmoothFade';
import RevealText from '../../components/RevealText';
import { useLanguage } from '../../context/LanguageContext';

export default function HelpPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const FAQS = [
    {
      question: t("How does the Spaced Repetition (SRS) work?"),
      answer: t("Our SRS acts as a 'Mistakes Review Bucket'. When you get a question wrong during practice, it's added to your SRS queue. You'll need to answer it correctly multiple times to clear it. There are no time-based intervals right now—just immediate, relentless practice for your weak spots.")
    },
    {
      question: t("When do Daily Quests reset?"),
      answer: t("Daily Quests reset exactly at Midnight (00:00) in your local timezone. Make sure to complete your quests and claim your rewards before the clock strikes twelve!")
    },
    {
      question: t("How is XP calculated?"),
      answer: t("XP is earned by answering quiz questions and completing Quests. Higher JLPT levels award more XP per correct answer (N5 = 10 XP, N4 = 11 XP, N3 = 13 XP, N2 = 16 XP, N1 = 20 XP). Partially correct flashcards reward half XP.")
    },
    {
      question: t("What do the JLPT levels (N5 to N1) mean?"),
      answer: t("The JLPT (Japanese-Language Proficiency Test) is the standard test for Japanese proficiency. N5 is the easiest level (basics), while N1 is the hardest (near-native fluency). You can select your target level before starting any practice session.")
    },
    {
      question: t("How do I turn off the Furigana/reading hints?"),
      answer: t("If you want to practice reading raw Kanji without the small reading aids above them, you can disable 'Show Furigana' by navigating to the Settings page via the gear icon.")
    },
    {
      question: t("What happens if I lose my daily streak?"),
      answer: t("Your daily streak increases for every consecutive day you complete at least one practice session. If you miss a day (before Midnight local time), your streak resets to zero! Keep practicing daily to maintain it.")
    },
    {
      question: t("Why isn't my Japanese keyboard input working?"),
      answer: t("If you are having trouble typing in Hiragana/Katakana, ensure your OS-level IME (Input Method Editor) is switched to Japanese mode. For most Windows users, pressing 'Alt + ~' toggles this. For Mac, use 'Control + Shift + J'.")
    },
    {
      question: t("How exactly are my answers graded? What about punctuation?"),
      answer: t("The quiz engine is very forgiving! It automatically ignores all punctuation (like parentheses, commas, and hyphens) and ignores filler words (like 'to', 'a', 'the'). For example, if the official meaning is \"to take (home)\", you can simply type \"take home\" or \"to take home\" and it will be marked correct. Just make sure you include all the core vocabulary words!")
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <PageContainer maxWidth="max-w-[1440px]" className="flex flex-col gap-12 w-full pb-20">
      
      {/* Hero Section */}
      <SmoothFade delay={0.1} className="flex flex-col items-start gap-3 border-b border-[var(--strong-border)] pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-white">
          <RevealText text={t("Help & Support")} baseDelay={0.2} />
        </h1>
        <p className="text-[var(--muted-text)] text-[14px]">
          {t("Need a hand with your Japanese journey? Check out the guides below or reach out to the community for assistance.")}
        </p>
      </SmoothFade>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        
        {/* Row 1, Col 1: Quick Guides */}
        <SmoothFade delay={0.2} className="mb-card rounded-2xl p-8 border border-[var(--strong-border)] h-full">
            <h2 className="mb-label mb-6 text-sm">quick guides</h2>
            <div className="flex flex-col gap-6">
                <div>
                    <h3 className="text-white font-medium mb-2 text-sm">{t("Modes Explained")}</h3>
                    <p className="text-[13px] text-white/50 leading-relaxed">
                        <strong className="text-white font-medium">{t("Vocab & Kanji:")}</strong> {t("Flashcard style memorization.")}<br/>
                        <strong className="text-white font-medium">{t("Grammar:")}</strong> {t("Understand structural rules with sentence examples.")}<br/>
                        <strong className="text-white font-medium">{t("Reading:")}</strong> {t("Comprehension tests built for JLPT paragraphs.")}
                    </p>
                </div>
                <div>
                    <h3 className="text-white font-medium mb-2 text-sm">{t("The Dictionary")}</h3>
                    <p className="text-[13px] text-white/50 leading-relaxed">
                        {t("Use the Dictionary tab to search for specific words. It breaks down the Kanji, displays Furigana, and provides JLPT context instantly.")}
                    </p>
                </div>
            </div>
        </SmoothFade>

        {/* Row 1, Col 2: Connect & Community */}
        <SmoothFade delay={0.3} className="mb-card rounded-2xl p-8 border border-[var(--strong-border)] flex flex-col gap-4 h-full">
            <h2 className="mb-label mb-4 text-sm">connect</h2>
            
            <a 
                href="https://discord.gg/MZAzKxXmEU" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center justify-between p-4 bg-[var(--surface)] border border-[var(--strong-border)] rounded-xl hover:border-[var(--strong-border)] transition-colors group"
            >
                <div className="flex flex-col">
                    <span className="font-medium text-[13px] text-white">{t("Join our Discord")}</span>
                    <span className="text-[12px] text-white/30">{t("Chat with learners & report bugs")}</span>
                </div>
                <svg className="w-5 h-5 text-white/30 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </a>

            <div className="flex flex-col p-4 bg-[var(--surface)] border border-[var(--strong-border)] rounded-xl mt-2">
                <span className="font-medium text-white text-[13px]">{t("Direct Support")}</span>
                <span className="text-[12px] text-white/30 mt-1">{t("For critical account or billing issues:")}</span>
                <a href="mailto:support@otakufy.dummy.com" className="text-white/50 mb-mono text-[12px] mt-2 hover:text-white transition-colors">
                    support@otakufy.dummy.com
                </a>
            </div>
        </SmoothFade>

        {/* Row 2: FAQ Accordion (Full Width) */}
        <div className="mb-card rounded-2xl p-8 border border-[var(--strong-border)] h-full md:col-span-2">
            <h2 className="mb-label mb-6 text-sm">frequently asked questions</h2>
            <div className="flex flex-col gap-3">
                {FAQS.map((faq, index) => (
                    <div key={index} className="flex flex-col border border-[var(--strong-border)] rounded-xl overflow-hidden transition-all duration-300 bg-[var(--surface)]">
                        <button 
                            onClick={() => toggleFaq(index)}
                            className="flex justify-between items-center p-4 text-left hover:bg-[var(--surface)] transition-colors focus:outline-none"
                        >
                            <span className="font-medium text-[13px] text-white">{faq.question}</span>
                            <svg 
                                className={`w-4 h-4 text-white/30 transform transition-transform duration-300 ${openFaq === index ? 'rotate-180 text-white' : ''}`} 
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        
                        <div 
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                            <div className="p-4 pt-0 text-[13px] text-white/50 leading-relaxed border-t border-[var(--strong-border)] mt-2">
                                {faq.answer}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </PageContainer>
  );
}
