import { apiGetCollections } from '../background/api';
import { getCollectionIdForRemoval } from '../common/settings';
import { $, $$ } from './helper';

const settingsSelector = $('#remove-collection-id') as HTMLSelectElement;

export async function updateCollectionIds() {
  const collectionsResponse = await apiGetCollections();
  $$('#remove-collection-id option:not(:first-child)').forEach((option) => {
    option.remove();
  });
  for (const { _id, title } of collectionsResponse.items) {
    const option = document.createElement('option');
    option.value = _id.toFixed(0);
    option.textContent = title;
    settingsSelector.appendChild(option);
  }

  const collectionIdForRemoval = await getCollectionIdForRemoval();
  settingsSelector.value = collectionIdForRemoval?.toFixed(0) ?? '0';
  settingsSelector.disabled = false;
}
