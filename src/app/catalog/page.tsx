import type { Metadata } from "next";
import CatalogShowcase from "./CatalogShowcase";

export const metadata: Metadata = {
  title: "Catalog — Amstani & Co",
  description:
    "Explore the brands, categories, and products available from Amstani & Co.",
};

export default function CatalogPage() {
  return <CatalogShowcase />;
}
