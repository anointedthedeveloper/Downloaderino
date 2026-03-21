export interface MovieItem {
  cover: {
    url: string;
  };
  genre: string;
  trailer?: string;
  detailPath: string;
  title: string;
  duration?: number;
  releaseDate?: string;
  subjectType?: number;
  season?: number;
  subjectId?: string;
  imdbRatingValue?: string;
  imdbRatingCount?: number;
}

export interface Season {
  id?: string;
  number?: number;
  season_number?: number;
  se?: number;
  episodes_count?: number;
  episode_count?: number;
  episodes?: number;
  max_ep?: number;
  resolutions?: number[];
}

export interface MovieDetail {
  title: string;
  description: string;
  subject_id: string;
  subject_type?: number;
  cover: string;
  release_date: string;
  country: string;
  genre: string;
  imdb_rating: string;
  imdb_votes?: number;
  trailer_url: string;
  backdrop: string;
  dubs: string[];
  seasons: Season[];
  duration?: number;
}

export interface DownloadLink {
  resolution: string;
  format: string;
  size_mb: string;
  url: string;
}

export interface Caption {
  lang: string;
  lang_name: string;
  size_kb: string;
  url: string;
}

export interface LinksResponse {
  downloads: DownloadLink[];
  captions: Caption[];
}

export interface Pager {
  current: number;
  pages: number;
  total: number;
}

export interface SearchResponse {
  items: MovieItem[];
  pager: Pager;
}

export interface AltSourceItem {
  title: string;
  url: string;
  cover?: string;
  source: 'altsource';
}

export interface AltSourceDownload {
  label: string;
  url: string;
}

export interface AltSourceDetail {
  title: string;
  cover: string;
  description: string;
  url: string;
  source: 'altsource';
  downloads: AltSourceDownload[];
}

export interface SearchAllResponse {
  primary: MovieItem[];
  altsource: AltSourceItem[];
  errors: Record<string, string>;
}