import type { Metadata } from "next";
import { HomeEditor } from "@/components/admin/home/home-editor";

export const metadata: Metadata = { title: "Accueil et bannières" };

export default function HomeAdminPage() {
  return (
    <>
      <HomeEditor />
    </>
  );
}
