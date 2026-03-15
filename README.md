# Downloaderino

A modern movie & series download manager built with React. Search titles, browse details, and download episodes or full seasons at your preferred quality — all from a clean, animated UI.

## Features

- **Search** movies and TV series from the catalogue
- **Movie detail view** with poster, IMDb rating, genres, description, and trailer
- **Download Center** — fetch available download links per episode at multiple resolutions
- **In-App downloads** with real-time progress tracking and background mode
- **Direct downloads** via browser native handler
- **Full Season ZIP** — download an entire season at a chosen quality
- **Favorites / Library** — save titles locally
- **Trailer modal** — watch trailers in-app

## Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite | Build tool & dev server |
| Tailwind CSS v4 | Styling |
| Framer Motion | Animations |
| Axios | API requests |
| Lucide React | Icons |
| React Router v7 | Routing |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
npm install
npm run dev
```

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

## Project Structure

```
src/
├── components/
│   ├── MovieDetailView.tsx   # Detail page with download center
│   ├── MovieCard.tsx         # Search result card
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── Layout.tsx
│   ├── Pagination.tsx
│   ├── StatCard.tsx
│   ├── Spinner.tsx
│   ├── NotFound.tsx
│   └── TrailerModal.tsx
├── pages/
│   └── HomePage.tsx
├── api.ts                    # API client
├── types.ts                  # TypeScript interfaces
├── App.tsx
├── main.tsx
└── style.css
```
