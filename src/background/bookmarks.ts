import { PageState } from '../common/page-state';
import { getSettings } from '../common/settings';
import { apiAddBookmark, apiDeleteBookmark, apiUpdateBookmark } from './api';
import { setPageAction } from './page-actions';

export async function addBookmark(
  tabId: number,
  url: string,
  title: string | undefined,
): Promise<void> {
  console.log('Adding bookmark for URL', url, 'for tab', tabId);

  await setPageAction(tabId, { state: PageState.Pending });
  const { collectionIdForBookmarks } = await getSettings();

  const response = await apiAddBookmark(url, title, collectionIdForBookmarks);
  if (!response.result) {
    console.error('Failed to add bookmark:', response);
    await setPageAction(tabId, { state: PageState.Error });
    return;
  }
  const bookmarkId = response.item._id;

  console.log(`Bookmark added with ID: ${bookmarkId.toFixed(0)}`);
  return setPageAction(tabId, {
    state: PageState.RemoveBookmark,
    url,
    bookmarkId,
  });
}

export async function removeBookmark(
  tabId: number,
  url: string,
  bookmarkId: number,
  title: string | undefined,
): Promise<void> {
  console.log('Removing bookmark with ID', bookmarkId, 'for tab', tabId);

  await setPageAction(tabId, {
    state: PageState.Pending,
  });

  const { collectionIdForRemoval } = await getSettings();
  const response = collectionIdForRemoval
    ? await apiUpdateBookmark(bookmarkId, collectionIdForRemoval)
    : await apiDeleteBookmark(bookmarkId);
  if (!response.result) {
    console.error('Failed to remove bookmark:', response);
    await setPageAction(tabId, { state: PageState.Error });
    return;
  }

  console.log(`Bookmark removed with ID: ${bookmarkId.toFixed(0)}`);
  return setPageAction(tabId, { state: PageState.AddBookmark, url, title });
}
