/**
 * Verifies that the application was authorized by hijacking the nonexistent
 * page https://firefox.danielrozenberg.com/raindrop-quick-add/.
 */
import type { Browser } from 'webextension-polyfill';

declare const browser: Browser;

void (async () => {
  const match = /\bcode=([\w-]+)$/.exec(window.location.search);
  if (!match?.[1]) {
    location.replace(browser.runtime.getURL('authentication-error.html'));
    const payload: setPageActionNotAuthorizedPayload = {
      action: 'set-page-action-not-authorized',
    };
    return browser.runtime.sendMessage(payload);
  }
  const payload: StartAuthenticationPayload = {
    action: 'start-authentication',
    code: match[1],
  };

  return browser.runtime.sendMessage(payload);
})();
