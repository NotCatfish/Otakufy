"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GlobalKeyHandler() {
    const router = useRouter();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (e.defaultPrevented) return;

                // If any modal, dialog, drawer, or active dropdown overlay is currently open in the DOM, do not navigate away
                if (document.querySelector('[data-modal="true"]') || document.querySelector('[role="dialog"]') || document.querySelector('[data-dropdown="true"]')) {
                    return;
                }

                if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                    document.activeElement.blur();
                    return;
                }

                // Do not navigate back if already on the dashboard, login page, or inside practice/quiz screens
                if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/login' || window.location.pathname.startsWith('/practice'))) {
                    return;
                }

                router.back();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    return null;
}
