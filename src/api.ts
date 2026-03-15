import axios from 'axios';

const BASE_URL = 'https://anointedthedeveloper-downloaderinoapi.hf.space';

export const api = {
  search: (query: string, page: number = 1) =>
    axios.get(`${BASE_URL}/search?q=${encodeURIComponent(query)}&page=${page}`),
  
  getDetail: (detailPath: string) =>
    axios.get(`${BASE_URL}/detail?detailPath=${encodeURIComponent(detailPath)}`),
  
  getLinks: (subjectId: string, detailPath: string, se: number = 1, ep: number = 1) =>
    axios.get(`${BASE_URL}/links?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&ep=${ep}`),
  
  getSeasonLinks: (subjectId: string, detailPath: string, se: number = 1) =>
    axios.get(`${BASE_URL}/links/season?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}`),
  
  getStreamUrl: (subjectId: string, detailPath: string, se: number = 1, ep: number = 1, resolution?: string, lang?: string) => {
    let url = `${BASE_URL}/stream?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&ep=${ep}`;
    if (resolution) url += `&resolution=${resolution}`;
    if (lang) url += `&lang=${lang}`;
    return url;
  },

  getSeasonStreamUrl: (subjectId: string, detailPath: string, se: number = 1, resolution?: string, lang?: string, format: string = 'folder', epFrom?: number, epTo?: number) => {
    let url = `${BASE_URL}/stream/season?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&format=${format}`;
    if (resolution) url += `&resolution=${resolution}`;
    if (lang) url += `&lang=${lang}`;
    if (epFrom != null) url += `&epFrom=${epFrom}`;
    if (epTo != null) url += `&epTo=${epTo}`;
    return url;
  },

  getSubtitleUrl: (subjectId: string, detailPath: string, se: number = 1, ep: number = 1, lang: string = 'en') => {
    return `${BASE_URL}/stream?subjectId=${subjectId}&detailPath=${encodeURIComponent(detailPath)}&se=${se}&ep=${ep}&type=caption&lang=${lang}`;
  }
};