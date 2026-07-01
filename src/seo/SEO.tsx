// src/seo/SEO.tsx

import { Helmet } from "react-helmet-async";
import { seoConfig, type SEOPage } from "./seoConfig";

type SEOProps = {
  page: SEOPage;

  // Optional overrides
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  robots?: string;
};

const SITE_NAME = "UniTix";
const DEFAULT_IMAGE = "https://unitix.ng/og-image.png";

export default function SEO({
  page,
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  robots = "index, follow",
}: SEOProps) {
  const seo = seoConfig[page];

  const pageTitle = title ?? seo.title;
  const pageDescription = description ?? seo.description;
  const pageUrl = url ?? seo.canonical;

  return (
    <Helmet>
      {/* Primary SEO */}
      <title>{pageTitle}</title>

      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={seo.keywords} />

      {/* Canonical */}
      <link rel="canonical" href={pageUrl} />

      {/* Robots */}
      <meta name="robots" content={robots} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
}