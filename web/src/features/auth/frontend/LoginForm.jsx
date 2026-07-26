"use client";

import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import PasswordChecklist, { isPasswordValid } from './PasswordChecklist';
import { useLanguage } from '@/context/LanguageContext';
import { EyeOpenIcon, EyeClosedIcon, GoogleIcon, AlertError, AlertSuccess } from './AuthUIHelpers';

export default function LoginForm() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regStatus, setRegStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [authMode, setAuthMode] = useState('');

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.location.href = '/profile?reset=true';
      }
    });
    if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
      window.location.href = '/profile?reset=true';
    }
    return () => authListener?.subscription?.unsubscribe();
  }, []);

  const handleAuth = async (isLogin) => {
    setAuthMode(isLogin ? 'login' : 'register');
    setLoading(true);
    setMessage('');
    setErrorMsg('');
    setRegStatus(null);
    try {
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL') {
        console.warn("Auth Terminal Log: Supabase credentials not configured in .env yet.");
        setErrorMsg("Supabase configuration is missing or incomplete.");
        return;
      }

      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.warn("Auth Terminal Log [Login Error]:", error);
          const msg = error.message?.toLowerCase() || '';
          if (msg.includes('confirm') || msg.includes('verified')) {
            setErrorMsg("Your email address is not verified yet. Please check your inbox or spam folder to confirm before logging in.");
          } else {
            setErrorMsg("Invalid email or password. Please double-check your credentials.");
          }
          return;
        }
        setMessage("Login successful! Redirecting to your dashboard...");
        setTimeout(() => {
          window.location.href = '/';
        }, 1000);
      } else {
        if (!isPasswordValid(password)) {
          setErrorMsg("Please satisfy all green password requirements shown below before registering.");
          setLoading(false);
          return;
        }
        const emailHandle = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || 'User';
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              username: emailHandle
            }
          }
        });
        
        if (error) {
          console.warn("Auth Terminal Log [Registration Error]:", error);
          if (error.status === 429 || error.message?.toLowerCase().includes('rate limit')) {
            setErrorMsg("Security rate limit reached. Please wait a moment before trying again, or check your inbox if you recently requested a code.");
          } else {
            setErrorMsg(error.message || "Could not complete registration right now.");
          }
          return;
        }

        if (data?.session) {
          setMessage("Registration successful! Redirecting to your dashboard...");
          setTimeout(() => {
            window.location.href = '/';
          }, 1000);
        } else {
          setRegStatus({ email });
        }
      }
    } catch (error) {
      console.warn("Auth Terminal Log [Exception]:", error);
      if (isLogin) {
        setErrorMsg("Invalid email or password. Please double-check your credentials.");
      } else {
        setErrorMsg("Could not process registration request right now.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: 'select_account',
          },
        }
      });
      if (error) console.warn("Auth Terminal Log [Google OAuth]:", error);
    } catch (err) {
      console.warn("Auth Terminal Log [Google OAuth Exception]:", err);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail || !resetEmail.includes('@')) {
      setMessage('Please enter a valid account email address below.');
      return;
    }
    setLoading(true);
    setMessage('Sending recovery email...');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: `${window.location.origin}/profile?reset=true`
      });
      if (error) console.warn("Auth Terminal Log [Recovery Error]:", error);
      setMessage('Recovery email dispatched. Check your inbox to reset your password.');
      setShowForgotPassword(false);
    } catch (err) {
      console.warn("Auth Terminal Log [Recovery Exception]:", err);
      setMessage('Recovery email dispatched. Check your inbox to reset your password.');
      setShowForgotPassword(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 border border-[var(--strong-border)] bg-[var(--surface)] rounded-2xl max-w-sm w-full mx-auto space-y-6 text-white font-medium shadow-xl">
      <div className="text-center">
        <h2 className="text-2xl font-semibold tracking-tight text-white">{t("Gateway")}</h2>
        <p className="text-[12px] text-white/50 uppercase tracking-[0.2em] mt-1">{t("Identify Yourself")}</p>
      </div>

      {!showForgotPassword ? (
        <>
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1">{t("Email Address")}</label>
              <input 
                type="email" 
                placeholder="you@domain.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-medium uppercase tracking-wider text-white/50">{t("Password")}</label>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetEmail(email);
                    setMessage('');
                  }}
                  className="text-[11px] text-white/50 hover:text-white transition-colors"
                >
                  {t("Forgot Password?")}
                </button>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-white/40 hover:text-white transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              <PasswordChecklist password={password} />
            </div>
          </div>

          {loading && authMode === 'register' && !regStatus ? (
            <div className="space-y-3 p-4 rounded-2xl border bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-lg animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                <div className="font-semibold text-sm tracking-wide text-white">{t("Generating Verification Mail...")}</div>
              </div>
              <p className="text-xs text-amber-200/80 leading-relaxed">
                {t("Please hold on for just a second! We are communicating with Brevo's secure SMTP servers right now to generate and dispatch your confirmation link.")}
              </p>
            </div>
          ) : loading && authMode === 'login' ? (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl border bg-cyan-950/40 border-cyan-500/40 text-cyan-300 shadow-lg animate-pulse text-xs font-medium">
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <span>{t("Verifying account credentials & logging in...")}</span>
            </div>
          ) : regStatus ? (
            <div className="space-y-3.5 p-4 rounded-2xl border bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-lg animate-fade-in">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
                <div className="font-semibold text-sm tracking-wide text-white">{t("Email Dispatched Successfully!")}</div>
              </div>
              <div className="text-xs text-emerald-200/90 leading-relaxed space-y-2">
                <p>We've successfully sent your verification link to <span className="font-semibold text-white">{regStatus.email}</span>.</p>
                <div className="p-2.5 bg-black/40 rounded-xl border border-emerald-500/20 text-[11px] text-emerald-300/90 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-medium text-emerald-200">
                    <span className="text-emerald-400">✓</span> Account created in secure Supabase database
                  </div>
                  <div className="flex items-center gap-1.5 font-medium text-emerald-200">
                    <span className="text-emerald-400">✓</span> Verification mail dispatched via Brevo mail server
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-300/90 font-medium pt-0.5 border-t border-white/5">
                    <span>💡</span> Check your Spam / Promotions folder if not in Primary inbox!
                  </div>
                </div>
              </div>
            </div>
          ) : errorMsg ? (
            <AlertError message={errorMsg} />
          ) : message ? (
            <AlertSuccess message={message} />
          ) : null}

          <div className="flex gap-4 pt-2">
            <button 
              onClick={() => handleAuth(true)} 
              disabled={loading}
              className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-semibold tracking-wide hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {loading ? "..." : t("Login")}
            </button>
            <button 
              onClick={() => handleAuth(false)} 
              disabled={loading}
              className="flex-1 bg-transparent border border-[var(--strong-border)] py-3 rounded-xl text-sm font-semibold tracking-wide hover:bg-white/5 transition-colors disabled:opacity-50 text-white"
            >
              {t("Register")}
            </button>
          </div>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center pt-4">
              <div className="w-full border-t border-[var(--strong-border)]"></div>
            </div>
            <div className="relative flex justify-center pt-4 text-xs">
              <span className="bg-[var(--surface)] px-3 text-white/50 uppercase tracking-widest font-medium">{t("Or")}</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[var(--surface)] border border-[var(--strong-border)] py-3 rounded-xl text-sm font-semibold text-white hover:bg-[var(--surface-hover)] transition-colors"
          >
            <GoogleIcon />
            {t("Continue with Google")}
          </button>
        </>
      ) : (
        <form onSubmit={handleForgotPassword} className="space-y-4 animate-fade-in">
          <div className="p-3 bg-[var(--surface)] border border-[var(--strong-border)] rounded-xl text-[13px] text-white/70">
            {t("Enter your account email below. We will send a secure recovery link so you can reset your password immediately.")}
          </div>
          <div>
            <label className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1">{t("Account Email")}</label>
            <input 
              type="email" 
              required
              placeholder="you@domain.com" 
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
            />
          </div>

          {message && <AlertSuccess message={message} />}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-white text-black py-3 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {loading ? "..." : t("Send Recovery Link")}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForgotPassword(false);
                setMessage('');
              }}
              className="px-5 border border-[var(--strong-border)] py-3 rounded-xl text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors"
            >
              {t("Back")}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
