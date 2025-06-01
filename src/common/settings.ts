import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

export async function getCollectionIdForRemoval(): Promise<number | undefined> {
  const { collectionIdForRemoval } = await browser.storage.sync.get(
    'collectionIdForRemoval',
  );
  return typeof collectionIdForRemoval === 'number'
    ? collectionIdForRemoval
    : 0;
}

export async function setCollectionIdForRemoval(
  collectionIdForRemoval: number,
): Promise<void> {
  await browser.storage.sync.set({
    collectionIdForRemoval,
  });
}
