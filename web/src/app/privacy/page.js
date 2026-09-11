"use client";

import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import SmoothFade from '@/components/SmoothFade';
import RevealText from '@/components/RevealText';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPage() {
  const { lang, t } = useLanguage();

  const sections = [
    {
      title: lang === 'ja' ? '1. 個人情報の収集範囲' : '1. Information We Collect',
      content: lang === 'ja'
        ? 'Otakufy（以下「本サービス」）は、言語学習の提供に必要な最小限の情報のみを収集します。収集するデータは、アカウント作成時のメールアドレス、任意の表示名、および学習進行状況（獲得XP、連続学習日数、SRSフラッシュカードの復習間隔、クイズ回答履歴）に限られます。クレジットカード番号、電話番号、住所などの機微な個人情報は一切収集いたしません。'
        : 'Otakufy collects only the minimal information strictly required to facilitate your language learning. This includes your account email, optional display name, and learning telemetry (earned XP, daily streak counters, Spaced Repetition review intervals, and quiz attempt history). We never collect credit card numbers, payment details, phone numbers, or physical addresses.',
    },
    {
      title: lang === 'ja' ? '2. パスワードの暗号化とセキュリティ保護' : '2. Password Security & Cryptographic Storage',
      content: lang === 'ja'
        ? '利用者のパスワードが平文（プレーンテキスト）で保存または表示されることは決してありません。すべての認証情報は、Supabase Authの安全なクラウドインフラストラクチャを通じて、業界標準の一方向暗号化ハッシュ（ソルト付きbcryptアルゴリズム）で処理されます。制作者やデータベース管理者であっても利用者のパスワードを閲覧することは不可能です。'
        : 'Your passwords are never stored or transmitted in plaintext. All authentication credentials are encrypted using industry-standard, salted one-way cryptographic hashes (bcrypt) managed directly by Supabase Auth cloud infrastructure. Neither the platform creator nor database administrators can view or access your actual password.',
    },
    {
      title: lang === 'ja' ? '3. データの利用目的と非売却の保証' : '3. Purpose of Data Use & Zero Data Sales',
      content: lang === 'ja'
        ? '収集したデータは、利用者の学習進捗の同期、SRS間隔アルゴリズムの計算、およびグローバルリーダーボードでの順位表示にのみ使用されます。本サービスは、利用者の個人情報を広告主や第三者データブローカーに販売、貸与、または商業的に譲渡することは一切ありません。'
        : 'Your data is used exclusively to synchronize your study progress across devices, calculate personalized Spaced Repetition schedules, and render leaderboard rankings. We do not sell, rent, monetize, or disclose personal user data to advertisers or third-party brokers under any circumstances.',
    },
    {
      title: lang === 'ja' ? '4. 第三者クラウド基盤の利用' : '4. Trusted Third-Party Infrastructure',
      content: lang === 'ja'
        ? '本プラットフォームは、信頼性の高いエンタープライズクラウドプロバイダーを利用してホストされています：認証およびデータベース管理のためのSupabase、エッジ配信およびウェブホスティングのためのVercel、および匿名のパフォーマンス監視のためのSentry。各プロバイダーは独立した高水準のセキュリティ基準に準拠しています。'
        : 'Otakufy is hosted using enterprise-grade cloud providers: Supabase for managed database and authentication services, Vercel for global edge CDN delivery and hosting, and Sentry for anonymous application error diagnostics. Each provider maintains strict independent data protection certifications.',
    },
    {
      title: lang === 'ja' ? '5. ローカルストレージとクッキーの利用' : '5. Cookies & Local Storage',
      content: lang === 'ja'
        ? '本プラットフォームは、トラッキング広告用のクッキーは使用しません。ブラウザのローカルストレージ（localStorage）は、利用者のUIテーマ設定（秋・桜モード、ライト・ダーク切り替え）、音声ボリューム、およびセッション維持のための認証トークン（JWT）の保存にのみ利用されます。'
        : 'We do not employ third-party advertising or tracking cookies. Browser local storage (localStorage) is utilized strictly for interface preferences (such as Light and Dark theme selections, seasonal animations, and audio volume toggles) and secure authentication session tokens (JWTs) to keep you logged in.',
    },
    {
      title: lang === 'ja' ? '6. アカウントおよびデータの削除権' : '6. Data Retention & Account Deletion',
      content: lang === 'ja'
        ? '利用者はいつでも自身のアカウントおよび関連するすべての学習履歴の完全な削除を要求する権利を有します。設定画面またはサポートを通じて要請が行われた場合、データベースから速やかにデータが完全に消去されます。'
        : 'You retain full ownership of your data and have the right to delete your account and all associated study telemetry at any time via your account settings or by submitting a deletion request.',
    },
  ];

  return (
    <PageContainer maxWidth="max-w-4xl" className="flex flex-col gap-8 w-full pb-20">
      {/* Header */}
      <SmoothFade delay={0.05} className="flex flex-col items-start gap-3 border-b border-[var(--strong-border)] pb-6">
        <Link 
          href="/"
          className="text-[12px] font-mono text-[var(--muted-text)] hover:text-[var(--theme-color)] transition-colors flex items-center gap-1.5"
        >
          <span>&larr;</span> {t("Back to Dashboard", "Back to Dashboard")}
        </Link>
        <h1 className="text-3xl md:text-4xl font-serif font-bold tracking-tight text-[var(--foreground)]">
          <RevealText text={lang === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'} delay={0.1} />
        </h1>
        <p className="text-[13px] text-[var(--muted-text)] font-sans">
          {lang === 'ja' 
            ? '制定日: 2026年9月 · Otakufy データ保護基準' 
            : 'Effective Date: September 2026 · Otakufy Data Protection Standards'}
        </p>
      </SmoothFade>

      {/* Security Reassurance Box */}
      <SmoothFade delay={0.15}>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--strong-border)] text-[13px] leading-relaxed text-[var(--foreground)] flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--theme-color)]/15 text-[var(--theme-color)] flex items-center justify-center shrink-0 font-bold text-sm">
            ✓
          </div>
          <div>
            <p className="font-semibold mb-0.5">
              {lang === 'ja' ? '安心のデータプライバシー' : 'Transparent & Secure'}
            </p>
            <p className="text-[var(--muted-text)]">
              {lang === 'ja'
                ? 'Otakufyは広告やデータ販売を行わない、純粋な学習者向けプラットフォームです。パスワードは暗号化され、安全に保管されます。'
                : 'Otakufy does not serve ads or sell personal data. Passwords are salted, cryptographically hashed, and managed exclusively via secure cloud infrastructure.'}
            </p>
          </div>
        </div>
      </SmoothFade>

      {/* Sections */}
      <div className="flex flex-col gap-6">
        {sections.map((section, idx) => (
          <SmoothFade key={idx} delay={0.2 + idx * 0.05}>
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--strong-border)] space-y-2">
              <h2 className="text-lg font-serif font-semibold text-[var(--foreground)]">
                {section.title}
              </h2>
              <p className="text-[13px] leading-relaxed text-[var(--muted-text)] font-sans">
                {section.content}
              </p>
            </div>
          </SmoothFade>
        ))}
      </div>

      {/* Footer Navigation */}
      <SmoothFade delay={0.6} className="pt-6 border-t border-[var(--strong-border)] flex justify-between items-center text-[12px] text-[var(--muted-text)]">
        <Link href="/terms" className="hover:text-[var(--theme-color)] transition-colors underline">
          {lang === 'ja' ? '利用規約を見る &rarr;' : 'View Terms of Service &rarr;'}
        </Link>
        <Link href="/help" className="hover:text-[var(--theme-color)] transition-colors underline">
          {lang === 'ja' ? 'ヘルプ & FAQ' : 'Help & FAQ'}
        </Link>
      </SmoothFade>
    </PageContainer>
  );
}
