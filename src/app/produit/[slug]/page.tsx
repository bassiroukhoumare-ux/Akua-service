import { Check, PackageCheck, PackageOpen, ShieldCheck, Store, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCarousel } from "@/components/home/product-carousel";
import { StockText } from "@/components/product/product-card";
import { ProductGallery, PurchaseBox } from "@/components/product/product-purchase";
import { ProductRating } from "@/components/product/rating-stars";
import { ReviewsSection } from "@/components/product/reviews-section";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { products as allProducts } from "@/data/products";
import { getCategoryById, getProductBySlug, getRelatedProducts, PLATFORM_LABELS } from "@/lib/catalog";
import { discountPercent, formatFCFA } from "@/lib/format";
import { getCategoryIcon } from "@/lib/icons";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allProducts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProductBySlug((await params).slug);
  if (!p) return {};
  return { title: p.name, description: `${p.shortDescription} ${formatFCFA(p.price)}. Livraison possible dans 7 pays.`, openGraph: { images: p.images[0] ? [p.images[0]] : [] } };
}

const STOCK_LABEL = { en_stock: "En stock", stock_faible: "Stock limité", rupture: "Rupture", sur_commande: "Sur commande" } as const;

export default async function ProductPage({ params }: Props) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const [category, related] = await Promise.all([getCategoryById(product.categoryId), getRelatedProducts(product)]);
  const pct = discountPercent(product.price, product.compareAtPrice);
  const CatIcon = getCategoryIcon(category?.icon);
  const isNew = product.condition === "neuf";
  const compat = product.compatibility ?? product.platforms.map((p) => PLATFORM_LABELS[p]);
  const more = [...related, ...allProducts.filter((p) => p.isFeatured && p.id !== product.id)]
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .slice(0, 8);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((i) => `${SITE_URL}${i}`),
    brand: { "@type": "Organization", name: SITE_NAME },
    itemCondition: isNew ? "https://schema.org/NewCondition" : "https://schema.org/UsedCondition",
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "XOF",
      availability: product.stockStatus === "rupture" ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: `${SITE_URL}/produit/${product.slug}`,
    },
  };

  const specs = [
    { k: "Catégorie", v: category?.name ?? "" },
    { k: "État", v: isNew ? "Neuf" : "Occasion" },
    { k: "Compatibilité", v: compat.join(", ") },
    { k: "Disponibilité", v: STOCK_LABEL[product.stockStatus] },
  ];

  const infos = [
    { icon: Truck, t: "Livraison ou retrait en boutique", d: "Livraison possible au Togo, Bénin, Ghana, Burkina Faso, Côte d'Ivoire, Niger et Mali. Retrait gratuit en boutique du lundi au samedi, de 10h à 20h. Frais et délais confirmés sur WhatsApp." },
    { icon: ShieldCheck, t: "Garantie", d: "Tous nos produits sont testés et garantis. Conditions détaillées : [À COMPLÉTER]." },
    { icon: Store, t: "Vente en gros", d: "Revendeur ou salle de jeux ? Demandez un devis : tarifs dégressifs selon les quantités, livraison multi-pays." },
  ];

  return (
    <>
      <div className="container-akua pt-5 pb-40 md:pt-8 lg:pb-0">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-2 text-[13px] text-akua-gray-500">
          <Link href="/" className="hover:text-akua-ink">
            Accueil
          </Link>
          <span aria-hidden>/</span>
          <Link href={`/boutique/${category?.slug ?? ""}`} className="hover:text-akua-ink">
            {category?.name}
          </Link>
          <span aria-hidden>/</span>
          <span className="font-medium text-akua-ink">{product.name}</span>
        </nav>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <ProductGallery product={product} />

          <div className="min-w-0 lg:pt-2">
            <Link href={`/boutique/${category?.slug ?? ""}`} className="inline-flex h-8 items-center gap-1.5 rounded-full border border-akua-gray-200 px-3 text-[12.5px] font-medium hover:border-akua-ink">
              <CatIcon aria-hidden className="size-3.5 text-akua-blue" /> {category?.name}
            </Link>
            <h1 className="mt-4 text-[30px] leading-[1.08] font-extrabold tracking-[-0.03em] md:text-[42px]">{product.name}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
              <a href="#avis" className="hover:underline">
                <ProductRating productId={product.id} size="size-4" className="text-[13.5px]" />
              </a>
              <StockText product={product} className="text-[13.5px]" />
            </div>

            <div className="mt-6 flex flex-wrap items-end gap-3">
              <span className={pct ? "text-[40px] leading-none font-extrabold tracking-[-0.03em] text-akua-blue md:text-[48px]" : "text-[40px] leading-none font-extrabold tracking-[-0.03em] md:text-[48px]"}>{formatFCFA(product.price)}</span>
              {product.compareAtPrice && (
                <>
                  <span className="pb-1 text-[17px] text-akua-gray-500 line-through">{formatFCFA(product.compareAtPrice)}</span>
                  <span className="mb-1 rounded-full bg-akua-red px-2.5 py-1 text-[12.5px] font-bold text-akua-white">-{pct} %</span>
                </>
              )}
            </div>

            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-akua-gray-500">{product.shortDescription}</p>

            <div className="mt-5 flex flex-wrap gap-1.5">
              {compat.map((x) => (
                <span key={x} className="rounded-full bg-akua-tile px-3 py-1.5 text-[12.5px] font-medium text-akua-ink">
                  {x}
                </span>
              ))}
            </div>

            <PurchaseBox product={product} />

            <div className="mt-6 grid grid-cols-3 divide-x divide-akua-gray-200 border-y border-akua-gray-200 py-4">
              {[
                { icon: ShieldCheck, t: "Garantie" },
                { icon: Truck, t: "Livraison possible" },
                { icon: isNew ? PackageCheck : PackageOpen, t: isNew ? "Produit neuf" : "Occasion" },
              ].map(({ icon: Icon, t }) => (
                <div key={t} className="flex flex-col items-center gap-2 px-2 text-center">
                  <Icon aria-hidden className="size-7 text-akua-ink" strokeWidth={1.4} />
                  <span className="text-[12.5px] font-medium">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Description détaillée */}
        <section aria-labelledby="description" className="mt-14 grid gap-4 md:mt-20 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] border border-akua-gray-200 p-6 md:p-8">
            <h2 id="description" className="text-[22px] font-extrabold tracking-[-0.02em] md:text-[26px]">
              Description du produit
            </h2>
            <p className="mt-4 text-[15.5px] leading-[1.75] text-akua-ink/85">{product.description}</p>
            {product.includes?.length ? (
              <>
                <p className="mt-6 text-[15px] font-bold">Dans la boîte</p>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {product.includes.map((x) => (
                    <li key={x} className="flex items-center gap-2.5 text-[14.5px]">
                      <Check aria-hidden className="size-4 shrink-0 text-akua-blue" strokeWidth={2.25} />
                      {x}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
          <div className="rounded-[28px] bg-akua-page p-6 md:p-8">
            <p className="text-[18px] font-bold">Caractéristiques</p>
            <dl className="mt-4 divide-y divide-akua-gray-200">
              {specs.map((s) => (
                <div key={s.k} className="flex items-start justify-between gap-4 py-3 text-[14.5px]">
                  <dt className="text-akua-gray-500">{s.k}</dt>
                  <dd className="text-right font-semibold">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Infos ouvertes directement */}
        <section aria-label="Informations pratiques" className="mt-4 grid gap-4 md:grid-cols-3">
          {infos.map(({ icon: Icon, t, d }) => (
            <div key={t} className="rounded-[28px] border border-akua-gray-200 p-6">
              <Icon aria-hidden className="size-8 text-akua-ink" strokeWidth={1.4} />
              <p className="mt-4 text-[16.5px] font-bold">{t}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-akua-gray-500">{d}</p>
            </div>
          ))}
        </section>

        <div className="mt-14 md:mt-20">
          <ReviewsSection productId={product.id} productName={product.name} />
        </div>
      </div>
      {more.length > 0 && <ProductCarousel eyebrow="Dans le même esprit" title="Vous aimerez aussi" products={more} autoplay />}
    </>
  );
}
