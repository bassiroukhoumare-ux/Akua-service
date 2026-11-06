import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";
import { getCategories, getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cats, products] = await Promise.all([getCategories(), getProducts()]);
  const pages = ["", "/boutique", "/packs", "/vente-en-gros", "/livraison", "/contact"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 })),
    ...cats.map((c) => ({ url: `${SITE_URL}/boutique/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...products.map((p) => ({ url: `${SITE_URL}/produit/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
