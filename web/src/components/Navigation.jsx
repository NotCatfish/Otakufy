"use client";

import React, { useState, useEffect } from "react";
import TransitionLink from "./TransitionLink";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { useLanguage } from "@/context/LanguageContext";
import UserMenu from '@/features/auth/frontend/UserMenu';
import SmoothFade from "./SmoothFade";
import RevealText from "./RevealText";
import AnimatedLogo from "./AnimatedLogo";
import { useTransitionContext } from '@/context/TransitionContext';

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/dictionary", label: "Dictionary" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/suggestions", label: "Suggestions" },
  { href: "/settings", label: "Settings" }
];

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { t } = useLanguage();
  const transitionContext = useTransitionContext();
  const isExiting = transitionContext ? transitionContext.isExiting : false;

  useEffect(() => {
    const hasAnimated = sessionStorage.getItem('navAnimated');
    if (!hasAnimated) {
      setIsInitialLoad(true);
      sessionStorage.setItem('navAnimated', 'true');
    } else {
      setIsInitialLoad(false);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    // If the user clicks a link and triggers an exit transition, permanently disable initial load animations 
    // for the navigation bar so it stays fixed and doesn't participate in exit/re-entrance animations.
    if (isExiting && isInitialLoad) {
      setIsInitialLoad(false);
    }
  }, [isExiting, isInitialLoad]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        e.preventDefault();
        e.stopImmediatePropagation();
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  if (!mounted) return null;

  return (
    <nav 
      className="sticky top-0 z-50 text-[var(--foreground)] dark:text-white backdrop-blur-xl py-3.5 font-light w-full transition-all duration-500 bg-[rgba(255,255,255,0.08)] border-b border-[rgba(var(--theme-rgb),0.3)] shadow-[0_16px_40px_rgba(var(--theme-rgb),0.15)] dark:bg-black/90 dark:border-[var(--divider)] dark:shadow-none"
    >
      <SmoothFade as="div" delay={0.2} disabled={!isInitialLoad} className="flex justify-between items-center max-w-[1440px] w-[95%] mx-auto gap-4">
        {/* Far Left: Otakufy Logo & Core Links */}
        <div className="flex items-center gap-8 sm:gap-10">
          <TransitionLink href="/" className="min-h-[44px] flex items-center shrink-0">
            <AnimatedLogo className="font-serif font-black text-[22px] tracking-widest inline-block relative py-1">
              Otakufy
            </AnimatedLogo>
          </TransitionLink>

          {/* Desktop Main Navigation */}
          <div className="hidden md:flex gap-6 lg:gap-8 text-[13px] font-serif items-center">
            {NAV_LINKS.map(link => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
              return (
                <TransitionLink 
                  key={link.href} 
                  href={link.href} 
                  className={`transition-colors py-1 relative ${
                    isActive ? "text-[var(--foreground)] font-medium" : "text-[var(--muted-text)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <RevealText text={t(link.label)} baseDelay={1.6 + (0.2 * NAV_LINKS.indexOf(link))} disabled={!isInitialLoad} />
                  {isActive && (
                    <span 
                      className={`absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--foreground)] rounded-full origin-center ${(!isInitialLoad || transitionContext?.disableUiAnim) ? '' : 'animate-expand-line'}`} 
                      style={(!isInitialLoad || transitionContext?.disableUiAnim) ? { opacity: 1 } : { animationDelay: `${2.4 + (0.2 * NAV_LINKS.indexOf(link))}s`, opacity: 0, animationFillMode: 'forwards' }} 
                    />
                  )}
                </TransitionLink>
              );
            })}
          </div>
        </div>

        {/* Far Right: Theme Controls & Profile Icon Dropdown */}
        <div className="flex items-center gap-2.5 sm:gap-4 ml-auto">
          <LanguageToggle />
          <ThemeToggle />
          <UserMenu />

          {/* Hamburger Menu Button for Mobile (< 768px) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden min-w-[44px] min-h-[44px] p-2.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 flex flex-col justify-center items-center gap-1.5 transition-all text-white"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
          >
            <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current transition-opacity duration-300 ${mobileMenuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-current transition-transform duration-300 ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>
      </SmoothFade>

      {/* Mobile Drawer (< 768px) */}
      {mobileMenuOpen && (
        <div data-modal="true" role="dialog" className="md:hidden pt-4 pb-6 mt-3 border-t border-white/10 flex flex-col gap-2 animate-fade-in font-serif">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname?.startsWith(link.href));
            return (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={`min-h-[44px] px-4 py-3 rounded-xl text-[15px] flex items-center justify-between transition-colors ${
                  isActive 
                    ? "bg-[var(--foreground)] text-[var(--background)] font-medium border border-[var(--foreground)]" 
                    : "text-[var(--muted-text)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--foreground)]"
                }`}
              >
                <span>{t(link.label)}</span>
                {isActive && <span className="text-xs bg-white text-black font-sans px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">{t("Active")}</span>}
              </TransitionLink>
            );
          })}
        </div>
      )}
    </nav>
  );
}
