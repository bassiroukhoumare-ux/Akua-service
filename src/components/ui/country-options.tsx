import { DELIVERY_COUNTRIES } from "@/config/site";
import { OTHER_COUNTRY_NAMES } from "@/data/countries";
import { Flag } from "./flag";
import type { SelectOption } from "./search-select";

/** Pays livrés (avec drapeau), en tête de liste. */
export const deliveryCountryOptions = (group?: string): SelectOption[] =>
  DELIVERY_COUNTRIES.map((c) => ({ value: c.name, label: c.name, icon: <Flag code={c.code} />, group }));

/**
 * Liste complète : pays livrés puis tous les autres pays, et éventuellement
 * une option « pays non listé » qui ouvre un champ libre.
 */
export function allCountryOptions(otherValue?: string): SelectOption[] {
  const opts: SelectOption[] = [
    ...deliveryCountryOptions("Togo et sous-région"),
    ...OTHER_COUNTRY_NAMES.map((n) => ({ value: n, label: n, group: "Autres pays" })),
  ];
  if (otherValue) opts.push({ value: otherValue, label: "Autre pays (à saisir)", display: "Autre pays", group: "Pays non listé" });
  return opts;
}
