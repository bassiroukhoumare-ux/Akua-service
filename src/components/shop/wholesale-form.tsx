"use client";

import { useState } from "react";
import { WhatsAppIcon } from "@/components/ui/whatsapp-icon";
import { DELIVERY_COUNTRIES } from "@/config/site";
import { buildWholesaleLink } from "@/lib/whatsapp";

const OTHER = "Autre";

export function WholesaleForm() {
  const [f, setF] = useState({ name: "", country: "Togo", otherCountry: "", phone: "", products: "", message: "" });
  const isOther = f.country === OTHER;
  const field = "h-12 w-full rounded-2xl border border-akua-gray-200 bg-akua-white px-4 text-[14.5px] outline-none transition-colors focus:border-akua-blue";
  const up = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const { otherCountry, ...req } = f;
        window.open(buildWholesaleLink({ ...req, country: isOther ? otherCountry.trim() : f.country }), "_blank", "noopener");
      }}
      className="grid gap-4 rounded-[28px] border border-akua-gray-200 bg-akua-white p-6 shadow-card md:grid-cols-2 md:p-8"
    >
      <p className="font-display text-[22px] font-semibold md:col-span-2">Demander un devis</p>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Nom ou entreprise</span>
        <input required value={f.name} onChange={up("name")} className={field} autoComplete="organization" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-[13px] font-medium">Pays</span>
        <select value={f.country} onChange={up("country")} className={field}>
          {DELIVERY_COUNTRIES.map((c) => (
            <option key={c.code}>{c.name}</option>
          ))}
          <option value={OTHER}>Autre pays</option>
        </select>
      </label>
      {isOther && (
        <label className="block md:col-span-2">
          <span className="mb-1.5 block text-[13px] font-medium">Votre pays</span>
          <input required autoFocus value={f.otherCountry} onChange={up("otherCountry")} className={field} placeholder="Ex. Sénégal, Nigeria, Guinée…" autoComplete="country-name" />
        </label>
      )}
      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-[13px] font-medium">Téléphone</span>
        <input required type="tel" value={f.phone} onChange={up("phone")} className={field} placeholder="+228 …" autoComplete="tel" />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-[13px] font-medium">Produits et quantités</span>
        <textarea required value={f.products} onChange={up("products")} rows={4} className={`${field} h-auto py-3`} placeholder={"Ex. 20 manettes PS4 sans fil\n10 manettes Xbox 360 filaires"} />
      </label>
      <label className="block md:col-span-2">
        <span className="mb-1.5 block text-[13px] font-medium">Message (facultatif)</span>
        <textarea value={f.message} onChange={up("message")} rows={3} className={`${field} h-auto py-3`} />
      </label>
      <button type="submit" className="btn-shine flex h-[54px] items-center justify-center gap-2.5 rounded-full bg-akua-whatsapp text-[15.5px] font-semibold text-akua-white md:col-span-2">
        <WhatsAppIcon size={20} /> Envoyer ma demande sur WhatsApp
      </button>
    </form>
  );
}
