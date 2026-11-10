import type { Metadata } from "next";
import { OrdersView } from "@/components/admin/clients/orders-view";
import { TeamGate } from "@/components/admin/team-gate";

export const metadata: Metadata = { title: "Commandes" };

export default function OrdersPage() {
  return (
    <TeamGate module="orders">
      <OrdersView />
    </TeamGate>
  );
}
