import type { PageState } from './page-state';

interface AccessToken {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

interface AbstractPageStateInfo {
  state: PageState;
}

interface BasePageStateInfo extends AbstractPageStateInfo {
  state: PageState.NotAuthorized | PageState.Pending | PageState.Error;
}

interface UrlPageStateInfo extends AbstractPageStateInfo {
  state: PageState.AddBookmark;
  url: string;
}

interface BookmarkPageStateInfo extends AbstractPageStateInfo {
  state: PageState.RemoveBookmark;
  url: string;
  bookmarkId: number;
}

type PageStateInfo =
  | BasePageStateInfo
  | UrlPageStateInfo
  | BookmarkPageStateInfo;
