import { Helmet } from "react-helmet-async";
import { seoConfig, type SEOPage } from "./seoConfig";

type JsonLdValue = Record<string, unknown>;

const SITE_NAME = "UniTix";
const SITE_URL = "https://unitix.ng";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;
const DEFAULT_LOGO = `${SITE_URL}/logo.png`;

type SEOProps = {
  page: SEOPage;

  // Optional overrides
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
  robots?: string;
  keywords?: string;
  jsonLd?: JsonLdValue | JsonLdValue[];
};

export default function SEO({
  page,
  title,
  description,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  robots = "index, follow",
  keywords,
  jsonLd,
}: SEOProps) {
  const seo = seoConfig[page];

  const pageTitle = title ?? seo.title;
  const pageDescription = description ?? seo.description;
  const pageUrl = url ?? seo.canonical;
  const pageKeywords = keywords ?? seo.keywords;
  const jsonLdItems: JsonLdValue[] = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: DEFAULT_LOGO,
      sameAs: [
        "https://x.com/unitix.ng",
        "https://instagram.com/unitix.ng",
        "https://wa.me/2348120604186",
        "https://tiktok.com/@unitix.ng",
      ],
    } as JsonLdValue,
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/events?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      } as JsonLdValue,
    } as JsonLdValue,
  ];

  if (jsonLd) {
    jsonLdItems.push(...(Array.isArray(jsonLd) ? jsonLd : [jsonLd]));
  }

  return (
    <Helmet htmlAttributes={{ lang: "en" }}>
      {/* Primary SEO */}
      <title>{pageTitle}</title>

      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />

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
      <meta property="og:image:alt" content={pageTitle} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={pageTitle} />

      {jsonLdItems.map((item, index) => (
        <script
          key={`jsonld-${index}`}
          type="application/ld+json"
        >
          {JSON.stringify(item)}
        </script>
      ))}
    </Helmet>
  );
}