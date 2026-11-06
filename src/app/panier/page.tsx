import type { Metadata } from "next";
import { CheckoutView } from "@/components/cart/checkout-view";

export const metadata: Metadata = { title: "Mon panier", robots: { index: false } };

export default function CartPage() {
  return <CheckoutView />;
}
