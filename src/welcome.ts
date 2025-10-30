import { getAccessTokenFromStorage } from './common/access-token';
import { AUTHORIZATION_URL } from './common/constants';
import { ALL_HOST_PERMISSION } from './common/host-permission';
import { getSettings, updateSettings } from './common/settings';
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
const bookmarksSettingsSelect = $(
  '#bookmarks-collection-id',
) as HTMLSelectElement;
const removalSettingsSelect = $('#removal-collection-id') as HTMLSelectElement;
const settingsCloseButton = $('#close');

function resetSections() {
  [tabsPermissionSection, raindropPermissionSection, settingsSection].forEach(
    (section) => {
      section.inert = true;
    },
  );
  [bookmarksSettingsSelect, removalSettingsSelect].forEach((element) => {
    element.disabled = true;
  });
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

  const settings = await getSettings();
  settingsSection.inert = false;
  await updateCollectionIds(
    bookmarksSettingsSelect,
    removalSettingsSelect,
    settings,
  );
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

[bookmarksSettingsSelect, removalSettingsSelect].forEach((element) => {
  element.addEventListener('change', async () => {
    const collectionIdForBookmarks = parseInt(
      bookmarksSettingsSelect.value,
      10,
    );
    const collectionIdForRemoval = parseInt(removalSettingsSelect.value, 10);
    await updateSettings({
      collectionIdForBookmarks,
      collectionIdForRemoval,
    });
  });
});

settingsCloseButton.addEventListener('click', () => {
  window.close();
});

initializeI18n();
void chooseStep();
