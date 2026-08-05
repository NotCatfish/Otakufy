"use client";

import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import { useLanguage } from '@/context/LanguageContext';

export default function ListeningPlaceholder() {
  const { lang } = useLanguage();
  
  return (
    <PageContainer className="flex flex-col items-center justify-center min-h-[70vh] text-center font-light">
      <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
        {lang === 'ja' ? '準備中' : 'Work in Progress'}
      </h1>
      <p className="text-xl md:text-2xl font-medium opacity-80 mb-12">
        {lang === 'ja' ? 'リスニングモジュールは現在開発中です。' : 'The listening module is currently under development.'}
      </p>
      <Link 
        href="/"
        className="px-8 py-3 border-2 border-white rounded-full text-sm font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-all duration-300"
      >
        {lang === 'ja' ? 'ダッシュボードに戻る' : 'Return to Dashboard'}
      </Link>
    </PageContainer>
  );
}
