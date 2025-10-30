import { apiGetCollections } from '../background/api';
import { Settings } from '../common/storage';

export async function updateCollectionIds(
  bookmarksSettingsSelect: HTMLSelectElement,
  removalSettingsSelect: HTMLSelectElement,
  { collectionIdForBookmarks, collectionIdForRemoval }: Settings,
) {
  const collectionsResponse = await apiGetCollections();
  [bookmarksSettingsSelect, removalSettingsSelect].forEach((element) => {
    element.querySelectorAll('option:not(:first-child)').forEach((option) => {
      option.remove();
    });
    for (const { _id, title } of collectionsResponse.items) {
      const option = document.createElement('option');
      option.value = _id.toFixed(0);
      option.textContent = title;
      element.appendChild(option);
    }

    element.disabled = false;
  });

  bookmarksSettingsSelect.value = collectionIdForBookmarks.toFixed(0);
  removalSettingsSelect.value = collectionIdForRemoval.toFixed(0);
}
