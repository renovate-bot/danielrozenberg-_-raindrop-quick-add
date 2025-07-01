import type { PageState } from './page-state';

interface AccessToken {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

interface AbstractPageStateInfo {
  state: PageState;
}

interface BasicPageStateInfo extends AbstractPageStateInfo {
  state: PageState.NotAuthorized | PageState.Pending | PageState.Error;
}

interface UrlPageStateInfo extends AbstractPageStateInfo {
  state: PageState.AddBookmark;
  url: string;
  title: string | undefined;
}

interface BookmarkPageStateInfo extends AbstractPageStateInfo {
  state: PageState.RemoveBookmark;
  url: string;
  bookmarkId: number;
}

type PageStateInfo =
  | BasicPageStateInfo
  | UrlPageStateInfo
  | BookmarkPageStateInfo;
