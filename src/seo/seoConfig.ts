// src/seo/seoConfig.ts

export const seoConfig = {
  home: {
    title: "UniTix – Discover Campus Events & Buy Tickets Online",
    description:
      "Discover campus events across Nigeria, buy tickets instantly, and create unforgettable experiences with UniTix.",
    ogTitle: "UniTix – Discover Campus Events & Buy Tickets Online",
    ogDescription:
      "Discover campus events across Nigeria, buy tickets instantly, and create unforgettable experiences with UniTix.",
    canonical: "https://unitix.ng/",
    keywords:
      "UniTix, campus events, event tickets, buy tickets, student events, Nigeria events",
  },

  events: {
    title: "Browse Campus Events | UniTix",
    description:
      "Explore concerts, parties, sports, conferences, workshops and campus events happening near you. Buy tickets securely with UniTix.",
    ogTitle: "Browse Campus Events | UniTix",
    ogDescription:
      "Explore concerts, parties, sports, conferences, workshops and campus events happening near you.",
    canonical: "https://unitix.ng/events",
    keywords:
      "campus events, student events, events in Nigeria, event tickets, concerts",
  },

  pricing: {
    title: "Pricing for Event Organizers | UniTix",
    description:
      "Affordable pricing for event organizers. Sell tickets online with transparent fees and powerful event management tools.",
    ogTitle: "Pricing for Event Organizers | UniTix",
    ogDescription:
      "Affordable pricing for event organizers. Sell tickets online with transparent fees.",
    canonical: "https://unitix.ng/pricing",
    keywords:
      "event pricing, sell tickets online, event organizer platform, ticketing fees",
  },

  about: {
    title: "About UniTix | Nigeria's Campus Event Platform",
    description:
      "Learn about UniTix and our mission to simplify campus event discovery and ticketing for students and organizers across Nigeria.",
    ogTitle: "About UniTix | Nigeria's Campus Event Platform",
    ogDescription:
      "Learn about UniTix and our mission to simplify campus event discovery and ticketing.",
    canonical: "https://unitix.ng/about-us",
    keywords:
      "about Unitix, campus event platform, Nigerian startup, event ticketing",
  },

  contact: {
    title: "Contact UniTix Support",
    description:
      "Need help with your account, tickets, or event? Contact the UniTix support team and we'll be happy to assist.",
    ogTitle: "Contact UniTix Support",
    ogDescription:
      "Need help? Contact the UniTix support team for assistance.",
    canonical: "https://unitix.ng/contact-us",
    keywords:
      "contact Unitix, support, customer service, help",
  },

  auth: {
    title: "Login or Create Your UniTix Account",
    description:
      "Sign in to your UniTix account or create a new account to buy tickets, manage events and access your dashboard.",
    ogTitle: "Login or Create Your UniTix Account",
    ogDescription:
      "Sign in or create your UniTix account.",
    canonical: "https://unitix.ng/auth",
    keywords:
      "login, sign up, register, Unitix account",
  },

  privacy: {
    title: "Privacy Policy | UniTix",
    description:
      "Read how UniTix collects, stores, uses and protects your personal information and privacy.",
    ogTitle: "Privacy Policy | UniTix",
    ogDescription:
      "Learn how UniTix protects your personal information.",
    canonical: "https://unitix.ng/privacy-policy",
    keywords:
      "privacy policy, data protection, Unitix privacy",
  },

  terms: {
    title: "Terms of Service | UniTix",
    description:
      "Review the terms and conditions governing the use of the UniTix platform and services.",
    ogTitle: "Terms of Service | UniTix",
    ogDescription:
      "Read the UniTix terms and conditions.",
    canonical: "https://unitix.ng/terms-of-service",
    keywords:
      "terms of service, user agreement, Unitix terms",
  },

  refund: {
    title: "Refund Policy | UniTix",
    description:
      "Learn about UniTix's refund policy, cancellations and ticket refund eligibility.",
    ogTitle: "Refund Policy | UniTix",
    ogDescription:
      "Learn about cancellations and ticket refunds on UniTix.",
    canonical: "https://unitix.ng/refund-policy",
    keywords:
      "refund policy, ticket refund, cancellations, Unitix refunds",
  },
} as const;

export type SEOPage = keyof typeof seoConfig;