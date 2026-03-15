const KEY = 'dl_analytics';

export interface AnalyticsData {
  totalVisits: number;
  uniqueDays: string[];
  totalSearches: number;
  totalDownloads: number;
  downloadsByQuality: Record<string, number>;
  downloadsByType: Record<string, number>; // movie | series | season | range
  topSearches: Record<string, number>;
  deviceTypes: Record<string, number>; // mobile | tablet | desktop
  firstVisit: string;
  lastVisit: string;
  dailyVisits: Record<string, number>; // date -> count
  dailyDownloads: Record<string, number>;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDevice(): string {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
}

function load(): AnalyticsData {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    totalVisits: 0,
    uniqueDays: [],
    totalSearches: 0,
    totalDownloads: 0,
    downloadsByQuality: {},
    downloadsByType: {},
    topSearches: {},
    deviceTypes: {},
    firstVisit: today(),
    lastVisit: today(),
    dailyVisits: {},
    dailyDownloads: {},
  };
}

function save(data: AnalyticsData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function trackVisit() {
  const data = load();
  const t = today();
  data.totalVisits += 1;
  data.lastVisit = t;
  if (!data.uniqueDays.includes(t)) data.uniqueDays.push(t);
  data.dailyVisits[t] = (data.dailyVisits[t] ?? 0) + 1;
  data.deviceTypes[getDevice()] = (data.deviceTypes[getDevice()] ?? 0) + 1;
  save(data);
}

export function trackSearch(query: string) {
  const data = load();
  data.totalSearches += 1;
  const q = query.toLowerCase().trim();
  data.topSearches[q] = (data.topSearches[q] ?? 0) + 1;
  save(data);
}

export function trackDownload(quality: string, type: 'movie' | 'series' | 'season' | 'range') {
  const data = load();
  const t = today();
  data.totalDownloads += 1;
  data.downloadsByQuality[quality] = (data.downloadsByQuality[quality] ?? 0) + 1;
  data.downloadsByType[type] = (data.downloadsByType[type] ?? 0) + 1;
  data.dailyDownloads[t] = (data.dailyDownloads[t] ?? 0) + 1;
  save(data);
}

export function getAnalytics(): AnalyticsData {
  return load();
}
