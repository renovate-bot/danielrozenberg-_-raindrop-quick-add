import { PageStateInfo } from './storage';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

export enum PageState {
  NotAuthorized,
  Pending,
  AddBookmark,
  RemoveBookmark,
  Error,
}

export async function setPageState(
  tabId: number,
  pageStateInfo: PageStateInfo,
): Promise<void> {
  await browser.storage.session.set({ [tabId]: pageStateInfo });
}

export async function getPageState(
  tabId: number,
): Promise<PageStateInfo | undefined> {
  const tabIdString = tabId.toFixed(0);
  const result = await browser.storage.session.get(tabIdString);
  return result[tabIdString] as PageStateInfo | undefined;
}

export async function clearPageState(tabId: number): Promise<void> {
  await browser.storage.session.remove(tabId.toFixed(0));
}
