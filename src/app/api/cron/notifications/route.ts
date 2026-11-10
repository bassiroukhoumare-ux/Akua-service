import { NextResponse } from "next/server";
import { loadCatalog } from "@/lib/catalog";
import { db } from "@/lib/db";
import { formatFCFA } from "@/lib/format";
import { clip, pushToOwner } from "@/lib/push";

// Tâche planifiée (chaque matin à 7 h, heure de Lomé) :
// - paniers enregistrés depuis plus de 24 h sans commande → rappel de relance ;
// - le lundi : produits ajoutés en favori pendant la semaine → à mettre en avant.
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const url = new URL(req.url);
  const force = url.searchParams.get("forcer"); // « favoris » pour tester le résumé hors lundi
  const sql = db();
  const out: Record<string, unknown> = {};

  // paniers abandonnés depuis plus de 24 h, jamais signalés
  const carts = (await sql`select id, data from saved_carts where status = 'pending' and saved_at < now() - interval '24 hours' and (data->>'pushedAt') is null order by saved_at`) as { id: string; data: { name: string; subtotal: number } }[];
  if (carts.length) {
    const names = carts.slice(0, 3).map((c) => `${c.data.name} (${formatFCFA(c.data.subtotal)})`).join(", ");
    out.paniers = await pushToOwner("carts", {
      title: `${carts.length} panier${carts.length > 1 ? "s" : ""} à relancer`,
      body: clip(`Enregistré${carts.length > 1 ? "s" : ""} depuis plus de 24 h sans commande : ${names}${carts.length > 3 ? "…" : ""}. Relancez sur WhatsApp.`, 180),
      url: "/spaceakua/paniers",
      tag: "paniers",
    });
    for (const c of carts) await sql`update saved_carts set data = jsonb_set(data, '{pushedAt}', to_jsonb(now()::text)) where id = ${c.id}`;
  }

  // résumé des favoris de la semaine (le lundi)
  if (new Date().getUTCDay() === 1 || force === "favoris") {
    const { products } = await loadCatalog();
    // seuls les produits encore au catalogue comptent
    const favs = ((await sql`select product_id, count(*)::int as n from favorites where created_at > now() - interval '7 days' group by product_id order by n desc`) as { product_id: string; n: number }[]).filter((f) => products.some((p) => p.id === f.product_id));
    if (favs.length) {
      const total = favs.reduce((a, f) => a + f.n, 0);
      const top = favs
        .slice(0, 3)
        .map((f) => `${clip(products.find((p) => p.id === f.product_id)!.name, 28)} (${f.n})`)
        .join(", ");
      out.favoris = await pushToOwner("favorites", {
        title: "Les favoris de la semaine",
        body: clip(`${total} ajout${total > 1 ? "s" : ""} en favori : ${top}. Mettez-les en avant pour les vendre plus.`, 180),
        url: "/spaceakua/favoris",
        tag: "favoris-semaine",
      });
    }
  }
  return NextResponse.json({ ok: true, ...out });
}
