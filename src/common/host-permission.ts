import type { Permissions } from 'webextension-polyfill';

export const ALL_HOST_PERMISSION: Permissions.Permissions = {
  origins: ['*://*/*'],
};
