// Messages WhatsApp pré-remplis. Texte brut uniquement : aucun emoji.

import { SITE_NAME, SITE_URL, WHATSAPP_NUMBER } from "@/config/site";
import { formatFCFA } from "@/lib/format";

export interface WhatsAppLine {
  name: string;
  price: number;
  quantity: number;
}

export interface WhatsAppCustomer {
  country?: string;
  name?: string;
  city?: string;
}

export interface WholesaleRequest {
  name: string;
  country: string;
  phone: string;
  products: string;
  message?: string;
}

export interface CheckoutOrder {
  reference: string;
  lines: WhatsAppLine[];
  subtotal: number;
  promo?: { code: string; discount: number };
  total: number;
  customer: { name: string; phone: string; email?: string };
  mode: "livraison" | "retrait";
  delivery?: { country: string; city: string; address: string; landmark?: string };
  pickup?: { date: string; time: string; deposit?: { label: string; amount: number } };
  note?: string;
}

const siteHost = SITE_URL.replace(/^https?:\/\//, "");

// numéro réglé dans l'admin (Paramètres > WhatsApp), appliqué au chargement du site
let number: string = WHATSAPP_NUMBER;
export function setWhatsAppNumber(display: string) {
  const d = display.replace(/\D/g, "");
  if (d.length >= 8) number = d;
}
export const whatsAppNumber = () => number;

export function waLink(text: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

export function buildOrderMessage(cart: WhatsAppLine[], customer: WhatsAppCustomer = {}): string {
  const total = cart.reduce((sum, l) => sum + l.price * l.quantity, 0);
  return [
    `Bonjour ${SITE_NAME},`,
    "Je souhaite commander :",
    "",
    ...cart.map((l) => `• ${l.quantity} × ${l.name} — ${formatFCFA(l.price * l.quantity)}`),
    "",
    `Total : ${formatFCFA(total)}`,
    `Pays de livraison : ${customer.country || "[à préciser]"}`,
    `Nom : ${customer.name || "[nom]"}`,
    `Ville : ${customer.city || "[ville]"}`,
    "",
    `Commande envoyée depuis ${siteHost}`,
  ].join("\n");
}

export function buildWhatsAppLink(cart: WhatsAppLine[], customer?: WhatsAppCustomer): string {
  return waLink(buildOrderMessage(cart, customer));
}

function formatPickupDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(d);
}

/** Message complet envoyé depuis la page panier / commande. */
export function buildCheckoutMessage(o: CheckoutOrder): string {
  const lines: string[] = [
    `Bonjour ${SITE_NAME},`,
    `Nouvelle commande n° ${o.reference}`,
    "",
    "ARTICLES",
    ...o.lines.map((l) => `• ${l.quantity} × ${l.name} — ${formatFCFA(l.price * l.quantity)}`),
    "",
    `Sous-total : ${formatFCFA(o.subtotal)}`,
  ];
  if (o.promo) lines.push(`Code promo ${o.promo.code} : -${formatFCFA(o.promo.discount)}`);
  lines.push(`Total : ${formatFCFA(o.total)}`, "");

  if (o.mode === "livraison" && o.delivery) {
    lines.push(
      "RÉCEPTION : Livraison",
      `Pays : ${o.delivery.country}`,
      `Ville : ${o.delivery.city}`,
      `Adresse exacte : ${o.delivery.address}`,
      ...(o.delivery.landmark ? [`Point de repère : ${o.delivery.landmark}`] : []),
    );
  } else if (o.pickup) {
    lines.push("RÉCEPTION : Retrait en boutique", `Passage prévu : ${formatPickupDate(o.pickup.date)}, à partir de ${o.pickup.time}`);
    if (o.pickup.deposit) lines.push(`Acompte pour réserver : ${o.pickup.deposit.label} (${formatFCFA(o.pickup.deposit.amount)})`);
  }

  lines.push("", "CLIENT", `Nom : ${o.customer.name}`, `Téléphone : ${o.customer.phone}`);
  if (o.customer.email) lines.push(`E-mail : ${o.customer.email}`);
  if (o.note) lines.push("", "Note :", o.note);
  lines.push(
    "",
    o.pickup?.deposit ? "Merci de m'envoyer le lien de paiement de l'acompte." : "Merci de m'envoyer le lien de paiement.",
    `Commande envoyée depuis ${siteHost}`,
  );
  return lines.join("\n");
}

export function buildWholesaleLink(req: WholesaleRequest): string {
  return waLink(
    [
      "Demande de devis — Vente en gros",
      "",
      `Nom / entreprise : ${req.name}`,
      `Pays : ${req.country}`,
      `Téléphone : ${req.phone}`,
      "",
      "Produits et quantités :",
      req.products,
      ...(req.message ? ["", "Message :", req.message] : []),
      "",
      `Envoyé depuis ${siteHost}`,
    ].join("\n"),
  );
}

export interface ContactRequest {
  firstName: string;
  lastName: string;
  country: string;
  phone: string;
  message: string;
}

/** Message envoyé depuis la fenêtre « Écrire sur WhatsApp » : coordonnées puis demande. */
export function buildContactLink(req: ContactRequest): string {
  return waLink(
    [
      `Bonjour ${SITE_NAME},`,
      "",
      "NOUVELLE DEMANDE",
      `Nom : ${req.firstName} ${req.lastName}`,
      `Pays : ${req.country}`,
      `Téléphone : ${req.phone}`,
      "",
      "MESSAGE",
      req.message,
      "",
      `Envoyé depuis ${siteHost}`,
    ].join("\n"),
  );
}

/* ------------------------------------------------- suivi d'une commande reçue */

export interface FollowUpOrder {
  ref: string;
  customer: { name: string };
  mode: "livraison" | "retrait";
  delivery?: { country: string; city: string; address: string; landmark?: string };
  pickup?: { date: string; time: string; deposit?: number; depositLabel?: string };
  items: { name: string; price: number; quantity: number }[];
  subtotal: number;
  promo?: { code: string; discount: number };
  total: number;
  note?: string;
}

const fPickup = new Intl.DateTimeFormat("fr-FR", { weekday: "long", day: "numeric", month: "long" });

/**
 * Message envoyé au client pour confirmer sa commande : rappel complet (produits, prix, livraison ou
 * retrait) puis demande de confirmation. Texte brut, sans emoji.
 */
export function buildOrderFollowUp(o: FollowUpOrder): string {
  const first = o.customer.name.trim().split(/\s+/)[0] || "";
  const lines: string[] = [];
  lines.push(`Bonjour ${first},`.replace(" ,", ","), "");
  lines.push(`Ici AKUA Service. Nous avons bien reçu votre commande n° ${o.ref} passée sur notre site, et nous vous remercions pour votre confiance.`, "");
  lines.push("Voici le récapitulatif de votre commande :");
  for (const i of o.items) lines.push(`- ${i.quantity} x ${i.name} : ${formatFCFA(i.price * i.quantity)}`);
  if (o.promo) {
    lines.push(`Sous-total : ${formatFCFA(o.subtotal)}`);
    lines.push(`Code promo ${o.promo.code} : -${formatFCFA(o.promo.discount)}`);
  }
  lines.push(`Total : ${formatFCFA(o.total)}`, "");
  if (o.mode === "livraison") {
    const d = o.delivery;
    const place = [d?.address, d?.city, d?.country].filter(Boolean).join(", ");
    lines.push(`Vous avez choisi la livraison${place ? ` à l'adresse suivante : ${place}` : ""}.`);
    if (d?.landmark) lines.push(`Point de repère : ${d.landmark}.`);
  } else {
    const p = o.pickup;
    const day = p?.date ? fPickup.format(new Date(`${p.date}T12:00:00`)) : "";
    lines.push(`Vous avez choisi de récupérer votre commande en boutique${day ? ` le ${day}` : ""}${p?.time ? ` à ${p.time.replace(":", "h")}` : ""}.`);
    if (p?.deposit) lines.push(`${p.depositLabel ? p.depositLabel.charAt(0).toUpperCase() + p.depositLabel.slice(1) : "Acompte"} prévu : ${formatFCFA(p.deposit)}.`);
  }
  if (o.note) lines.push(`Votre précision : « ${o.note} »`);
  lines.push("");
  lines.push("Pouvez-vous nous confirmer que ces informations sont exactes et que vous maintenez votre commande ?");
  lines.push("Dès votre confirmation, nous vous indiquons la suite (paiement et " + (o.mode === "livraison" ? "livraison" : "retrait") + ").", "");
  lines.push("Si vous avez la moindre question, n'hésitez pas à nous l'écrire ici.", "");
  lines.push(`Merci et à très bientôt,`, SITE_NAME);
  return lines.join("\n");
}

/** Lien WhatsApp vers le client avec le message de confirmation pré-rempli. */
export function followUpLink(phone: string, o: FollowUpOrder) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(buildOrderFollowUp(o))}`;
}
