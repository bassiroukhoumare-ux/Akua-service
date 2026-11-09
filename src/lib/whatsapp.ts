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
