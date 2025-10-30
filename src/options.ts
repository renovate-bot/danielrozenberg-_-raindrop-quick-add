import { getAccessTokenFromStorage } from './common/access-token';
import { ALL_HOST_PERMISSION } from './common/host-permission';
import { getSettings, updateSettings } from './common/settings';
import { $ } from './document/helper';
import { initializeI18n } from './document/i18n';
import { updateCollectionIds } from './document/settings';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const errorPanel = $('#error-panel');
const openSetupButton = $('#open-setup');
const settingsPanel = $('#settings-panel');
const bookmarksSettingsSelect = $(
  '#bookmarks-collection-id',
) as HTMLSelectElement;
const removalSettingsSelect = $('#removal-collection-id') as HTMLSelectElement;
const buttonLocationAddressBarDescription = $(
  '#button-location-address-bar-description',
);
const buttonLocationToolbarDescription = $(
  '#button-location-toolbar-description',
);
const addressBarIcon = $('#address-bar-icon');
const toolbarIcon = $('#toolbar-icon');

[browser.permissions.onRemoved, browser.permissions.onAdded].forEach(
  (onEvent) => {
    onEvent.addListener(async () => {
      await initByPermissionsAndStorage();
    });
  },
);

browser.storage.sync.onChanged.addListener(async (changes) => {
  if ('accessToken' in changes) {
    await initByPermissionsAndStorage();
  }
});

browser.action.onUserSettingsChanged.addListener(({ isOnToolbar }) => {
  initByUserSettings(isOnToolbar ?? false);
});

async function init() {
  const { isOnToolbar } = await browser.action.getUserSettings();
  initByUserSettings(isOnToolbar ?? false);

  await initByPermissionsAndStorage();
}

async function initByPermissionsAndStorage() {
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

  const settings = await getSettings();
  return updateCollectionIds(
    bookmarksSettingsSelect,
    removalSettingsSelect,
    settings,
  );
}

function initByUserSettings(isOnToolbar: boolean) {
  if (isOnToolbar) {
    buttonLocationToolbarDescription.classList.remove('hidden');
    buttonLocationAddressBarDescription.classList.add('hidden');
    addressBarIcon.classList.remove('active');
    toolbarIcon.classList.add('active');
  } else {
    buttonLocationToolbarDescription.classList.add('hidden');
    buttonLocationAddressBarDescription.classList.remove('hidden');
    addressBarIcon.classList.add('active');
    toolbarIcon.classList.remove('active');
  }
}

openSetupButton.addEventListener('click', async () => {
  await browser.tabs.create({
    active: true,
    url: browser.runtime.getURL('welcome.html'),
  });
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

initializeI18n();
void init();
