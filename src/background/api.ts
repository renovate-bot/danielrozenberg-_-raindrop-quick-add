import { getAccessTokenFromStorage } from '../common/access-token';

const ACCESS_TOKEN_URL = 'https://raindrop.io/oauth/access_token';
const SEARCH_URL_TEMPLATE =
  'https://api.raindrop.io/rest/v1/raindrops/{collectionId}?search={search}';
const BOOKMARK_URL = 'https://api.raindrop.io/rest/v1/raindrop';
const MUTATE_BOOKMARK_URL_TEMPLATE =
  'https://api.raindrop.io/rest/v1/raindrop/{bookmarkId}';
const COLLECTIONS_URL = 'https://api.raindrop.io/rest/v1/collections';

const UNAUTHORIZED_REQUEST_HEADERS = {
  'Content-Type': 'application/json',
};

interface NewAccessTokenRequest {
  grant_type: 'authorization_code';
  code: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
}

interface RefreshAccessTokenRequest {
  grant_type: 'refresh_token';
  client_id: string;
  client_secret: string;
  refresh_token: string;
}

interface AccessTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer';
}

interface SearchResponse {
  collectionId: number;
  count: number;
  items: { _id: number }[];
  result: boolean;
}

interface AddBookmarkRequest {
  link: string;
}

interface AddBookmarkResponse {
  item: {
    _id: number;
  };
  result: boolean;
}

interface DeleteBookmarkResponse {
  result: boolean;
}

interface UpdateBookmarkRequest {
  collection: {
    $id: number;
  };
}

interface UpdateBookmarkResponse {
  result: boolean;
}

interface CollectionsResponse {
  items: {
    _id: number;
    title: string;
  }[];
  result: boolean;
}

interface ErrorResponse {
  errorMessage: string;
  result: boolean;
  status: number;
}

type Request =
  | NewAccessTokenRequest
  | RefreshAccessTokenRequest
  | AddBookmarkRequest
  | UpdateBookmarkRequest;
type Response =
  | AccessTokenResponse
  | SearchResponse
  | AddBookmarkResponse
  | DeleteBookmarkResponse
  | UpdateBookmarkResponse
  | CollectionsResponse
  | ErrorResponse;

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function apiAccessToken(
  request: NewAccessTokenRequest | RefreshAccessTokenRequest,
): Promise<AccessTokenResponse> {
  return requestImpl(
    'POST',
    ACCESS_TOKEN_URL,
    request,
    UNAUTHORIZED_REQUEST_HEADERS,
  );
}

export async function apiSearch(
  collectionId: number,
  search: string,
): Promise<SearchResponse> {
  const url = SEARCH_URL_TEMPLATE.replace(
    '{collectionId}',
    collectionId.toFixed(0),
  ).replace('{search}', encodeURIComponent(search));
  return authenticatedRequestImpl('GET', url, undefined);
}

export async function apiAddBookmark(
  url: string,
): Promise<AddBookmarkResponse> {
  return authenticatedRequestImpl('POST', BOOKMARK_URL, { link: url });
}

export async function apiDeleteBookmark(
  bookmarkId: number,
): Promise<DeleteBookmarkResponse> {
  const url = MUTATE_BOOKMARK_URL_TEMPLATE.replace(
    '{bookmarkId}',
    bookmarkId.toFixed(0),
  );
  return authenticatedRequestImpl('DELETE', url, undefined);
}

export async function apiUpdateBookmark(
  bookmarkId: number,
  collectionId: number,
): Promise<UpdateBookmarkResponse> {
  const url = MUTATE_BOOKMARK_URL_TEMPLATE.replace(
    '{bookmarkId}',
    bookmarkId.toFixed(0),
  );
  return authenticatedRequestImpl('PUT', url, {
    collection: {
      $id: collectionId,
    },
  });
}

export async function apiGetCollections(): Promise<CollectionsResponse> {
  return authenticatedRequestImpl('GET', COLLECTIONS_URL, undefined);
}

export async function authenticatedRequestImpl<R extends Response>(
  method: HttpMethod,
  url: string,
  request: Request | undefined,
): Promise<R> {
  const accessToken = await getAccessTokenFromStorage();
  if (!accessToken) {
    throw new Error(
      'Attempted to send an authorized request without a valid access token',
    );
  }
  return requestImpl(method, url, request, {
    ...UNAUTHORIZED_REQUEST_HEADERS,
    Authorization: `Bearer ${accessToken.token}`,
  });
}

async function requestImpl<R extends Response>(
  method: HttpMethod,
  url: string,
  request: Request | undefined,
  headers: Record<string, string>,
): Promise<R> {
  const response = await fetch(url, {
    body: request ? JSON.stringify(request) : undefined,
    headers,
    method,
  });
  if (!response.ok) {
    throw new Error(
      `Failed to make unauthenticated request: ${response.statusText}`,
    );
  }

  const json = (await response.json()) as R;
  if ('errorMessage' in json) {
    throw new Error(
      `Error response from server: ${json.errorMessage} (status: ${json.status.toFixed(0)})`,
    );
  }
  return json;
}
