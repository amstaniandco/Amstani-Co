import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.amstaniandco.com";

// Public, indexable pages. Authenticated / transactional routes are excluded
// here and disallowed in robots.ts.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/home",
    "/categories",
    "/new-arrivals",
    "/sale",
    "/about",
    "/contact",
    "/terms",
    "/privacy",
  ];

  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
