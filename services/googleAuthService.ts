import { GoogleUserProfile } from '../types';
import { auth } from '../src/lib/firebase';

const GOOGLE_AUTH_STORAGE_KEY = 'fekra_google_auth_user';
const GOOGLE_AUTH_EVENT = 'fekra_google_auth_changed';
const AUTH_TOKEN_STORAGE_KEY = 'fekra_auth_token';

// Verified Google OAuth 2.0 Client ID for production project
export const GOOGLE_CLIENT_ID = '541481944358-tqtm5ehl36pnqc8d5dfldns4420pgmlv.apps.googleusercontent.com';

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

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  const user = getGoogleUser();
  if (user?.token) return user.token;
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const isGoogleUserSignedIn = (): boolean => {
  return getGoogleUser() !== null;
};

/**
 * Creates authenticated request headers with Bearer token
 */
export async function getAuthHeaders(extraHeaders: Record<string, string> = {}): Promise<Record<string, string>> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };

  // 1. Try Firebase client token if available
  if (auth?.currentUser) {
    try {
      const fbToken = await auth.currentUser.getIdToken();
      if (fbToken) {
        headers['Authorization'] = `Bearer ${fbToken}`;
        return headers;
      }
    } catch {}
  }

  // 2. Try stored session token from Google Login
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Authenticates user through official Google credential / id_token returned by Google Identity Services
 */
export const loginWithGoogleCredential = async (credentialToken: string): Promise<GoogleUserProfile> => {
  if (!credentialToken) {
    throw new Error('Missing Google credential token from accounts.google.com');
  }

  const res = await fetch('/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      credential: credentialToken,
      idToken: credentialToken,
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'فشل التحقق من هوية Google على الخادم');
  }

  const authData = await res.json();
  const profile: GoogleUserProfile = {
    id: authData.user.uid,
    name: authData.user.displayName || authData.user.email.split('@')[0],
    email: authData.user.email,
    avatar: authData.user.avatarUrl || generateGoogleAvatar(authData.user.displayName || authData.user.email),
    signedInAt: Date.now(),
    quotaTier: 'Personal Google AI Studio Quota',
    quotaStatus: 'active',
    autoManaged: true,
    token: authData.token,
    tenantId: authData.tenantId,
  };

  try {
    localStorage.setItem(GOOGLE_AUTH_STORAGE_KEY, JSON.stringify(profile));
    if (authData.token) {
      localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, authData.token);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(GOOGLE_AUTH_EVENT, { detail: profile }));
    }
  } catch (e) {
    console.error('Failed to store Google user auth:', e);
  }

  return profile;
};

/**
 * Fallback to initiate official popup flow via Google Identity Services
 */
export const loginWithGoogle = async (
  email?: string,
  name?: string,
  avatar?: string
): Promise<GoogleUserProfile> => {
  // If user has firebase current user with token
  if (auth?.currentUser) {
    try {
      const fbToken = await auth.currentUser.getIdToken();
      if (fbToken) {
        return await loginWithGoogleCredential(fbToken);
      }
    } catch {}
  }

  // Attempt client-side GSI prompt if available in window
  if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
    return new Promise((resolve, reject) => {
      (window as any).google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: any) => {
          try {
            if (response.credential) {
              const prof = await loginWithGoogleCredential(response.credential);
              resolve(prof);
            } else {
              reject(new Error('No credential returned from Google'));
            }
          } catch (e) {
            reject(e);
          }
        },
      });
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is suppressed, reject so modal displays standard button
          reject(new Error('Google prompt displayed in modal'));
        }
      });
    });
  }

  throw new Error('Google Identity Services not loaded yet');
};

export const logoutGoogle = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(GOOGLE_AUTH_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.disableAutoSelect();
    }
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
