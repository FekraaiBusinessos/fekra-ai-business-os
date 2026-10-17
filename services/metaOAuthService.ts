import { getAuthHeaders } from './googleAuthService';

export interface MetaAuthUrlResponse {
  url: string;
  redirectUri: string;
  appId: string;
}

export interface MetaAuthSuccessPayload {
  type: 'META_AUTH_SUCCESS';
  tenantId?: string;
  pageName?: string;
  pageId?: string;
  wabaId?: string;
}

/**
 * Returns the exact Callback URL required in Meta Developers Dashboard
 */
export function getMetaCallbackUri(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/api/social/meta/callback`;
  }
  return 'https://ais-pre-5uoqryvbcb4654hphpzgw4-63139733496.europe-west2.run.app/api/social/meta/callback';
}

/**
 * Requests the backend to construct the official Meta OAuth Authorization URL
 */
export async function fetchMetaAuthUrl(customRedirectUri?: string, customAppId?: string): Promise<MetaAuthUrlResponse> {
  const headers = await getAuthHeaders();
  const redirectUri = customRedirectUri || getMetaCallbackUri();
  let url = `/api/social/meta/auth-url?redirect_uri=${encodeURIComponent(redirectUri)}`;
  if (customAppId && customAppId.trim()) {
    url += `&app_id=${encodeURIComponent(customAppId.trim())}`;
  }
  const res = await fetch(url, {
    headers,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'فشل توليد رابط مصادقة Meta OAuth');
  }
  return res.json();
}

/**
 * Opens the official Meta OAuth Authorization Dialog directly in a popup window
 */
export function openMetaOAuthPopup(url: string): Window | null {
  const width = 650;
  const height = 750;
  const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
  const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);

  const popup = window.open(
    url,
    'MetaBusinessOAuth',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,status=no,toolbar=no,menubar=no`
  );

  if (!popup || popup.closed || typeof popup.closed === 'undefined') {
    throw new Error('تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة (Popups) والمحاولة مجدداً.');
  }

  return popup;
}

/**
 * Subscribes to the postMessage callback from the Meta OAuth popup window
 */
export function subscribeToMetaAuthCallback(
  popup: Window | null,
  onSuccess: (data: MetaAuthSuccessPayload) => void,
  onError: (errMsg: string) => void
): () => void {
  let timer: any = null;

  const handleMessage = (event: MessageEvent) => {
    // Validate message type
    if (event.data?.type === 'META_AUTH_SUCCESS') {
      if (timer) clearInterval(timer);
      try {
        if (popup && !popup.closed) popup.close();
      } catch (e) {
        // popup close cross-origin safe
      }
      window.removeEventListener('message', handleMessage);
      onSuccess(event.data);
    } else if (event.data?.type === 'META_AUTH_ERROR') {
      if (timer) clearInterval(timer);
      try {
        if (popup && !popup.closed) popup.close();
      } catch (e) {}
      window.removeEventListener('message', handleMessage);
      onError(event.data.error || 'فشلت عملية المصادقة من جهة ميتا');
    }
  };

  window.addEventListener('message', handleMessage);

  // Check if popup was closed by user before finishing
  if (popup) {
    timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        window.removeEventListener('message', handleMessage);
      }
    }, 1000);
  }

  return () => {
    if (timer) clearInterval(timer);
    window.removeEventListener('message', handleMessage);
  };
}
