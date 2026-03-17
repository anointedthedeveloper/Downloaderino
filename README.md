# Downloaderino

A modern movie & series download manager built with React. Search titles, browse details, and download episodes or full seasons at your preferred quality — all from a clean, animated UI.

## Features

- **Search** movies and TV series from the catalogue with deduplication by `detailPath`
- **Movie detail view** — poster, IMDb rating, genres, description, trailer
- **Download Center** — per-episode links at multiple resolutions with two download modes per quality
- **In-App downloads** — `fetch` + `ReadableStream` with real-time progress bar, background mode, and cancel
- **Direct downloads** — native browser `<a download>` per quality, no progress panel
- **Full Season ZIP** — download an entire season (In-App or Direct) with quality picker modal
- **Background download mode** — minimise active downloads to a silent background indicator
- **Favorites / Library** — save titles locally via `localStorage`
- **Trailer modal** — watch trailers in-app
- **Grid / List view toggle** — animated transition between layouts
- **Skeleton loaders** — 12 ghost cards while fetching results
- **Visitor counter** — persistent daily counter in Navbar and Footer
- **Admin Analytics** — visit to `/admin-analytics` for internal stats
- **SEO** — dynamic `<title>`, `<meta>`, Open Graph, Twitter cards, JSON-LD structured data, `robots.txt`, `sitemap.xml`
- **Bundle splitting** — vendor chunks for react, framer-motion, lucide-react

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 6 | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Axios | API requests |
| Lucide React | Icons |
| React Router v7 | Routing |
| react-helmet-async | Dynamic SEO meta tags |
| Vercel Analytics | Page view tracking |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

Runs on `http://localhost:5000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## API

All data is fetched from the Downloaderino API hosted on Hugging Face Spaces:

```
https://anointedthedeveloper-downloaderinoapi.hf.space
```

| Endpoint | Description |
|---|---|
| `GET /search?q=&page=` | Search titles |
| `GET /detail?detailPath=` | Get movie/series details |
| `GET /links?subjectId=&detailPath=&se=&ep=` | Get download links for an episode |
| `GET /links/season?subjectId=&detailPath=&se=` | Get season-level links |
| `GET /stream?subjectId=&detailPath=&se=&ep=&resolution=` | Stream / download a single episode |
| `GET /stream/season?subjectId=&detailPath=&se=&resolution=&format=` | Stream / download a full season |

## Download Modes

Each quality option exposes two buttons:

| Mode | Behaviour |
|---|---|
| **In-App** | `fetch` + `ReadableStream` — floating progress panel, cancel button, background mode |
| **Direct** | Native browser `<a download>` — browser handles the file save |

**Background mode** — while an in-app download is active, click the background icon in the progress panel to minimise it. The download continues silently and the panel shows `⬇ Background · X%`.

## SEO

Dynamic SEO is handled via `react-helmet-async` (`src/components/Seo.tsx`):

- **Title format:** `Download {Movie} ({Year}) Full Movie HD | Downloaderino`
- **Search page title:** `Download "{query}" — Search Results | Downloaderino`
- **Meta tags:** description, keywords, canonical URL
- **Open Graph:** `og:title`, `og:description`, `og:image` (movie poster), `og:type` (`video.movie` / `video.tv_show`)
- **Twitter cards:** `summary_large_image`
- **JSON-LD:** `Movie` / `TVSeries` schema + `BreadcrumbList` per detail page
- **`public/robots.txt`:** `Allow: /` + sitemap pointer
- **`public/sitemap.xml`:** static base sitemap

> Without SSR, Googlebot executes JS to read these tags. For guaranteed indexing of every movie page, migrate to Next.js or use `react-snap` for prerendering.

## Project Structure

```
src/
├── components/
│   ├── MovieDetailView.tsx   # Detail page with download center + SEO
│   ├── MovieCard.tsx         # Search result card (grid + list modes)
│   ├── Seo.tsx               # react-helmet-async wrapper + JSON-LD builders
│   ├── Navbar.tsx            # Nav with visitor count pill
│   ├── Footer.tsx            # Footer with visitor count
│   ├── Layout.tsx
│   ├── Pagination.tsx
│   ├── StatCard.tsx
│   ├── Spinner.tsx
│   ├── NotFound.tsx
│   └── TrailerModal.tsx
├── pages/
│   ├── HomePage.tsx          # Search, skeleton loader, grid/list toggle
│   ├── AdminAnalytics.tsx    # Internal analytics dashboard (/admin-analytics)
│   └── StatsPage.tsx
├── api.ts                    # API client
├── analytics.ts              # Visit + search tracking
├── types.ts                  # TypeScript interfaces
├── App.tsx                   # Root — routing, search state, deduplication
├── main.tsx                  # HelmetProvider + Vercel Analytics
└── style.css
public/
├── favicon.svg               # Green circle #22C55E with white bold "D"
├── robots.txt                # Allow: / + sitemap pointer
└── sitemap.xml               # Base static sitemap
```

## Deployment

Configured for static hosting:

- **Vercel** — auto-detected Vite project, zero config
- **Netlify** — `netlify.toml` included, SPA redirects configured (`/* → /index.html`)
- Build output: `dist/`
