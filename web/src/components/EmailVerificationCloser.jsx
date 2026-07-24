"use client";

import { useEffect, useState } from "react";

export default function EmailVerificationCloser() {
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if the URL hash contains the email change token or confirmation message
    const hash = window.location.hash;
    if (hash && (hash.includes("type=email_change") || hash.includes("message=Confirmation") || hash.includes("message="))) {
      setIsVerifying(true);
      
      // Give Supabase a split second to parse the token
      setTimeout(() => {
        try {
          window.close();
        } catch(e) {}
        
        // If window.close is blocked, just dismiss the overlay and let them see the site
        setIsVerifying(false);
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, 300);
    }
  }, []);

  if (!isVerifying) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#090b10] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 border-4 border-[var(--strong-border)] border-t-emerald-400 rounded-full animate-spin mb-8"></div>
      <h1 className="text-2xl font-bold text-white mb-2">Email Verified Successfully!</h1>
      <p className="text-white/60 mb-8 max-w-md">
        Your email change has been securely confirmed. This tab will close automatically.
      </p>
      <button 
        onClick={() => {
          try { window.close(); } catch(e) {}
          setIsVerifying(false); // If window.close fails, just dismiss the overlay
          // Also remove the hash so it doesn't trigger again on refresh
          if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.pathname);
          }
        }}
        className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold uppercase tracking-wider rounded-xl transition-colors shadow-lg"
      >
        Continue to Site
      </button>
    </div>
  );
}
