import type {
  FetchFunction,
  MixcloudCloudcast,
  MixcloudSearchResponse,
  SearchResponse,
  SoundApiClient,
  Track,
} from './types';

const MIXCLOUD_API_BASE_URL = 'https://api.mixcloud.com';
const SEARCH_PAGE_SIZE = '6';

class MixcloudApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'MixcloudApiError';
  }
}

export function createSoundApiClient(fetchFunction: FetchFunction = fetch): SoundApiClient {
  return {
    async searchTracks(query: string, cursor?: string, signal?: AbortSignal): Promise<SearchResponse> {
      const requestUrl = buildSearchUrl(query, cursor);
      const response = await fetchFunction(requestUrl, { signal });

      if (!response.ok) {
        throw new MixcloudApiError('Mixcloud search request failed.', response.status);
      }

      const payload: unknown = await response.json();

      if (!isMixcloudSearchResponse(payload)) {
        throw new MixcloudApiError('Mixcloud search response was not in the expected format.');
      }

      return {
        tracks: payload.data.map(mapCloudcastToTrack),
        nextCursor: payload.paging?.next,
        prevCursor: payload.paging?.previous,
      };
    },
  };
}

function buildSearchUrl(query: string, cursor?: string): string {
  if (cursor) {
    return cursor;
  }

  const searchUrl = new URL('/search/', MIXCLOUD_API_BASE_URL);
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('type', 'cloudcast');
  searchUrl.searchParams.set('limit', SEARCH_PAGE_SIZE);

  return searchUrl.toString();
}

function mapCloudcastToTrack(cloudcast: MixcloudCloudcast): Track {
  return {
    id: cloudcast.key,
    title: cloudcast.name,
    imageUrl: cloudcast.pictures?.extra_large ?? cloudcast.pictures?.large ?? cloudcast.pictures?.medium ?? '',
    embedUrl: buildEmbedUrl(cloudcast.url),
  };
}

function buildEmbedUrl(cloudcastUrl: string): string {
  const embedUrl = new URL('https://www.mixcloud.com/widget/iframe/');
  embedUrl.searchParams.set('hide_cover', '1');
  embedUrl.searchParams.set('feed', cloudcastUrl);

  return embedUrl.toString();
}

function isMixcloudSearchResponse(value: unknown): value is MixcloudSearchResponse {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    return false;
  }

  const hasValidData = value.data.every(isMixcloudCloudcast);
  const hasValidPaging =
    value.paging === undefined ||
    (isRecord(value.paging) &&
      optionalString(value.paging.next) &&
      optionalString(value.paging.previous));

  return hasValidData && hasValidPaging;
}

function isMixcloudCloudcast(value: unknown): value is MixcloudCloudcast {
  if (!isRecord(value)) {
    return false;
  }

  const hasRequiredFields =
    typeof value.key === 'string' && typeof value.name === 'string' && typeof value.url === 'string';
  const hasValidPictures =
    value.pictures === undefined ||
    (isRecord(value.pictures) &&
      optionalString(value.pictures.medium) &&
      optionalString(value.pictures.large) &&
      optionalString(value.pictures.extra_large));

  return hasRequiredFields && hasValidPictures;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): boolean {
  return value === undefined || typeof value === 'string';
}
