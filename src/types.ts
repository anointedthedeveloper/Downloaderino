export interface MovieItem {
  cover: {
    url: string;
  };
  genre: string;
  trailer?: string;
  detailPath: string;
  title: string;
}

export interface Season {
  id?: string;
  number?: number;
  season_number?: number;
  se?: number;
  episodes_count?: number;
  episode_count?: number;
  episodes?: number;
}

export interface MovieDetail {
  title: string;
  description: string;
  subject_id: string;
  cover: string;
  release_date: string;
  country: string;
  genre: string;
  imdb_rating: string;
  trailer_url: string;
  backdrop: string;
  dubs: string[];
  seasons: Season[];
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