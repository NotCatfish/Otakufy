"use client";

import { useEffect, useState } from 'react';
import { supabase } from '../../auth/frontend/supabaseClient';
import ProfileRepository from '../repositories/ProfileRepository';
import DefaultAvatar from './DefaultAvatar';
import { calculateLevelStats } from '../utils/levelUtils';
import PasswordChecklist, { isPasswordValid } from '../../auth/frontend/PasswordChecklist';
import { useLanguage } from '@/context/LanguageContext';
import { EyeOpenIcon, EyeClosedIcon, AlertError, AlertSuccess } from '../../auth/frontend/AuthUIHelpers';

export default function ProfileSettings() {
  const { t } = useLanguage();
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState('');
  const [privacySetting, setPrivacySetting] = useState('public');
  const [message, setMessage] = useState('');
  const [showEmail, setShowEmail] = useState(false);
  const [showEmailChangeForm, setShowEmailChangeForm] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [emailStatusMessage, setEmailStatusMessage] = useState('');
  const [changingEmail, setChangingEmail] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session: localSession } } = await supabase.auth.getSession();
      
      let currentSession = localSession;
      if (localSession) {
        // Silently refresh to get latest JWT claims (fixes stale email bug if verified in another tab)
        const { data: { session: freshSession } } = await supabase.auth.refreshSession();
        currentSession = freshSession || localSession;
      }
      
      setSession(currentSession);
      
      if (currentSession) {
        const { data } = await ProfileRepository.getById(currentSession.user.id);
        
        if (data) {
          setProfile(data);
          setUsername(data.username || '');
          setPrivacySetting(data.privacy_setting || 'public');
        }
      }
      setLoading(false);
    };

    fetchProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (typeof window !== 'undefined' && window.location.search.includes('reset=true'))) {
        setIsResetMode(true);
      }
      if (session) {
        setSession(session);
      }
    });

    if (typeof window !== 'undefined' && window.location.search.includes('reset=true')) {
      setIsResetMode(true);
    }

    if (typeof window !== 'undefined' && window.location.search.includes('linked=true')) {
      const handleLinkedGoogle = async () => {
        const { data: { session: latestSession } } = await supabase.auth.getSession();
        if (latestSession) {
          const googleIdentity = latestSession.user?.identities?.find(i => i.provider === 'google');
          const googleEmail = googleIdentity?.identity_data?.email;
          if (googleEmail && googleEmail !== latestSession.user.email) {
            try {
              const res = await fetch('/api/change-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${latestSession.access_token}`
                },
                body: JSON.stringify({ targetEmail: googleEmail, isOAuthVerified: true })
              });
              const data = await res.json();
              if (!res.ok || !data.success) {
                throw new Error(data.error || 'Email update failed');
              }
              const { data: { session: updatedSession } } = await supabase.auth.refreshSession();
              if (updatedSession) setSession(updatedSession);
              setEmailStatusMessage(`Success! Google account linked and primary email updated to ${googleEmail} directly in database.`);
              setShowEmailChangeForm(true);
            } catch (err) {
              setEmailStatusMessage(`Google account linked (${googleEmail}). Email update note: ${err.message}`);
              setShowEmailChangeForm(true);
            }
          } else if (googleEmail) {
            setEmailStatusMessage(`Success! Google verification complete (${googleEmail}).`);
            setShowEmailChangeForm(true);
          }
          if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
      };
      handleLinkedGoogle();
    }

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleSetNewPassword = async (e) => {
    e.preventDefault();
    if (!isPasswordValid(newPasswordValue)) {
      setMessage('Password must satisfy all green criteria shown below.');
      return;
    }
    if (newPasswordValue !== confirmPasswordValue) {
      setMessage('Passwords do not match.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPasswordValue });
      if (error) throw error;
      setMessage('Success! Your password has been updated. You can now use this password across all security settings.');
      setIsResetMode(false);
      setNewPasswordValue('');
      setConfirmPasswordValue('');
      if (typeof window !== 'undefined' && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      console.error("ProfileSettings Terminal Log [Password Update]:", err);
      setMessage("Could not update password right now. Please retry shortly.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    const sanitizedUsername = username.trim().replace(/[<>]/g, '');
    if (sanitizedUsername.length > 20) {
      setMessage('Display name must be 20 characters or less.');
      return;
    }

    setSaving(true);
    setMessage('');
    
    const { error } = await ProfileRepository.update(session?.user?.id, { 
      username: sanitizedUsername, 
      privacy_setting: privacySetting 
    });

    if (error) {
      console.error("ProfileSettings Terminal Log [Profile Save]:", error);
      setMessage('Could not sync right now, please check your connection.');
    } else {
      await supabase.auth.updateUser({ data: { username: sanitizedUsername } });
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('profile_updated'));
      setMessage('Settings synchronized.');
      setTimeout(() => setMessage(''), 3000);
    }
    setSaving(false);
  };

  const handlePrivacyChange = async (value) => {
    setPrivacySetting(value);
    setMessage('Saving privacy settings...');
    
    const { error } = await ProfileRepository.update(session?.user?.id, { 
      privacy_setting: value 
    });

    if (error) {
      console.error("ProfileSettings Terminal Log [Privacy Save]:", error);
      setMessage('Could not update privacy setting, please retry.');
    } else {
      setMessage('Privacy settings synchronized.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const isOAuthUser = session?.user?.app_metadata?.provider === 'google' || session?.user?.app_metadata?.providers?.includes('google');

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!newEmail || !emailRegex.test(newEmail)) {
      setEmailStatusMessage('Please enter a validly formatted email address (must include @ and a domain like .com, .edu, .net, etc).');
      return;
    }
    if (newEmail.trim() === session?.user?.email) {
      setEmailStatusMessage('Please enter an email different from your current account email.');
      return;
    }
    if (!isOAuthUser && !currentPassword) {
      setEmailStatusMessage('Please enter your current password to confirm.');
      return;
    }

    setChangingEmail(true);

    try {
      if (!isOAuthUser && currentPassword) {
        setEmailStatusMessage('Authenticating current credentials...');
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: session?.user?.email,
          password: currentPassword
        });

        if (authError) {
          throw new Error('Authentication failed. Incorrect current password.');
        }
      }

      setEmailStatusMessage('Generating & dispatching confirmation link to your new address...');
      const res = await fetch('/api/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetEmail: newEmail.trim() })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update email address.');
      }

      setEmailStatusMessage(data.message || 'Success! Email change processed.');
      setNewEmail('');
      setCurrentPassword('');

      // Refresh session right away so the UI reflects the new email address
      const { data: { session: updatedSession } } = await supabase.auth.refreshSession();
      if (updatedSession) {
        setSession(updatedSession);
      } else {
        const { data: { session: latestSession } } = await supabase.auth.getSession();
        if (latestSession) setSession(latestSession);
      }
    } catch (err) {
      console.log("ProfileSettings [Change Email Error]:", err.message);
      setEmailStatusMessage(err.message || "Could not update email right now. Please verify your password and retry.");
    } finally {
      setChangingEmail(false);
    }
  };

  const handleForgotPasswordRecovery = async () => {
    if (!session?.user?.email) return;
    setChangingEmail(true);
    setEmailStatusMessage('Sending password recovery link to your current email...');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(session.user.email, {
        redirectTo: `${window.location.origin}/profile?reset=true`
      });
      if (error) throw error;
      setEmailStatusMessage('Recovery link sent! Check your current inbox to reset your password.');
    } catch (err) {
      console.error("ProfileSettings Terminal Log [Password Recovery]:", err);
      setEmailStatusMessage("Recovery link sent! Check your current inbox to reset your password.");
    } finally {
      setChangingEmail(false);
    }
  };

  const handleGoogleLink = async () => {
    try {
      setEmailStatusMessage('Redirecting to Google to link your account...');
      const { error } = await supabase.auth.linkIdentity({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/profile?linked=true`
        }
      });
      if (error) {
        throw error;
      }
    } catch (err) {
      setEmailStatusMessage(`Error linking Google: ${err.message}`);
    }
  };

  const uploadAvatar = async (event) => {
    try {
      setUploading(true);
      setMessage('');
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];

      // Security check: Enforce file size limit (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('Security check: File size exceeds 2MB limit. Please compress your image.');
      }

      // Security check: Block SVG (prevent stored XSS) and arbitrary scripts/executables
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedMimeTypes.includes(file.type)) {
        throw new Error('Security check: Invalid image format. Only safe raster images (JPG, PNG, WEBP, GIF) are allowed. SVG and scripts are blocked.');
      }

      const fileExt = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      if (!allowedExtensions.includes(fileExt)) {
        throw new Error('Security check: File extension not permitted.');
      }

      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await ProfileRepository.uploadAvatar(filePath, file);

      if (uploadError) throw uploadError;

      const publicUrl = ProfileRepository.getAvatarPublicUrl(filePath);

      const { error: updateError } = await ProfileRepository.update(session?.user?.id, { 
        avatar_url: publicUrl 
      });

      if (updateError) throw updateError;
      
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('profile_updated'));
      setProfile({ ...profile, avatar_url: publicUrl });
      setMessage('Avatar synchronized.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("ProfileSettings Terminal Log [Avatar Upload]:", error);
      setMessage("Could not update avatar. Please ensure it is a valid image under 2MB.");
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);
      setMessage('');

      const { error } = await ProfileRepository.update(session?.user?.id, { 
        avatar_url: null 
      });

      if (error) throw error;

      await supabase.auth.updateUser({ data: { avatar_url: null } });
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('profile_updated'));
      setProfile({ ...profile, avatar_url: null });
      setMessage('Avatar removed. Default avatar restored.');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("ProfileSettings Terminal Log [Avatar Remove]:", error);
      setMessage('Could not remove avatar, please retry.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex items-center justify-center">
        <div className="w-6 h-6 border border-[var(--strong-border)] border-t-white rounded-full animate-spin"></div>
    </div>
  );
  
  if (!session) return <div className="text-center py-20 text-sm tracking-widest text-white/50">403 | UNAUTHORIZED</div>;

  const emailString = session.user.email || '';
  const maskedEmail = emailString.split('@')[0].slice(0, 3) + '****@' + emailString.split('@')[1];

  // Dynamic Level Calculation
  const { calculatedLevel, currentLevelXp, xpForNext, xpPercent, totalXp } = calculateLevelStats(profile?.xp || 0);

  return (
    <div className="font-medium text-white max-w-5xl mx-auto space-y-12 pb-16">
      {isResetMode && (
        <div className="p-8 border border-[var(--strong-border)] bg-[var(--surface)] rounded-2xl shadow-2xl animate-fade-in relative">
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-[10px] uppercase tracking-widest bg-[var(--surface-hover)] text-white border border-[var(--strong-border)] px-2.5 py-1 rounded font-semibold">Security Action Required</span>
              <h2 className="text-xl font-semibold text-white mt-3">Set or Reset Your Account Password</h2>
            </div>
            <button
              onClick={() => setIsResetMode(false)}
              className="text-white/40 hover:text-white text-sm tracking-widest uppercase transition-colors"
            >
              Dismiss
            </button>
          </div>
          <p className="text-sm text-white/70 leading-relaxed mb-6">
            {isOAuthUser
              ? "You signed in via Google OAuth. Assigning a permanent password allows you to log in with either Google or email/password and unlocks instant secure email modifications."
              : "Enter a new secure password below to complete your password recovery."}
          </p>
          <form onSubmit={handleSetNewPassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1">New Password (6+ characters)</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPasswordValue}
                  onChange={(e) => setNewPasswordValue(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={saving}
                  className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded px-4 py-2.5 pr-11 text-base sm:text-[14px] text-white focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3.5 top-3 text-white/40 hover:text-white transition-colors focus:outline-none"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
              <PasswordChecklist password={newPasswordValue} />
            </div>
            <div>
              <label className="block text-[11px] font-medium uppercase tracking-wider text-white/50 mb-1">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  placeholder="••••••••••••••••"
                  disabled={saving}
                  className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded px-4 py-2.5 pr-11 text-base sm:text-[14px] text-white focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-3 text-white/40 hover:text-white transition-colors focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                </button>
              </div>
            </div>
            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-white text-black font-semibold text-[12px] rounded hover:bg-white/90 transition-all uppercase tracking-wider disabled:opacity-50"
              >
                {saving ? 'Updating Password...' : 'Save New Password'}
              </button>
              {message && <span className="text-[12px] text-white font-medium">{message}</span>}
            </div>
          </form>
        </div>
      )}
      
      {/* Header */}
      <header className="pb-8 border-b border-[var(--strong-border)] flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-white mb-2">
            {t("Identity & Settings")}
          </h1>
          <p className="text-[14px] text-white/50">{t("Manage your public identity, account credentials, and visibility preferences.")}</p>
        </div>
        
        {/* Quick Stats */}
        <div className="flex items-center gap-8 bg-[var(--surface)] border border-[var(--strong-border)] px-6 py-3 rounded-2xl shadow-lg">
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-0.5">{t("LEVEL")}</span>
            <span className="text-2xl text-white font-bold">{calculatedLevel}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10"></div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] uppercase tracking-widest text-white/40 font-semibold mb-0.5">{t("Total XP")}</span>
            <span className="text-2xl font-mono font-bold text-white">{totalXp.toLocaleString()}</span>
          </div>
        </div>
      </header>

      {/* Main Grid: Profile Info & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Card: Public Profile & Avatar */}
        <div className="lg:col-span-7 bg-[var(--surface)] border border-[var(--strong-border)] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-8">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">{t("Public Profile & Avatar")}</h2>
            <p className="text-[13px] text-white/50">{t("Update your photo and display name across leaderboards and social hub.")}</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl">
            <div className="flex flex-col items-center shrink-0">
              <label className="relative w-24 h-24 rounded-full overflow-hidden border border-white/15 cursor-pointer bg-[var(--input-bg)] flex items-center justify-center transition-all duration-300 hover:border-white/40 group shadow-md">
                <DefaultAvatar src={profile?.avatar_url} name={username || session?.user?.email} seed={session?.user?.id} size={96} />
                
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                  <span className="text-[10px] uppercase tracking-widest font-semibold">{t("Change")}</span>
                </div>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={uploadAvatar} 
                  disabled={uploading}
                />
              </label>

              {profile?.avatar_url && (
                <button
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="mt-2 text-[10px] uppercase tracking-widest font-semibold text-white/40 hover:text-red-400 transition-colors disabled:opacity-50"
                >
                  {t("Remove Photo")}
                </button>
              )}
            </div>

            <div className="flex-1 w-full space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">{t("Display Name")}</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter display name"
                      className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-2.5 text-sm sm:text-[15px] font-medium text-white focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/30 pr-16"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 text-xs sm:text-sm font-mono font-medium pointer-events-none">
                      #{profile?.discriminator || '0000'}
                    </span>
                  </div>
                  <button 
                    onClick={handleSave}
                    disabled={saving}
                    className="px-5 py-2.5 bg-white text-black font-semibold rounded-xl text-xs uppercase tracking-wider hover:bg-white/90 transition-all duration-300 disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {saving ? "Saving..." : t("Update")}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-white/50 pt-1">
                <span>{t("Account Status:")} <strong className="text-emerald-400">{t("Active Member")}</strong></span>
                {message && (
                  <span className="font-medium text-emerald-400">
                    {typeof message === 'object' ? 'Check your email inbox for confirmation.' : message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Progression & Level Overview */}
        <div className="lg:col-span-5 bg-[var(--surface)] border border-[var(--strong-border)] rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">{t("Current Progression")}</h2>
            <p className="text-[13px] text-white/50">{t("Your active XP milestones and level target.")}</p>
          </div>

          <div className="p-5 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-widest text-white/50 font-semibold">{t("LEVEL")} {calculatedLevel}</span>
              <span className="font-mono text-sm text-white font-bold">{currentLevelXp} / {xpForNext} XP</span>
            </div>
            
            <div className="w-full bg-[var(--surface-hover)] h-2 rounded-full relative overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${xpPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-[11px] text-white/40 pt-1">
              <span>{xpPercent}% {t("Completed")}</span>
              <span className="font-semibold text-white/60">{xpForNext - currentLevelXp} XP {t("to Level")} {calculatedLevel + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Email Security Card */}
      <div className="bg-[var(--surface)] border border-[var(--strong-border)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-3 text-white mb-1">
              {t("Account Email")}
              <span className="text-[10px] bg-[var(--surface-hover)] text-white/70 border border-[var(--strong-border)] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-widest">{t("Private")}</span>
            </h2>
            <p className="text-[13px] text-white/50">{t("The primary email associated with your authentication.")}</p>
          </div>

          <div className="flex items-center gap-4 bg-[var(--card-bg)] border border-[var(--card-border)] px-5 py-2.5 rounded-xl w-full sm:w-auto justify-between sm:justify-start">
            <span className="font-mono font-medium text-sm text-white">{showEmail ? emailString : maskedEmail}</span>
            <div className="flex items-center gap-3 shrink-0">
              <button 
                onClick={() => setShowEmail(!showEmail)}
                className="text-[11px] uppercase tracking-widest font-semibold text-white/50 hover:text-white transition-colors"
              >
                {showEmail ? t('Hide') : t('Reveal')}
              </button>
              <span className="text-white/20">|</span>
              <button 
                onClick={() => {
                  setShowEmailChangeForm(!showEmailChangeForm);
                  setEmailStatusMessage('');
                }}
                className="text-[11px] uppercase tracking-widest font-semibold text-white/70 hover:text-white transition-colors"
              >
                {showEmailChangeForm ? t('Cancel') : t('Change Email')}
              </button>
            </div>
          </div>
        </div>

        {showEmailChangeForm && (
          <form onSubmit={handleChangeEmail} className="p-6 border border-[var(--strong-border)] rounded-2xl bg-[var(--card-bg)] space-y-5 animate-fade-in">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">{t("Secure Email Modification")}</h3>
              <p className="text-xs text-white/50">{t("For account security, please verify your identity before changing your registered email address.")}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-1.5">{t("New Email Address")}</label>
                <input 
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="enter.new.email@domain.com"
                  disabled={changingEmail}
                  className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
                />
              </div>

              {isOAuthUser ? (
                <div className="p-4 bg-[var(--surface)] border border-[var(--strong-border)] rounded-xl flex items-start gap-3">
                  <svg className="w-5 h-5 text-white/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-xs text-white/70 leading-relaxed">
                    You signed in via <strong className="text-white">Google OAuth</strong>. You do not need a password to update your email address. Just enter your new email above and confirm.
                  </p>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-white/50">{t("Current Password")}</label>
                    <button
                      type="button"
                      onClick={handleForgotPasswordRecovery}
                      disabled={changingEmail}
                      className="text-[11px] text-white/50 hover:text-white transition-colors"
                    >
                      {t("Forgot Password?")}
                    </button>
                  </div>
                  <input 
                    type="password"
                    required={!isOAuthUser}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••••••"
                    disabled={changingEmail}
                    className="w-full bg-[var(--input-bg)] border border-[var(--strong-border)] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[var(--divider)] transition-colors placeholder:text-white/20"
                  />
                </div>
              )}
            </div>

            <div className="pt-2 space-y-3">
              {changingEmail ? (
                <div className="flex items-center gap-3 p-3.5 rounded-xl border bg-amber-950/40 border-amber-500/40 text-amber-300 shadow-md animate-pulse text-xs font-medium">
                  <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
                  <span>{emailStatusMessage || 'Generating & dispatching verification link...'}</span>
                </div>
              ) : emailStatusMessage ? (
                emailStatusMessage.toLowerCase().includes('could not') || emailStatusMessage.toLowerCase().includes('please enter') || emailStatusMessage.toLowerCase().includes('failed') || emailStatusMessage.toLowerCase().includes('error') ? (
                  <AlertError message={emailStatusMessage} />
                ) : (
                  <div className="space-y-2 p-3.5 rounded-xl border bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-sm animate-fade-in text-xs leading-relaxed">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span className="text-emerald-400">✓</span> {emailStatusMessage.includes('Sent!') ? 'Verification Mail Dispatched!' : 'Update Successful!'}
                    </div>
                    {emailStatusMessage.includes('Check your') ? (
                      <div className="text-emerald-200/90 space-y-2 mt-2 bg-black/20 p-3 rounded-lg border border-white/5">
                        <p className="font-medium text-emerald-100">To securely complete this change, follow these exact steps:</p>
                        <ol className="list-decimal list-inside space-y-1.5 ml-1">
                          <li>Click the confirmation link sent to your <strong className="text-white">current</strong> email.</li>
                          <li>Click the confirmation link sent to your <strong className="text-white">new</strong> email.</li>
                          <li>Wait a few seconds for the changes to fully apply.</li>
                        </ol>
                      </div>
                    ) : (
                      <p className="text-emerald-200/90">{emailStatusMessage}</p>
                    )}
                    {emailStatusMessage.includes('Check your') && (
                      <div className="text-[11px] text-amber-300/90 font-medium pt-1 border-t border-white/5 flex items-center gap-1.5">
                        <span>💡</span> Don't forget to check your Spam / Promotions folder!
                      </div>
                    )}
                  </div>
                )
              ) : null}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={changingEmail}
                className="px-6 py-2.5 bg-white text-black font-semibold text-xs rounded-xl hover:bg-white/90 transition-all disabled:opacity-50 tracking-wider uppercase ml-auto shadow-sm"
              >
                {changingEmail ? 'Processing...' : 'Confirm New Email'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Privacy & Visibility Card */}
      <div className="bg-[var(--surface)] border border-[var(--strong-border)] rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">{t("Privacy & Visibility")}</h2>
          <p className="text-[13px] text-white/50">{t("Control who can view your XP, streak, and progression milestones.")}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: 'public', label: 'Public (Recommended)', desc: 'Fully visible on the global leaderboard and public profile searches.' },
            { value: 'friends_only', label: 'Friends Only', desc: 'Hidden from leaderboards. Only added friends can see your stats.' },
            { value: 'private', label: 'Private', desc: 'Your stats and progression are completely hidden from everyone.' }
          ].map(opt => (
            <label 
              key={opt.value} 
              className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all duration-300 ${
                privacySetting === opt.value 
                  ? 'border-white/50 bg-white/[0.08] shadow-md' 
                  : 'border-white/10 hover:border-white/25 bg-black/40'
              }`}
            >
              <input 
                type="radio" 
                name="privacy" 
                value={opt.value} 
                checked={privacySetting === opt.value} 
                onChange={(e) => handlePrivacyChange(e.target.value)} 
                className="hidden" 
              />
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold ${privacySetting === opt.value ? 'text-white' : 'text-white/70'}`}>
                    {t(opt.label)}
                  </span>
                  {privacySetting === opt.value && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                  )}
                </div>
                <p className="text-xs text-white/50 leading-relaxed font-normal">{t(opt.desc)}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
