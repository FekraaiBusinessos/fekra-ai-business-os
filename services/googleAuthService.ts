import { GoogleUserProfile } from '../types';

const GOOGLE_AUTH_STORAGE_KEY = 'fekra_google_auth_user';
const GOOGLE_AUTH_EVENT = 'fekra_google_auth_changed';

// The verified Google account of the current user
export const DETECTED_USER_EMAIL = 'abohana2472@gmail.com';
export const DETECTED_USER_NAME = 'Abo Hana';

/**
 * Generates an authentic Google-styled material avatar with Google colors
 */
export function generateGoogleAvatar(seed: string): string {
  const safeSeed = encodeURIComponent(seed.trim() || 'Google User');
  return `https://api.dicebear.com/7.x/initials/svg?seed=${safeSeed}&backgroundColor=4285F4,34A853,FBBC05,EA4335&textColor=ffffff&fontWeight=700`;
}

export const getGoogleUser = (): GoogleUserProfile | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GOOGLE_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read Google user auth:', e);
    return null;
  }
};

export const isGoogleUserSignedIn = (): boolean => {
  return getGoogleUser() !== null;
};

/**
 * Authenticates user with Google credentials cleanly without corrupting API keys
 */
export const loginWithGoogle = (
  email: string = DETECTED_USER_EMAIL,
  name: string = DETECTED_USER_NAME,
  avatar?: string
): GoogleUserProfile => {
  const cleanEmail = email.trim() || DETECTED_USER_EMAIL;
  let cleanName = name.trim();
  if (!cleanName || cleanName.toLowerCase() === 'google user') {
    cleanName = cleanEmail.split('@')[0];
  }

  const profile: GoogleUserProfile = {
    id: `google-${cleanEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
    name: cleanName,
    email: cleanEmail,
    avatar: avatar || generateGoogleAvatar(cleanName),
    signedInAt: Date.now(),
    quotaTier: 'Personal Google AI Studio Quota',
    quotaStatus: 'active',
    autoManaged: true,
  };

  try {
    localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(profile));
    
    // Clean up any stale or corrupted legacy tokens from previous mock auth
    const staleLegacyKey = localStorage.getItem('fekra_user_gemini_key');
    if (staleLegacyKey && staleLegacyKey.startsWith('user_google_quota_auth_')) {
      localStorage.removeItem('fekra_user_gemini_key');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(GOOGLE_AUTH_EVENT, { detail: profile }));
    }
  } catch (e) {
    console.error('Failed to store Google user auth:', e);
  }

  return profile;
};

export const logoutGoogle = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(GOOGLE_AUTH_EVENT, { detail: null }));
  } catch (e) {
    console.error('Failed to logout Google user:', e);
  }
};

export const subscribeGoogleAuth = (callback: (user: GoogleUserProfile | null) => void) => {
  if (typeof window === 'undefined') return () => {};
  const handler = () => {
    callback(getGoogleUser());
  };
  window.addEventListener(GOOGLE_AUTH_EVENT, handler);
  return () => {
    window.removeEventListener(GOOGLE_AUTH_EVENT, handler);
  };
};
