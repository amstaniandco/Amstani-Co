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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Amstani & Co",
  description: "Amstani & Co — Shop local stores across America",
  icons: {
    icon: "/assets/amstaniLogo.png",
    shortcut: "/assets/amstaniLogo.png",
    apple: "/assets/amstaniLogo.png",
  },
  openGraph: {
    title: "Amstani & Co",
    description: "Amstani & Co — Shop local stores across America",
    images: ["/assets/amstaniLogo.png"],
  },
  twitter: {
    card: "summary",
    title: "Amstani & Co",
    description: "Amstani & Co — Shop local stores across America",
    images: ["/assets/amstaniLogo.png"],
  },
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
      </head>
      <body className={`${montserrat.className} min-h-full bg-[var(--background)] text-[var(--foreground)]`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
