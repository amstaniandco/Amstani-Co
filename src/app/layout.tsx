import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProviders } from "../components/global/AppProviders";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-montserrat",
});

const SITE_NAME = "Amstani & Co";
const SITE_DESCRIPTION =
  "Amstani & Co is a multi-brand textile marketplace offering high-quality fabrics and textile products from trusted brands at competitive prices across America.";
const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://www.amstaniandco.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Amstani & Co — Multi-Brand Textile Marketplace",
    template: "%s | Amstani & Co",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Amstani & Co — Multi-Brand Textile Marketplace",
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
  twitter: {
    card: "summary",
    title: "Amstani & Co — Multi-Brand Textile Marketplace",
    description: SITE_DESCRIPTION,
    images: ["/icon.png"],
  },
};

// JSON-LD structured data. Google uses the WebSite/Organization `name` to
// choose the site name shown as the blue heading in search results (instead of
// falling back to the bare domain "amstaniandco.com").
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: "Amstani and Co",
      description: SITE_DESCRIPTION,
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: "Amstani and Co",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/icon.png`,
        width: 512,
        height: 512,
      },
      description: SITE_DESCRIPTION,
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${montserrat.className} min-h-full bg-[var(--background)] text-[var(--foreground)]`}
        suppressHydrationWarning
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
