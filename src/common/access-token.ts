import { AccessToken } from './storage';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

export async function getAccessTokenFromStorage(): Promise<AccessToken | null> {
  const { accessToken } = await browser.storage.sync.get('accessToken');
  return (accessToken ?? null) as AccessToken | null;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await getAccessTokenFromStorage()) != null;
}
