export interface Track {
  id: string;
  title: string;
  imageUrl: string;
  embedUrl: string;
}

export interface SearchResponse {
  tracks: Track[];
  nextCursor?: string;
  prevCursor?: string;
}

export interface SoundApiClient {
  searchTracks(query: string, cursor?: string, signal?: AbortSignal): Promise<SearchResponse>;
}

export interface MixcloudSearchParams {
  query: string;
  cursor?: string;
}

export interface MixcloudPictureSet {
  readonly medium?: string;
  readonly large?: string;
  readonly extra_large?: string;
}

export interface MixcloudCloudcast {
  readonly key: string;
  readonly name: string;
  readonly url: string;
  readonly pictures?: MixcloudPictureSet;
}

export interface MixcloudPaging {
  readonly next?: string;
  readonly previous?: string;
}

export interface MixcloudSearchResponse {
  readonly data: MixcloudCloudcast[];
  readonly paging?: MixcloudPaging;
}
