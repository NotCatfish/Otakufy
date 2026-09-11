"use client";

import React from 'react';
import Link from 'next/link';
import PageContainer from '@/components/PageContainer';
import SmoothFade from '@/components/SmoothFade';
import RevealText from '@/components/RevealText';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsPage() {
  const { lang, t } = useLanguage();

  const sections = [
    {
      title: lang === 'ja' ? '1. 規約への同意' : '1. Acceptance of Terms',
      content: lang === 'ja'
        ? 'Otakufy（以下「本プラットフォーム」）にアクセス、閲覧、またはアカウントを登録することにより、利用者は本利用規約に拘束されることに同意したものとみなされます。本規約に同意いただけない場合は、直ちに本プラットフォームの利用を中止してください。'
        : 'By accessing, browsing, or creating an account on Otakufy, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree to these terms, you must immediately discontinue all use of the platform.',
    },
    {
      title: lang === 'ja' ? '2. プラットフォームの性質と「現状有姿（AS-IS）」提供' : '2. Educational Purpose & "AS-IS" Provision',
      content: lang === 'ja'
        ? '本プラットフォームは、個人の日本語学習、間隔反復（SRS）練習、およびポートフォリオ実証を目的として構築された教育用ソフトウェアです。本サービスは「現状有姿（AS-IS）」かつ「提供可能な範囲（AS-AVAILABLE）」において提供され、商品性、特定目的への適合性、権利の非侵害性を含むいかなる明示または黙示の保証も行いません。'
        : 'Otakufy is an independent educational language-learning platform provided for personal study, Spaced Repetition (SRS) practice, and portfolio demonstration purposes. The platform is provided strictly on an "AS-IS" and "AS-AVAILABLE" basis, without warranties of any kind, whether express, implied, or statutory, including warranties of merchantability, fitness for a particular purpose, or non-infringement.',
    },
    {
      title: lang === 'ja' ? '3. アカウントおよび認証情報の自己責任管理' : '3. Account Security & Credential Safeguarding',
      content: lang === 'ja'
        ? '利用者は、本プラットフォームに登録したメールアドレスおよびパスワードを含む認証情報の機密性と安全性を維持する全責任を負います。認証サービスはエンタープライズ水準のクラウド基盤（Supabase Auth）を通じて暗号化処理されますが、利用者は強固で他サイトと重複しない独自のパスワードを設定することを強く推奨します。'
        : 'You are solely responsible for maintaining the confidentiality and security of your account login credentials, including your email address and password. Authentication is encrypted and processed through third-party cloud infrastructure (Supabase Auth). You are strongly advised to use a strong, unique password not shared with any other services. You agree to notify us immediately of any suspected unauthorized access to your account.',
    },
    {
      title: lang === 'ja' ? '4. 責任の制限（免責事項）' : '4. Limitation of Liability',
      content: lang === 'ja'
        ? '適用法令の許す最大限において、作成者および運営者は、本プラットフォームの利用または利用不能に起因するいかなる損害（データの消失、学習記録のリセット、不正アクセス、第三者による認証情報の悪用、サービスの中断、サーバーの停止等）に対しても一切の責任を負いません。利用者は、自己の責任において本サービスを利用することに明示的に同意するものとします。'
        : 'To the maximum extent permitted by applicable law, the creator and operator of Otakufy shall not be liable for any direct, indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of data, progress resets, account compromise, unauthorized access resulting from credential reuse, server downtime, or service interruptions. You expressly agree that your use of the platform is at your sole risk.',
    },
    {
      title: lang === 'ja' ? '5. 適切な利用規律' : '5. Acceptable Use Policy',
      content: lang === 'ja'
        ? '利用者は、本プラットフォームに対する過度なリクエスト負荷、自動スクレイピング、脆弱性の悪用、サービスの妨害行為、リバースエンジニアリング、または不正なデータ取得を行わないことに同意します。運営者は、不正利用が認められたアカウントを予告なく停止する権利を有します。'
        : 'You agree not to misuse the platform, attempt automated scraping, launch denial-of-service attacks, reverse engineer application endpoints, or exploit security vulnerabilities. The operator reserves the right to suspend or terminate accounts that violate this policy.',
    },
    {
      title: lang === 'ja' ? '6. 知的財産権と学習素材' : '6. Intellectual Property & Linguistic Data',
      content: lang === 'ja'
        ? '本プラットフォームのUIデザイン、インタラクティブ機能、およびソースコードは制作者に帰属します。収録されているJLPT辞書データおよび日本語ボキャブラリは、EDRDG（JMdict/KANJIDIC）等のオープンライセンスリソースに基づいています。'
        : 'The platform interface, custom algorithms, and gamification design are the property of the creator. Japanese vocabulary entries, JLPT reference data, and linguistic definitions are utilized pursuant to open community licenses (including EDRDG JMdict and KANJIDIC datasets).',
    },
    {
      title: lang === 'ja' ? '7. 規約の変更とサービス終了' : '7. Modifications & Termination',
      content: lang === 'ja'
        ? '運営者は、独自の裁量により本規約またはサービス内容を随時更新、修正、または終了する権利を留保します。継続して本プラットフォームを利用した場合、変更後の規約に同意したものとみなされます。'
        : 'The operator reserves the right to revise these terms or suspend the platform at any time without prior notice. Continued use of Otakufy following any modifications constitutes your acceptance of the updated terms.',
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
          <RevealText text={lang === 'ja' ? '利用規約' : 'Terms of Service'} delay={0.1} />
        </h1>
        <p className="text-[13px] text-[var(--muted-text)] font-sans">
          {lang === 'ja' 
            ? '制定日: 2026年9月 · Otakufy 教育プラットフォーム' 
            : 'Effective Date: September 2026 · Otakufy Educational Platform'}
        </p>
      </SmoothFade>

      {/* Overview Notice */}
      <SmoothFade delay={0.15}>
        <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--strong-border)] text-[13px] leading-relaxed text-[var(--foreground)]">
          <p className="font-semibold mb-1">
            {lang === 'ja' ? '概要とご利用にあたって' : 'Summary & Notice'}
          </p>
          <p className="text-[var(--muted-text)]">
            {lang === 'ja'
              ? 'Otakufyは日本語学習者のための非営利・教育目的のウェブアプリケーションです。安全かつ快適な学習環境を維持するため、本利用規約をよくお読みください。'
              : 'Otakufy is an independent, non-commercial educational web application designed for Japanese language learners. Please review these terms carefully to understand your rights and responsibilities.'}
          </p>
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
        <Link href="/privacy" className="hover:text-[var(--theme-color)] transition-colors underline">
          {lang === 'ja' ? 'プライバシーポリシーを見る &rarr;' : 'View Privacy Policy &rarr;'}
        </Link>
        <Link href="/help" className="hover:text-[var(--theme-color)] transition-colors underline">
          {lang === 'ja' ? 'ヘルプ & FAQ' : 'Help & FAQ'}
        </Link>
      </SmoothFade>
    </PageContainer>
  );
}
