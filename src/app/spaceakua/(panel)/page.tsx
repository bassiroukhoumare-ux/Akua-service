import type { Metadata } from "next";
import { Dashboard } from "@/components/admin/dashboard";

export const metadata: Metadata = { title: "Tableau de bord" };

export default function AdminHome() {
  return <Dashboard />;
}
