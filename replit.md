# Downloaderino

A modern movie/series downloader frontend built with React, Vite, TypeScript, and Tailwind CSS v4.

## Architecture

- **Frontend only** — pure React SPA (no backend server)
- **API**: Calls an external HuggingFace-hosted API at `https://anointedthedeveloper-downloaderinoapi.hf.space`
- **Routing**: React Router DOM v7

## Project Structure

```
src/
  api.ts          - Axios API client to external backend
  App.tsx         - Root component with router setup
  main.tsx        - Entry point
  style.css       - Global styles (Tailwind v4 + theme vars)
  types.ts        - TypeScript types
  components/     - Reusable UI components (Navbar, Footer, MovieCard, etc.)
  pages/          - Page-level components (HomePage)
public/           - Static assets (favicon.svg, etc.)
```

## Tech Stack

- React 19, React Router DOM 7
- Vite 6 with @vitejs/plugin-react-swc
- Tailwind CSS v4 (@tailwindcss/vite plugin)
- Framer Motion for animations
- Axios for HTTP requests
- Lucide React icons
- TypeScript 5.9

## Dev Server

- Runs on port 5000 via `npm run dev`
- Vite configured with `host: '0.0.0.0'` and `allowedHosts: true` for Replit proxy compatibility

## Deployment

Configured as a static site deployment:
- Build: `npm run build`
- Public dir: `dist`
