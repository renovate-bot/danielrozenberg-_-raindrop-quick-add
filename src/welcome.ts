import { getAccessTokenFromStorage } from './common/access-token';
import { AUTHORIZATION_URL } from './common/constants';
import { ALL_HOST_PERMISSION } from './common/host-permission';
import { setCollectionIdForRemoval } from './common/settings';
import { $ } from './document/helper';
import { initializeI18n } from './document/i18n';
import { updateCollectionIds } from './document/settings';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const tabsPermissionSection = $('#tabs-permission-section');
const grantTabsPermissionButton = $('#grant-tabs-permission');
const raindropPermissionSection = $('#raindrop-permission-section');
const grantRaindropPermissionButton = $('#grant-raindrop-permission');
const settingsSection = $('#settings-section');
const settingsSelector = $('#remove-collection-id') as HTMLSelectElement;
const settingsCloseButton = $('#close');

function resetSections() {
  [tabsPermissionSection, raindropPermissionSection, settingsSection].forEach(
    (section) => {
      section.inert = true;
    },
  );
  settingsSelector.disabled = true;
}

async function chooseStep() {
  resetSections();
  if (!(await browser.permissions.contains(ALL_HOST_PERMISSION))) {
    tabsPermissionSection.inert = false;
    return;
  }

  if (!(await getAccessTokenFromStorage())) {
    raindropPermissionSection.inert = false;
    return;
  }

  settingsSection.inert = false;
  await updateCollectionIds();
}

[browser.permissions.onRemoved, browser.permissions.onAdded].forEach(
  (onEvent) => {
    onEvent.addListener(async () => {
      await chooseStep();
    });
  },
);

browser.storage.sync.onChanged.addListener(async (changes) => {
  if ('accessToken' in changes) {
    await chooseStep();
  }
});

grantTabsPermissionButton.addEventListener('click', async () => {
  await browser.permissions.request(ALL_HOST_PERMISSION);
  await chooseStep();
});

grantRaindropPermissionButton.addEventListener('click', () => {
  window.open(
    AUTHORIZATION_URL,
    'raindrop-login-window',
    'popup,width=600,height=600',
  );
});

settingsSelector.addEventListener('change', async () => {
  const collectionId = parseInt(settingsSelector.value, 10);
  await setCollectionIdForRemoval(collectionId);
});

settingsCloseButton.addEventListener('click', () => {
  window.close();
});

initializeI18n();
void chooseStep();
