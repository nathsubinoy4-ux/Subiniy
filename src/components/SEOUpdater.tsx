import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useSiteSettings } from '../hooks/useSiteSettings';

interface SEOData {
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogImage: string;
  faviconUrl: string;
}

const DEFAULT_SEO: SEOData = {
  siteTitle: 'findejob.com - Earn Rewards',
  metaDescription: 'Earn money for every task you complete online. Simple, fast, and secure.',
  ogTitle: 'findejob.com | Earn with Every Task',
  ogImage: '',
  faviconUrl: '/vite.svg'
};

export function SEOUpdater() {
  const { settings } = useSiteSettings();

  const title = settings.siteTitle || DEFAULT_SEO.siteTitle;
  const description = settings.metaDescription || settings.siteDescription || DEFAULT_SEO.metaDescription;
  const ogTitle = settings.ogTitle || title;
  const ogImage = settings.ogImage || settings.ogImageUrl || '';
  const favicon = settings.faviconUrl || '/vite.svg';

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Favicon */}
      <link rel="icon" href={favicon} />
      <link rel="shortcut icon" href={favicon} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={description} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
}
