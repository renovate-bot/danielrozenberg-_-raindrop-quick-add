import { getAccessTokenFromStorage } from './common/access-token';
import { ALL_HOST_PERMISSION } from './common/host-permission';
import { setCollectionIdForRemoval } from './common/settings';
import { $ } from './document/helper';
import { initializeI18n } from './document/i18n';
import { updateCollectionIds } from './document/settings';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const errorPanel = $('#error-panel');
const openSetupButton = $('#open-setup');
const settingsPanel = $('#settings-panel');
const settingsSelector = $('#remove-collection-id') as HTMLSelectElement;

[browser.permissions.onRemoved, browser.permissions.onAdded].forEach(
  (onEvent) => {
    onEvent.addListener(async () => {
      await init();
    });
  },
);

browser.storage.sync.onChanged.addListener(async (changes) => {
  if ('accessToken' in changes) {
    await init();
  }
});

async function init() {
  if (
    !(await browser.permissions.contains(ALL_HOST_PERMISSION)) ||
    !(await getAccessTokenFromStorage())
  ) {
    errorPanel.classList.remove('hidden');
    settingsPanel.classList.add('hidden');
    return;
  }

  errorPanel.classList.add('hidden');
  settingsPanel.classList.remove('hidden');
  return updateCollectionIds();
}

openSetupButton.addEventListener('click', async () => {
  await browser.tabs.create({
    active: true,
    url: browser.runtime.getURL('welcome.html'),
  });
});

settingsSelector.addEventListener('change', async () => {
  const collectionId = parseInt(settingsSelector.value, 10);
  await setCollectionIdForRemoval(collectionId);
});

initializeI18n();
void init();
