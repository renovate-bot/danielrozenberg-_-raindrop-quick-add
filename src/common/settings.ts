import type { Browser } from 'webextension-polyfill';
import type { Settings } from './storage';

declare const browser: Browser;

const defaultSettings: Settings = {
  collectionIdForBookmarks: -1,
  collectionIdForRemoval: 0,
};

export async function getSettings(): Promise<Settings> {
  const settings = await browser.storage.sync.get(
    defaultSettings as unknown as Record<string, unknown>,
  );

  return settings as unknown as Settings;
}

export async function updateSettings(settings: Settings): Promise<void> {
  await browser.storage.sync.set(
    settings as unknown as Record<string, unknown>,
  );

  // The session storage now caches bookmarks data that might be outdated due to
  // the settings change. Clear it to avoid inconsistencies.
  await browser.storage.session.clear();
}
