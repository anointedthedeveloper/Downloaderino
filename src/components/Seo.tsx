import React from 'react';
import { Helmet } from 'react-helmet-async';

const SITE = 'https://downloaderino.vercel.app';
const SITE_NAME = 'Downloaderino';
const DEFAULT_DESC = 'Download movies and TV series for free in HD. Fast servers, multiple resolutions, and in-app progress tracking.';
const DEFAULT_IMG = `${SITE}/favicon.svg`;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'video.movie' | 'video.tv_show';
  jsonLd?: object | object[];
}

export const Seo: React.FC<SeoProps> = ({
  title,
  description = DEFAULT_DESC,
  image = DEFAULT_IMG,
  url,
  type = 'website',
  jsonLd,
}) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} — Free Movie & Series Downloads`;
  const canonical = url ? `${SITE}${url}` : SITE;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="download movie, free movie download, HD movie download, series download, movie download site" />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonical} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      {jsonLd && (
        Array.isArray(jsonLd)
          ? jsonLd.map((ld, i) => (
              <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
            ))
          : <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
};

/** Build JSON-LD for a movie/series detail page */
export function buildMovieJsonLd(movie: {
  title: string;
  description: string;
  cover: string;
  release_date: string;
  genre?: string;
  imdb_rating?: string;
  subject_type?: number;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': movie.subject_type === 2 ? 'TVSeries' : 'Movie',
    name: movie.title,
    description: movie.description,
    image: movie.cover,
    datePublished: movie.release_date,
    genre: movie.genre?.split(',').map(g => g.trim()),
    ...(movie.imdb_rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: movie.imdb_rating,
        bestRating: '10',
        ratingCount: '1000',
      },
    }),
    potentialAction: {
      '@type': 'DownloadAction',
      target: typeof window !== 'undefined' ? window.location.href : '',
    },
  };
}

/** Build breadcrumb JSON-LD */
export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://downloaderino.vercel.app${item.url}`,
    })),
  };
}
