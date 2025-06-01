import { isAuthenticated } from '../common/access-token';
import { PageState, setPageState } from '../common/page-state';
import { PageStateInfo } from '../common/storage';
import { apiSearch } from './api';

import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

const ICON_PATHS = new Map([
  [PageState.Pending, 'icons/button-pending.svg'],
  [PageState.AddBookmark, 'icons/button-add.svg'],
  [PageState.RemoveBookmark, 'icons/button-remove.svg'],
  [PageState.NotAuthorized, 'icons/button-error.svg'],
  [PageState.Error, 'icons/button-error.svg'],
]);
const TITLE_MESSAGE_IDS = new Map<PageState, string>([
  [PageState.NotAuthorized, 'pageActionNotAuthorized'],
  [PageState.Pending, 'pageActionPending'],
  [PageState.AddBookmark, 'pageActionAddBookmark'],
  [PageState.RemoveBookmark, 'pageActionRemoveBookmark'],
  [PageState.Error, 'pageActionApiError'],
]);

export async function setPageActionNotAuthorized(tabId: number): Promise<void> {
  await setPageAction(tabId, { state: PageState.NotAuthorized });
}

export async function checkIfBookmarked(
  tabId: number,
  url: string,
): Promise<void> {
  if (!(await isAuthenticated())) {
    console.warn(
      'No access token found while checking whether a page is bookmarked',
    );
    return setPageActionNotAuthorized(tabId);
  }

  // Set the page action to the pending state.
  await setPageAction(tabId, { state: PageState.Pending });

  // Check if the page is bookmarked by URL.
  try {
    const response = await apiSearch(-1, url);
    if (response.count) {
      await setPageAction(tabId, {
        url,
        state: PageState.RemoveBookmark,
        bookmarkId: response.items[0]._id,
      });
    } else {
      await setPageAction(tabId, { url, state: PageState.AddBookmark });
    }
  } catch (error) {
    console.error('Error while searching for Raindrop bookmark', error);
    await setPageAction(tabId, { state: PageState.Error });
  }
}

export async function setPageAction(
  tabId: number,
  pageStateInfo: PageStateInfo,
): Promise<void> {
  await setPageState(tabId, pageStateInfo);

  const iconPath =
    ICON_PATHS.get(pageStateInfo.state) ?? 'icons/button-error.svg';
  const titleMessageId =
    TITLE_MESSAGE_IDS.get(pageStateInfo.state) ?? 'pageActionApiError';

  await browser.pageAction.setIcon({
    path: iconPath,
    tabId,
  });
  browser.pageAction.setTitle({
    title: browser.i18n.getMessage(titleMessageId),
    tabId,
  });
}
