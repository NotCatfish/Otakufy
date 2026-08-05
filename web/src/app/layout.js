import { Noto_Serif_JP, Noto_Sans_JP, Geist_Mono } from "next/font/google";

import "./globals.css";
import Navigation from "@/components/Navigation";
import GlobalKeyHandler from "@/components/GlobalKeyHandler";
import { LanguageProvider } from "@/context/LanguageContext";

import DynamicSeasonalAnimation from "@/components/DynamicSeasonalAnimation";

const notoSerif = Noto_Serif_JP({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "700", "900"],
});

const notoSans = Noto_Sans_JP({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://otakufy.app'),
  title: {
    default: "Otakufy | Master Japanese with SRS & Gamified Learning",
    template: "%s | Otakufy",
  },
  description: "Gamified Japanese learning platform featuring Spaced Repetition System (SRS) flashcards, JLPT dictionary, live leaderboards, and custom decks.",
  keywords: ["Japanese learning", "JLPT", "Kanji study", "SRS flashcards", "Japanese dictionary", "learn Hiragana", "learn Katakana", "Otakufy"],
  authors: [{ name: "Otakufy Team" }],
  creator: "Otakufy",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Otakufy",
    title: "Otakufy | Master Japanese with SRS & Gamified Learning",
    description: "Level up your Japanese proficiency with gamified SRS flashcards, JLPT vocabulary, live leaderboards, and interactive quizzes.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Otakufy - Gamified Japanese Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Otakufy | Master Japanese with SRS & Gamified Learning",
    description: "Level up your Japanese proficiency with gamified SRS flashcards, JLPT vocabulary, live leaderboards, and interactive quizzes.",
    images: ["/opengraph-image"],
    creator: "@otakufy",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon",
  },
  manifest: "/manifest.json",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { TransitionProvider } from "@/context/TransitionContext";

import EmailVerificationCloser from "@/components/EmailVerificationCloser";
import Footer from "@/components/Footer";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${notoSans.variable} ${geistMono.variable} font-serif h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var root = document.documentElement;
                  var month = new Date().getMonth() + 1;
                  var seasonClass = "";
                  if (month >= 3 && month <= 5) seasonClass = "theme-spring";
                  else if (month === 6) seasonClass = "theme-early-summer";
                  else if (month === 7 || month === 8) seasonClass = "theme-late-summer";
                  else if (month >= 9 && month <= 11) seasonClass = "theme-autumn";
                  else seasonClass = "theme-winter";
                  
                  if (seasonClass && seasonClass !== "theme-spring") {
                    root.classList.add(seasonClass);
                  }

                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    root.classList.remove('dark');
                  } else {
                    root.classList.add('dark');
                  }

                  var userId = 'guest';
                  for (var i = 0; i < localStorage.length; i++) {
                    var k = localStorage.key(i);
                    if (k && k.indexOf('sb-') === 0 && k.indexOf('-auth-token') > 0) {
                      try {
                        var session = JSON.parse(localStorage.getItem(k));
                        if (session && session.user && session.user.id) {
                          userId = session.user.id;
                        }
                      } catch(e) {}
                    }
                  }
                  var animKey = 'otakufy_disable_ui_anim_' + userId;
                  var animVal = localStorage.getItem(animKey);
                  if (animVal === null) animVal = localStorage.getItem('otakufy_disable_ui_anim');
                  
                  if (animVal === 'true') {
                    root.classList.add('reduce-motion');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col mb-bg text-[var(--foreground)] transition-colors" suppressHydrationWarning>
        <LanguageProvider>
          <TransitionProvider>
            <EmailVerificationCloser />
            <Navigation />
            
            <DynamicSeasonalAnimation />
            {/* Main Content */}
            <main className="flex-1 w-full mx-auto relative z-10">
              <GlobalKeyHandler />
              {children}
            </main>

            <Footer />
          </TransitionProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
